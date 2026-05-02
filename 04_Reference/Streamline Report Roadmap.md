---
title: "Streamline Report Roadmap"
type: "reference"
status: "active"
created: "2026-05-01"
tags: ["streamline-report", "orchestrator", "roadmap", "agent-monitoring", "dashboard"]
---

# Streamline Report Roadmap

## Purpose

The Streamline Report is the Orchestrator Agent's daily decision-support brief. It should answer the operating questions in [[ai_agent_monitoring_data_pull_guide]], summarize what each specialist agent found, identify what needs human review, and show which monitoring modules are still incomplete.

The dashboard is the live control surface. The vault note remains the durable record.

## Current State

Implemented:
- `node run.mjs pull streamline-report [--cadence daily|weekly|monthly|quarterly|yearly] [--focus market|macro|thesis|risk|all]`
- Output path: `05_Data_Pulls/Orchestrator/YYYY-MM-DD_Streamline_Report.md`
- JSON sidecar: `scripts/.cache/orchestrator/streamline-reports/YYYY-MM-DD.json`
- Dashboard panel: latest Streamline Report summary, review queue (top 5), guide gaps, quiet_day flag
- Cadence sections: Trend Summary (weekly/monthly), Scorecard stub (quarterly/yearly)
- Review queue: deduplication by canonical topic, score columns (Severity, Freshness, Confidence, Coverage, Disposition, Evidence)
- Edge/strategy classifier: every review item tagged with edge_type, strategy_family, and invalidation
- API endpoints: `/api/streamline-report`, `/api/streamline-report/history`, `/api/streamline-report/diff`
- Outcome loop puller: `node run.mjs pull outcome-review` — generates follow-up notes at 5/20/60-day intervals
- Options review scaffold: `node run.mjs pull options-review --symbol TICKER` — manual checklist note
- Auction features puller: `node run.mjs pull auction-features [--symbols LIST]` — auction state, POC, VAH/VAL, AVWAP, rel vol for watchlist symbols
- PEAD watch puller: `node run.mjs pull pead-watch [--symbols LIST]` — post-earnings drift labels, EPS surprise, earnings AVWAP distance
- Pair metrics puller: `node run.mjs pull pair-metrics` — z-score(60d), correlation(120d), half-life for all 17 configured pairs
- Cash-flow quality puller: `node run.mjs pull cash-flow-quality [--symbols LIST]` — CFQ score 0–5, FCF, net cash for high-moat universe
- Macro-volatility puller: `node run.mjs pull macro-volatility [--window 30]` — synthesis of FRED/CBOE notes into weighted stress_pct and regime
- COT report puller: `node run.mjs pull cot-report` — CFTC Commitment of Traders, 9 key markets, speculative positioning extremes and rapid-shift signals; runs weekly via `--cadence weekly`

- Agent manifest: `16_Agents/agent-manifest.json` — 16 agents with pullers, daily_pullers, output dirs, cadence, depends_on, handoff_to
- Agent registry: `scripts/lib/agent-registry.mjs` — topological run order, note-to-agent resolution, tag-based lookup
- Run ledger: `scripts/lib/run-ledger.mjs` — per-puller timing, status, artifact; emits JSON + vault note
- Orchestrated runner: `node run.mjs pull agent-run [--agents list] [--cadence weekly] [--skip-report]`
- Sidecar `agent_handoffs[]`, `agent_count`, `failed_agent_count` populated from today's run ledger
- API: `/api/run-ledger` — latest run ledger summary | `/api/lineage?title=...` — why is this item in the queue?

Current limitations:
- Edge type and strategy family are classified at the report layer; source modules do not yet self-tag (cot-report.mjs does self-tag; older pullers do not).
- Dashboard panels (Agent Debrief, Module Coverage, Run Ledger) show accurate data only after `node run.mjs pull agent-run` has been executed — data is correct when the pipeline runs, not a code gap.
- Lineage does not yet model multi-hop synthesis chains (e.g., fred → macro-volatility → report). Phase 8+ work.

