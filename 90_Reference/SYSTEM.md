---
title: SYSTEM â€” Canonical Operating Doc for the Harness
type: reference
status: canonical
created: 2026-06-04
updated: 2026-06-04
tags: [system, canonical, governance]
# Doc-collapse status (audited 2026-06-04 â€” supersedes the naive "delete all" list):
archived: ["Plan.md", "Vault Simplification Plan", "Streamline Report Roadmap"]   # historical, 0 inbound links â†’ moved to 500-archive/superseded-2026-06-04/
repoint_then_retire: [AGENTS.md, CLAUDE.md]   # LIVE instruction entry points (read every session; rules inlined in runner-synthesis/regime-bootstrap). Make SYSTEM.md canonical FIRST, then slim these to pointers.
keep_human_runbook: [AGENT_RUNBOOK.md, FRESHNESS_POLICY.md]   # not read by code, but linked by AGENTS.md; data lives in cadences.json/freshness-policies.json/runner-slots.mjs
keep_active_reference: ["Agent Layer Map", "Pull System Cleanup Roadmap"]   # Agent Layer Map = routing (also in agent-manifest.json); Pull System Cleanup Roadmap = linked by Pull_System_Guide for the pack command list
generated_do_not_delete: [STREAMLINE_AUDIT.md]   # output of streamline-audit.mjs â€” regenerates
---

# SYSTEM

> **Canonical entry point** for the harness operating model (as of 2026-06-04). Both `AGENTS.md` files point here first. P6 consolidation is live: `My_Data` is the active harness vault, `World_Machine` is archive/history, and executable code/config/memory live in `C:\Users\CaveUser\harness`. Pair with `ROADMAP.md`.

Current canonical path: `C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\90_Reference\SYSTEM.md`.

---

## 1. What this is

A macroinvestment research harness. It pulls public data, runs domain agents to form stances, gates those stances through an adversarial promotion ladder, writes positions to one ledger, and grades its own calls to build calibrated priors over time.

**Three separated concerns â€” never mix them again:**

| Concern | Lives in | Rule |
|---|---|---|
| **CODE** â€” pullers, agents, CLI, libs | `~/harness/` (a git repo **outside** Obsidian) | Obsidian never indexes code. |
| **KNOWLEDGE** â€” theses, entities, sources, decisions | `My_Data` | Durable, human-curated notes only. |
| **STATE / MEMORY** â€” calibration, outcomes, ledger events | `~/harness/memory/` | One event log; everything else is derived. |

Reports are generated views. The system may persist current briefings, freshness reports, and run summaries under `Reports/`, but canonical decisions remain in `40_Decisions/`.

---

## 2. Vault layout (active surface)

```
00_Cockpit/    live Dataview/Bases boards (Positioning, Signals, Freshness). NOT dated snapshots.
10_Theses/     durable thesis notes â€” the actual knowledge product
20_Entities/   companies / sectors / macro indicators
30_Sources/    one note per data source (the registry)
40_Decisions/  append-only Positioning Ledger + Decision Log (the only persisted "report")
90_Reference/  this file, ROADMAP.md, schemas, â‰¤6 docs total
99_System/     migration manifests and system metadata; not operator reading material
Reports/       generated briefings, freshness views, run summaries
_cache/        ephemeral pulls â€” gitignored, TTL-pruned, never a durable note
logs/          local run logs
scripts/       locked legacy remnant only; ignored by Obsidian and not the command root
```

Legacy roots such as `01_Data_Sources`, `05_Data_Pulls`, `06_Signals`, and `12_Knowledge_Bases` were moved or archive-copied during P6. Do not recreate them as active Obsidian roots.

---

## 3. Operating cadence

Six weekday scheduled tasks run from the harness wrapper. Cadences are local-analysis/reporting by default; raw source refreshes are manual unless the user explicitly approves them.

| Time (ET) | Cadence | Output |
|---|---|---|
| 07:00 | `premarket` | feeds the daily decision packet |
| 09:45 | `daily` | the **daily decision packet** (one persisted file) |
| 12:30 | `midday` | cockpit refresh only |
| 15:30 | `preclose` | cockpit refresh only |
| 16:30 | `eod` | grades the day â†’ writes outcome events to memory |
| 16:55 | `system validate` | schema gate |

