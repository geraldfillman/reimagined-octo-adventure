---
title: Pull System Guide
type: reference
tags: [reference, system, data-pulls, guide]
last_updated: 2026-04-27
---

# Pull System Guide

Summary:
- Reference for the live CLI surface in `scripts/run.mjs`.
- Use this for command syntax, the morning sequence, and the weekly conviction workflow.

## Quick Start

Run commands from the `scripts/` directory in PowerShell:

```powershell
Set-Location "C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\scripts"
node run.mjs help                        # compact overview
node run.mjs <group> --help              # group detail (scan, thesis, pull, quant, kb, ...)
node run.mjs system status               # API key status
node run.mjs <group> <command> [flags]   # main grammar
```

**Command groups:** `system` · `learn` · `scan` · `thesis` · `pull` · `playbook` · `quant` · `kb`

Full command inventory with side-effect classification: [[90_System/CLI Command Audit]]

The CLI loads `.env` from the vault root:

```text
C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\.env
```

## Daily Automation

Run the canonical daily cycle:

```powershell
node run.mjs routine daily
```

The PowerShell wrapper uses the same routine command:

```powershell
powershell scripts/daily-routine.ps1
```

Useful variants:

```powershell
powershell scripts/daily-routine.ps1 -DryRun
powershell scripts/daily-routine.ps1 -SkipSectorScan
powershell scripts/daily-routine.ps1 -IncludeWeekly
```

Routine cadences:

```powershell
node run.mjs routine daily
node run.mjs routine weekly
node run.mjs routine monthly
node run.mjs routine quarterly
node run.mjs routine yearly
```

The daily routine runs:
1. `node run.mjs system status`
2. The morning sequence (see below)
3. `node run.mjs scan sectors`
4. `node run.mjs scan company-risk --watchlist`
5. `node run.mjs pull agent-analyst --all-thesis --limit 8 --skip-llm`
6. `node run.mjs system cleanup --market-history --signals`
7. `node run.mjs system validate`

After the script completes, follow the review checklist in [[07_Playbooks/Daily_Routine]].

## Morning Sequence

```powershell
# Macro and market
node run.mjs pull fred --group rates
node run.mjs pull fred --group housing
node run.mjs pull fred --group labor
node run.mjs pull fmp --quote SPY
node run.mjs pull entropy-monitor
node run.mjs pull treasury --yields

# Government and regulatory
node run.mjs pull openfema --recent
node run.mjs pull usaspending --recent
node run.mjs pull fda --recent-approvals
node run.mjs pull sec --thesis

# Clinical and patent intelligence
node run.mjs pull clinicaltrials --oncology
node run.mjs pull clinicaltrials --amr
node run.mjs pull uspto --ptab

# Research sources
node run.mjs pull arxiv --drones
node run.mjs pull arxiv --amr
node run.mjs pull pubmed --amr
node run.mjs pull pubmed --psychedelics

# News
node run.mjs pull newsapi --topic business
```

## Weekly Conviction Workflow

```powershell
node run.mjs scan conviction
powershell scripts/update-thesis-scorecards.ps1 -ApplySignals -DryRun
powershell scripts/update-thesis-scorecards.ps1 -ApplySignals
node run.mjs system infranodus --path 10_Theses/
node run.mjs playbook housing-cycle
```

## Agent Analyst Workflow

The agent analyst puller runs specialist market agents in parallel and writes one vault-native pull note. It does not use LangChain.

```powershell
node run.mjs pull agent-analyst --symbol SPY --skip-llm
node run.mjs pull agent-analyst --symbol AAPL --agents price,risk,fundamentals --skip-llm
node run.mjs pull agent-analyst --thesis "Housing Supply Correction" --limit 5 --skip-llm
node run.mjs pull agent-analyst --strategy "Simons Style Quant Momentum Breadth" --limit 5 --skip-llm
node run.mjs pull agent-analyst --all-strategies --limit 12 --skip-llm
node run.mjs pull agent-analyst --symbol SPY --agents prediction-market --live-prediction-markets --skip-llm
```

