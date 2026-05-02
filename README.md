# My_Data

High-level overview and current status for the My_Data investment research vault.

This vault is an Obsidian-based research engine for housing, biotech, defense, energy, macro, and cross-domain thesis work. It combines structured notes, automated data pulls, signal detection, dashboards, graph analysis, OSINT scanning, company risk monitoring, and thesis tracking into a single operating environment. Learning content lives in the separate `Dr_Magnifico` vault, KB content lives in the separate `Oy` vault, and FMP Premium is the active financial-data backbone.

## Current State

- `8` MOC files provide the top-level navigation layer (7 domain MOCs + `moc-company-risk`).
- `16` dashboards provide the main operator surfaces, including Company Risk and OSINT panels.
- `19` canonical templates live in `03_Templates/` (including 5 Company Risk templates).
- `21` active thesis notes are tracked in `10_Theses/`.
- `35` active puller scripts live in `scripts/pullers/`, including `sector-scan` and 11 OSINT/social scanners.
- `10` KB scripts live in `scripts/kb/` — the intake-to-wiki pipeline.
- `88` active source definitions across 17 categories in `01_Data_Sources/`.
- Daily routine is split into daily and weekly cadences via `daily-routine.ps1`.
- Validation, cleanup, retention, and scorecard maintenance are all wired into the CLI.

## Completed So Far

- Built the vault structure, schema system, templates, MOCs, dashboards, and CLI pull framework.
- Implemented the thesis-driven signal system with pull notes, signal notes, and Dataview aggregation.
- Brought `sector-scan` live with sector evidence collection, thesis routing, signal writing, emerging-pattern stubs, and bridge-note support.
- Added `conviction-delta` plus signal-aware thesis scorecard updates to support rolling conviction and allocation suggestions.
- Recalibrated sector routing to cut broad false positives, exclude bridge theses from active routing, and reduce default stub churn.
- Added sector-specific SEC snapshot handling so sector evidence stays stable and reviewable.
- Retired the local Qlib/quant layer; it can be reinstalled later only if a concrete use case returns.
- Integrated InfraNodus graph-session generation for structural analysis across notes and folders.
- Upgraded the active financial-data workflow to FMP Premium.
- Added `fmp --quote`, `fmp --technical`, `fmp --earnings-calendar`, and `fmp --thesis-watchlists`.
- Added thesis-level `thesis-fmp-sync` to project FMP tape and catalyst data into thesis frontmatter.
- Added `thesis-catalysts` plus the Catalyst Radar dashboard for symbol-level catalyst review.
- Added `thesis-full-picture` plus the Full Picture Reports dashboard for one-note structural + tactical synthesis.
- Added `macro-bridges` to normalize Debt/GDP, DXY proxy, Defense Budget proxy, Gold, and Bitcoin into a shared bridge note.
- Added operator dashboard (`node run.mjs dashboard`) with Signal Board, Thesis Status, Pull Health, Technical Risk, Earnings Calendar, and live Data Collection panels.
- Added OSINT intelligence layer: 21 source notes in `01_Data_Sources/OSINT/`, 11 `scan osint-*` CLI commands, outputs to `05_Data_Pulls/osint/`.
- Built Company Risk system in `12_Company_Risk/`: Companies, Events, Patterns, Entities, Transactions subfolders; 5 templates; 2 dashboards; `company-risk-scan` puller.
- Built KB subsystem in `12_Knowledge_Bases/`: 10-script pipeline (`kb ingest → normalize → classify → compile → query`) plus `kb librarian`, `kb health`, `kb suggest`, `kb transcribe`, `kb dispatch`.
- Restructured `daily-routine.ps1` into daily + weekly cadences. Daily covers macro/market, SEC thesis, FMP watchlists, sector-scan, and company-risk. Weekly (`-IncludeWeekly`) adds FEMA, USASpending, FDA, clinical trials, USPTO, arXiv, PubMed, NewsAPI, and full company-risk score updates.
- Added Reddit and Telegram social scanners wired into the CLI pull system.
- Wired KB raw mirroring into the pull system via `scripts/lib/kb-bridge.mjs`. Every pull note written to `05_Data_Pulls/` is automatically mirrored to `12_Knowledge_Bases/raw/{kind}/` (Macro→datasets, Government→articles, Science→papers, etc.). `kb compile` deletes the raw copy after the wiki page is written.

## Project Structure

```text
000-moc/              8 Master of Content navigation files — start here
00_Dashboard/         16 primary Dataview dashboards — main operator surfaces
01_Data_Sources/      88 active source definitions across 17 categories (including OSINT/)
03_Templates/         19 canonical note templates
04_Reference/         Schema docs, pull guides, graph conventions, source overview boards
05_Data_Pulls/        Timestamped pull notes from API pullers and synthesis workflows
06_Signals/           Discrete signal event notes
07_Playbooks/         Operating playbooks and Graph Sessions subfolder
08_Entities/          Stocks, sectors, countries, commodities, ETFs, currencies
09_Macro/             Macro indicators (17) and regime notes (9)
10_Theses/            21 active investment theses and bridge notes
11_Learning/          Moved to Dr_Magnifico; scripts still route there through LEARNING_VAULT_ROOT
12_Company_Risk/      Company Risk Intelligence — Companies, Events, Patterns, Entities, Transactions
12_Knowledge_Bases/   Moved to Oy; KB scripts still run from this vault through KB_VAULT_ROOT
500-archive/          Retired or deprioritized material — do not link from active notes
scripts/              CLI pullers, KB scripts, maintenance, validation, and helpers
```

