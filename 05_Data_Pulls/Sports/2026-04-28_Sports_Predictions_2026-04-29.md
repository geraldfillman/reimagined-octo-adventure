---
title: "Sports Prediction Ledger - 2026-04-29"
source: "ESPN scoreboard + OddsHarvester local cache"
date_pulled: "2026-04-28"
event_date: "2026-04-29"
domain: "sports"
data_type: "sports_predictions"
frequency: "on-demand"
signal_status: "watch"
signals: ["sports_predictions_source_error:baseball", "sports_predictions_source_error:baseball", "sports_predictions_source_error:basketball", "sports_predictions_source_error:ice-hockey"]
prediction_count: 0
pass_count: 0
unmatched_odds_count: 0
tags: ["sports", "predictions", "backtesting-input", "market-consensus"]
---

## Executive Summary

Event date: 2026-04-29
Model: multi-factor-v1
Minimum edge: 0.00%
Prediction candidates: 0
Pass candidates: 0
Unmatched odds records: 0
Ledger: No ledger written; no candidates met the filter
Pass rows included in CSV: no

This note records research predictions for later settlement and calibration. It is not a recommendation engine; it preserves the variables available at prediction time so the process can be backtested without hindsight edits.

## Prediction Candidates

No prediction candidates met the minimum edge filter.

## Pass Candidates

No pass candidates were generated.

## Unmatched Odds

No unmatched odds rows were available because one or more source/cache inputs failed.

## Source Coverage

| Sport | League | ESPN Events | Odds Records | Predictions | Passes | Unmatched | Status | Odds File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseball | mlb | 15 | 0 | 0 | 0 | 0 | Odds cache missing: scripts\.cache\sports\odds\2026-04-29\upcoming_2026-04-29_baseball_mlb_home_away.json | scripts\.cache\sports\odds\2026-04-29\upcoming_2026-04-29_baseball_mlb_home_away.json |
| baseball | mlb | 15 | 0 | 0 | 0 | 0 | Odds cache missing: scripts\.cache\sports\odds\2026-04-29\upcoming_2026-04-29_baseball_mlb_home_away_1st_half.json | scripts\.cache\sports\odds\2026-04-29\upcoming_2026-04-29_baseball_mlb_home_away_1st_half.json |
| basketball | nba | 3 | 0 | 0 | 0 | 0 | Odds cache missing: scripts\.cache\sports\odds\2026-04-29\upcoming_2026-04-29_basketball_nba_home_away.json | scripts\.cache\sports\odds\2026-04-29\upcoming_2026-04-29_basketball_nba_home_away.json |
| ice-hockey | nhl | 3 | 0 | 0 | 0 | 0 | Odds cache missing: scripts\.cache\sports\odds\2026-04-29\upcoming_2026-04-29_ice-hockey_nhl_home_away.json | scripts\.cache\sports\odds\2026-04-29\upcoming_2026-04-29_ice-hockey_nhl_home_away.json |

## Ledger Contract

The CSV is compatible with `sports-backtest` because it includes `date`, `event`, `market`, `selection`, `model_probability`, `result`, `stake`, and `odds_decimal`.
Prediction rows start with `result: pending`. A later settlement step should fill `result`, final scores, and closing odds.
`variable_snapshot` is JSON captured before the event: probables, venue, weather risk, slate score, selected side, book count, and source file pointers.