Default agents:
- `price`
- `risk`
- `sentiment`
- `microstructure`
- `macro`
- `fundamentals`
- `prediction-market`

Safety defaults:
- Prediction-market live APIs are off unless `--live-prediction-markets` is passed.
- LLM synthesis is optional. If no direct provider key is configured, deterministic synthesis is used.
- Entropy fields are diagnostic. Low entropy means move-risk or evidence compression, not directional certainty.
- The puller writes only `05_Data_Pulls/Market/` symbol notes and `05_Data_Pulls/Theses/` rollups.
- Strategy mode reads `10_Theses/Baskets/` notes tagged `strategy` and writes strategy rollups with `analysis_scope: strategy`.

## Entropy Monitor Workflow

The entropy monitor is a shadow ledger for testing whether low order-flow entropy on `SPY` and `QQQ` precedes larger absolute moves.

```powershell
node run.mjs pull entropy-monitor
node run.mjs pull entropy-monitor --symbols SPY,QQQ --dry-run
node run.mjs pull entropy-monitor --backtest
node run.mjs pull entropy-monitor --symbols SPY,QQQ --near-threshold 0.60 --low-threshold 0.50
```

What it does:
1. Pulls latest FMP 1-minute bars and quote snapshots for `SPY` and `QQQ`.
2. Computes the 15-state sign x volume transition entropy over the last 120 one-minute bars.
3. Appends or updates `scripts/.cache/entropy-monitor/entropy-monitor-ledger.csv`.
4. Settles prior observations when 5m, 15m, 30m, 60m, or 120m future bars are available.
5. Writes one daily pull note to `05_Data_Pulls/Market/` with current snapshots and movement-expansion summary.

Backtest mode:
1. Pulls the farthest 1-minute intraday history FMP returns for the selected symbols.
2. Computes rolling entropy observations at the requested sample step. Default is every 5 minutes.
3. Writes a dated CSV under `scripts/.cache/entropy-monitor/backtests/`.
4. Writes one `entropy_backtest` pull note into `05_Data_Pulls/Market/`.

Use rules:
- This is a monitor, not an active strategy.
- `near-low-watch` is a relative SPY/QQQ shadow threshold while the ledger builds history.
- Run it more than once during market hours when you want horizons to settle the same day; each later run can fill earlier 5m, 15m, 30m, 60m, and 120m outcome columns.
- Judge the signal by absolute movement expansion first, not direction.
- Require at least 20 to 30 settled observations per symbol before changing trading behavior.

## Agent Layer Browsing

The vault now has a non-destructive agent navigation layer at [[16_Agents/Agent Command Center]].

Rules:
- `16_Agents/` is an index layer, not canonical storage.
- Pull notes still write to `05_Data_Pulls/`.
- Source notes still live in `01_Data_Sources/`.
- Agent folders provide MOCs, Dataview dashboards, source views, and signal views by domain agent.
- New agent-generated notes may include optional `agent_owner` and `agent_scope` frontmatter for easier routing.

See [[04_Reference/Agent Layer Map]] for the full domain-agent routing table.

## Utilities And Playbooks

```powershell
node run.mjs help
node run.mjs system status
node run.mjs system validate
node run.mjs system cleanup --market-history --dry-run
node run.mjs scan conviction
node run.mjs scan conviction --window 14
node run.mjs scan sectors
node run.mjs scan sectors --sector tech
node run.mjs scan sectors --dry-run
node run.mjs scan sectors --new-thesis-only
node run.mjs playbook housing-cycle
```

Live notes:
- `scan sectors` is live and writes sector pull notes, routing signals, Draft stubs, and bridge-note candidates.
- `scan conviction` is live and writes `05_Data_Pulls/Sectors/YYYY-MM-DD_Conviction_Delta.md`.
- `update-thesis-scorecards.ps1 -ApplySignals` applies the rolling signal suggestions to thesis frontmatter.

