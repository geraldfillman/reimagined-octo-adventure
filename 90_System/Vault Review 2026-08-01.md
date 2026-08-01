# My_Data Vault Review — 2026-08-01

Full structure, scripts, and content audit. Three parallel audits (scripts layer, docs/navigation layer, research content) plus a git-topology check.

---

## 0. Read this first: the vault has forked

The single most important finding is not about any script or note — it's that **the repo currently contains two divergent vault architectures, and the newest work sits on a third, unmerged branch.**

| Line | Tip | Date | State |
|---|---|---|---|
| `main` = `origin/main` | `846b702` | 2026-06-05 | The architecture `AGENTS.md` describes (`000-moc/`, `00_Dashboard/`, `01_Data_Sources/`, …). Frozen since June 5. Tracked pull notes stop 2026-05-06. |
| `codex/plan-vault-a2a-integration` | `6aa1f4a` | 2026-06-05 (forked 2026-05-07) | **Checked out in the live vault.** Replaces the entire layout: `00_Cockpit/`, `20_Entities/`, `30_Sources/`, `40_Decisions/`, `90_Reference/`, `99_System/`, `AGENT_RUNBOOK.md`, `FRESHNESS_POLICY.md`. Scripts diverged by 288 files (+46,688 / −8,276 lines; new subdirs `agents/`, `bridge/`, `cmd/`, `neo4j/`, `policy/`, `politics/`, `prompts/`). Live working tree has **37 modified + 437 untracked files** (incl. all of `05_Data_Pulls/`, `SlackBrain/`, `CyberSickness/`, `DeepThanker/`, `RFP_aGENT.md`). Pipeline last produced pulls **2026-06-23** (FMP thesis watchlists, FRED, Treasury, Streamline Report — new domains `Orchestrator/`, `SourceWatch/`, `Vol/`). |
| `claude/project-expansion-commodities-d0aab2` | `a11979c` | 2026-07-31 | The commodity→company transmission layer (all 4 phases, wired into daily/weekly cadences). Forked **from `main`**, 6 commits, pushed to origin, **PR never merged**. Because it's built on the old architecture, it will not drop cleanly onto the codex layout. |

Other notes:
- `DeepThanker/` in the live vault is an untracked folder (build docs + the git worktree where the July 31 session ran) — not a separate repo. The work is safe on `origin/claude/project-expansion-commodities-d0aab2`.
- Neither pipeline is currently running: main-line data stops 2026-05-06, live (codex) data stops 2026-06-23 (~5.5 weeks ago).

**Decision required before any deletion:** pick the canonical architecture. If the A2A/Cockpit layout is the future, most of the main-line content audit below becomes "migrate or archive"; if main is canonical, the live vault's 437 untracked files need triage and commit. Either way the commodities branch should be merged or ported first — it's the newest, most complete work in the repo.

---

## 1. What works (keep, healthy)

**Scripts core (main line):**
- `scripts/run.mjs` → `scripts/cmd/router.mjs` — 8 live command groups (`system`, `learn`, `scan`, `thesis`, `pull`, `playbook`, `routine`, `kb`); `scripts/routines/cadence.mjs` drives ~27 pullers.
- ~36 pullers with real historical output: `fmp`, `fred`, `sec`, `gdelt`, `cboe`, `eia`, `fda`, `nahb`, `openfema`, `federalregister`, `treasury`, `usaspending`, `arxiv`, `pubmed`, `uspto`, `newsapi`, `clinicaltrials`, `dilution-monitor`, `disclosure-reality`, `cash-flow-quality`, `cot-report`, `confluence-scan`, `agent-run`, `agent-analyst`, `sector-scan`, `company-risk-scan`, `positioning-report`, `signal-intelligence`, `signal-quality-scan`, `streamline-report`, `opportunity-viewpoints`, `month-end-archive`, `entropy-monitor`, `orb-entropy`, `entropy-compression-scan`, plus thesis tooling (`sync-thesis-fmp`, `thesis-catalysts`, `thesis-full-picture`).
- `scripts/lib/` (41 files) — clean: **no hardcoded keys** anywhere (all 24 env keys via `process.env`), **no broken in-repo imports**.
- 19 `scripts/tests/` files; `scripts/agents/marketmind/` (19 agents) reachable via `agent-run`/`agent-analyst`.
- Retirement discipline is real: qlib/QCPM tombstones in `run.mjs` behave as documented; patch files and legacy market-data path genuinely deleted; BLS/Census/NOAA/World Bank pullers have no remnants.

