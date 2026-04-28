---
title: Sports Calibration
type: dashboard
tags: [dashboard, sports, calibration, model-evaluation]
last_updated: 2026-04-27
---

# Sports Calibration

Paper-only model-evaluation board for the multi-factor sports prediction ledger
(`MODEL_VERSION = multi-factor-v1`). Every metric here is computed from
historical predictions whose outcomes have already been settled — there is no
real-money execution and no live network call from the calibration loop.

Runs on demand via:

```
node run.mjs pull sports-calibration
node run.mjs pull sports-calibration --since 2026-01-01
node run.mjs pull sports-calibration --sport mlb
node run.mjs pull sports-calibration --dry-run
```

Each run writes a dated note to `05_Data_Pulls/Sports/<date>_Sports_Calibration.md`.

## Latest Calibration Notes

```dataview
TABLE
  prediction_count_total AS "Total Rows",
  prediction_count_settled AS "Eligible (settled win/loss)",
  signal_status AS "Status",
  signals AS "Signals"
FROM "05_Data_Pulls/Sports"
WHERE data_type = "sports_calibration"
SORT date_pulled DESC
LIMIT 10
```

## Active Calibration Watches

```dataview
LIST
FROM "05_Data_Pulls/Sports"
WHERE data_type = "sports_calibration" AND signal_status = "watch"
SORT date_pulled DESC
LIMIT 5
```

## How To Read This Board

### Implied probability cheat sheet

Formula reference: `04_Reference/Sports Implied Probability Cheat Sheet.md`.
This covers American odds to implied probability, vig removal, book dispersion,
and how `model_probability` is blended back toward the no-vig market baseline.

### Brier score

The mean squared error between forecast probability and outcome (0/1). Lower is
better. Useful reference points:

- **0.000** — a clairvoyant always-right model.
- **~0.247** — a perfectly de-vigged market line on roughly 50/50 events. This
  is the calibration *floor* the multi-factor model must beat to be additive.
- **0.250** — a coin flip (always 0.5).
- **>0.250** — worse than guessing; check for sign errors or stale weights.

The per-sport Brier in each calibration note is your headline number. If a
sport's Brier sits above 0.247 with N >= 100 settled rows, the model is
adding noise rather than information for that sport.

### Log loss

Penalises confident wrong calls heavily. Reference points:

- **0.000** — perfect.
- **~0.693** — uninformative (always 0.5).
- **>0.693** — worse than uninformative; the model's high-conviction rows are
  hurting more than its safe rows are helping.

### Reliability buckets

Predictions are bucketed in 10% bins (0-10%, 10-20%, ...). For each bucket the
note shows the mean predicted probability and the actual win rate. A
well-calibrated model has `observed - predicted ≈ 0` in every bucket with
N >= 30. Deviations greater than 10% trigger the
`sports_calibration_miscalibrated` signal.

### Information coefficient (IC)

Spearman rank correlation between a factor's contribution to the model's
log-odds and the binary outcome (1 = win, 0 = loss). Pure rank-based, so it is
robust to outliers and to whatever scale the factor uses.

- **|IC| < 0.02** — noise.
- **0.02–0.05** — directionally suggestive, not actionable.
- **0.05–0.10** — meaningful edge for a single factor.
- **> 0.10** — strong signal; double-check there's no leakage.

The calibration note filters out factors with N < 30 paired observations
because rank correlation on a tiny sample is unreliable.

### When to act on weight recommendations

Two thresholds gate the recommended-weight column:

1. **N >= 100** paired observations for the factor.
2. **|IC| >= 0.05**.

Only factor/sport combos that pass both produce a `recommendedWeight` value.
The recommendation is `current × (1 + IC)`, clamped to `[0.1, 3 × current]` so
no single update can flip a factor's sign or triple-it-and-then-some in one
pass. The JSON block at the bottom of each calibration note is meant to be
copy-pasted into `scripts/lib/sports/weights/<sport>.json` after a manual
sanity check.

Until the threshold is met, no recommendation appears. That is the point — the
loop should *only* speak when it has enough sample to speak meaningfully.

### Why we are paper-only

The whole sports stack here is a measurement instrument, not an execution
desk. The `stake` column is in fake units, every "P/L" is paper P/L, and the
multi-factor model exists to be falsified by reality, not to size positions.
If a sport's Brier never drops below the market baseline, that sport has not
earned the right to be acted on.

## Empty-State Behaviour

If no settled `multi-factor-v1` predictions exist yet, the calibration note is
still written: it shows zero in `prediction_count_settled`, an explicit empty
state on the per-sport / per-factor / reliability tables, and emits the
`sports_calibration_no_eligible_rows` signal. The Dataview tables above will
list the row but with an empty `signals` field beyond that one note. This is
normal during phase-in — the multi-factor predictions only entered the ledger
in Phase 3, so calibration starts contributing data once a few weeks of
settled rows accumulate.

## Cross-References

- Operator board: `00_Dashboard/Sports Prediction Board.md`.
- Backtest ROI/CLV/calibration board: `00_Dashboard/Quantitative Signals.md`
  and `05_Data_Pulls/Sports/*_Sports_Backtest_*.md`.
- Settlement notes: `05_Data_Pulls/Sports/*_Sports_Settlement_*.md`.
- Model code: `scripts/pullers/sports-predictions.mjs`,
  `scripts/lib/sports/scoring.mjs`, `scripts/lib/sports/factor-registry.mjs`.
- Calibration code: `scripts/pullers/sports-calibration.mjs`,
  `scripts/lib/sports/calibration-math.mjs`.