## FMP Thesis Watchlists

```powershell
node run.mjs pull fmp --technical SPY
node run.mjs pull fmp --earnings-calendar --from 2026-04-01 --to 2026-04-05
node run.mjs pull fmp --thesis-watchlists --dry-run
node run.mjs pull fmp --thesis-watchlists --thesis "Housing Supply Correction"
node run.mjs pull macro-bridges
node run.mjs pull fmp --thesis-watchlists --include-baskets
node run.mjs thesis sync --dry-run
```

What the live watchlist workflow does:
1. Resolves thesis watchlists from `10_Theses/` `core_entities`.
2. Pulls a shared batch quote snapshot for the unique symbol universe.
3. Warms the local FMP fundamentals cache (profile, ratios, key metrics, and price-target summary) for the same symbol universe unless `--skip-fundamentals` is set.
4. Writes one technical snapshot note per symbol.
5. Writes a shared filtered earnings-calendar note for the selected watchlist range.
6. Writes one `watchlist_report` pull note per thesis or thesis basket, now including fundamentals coverage and valuation summary rows.
7. Re-runs `node run.mjs thesis-fmp-sync` unless `--skip-sync` is set.

Useful flags:
- `--thesis "<name>"` limits the run to one thesis name or path match.
- `--include-baskets` also includes thesis basket files under `10_Theses/Baskets/`.
- `--from` and `--to` define the earnings window for the shared catalyst note.
- `--interval` controls the technical snapshot interval. Default is `daily`.
- `--concurrency` limits how many per-symbol technical pulls run in parallel. Default is `3`.
- `--fundamentals-concurrency` limits how many cache-warming fundamentals pulls run in parallel. Default is `2` or the main concurrency value if lower.
- `--skip-fundamentals` leaves the existing fundamentals cache untouched when you want the faster tape-only path.
- `--dry-run` prints the selected thesis set and unique symbol universe without making API calls.
- `--skip-sync` leaves thesis frontmatter untouched after writing the pull notes.

## Thesis Catalyst Notes

```powershell
node run.mjs thesis catalysts --dry-run
node run.mjs thesis catalysts --thesis "Housing Supply Correction"
node run.mjs thesis catalysts --symbol DHI,LEN
node run.mjs thesis catalysts --include-baskets
node run.mjs thesis catalysts --all
```

What the catalyst workflow does:
1. Reads thesis watchlists plus the latest FMP technical, earnings-calendar, and watchlist-report notes.
2. Builds a symbol-level review context anchored on thesis priority, monitor status, tape state, and the next earnings date.
3. Writes one `catalyst_note` pull note per matching symbol into `05_Data_Pulls/Market/`.
4. Feeds `[[00_Dashboard/Catalyst Radar]]` for a compact review surface.

Useful flags:
- `--thesis "<name>"` limits note generation to one thesis match.
- `--symbol <CSV>` limits note generation to specific ticker(s).
- `--window <days>` changes the earnings look-ahead window. Default is `21`.
- `--include-baskets` includes thesis basket files under `10_Theses/Baskets/`.
- `--all` writes notes for every selected symbol, not just active catalysts.
- `--dry-run` prints the candidate set without writing notes.

## Thesis Full Picture Reports

```powershell
node run.mjs thesis full-picture
node run.mjs thesis full-picture --thesis "Housing Supply Correction"
node run.mjs thesis full-picture --include-baskets
node run.mjs thesis full-picture --dry-run
```

What the full-picture workflow does:
1. Reads the selected thesis watchlists plus the latest thesis frontmatter, market notes, macro notes, and cached FMP fundamentals.
2. Builds one synthesis view per thesis across structural state, quant state, tape, fundamentals, macro pulse, and catalyst timing.
3. Resolves macro indicators through direct series IDs, indicator-note aliases, grouped FRED pulls, BEA-style single-metric notes, and the local VIX bridge note when available.
4. Writes one `full_picture_report` pull note per matching thesis into `05_Data_Pulls/Theses/`.
5. Feeds `[[00_Dashboard/Full Picture Reports]]` for a compact thesis-level review surface.