## Target Contract

Every Streamline Report should become both a readable note and a machine-readable orchestrator artifact.

Required future frontmatter:

```yaml
report_schema_version: 1
run_id: routine-daily-YYYY-MM-DD
cadence: daily
source_window_start: YYYY-MM-DD
source_window_end: YYYY-MM-DD
signal_status: clear|watch|alert|critical
active_review_count: 0
coverage_gap_count: 0
new_since_last_report: 0
resolved_since_last_report: 0
agent_count: 0
failed_agent_count: 0
```

Required structured sections:
- `Inputs`: source notes, freshness, stale inputs, failed pulls
- `Review Queue`: candidate, source, edge type, strategy family, status, confidence, invalidation, manual check
- `Module Coverage`: module, status, owner, missing data, next build step
- `Agent Handoffs`: agent, task, result, artifact, next owner
- `What Changed`: new alerts, resolved alerts, stale data, changed thesis/catalyst state
- `Outcome Loop`: reviewed, ignored, journaled, pending 5/20/60-day follow-up

## Phase 1: Make The Report More Useful Immediately ✅ Complete (2026-05-01)

Goal: reduce noise and make the daily note easier to act on.

Completed:
- ✅ `--cadence daily|weekly|monthly|quarterly|yearly` flag: Trend Summary for weekly/monthly, Scorecard stub for quarterly/yearly.
- ✅ `--focus market|macro|thesis|risk|all` flag: filters review queue by domain group.
- ✅ Duplicate suppression: repeated notes collapsed by canonical ticker/thesis key with merged signal lists and evidence count.
- ✅ Score columns: Severity (HIGH/MED/LOW), Freshness (Fresh/Aging/Stale), Confidence (from agent data or 50% default), Coverage (module fields count), Disposition.
- ✅ Disposition column: "Manual Broker Check / Review / Journal / No Action" mapped from signal_status.
- ✅ Top 5 dashboard summary: sorted by Severity then Confidence descending; full vault note unchanged.
- ✅ Quiet-day format: compact block with build gaps and suggested action when queue is empty.
- ✅ New frontmatter fields: `cadence`, `focus`, `coverage_gap_count`.

## Phase 2: Add A Real Orchestrator Data Contract ✅ Complete (2026-05-01)

Goal: make Streamline Report output queryable by dashboard, Dataview, and future agents.

Completed:
- ✅ `report_schema_version: 1` in frontmatter; `run_id`, `source_window_start`, `source_window_end`, `new_since_last_report`, `resolved_since_last_report` emitted.
- ✅ JSON sidecar emitted to `scripts/.cache/orchestrator/streamline-reports/YYYY-MM-DD.json` on every non-dry-run.
- ✅ Sidecar contains `review_items[]`, `coverage_items[]`, `source_inputs[]`, `changed_items{new,resolved}`.
- ✅ `computeChangedItems()` diffs current vs previous sidecar by `note_path`; counts flow to frontmatter.
- ✅ `validateSidecar()` checks schema_version, date format, signal_status, required arrays, run_id.
- ✅ `/api/streamline-report/history?limit=N` — last N sidecar summaries (date, status, counts).
- ✅ `/api/streamline-report/diff?from=&to=` — new/resolved alerts and coverage gap delta between two dates.
- ✅ Dashboard API returns `quiet_day`, `staleSummary`, `cadence`, `focus`, `coverage_gap_count`.

Remaining gap:
- `agent_handoffs` array is not yet populated (Phase 6 dependency — requires agent manifest).

## Phase 3: Close The Guide Coverage Gaps ✅ Complete (2026-05-01)

Goal: turn the coverage table from a gap list into live evidence.

