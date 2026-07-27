#!/usr/bin/env node
/**
 * Continuum Tracker read-only API helper for the continuum-tracker skill.
 *
 * Node built-ins only (no npm install; requires Node 18+ for global fetch).
 * 1:1 port of ct.py — same commands, flags, and output. Use whichever
 * runtime is available on the system.
 *
 * Auth: CONTINUUM_API_KEY env var, else CONTINUUM_API_KEY=... in ./.env,
 * else the command exits asking for it. The key is never printed or stored.
 *
 * Usage:
 *   node ct.mjs me
 *   node ct.mjs projects
 *   node ct.mjs project   --project PID
 *   node ct.mjs signals   --project PID [--top N] [--search T] [--category C] [--saved] [--all]
 *   node ct.mjs feedbacks --project PID [--search T] [--limit N] [--all]
 *   node ct.mjs feedback  --project PID --id FID
 *   node ct.mjs signal    --project PID --id SID
 *   node ct.mjs signal-feedbacks --project PID --id SID [--all]
 *   node ct.mjs painpoints --project PID (--feedback FID | --signal SID) [--all]
 *   node ct.mjs signal-market --project PID --id SID
 *
 * Add --json to any command for the raw API response.
 */
import fs from "node:fs";
import process from "node:process";

const OFFICIAL_HOST = "app.continuumtracker.com";

/**
 * Resolve the API base, refusing anywhere the key must not be sent.
 * CONTINUUM_API_BASE is an env-var override, so it is an untrusted input: every
 * request carries `Authorization: Bearer <key>`. Guard it before the key moves.
 */
function resolveBase() {
  const raw = (process.env.CONTINUUM_API_BASE || `https://${OFFICIAL_HOST}/api`).trim().replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    console.error(`CONTINUUM_API_BASE must be an http(s) URL with a host; got: ${raw}`);
    process.exit(1);
  }
  const host = parsed.hostname.toLowerCase();
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(host);

  if (!["http:", "https:"].includes(parsed.protocol) || !host) {
    console.error(`CONTINUUM_API_BASE must be an http(s) URL with a host; got: ${raw}`);
    process.exit(1);
  }
  if (parsed.protocol !== "https:" && !isLocal) {
    console.error(
      `Refusing to send your API key over plain HTTP to a remote host (${host}). ` +
        "Use https:// in CONTINUUM_API_BASE.",
    );
    process.exit(1);
  }
  if (host !== OFFICIAL_HOST && !isLocal) {
    console.error(
      `warning: CONTINUUM_API_BASE points at ${host} - your Continuum Tracker ` +
        "API key will be sent there, not to the official API.",
    );
  }
  return raw;
}

const BASE = resolveBase();
const TIMEOUT = 30000;
const MAX_RETRIES = 3;
let KEY = "";