Useful flags:
- `--thesis "<name>"` limits report generation to one thesis match.
- `--include-baskets` also includes thesis basket files under `10_Theses/Baskets/`.
- `--dry-run` prints the candidate set without writing reports.

## Disclosure Reality Reports

```powershell
node run.mjs pull disclosure-reality
node run.mjs pull disclosure-reality --tickers LDOS,ONTO,RGTI,FLNC,NBIX,STRL,SOUN,RCAT,SPIR --lookback 45
node run.mjs pull disclosure-reality --thesis defense --lookback 45
node run.mjs pull disclosure-reality --sector technology --include-risk
node run.mjs pull disclosure-reality --all --limit 25
```

What the disclosure-reality workflow does:
1. Pulls recent EDGAR 8-K disclosures for a thesis, sector, explicit ticker list, or starter universe.
2. Scores filings as a pre-read queue using 8-K item mix, attached exhibits, and risk overlays such as unregistered securities or contract termination.
3. Writes one `disclosure_reality_check` pull note into `05_Data_Pulls/Fundamentals/`.
4. Adds a counterparty-confirmation checklist so promising disclosures can be verified through USASpending, SAM.gov, FDA, ClinicalTrials.gov, FERC, EIA, customer filings, or other external proof.

Useful flags:
- `--tickers <CSV>` scans an explicit ticker basket.
- `--thesis "<name>"` resolves tickers from thesis watchlists.
- `--sector <name>` scans symbols from local stock entity sector metadata.
- `--all` uses the local stock entity universe.
- `--lookback <days>` changes the EDGAR lookback window. Default is `30`.
- `--min-score <n>` filters the queue. Default is `1`.
- `--limit <n>` caps the report length. Default is `20`.
- `--include-risk` includes negative-score risk-first disclosures.
- `--dry-run` prints the selected ticker universe without writing a note.

## Bioengineered Food Systems

```powershell
node run.mjs pull biofood
node run.mjs pull biofood --lookback 120 --limit 20
node run.mjs pull biofood --tickers CTVA,ADM,BG,IFF,FMC,TSN,BYND,DNA,TWST,TMO
node run.mjs pull biofood --research-only
node run.mjs pull biofood --markets-only
node run.mjs pull biofood --regulatory-only
```

What the biofood workflow does:
1. Pulls PubMed and arXiv research velocity for cellular agriculture, cultivated meat, precision fermentation, microbial protein, gene-edited crops, and synthetic-biology food systems.
2. Pulls openFDA food enforcement records as a food-safety and regulatory-risk pulse.
3. Pulls FMP quote/profile context for the public watchlist.
4. Pulls recent SEC filings for the public watchlist to catch material agreements, financing risk, operating updates, shelves, and prospectus activity.
5. Writes one `bioengineered_food_systems` pull note into `05_Data_Pulls/Biotech/`.

Default watchlist:
- `CTVA`, `ADM`, `BG`, `IFF`, `FMC`, `TSN`, `BYND`, `DNA`, `TWST`, `TMO`

Useful flags:
- `--tickers <CSV>` overrides the default public watchlist.
- `--lookback <days>` changes the research/regulatory/filing window. Default is `120`.
- `--limit <n>` caps rows per evidence layer. Default is `15`.
- `--research-only`, `--markets-only`, and `--regulatory-only` run a narrower evidence layer.
- `--dry-run` prints the report without writing a note.

## Grid Equipment Bottleneck

