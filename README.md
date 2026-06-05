# My_Data

`My_Data` is the execution engine and active report/research vault for an Obsidian-based investment research system. It runs the pullers, signal logic, thesis monitoring, data freshness tracking, dashboards, generated reports, research review surfaces, KB routing, and validation that support the broader research workflow.

`World_Machine` is now intentionally narrow: it keeps the living Market Positioning Ledger and approved packet-writer surface only. `The Research Spine` is retained as a soft archive for historical reports and links.

Scheduled automation is intentionally narrow: it may run My_Data report/update generation and local analysis synthesis from existing evidence. World_Machine scheduled work is limited to approved packet-writer jobs; `bridge ingest-world-inbox` stays manual with dry-run first. Raw source acquisition pullers such as FMP, FRED, GDELT, CBOE, Treasury, SEC, NewsAPI, arXiv, PubMed, ClinicalTrials, and sector or company scans are manual unless explicitly run by the user.

## What This Vault Does

- Pulls market, macro, government, science, news, OSINT, and company-risk evidence.
- Writes immutable pull notes to `05_Data_Pulls/`.
- Creates discrete signal notes in `06_Signals/`.
- Maintains thesis, catalyst, full-picture, and conviction monitoring.
- Produces canonical strategy, thesis, and market-cycle signal intelligence.
- Routes clean reporting, update, and research-review output into `My_Data`.
- Mirrors pull notes into KB raw folders for later wiki compilation.
- Validates frontmatter contracts and folder conventions.

## Current Core Commands

Run commands from `scripts/`:

```powershell
cd "C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\scripts"
```

| Task | Command |
|---|---|
| Show CLI help | `node run.mjs help` |
| Validate vault schemas | `node run.mjs system validate` |
| Check data readiness preflight | `node run.mjs system readiness --cadence <daily|premarket|midday|preclose|eod>` |
| Run manual full daily pull cadence | `node run.mjs routine daily` |
| Dry-run manual full daily pull cadence | `node run.mjs routine daily --dry-run --skip-validate` |
| List configured cadences | `node run.mjs cadence list` |
| Dry-run scheduled review/analysis cadence | `node run.mjs cadence run premarket --dry-run` |
| Dry-run Windows review/analysis tasks | `.\install-data-freshness-tasks.ps1 -DryRun` |
| Register Windows review/analysis tasks | `.\install-data-freshness-tasks.ps1` |
| Run canonical signal layer | `node run.mjs pull signal-intelligence --scope all` |
| Dry-run Neo4j BOD/EOD metric snapshots | `node run.mjs pull neo4j-fmp-metric-snapshots --cadence eod --tickers AAPL,MSFT,NVDA --dry-run --json` |
| Run portfolio health scan | `node run.mjs pull portfolio-health --file "C:\path\to\positions.csv"` |
| Run positioning checklist synthesis | `node run.mjs pull positioning-checklist --preset workbook-core --dry-run --json` |
| Generate My_Data reports | `node run.mjs pull my-data-report-flow --all` |
| Compatibility report alias | `node run.mjs pull research-spine-flow --all` |
| Run My_Data report/update bridge | `node run.mjs bridge my-data-report-pull --dry-run` |
| Consolidate old World_Machine content | `node run.mjs bridge consolidate-world-machine --dry-run` |
| Audit Research Spine without writes | `node run.mjs system audit-research-spine --dry-run --no-inbox` |
| Generate dashboard manifest | `node run.mjs system dashboard-manifest generate --dry-run` |
| Update market-cycle status | `node run.mjs pull market-cycle-monitor` |
| Run streamline report | `node run.mjs pull streamline-report` |
| Run FMP thesis watchlists | `node run.mjs pull fmp --thesis-watchlists` |
| Run manual forensic risk screen | `node run.mjs pull forensic-risk --symbols AAPL,MSFT --dry-run` |
| Export Neo4j blind-spot graph package | `node run.mjs pull neo4j-blind-spot-graph --dry-run --json` |
| Run FMP cancellation archive dry-run | `node run.mjs pull fmp-harvest --stage all --scope hybrid --dry-run --json` |
| Run FMP historical price bulk archive | `node run.mjs pull fmp-harvest --stage prices-bulk --from 2020-06-01 --to 2026-06-01 --resume` |
| Run api.data.gov agency starter pulls | `node run.mjs pull api-data-gov --agency all --dry-run` |
| Run event scenario research | `node run.mjs pull event-research --scenario fertilizer-shortage --dry-run --handoff-limit 12` |
| Dry-run manual World_Machine inbox archive processor | `node run.mjs bridge ingest-world-inbox --dry-run` |
| Rebuild an inbox batch synthesis from archive | `node run.mjs bridge ingest-world-inbox --from-archive --date YYYY-MM-DD --update-existing` |
| Import inbox ingestion batch into Neo4j | `node run.mjs pull neo4j-inbox-ingestion --date YYYY-MM-DD --dry-run --json` |
| Run registry FMP screeners | `node run.mjs pull fmp-screener-batch --preset all --dry-run` |
| Run Semantic Scholar research pull | `node run.mjs pull semantic-scholar --query "market liquidity funding" --top-cited` |
| Build thesis full picture | `node run.mjs thesis full-picture` |
| Run sector scan | `node run.mjs scan sectors` |
| Run company-risk watchlist | `node run.mjs scan company-risk --watchlist` |