**Navigation/docs (main line):**
- `000-moc/` — 8 MOCs, nearly all links resolve; best-maintained layer.
- `00_Dashboard/` — 20 dashboards as claimed, most Dataview targets resolve.
- `03_Templates/` — 21 templates, none for retired systems.
- `README.md` + `AGENTS.md` — reconciled 2026-06-05, mutually consistent.
- `16_Agents/` — 17 agent folders with uniform structure + `agent-manifest.json`.
- `500-archive/` — clean; nothing in the active tree links into it.

---

## 2. Promising scripts (invest, don't delete)

| Script | State | Why it has potential |
|---|---|---|
| **Commodity transmission layer** (branch `claude/project-expansion-commodities-d0aab2`): `commodity-transmission.mjs`, `bond-stress.mjs`, `refinancing-exposure.mjs`, `acquisition-radar.mjs`, `futures-curve.mjs`, `narrative-heat.mjs`, `koyfin-ingest.mjs`, `webhook-listen.mjs`, `config/transmission-map.json` | Unmerged | Newest, most complete work (2026-07-31); already wired into cadences on its branch. **Merge or port it first.** |
| `scripts/pullers/market-cycle-monitor.mjs` | Orphan | Newest in-main work (2026-05-07) and the only puller with its own test file — just needs a `pull --help`/cadence entry. |
| `scripts/pullers/research-spine-flow.mjs` | Orphan | 2026-05-07, writes into `12_Company_Risk/` — the missing feeder for the Company Risk system (currently a 2-file scaffold). |
| `scripts/pullers/auction-features.mjs`, `pair-metrics.mjs`, `pead-watch.mjs` | Orphans | All have historical output notes — they ran manually and worked; wire into router or cadence. |
| `scripts/pullers/macro-volatility.mjs`, `backtest-orb-eod.mjs`, `vault-process-canvas.mjs` | Orphans | Output evidence exists; unwired. (`vault-process-canvas` references a never-created `05_Data_Pulls/OSINT` — fix the phantom node.) |
| `scripts/kb/*` (10 scripts) | Wired, unused | Full intake→wiki pipeline wired as `kb` group but never produced content; KB content moved to the Oy vault. Decide: point at Oy and use, or retire the group. |
| 11 × `scripts/pullers/osint-*.mjs` + `snscrape.mjs` | Wired, zero output ever | All 12 `scan osint-*` commands shell out to external CLIs that were never installed (`amass`, `spiderfoot`, `theHarvester`, `recon-ng`, `octosuite`, `snscrape`, telethon). Largest data-source category (21 notes) with nothing realized. Decide: install 2–3 tools you'll actually use, or retire the layer wholesale. |

---

## 3. Retire — scripts (duplicate or dead)

All main-line paths; verified orphaned (unreachable from router, cadence, or any `.ps1`) with no unique output:

| Path | Last touch | Reason |
|---|---|---|
| `scripts/pullers/signal-review.mjs` | 2026-04-28 | Superseded by canonical `signal-intelligence.mjs` |
| `scripts/pullers/signal-tracker.mjs` | 2026-05-02 | Same signal-lifecycle cluster, orphan |
| `scripts/pullers/options-review.mjs` | 2026-05-02 | Orphan, zero output evidence |
| `scripts/pullers/outcome-review.mjs` | 2026-05-02 | Overlaps `backtest-orb-eod` / `signal-quality-scan` |
| `scripts/pullers/reddit.mjs` | 2026-04-28 | Writes to nonexistent `05_Data_Pulls/social`; `snscrape.mjs` covers Reddit |
| `scripts/pullers/convergence-scan.mjs` | 2026-04-28 | Near-duplicate of wired `confluence-scan.mjs` |
| `scripts/lib/topics.mjs` | 2026-04-28 | Never imported |
| `scripts/lib/tradingagents-reference.mjs` | 2026-05-02 | Reference prose stored as code; never imported |
| `scripts/_backtest_day.mjs` | 2026-05-02 | Referenced by nothing |
| `scripts/task-orb-strategy.ps1` | 2026-05-02 | Not scheduled, not referenced (`task-orb.ps1` is the live one) |
| `scripts/schedule-orb-tasks.ps1` | 2026-05-02 | Registers tasks nothing calls |
| `scripts/gdelt-news-loop.ps1` | 2026-05-02 | PowerShell duplicate of `pull gdelt` (already in cadence) |