```powershell
node run.mjs pull eia --all
node run.mjs pull fred --group rates
node run.mjs pull macro-bridges
node run.mjs pull fmp --thesis-watchlists --thesis "Grid Equipment Bottleneck"
node run.mjs thesis catalysts --thesis "Grid Equipment Bottleneck"
node run.mjs thesis full-picture --thesis "Grid Equipment Bottleneck"
node run.mjs pull disclosure-reality --tickers ETN,GEV,HUBB,POWL,PWR,MTZ,STRL,MYRG,AMSC,WCC --lookback 60
node run.mjs pull filing-digest --tickers ETN,GEV,HUBB,POWL,PWR,MTZ,STRL,MYRG,AMSC,WCC --lookback 30
node run.mjs pull dilution-monitor --tickers ETN,GEV,HUBB,POWL,PWR,MTZ,STRL,MYRG,AMSC,WCC --lookback 90
node run.mjs pull opportunity-viewpoints --thesis "Grid Equipment"
```

What the thesis-pack workflow does:
1. Uses EIA, FRED, and macro bridge pulls to refresh demand, grid stress, and rate context.
2. Uses FMP thesis watchlists, catalyst notes, and full-picture reports to refresh tape, fundamentals, earnings, and thesis state.
3. Uses disclosure-reality and filing-digest to find backlog, contract, customer, project-award, margin, and risk language in SEC filings.
4. Uses dilution-monitor as a quality gate for smaller or higher-beta equipment names.
5. Uses opportunity-viewpoints to rank core compounders, backlog beneficiaries, small/mid-cap edge names, and valuation-risk names.

Default watchlist:
- `ETN`, `GEV`, `HUBB`, `POWL`, `PWR`, `MTZ`, `STRL`, `MYRG`, `AMSC`, `WCC`

Useful review lens:
- Treat utilities and power producers as demand confirmation, not core holdings for this thesis.
- Promote conviction only when backlog, margin, lead-time, and disclosure evidence converge.
- Use explicit ticker lists for SEC and dilution commands until thesis-flag handling is cleaned up.

## Capital Raise Survivors / Small-Cap Inflection Basket

```powershell
node run.mjs pull smallcap-screen --float-max 30M --short-min 15 --no-offerings --limit 60
node run.mjs pull smallcap-screen --float-max 75M --short-min 5 --no-offerings --market-cap-max 2000M --limit 100
node run.mjs pull capital-raise --days 5
node run.mjs pull fmp --thesis-watchlists --thesis "Capital Raise Survivors"
node run.mjs thesis catalysts --thesis "Capital Raise Survivors"
node run.mjs thesis full-picture --thesis "Capital Raise Survivors"
node run.mjs pull disclosure-reality --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS --lookback 60
node run.mjs pull filing-digest --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS --lookback 30
node run.mjs pull dilution-monitor --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS --lookback 90
node run.mjs pull opportunity-viewpoints --thesis "Capital Raise Survivors"
```

What the thesis-pack workflow does:
1. Starts with small-cap screen output, but treats it as a research queue rather than a buy list.
2. Uses capital-raise, filing-digest, and dilution-monitor before any story work.
3. Uses FMP thesis watchlists and catalyst notes only after financing risk is checked.
4. Uses disclosure-reality to separate real operating inflections from promotional or financing-led filings.

Default watchlist:
- `BW`, `TNC`, `PPIH`, `ECPG`, `PRKS`, `BRBR`, `IIPR`, `NKTR`, `UFPT`, `PDFS`

Useful review lens:
- Reject first on fresh 424B, S-1/S-3, 8-K 3.02, ATM, listing-compliance, or short-runway signals.
- Promote only when dilution is clean, tape is repairing, and independent catalyst evidence exists.
- Use explicit ticker lists for SEC and dilution commands until thesis-flag handling is cleaned up.

## Opportunity Viewpoint Reports

```powershell
node run.mjs pull opportunity-viewpoints
node run.mjs pull opportunity-viewpoints --window 21 --limit 15
node run.mjs pull opportunity-viewpoints --thesis defense
node run.mjs pull opportunity-viewpoints --sector "Aerospace & Defense"
node run.mjs pull opportunity-viewpoints --long-only
```