| Module | Status | Output |
|---|---|---|
| Strategy-to-edge classifier | ✅ Live (report layer) | `edge_type`, `strategy_family`, `invalidation` on every review item in sidecar + Manual Review Queue |
| Options review assistant | ✅ Live | `node run.mjs pull options-review [--symbol TICKER] [--all]` → `05_Data_Pulls/Market/*_Options_Review.md` |
| Outcome loop | ✅ Live | `node run.mjs pull outcome-review [--days 5,20,60]` → `05_Data_Pulls/Orchestrator/*_Outcome_Review.md` |
| Auction feature engine | ✅ Live | `node run.mjs pull auction-features [--symbols LIST]` → `05_Data_Pulls/Market/*_Auction_Features.md`; auction_state, POC, VAH/VAL, AVWAP, rel vol |
| PEAD/anomaly engine | ✅ Live | `node run.mjs pull pead-watch [--symbols LIST]` → `05_Data_Pulls/Market/*_PEAD_Watch.md`; pead_label, EPS surprise%, earnings AVWAP; skips insufficient_data |
| Pair engine | ✅ Live | `node run.mjs pull pair-metrics` → `05_Data_Pulls/Market/*_Pair_Metrics.md`; all 17 configured pairs; z_60, corr_120, half_life, status |
| Cash-flow quality engine | ✅ Live | `node run.mjs pull cash-flow-quality [--symbols LIST]` → `05_Data_Pulls/Fundamentals/*_Cash_Flow_Quality.md`; CFQ score, FCF, net cash |
| Macro-volatility engine | ✅ Live | `node run.mjs pull macro-volatility [--window 30]` → `05_Data_Pulls/Macro/*_Macro_Volatility.md`; synthesis puller; weighted stress_pct, regime (low/elevated/high/extreme) |

Remaining gap:
- Move edge/strategy classification from report layer to source module frontmatter (Phase 6 dependency).

Acceptance criteria met:
- ✅ Every active review item has an edge type, strategy family, and invalidation.
- ✅ Options review checklist and outcome loop are live.
- ✅ Coverage checker detects agent-level evidence for auction/PEAD/pair/CFQ.
- ✅ All 5 standalone daily pullers are live: auction-features, pead-watch, pair-metrics, cash-flow-quality, macro-volatility.
- ✅ Macro-volatility puller synthesises FRED credit/rates and CBOE vol notes into a composite stress regime note.
- ✅ The report never implies automatic trading or broker execution.

Production gap (open):
- Pullers are built and tested but not assigned to any agent's daily cadence in agent-manifest.json or agent-run.mjs. Until Phase 7 wires them in, the coverage checker will continue to report 5 gaps in every daily run.

## Phase 4: Improve Dashboard Workflow ✅ Complete (2026-05-01)

Goal: make the dashboard a live cockpit for the report process, not only a reader.

| Feature | Status | Detail |
|---|---|---|
| History selector | ✅ Live | 30-day dropdown; loads full sidecar via `/api/streamline-report/full?date=` |
| Diff cards | ✅ Live | 4 stat-cards: new alerts, resolved, stale inputs, coverage gaps |
| Acknowledgement state | ✅ Live | Dropdown per review item (unreviewed/reviewed/journaled/ignored); writes `ack_status` to vault note frontmatter |
| Wikilink copy | ✅ Live | 🔗 button copies `[[note_path]]` to clipboard with toast |
| Module status chips | ✅ Live | Colored chips (active/partial/gap/stale/failed) with click-to-expand detail |
| Auto-generate toggle | ✅ Live | Checkbox in panel header; auto-fires report after workflow completion |
| Morning/After Close modes | ✅ Live | Morning (before 8:30 AM EST): compact. After Close (after 4:30 PM EST): full detail |
| Agent debrief animation | ✅ Live | Chat-style panel: domain agents report findings with staggered animation; Skip button |

