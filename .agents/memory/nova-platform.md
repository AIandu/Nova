---
name: Nova platform architecture
description: Three-door app structure, routing, and seeded data
---

Three routes, three visual personalities, one React app:
- `/` — Storefront (founders/indie): electric cyan, Outfit font, Nova concierge widget
- `/lab` — Lab (DoD/defense): cold blue monospaced grid, no prices, Briefing CTA only
- `/partner` — Partner Space (Loretta): pure black, pink (#FF80AB primary) + yellow (#FFD54F secondary), immersive chat

API server at port from PORT env, routes all under `/api`.

DB seeded with 11 projects (OSN, AEGIS, FlexGuard, MediBee, AirSol, PRIMARC, CogniFlow, PeaceKeeper, GuardianEye, SBADS-X, BioKnox), 1 decision, 1 todo.

**Why:** Three completely separate design personalities share one deployment for simplicity and speed of iteration.
**How to apply:** Each door has its own theme class (theme-storefront, theme-lab, theme-partner) in index.css and its own layout wrapper.