What the opportunity-viewpoints workflow does:
1. Reads the latest local pull notes across theses, market, fundamentals, sectors, macro, government, biotech, housing, energy, research, and quant folders.
2. Reads recent signal notes from `06_Signals/`.
3. Composes cross-source viewpoints from disclosure reality, thesis full-picture reports, catalyst notes, detailed sector reports, conviction delta, dilution monitor, and active signals.
4. Writes one `opportunity_viewpoints` report into `05_Data_Pulls/Theses/`.

Viewpoint lenses:
- **Disclosure Confirmation Wedge**: promising EDGAR event plus catalyst/thesis context; requires counterparty confirmation before conviction.
- **Strong Thesis, Bad Tape**: structural thesis support with hostile tactical tape; useful for wait-for-confirmation dislocations.
- **Stressed Sector Small-Cap Queue**: sector stress plus small-cap screen output; useful for weekend first-pass work.
- **Conviction Momentum Before Upgrade**: evidence flow improving before the thesis scorecard fully upgrades.
- **Do-Not-Chase / Pair-Trade Watch**: valuation stretch plus sector/tape stress; useful as an avoid or hedge map.

Useful flags:
- `--window <days>` controls the local note window. Default is `14`.
- `--limit <n>` caps the number of viewpoint cards. Default is `12`.
- `--thesis "<name>"` filters viewpoints to a thesis keyword.
- `--sector "<name>"` filters viewpoints to a sector keyword.
- `--long-only` hides risk-first viewpoints.
- `--dry-run` prints the report without writing a note.

## Streamline Reports

```powershell
node run.mjs pull streamline-report
node run.mjs pull streamline-report --window 30 --limit 20
node run.mjs pull streamline-report --include-interactions
node run.mjs pull streamline-report --dry-run
```

What the streamline report workflow does:
1. Reads recent pull notes, signal notes, agent-analysis notes, technical snapshots, earnings calendars, entropy/ORB notes, and synthesis reports.
2. Answers the daily operating questions from `ai_agent_monitoring_data_pull_guide.md`.
3. Builds an active review queue, edge/strategy map, manual Fidelity review queue, guide coverage matrix, and journal prompts.
4. Writes one `streamline_report` note into `05_Data_Pulls/Orchestrator/`.
5. Feeds the local dashboard's Streamline Report panel and is included in the daily, weekly, monthly, quarterly, and yearly cadence plans.

Useful flags:
- `--window <days>` controls the local note window. Default is `14`.
- `--limit <n>` caps the review queue and report tables. Default is `12`.
- `--include-interactions` includes the latest agent interaction threads in the note.
- `--dry-run` prints the report without writing a note.
- `--json` prints a small machine-readable summary.

Roadmap: [[Streamline Report Roadmap]]

## Big Money Vs Retail Positioning

```powershell
node run.mjs pull positioning-report --symbols SPY,QQQ,XOM,NVDA,MSFT
node run.mjs pull positioning-report --thesis "Housing Supply Correction"
node run.mjs pull positioning-report --all-thesis --include-baskets --dry-run
```

What the positioning workflow does:
1. Reads local market, macro, fundamentals, news, sector, thesis, and previous positioning notes.
2. Scores each symbol across institutional, retail, macro/futures, options, price, and vault-strategy layers.
3. Emits a research-only report and watchlist into `05_Data_Pulls/Positioning/`.
4. Writes a sidecar to `scripts/.cache/positioning/` for Streamline Report and dashboard use.
5. Records missing FMP ownership, retail-flow, or AVWAP inputs as source gaps instead of blocking the run.

Useful flags:
- `--symbols <CSV>` scores explicit symbols.
- `--thesis "<name>"` scores symbols from a thesis watchlist.
- `--all-thesis` scores symbols from all thesis watchlists.
- `--include-baskets` includes thesis basket symbols where available.
- `--limit <n>` caps scored symbols. Default is `25`.
- `--dry-run` prints the report without writing notes.
- `--json` prints a small machine-readable summary.

## GDELT News Monitor

