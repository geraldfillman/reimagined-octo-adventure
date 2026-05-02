# My_Data Vault

An Obsidian-based investment research system covering housing, biotech, defense, energy, macro, and cross-domain theses. The vault combines structured notes, puller scripts + 10 KB scripts, signal detection, dashboards, graph analysis, OSINT scanning, and thesis monitoring. FMP Premium is the active financial-data backbone. The daily routine is split into daily and weekly cadences with company-risk-scan integrated.

## Multi-Vault Architecture

This system spans three Obsidian vaults. **My_Data is the engine** — all scripts live here and route reads/writes to the appropriate vault via env vars in `.env`.

| Vault | Path | Role |
|-------|------|------|
| **My_Data** | `...\My_Data` | Pull/Research engine — data sources, pulls, signals, theses, scripts |
| **Dr_Magnifico** | `...\Dr_Magnifico` | Learning System — `11_Learning/`, daily sessions, nodes, mastery |
| **Oy** | `...\Oy` | KB System — `12_Knowledge_Bases/`, intake-to-wiki pipeline |

Routing env vars (set in `My_Data/.env`):
- `LEARNING_VAULT_ROOT` → Dr_Magnifico path (used by `getLearningRoot()` in `config.mjs`)
- `KB_VAULT_ROOT` → Oy path (used by `getKBRoot()` in `config.mjs`)

## Current State

- `7` MOC files provide the top-level navigation layer (plus `moc-company-risk`).
- `16` dashboards provide the main operator surfaces (including 2 Company Risk dashboards).
- `19` canonical templates live in `03_Templates/` (including 5 Company Risk templates).
- `21` active thesis notes are tracked in `10_Theses/`.
- Active puller scripts live in `scripts/pullers/`, including `sector-scan` and 11 OSINT/social scanners.
- `10` KB scripts live in `scripts/kb/` — the intake-to-wiki pipeline (`kb ingest`, `kb normalize`, `kb classify`, `kb compile`, `kb query`, `kb librarian`, `kb health`, `kb transcribe`, `kb suggest`, `kb dispatch`).
- `sector-scan`, `conviction-delta`, validation, cleanup, retention, and signal-aware scorecard updates are live.
- FMP is the active quote, screener, technical, and watchlist backbone.

## Completed So Far

