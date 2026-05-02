---
title: "Vault Simplification Plan"
type: "reference"
status: "implemented"
created: "2026-05-01"
tags: [vault-cleanup, audit, plan]
---

# Vault Simplification Plan

## Audit Snapshot

Implementation began on 2026-05-01. The original audit snapshot is preserved below for context.

## Implementation Results

Completed on 2026-05-01:

- Fixed all 17 validation errors at the source pullers and current pull notes.
- Moved local KB residue and clippings to `Oy`.
- Moved learning archive leftovers to `Dr_Magnifico`.
- Moved the sports system, including pullers, dashboards, source notes, cached ledgers, and Sports Agent docs, to `Dr_Magnifico/12_Sports_Models/`.
- Retired Qlib/QCPM from active `My_Data`: removed `.qlib_data`, `05_Data_Pulls/Quant`, Qlib dashboards/reference surfaces, QCPM pullers/tests, CLI/routine/dashboard hooks, and stale `qlib_*` thesis frontmatter.
- Deleted empty scaffolds and runtime clutter: `13_Briefing_Packs`, `14_Bridge_Notes`, empty Legal/VC pull folders, empty source/entity folders, logs, stale cache script, and `500-archive/Agent_0` screenshot dump.
- Moved raw `ssrn-6219438.txt` cache to `Oy/12_Knowledge_Bases/raw/papers/imported_from_my_data/`.
- Applied retention after dry run: removed one redundant entropy history note and archived one stale March market pull.

Known remainder:

- `scripts/qlib/tests/tmplh07cvy4` is still present because Windows denies access to that temp directory even after ownership/ACL attempts. The active CLI and docs now ignore Qlib.

Current shape:

| Area | Finding | Cleanup implication |
|---|---:|---|
| Markdown files | 4,625 total | Vault is doing too much as engine, archive, KB, and scratchpad |
| `05_Data_Pulls/` | 4,058 files | 3,650 are already under `_archive`; 407 are active |
| Active `05_Data_Pulls/Market/` | 315 files | 250 are per-symbol FMP balance sheet/cash-flow notes from one day |
| `scripts/` | 250 source/runtime files excluding Node/Qlib dependency trees | Puller count is now broad enough to need domain packs |
| `scripts/qlib/.venv/` | about 923 MB | Rebuildable runtime inside the vault; move out or delete/recreate |
| `.qlib_data/` | about 435 MB | Mostly one downloaded zip plus extracted Qlib data |
| Validation | 17 pull-note schema errors | Newer pullers are bypassing required fields |
| Cross-vault leftovers | local `12_Knowledge_Bases/` has 10 raw files | KB root now points to `Oy`; local folder is residue |

Dry-run results:

| Command | Result |
|---|---|
| `node run.mjs system cleanup --market-history --dry-run` | Would remove 1 older `Entropy_Compression_Scan` file |
| `node run.mjs system prune --all-domains --older-than 1 --dry-run` | Would archive 4 old clear notes: 1 Market, 3 Quant |
| `node run.mjs system validate` | Fails with 17 schema errors |

## Target Contract

`My_Data` should be the investment research engine, not the universal warehouse.

Target vault roles:

| Vault | Keep there |
|---|---|
| `My_Data` | Investment data sources, scripts, active pulls, signals, entities, macro, theses, dashboards, company risk if populated |
| `Dr_Magnifico` | Learning system, mastery notes, learning specs, learning archive |
| `Oy` | Durable KB, raw intake, compiled wiki, clippings worth preserving |
| `Dr_Magnifico/12_Sports_Models` | Sports prediction system, sports pullers, sports dashboards, sports source notes |
| External cold archive | Old screenshots, obsolete agent instructions, raw generated pull archives after monthly rollup |

## Proposed My_Data Top Level

Keep as canonical:

```text
000-moc/
00_Dashboard/
01_Data_Sources/
03_Templates/
04_Reference/
05_Data_Pulls/
06_Signals/
07_Playbooks/
08_Entities/
09_Macro/
10_Theses/
12_Company_Risk/
16_Agents/
90_System/
scripts/
README.md
AGENTS.md
_index.md
```

Notes:

