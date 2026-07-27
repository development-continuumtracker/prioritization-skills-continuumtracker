# Bundled intro shell — copy verbatim, do NOT read any product repo

This folder is the **self-contained, constant** part of every prototype: the standardized
"Welcome back" intro screen and the shared shell (record sidebar, audit, onboarding tour,
green Back-to-start button). It is **Continuum-Tracker-branded and identical in every
prototype**. Everything here is already inlined — the logo SVG, the login gradient, the
brand tokens — so a prototype can be built with **zero dependency on this or any repository**.

## Scaffold step: copy the whole bundle into the new prototype folder

| Bundled file | Copy to | Constant? |
| --- | --- | --- |
| `package.json` | `package.json` | ✅ constant skeleton |
| `vite.config.js` | `vite.config.js` | ✅ constant skeleton |
| `index.html` | `index.html` | ✅ constant skeleton |
| `main.jsx` | `src/main.jsx` | ✅ constant entry |
| `App.jsx` | `src/App.jsx` | ✅ constant `'intro' \| 'current' \| 'suggested'` switch |
| `Logo.jsx` | `src/ui/Logo.jsx` | ✅ constant (CT wordmark inlined) |
| `tokens.css` | `src/ui/tokens.css` | ✅ constant CT brand + welcome palette + login gradient |
| `primitives.css` | `src/ui/primitives.css` | ✅ constant (welcome, methods, record, audit, tour, top-bar, shared UI) |
| `primitives.jsx` | `src/ui/primitives.jsx` | ✅ constant React primitives |
| `Shell.jsx` | `src/ui/Shell.jsx` | ✅ constant top-bar + flow chrome |
| `OnboardingTour.jsx` | `src/ui/OnboardingTour.jsx` | ✅ constant reusable coach-mark tour |
| `IntroScreen.jsx` | `src/IntroScreen.jsx` | ✅ constant — reads the two data files below |
| `journey.template.js` | `src/data/journey.js` | ✍️ **fill per prototype** from the deep-dive |
| `audit.template.js` | `src/data/audit.js` | ✍️ **fill per prototype** (seed = verbatim deep-dive analysis) |

Then write only the **two flow files** — `src/flows/CurrentFlow.jsx` and
`src/flows/SuggestedFlow.jsx` — and fill the two data modules. Nothing else is authored by hand.

## What varies per prototype

Only two data modules — `journey.js` and `audit.js` — plus the two flow components. The
intro screen itself never changes: same logo, same "Welcome back", same subtitle, same
layout, same states.

## The flows are the ONLY place that researches the founder's product

The bundled shell is CT brand and needs no research. The **flows** (Current/Suggested)
should look like the specific product being prototyped — that research (the "Visual
language" step) applies to the flows only, and if the product has no reachable codebase,
reason from the deep-dive. The intro never depends on it.

## Provenance (reference only — not a build dependency)

The constant values were captured once from Continuum Tracker's own login + marketing:
logo `logo-wordmark.svg`; gradient `.login-glow`; type tokens `--fs-hero`, `--c-heading
#1c1a4e`, `--c-text #646192`, `--c-text-strong #292478`, `--c-primary #5046e5`. They are
already baked into `tokens.css` / `Logo.jsx` here — never re-fetch them from a repo.