- Built the vault structure, schema system, templates, MOCs, dashboards, and CLI pull framework.
- Implemented the thesis-driven signal system with pull notes, signal notes, and Dataview aggregation.
- Brought `sector-scan` live with sector evidence collection, thesis routing, signal writing, emerging-pattern stubs, and bridge-note support.
- Added `conviction-delta` plus signal-aware thesis scorecard updates to support rolling conviction and allocation suggestions.
- Recalibrated sector routing to reduce broad false positives and lower default stub churn.
- Added sector-specific SEC snapshot handling so sector evidence remains stable and reviewable.
- Retired local Qlib/quant workflows; restore or reinstall only if a concrete use case returns.
- Integrated InfraNodus graph-session generation for structural analysis across notes and folders.
- Upgraded the active financial-data workflow to FMP Premium.
- Added local operator dashboard (`node run.mjs dashboard`) with Signal Board, Thesis Status, Pull Health, Technical Risk, Earnings Calendar, and live Data Collection panels.
- Added `fmp --quote`, `fmp --technical`, `fmp --earnings-calendar`, and `fmp --thesis-watchlists`.
- Added thesis-level `node run.mjs thesis-fmp-sync` to project FMP tape and catalyst data into thesis frontmatter.
- Added batch thesis watchlist pull notes that combine quotes, warmed FMP fundamentals, technicals, earnings timing, and optional thesis-basket coverage.
- `fmp --thesis-watchlists` now warms the local FMP fundamentals cache so thesis sync and full-picture reports can inherit valuation and quality fields more reliably.
- Added `node run.mjs thesis-catalysts` plus the `Catalyst Radar` dashboard for symbol-level catalyst review across theses.
- Added `node run.mjs thesis-full-picture` plus the `Full Picture Reports` dashboard for one-note structural + tactical thesis synthesis.
- Improved thesis full-picture macro matching so indicator links can resolve through direct series IDs, indicator-note aliases, grouped macro pulls, BEA-style single-metric notes, and the local VIX bridge note.
- Added `node run.mjs macro-bridges` to normalize Debt/GDP, DXY proxy, Defense Budget proxy, Gold, and Bitcoin into one macro bridge note for thesis report coverage.
- Added `node run.mjs nahb --builder-confidence` for official builder-sentiment evidence and `node run.mjs federalregister --faa-uas` for official FAA drone rulemaking evidence.
- Added high-priority official and library source notes for unresolved indicators, including NAHB HMI, FAA rulemaking, World Gold Council Goldhub, IMF IFS, ProQuest Congressional, Nexis Uni, Janes, Capital IQ Pro, and 451 Research.
- Retired the old legacy market-data operator path in favor of the current FMP workflow.
- Simplified the vault: pruned 223 stale duplicate pull notes, deleted 3 absorbed patch files (`patch-dashboard.mjs`, `patch-phase2.mjs`, `patch-phase3.mjs`), removed 4 orphaned config sources (BLS, Census, NOAA, World Bank), cleared stale FMP/SEC caches, cleaned up archived data source definitions, and deleted empty pull folders.
- Restructured `daily-routine.ps1` into daily + weekly cadences. Daily covers macro/market, SEC thesis, FMP watchlists, sector-scan, and company-risk watchlist. Weekly (`-IncludeWeekly`) adds FEMA, USASpending, FDA, clinical trials, USPTO, arXiv, PubMed, NewsAPI, and full company-risk with score updates.
- Added OSINT intelligence layer: 10 source definitions in `01_Data_Sources/OSINT/` covering SpiderFoot, theHarvester, Amass, Recon-ng, OpenCorporates, ICIJ Offshore Leaks DB, OTX AlienVault, VesselFinder, Bellingcat ADS-B History, and Bellingcat Auto Archiver. Four passive scan scripts wired into `scan osint-*` CLI group. All output to `05_Data_Pulls/osint/`.
- Extended OSINT layer (second pass): added 9 source notes (Phantom Tide, Hormuz Tracker, World Monitor, Leaker, Merklemap, Columbus Project, octosuite, SAR Interference Tracker, Umbra Open Data Tracker) plus osm-search and snscrape. Seven new scan scripts wired — total 11 `scan osint-*` commands. Two learning system resources added to `11_Learning/09_Resources/`.
- Built `12_Knowledge_Bases/` KB subsystem: 19-directory folder tree, 4 wiki templates, Dataview wiki index, and 10 KB pipeline scripts (`kb ingest` → `kb normalize` → `kb classify` → `kb compile` → `kb query`). Health tools: `kb librarian` (lint + auto-fix), `kb health` (integrity checks), `kb suggest` (gap analysis), `kb transcribe` (meeting extraction). Wired into router.mjs as the `kb` CLI group.
- Wired KB raw mirroring into `writeNote()` via `scripts/lib/kb-bridge.mjs`. Every pull note written to `05_Data_Pulls/` is automatically copied to the matching `12_Knowledge_Bases/raw/{kind}/` subfolder. Domain is inferred from the path segment (Macro→datasets, Government→articles, Science→papers, etc.). `kb compile` deletes the raw copy after the wiki page is written (strict cleanup).
- Upgraded the learning system to **Adaptive Generalist System V2**: replaced the 11-step session monolith with an 8-step Daily Engine (due-review-queue-first); added retrieval lifecycle fields (`next_review_due`, `retrieval_success_count`, `retrieval_failure_count`, `misconception_log`, etc.) to all 16 mastery notes and templates; rebuilt the Mastery Dashboard with 6 Dataview blocks; added hard 50% domain balance cap; added project promotion gate enforcement and conflict flagging; created `Link_Integrity_Report.md`; added 3 new maintenance scripts (`learning-review.ps1`, `learning-project-audit.ps1`, `learning-link-audit.ps1`) and V2 validation checks to `learning-daily.ps1`.

## Folder Structure