- Keep the `11_` gap. `11_Learning` intentionally moved to `Dr_Magnifico`.
- Keep `12_Company_Risk/` only if it gets seeded with real company notes or removed from the daily routine until populated.
- Keep `16_Agents/` only as a navigation layer. It should not become canonical storage.

Remove or relocate from `My_Data`:

| Path | Recommendation |
|---|---|
| `12_Knowledge_Bases/` | Move remaining raw files to `Oy/12_Knowledge_Bases/raw/imported_from_my_data/`; delete local folder after confirmation |
| `13_Briefing_Packs/` | Delete if still empty; recreate later only when briefing packs are generated |
| `14_Bridge_Notes/` | Delete if still empty; current bridge notes are pull notes or reference notes |
| `15_Questions/` | Either populate with real question notes or delete the MOC/template pair |
| `Clippings/` | Move to `Oy` raw clippings or delete after review |
| `logs/` | Treat as runtime; delete or gitignore fully |
| root `agent_strategy_monitoring_build_guide.md` | Move to `04_Reference/` if active, otherwise `500-archive/` |
| `02_Projects/dilution-monitor.md` | Move to `07_Playbooks/` or `04_Reference/` because the implementation now exists |

## Safe Delete Candidates

These are empty or rebuildable and can be removed first after one backup:

| Path | Why |
|---|---|
| `13_Briefing_Packs/` | Empty |
| `14_Bridge_Notes/` | Empty |
| `05_Data_Pulls/Legal/` | Empty |
| `05_Data_Pulls/VC/` | Empty |
| `05_Data_Pulls/_archive/2026-03/` | Empty |
| `01_Data_Sources/Housing_Real_Estate/Metro/` | Empty |
| `01_Data_Sources/Housing_Real_Estate/National/` | Empty |
| `08_Entities/Currencies/` | Empty |
| `scripts/qlib/__pycache__/` | Rebuildable Python cache |
| `scripts/qlib/tests/tmp*/` | Test scratch directory; one is currently permission-protected |
| `logs/*.log` | Runtime output |
| `.qlib_data/20260331143544_qlib_data_us_1d_latest.zip` | Large setup zip; extracted data already exists |

Conditional delete:

| Path | Condition |
|---|---|
| `scripts/qlib/.venv/` | Delete only if comfortable recreating with `python -m pip install -r scripts/qlib/requirements.txt`; saves about 923 MB |
| `12_Company_Risk/Companies`, `Events`, `Entities`, `Transactions` | Delete only if retiring Company Risk; otherwise seed Companies and keep |
| `500-archive/Agent_0/*.jpeg` | Delete unless the Instagram screenshot sequence is still evidence for an active investigation |

## Cross-Vault Moves

Move to `Oy`:

- `12_Knowledge_Bases/raw/**`
- `Clippings/*.md` if worth retaining
- `500-archive/KB_Implementation_Guide_Revised_v3.md`
- Any durable source extraction or article archive that is not directly used by pullers

Move to `Dr_Magnifico`:

- `500-archive/Adaptive_Generalist_System_V2_Builder_Spec (1).md`
- `500-archive/Learning Session Scaffold Flow V1.md`
- Any future learning-session or mastery-system design docs

Move to a sports vault or delete:

- `scripts/pullers/sports*.mjs`
- `scripts/lib/sports/**`
- sports tests under `scripts/tests/`
- `01_Data_Sources/Sports_Betting/`
- `01_Data_Sources/Developer_Code/sports-betting Python Toolbox.md`
- `00_Dashboard/Sports Calibration.md`
- `00_Dashboard/Sports Prediction Board.md`
- `03_Templates/Sports Prediction.md`
- `04_Reference/Sports Prediction System.md`
- `04_Reference/Sports Implied Probability Cheat Sheet.md`
- `05_Data_Pulls/Sports/`
- `500-archive/daily_sports_stat_pull_instruction_guide.md`

## Pull System Changes

The largest recurring clutter source is not old files; it is generator behavior.

1. Make `05_Data_Pulls/` hot storage only.
   - Keep critical indefinitely.
   - Keep alert 30 days.
   - Keep watch 14 days.
   - Keep clear 3 to 7 days.
   - Move older notes to cold archive or monthly KB archive, not active folders.