Live runs currently write the cockpit data, daily briefing/run summaries, freshness reports, and decision-support artifacts. These are generated views, not canonical source records.

**Readiness preflight is mandatory** before any cadence: `& "$env:USERPROFILE\harness\harness.ps1" system readiness --cadence <name>` returns `READY`, `WARN`, or `BLOCKED`. `BLOCKED` stops unless the user explicitly approves `--allow-stale`. Never pass `--allow-stale`/`--stale-ok` without explicit approval.

---

## 4. Freshness tiers (TTL)

Sources carry a criticality tier; the readiness check blocks on expired critical sources.

- **Market data** â€” intraday/1d, expires same session.
- **Macro** (FRED, Treasury, BEA) â€” days to a week.
- **Filings & corporate** (SEC, FMP) â€” event-driven; refresh on catalyst.
- **Sector / thesis** â€” weekly.
- **News / narrative** â€” hours to a day.
- **Research / low-cadence** (arXiv, patents) â€” weekly+.

Per-source TTLs live in `config/freshness-policies.json`. This file replaces the standalone `FRESHNESS_POLICY.md`.

---

## 5. Agent roster & routing

Domain agents own reasoning; the runner owns scheduling. Each agent emits **STRICT JSON** `{ stance, watch_items, gate_delta_candidates, open_questions }`, rendered to an ingestion-contract report by the synthesis bridge.

| Agent | Domain | Sources |
|---|---|---|
| Orchestrator | cross-domain synthesis / fan-out | all |
| Market | equity tape, breadth, structure | Market_Data, Prediction_Markets, Social_Sentiment |
| Macro | regime, liquidity, rates | Macro |
| Positioning | stance Ã— gate Ã— sizing | Market_Data, ETFs |
| Thesis | thesis lifecycle | cross-domain |
| Fundamentals | filings, cash-flow quality | Fundamentals |
| Biotech / Energy / Housing / Government / Legal / VC / News / Sectors / OSINT | domain pulls | per Agent routing |

Override any agent's reasoning by dropping `_prompt.md` in `engine/agents/<Name>/`. The Orchestrator is the default fan-out when a slot needs >3 agents in parallel.

---

## 6. Gate promotion ladder (the decision spine)

A candidate climbs G1 â†’ G4. The ledger is in `40_Decisions/`; only the EOD slot mutates it â€” all other slots *propose* via triage packets.

- **G1 Watch** â†’ **G2 Candidate** â†’ **G3 Position** â†’ **G4 Sized**.
- **G2â†’G3 requires surviving the refutation panel** (`refute-thesis`): 3 lens-diverse skeptics (Correctness, Base-Rate, Alternative-Explanation); the candidate survives only if â‰¤1 of 3 refute. Killed candidates append to the Decision Log with reason code `superseded-by-skeptics`.
- **Honest scope:** the panel is *trajectory-aware* â€” reliable on symbols with a prior deteriorating call; on first-call theses it is context-only, not discriminating. Do not over-trust first-call refutation.
- Every closed/triggered row is graded at EOD into the memory event log (Played out / Right-poorly-timed / Noisy / Missed / Stale).

---

## 6b. Strategy expression, watchpoints & ledger detail
*(Merged from `World_Machine/AGENTS.md`, P5b. The Strategy Expression Rules are cited inline by `runner-synthesis.mjs` â€” keep faithful.)*

**Strategy expression rules.** Assume **no active position** unless a note explicitly documents one; every strategy reference gives a fresh entry from a flat-book baseline. Do **not** use position-management language ("reduce / trim / hold / stay long / add / hedge exposure") unless a current holding is documented. Use instead: `stand aside` Â· `avoid new entry` Â· `prepare a fresh entry` Â· `define a new hedge candidate` Â· `wait for trigger confirmation`. Every strategy candidate carries: **action label** (`Observe` Â· `Prepare` Â· `Triggered` Â· `Invalidated`), entry point, candidate instrument/structure, required data check, and invalidation / stand-aside condition.

**Watchpoint schema** (practical shape, not a rigid validator): frontmatter `type: watchpoint`, `category`, `status`, `review_cadence`, plus list fields `trading_styles / strategy_families / technical_indicators / macro_indicators / macro_regimes / entities / policy_links / institutional_links / case_studies / evidence_sources`, `tags: [watchpoint]`.