Acceptance criteria met:
- ✅ Operator can see what changed since yesterday without opening multiple notes.
- ✅ Review decisions can be captured without editing markdown by hand.
- ✅ Dashboard always points back to durable Obsidian notes.
- ✅ Agent debrief shows conversational summary of each domain's findings.

Dashboard data quality (open):
- All panels are wired and functional. Agent Debrief, Module Coverage, and Run Ledger panels show empty/partial state because Phase 3 pullers haven't generated output notes and agent-run isn't in the daily routine. Dashboard accuracy is gated on Phase 7.
- Technical Risk panel falls back to a hardcoded instruction string when no data exists; should be replaced with a proper empty-state component.

## Phase 5: Add Feedback And Scorecards

Goal: make the report learn which signals are useful.

Tasks:
- Add false-positive and false-negative tracking per source module.
- Add signal quality score by module and agent.
- Add source reliability score using freshness, failures, and historical usefulness.
- Add artifact volume and noise score so high-output modules do not dominate the brief.
- Add outcome review queue at 5, 20, and 60 days.
- Add weekly scorecard summary to the weekly routine.

Acceptance criteria:
- Weekly report shows which modules generated useful signals.
- Repeated low-quality signals are downgraded automatically.
- Agent scorecards explain whether a module is stale, noisy, failing, or genuinely useful.

## Phase 6: Advanced Orchestrator Goals ✅ Complete (2026-05-01)

Goal: let specialist agents coordinate through the Orchestrator Agent instead of just writing adjacent notes.

Completed:
- ✅ `16_Agents/agent-manifest.json` — 16-agent registry with owners, pullers, output_dirs, output_tags, cadence, depends_on, handoff_to, confidence_threshold, blocking.
- ✅ `scripts/lib/agent-registry.mjs` — loads manifest; provides `resolveRunOrder()` (topological sort), `getAgentForOutput()` (note → owning agent), `getAgentByPuller()`, `getAgentByTags()`.
- ✅ `scripts/lib/run-ledger.mjs` — records per-puller execution status, timing, artifacts, blocking issues. Emits JSON sidecar to `scripts/.cache/orchestrator/run-ledgers/YYYY-MM-DD.json` and vault note to `05_Data_Pulls/Orchestrator/YYYY-MM-DD_Run_Ledger.md`.
- ✅ `scripts/pullers/agent-run.mjs` — orchestrated daily runner: `node run.mjs pull agent-run [--agents list] [--cadence weekly] [--skip-report] [--dry-run]`. Resolves agent order via DAG, runs each agent's daily pullers, retries failed pullers once, marks downstream agents as blocked if a blocking dependency fails, then runs streamline-report last.
- ✅ `streamline-report.mjs` updated — populates `agent_handoffs[]`, `agent_count`, and `failed_agent_count` from today's run ledger when the sidecar is built.
- ✅ `/api/run-ledger?date=YYYY-MM-DD` — returns latest (or specific) run ledger with per-puller status, timing, and artifacts.
- ✅ `/api/lineage?title=...&note_path=...` — traces why a review item is in the queue: producing agent, run ledger cross-reference, edge/strategy classification, and lineage chain (source_pull → streamline_report → review_queue).

Remaining gaps:
- Source module frontmatter does not self-tag with agent_owner / agent_scope / handoff_to (cot-report.mjs does; older pullers are a backfill task).
- Lineage graph is linear; multi-hop synthesis chains not yet modeled. Phase 8+ work.

Acceptance criteria met:
- ✅ The Streamline Report can explain why each item is present via `/api/lineage`.
- ✅ Agent dashboard, vault notes, and run ledger agree on task status — run ledger records what ran, sidecar records agent_handoffs.
- ✅ A failed module is isolated (recorded as `failed` in ledger) and does not block other agents unless `blocking: true` in the manifest.

## Phase 7: Wire Standalone Pullers Into Daily Agent Cadence ✅ Complete (2026-05-01)

