<p align="center">
  <a href="https://www.continuumtracker.com">
    <picture>
      <source srcset="./assets/logo.png">
      <img src="./assets/logo.png" alt="Continuum Tracker" width="300">
    </picture>
  </a>
</p>

# Continuum Tracker for Claude Code

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-5046E5" alt="License: MIT" /></a>
  <a href="https://www.continuumtracker.com"><img src="https://img.shields.io/badge/Continuum%20Tracker-continuumtracker.com-8186FF" alt="Continuum Tracker" /></a>
  <a href="https://github.com/anthropics/claude-code"><img src="https://img.shields.io/badge/Claude%20Code-skill-292478" alt="Claude Code skill" /></a>
  <img src="https://img.shields.io/badge/API-read--only%20(GET)-059669" alt="Read-only API" />
  <img src="https://img.shields.io/badge/runtime-Python%203.8%2B%20%7C%20Node%2018%2B-64748B" alt="Runtime" />
  <img src="https://img.shields.io/badge/dependencies-none-64748B" alt="No dependencies" />
</p>

**This Claude Code skill helps you manage product context across all your products, so you can quickly discover valuable ideas, uncover new growth opportunities, and test them in minutes by tapping directly into your Continuum Tracker data.**

Point Claude Code at your [Continuum Tracker](https://www.continuumtracker.com) account and it reads your products, your evidence-ranked customer pain points and the market research behind each one — then turns the winner into a clickable prototype with an audit trail of *easoning and changes*.

<picture>
      <source srcset="./assets/priorities.jpg">
      <img src="./assets/priorities.jpg" alt="Continuum Tracker">
    </picture>
    
---

## What you get

| | Capability | What it means in practice |
|---|---|---|
| 🔌 | **Query Continuum Tracker data** | Access market data (currently 41 000 pain points and their products) and your own data. |
| 🛰️ | **AI agent per product** | Dedicate AI agents to work on pain points in parallel. Find product growth opportunities faster. |
| 🔬 | **Deep market + customer research** | What your users actually said, where the market is going (dates and similarity scores included). |
| ⚡ | **Rapid prototypes, auditable** | Prototype app in minutes for each of your customer pain point (market reasoning included). |
| 🧭 | **Customer journey investigation** | Map the customer journey and identify market-validated improvements for every pain point. |
| 📈 | **Auditing decisions** | Every prototype change or decision can bre audited and used for futute learning. |

---

## Setup
1. Get an API key from the web app at **`/settings/access`** (Bearer key with the `ct_` prefix).

2. Provide it in one of two ways:
   - Set the environment variable:
     ```bash
     export CONTINUUM_API_KEY=ct_...
     ```
   - Or copy `.env.example` to `.env` in your working directory and add your API key.
   - If neither is configured, the skill will prompt you to paste the key.

> **Security:** Your API key is never stored, echoed, or committed by the skill.

## Usage

Just ask, in natural language:

- *"What are my priorities?"* / *"What should I build next?"*
- *"Show me my top pain points and how the market solves them."*
- *"Why is ‹pain point› a problem? Show me the evidence."*
- *"Prototype the ‹pain point› signal."*
- *"Continue the ‹pain point› prototype."*

Or invoke it explicitly with `/ct`.

## Requirements

| | Needed for |
|---|---|
| **Python 3.8+** *or* **Node 18+** | Running the API helper. No third-party packages either way. |
| **Node 18+** | Additionally, to run a generated prototype (Vite + React). |
| **Claude Code** | The host. |

## Scope and limits

- **Read-only.** No data is created, updated or archived in Continuum Tracker. Use [integrations](https://www.continuumtracker.com/integrations/) for that data ingestion.
- **Prototypes never touch your product.** They are placed in `Product management/` folder in root directory, which is added to `.gitignore` on creation.
- There are enforced rate-limits on query for safety purposes. For more visit **`/settings/access`** inside the [continuumtracker.com](https://www.continuumtracker.com) app.

## License

**MIT** — see [LICENSE](./LICENSE).

If you build on this, fork it, or ship something derived from it, please **reference [continuumtracker.com](https://www.continuumtracker.com)**. Attribution isn't a license condition beyond the MIT notice — it's a polite request from us.

## Acknowledgments

- **Powered by** [Continuum Tracker](https://www.continuumtracker.com)
- **Built for** [Claude Code](https://github.com/anthropics/claude-code).
- **Inspired by** thousands of products that nobody used, and the endless hours their creators spent building them. 



<p align="center">
  <a href="https://www.continuumtracker.com">
    <picture>
      <source srcset="./assets/logo.png">
      <img src="./assets/logo.png" alt="Continuum Tracker" width="300">
    </picture>
  </a>
</p>