// --------------------------------------------------------------------------- key
function loadKey() {
  const env = (process.env.CONTINUUM_API_KEY || "").trim();
  if (env) return env;
  try {
    for (const line of fs.readFileSync(".env", "utf-8").split(/\r?\n/)) {
      const t = line.trim();
      if (t.startsWith("CONTINUUM_API_KEY=")) {
        return t.slice("CONTINUUM_API_KEY=".length).trim().replace(/^['"]|['"]$/g, "");
      }
    }
  } catch { /* no .env */ }
  die(
    "No API key found. Set CONTINUUM_API_KEY in the environment or in a .env " +
    "file in this directory. Generate a key in the web app at /settings/access."
  );
}

function die(msg, code = 1) {
  process.stderr.write(`error: ${msg}\n`);
  process.exit(code);
}

// -------------------------------------------------------------------------- http
function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) v.forEach((x) => x != null && qs.append(k, String(x)));
    else qs.append(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function request(path, params) {
  const url = `${BASE}${path}${buildQuery(params)}`;
  const headers = { Authorization: `Bearer ${KEY}`, Accept: "application/json" };
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let resp;
    try {
      resp = await fetch(url, { method: "GET", headers, signal: AbortSignal.timeout(TIMEOUT) });
    } catch (e) {
      die(`network error: ${e.message || e}`, 3);
    }
    const body = await resp.text();
    if (resp.ok) return body ? JSON.parse(body) : {};
    if (resp.status === 429 && attempt < MAX_RETRIES - 1) {
      const wait = retryAfter(resp, body);
      process.stderr.write(`rate limited, retrying in ${wait}s...\n`);
      await sleep(wait * 1000);
      continue;
    }
    die(httpErrorMsg(resp.status, body), 2);
  }
  die("exhausted retries", 2);
}

function retryAfter(resp, body) {
  const hdr = resp.headers.get("retry-after");
  if (hdr && /^\d+$/.test(hdr)) return parseInt(hdr, 10);
  try { return parseInt(JSON.parse(body)?.error?.retry_after, 10) || 5; } catch { return 5; }
}

function httpErrorMsg(status, body) {
  try {
    const err = JSON.parse(body)?.error || {};
    const code = err.code || "";
    const message = err.message || body;
    const prefix = { 401: "unauthorized (check API key)", 403: "forbidden",
      404: "not found", 422: "validation error" }[status] || `HTTP ${status}`;
    return `${prefix}: ${code ? `[${code}] ` : ""}${message}`.trim();
  } catch {
    return `HTTP ${status}: ${body.slice(0, 300)}`;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function paginate(path, params, followAll) {
  params = { page: 1, ...params };
  const items = [];
  for (;;) {
    const data = await request(path, params);
    items.push(...(data.items || []));
    const pg = data.pagination || {};
    if (!followAll || params.page >= (pg.total_pages || 1)) return items;
    params.page += 1;
  }
}

// ------------------------------------------------------------------------ render
function trunc(text, n = 90) {
  if (!text) return "";
  text = String(text).split(/\s+/).join(" ");
  return text.length <= n ? text : text.slice(0, n - 1) + "…";
}
const outJson = (obj) => console.log(JSON.stringify(obj, null, 2));
const pad3 = (n) => String(n ?? 0).padStart(3);

// ----------------------------------------------------------------------- commands
async function cmdMe(a) {
  const d = await request("/v1/me");
  if (a.json) return outJson(d);
  console.log(`${d.email || "?"}  (id ${d.id || "?"})`);
  console.log(`default org: ${d.default_organization_id || "-"}`);
}

async function cmdProjects(a) {
  const items = await paginate("/v1/projects", { limit: 100 }, true);
  if (a.json) return outJson(items);
  if (!items.length) return console.log("no projects");
  for (const p of items) {
    console.log(`- ${p.name || "(unnamed)"}  [${p.id}]${p.is_default ? " *default" : ""}`);
    for (const f of ["mission", "vision", "north_star"]) {
      if (p[f]) console.log(`    ${f}: ${trunc(p[f], 120)}`);
    }
  }
}

async function cmdProject(a) {
  const d = await request(`/v1/projects/${a.project}`);
  if (a.json) return outJson(d);
  console.log(`${d.name || "(unnamed)"}  [${d.id}]${d.is_default ? "  *default" : ""}`);
  if (d.url) console.log(`url: ${d.url}`);
  for (const f of ["mission", "vision", "north_star", "similar_companies"]) {
    if (d[f]) console.log(`\n${f.replace(/_/g, " ").toUpperCase()}:\n${d[f]}`);
  }
}

async function cmdSignals(a) {
  const params = {
    limit: a.limit || 100,
    search: a.search,
    category: a.category || null,
    is_saved: a.saved ? "true" : null,
  };
  let items = await paginate(`/v1/projects/${a.project}/signals`, params, a.all);
  items.sort((x, y) => (y.feedback_count || 0) - (x.feedback_count || 0));
  if (a.top) items = items.slice(0, a.top);
  if (a.json) return outJson(items);
  if (!items.length) return console.log("no signals");
  for (const s of items) {
    console.log(`[${pad3(s.feedback_count)} fb] ${s.name || "(unnamed)"}  (${s.category})  [${s.id}]`);
    if (s.pain_point) console.log(`        pain: ${trunc(s.pain_point)}`);
    if (s.market_opportunity) console.log(`        market: ${trunc(s.market_opportunity)}`);
  }
}

async function cmdFeedbacks(a) {
  const params = { limit: a.limit || 100, search: a.search, sort_by: "created_at", sort_dir: "desc" };
  const items = await paginate(`/v1/projects/${a.project}/feedbacks`, params, a.all);
  if (a.json) return outJson(items);
  if (!items.length) return console.log("no feedbacks");
  for (const f of items) {
    console.log(`- ${f.name || "(untitled)"}  by ${f.author || "?"}  [${f.id}]`);
    console.log(`    ${trunc(f.feedback_original)}`);
  }
}

async function cmdFeedback(a) {
  const d = await request(`/v1/projects/${a.project}/feedbacks/${a.id}`, { include: "painpoint" });
  if (a.json) return outJson(d);
  console.log(`${d.name || "(untitled)"}  [${d.id}]`);
  console.log(`author: ${d.author || "?"} (${d.author_type || "-"})  source: ${d.source}  status: ${d.status}`);
  console.log(`\n${d.feedback_original || ""}\n`);
  if (d.feedback_processed) console.log(`processed: ${d.feedback_processed}`);
  for (const pp of d.painpoints || []) {
    console.log(`  - painpoint: ${trunc(pp.painpoint_original || pp.pain_point || pp.name)}`);
    if (pp.painpoint_processed) console.log(`      -> ${trunc(pp.painpoint_processed, 200)}`);
  }
}

async function cmdSignal(a) {
  const d = await request(`/v1/projects/${a.project}/signals/${a.id}`);
  if (a.json) return outJson(d);
  console.log(`${d.name}  (${d.category})  [${d.feedback_count || 0} feedbacks]`);
  for (const f of ["pain_point", "user_story", "market_opportunity"]) {
    if (d[f]) console.log(`  ${f}: ${trunc(d[f], 140)}`);
  }
}

async function cmdSignalFeedbacks(a) {
  const params = { limit: a.limit || 100, include: "painpoint" };
  const items = await paginate(`/v1/projects/${a.project}/signals/${a.id}/feedbacks`, params, a.all);
  if (a.json) return outJson(items);
  if (!items.length) return console.log("no feedbacks for this signal");
  for (const f of items) {
    console.log(`- ${f.name || "(untitled)"}  [${f.id}]`);
    console.log(`    ${trunc(f.feedback_original)}`);
  }
}

async function cmdPainpoints(a) {
  let path;
  if (a.feedback) path = `/v1/projects/${a.project}/feedbacks/${a.feedback}/painpoints`;
  else if (a.signal) path = `/v1/projects/${a.project}/signals/${a.signal}/painpoints`;
  else die("painpoints needs --feedback FID or --signal SID");
  const items = await paginate(path, { limit: a.limit || 50 }, a.all);
  if (a.json) return outJson(items);
  if (!items.length) return console.log("no painpoints");
  for (const pp of items) {
    const quote = pp.painpoint_original || pp.pain_point || pp.name;
    console.log(`- "${trunc(quote, 300)}"  [${pp.id}]`);
    if (pp.painpoint_processed) console.log(`    -> ${trunc(pp.painpoint_processed, 200)}`);
    if (pp.feedback_id) console.log(`    feedback: ${pp.feedback_id}`);
  }
}

async function cmdSignalMarket(a) {
  const d = await request(`/v1/projects/${a.project}/signals/${a.id}/market-research`);
  if (a.json) return outJson(d);
  const items = d.items || [];
  if (!items.length) return console.log("no market research for this signal");
  console.log(`${items.length} market sources\n`);
  for (const r of items) {
    const src = [r.company_name, r.product_name].filter(Boolean).join(" / ");
    console.log(r.score != null
      ? `[${r.score.toFixed(3)}] ${src || "(unknown source)"}`
      : `  ${src || "(unknown source)"}`);
    console.log(`    ${trunc(r.text, 120)}`);
    if (r.business_description) console.log(`    about: ${trunc(r.business_description, 100)}`);
    if (r.released_at) console.log(`    released: ${r.released_at}`);
  }
}

// --------------------------------------------------------------------------- cli
const COMMANDS = {
  me: { fn: cmdMe },
  projects: { fn: cmdProjects },
  project: { fn: cmdProject, project: true },
  signals: { fn: cmdSignals, project: true,
    flags: { top: "int", limit: "int", search: "str", category: "multi", saved: "bool", all: "bool" } },
  feedbacks: { fn: cmdFeedbacks, project: true,
    flags: { search: "str", limit: "int", all: "bool" } },
  feedback: { fn: cmdFeedback, project: true, flags: { id: "str!" } },
  signal: { fn: cmdSignal, project: true, flags: { id: "str!" } },
  "signal-feedbacks": { fn: cmdSignalFeedbacks, project: true,
    flags: { id: "str!", limit: "int", all: "bool" } },
  painpoints: { fn: cmdPainpoints, project: true,
    flags: { feedback: "str", signal: "str", limit: "int", all: "bool" } },
  "signal-market": { fn: cmdSignalMarket, project: true, flags: { id: "str!" } },
};

function parse(command, argv) {
  const spec = COMMANDS[command];
  const flags = { ...(spec.flags || {}) };
  if (spec.project) flags.project = "str!";
  flags.json = "bool";
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (!t.startsWith("--")) die(`unexpected argument: ${t}`, 2);
    const name = t.slice(2);
    const kind = flags[name];
    if (!kind) die(`${command}: unknown option --${name}`, 2);
    if (kind === "bool") { out[name] = true; continue; }
    const val = argv[++i];
    if (val === undefined) die(`${command}: --${name} needs a value`, 2);
    if (kind === "multi") (out[name] ||= []).push(val);
    else if (kind.startsWith("int")) out[name] = parseInt(val, 10);
    else out[name] = val;
  }
  for (const [name, kind] of Object.entries(flags)) {
    if (typeof kind === "string" && kind.endsWith("!") && out[name] === undefined) {
      die(`${command}: the following argument is required: --${name}`, 2);
    }
  }
  return out;
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "-h" || command === "--help") {
    console.log(`usage: ct.mjs {${Object.keys(COMMANDS).join(",")}} [options]   (add --json for raw output)`);
    process.exit(command ? 0 : 2);
  }
  if (!COMMANDS[command]) die(`unknown command: ${command}`, 2);
  const args = parse(command, rest);
  KEY = loadKey();
  await COMMANDS[command].fn(args);
}

main().catch((e) => die(e.message || String(e), 1));