```powershell
node run.mjs pull gdelt --topic markets
node run.mjs pull gdelt --all --timespan 15min --limit 75
node run.mjs pull gdelt --query '"Federal Reserve" OR inflation'
powershell scripts\gdelt-news-loop.ps1
powershell scripts\gdelt-news-loop.ps1 -Once
```

What the GDELT workflow does:
1. Uses the no-key GDELT DOC 2.0 API in Article List mode.
2. Pulls recent article metadata for named watch topics such as markets, macro, credit, energy, housing, defense, biotech, AI power infrastructure, and dilution.
3. Writes timestamped `gdelt_news_monitor` notes into `05_Data_Pulls/News/` so 15-minute loop runs do not overwrite each other.
4. Feeds the Streamline Report as a fast headline radar.

Loop behavior:
- `scripts\gdelt-news-loop.ps1` runs `node run.mjs pull gdelt --all --timespan 15min --limit 75` every 15 minutes by default.
- `-Topics "markets,macro,defense"` narrows the loop.
- `-Once` runs one iteration for testing.
- `-DryRun` prints the configured GDELT queries without calling the API.

Use rules:
- Treat GDELT as a radar input, not a verified signal by itself.
- Promote an article only after it connects to a thesis, SEC/Fed/company source, repeated source cluster, or other slower evidence.
- Official docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/

## Macro Bridge Indicators

```powershell
node run.mjs pull macro-bridges
node run.mjs pull macro-bridges --core
```

What the macro bridge workflow does:
1. Pulls a small normalized bridge set for thesis indicators that are not covered by the default FRED group pulls.
2. Uses FRED for `GFDEGDQ188S`, `DTWEXBGS`, and `FDEFX`.
3. Uses FMP for `XAUUSD` and `BTCUSD`.
4. Writes one `Macro Bridge Indicators` pull note into `05_Data_Pulls/Macro/` with the standard `Series / Name / Latest Date / Latest Value / Prior Value / Change` table layout so thesis full-picture reports can resolve those indicators automatically.

Current bridge coverage:
- `[[US Debt/GDP]]`
- `[[DXY Dollar Index]]` via the broad trade-weighted dollar proxy
- `[[Defense Budget]]` via a national-defense spending proxy
- `[[Gold Spot Price]]`
- `[[Bitcoin Price]]`

## NAHB Builder Confidence

```powershell
node run.mjs pull nahb --builder-confidence
node run.mjs pull nahb --builder-confidence --dry-run
```

What the workflow does:
1. Pulls the official NAHB/Wells Fargo Housing Market Index page.
2. Parses the latest builder-confidence headline plus the three core components.
3. Pulls the official NAHB release calendar to attach the current release date and next scheduled release.
4. Writes one `NAHB Builder Confidence` time-series note into `05_Data_Pulls/Housing/`.
5. Feeds `[[Builder Confidence Index]]` into thesis full-picture reports.

## FAA Regulatory Progress

```powershell
node run.mjs pull federalregister --faa-uas
node run.mjs pull federalregister --faa-uas --dry-run
```

What the workflow does:
1. Queries the official FederalRegister.gov API for recent FAA unmanned-aircraft documents.
2. Keeps the newest UAS-relevant rulemaking items and scores the latest milestone stage.
3. Writes one `FAA Regulatory Progress` time-series note into `05_Data_Pulls/Government/`.
4. Uses the official FAA UAS portal as companion context in the note source block.
5. Feeds `[[FAA Regulatory Progress]]` into thesis full-picture reports.

## Manual And Library Source Backfill

Use manual or library-backed source notes when a thesis indicator has no stable free API, or when the primary question is interpretive rather than purely numeric.

Priority source notes:
- Housing sentiment: `[[NAHB Wells Fargo Housing Market Index]]`
- Drone regulation: `[[FAA UAS Integration Office]]`, `[[Federal Register FAA Rulemaking]]`, `[[ProQuest Congressional]]`, `[[Nexis Uni]]`
- Hard-money reserve flows: `[[World Gold Council Goldhub]]`, `[[IMF International Financial Statistics]]`
- Deep fundamentals and infrastructure: `[[S&P Capital IQ Pro]]`, `[[451 Research]]`, `[[Janes Defence Intelligence]]`