Also prune: ~90 lines of deprecated flat-command shims in `scripts/run.mjs:62-142` (10 legacy aliases + a flat puller fallthrough duplicating `routePull`) — they've served their deprecation window.

Overlap clusters to consolidate (keep one, fold the rest):
1. Signal lifecycle: `signal-intelligence` (keep) + `signal-quality-scan` (keep) vs `signal-review`/`signal-tracker` (retire).
2. `confluence-scan` (keep) vs `convergence-scan` (retire).
3. Entropy trio: `entropy-monitor` / `orb-entropy` / `entropy-compression-scan` + `agents/marketmind/entropy.mjs` — all wired but overlapping; worth a deliberate consolidation pass.
4. Social: `snscrape.mjs` (keep) vs `reddit.mjs` (retire).

---

## 4. Retire or fix — content and docs

**True duplicates:**
- Root `Main Dashboard.canvas` ↔ `00_Dashboard/Main Dashboard.canvas` (root copy also links the deleted `Quantitative Signals.md`). Keep the `00_Dashboard/` copy.
- `04_Reference/InfraNodus Measurements.md` ↔ `04_Reference/InfraNodus Graph Measurements.md` — merged linked side-by-side from `moc-reference.md`.
- `00_Dashboard/{Signal Board, Macro Regime, Data Freshness}` each exist as `.md` **and** `.base` — two query engines rendering the same content; pick one per board.
- Root `big_money_vs_retail_positioning_agent_instructions.md` (1,154 lines, zero inbound links) vs `04_Reference/Big Money vs Retail Positioning Protocol.md` (52 lines) vs `16_Agents/Positioning Agent/README.md` — three tiers of one spec; only the two short ones are wired. Archive the root file.
- Root `agent_strategy_monitoring_build_guide.md` (1,108 lines, zero inbound links) vs `04_Reference/Entropy Strategy Monitoring Cheat Sheet.md` + `ORB + Entropy Strategy Playbook.md`. Archive the root file (`Vault Simplification Plan.md:108` already prescribed this).
- `01_Data_Sources/`: `PubMed API.md` exists in both `Biotech_Healthcare/` and `Frontier_Science/`; same-source splits: EIA (`EIA API` vs `EIA_Electricity`), SAM.gov (`SAM.gov API` vs `SAM_Gov`), Treasury (`Treasury Direct API` vs `US Treasury Data`), Census (`Census API` vs `Census Bureau Housing Data`), FRED (`FRED API` vs `FRED Housing Series`).