| Folder | Purpose |
|--------|---------|
| `000-moc/` | 8 Master of Content navigation files - read before exploring raw notes |
| `00_Dashboard/` | 16 primary Dataview dashboards - start here for current operator state |
| `01_Data_Sources/` | 88 active source definitions across 17 categories (including OSINT/) |
| `03_Templates/` | 19 canonical templates for all note types |
| `04_Reference/` | Schema docs, graph conventions, pull system guide, source overview boards, and graph-analysis surfaces |
| `05_Data_Pulls/` | Timestamped pull notes from API pullers and synthesis workflows |
| `06_Signals/` | Discrete signal notes when thresholds fire |
| `07_Playbooks/` | Execution playbooks + Graph Sessions subfolder |
| `08_Entities/` | Stocks (46), Sectors (12), Countries (8), Commodities (7), ETFs, Currencies |
| `09_Macro/` | Indicators (17) and Regimes (9) |
| `10_Theses/` | 21 investment theses with conviction tracking (including 3 cross-domain bridge theses) |
| `11_Learning/` | **Moved to Dr_Magnifico vault** — open that vault in Obsidian to access learning content |
| `12_Company_Risk/` | Company Risk Intelligence system — Companies, Events, Patterns, Entities, Transactions subfolders. Pattern recognition for narrative vs. reality misalignment. |
| `12_Knowledge_Bases/` | **Moved to Oy vault** — open that vault in Obsidian to access KB content. Scripts still run from `scripts/kb/` here. |
| `500-archive/` | Retired or deprioritized data sources; do not link from active notes |
| `scripts/` | Node.js automation (pullers, validator, InfraNodus, cleanup, KB routing) |

## Frontmatter Schemas

All schemas are defined in `04_Reference/Vault_Schemas.md`. Key rules:

- **Data Sources** (`01_Data_Sources/`): Must have `name`, `category` (matches folder name), `type`, `provider`, `pricing`, `status`, `priority`, `url`, `provides[]`, `integrated` (boolean)
- **Pull Notes** (`05_Data_Pulls/`): Must have `title`, `source`, `date_pulled` (YYYY-MM-DD), `domain`, `data_type`, `frequency`, `signal_status` (`clear|watch|alert|critical`), `signals[]`, `tags[]`
- **Entities** (`08_Entities/`): Must have `node_type`, `status`, `bullish_drivers[]`, `bearish_drivers[]`, `related_entities[]`
- **Theses** (`10_Theses/`): Must have `node_type: "thesis"`, `conviction` (`high|medium|low`), `timeframe`, `core_entities[]`, `supporting_regimes[]`, `invalidation_triggers[]`
- **Macro Indicators** (`09_Macro/Indicators/`): Must have `node_type: "indicator"`, `parent_regimes[]`, `affects_sectors[]`
- **Macro Regimes** (`09_Macro/Regimes/`): Must have `node_type: "regime"`, `key_indicators[]`, `favors_sectors[]`, `hurts_sectors[]`
- **Company Risk** (`12_Company_Risk/Companies/`): Must have `node_type: "company_risk"`, `ticker`, `sector`, `status` (`Watchlist|Active|Archived`), `risk_score` (0–100 integer), `gap_score` (`Low|Medium|High`), `last_updated`, `pattern_matches[]`, `tags: [company-risk]`
- **Risk Events** (`12_Company_Risk/Events/`): Must have `node_type: "risk_event"`, `date` (YYYY-MM-DD), `event_type` (`Regulatory|Sentiment|Financial|Governance`), `company`, `severity` (`Low|Medium|High`), `confidence` (`Low|Medium|High`), `tags: [risk-event]`
- **Risk Patterns** (`12_Company_Risk/Patterns/`): Must have `node_type: "risk_pattern"`, `pattern_type` (`Financial|Governance|Narrative|Structural`), `severity` (`Low|Medium|High`), `tags: [risk-pattern]`
- **Risk Entities** (`12_Company_Risk/Entities/`): Must have `node_type: "risk_entity"`, `entity_type` (`Company|Person|Fund`), `known_connections[]`, `tags: [risk-entity]`
- **Risk Transactions** (`12_Company_Risk/Transactions/`): Must have `node_type: "risk_transaction"`, `date` (YYYY-MM-DD), `transaction_type` (`Cash|Equity|Asset Transfer`), `company`, `entities_involved[]`, `confidence` (`Low|Medium|High`), `tags: [risk-transaction]`

## Naming Conventions

- Pull notes: `YYYY-MM-DD_Name.md` (date-stamped, path-safe)
- Entity files: Match the canonical name (for example `AAPL.md`, `Tech Sector.md`)
- Source categories must match folder names exactly (see `04_Reference/Vault_Schemas.md` for the 16 valid categories)