## What Works Today

- `node scripts/run.mjs status`
  Verifies configured providers and environment readiness.
- `node scripts/run.mjs validate`
  Validates frontmatter contracts and vault health.
- `node scripts/run.mjs dashboard`
  Live operator dashboard: signal board, thesis status, pull health, technicals, earnings, data collection.
- `powershell scripts/daily-routine.ps1`
  Runs the main automated pull-and-review pipeline (daily cadence).
- `powershell scripts/daily-routine.ps1 -IncludeWeekly`
  Adds weekly sources: FDA, clinical trials, USPTO, arXiv, PubMed, NewsAPI, full company-risk updates.
- `node scripts/run.mjs sector-scan`
  Pulls sector evidence, routes findings into theses, writes confirms/contradicts.
- `node scripts/run.mjs conviction-delta`
  Builds rolling thesis conviction summaries from sector-scan signals.
- `powershell scripts/update-thesis-scorecards.ps1 -ApplySignals`
  Applies machine-managed thesis monitoring and suggestion fields.
- `node scripts/run.mjs fmp --quote SPY`
  Pulls current market quote snapshots through FMP.
- `node scripts/run.mjs fmp --technical SPY`
  Builds technical state notes from FMP price history.
- `node scripts/run.mjs fmp --earnings-calendar`
  Pulls earnings calendar data for watchlist and catalyst workflows.
- `node scripts/run.mjs fmp --thesis-watchlists`
  Warms FMP fundamentals cache and generates thesis-basket coverage notes.
- `node scripts/run.mjs thesis-fmp-sync`
  Projects FMP tape and catalyst data into thesis frontmatter fields.
- `node scripts/run.mjs thesis-catalysts`
  Generates symbol-level catalyst notes; feeds Catalyst Radar dashboard.
- `node scripts/run.mjs thesis-full-picture`
  Synthesizes structural + tactical thesis summary; feeds Full Picture Reports dashboard.
- `node scripts/run.mjs macro-bridges`
  Normalizes Debt/GDP, DXY proxy, Defense Budget, Gold, and Bitcoin into a shared bridge note.
- `node scripts/run.mjs scan osint-spiderfoot` (and other `scan osint-*` variants)
  Runs passive OSINT scans; output to `05_Data_Pulls/osint/`.
- `node scripts/run.mjs kb ingest`
  Ingests raw source material into `12_Knowledge_Bases/raw/`.
- `node scripts/run.mjs kb normalize / classify / compile / query`
  Runs subsequent KB pipeline stages through to searchable wiki output.
- `node scripts/run.mjs kb librarian / health / suggest / transcribe`
  KB maintenance: lint, integrity checks, gap analysis, meeting extraction.

## Potential Next Steps

- Evaluate a structured paid news source to improve company-specific and thesis-specific routing beyond generic headline pulls.
- If FMP is later upgraded beyond Premium, add transcript workflows, ETF holdings, 13F ownership, and broader global comparison surfaces.
- Build more formal portfolio-monitoring and capital-allocation automation on top of the conviction and signal layers.
- Expand OSINT active-scan coverage and integrate scan outputs into thesis routing.

## Key Docs

- `README.md`
  Canonical high-level overview and current project status.
- `CLAUDE.md`
  Compatibility shim for Claude-style tooling. Defers to `AGENTS.md` as the canonical operating guide.
- `AGENTS.md`
  Canonical operating instructions and full project map for work inside the vault.
- `04_Reference/Pull_System_Guide.md`
  Pull-system command reference and routine workflow details.
- `04_Reference/Vault_Schemas.md`
  Frontmatter schemas and validation contracts.
- `11_Learning/01_Domains/Deep Dive Resources.md`
  Curated domain-balanced tracks (8 domains) for deeper study. Use only when triggered by retrieval failures, recurring nodes, or project depth needs — not as the daily default.
- `11_Learning/01_Domains/Learning Agent Instructions.md`
  V2 operating guide for the Adaptive Generalist System — 8-step Daily Engine, due-review-queue-first workflow, project scarcity rules, domain balance rule, and anti-drift instructions.
- `11_Learning/00_Dashboard/Mastery_Dashboard.md`
  Live learning dashboard — Due Today queue, Build Targets, Project Health (conflict alert), Domain Balance scoreboard, Graph Activity, Link Integrity.
- `11_Learning/00_Dashboard/Link_Integrity_Report.md`
  Broken link catalogue and project conflict log. Updated by `learning-link-audit.ps1`.

## Notes

- Pull notes are immutable snapshots. New data should be written as new notes, not by overwriting old pull notes.
- Specialist sources like SEC, FRED, Treasury, USASpending, FDA, PubMed, and arXiv remain important source-of-truth systems even as FMP is the main financial-data backbone.
- OSINT scan scripts require local tool installation (SpiderFoot, theHarvester, Amass, Recon-ng) or passive API keys — see each source note in `01_Data_Sources/OSINT/` for prerequisites.