**Stale docs (reference things that no longer exist):**
- `_index.md` — the designated start-here file: links the deleted `Qlib Cheat Sheet`, presents `11_Learning/` and `12_Knowledge_Bases/` as local. Rewrite; it contradicts README/AGENTS.
- `90_System/CLI Command Audit.md` — a pre-migration *proposal* (every row "Status: rename") presented as the authoritative command inventory. The rename shipped. Rewrite or delete.
- `04_Reference/Pull_System_Guide.md` — advertises the retired `quant` group and Quant pull folder.
- `04_Reference/Pull System Cleanup Roadmap.md` — schedules quarterly "Quant refresh/backtests".
- `00_Dashboard/Company Risk Board.md` + `Company Risk Patterns.md` — query 4 subfolders (`Companies/`, `Events/`, `Entities/`, `Transactions/`) that don't exist; 5 of 8 Dataview blocks render empty.
- `00_Dashboard/Cross-Thesis Collision Board.md` and `Delta Review.md` — still query the deleted `14_Bridge_Notes`.
- `00_Dashboard/OSINT Intelligence.md` — queries `05_Data_Pulls/osint`, which has never existed.
- `000-moc/moc-dashboard.md` and `moc-reference.md` — link learning content that moved to Dr_Magnifico.
- `12_Knowledge_Bases/` — leftover stub (4 raw `Opportunity_Viewpoints` files, 2026-05-03→06); delete after confirming Oy migration (`Vault Simplification Plan.md:102,207`).
- `07_Playbooks/2026-04-28_Agent_Pull_System_Implementation_Plan.md` — completed build plan kept as if live; archive.
- `docs/superpowers/` (canonical-signal-layer plan/spec) — orphaned from all navigation.

**Note:** `04_Reference/Vault Simplification Plan.md` already prescribes much of this cleanup and was never executed. Execute it rather than re-planning.

---

## 5. Data hygiene findings

- **Source frontmatter is lying.** All 93 source notes say `status: Active`, but **79 of 93 are `integrated: false`** — only 14 actually feed anything. Five belong to removed pullers and should be archived or re-marked: `Climate_Energy/NOAA Climate Data Online.md`, `Climate_Energy/NOAA Storm Events.md`, `Housing_Real_Estate/Census Bureau Housing Data.md`, `Macro/BLS API.md`, `Macro/Census API.md`. (AGENTS.md claims 91 sources; actual is 93.)
- **All 24 theses are past review**: 21 last reviewed 2026-03-27 (127 days), 3 on 2026-04-25 — yet statuses still read "on-track"/"strengthening". Either re-run the review cadence or downgrade `monitor_status` honestly.
- **Near-duplicate theses** worth merging or explicitly differentiating: AI Power Infrastructure / AI Power Defense Stack / Grid Equipment Bottleneck; Defense AI Autonomous Warfare / Drone Autonomous Systems Revolution; Alzheimers Disease Modification / Longevity Aging Biology.
- **`12_Company_Risk/` is a 2-file scaffold** (two pattern notes) while dashboards, README, and AGENTS.md describe a full 5-subfolder system. Either wire `research-spine-flow.mjs` to populate it, or trim the docs/dashboards to match reality.
- `06_Signals/`: 81 notes, newest 2026-05-02 — expired low-severity signals were supposed to be cleaned by the daily cadence, which isn't running.
- Cross-vault fragility: the whole `learn` group imports from `LEARNING_VAULT_ROOT` (Dr_Magnifico) with no graceful failure if unset — add a guard message.

---

## 6. Recommended sequence

1. **Decide the canonical architecture** — A2A/Cockpit (live, codex branch) vs main (AGENTS.md generation). This decision gates everything else.
2. **Land the commodity-transmission branch** (`claude/project-expansion-commodities-d0aab2`) — merge into main if main wins; port scripts + `transmission-map.json` into the codex layout if A2A wins.
3. **Triage the live vault's 437 untracked files** — commit what's real (pulls, SlackBrain, DeepThanker docs), gitignore what's cache/log.
4. **Restart the pipeline** — nothing has run since 2026-06-23; `daily-routine`/cadence is the vault's heartbeat.
5. **Execute `04_Reference/Vault Simplification Plan.md`** — it already prescribes the root-guide relocation and KB stub deletion.
6. **Delete the 12 retire-list scripts + flat-command shims** (Section 3) — one `git rm` commit, fully reversible.
7. **Fix or retire the empty-query dashboards** (Company Risk ×2, Cross-Thesis Collision, Delta Review, OSINT Intelligence) and the stale reference docs (Section 4).
8. **Data-source and thesis hygiene** — re-mark the 5 dead sources + 79 `integrated: false` notes, dedupe the 6 source splits, refresh or downgrade the 24 thesis reviews.
9. **Make the OSINT and KB calls** — each is a fully-wired subsystem with zero output; commit to using them or retire them to `500-archive/`.