Recommended workflow:
1. Start with the source note in `01_Data_Sources/` to confirm access path, update cadence, and intended use.
2. When the source is manual or library-based, write a date-stamped pull note or research note instead of forcing a brittle pseudo-puller.
3. Link the resulting note back to the thesis, indicator, and source note so the evidence chain remains explicit.
4. Preserve immutability: add a new note for each meaningful check rather than overwriting prior evidence.

## Maintenance And Cleanup

```powershell
node run.mjs system cleanup --market-history --dry-run
node run.mjs system cleanup --market-history
node run.mjs system month-end --month 2026-04 --dry-run
node run.mjs pull month-end-archive --month 2026-04 --dry-run
node run.mjs pull month-end-archive --month 2026-04
```

`system month-end` delegates to `pull month-end-archive`. `month-end-archive`
scans date-prefixed monthly notes under `05_Data_Pulls/`,
writes `05_Data_Pulls/Monthly/YYYY-MM_Month_End_Summary.md`, and copies the
matched source notes into `12_Knowledge_Bases/raw/monthly_archive/YYYY-MM/`
with relative vault paths preserved. It copies only; source notes remain in
place so dashboards and Dataview queries keep working. Use `--scope <CSV>` to
archive a narrower folder set.

### Signal Retention

| Severity | Retention |
| --- | --- |
| `critical` | Never pruned |
| `alert` | 30 days |
| `watch` | 14 days |
| `clear` | 7 days |

### Market History Retention

Defaults: keep 1 daily snapshot and 2 quote snapshots per symbol. Override with:

```powershell
node run.mjs system cleanup --market-history --keep-daily 2 --keep-quotes 3
```

## Core Pullers

| Puller | Key | Output |
| --- | --- | --- |
| `fred` | `FRED_API_KEY` | `05_Data_Pulls/Macro/` or `05_Data_Pulls/Housing/` |
| `treasury` | None | `05_Data_Pulls/Macro/` |
| `openfema` | None | `05_Data_Pulls/Government/` |
| `usaspending` | None | `05_Data_Pulls/Government/` |
| `fda` | Optional `FDA_OPEN_DATA_API_KEY` | `05_Data_Pulls/Biotech/` |
| `sec` | None | `05_Data_Pulls/Government/` |
| `clinicaltrials` | None | `05_Data_Pulls/Biotech/` |
| `uspto` | `PATENTSVIEW_API_KEY` | `05_Data_Pulls/Government/` |
| `arxiv` | None | `05_Data_Pulls/Research/` |
| `pubmed` | None | `05_Data_Pulls/Research/` |
| `newsapi` | `NEWSAPI_API_KEY` | topic-driven folder under `05_Data_Pulls/` |
| `gdelt` | None | `05_Data_Pulls/News/` |
| `fmp` | `FINANCIAL_MODELING_PREP_API_KEY` | `05_Data_Pulls/Market/` |
| `entropy-monitor` | `FINANCIAL_MODELING_PREP_API_KEY` | `05_Data_Pulls/Market/` + `scripts/.cache/entropy-monitor/` |
| `eia` | `EIA_API_KEY` | `05_Data_Pulls/Energy/` |
| `cboe` | None | `05_Data_Pulls/Market/` |
| `sam` | `SAM_GOV_API_KEY` | `05_Data_Pulls/Government/` |

## Related Notes

- [[90_System/CLI Command Audit]] — full command inventory with side-effect classification
- [[07_Playbooks/Daily_Routine]]
- [[00_Dashboard/Signal Board]]
- [[00_Dashboard/Catalyst Radar]]
- [[00_Dashboard/Capital Allocation Board]]
- [[00_Dashboard/High Priority Thesis Monitor]]