## Wiki Links And Graph Connectivity

Use `[[wikilinks]]` in frontmatter arrays to create graph edges:

```yaml
bullish_drivers: ["[[Rate Cut Cycle]]", "[[Weak USD]]"]
core_entities: ["[[DHI]]", "[[LEN]]", "[[Housing]]"]
parent_regimes: ["[[Rate Cut Cycle]]"]
```

See `04_Reference/Graph Conventions.md` for the full linking protocol.

## Pull System (CLI)

All commands run from `scripts/`. The CLI uses a grouped grammar:

```
node run.mjs <group> <command> [options]
```

Run `node run.mjs help` for overview. Run `node run.mjs <group> --help` for group detail.
Full command inventory: `90_System/CLI Command Audit.md`

```powershell
# System
node run.mjs system status
node run.mjs system validate
node run.mjs system dashboard
node run.mjs system cleanup --market-history --dry-run
node run.mjs system infranodus --path 10_Theses

# Learning — session scaffold (V2: pre-flight validation runs automatically)
node run.mjs learn session --nodes "Systems Thinking, Feedback Loops" --connections "Systems Thinking->Feedback Loops"
node run.mjs learn web                  # start learning web app on port 4747 (full UI)
node run.mjs learn canvas               # generate 11_Learning/Node Map.canvas (mastery node network)
node run.mjs learn canvas --all         # include locked nodes

# Learning — V2 maintenance scripts (PowerShell)
powershell scripts/learning-daily.ps1                          # V2 daily session scaffold with pre-flight checks
powershell scripts/learning-daily.ps1 -SkipValidation          # skip pre-flight (not recommended)
powershell scripts/learning-review.ps1                         # print due review queue for today
powershell scripts/learning-review.ps1 -IncludeNodes           # include node-level due items
powershell scripts/learning-project-audit.ps1                  # audit project scarcity + promotion gates
powershell scripts/learning-link-audit.ps1                     # scan for broken links, update Link_Integrity_Report.md

# Scans
node run.mjs scan sectors
node run.mjs scan sectors --sector industrials --dry-run
node run.mjs scan company-risk --ticker AAPL --company "Apple Inc"
node run.mjs scan company-risk --watchlist --update-score
node run.mjs scan conviction --window 14

# OSINT Scans (passive mode — no active probing; requires CLI tool installed)
node run.mjs scan osint-spiderfoot --domain example.com
node run.mjs scan osint-harvester --domain example.com
node run.mjs scan osint-amass --domain example.com
node run.mjs scan osint-recon --domain example.com
node run.mjs scan osint-telegram --channel marketnews --query "supply chain"
node run.mjs scan osint-leaker --domain example.com
node run.mjs scan osint-octosuite --org openai
node run.mjs scan osint-merklemap --domain example.com
node run.mjs scan osint-columbus --domain example.com
node run.mjs scan osint-snscrape --platform twitter --query "NVDA earnings"
node run.mjs scan osint-umbra --region hormuz
node run.mjs scan osint-osmsearch --location hormuz --radius 15000

# Social sentiment
node run.mjs pull reddit --subreddit wallstreetbets --query AAPL
node run.mjs pull reddit --thesis "Housing Supply Correction"
node run.mjs pull reddit --all-thesis

# Thesis
node run.mjs thesis sync --dry-run
node run.mjs thesis catalysts --thesis "Housing Supply Correction"
node run.mjs thesis full-picture
node run.mjs thesis canvas          # generate 10_Theses/Thesis Map.canvas (active theses)
node run.mjs thesis canvas --all    # include inactive theses

# Pulls
node run.mjs pull fred --group rates
node run.mjs pull nahb --builder-confidence
node run.mjs pull macro-bridges
node run.mjs pull federalregister --faa-uas
node run.mjs pull sec --thesis
node run.mjs pull fmp --quote SPY
node run.mjs pull fmp --technical SPY
node run.mjs pull fmp --earnings-calendar --from 2026-04-01 --to 2026-04-05
node run.mjs pull fmp --thesis-watchlists --dry-run
node run.mjs pull fmp --thesis-watchlists --thesis "Housing Supply Correction"
node run.mjs pull fmp --sector-baskets
node run.mjs pull fmp --sector-baskets --sector tech

# Playbooks
node run.mjs playbook housing-cycle

# KB — Knowledge Base pipeline
node run.mjs kb ingest --file ./article.md --kind article --title "Q1 Energy Outlook"
node run.mjs kb ingest --url https://example.com/report --kind report   # uses defuddle if installed
node run.mjs kb normalize --dry-run
node run.mjs kb classify --file jobs/2026-04-05_q1-energy-outlook.md
node run.mjs kb compile --file jobs/2026-04-05_q1-energy-outlook.md --dry-run
node run.mjs kb query --query "What is the current energy regime?" --save
node run.mjs kb librarian --fix
node run.mjs kb health
node run.mjs kb transcribe --file raw/transcripts/call.md --speakers "Alice,Bob"
node run.mjs kb suggest --save
```