**Signal bridge routing.** `02_Strategy_Development/Macro-to-Strategy Signal Bridge` is a **routing ledger, not a content store** â€” register rows in the Watchpoint Routing Index; canonical trigger detail stays in the watchpoint file, never duplicated inline.

**My_Data bridge watchpoints.** Receive My_Data signals (named in `evidence_sources`), define a promotion threshold (min score + an independent confirming source: clinical trial / regulatory designation / SEC filing / peer publication), keep a dilution-overlay table that blocks promotion, and gate all entry language behind the three-condition rule (nothing above `Observe` until met).

**Exact gate ladder + the 3-file ledger** (`40_Decisions/` primary; `World_Machine/_Inbox` fallback/history during P6): **Ledger** (stance Ã— gate Ã— evidence routing + House View) Â· **Positions** (full structure for every Gateâ‰¥2 row; options carry the five-tag stack: Direction Â· Protection Â· Income Â· Volatility Â· Defined Risk) Â· **Discard Log** (append-only, reason-coded).
- **G0â†’1:** one independent confirming source.
- **G1â†’2:** direction, trigger, invalidation, time window explicit; Position Structure block opened.
- **G2â†’3:** Position Structure complete (+ five option tags if applicable); Watchpoint link resolves; **must survive the refutation panel** (â‰¤1 of 3 skeptics refute).
- **G3â†’4:** outcome label assigned and logged.
Only two surfaces may mutate the ledger: the **S6 reconciler** and **`market-positioning-outcomes --apply`** (idempotent on `(row, applied_at)`). All others propose via triage packets per `_Inbox/INGESTION_CONTRACT.md`.

## 7. Memory contract

One store, `~/harness/memory/`. **A write to memory must have a named reader, or it doesn't get written.**

1. **`events.jsonl`** â€” append-only, one schema: `{ts, entity, agent, gate, verdict, outcome, reason}`. This is the single source for calibration, refutation history, outcome labels, and discard reasons. Consolidates today's `_state/calibration.json`, `thesis-calibration.json`, `refutation-log/`, `outcome-review/`, and Discard Log fragments.
2. **`*.snapshot.json`** â€” derived rollups (per-agent accuracy over 90/180/365d). Never hand-edited; regenerated from the log.
3. **Semantic recall** — P7 pending. Target behavior: on each new G2 candidate, query the nearest historical setups and logged outcomes from Neo4j. Until P7 ships, do not assume graph recall is part of promotion.
4. **Narrative** â€” `40_Decisions/Decision Log.md`, one human-readable line per promotion with the *why*.

---

## 8. Schema & editing rules

- Every durable note carries frontmatter (`title`, `type`, `created`, `tags`); `& "$env:USERPROFILE\harness\harness.ps1" system validate` is the gate and must pass before any task is "done."
- **Immutability:** never mutate a graded/closed row or a human-authored note in place â€” append. Preserve unrelated dirty-worktree changes.
- Pulls in `_cache/` are disposable; do not hand-edit them.

---

## 8b. Engine operations & vault map
*(Merged from `My_Data/AGENTS.md`, P5b.)*

**Vault and code map.** `C:\Users\CaveUser\harness` = code, scheduler config, memory, tests, and harness caches. `My_Data` = active human/operator vault: cockpit, theses, entities, source registry, decision ledger, generated reports, cache roots, and references. `World_Machine` = archive/history after P6; use it for provenance, not new live workflow roots. `Dr_Magnifico` remains the learning vault if `LEARNING_VAULT_ROOT` is set. `Oy` is the reviewed durable KB vault when `KB_VAULT_ROOT` is set for KB promotion/audit runs; raw KB bodies remain in the harness cache.

**Engine folder responsibilities (My_Data):** `00_Cockpit` boards · `10_Theses` durable thesis notes · `20_Entities` canonical entities and macro objects · `30_Sources` source registry · `40_Decisions` ledger, decision log, and position research intake · `90_Reference` operating docs · `99_System` migration/system metadata · `Reports` generated views · `_cache` disposable pull/signal/research artifacts · `logs` run logs. `scripts` is a locked legacy remnant only.

