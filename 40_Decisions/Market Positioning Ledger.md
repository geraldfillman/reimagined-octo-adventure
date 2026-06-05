---
type: market-positioning-ledger
cadence: continuous
created: 2026-06-02
last_reviewed: 2026-06-03
last_reset: 2026-06-03
reset_reason: phase-d-regime-bootstrap
source_vault: My_Data
generated_by: bridge market-positioning-ledger
signal_status: active
sidecars:
  - "[[Market Positioning Ledger - Positions]]"
  - "[[Market Positioning Ledger - Discard Log]]"
tags:
  - reports
  - positioning
  - signal-ledger
  - market-structure
---

# Market Positioning Ledger

Purpose: one living view of market stance, evidence quality, trigger status, and outcome review. Monthly reports become playback checkpoints. Raw data and pull pipelines stay in `My_Data` per [[AGENTS|AGENTS.md]] and [[README]].

Companion files:
- [[Market Positioning Ledger - Positions]] — detailed structure, entry/exit, risk-reward, option-tag stack for every Gate≥2 row.
- [[Market Positioning Ledger - Discard Log]] — append-only noise-removal audit (what was deduped, demoted, or archived and why).

## Current Stance

| Area | Stance | Confidence | Trigger | Invalidation | Next Review |
|---|---|---:|---|---|---|
| Broad equity tape | Stand aside / prepare | Medium | Fresh breadth expansion plus confirmed liquidity support | Failed breakout, worsening credit/vol, or crowded one-way call | Weekly |
| AI power/grid theme | Press selectively | Medium | Orders, capex, utility/grid constraint evidence, and price confirmation | Theme turns into ticker-only chase without infrastructure evidence | Weekly |
| Software rally fade | Prepare | Low-medium | Exhaustion near mapped resistance plus weak breadth/flow confirmation | Breadth improves and earnings revisions confirm the move | Weekly |
| Macro liquidity friction | Observe | Medium | RRP/liquidity stress transmits into credit, funding, or vol | Liquidity friction stays contained with no market transmission | Weekly |
| Relative-value pairs | Archive / rebuild | Low | New independent signal stack and cleaner execution rules | Single-source price-only alerts continue | Monthly |

## Stance Vocabulary

| Stance | Meaning | Action Bias |
|---|---|---|
| Observe | Evidence is notable but not tradable yet. | Track and source-confirm. |
| Prepare | Thesis is plausible and needs trigger/invalidation mapped. | Build setup table and watch list. |
| Press | Evidence, timing, and trigger are aligned. | Keep active in review and outcome tracking. |
| Fade | Setup is explicitly against a stretched move. | Require clear level, stop, and catalyst. |
| Stand aside | Signal stack is noisy or contradictory. | Preserve evidence but avoid forcing a view. |
| Archive | Signal is stale, unresolved, or no longer decision-useful. | Move to stale archive with a short reason. |

## Signal Gate

| Gate | Name | Required Evidence |
|---:|---|---|
| 0 | Raw hit | One source or generated alert. |
| 1 | Eligible | At least one independent confirming source or a clear local-data reason to keep watching. |
| 2 | Stance candidate | Direction, trigger, invalidation, and time window are explicit. **Position Structure block required in Positions sidecar.** |
| 3 | Triggered | Price/action/catalyst condition fired in real time. **All Position Structure fields complete, including five option tags if applicable.** |
| 4 | Outcome reviewed | Played out, missed, noisy, or stale classification has been logged. |

## Active Ledger

> **Phase D Regime Bootstrap populated on 2026-06-03.** Active rows below were generated from refreshed My_Data Phase C evidence and committed through `scripts/agents/regime-bootstrap.mjs --stage=commit`.

