<p align="center">
  <a href="https://www.continuumtracker.com">
    <picture>
      <source srcset="../../assets/logo.png">
      <img src="../../assets/logo.png" alt="Continuum Tracker" width="300">
    </picture>
  </a>
</p>

# Continuum Tracker — the skill

<p align="center">
  <a href="https://github.com/anthropics/claude-code"><img src="https://img.shields.io/badge/Claude%20Code-skill-orange" alt="Claude Code skill" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/License-MIT-brightgreen" alt="License: MIT" /></a>
  <a href="https://www.continuumtracker.com"><img src="https://img.shields.io/badge/Continuum%20Tracker-continuumtracker.com-8186FF" alt="Continuum Tracker" /></a>
  <img src="https://img.shields.io/badge/API-read--only%20(GET)-059669" alt="Read-only API" />
  <img src="https://img.shields.io/badge/dependencies-none-64748B" alt="No dependencies" />
</p>

**This is the skill itself — the instructions, the API helper and the prototype template that ship inside the `continuum-tracker` plugin.** For the product overview and screenshots, see the [plugin README](../../README.md).

Point Claude Code at your [Continuum Tracker](https://www.continuumtracker.com) account and it reads your products, your evidence-ranked customer pain points and the market research behind each one — then turns the winner into a clickable prototype with an audit trail of *reasoning and changes*.

---

## Key features

| | Capability | What it means in practice |
|---|---|---|
| 📚 | **Query Continuum Tracker data** | Access market data (currently 41 000 pain points and their products) and your own data. |
| 🤖 | **AI agent per product** | Dedicate AI agents to work on pain points in parallel. Find product growth opportunities faster. |
| 🔬 | **Deep market + customer research** | What your users actually said, where the market is going (similarity scores included). |
| ⚡ | **Rapid prototypes, auditable** | Prototype app in minutes for each of your customer pain points (market reasoning included). |
| 🗺️ | **Customer journey investigation** | Map the customer journey and identify market-validated improvements for every pain point. |
| 🧾 | **Auditing decisions** | Every prototype change or decision can be audited and used for future learning. |

---

## The three workflows

The skill routes every request into one of three workflows, defined in [`SKILL.md`](./SKILL.md).

**Prioritization** — pick the product, load its mission/vision/north star, read every signal ranked by `feedback_count`, and render two linked tables: the priority list and the prototypes already built. You pick a row and one of three options.

**Deep dive** — one pain point, in two chapters. Chapter 1 is the evidence: the claim, every session with every verbatim quote, and a market-sources table combining your CT corpus with up to ten targeted web searches. Chapter 2 is the plan: an ASCII customer-journey diagram (today → the named shift → with the feature) and numbered steps grounded in the codebase, the quotes and the market.

**Prototype** — a throwaway Vite + React app with two clickable flows, the current journey and the suggested one, plus a Records sidebar carrying the journey diagram and an append-only audit of the reasoning.

The prototype is the only thing this skill builds. It never writes a PRD, and it never touches your product's own source.

## Install

The skill ships as part of the plugin. In Claude Code:

```bash
/plugin marketplace add development-continuumtracker/prioritization-skills-continuumtracker
/plugin install continuum-tracker@continuumtracker
```

## Setup

1. Get an API key from the web app at **`/settings/access`** (Bearer key with the `ct_` prefix).

2. Provide it in one of two ways:
   - Set the environment variable:
     ```bash
     export CONTINUUM_API_KEY=ct_...
     ```
   - Or copy `.env.example` to `.env` in your working directory and add your API key.
   - If neither is configured, the skill will prompt you to paste the key.

> **Security:** Your API key is never stored, echoed, or committed by the skill. It travels only as the `Authorization` header to the guarded base URL — a non-HTTPS remote host is refused outright, and a non-official host warns before the key moves.

## Usage

Just ask, in natural language:

- *"What are my priorities?"* / *"What should I build next?"*
- *"Show me my top pain points and how the market solves them."*
- *"Why is ‹pain point› a problem? Show me the evidence."*
- *"Prototype the ‹pain point› signal."*
- *"Continue the ‹pain point› prototype."*

Or invoke it explicitly with `/continuum-tracker`.

## The bundled API helper

All API access runs through a bundled helper that resolves the key, follows pagination, retries on rate limits, and prints compact output. It ships in two identical (1:1) implementations — use whichever runtime your system has:

- [`scripts/ct.py`](./scripts/ct.py) — Python 3.8+, standard library only (no `pip install`).
- [`scripts/ct.mjs`](./scripts/ct.mjs) — Node 18+, built-ins only (no `npm install`).

```bash
python scripts/ct.py  me                         # or: node scripts/ct.mjs me
python scripts/ct.py  projects
python scripts/ct.py  signals --project PID --top 10
python scripts/ct.py  signal-market --project PID --id SID
```

Add `--json` to any command for the raw API response; `python scripts/ct.py <cmd> -h` for options. Full command reference is in [`SKILL.md`](./SKILL.md).

## Prototypes

Prototypes are written to `Product management/PROTOTYPE - <signal name>/` in your workspace — gitignored on creation, never overwritten (collisions get numbered). Each is a self-contained **Vite + React** app: `npm install && npm run dev`.

The intro screen, shared shell, onboarding tour and audit are a **constant bundled template** ([`assets/intro/`](./assets/intro/)) copied verbatim into every prototype, so it builds identically regardless of your codebase. Only the two data modules (`journey.js`, `audit.js`) and the two flow components are written per prototype. Each prototype derives a unique dev port from its folder name, so several can run side by side.

## Files

| Path | Purpose |
|---|---|
| [`SKILL.md`](./SKILL.md) | The skill definition — workflows, formatting conventions, command reference. |
| [`assets/intro/`](./assets/intro/) | The bundled prototype template (skeleton, shell, intro, tour, data templates) plus its own README with the file→destination map. |
| [`scripts/ct.py`](./scripts/ct.py) | Read-only API helper (Python stdlib, no dependencies). |
| [`scripts/ct.mjs`](./scripts/ct.mjs) | Identical helper for Node (built-ins only). |
| [`.env.example`](./.env.example) | Template for the API key. |

## Requirements

| | Needed for |
|---|---|
| **Python 3.8+** *or* **Node 18+** | Running the API helper. No third-party packages either way. |
| **Node 18+** | Additionally, to run a generated prototype (Vite + React). |
| **Claude Code** | The host. |

## Scope and limits

- **Read-only.** No data is created, updated or archived in Continuum Tracker. Use [integrations](https://www.continuumtracker.com/integrations/) for data ingestion.
- **Prototypes never touch your product.** They are placed in the `Product management/` folder in your root directory, which is added to `.gitignore` on creation.
- Base URL is `https://app.continuumtracker.com/api`, overridable for local development with `CONTINUUM_API_BASE`.
- There are enforced rate-limits on queries for safety purposes. For more visit **`/settings/access`** inside the [continuumtracker.com](https://www.continuumtracker.com) app.

## License

**MIT** — see [LICENSE](../../LICENSE).

If you build on this, fork it, or ship something derived from it, please **reference [continuumtracker.com](https://www.continuumtracker.com)**. Attribution isn't a license condition beyond the MIT notice — it's a polite request from us.

## Acknowledgments

- **Powered by** [Continuum Tracker](https://www.continuumtracker.com)
- **Built for** [Claude Code](https://github.com/anthropics/claude-code).
- **Inspired by** thousands of products that nobody used, and the endless hours their creators spent building them.

<br>
<p align="center">
  <a href="https://www.continuumtracker.com">
    <picture>
      <source srcset="../../assets/logo.png">
      <img src="../../assets/logo.png" alt="Continuum Tracker" width="300">
    </picture>
  </a>
</p>