Goal: close the gap between "puller exists" and "puller runs daily/weekly and produces vault notes the coverage checker can detect."

Completed:
- ✅ `daily_pullers` populated in `agent-manifest.json` for all 16 agents — manifest is now the single source of truth; `DEFAULT_DAILY_PULLERS` in agent-run.mjs is the fallback for agents that have not yet set the field.
- ✅ All Phase 3 standalone pullers (auction-features, pead-watch, pair-metrics, cash-flow-quality) are confirmed in DEFAULT_DAILY_PULLERS for their owning agents and now also in manifest `daily_pullers`.
- ✅ COT report puller added (`scripts/pullers/cot-report.mjs`) — runs on weekly cadence via macro agent `pullers` list; fetches CFTC Commitment of Traders legacy format, tracks 9 markets, detects positioning extremes and rapid shifts.
- ✅ Technical Risk dashboard panel: replaced hardcoded instruction string with a proper two-line empty-state component.
- ✅ Four Dataview vault dashboards created:
  - `00_Dashboard/Streamline Report Board.md` — 14-day report history + weekly trend
  - `00_Dashboard/Orchestrator Coverage Gaps.md` — days with coverage_gap_count > 0 + failed runs
  - `00_Dashboard/Manual Review Queue.md` — open alert-level notes requiring review
  - `00_Dashboard/Agent Signal Quality.md` — signal output by domain + COT/macro-vol regime history

Acceptance criteria met:
- ✅ `node run.mjs pull agent-run` will produce output notes for all Phase 3 modules (auction-features, pead-watch, pair-metrics, cash-flow-quality are wired in manifest daily_pullers).
- ✅ `node run.mjs pull agent-run --cadence weekly` will include cot-report via macro agent's full `pullers` list.
- ✅ Dashboard Technical Risk panel displays a clean empty-state instead of a raw instruction string.
- ✅ All four Dataview dashboards are live in `00_Dashboard/`.

Remaining gap:
- Coverage gaps for options-review and outcome-review are expected: options-review is on-demand (`--symbol`), outcome-review is weekly. The coverage checker should treat these as `on-demand` rather than `gap`.
- Older puller output notes do not self-tag `agent_owner`/`handoff_to` in frontmatter (backfill task).

## Dataview Surfaces To Add

Recommended Obsidian dashboards:
- `00_Dashboard/Streamline Report Board.md`
- `00_Dashboard/Orchestrator Coverage Gaps.md`
- `00_Dashboard/Manual Review Queue.md`
- `00_Dashboard/Agent Signal Quality.md`

Recommended Dataview fields:
- `report_schema_version`
- `cadence`
- `active_review_count`
- `coverage_gap_count`
- `new_since_last_report`
- `resolved_since_last_report`
- `failed_agent_count`
- `signal_status`

## Implementation Order

1. Add structured report schema and history endpoint. ✅
2. Add report diffing and dashboard history. ✅
3. Add review-item scoring and duplicate suppression. ✅
4. Build the strategy-to-edge classifier. ✅
5. Build auction and pair modules. ✅ (scripts built; integration pending)
6. Build PEAD and cash-flow quality modules. ✅ (scripts built; integration pending)
7. Build options checklist and outcome review loop. ✅ (scripts built; integration pending)
8. Add agent manifest and orchestrator run ledgers. ✅
9. Wire standalone pullers into daily agent cadence + COT report + Dataview dashboards (Phase 7). ✅
10. Implement confluence scoring system: `confluence-scorer.mjs` (pure engine), `confluence-scan.mjs` (daily puller), `/api/confluence` dashboard endpoint, Confluence Scan panel in index.html, options dimension marked TBD/MISSING in build guide until data source configured. ✅
11. Add feedback and scorecards (Phase 5). ← NEXT

## Operating Rule

The Streamline Report should stay conservative: signal means review, not action. Every promoted item needs evidence, invalidation, manual liquidity checks when relevant, and an outcome path.
