---
title: "2026-05-02 Signal Quality Scan"
source: "Vault Orchestrator"
date_pulled: "2026-05-02"
domain: "orchestrator"
agent_owner: "orchestrator"
agent_scope: "orchestrator"
data_type: "signal_quality"
frequency: "daily"
cadence: "daily"
window_days: 30
modules_scored: 9
low_quality_modules: []
top_module: "auction-features"
bottom_module: "cot-report"
signal_status: "clear"
signals: []
tags: ["signal-quality", "phase5", "scorecard"]
---

## Module Scorecards

| Module | Composite | Hit Rate | Noise | Reliability | Freshness | Assessed | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| auction-features | 80% | 50% | 0% | 100% | 100% | — | ✅ reliable |
| pead-watch | 80% | 50% | 0% | 100% | 100% | — | ✅ reliable |
| pair-metrics | 80% | 50% | 0% | 100% | 100% | — | ✅ reliable |
| macro-volatility | 80% | 50% | 0% | 100% | 100% | — | ✅ reliable |
| cboe | 80% | 50% | 0% | 100% | 100% | — | ✅ reliable |
| fred | 80% | 50% | 0% | 100% | 100% | — | ✅ reliable |
| confluence-scan | 80% | 50% | 0% | 100% | 100% | — | ✅ reliable |
| cash-flow-quality | 79% | 50% | 0% | 100% | 86% | — | ✅ reliable |
| cot-report | 65% | 50% | 0% | 50% | 50% | — | ✅ reliable |

## Score Key

- **Composite** = Hit Rate × 0.4 + (1 − Noise) × 0.3 + Reliability × 0.2 + Freshness × 0.1
- **Hit Rate** — share of acked notes marked reviewed/journaled (vs ignored); uses outcome-review confirmation when available.
- **Noise** — share of acked notes marked ignored.
- **Reliability** — success rate from run ledger over the window.
- **Freshness** — how recently the puller last succeeded (full score ≤ 1 day, zero at 7+ days).
- **Low quality** threshold: composite < 0.3. Low-quality modules are capped at 2 signals in daily Streamline Reports.
