---
title: Sports Prediction Board
type: dashboard
tags: [dashboard, sports, predictions, calibration, backtesting]
last_updated: 2026-04-27
---

# Sports Prediction Board

Operator board for open sports prediction ledgers, settlement status, backtest notes, and calibration summaries.

## Daily Commands

Roadmap: `07_Playbooks/2026-04-28_Sports_Roadmap.md`.

```powershell
node run.mjs pull sports --date <YYYY-MM-DD>
node run.mjs pull sports-odds --date <YYYY-MM-DD>
node run.mjs pull sports-predictions --date <YYYY-MM-DD> --include-pass
node run.mjs pull sports-settle --date <YYYY-MM-DD> --capture-closing-lines
node run.mjs pull sports-backtest --ledger scripts/.cache/sports/predictions/<YYYY-MM-DD>_predictions.csv
node run.mjs pull sports-calibration
```

For closing-line value, run `sports-odds` shortly before start time, then run `sports-settle --capture-closing-lines` after the event is final or during the pending window if you only want to stamp the closing price.

## Latest Prediction Ledgers

```dataview
TABLE
  event_date AS "Event Date",
  prediction_count AS "Predictions",
  pass_count AS "Passes",
  unmatched_odds_count AS "Unmatched Odds",
  signal_status AS "Status",
  signals AS "Signals"
FROM "05_Data_Pulls/Sports"
WHERE data_type = "sports_predictions"
SORT event_date DESC, date_pulled DESC
LIMIT 14
```

## Daily Slates With Pending Push

```dataview
TABLE
  event_date AS "Event Date",
  event_count AS "Events",
  pending_prediction_count AS "Pending Predictions",
  signal_status AS "Status"
FROM "05_Data_Pulls/Sports"
WHERE data_type = "sports_daily_slate"
SORT event_date DESC, date_pulled DESC
LIMIT 14
```

## Latest Settlements

```dataview
TABLE
  settled_count AS "Settled",
  pending_count AS "Pending",
  wins AS "Wins",
  losses AS "Losses",
  pushes AS "Pushes",
  roi AS "Unit ROI",
  signal_status AS "Status"
FROM "05_Data_Pulls/Sports"
WHERE data_type = "sports_settlement"
SORT date_pulled DESC
LIMIT 10
```

## Latest Backtests

```dataview
TABLE
  settled_count AS "Settled",
  pending_count AS "Pending",
  roi AS "ROI",
  brier_score AS "Brier",
  average_clv AS "Avg CLV",
  signal_status AS "Status",
  signals AS "Signals"
FROM "05_Data_Pulls/Sports"
WHERE data_type = "sports_backtest"
SORT date_pulled DESC
LIMIT 10
```

## Latest Calibration Notes

```dataview
TABLE
  prediction_count_total AS "Total Rows",
  prediction_count_settled AS "Eligible",
  signal_status AS "Status",
  signals AS "Signals"
FROM "05_Data_Pulls/Sports"
WHERE data_type = "sports_calibration"
SORT date_pulled DESC
LIMIT 10
```

## Reference Links

- `04_Reference/Sports Prediction System.md`
- `04_Reference/Sports Implied Probability Cheat Sheet.md`
- `00_Dashboard/Sports Calibration.md`