2. Stop writing per-symbol FMP fundamentals by default.
   - Keep balance sheet and cash-flow payloads in `scripts/.cache/fmp-*`.
   - Write one daily rollup note such as `FMP_Fundamentals_Watchlist.md`.
   - Add an explicit `--write-fundamentals-notes` flag for manual deep dives.

3. Consolidate sector SEC overview duplication.
   - Current duplicate-content groups include several sector SEC overview notes with identical bodies.
   - Prefer one `SEC_Sectors.md` note plus sector tags or sections.

4. Extend `system cleanup` beyond Market.
   - Keep `system cleanup --market-history` for quotes and entropy.
   - Add `system cleanup --pulls --all-domains --older-than <n> --status clear`.
   - Use archive moves for vault notes; use deletes only for rebuildable cache.

5. Fix schema generation before more retention runs.
   - Add required `frequency` and `signals` fields to:
     - `cash-flow-quality`
     - `cot-report`
     - `macro-volatility`
     - `auction-features`
     - `pair-metrics`
     - `pead-watch`
     - `confluence-scan`
     - `agent-run` or the run-ledger writer
   - Add missing `source` to `Confluence_Scan`.

6. Keep KB mirroring pointed at `Oy`.
   - `kb-bridge.mjs` already uses `getKBRoot()`.
   - After moving the local residue, local `12_Knowledge_Bases/` should not be recreated unless `.env` routing breaks.

## Script System Changes

Keep the grouped CLI as the only public interface:

```text
node run.mjs system ...
node run.mjs routine ...
node run.mjs scan ...
node run.mjs pull ...
node run.mjs thesis ...
node run.mjs kb ...
```

Recommended script layout:

```text
scripts/
  cmd/
  config/
  dashboard/
  kb/
  lib/
  pullers/
    core/
    market/
    thesis/
    government/
    research/
    osint/
  routines/
  system/
  tasks/
  tests/
```

Move root one-off wrappers into `scripts/tasks/` or `scripts/system/`:

| Current | Target |
|---|---|
| `task-premarket.ps1`, `task-orb.ps1`, `task-orb-strategy.ps1`, `task-compression-scan.ps1` | `scripts/tasks/` |
| `schedule-orb-tasks.ps1` | `scripts/tasks/` |
| `_backtest_day.mjs`, `_snapshot.mjs` | `scripts/tasks/` or `scripts/pullers/market/` |
| `gdelt-news-loop.ps1` | `scripts/tasks/` |
| `sync-thesis-fmp.mjs`, `thesis-catalysts.mjs`, `thesis-full-picture.mjs` | `scripts/thesis/`, with router imports updated |

Do not remove legacy flat aliases until `README.md`, `AGENTS.md`, dashboards, and `CLI Command Audit.md` all use grouped commands only.

## Company Risk Decision

The Company Risk system is wired but mostly empty.

Recommended path:

1. Seed `12_Company_Risk/Companies/` from a short watchlist of tickers already in active theses.
2. Keep the daily `scan company-risk --watchlist` only after at least one company note exists.
3. If not using it, remove Company Risk dashboards, MOC, templates, and routine steps as a coherent retirement.

## Implementation Order

1. Create a backup or commit current state.
2. Fix the 17 validation errors so future cleanup results are trustworthy.
3. Move cross-vault leftovers to `Oy` and `Dr_Magnifico`.
4. Delete empty/rebuildable folders and caches.
5. Move Sports to `Dr_Magnifico/12_Sports_Models`.
6. Refactor FMP fundamentals output to cache-first and rollup-note-first.
7. Extend cleanup retention to all domains.
8. Run:

```powershell
node run.mjs system validate
node run.mjs system cleanup --market-history --dry-run
node run.mjs system prune --all-domains --older-than 7 --dry-run
```

9. Apply retention live only after dry-run counts match expectations.

## Success Criteria

- `05_Data_Pulls/` active folders contain only recent operational notes.
- Monthly/historical pull data lives in KB archive or cold archive, not active dashboards.
- `node run.mjs system validate` passes cleanly.
- Daily routine does not regenerate hundreds of low-value per-symbol notes.
- My_Data top level contains only investment engine folders.
- Sports, learning, KB, clippings, and raw screenshots no longer compete with thesis research in graph/search results.