> Legacy flat commands (`sector-scan`, `thesis-fmp-sync`, etc.) still work
> but print a deprecation notice pointing to the new grouped form.

**Optional setup** (install once for enhanced features):
- `npm install -g defuddle` — enables clean markdown extraction when ingesting URLs via `kb ingest --url`
- Obsidian CLI must be open for `obsidian-cli.mjs` property sync to fire (safe no-op if closed)

Morning sequence details are documented in `04_Reference/Pull_System_Guide.md`.
The daily routine (`daily-routine.ps1`) is split into two cadences:
- **Daily:** FRED rates/housing/labor, FMP SPY quote, Treasury yields, SEC thesis, FMP thesis watchlists, sector-scan, company-risk watchlist scan
- **Weekly (`-IncludeWeekly`):** OpenFEMA, USASpending, FDA, clinical trials, USPTO, arXiv, PubMed, NewsAPI, full company-risk with score updates

```powershell
powershell scripts/daily-routine.ps1               # daily cadence only
powershell scripts/daily-routine.ps1 -IncludeWeekly # daily + weekly
powershell scripts/daily-routine.ps1 -DryRun         # preview without API calls
```

### Maintenance Scripts

```powershell
node run.mjs cleanup --market-history --dry-run
node run.mjs cleanup --market-history
```

---

## Learning System