| Signal / Theme | Stance | Gate | Gate Δ | Source Ref | Watchpoint | Position Block | Trigger / Watch | Invalidation | Outcome Status |
|---|---|---:|---|---|---|---|---|---|---|
| Liquidity Friction Tail Hedge | Prepare | 2 | 0→2 (2026-06-03) | `My_Data/05_Data_Pulls/Orchestrator/2026-06-02_Confluence_Scan.md` | [[Market Positioning Ledger - Positions#liquidity-friction-tail-hedge\|ledger watchpoint]] | [[Market Positioning Ledger - Positions#liquidity-friction-tail-hedge]] | Prepare a fresh entry only if VIX closes above 18.5 or VIX3M-VIX slope compresse | Stand aside if VIX remains below 17, VIX3M-VIX stays above +3.0, and credit stre | fresh seed |
| Hard Assets Debasement Watch | Observe | 1 | 0→1 (2026-06-03) | `My_Data/05_Data_Pulls/Macro/2026-06-02_Macro_Bridge_Indicators.md` | [[Market Positioning Ledger - Positions#hard-assets-dollar-debasement-watch|ledger watchpoint]] | [[Market Positioning Ledger - Positions#hard-assets-dollar-debasement-watch]] | Prepare a fresh entry only if XAUUSD reclaims the prior snapshot level near 4488 | Stand aside if XAUUSD breaks below the latest pull level of 4476.31 while the DX | fresh seed |
| Energy Shock Oil Watch | Prepare | 1 | 0→1 (2026-06-03) | `My_Data/05_Data_Pulls/SourceWatch/2026-06-02_Source_Watch_Posts.md` | [[Market Positioning Ledger - Positions#energy-shock-oil-watch|ledger watchpoint]] | [[Market Positioning Ledger - Positions#energy-shock-oil-watch]] | Prepare a fresh entry if USO closes above the auction value-area high near 137.1 | Stand aside if USO stays inside the 134.73-137.18 value area and follow-up sourc | fresh seed |
| Quality Software Dispersion | Prepare | 2 | 0→2 (2026-06-03) | `My_Data/05_Data_Pulls/Fundamentals/2026-06-02_Cash_Flow_Quality.md` | [[Market Positioning Ledger - Positions#quality-software-dispersion|ledger watchpoint]] | [[Market Positioning Ledger - Positions#quality-software-dispersion]] | Gate 3 only if a high-CFQ name confirms relative strength while a tactical short | Stand aside if auction structure remains balanced and the tactical short candida | fresh seed |

## Portfolio House View

> **Phase D House View.** Populated from the 2026-06-03 agent-neutral regime card and thesis draft.

| Asset Class | View | Key Driver | Last Updated |
|---|---|---|---|
| Equities | Prepare selectively | Risk-on trend with balanced auction structure and mixed breadth | 2026-06-03 |
| Gold | Observe | Dollar-debasement momentum exists but spot gold softened in the latest macro bridge | 2026-06-03 |
| Oil | Prepare watch | Fresh SourceWatch energy/geopolitical headline while USO remains balanced | 2026-06-03 |
| Short-End Rates | Observe | Liquidity watch has not yet become funding stress | 2026-06-03 |
| Long-End Rates | Observe | Rates stress is watch-level inside an otherwise low stress composite | 2026-06-03 |
| Credit | Observe for widening | Credit stress is clear/tight but needed as confirmation for liquidity friction | 2026-06-03 |
| Dollar | Neutral | DXY proxy modestly softened but has not confirmed a trend break | 2026-06-03 |

## Evidence Stack

Use this stack before upgrading a signal above Gate 1:

| Evidence Type | Preferred Source |
|---|---|
| Price and breadth | FMP market performance, sector scans, signal intelligence |
| Options / positioning | Positioning checklist, CFTC/COT where available, manual options reads |
| Macro/liquidity | FRED, Treasury, market-cycle monitor |
| Narrative and catalyst | SourceWatch, inbox ingestion, event-research scenarios |
| Company confirmation | FMP thesis watchlists, SEC/filing digest, company-risk scans |

## Stale Archive Routing

When a signal ages out, move or summarize it into:

| Bucket | Route | Use When |
|---|---|---|
| Positioning | [[500-archive/Stale/Positioning/_index|Stale Positioning]] | A market setup, flow read, gamma level, or positioning call is no longer active. |
| Content | [[500-archive/Stale/Content/_index|Stale Content]] | The item was mainly narrative, publishing, or candidate-content material. |
| Research | [[500-archive/Stale/Research/_index|Stale Research]] | The item was a research lead, source note, or hypothesis that did not graduate. |

Archive entries must include: original path, stale reason, last useful signal, rebuild-yes/no flag. Log the move in [[Market Positioning Ledger - Discard Log]] the same review cycle.

## Review Loop

| Cadence | Work |
|---|---|
| Daily / EOD | Add newly triggered or invalidated positioning signals. Bump Gate Δ. |
| Weekly | Re-score active stances, compress duplicate alerts, write one Discard Log batch, bump `last_reviewed`. |
| Monthly | Diff Gate Δ across the month, compare outcomes to playback report, link from `Reports/Monthly/`. |
| Ad hoc | Promote a high-conviction ledger row into a separate thesis, strategy note, or trade setup table. |

## Outcome Labels

| Label | Meaning |
|---|---|
| Played out | Direction, timing, and evidence chain were broadly right. |
| Directionally right / poorly timed | Theme was right but execution timing or vehicle selection missed. |
| Noisy | Alert fired often without a clean decision edge. |
| Missed | Important move happened without a prior ledger row or adequate trigger. |
| Stale | Evidence aged out before becoming decision-useful. |
| Rebuild | Theme still matters but the current signal design is not good enough. |

## Promotion Gate Rules

- **Gate 0 → 1:** one independent confirming source.
- **Gate 1 → 2:** direction, trigger, invalidation, time window explicit. Position Structure block opened in [[Market Positioning Ledger - Positions]].
- **Gate 2 → 3:** Position Structure complete — reasoning, entry, stop, T1/T2, max loss, reward:risk, breakeven, sizing, hold window, exit plan. If options: all five option tags filled (Direction, Protection, Income, Volatility, Defined Risk). Watchpoint link must resolve.
- **Gate 3 → 4:** outcome label assigned and logged.

## Build Notes

- Keep this as the canonical positioning surface in World_Machine.
- Use monthly reports as playback snapshots that link back here.
- Stale positioning, content, and research stay outside active review once they no longer drive a stance.
- Do not upgrade a signal above Gate 1 unless the trigger and invalidation are explicit, and above Gate 2 unless the Position Structure block is complete.
- No position-management verbs (`reduce`, `trim`, `hold`, `add`, `hedge exposure`) unless an active position is explicitly documented per [[AGENTS|AGENTS.md]] §Strategy Expression Rules.