## Data Readiness Preflight

Before generating any daily, premarket, preclose, EOD, monitoring, or briefing report, run from `scripts/`:

```powershell
node run.mjs system readiness --cadence <daily|premarket|midday|preclose|eod>
```

`READY` means report generation may proceed. `WARN` means proceed only where policy allows and carry the warning context into the output. `BLOCKED` means required inputs are stale or missing; stop until refreshed or the user explicitly approves an override.

Policy: `midday` may proceed on `WARN`; `daily`, `premarket`, and `eod` block on stale required inputs; `preclose` blocks only for required market/vol inputs and warns on stale supporting inputs. Do not use `--stale-ok` or `--allow-stale` without explicit user approval.

## Review Queue Retirement

Generated review queues are retired. `my-data-report-flow`, `research-spine-flow`, `knowledge-gap-tasks`, and `ingest-world-inbox` must not create or update `My_Data/_Inbox/Review Queue.md` or `World_Machine/_Inbox/Review Queue.md`.

Review candidates belong in reports, triage packets, JSON sidecars, dry-run output, or the active chat until the user approves a specific write. `--no-inbox` is compatibility language only.

## Windows Scheduled Tasks

From `scripts/`, install or refresh the review/analysis schedule:

```powershell
.\install-data-freshness-tasks.ps1 -DryRun
.\install-data-freshness-tasks.ps1
```

Registered tasks run as the logged-in Windows user, require network availability, and write logs to `logs/scheduled-cadences/`.

These tasks use `99_System/config/cadences.json`, which is restricted to local-evidence analysis and My_Data report output. They do not run raw source pullers. Run raw source pullers manually when you want fresh data.

Live `node run.mjs cadence run <name>` calls readiness first. `BLOCKED` stops unless the user explicitly approves `--allow-stale`; `WARN` can proceed, with `midday` as the normal policy-allowed warning cadence.

Neo4j metric snapshot BOD/EOD cadences are defined separately in `99_System/config/neo4j-metric-cadences.json`. They call Financial Modeling Prep and remain manual-only unless explicitly promoted later.

Schedule:

| Time | Task |
|---|---|
| Mon-Fri 07:00 | `node run.mjs cadence run premarket` - review/analysis only |
| Mon-Fri 09:45 | `node run.mjs cadence run daily` - review/analysis only |
| Mon-Fri 12:30 | `node run.mjs cadence run midday` - review/analysis only |
| Mon-Fri 15:30 | `node run.mjs cadence run preclose` - review/analysis only |
| Mon-Fri 16:30 | `node run.mjs cadence run eod` - review/analysis only |
| Mon-Fri 16:55 | `node run.mjs system validate` |

The former weekly deep refresh is retired from the scheduled installer. Use `node run.mjs routine weekly` manually when a broad source refresh is needed. `WM-Routine-S1..S6` also stay unregistered; the six-slot runner is manual/experimental until synthesis errors are repaired.

World_Machine approved packet writing is installed separately through `install-inbox-ingest-tasks.ps1`, which runs `invoke-inbox-ingest.ps1` at 09:00, 12:00, and 17:00 as `My_Data - World Packet Writer 0900/1200/1700`. `node run.mjs bridge ingest-world-inbox` is a manual archive processor: dry-run first, then live only when processable inbox items exist and the user authorizes it. Use `node run.mjs bridge ingest-world-inbox --from-archive --date YYYY-MM-DD --update-existing` to rebuild the generated synthesis from archived inbox items without moving files again. When a generated batch includes a `Neo4j Transfer Block`, import it manually with `node run.mjs pull neo4j-inbox-ingestion --date YYYY-MM-DD --dry-run --json`; live mode writes only reviewable graph nodes and `CandidateLink` proposals.

## Canonical Signal Intelligence

The canonical signal layer is the current shared signal surface for strategies, theses, and market cycles.

It writes:

- `05_Data_Pulls/Signals/YYYY-MM-DD_Signal_Intelligence.md`
- `12_Knowledge_Bases/raw/signals/YYYY-MM-DD_Signal_Intelligence.md`
- `scripts/.cache/signal-intelligence/YYYY-MM-DD.json`

It is designed to appear in daily monitoring and briefing reports, along with deeper-dive references from vault notes, research papers, and news/feed artifacts.

Run:

```powershell
node run.mjs pull signal-intelligence --scope all
```

## Multi-Vault Architecture

| Vault | Role |
|---|---|
| `My_Data` | Engine and report vault: scripts, sources, pulls, signals, theses, reports, research review surfaces, validation |
| `World_Machine` | Narrow surface: `_Inbox` with the Market Positioning Ledger plus inbox ingestion; generated artifacts stay under `500-archive/` |
| `The Research Spine` | Soft archive: historical briefings, monitoring snapshots, freshness notes, references, and review context |
| `Dr_Magnifico` | Learning vault, routed by `LEARNING_VAULT_ROOT` |
| `Oy` | Knowledge base vault, routed by `KB_VAULT_ROOT` |

`REPORTS_VAULT_ROOT`, `WORLD_MACHINE_ROOT`, `RESEARCH_VAULT_ROOT`, `LEARNING_VAULT_ROOT`, and `KB_VAULT_ROOT` are configured through `.env`. Report output defaults to `My_Data`; use `REPORTS_VAULT_ROOT` for any report-root override. `REVIEW_VAULT_ROOT` is legacy compatibility language only. `WORLD_MACHINE_ROOT` is used only for the ledger, approved packet-writer, and manual inbox archive-processor exceptions.

## Main Folders

```text
000-moc/              Navigation notes
00_Dashboard/         Obsidian dashboards and operator boards
01_Data_Sources/      Source definitions
03_Templates/         Canonical note templates
04_Reference/         Schemas, pull guides, graph conventions
05_Data_Pulls/        Immutable generated pull notes
06_Signals/           Discrete signal notes
07_Playbooks/         Operating playbooks and graph sessions
08_Entities/          Stocks, sectors, countries, commodities, ETFs, currencies
09_Macro/             Macro indicators and regimes
10_Theses/            Investment theses and thesis map
12_Company_Risk/      Company risk intelligence system
12_Knowledge_Bases/   KB raw mirror/routing area
90_System/            Audits, command inventory, migration manifests
500-archive/          Retired or deprioritized material
scripts/              Automation and tests
```

## My_Data Report Output

Generate the reporting layer with:

```powershell
node run.mjs pull my-data-report-flow --all
```

The compatibility command `node run.mjs pull research-spine-flow --all` still works, but new generated review output routes to `My_Data`. It should contain summaries, links, freshness notes, references, prompts, and review candidates inside reports or sidecars. It should not contain raw API dumps or generated review queues.

## Fresh Chat Anchor

For a new Codex chat, tell the agent to start in `C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\scripts`, read `../AGENTS.md`, `../README.md`, `../AGENT_RUNBOOK.md`, and `../../World_Machine/AGENTS.md`, then verify live state before writing. The critical boundary is: My_Data executes; World_Machine reasons and owns the Market Positioning Ledger; generated review queues are retired; judgment items stay in reports, triage packets, sidecars, dry-runs, or chat until approved.

World_Machine is limited to:

- `_Inbox/Market Positioning Ledger.md`
- `_Inbox/` and `500-archive/Inbox/`
- `500-archive/Stale/`
- `500-archive/Inbox/Event_Connections/`
- `Reports/Inbox Reports/*Inbox Ingestion Batch*`

## Agent-Neutral Phase D Ledger Bootstrap

Phase D was completed on 2026-06-03 without API keys or provider-specific nested CLI calls. The reasoning artifacts were generated in chat and saved to `../World_Machine/Reports/Regime/2026-06-03-regime-card.*` and `../World_Machine/Reports/Regime/2026-06-03-thesis-draft.*`; the deterministic commit path then populated the World_Machine Market Positioning Ledger.

From `My_Data`, use this only after the regime/thesis JSON artifacts have been reviewed and approved:

```powershell
node scripts/agents/regime-bootstrap.mjs --stage=commit
```

Phase 1 has started: the seeded ledger rows' Watchpoint cells now link to their matching Position blocks under the narrow World_Machine policy, and `node run.mjs pull market-positioning-outcomes` provides the agent-neutral outcome/calibration loop. Use `--dry-run --json` to generate a review packet and `--apply <approved-json>` to write approved labels back to the ledger plus `_state/calibration.json`, without API keys.

## Validation
Use this before calling schema-sensitive work complete:

```powershell
node run.mjs system validate
```

Focused tests commonly used for the signal/report layer:

```powershell
node --test scripts/tests/signal-intelligence.test.mjs
node --test scripts/tests/report-context.test.mjs scripts/tests/market-cycle-monitor.test.mjs scripts/tests/confluence-scan.test.mjs
```

## Agent Docs

- `AGENTS.md` is the canonical operating guide for agents.
- `CLAUDE.md` is a compatibility shim for Claude-style tooling.
- `README.md` is the operator-facing overview.

If these files conflict, follow `AGENTS.md`.