**6-slot routine (manual/experimental — NOT the scheduled harness cadence).** Routine code lives under `C:\Users\CaveUser\harness\engine`. Only the reconciler/outcome apply path may mutate the ledger; other slots propose via triage/review packets. Keep this separate from the scheduled `premarket`, `daily`, `midday`, `preclose`, `eod`, and `validate` tasks.

**Canonical signal intelligence.** `pull signal-intelligence --scope all` writes generated artifacts under `_cache/pulls` and harness sidecar caches; consumed by streamline, thesis/full-picture, routines, monitoring, and cockpit views. Surfaces active alerts, coverage gaps, and data gaps.

**Portfolio health & risk ladder.** Reviews go through `pull portfolio-health --file <positions.csv>` â€” never ad-hoc note edits. Ladder leastâ†’most aggressive: **Jefferson DC Plan** (passive anchor; light monitoring; ignore its rows incl. the `BROKERAGELINK` aggregate) â†’ **BrokerageLink / Brokerage** (mutual-fund sleeve; watch concentration/overlap) â†’ **Rollover IRA** (ETF-only from `08_Entities/ETFs/`; no individual stocks) â†’ **Individual** (aggressive/income; watch options premium, single-name, margin). Output is monitoring/research only â€” **not advice, no execution implied**.

**Automation write-contract.** May write: My_Data cockpit data, reports/freshness/monitoring/briefings/candidates, `_cache` artifacts, and review-gated decision packets. Must **NOT**: recreate legacy durable pull/signal/KB roots, write new generated workflow surfaces into World_Machine, overwrite human-authored notes, or treat World_Machine as a script source. **Evidence rule:** prefer at least two independent channels before raising conviction (FMP Premium is the backbone; FRED/BEA/Treasury/EIA/CBOE/SEC/USASpending/FDA/etc. confirm).

**Precedence.** These project rules outrank `~/.claude/rules/common/*.md` in-vault. If `AGENTS.md` / `README.md` / `CLAUDE.md` conflict, `AGENTS.md` wins; `CLAUDE.md` is a compatibility shim only â€” **except** its context-mode hard-stops, which always hold.

## 9. Scaffolding without breakage

- **Puller plugin contract:** each puller exports `{ id, domain, cadence, freshness, enabled, run() }`, auto-discovered from `config/puller-catalog.json`. Add a file â†’ registered. `enabled:false` = kill switch, no deletion.
- **Config-as-data:** scoring weights, gate thresholds, and symbol gates live in `config/`. Code reads config; you never edit `.mjs` to change a number.
- **Two CI gates on every change:** `system validate` (schema) + golden synthesis tests (`tests/agent-scoring.test.mjs`, expanded). A weight change that regresses calibration fails the gate.
- **Domain packs** bound blast radius: editing the Energy pack cannot break Macro.
- **Migrations are copy-verify-hash-then-delete** (generalize the existing `consolidate-world-machine.mjs` pattern).

---

## 10. Do NOT touch

- The **v2.4 synthesis fix** â€” `config/scoring-weights.json` macro-retirement (weight 1.1â†’0) + `symbolBullishGating` on GEV/ETN/AMZN, and `applySymbolGate()` in `scoring.mjs`. Simulated +126pp lift; **forward-validation due 2026-08-01.** The new memory store must keep feeding this loop â€” seed `events.jsonl` from the existing `_state/calibration.json`, do not discard it.
- The **refutation quorum** logic â€” sound; only its *log destination* moves into `events.jsonl`.

---

## 11. Quick command reference

```
& "$env:USERPROFILE\harness\harness.ps1" system readiness --cadence <premarket|daily|midday|preclose|eod>
& "$env:USERPROFILE\harness\harness.ps1" system validate
& "$env:USERPROFILE\harness\harness.ps1" cadence run <name>
& "$env:USERPROFILE\harness\harness.ps1" pull <puller> [--dry-run] [--json]
& "$env:USERPROFILE\harness\harness.ps1" pull market-positioning-outcomes --dry-run --json
& "$env:USERPROFILE\harness\harness.ps1" pull position-research-review --dry-run
```

Always `--dry-run` first on anything that writes. Live only on explicit authorization.
