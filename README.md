# My_Data

An Obsidian vault for investment research across housing, biotech, defense, energy, and macro domains.

## What This Is

A structured knowledge system that combines:
- **18 API pullers** for automated data ingestion (FRED, SEC, FDA, USPTO, EIA, and more)
- **Signal detection** with 4-tier severity (clear → watch → alert → critical)
- **18 investment theses** with conviction tracking, catalyst calendars, and invalidation criteria
- **InfraNodus knowledge graphs** for gap detection and structural analysis
- **8 Dataview dashboards** for monitoring signals, freshness, regimes, and cross-domain convergence

## Quick Start

```powershell
cd scripts
cp ../.env.example ../.env   # Add your API keys
node run.mjs status           # Verify key configuration
node run.mjs validate         # Check vault schema health
node run.mjs fred --group rates  # Pull your first data
```

## Structure

```
00_Dashboard/      → Dataview dashboards (start here)
01_Data_Sources/   → 64 source definitions across 16 categories
02_Projects/       → Active project tracking
03_Templates/      → 11 canonical templates
04_Reference/      → Schema docs, pull system guide, graph conventions
05_Data_Pulls/     → Timestamped API pull notes
06_Signals/        → Discrete signal event notes
07_Playbooks/      → Execution playbooks and graph sessions
08_Entities/       → Stocks, sectors, countries, commodities
09_Macro/          → Indicators and regime definitions
10_Theses/         → Investment theses
scripts/           → Node.js CLI tools and automation
```

## Requirements

- [Obsidian](https://obsidian.md) with **Dataview** plugin enabled
- Node.js 18+ for the pull system
- API keys (see `scripts/` → `node run.mjs status`)

## Documentation

- `CLAUDE.md` — AI-readable project guide (schema rules, CLI reference, conventions)
- `04_Reference/Vault_Schemas.md` — Frontmatter schema definitions
- `04_Reference/Pull_System_Guide.md` — Full CLI reference and morning sequence
- `04_Reference/Graph Conventions.md` — Network graph linking protocol
- `04_Reference/InfraNodus Graph Measurements.md` — Graph measurement workflow