> **Content lives in Dr_Magnifico vault** (`...\Dr_Magnifico\11_Learning\`). Open that vault in Obsidian for learning notes. Scripts run from here via `LEARNING_VAULT_ROOT` env var.

A generalist, self-directed learning system. Covers science, philosophy, history, mathematics, psychology, and more — not limited to finance or markets.

### Folder Structure (in Dr_Magnifico vault)

```
Dr_Magnifico/
└── 11_Learning/
    ├── 00_Dashboard/         — Mastery_Dashboard.md (Dataview)
    ├── 01_Domains/           — One Overview.md per domain + Deep_Dive_Resources/
    ├── 02_Nodes/             — Knowledge node stubs (fill during sessions)
    ├── 03_Connections/       — Cross-domain connection notes
    ├── 04_Sessions/          — Daily session notes (one per day)
    ├── 05_Mastery/           — One .md per mastery topic + Mastery Progress.base
    ├── 06_Templates/         — Session, Node, Connection, Mastery, Review templates
    ├── 07_Projects/          — Depth project files (pre-populated, create more via web UI)
    ├── 08_Reviews/           — Weekly and quarterly review notes
    ├── 09_Resources/         — Supplemental resource notes
    └── Learner_Notebooks/    — Free-form personal notebook (editable in web UI)
```

### Current Curriculum (16 active mastery topics)

| Domain | Topic | topic_id |
|--------|-------|----------|
| Foundations | Cause and Effect Chains | `foundations-cause-effect` |
| Foundations | Systems Thinking | `foundations-systems-thinking` |
| Foundations | First Principles Reasoning | `foundations-first-principles` |
| Foundations | Rhetoric and Argumentation | `foundations-rhetoric` |
| Psychology_Behavior | Cognitive Biases and Decision Making | `psych-cognitive-biases` |
| Psychology_Behavior | Habit Formation and Motivation | `psych-habit-motivation` |
| Biology_Life_Systems | Evolution and Natural Selection | `bio-evolution` |
| Physics_Energy | Thermodynamics and Entropy | `physics-thermodynamics` |
| Math_Quant | Probability and Expected Value | `math-probability` |
| Math_Quant | Statistics and Inference | `math-statistics` |
| History_Theory | How Civilizations Collapse | `history-civilization-collapse` |
| Philosophy_Epistemology | Epistemology | `phil-epistemology` |
| Philosophy_Epistemology | Scientific Method and Paradigm Shifts | `phil-scientific-method` |
| Political_Systems_Governance | How Power Structures Form and Fail | `polsys-power-structures` |
| Sociology_Social_Systems | Network Effects and Social Contagion | `socio-network-effects` |
| Frontier | AI Fundamentals | `frontier-ai-fundamentals` |

To add a new topic: create a mastery note in `11_Learning/05_Mastery/` using the template, register it in `01_Domains/Topic Registry.md`, then run `node run.mjs learn canvas` to update the visual map.

### Pre-populated Projects (07_Projects/)

| Project | Status | Connects To |
|---------|--------|-------------|
| Personal Cognitive Bias Audit | ⚠ conflict (active) | psych-cognitive-biases |
| Probability Intuition Log | ⚠ conflict (active) | math-probability |
| 30-Day Habit Experiment | ⚠ conflict (active) | psych-habit-motivation |
| Write a Steel-Man Argument | ⚠ conflict (active) | foundations-rhetoric, phil-epistemology |
| Map a System From Scratch | queued | foundations-systems-thinking |
| Build a Mental Model Library | queued | foundations-first-principles, foundations-systems-thinking |
| Map One Civilization Collapse | queued | history-civilization-collapse, polsys-power-structures |
| Trace a Technology From Physics to Product | queued | physics-thermodynamics |
| Study One Scientific Revolution | queued | phil-scientific-method |
| Trace How an Idea Spread | queued | socio-network-effects |

### Web App (Learning UI)

```bash
node run.mjs learn web          # starts on http://localhost:4747
```

Views available:
- **Observatory** — daily dashboard: streak, recommendation, mastery summary, sparkline check history, locked-topic progress, session scaffold, weekly review generator
- **Assignment Studio** — project list with status tracking; create new assignments inline
- **Knowledge Check** — generates and scores surface / advanced checks per topic
- **Checkpoint** — submit a mastery checkpoint, triggers unlock evaluation
- **Library** — full-text search across all learning notes; Resources tab shows Deep_Dive_Resources by domain with URL capture
- **Notebook** — free-form notes with create/rename/delete
- **Map** — 3D network graph of mastery nodes with prerequisite edges

### Canvas Views

```bash
node run.mjs learn canvas          # 11_Learning/Node Map.canvas — mastery network with prereq edges
node run.mjs learn canvas --all    # include locked topics
```

`11_Learning/Learning System.canvas` — the V2 session workflow: Daily Engine 8-step flow, active session file, domain balance scoreboard, project health tracker, mastery dashboard, nodes/connections reference.

### Session Workflow — V2 Daily Engine (30–45 min)

> **Core directive:** Optimize for durable learning artifacts — nodes, connections, mastery updates. The session note is a workspace log, not the learning product.

1. **Due Review Queue** ← *retrieve from memory before opening notes; score recall first*
2. **Surface Retrieval Check** ← *pause, answer before proceeding*
3. **Node Build or Refinement** — create or improve one node (mechanism-first, with example)
4. **Connection Creation** — minimum 1 connection per session; explain why it matters
5. **Optional Discovery Pass** — skip if due review queue was full
6. **Project Review Touch** — review active project state only; do not activate new projects here
7. **Advanced or Transfer Check** ← *pause, answer before mastery update*
8. **Mastery Update** — update only based on demonstrated evidence from Steps 1–7

**Deep Dive Mode** (60–120 min, optional): use only when a node keeps recurring, a project needs deeper context, or retrieval failures are repeated. Must still produce ≥ 1 node and ≥ 1 connection.

**Anti-drift rules:** ≥ 1 node built or refined · ≥ 1 connection created · due review queue run first · no session completes with zero graph output

### Domain Balance Rule

**Hard rule:** No single domain may exceed **50% of sessions** over any rolling 14-day window, unless **Special Campaign Mode** is declared explicitly at session start (capped at 7 days). The Economics / Markets cluster (Macro, Market_Structure, Sectors, Fundamentals, Risk, Foundations) counts as one domain group for this calculation. Weekly reviews must cover ≥ 4 distinct domains. Flag any domain with 0 sessions in 14 days as a blind spot.

### Mastery Fields Reference

Each `05_Mastery/*.md` file uses both YAML frontmatter and inline fields (both must be kept in sync — server reads inline fields via `parseInlineFields()`):

| Field | Values | Notes |
|-------|--------|-------|
| `topic_id` | string | Must match Topic Registry exactly |
| `domain` | domain folder name | e.g. `Psychology_Behavior` |
| `level` | 0–5 | 0=not started, 5=mastered |
| `confidence` | 0–100 | percentage |
| `stability` | fragile / building / solid / mastered | drives canvas color |
| `progress_state` | active / locked / complete | drives unlock logic |
| `prerequisites` | comma-separated topic_ids or `none` | drives canvas edges and unlock |
| `check_history` | JSON array or comma-separated | last 5 shown as sparkline |
| `next_action` | string | shown in Observatory recommendation |
| `next_review_due` | YYYY-MM-DD | drives due-review queue in dashboard Block 1 |
| `retrieval_success_count` | integer | incremented on each successful blank-page recall |
| `retrieval_failure_count` | integer | incremented on each failed retrieval attempt |
| `last_successful_retrieval` | YYYY-MM-DD | date of last passed retrieval |
| `last_failed_retrieval` | YYYY-MM-DD | date of last failed retrieval |
| `delayed_check_history` | array | log of delayed check scores |
| `transfer_evidence` | array | instances where concept was applied cross-domain |
| `misconception_log` | array | logged errors, near-misses, collapsed explanations |
| `active_mode` | review / build / maintain | current learning phase for this topic |

Additional PowerShell scripts in `scripts/`:
- `update-thesis-monitor.ps1` - updates `monitor_status` and `monitor_last_review` across thesis notes
- `update-thesis-scorecards.ps1` - applies machine-managed thesis monitoring, conviction, and allocation suggestion fields, including `-ApplySignals` and `-DryRun`

### API Keys

Required keys are in `.env` (never commit). Run `node run.mjs status` to check. Key pullers and their requirements:

| Puller | Key Variable | Required? |
|--------|-------------|-----------|
| fred | `FRED_API_KEY` | Yes |
| bea | `BEA_API_KEY` | Yes |
| eia | `EIA_API_KEY` | Yes |
| newsapi | `NEWSAPI_API_KEY` | Yes |
| sam | `SAM_GOV_API_KEY` | Yes |
| fmp | `FINANCIAL_MODELING_PREP_API_KEY` | Yes |
| uspto | `PATENTSVIEW_API_KEY` | Yes |
| treasury, openfema, usaspending, clinicaltrials, arxiv, pubmed, sec, cboe, nahb, federalregister | None | No |
| osint-spiderfoot | `SPIDERFOOT_API_KEY` | No (enhances some modules) |
| otx | `OTX_API_KEY` | Yes (free — register at otx.alienvault.com) |
| opencorporates | `OPENCORPORATES_API_KEY` | No (free tier available) |
| vesselfinder | `VESSELFINDER_API_KEY` | Yes (for automated pulls) |
| reddit | `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` | No (public API works without; OAuth unlocks 60 req/min) |
| osint-telegram | `TELEGRAM_API_ID` + `TELEGRAM_API_HASH` | Yes — register at my.telegram.org/apps |
| osint-leaker | None (some underlying DBs have optional keys) | No |
| osint-octosuite | `GITHUB_TOKEN` | No (optional; raises rate limit from 60→5000 req/hr) |
| osint-merklemap | None | No |
| osint-columbus | None | No |
| osint-snscrape | None | No |
| osint-umbra | None | No |
| osint-osmsearch | None | No |

## InfraNodus Integration

Graph measurement workflow is documented in `04_Reference/InfraNodus Graph Measurements.md`.

- Run `node run.mjs infranodus --path <scope>` to generate a graph session note
- Sessions are saved to `07_Playbooks/Graph_Sessions/`
- Best scopes: `10_Theses/`, `08_Entities/`, `09_Macro/`, `05_Data_Pulls/<domain>/`
- Plugin defaults: Wiki Links Prioritized for folders, Wiki Links + Concepts for single notes

## Retired Quant Layer

Qlib and QCPM have been removed from the active vault. Do not add `qlib_*` thesis frontmatter, `05_Data_Pulls/Quant/` notes, or `node run.mjs quant` workflows unless the quant layer is intentionally rebuilt.

## Signal System

Pull notes fire signals at 4 severity levels: `clear`, `watch`, `alert`, `critical`. The Signal Board dashboard (`00_Dashboard/Signal Board.md`) aggregates all non-clear signals. Discrete signal notes in `06_Signals/` document significant events with implications and related domains.

## Dashboards

All dashboards use Dataview queries against frontmatter fields. They render automatically in Obsidian with the Dataview plugin enabled. Key dashboards:

- **Signal Board** - Active alerts and watch items across all domains
- **Catalyst Radar** - Symbol-level catalyst notes that combine thesis monitoring, earnings timing, and technical state
- **Full Picture Reports** - Generated thesis synthesis notes that combine structural thesis state with tape, macro, and fundamentals
- **Cross-Domain Thesis Board** - Multi-domain signal convergence
- **Capital Allocation Board** - Thesis rankings, conviction, sizing guidance, catalysts
- **High Priority Thesis Monitor** - Weekly review surface for highest-conviction theses
- **Data Freshness Monitor** - Stale data detection
- **Macro Regime Tracker** - Rate, labor, inflation, GDP data
- **Network Graph** - Entity connectivity and orphan detection
- **InfraNodus Measurements** - Graph session entry point and hub/bridge analysis
- **Company Risk Board** - Active watchlist sorted by risk score, recent events feed, pattern exposure heatmap
- **Company Risk Patterns** - Pattern library, entity network, transaction log, risk score distribution

## Dashboard

A local operator dashboard runs at `http://localhost:3737` via `node run.mjs dashboard`.

It reads vault files directly (no separate sync) and provides seven panels:

| Panel | Content |
|-------|---------|
| Signal Board | All signal notes grouped by severity (critical/alert/watch/clear) |
| Thesis Status | 21 theses sorted by allocation rank with conviction and monitor status |
| Pull Health | Per-source staleness grid (green=today, yellow=1-2d, red=3+d or never) |
| Technical Risk | Latest FMP technical snapshots with bias, RSI, and moving-average damage |
| Earnings Calendar | Latest FMP earnings calendar range with upcoming rows and catalyst timing |
| Data Collection | Quick-action buttons + per-puller buttons with live SSE output stream |
| Live Terminal | Streams stdout/stderr from spawned puller commands in real time |

API endpoints (all served from the same port):
- `GET /api/theses`, `/api/signals`, `/api/signal-board`, `/api/pull-health`, `/api/technical-risk`, `/api/earnings-calendar`, `/api/status`
- `POST /api/run` - spawn a command, returns `{ jobId }`
- `GET /api/stream/:jobId` - Server-Sent Events stream of job output

Set `DASHBOARD_PORT` to use a port other than `3737`.

## Potential Roadmap

### Near Term

- Extend thesis notes and dashboards with more FMP-derived valuation, trend, and catalyst fields.
- Continue monitoring `sector-scan` live runs and only tighten routing where repeated noise appears.
- Extend the active FMP surface with richer valuation, catalyst, and cross-basket coverage where it improves operator speed.

### Medium Term

- Extend the batch FMP watchlist-report workflow from thesis watchlists into sector baskets.
- Expand company-level catalyst notes into catalyst clustering and sector-level aggregation.
- Improve report generation speed by leaning harder on FMP batch endpoints and cached fundamentals.
- Expand operator boards around conviction momentum, catalyst clustering, and technical deterioration.

### Later / Optional

- Evaluate a structured paid news source to improve company-specific and thesis-specific routing beyond generic headline pulls.
- If FMP is later upgraded beyond Premium, add transcript workflows, ETF holdings, 13F ownership, and broader global comparison surfaces.
- Build more formal portfolio-monitoring and capital-allocation automation on top of the conviction and signal layers.

## Validation

Run `node run.mjs validate` before committing. The validator checks required frontmatter fields, category alignment, boolean types, valid signal statuses, and thesis FMP summary fields.

## Immutability

When working with vault data, always create new notes rather than overwriting existing pull notes. Pull notes are timestamped snapshots, so historical data is preserved rather than updated in place.
