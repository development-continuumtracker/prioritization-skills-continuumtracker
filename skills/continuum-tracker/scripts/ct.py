#!/usr/bin/env python3
"""Continuum Tracker read-only API helper for the continuum-tracker skill.

Standard-library only (no pip install). Resolves the API key, handles
pagination and 429 back-off, and prints compact human-readable output
(or raw JSON with --json).

Auth: CONTINUUM_API_KEY env var, else CONTINUUM_API_KEY=... in ./.env,
else the command exits asking for it. The key is never printed or stored.

Usage:
  ct.py me
  ct.py projects
  ct.py project   --project PID
  ct.py signals   --project PID [--top N] [--search T] [--category C] [--saved] [--all]
  ct.py feedbacks --project PID [--search T] [--limit N] [--all]
  ct.py feedback  --project PID --id FID
  ct.py signal    --project PID --id SID
  ct.py signal-feedbacks --project PID --id SID [--all]
  ct.py painpoints --project PID (--feedback FID | --signal SID) [--all]
  ct.py signal-market --project PID --id SID

Add --json to any command for the raw API response.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

try:  # ensure non-ASCII (em-dashes, accents, ellipsis) prints cleanly on Windows
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

OFFICIAL_HOST = "app.continuumtracker.com"


def _resolve_base() -> str:
    """Resolve the API base, refusing anywhere the key must not be sent.

    CONTINUUM_API_BASE is an env-var override, so it is an untrusted input: every
    request carries `Authorization: Bearer <key>`. Guard it before the key moves.
    """
    raw = os.environ.get("CONTINUUM_API_BASE", f"https://{OFFICIAL_HOST}/api").strip().rstrip("/")
    parsed = urllib.parse.urlparse(raw)
    host = (parsed.hostname or "").lower()
    is_local = host in ("localhost", "127.0.0.1", "::1")

    if parsed.scheme not in ("http", "https") or not host:
        sys.exit(f"CONTINUUM_API_BASE must be an http(s) URL with a host; got: {raw!r}")
    if parsed.scheme != "https" and not is_local:
        sys.exit(
            "Refusing to send your API key over plain HTTP to a remote host "
            f"({host}). Use https:// in CONTINUUM_API_BASE."
        )
    if host != OFFICIAL_HOST and not is_local:
        print(
            f"warning: CONTINUUM_API_BASE points at {host} - your Continuum Tracker "
            "API key will be sent there, not to the official API.",
            file=sys.stderr,
        )
    return raw


BASE = _resolve_base()
TIMEOUT = 30
MAX_RETRIES = 3


# --------------------------------------------------------------------------- key
def load_key() -> str:
    key = os.environ.get("CONTINUUM_API_KEY", "").strip()
    if key:
        return key
    try:
        with open(".env", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("CONTINUUM_API_KEY="):
                    return line.split("=", 1)[1].strip().strip("\"'")
    except OSError:
        pass
    die(
        "No API key found. Set CONTINUUM_API_KEY in the environment or in a .env "
        "file in this directory. Generate a key in the web app at /settings/access."
    )


def die(msg: str, code: int = 1) -> "None":
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(code)


# -------------------------------------------------------------------------- http
def request(path: str, params: dict | None = None) -> dict:
    url = f"{BASE}{path}"
    if params:
        clean = {k: v for k, v in params.items() if v is not None}
        if clean:
            # doseq=True lets list values repeat the param (e.g. category)
            url += "?" + urllib.parse.urlencode(clean, doseq=True)
    headers = {"Authorization": f"Bearer {KEY}", "Accept": "application/json"}
    for attempt in range(MAX_RETRIES):
        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                return json.loads(resp.read().decode("utf-8") or "{}")
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", "replace")
            if exc.code == 429 and attempt < MAX_RETRIES - 1:
                wait = _retry_after(exc, body)
                print(f"rate limited, retrying in {wait}s...", file=sys.stderr)
                time.sleep(wait)
                continue
            die(_http_error_msg(exc.code, body), code=2)
        except urllib.error.URLError as exc:
            die(f"network error: {exc.reason}", code=3)
    die("exhausted retries", code=2)


def _retry_after(exc: urllib.error.HTTPError, body: str) -> int:
    hdr = exc.headers.get("Retry-After")
    if hdr and hdr.isdigit():
        return int(hdr)
    try:
        return int(json.loads(body).get("error", {}).get("retry_after") or 5)
    except Exception:
        return 5


def _http_error_msg(status: int, body: str) -> str:
    try:
        err = json.loads(body).get("error", {})
        code = err.get("code", "")
        message = err.get("message", body)
        prefix = {401: "unauthorized (check API key)", 403: "forbidden",
                  404: "not found", 422: "validation error"}.get(status, f"HTTP {status}")
        return f"{prefix}: {('[' + code + '] ') if code else ''}{message}".strip()
    except Exception:
        return f"HTTP {status}: {body[:300]}"


def paginate(path: str, params: dict, follow_all: bool) -> list:
    """Return list of items; follow pages when follow_all is set."""
    params = dict(params)
    params.setdefault("page", 1)
    items: list = []
    while True:
        data = request(path, params)
        items.extend(data.get("items", []))
        pg = data.get("pagination", {})
        if not follow_all or params["page"] >= pg.get("total_pages", 1):
            return items
        params["page"] += 1


# ------------------------------------------------------------------------ render
def trunc(text, n: int = 90) -> str:
    if not text:
        return ""
    text = " ".join(str(text).split())
    return text if len(text) <= n else text[: n - 1] + "…"


def out_json(obj) -> None:
    print(json.dumps(obj, indent=2, ensure_ascii=False))


# ----------------------------------------------------------------------- commands
def cmd_me(args) -> None:
    data = request("/v1/me")
    if args.json:
        return out_json(data)
    print(f"{data.get('email', '?')}  (id {data.get('id', '?')})")
    print(f"default org: {data.get('default_organization_id', '-')}")


def cmd_projects(args) -> None:
    items = paginate("/v1/projects", {"limit": 100}, follow_all=True)
    if args.json:
        return out_json(items)
    if not items:
        return print("no projects")
    for p in items:
        star = " *default" if p.get("is_default") else ""
        print(f"- {p.get('name') or '(unnamed)'}  [{p.get('id')}]{star}")
        for field in ("mission", "vision", "north_star"):
            if p.get(field):
                print(f"    {field}: {trunc(p[field], 120)}")


def cmd_project(args) -> None:
    d = request(f"/v1/projects/{args.project}")
    if args.json:
        return out_json(d)
    star = "  *default" if d.get("is_default") else ""
    print(f"{d.get('name') or '(unnamed)'}  [{d.get('id')}]{star}")
    if d.get("url"):
        print(f"url: {d['url']}")
    for field in ("mission", "vision", "north_star", "similar_companies"):
        if d.get(field):
            print(f"\n{field.replace('_', ' ').upper()}:\n{d[field]}")


def cmd_signals(args) -> None:
    params = {
        "limit": args.limit or 100,
        "search": args.search,
        "category": args.category or None,
        "is_saved": "true" if args.saved else None,
    }
    items = paginate(f"/v1/projects/{args.project}/signals", params, follow_all=args.all)
    # rank by evidence (feedback_count desc) — the API only sorts by created_at/name
    items.sort(key=lambda s: s.get("feedback_count", 0), reverse=True)
    if args.top:
        items = items[: args.top]
    if args.json:
        return out_json(items)
    if not items:
        return print("no signals")
    for s in items:
        print(f"[{s.get('feedback_count', 0):>3} fb] {s.get('name') or '(unnamed)'}  "
              f"({s.get('category')})  [{s.get('id')}]")
        if s.get("pain_point"):
            print(f"        pain: {trunc(s['pain_point'])}")
        if s.get("market_opportunity"):
            print(f"        market: {trunc(s['market_opportunity'])}")


def cmd_feedbacks(args) -> None:
    params = {
        "limit": args.limit or 100,
        "search": args.search,
        "sort_by": "created_at",
        "sort_dir": "desc",
    }
    items = paginate(f"/v1/projects/{args.project}/feedbacks", params, follow_all=args.all)
    if args.json:
        return out_json(items)
    if not items:
        return print("no feedbacks")
    for f in items:
        who = f.get("author") or "?"
        print(f"- {f.get('name') or '(untitled)'}  by {who}  [{f.get('id')}]")
        print(f"    {trunc(f.get('feedback_original'))}")


def cmd_feedback(args) -> None:
    data = request(f"/v1/projects/{args.project}/feedbacks/{args.id}",
                   {"include": "painpoint"})
    if args.json:
        return out_json(data)
    print(f"{data.get('name') or '(untitled)'}  [{data.get('id')}]")
    print(f"author: {data.get('author') or '?'} ({data.get('author_type') or '-'})  "
          f"source: {data.get('source')}  status: {data.get('status')}")
    print(f"\n{data.get('feedback_original', '')}\n")
    if data.get("feedback_processed"):
        print(f"processed: {data['feedback_processed']}")
    for pp in data.get("painpoints", []) or []:
        quote = pp.get("painpoint_original") or pp.get("pain_point") or pp.get("name")
        print(f"  - painpoint: {trunc(quote)}")
        if pp.get("painpoint_processed"):
            print(f"      -> {trunc(pp['painpoint_processed'], 200)}")


def cmd_signal(args) -> None:
    data = request(f"/v1/projects/{args.project}/signals/{args.id}")
    if args.json:
        return out_json(data)
    print(f"{data.get('name')}  ({data.get('category')})  "
          f"[{data.get('feedback_count', 0)} feedbacks]")
    for field in ("pain_point", "user_story", "market_opportunity"):
        if data.get(field):
            print(f"  {field}: {trunc(data[field], 140)}")


def cmd_signal_feedbacks(args) -> None:
    params = {"limit": args.limit or 100, "include": "painpoint"}
    items = paginate(f"/v1/projects/{args.project}/signals/{args.id}/feedbacks",
                     params, follow_all=args.all)
    if args.json:
        return out_json(items)
    if not items:
        return print("no feedbacks for this signal")
    for f in items:
        print(f"- {f.get('name') or '(untitled)'}  [{f.get('id')}]")
        print(f"    {trunc(f.get('feedback_original'))}")


def cmd_painpoints(args) -> None:
    if args.feedback:
        path = f"/v1/projects/{args.project}/feedbacks/{args.feedback}/painpoints"
    elif args.signal:
        path = f"/v1/projects/{args.project}/signals/{args.signal}/painpoints"
    else:
        die("painpoints needs --feedback FID or --signal SID")
    items = paginate(path, {"limit": args.limit or 50}, follow_all=args.all)
    if args.json:
        return out_json(items)
    if not items:
        return print("no painpoints")
    for pp in items:
        quote = pp.get("painpoint_original") or pp.get("pain_point") or pp.get("name")
        print(f"- \"{trunc(quote, 300)}\"  [{pp.get('id')}]")
        if pp.get("painpoint_processed"):
            print(f"    -> {trunc(pp['painpoint_processed'], 200)}")
        if pp.get("feedback_id"):
            print(f"    feedback: {pp['feedback_id']}")


def cmd_signal_market(args) -> None:
    data = request(f"/v1/projects/{args.project}/signals/{args.id}/market-research")
    if args.json:
        return out_json(data)
    items = data.get("items", [])
    if not items:
        return print("no market research for this signal")
    print(f"{len(items)} market sources\n")
    for r in items:
        score = r.get("score")
        src = " / ".join(x for x in (r.get("company_name"), r.get("product_name")) if x)
        print(f"[{score:.3f}] {src or '(unknown source)'}" if score is not None
              else f"  {src or '(unknown source)'}")
        print(f"    {trunc(r.get('text'), 120)}")
        if r.get("business_description"):
            print(f"    about: {trunc(r['business_description'], 100)}")
        if r.get("released_at"):
            print(f"    released: {r['released_at']}")


# --------------------------------------------------------------------------- main
def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="ct.py", description="Continuum Tracker read-only API helper")
    sub = p.add_subparsers(dest="command", required=True)

    def add(name, fn, project=False):
        sp = sub.add_parser(name)
        sp.set_defaults(func=fn)
        sp.add_argument("--json", action="store_true", help="raw JSON output")
        if project:
            sp.add_argument("--project", required=True, help="project UUID")
        return sp

    add("me", cmd_me)
    add("projects", cmd_projects)
    add("project", cmd_project, project=True)   # single project, full mission/vision/north_star

    sp = add("signals", cmd_signals, project=True)
    sp.add_argument("--top", type=int, help="show only top N by feedback_count")
    sp.add_argument("--limit", type=int, help="page size (default 100)")
    sp.add_argument("--search")
    sp.add_argument("--category", action="append",
                    help="Recommendation|ManualPainPoint|ClusterPainPoint (repeatable)")
    sp.add_argument("--saved", action="store_true", help="only user-saved signals")
    sp.add_argument("--all", action="store_true", help="follow all pages")

    sp = add("feedbacks", cmd_feedbacks, project=True)
    sp.add_argument("--search")
    sp.add_argument("--limit", type=int)
    sp.add_argument("--all", action="store_true")

    sp = add("feedback", cmd_feedback, project=True)
    sp.add_argument("--id", required=True, help="feedback UUID")

    sp = add("signal", cmd_signal, project=True)
    sp.add_argument("--id", required=True, help="signal UUID")

    sp = add("signal-feedbacks", cmd_signal_feedbacks, project=True)
    sp.add_argument("--id", required=True, help="signal UUID")
    sp.add_argument("--limit", type=int)
    sp.add_argument("--all", action="store_true")

    sp = add("painpoints", cmd_painpoints, project=True)
    sp.add_argument("--feedback", help="feedback UUID")
    sp.add_argument("--signal", help="signal UUID")
    sp.add_argument("--limit", type=int)
    sp.add_argument("--all", action="store_true")

    sp = add("signal-market", cmd_signal_market, project=True)
    sp.add_argument("--id", required=True, help="signal UUID")

    return p


def main() -> None:
    args = build_parser().parse_args()
    global KEY
    KEY = load_key()
    args.func(args)


if __name__ == "__main__":
    main()
