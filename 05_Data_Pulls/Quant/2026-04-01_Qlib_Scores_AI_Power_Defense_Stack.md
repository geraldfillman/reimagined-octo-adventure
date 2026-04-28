---
title: "Qlib Scores — AI Power Defense Stack (2026-03-30)"
source: "Qlib"
date_pulled: "2026-04-01"
domain: "quant"
data_type: "factor_scores"
frequency: "daily"
signal_status: "alert"
signals: ["FACTOR_AVOID", "FACTOR_BUY_SIGNAL", "FACTOR_AVOID"]
tags: ["qlib", "factor-scores", "ai_power_defense_stack"]
universe: "AI Power Defense Stack"
ticker_count: 5
scoring_date: "2026-03-30"
qlib_schema_version: 2
universe_size: 5
alert_count: 3
top_ticker: "PLTR"
top_score: 100.0
strong_buy_count: 1
buy_count: 0
watch_count: 1
avoid_count: 2
top_factor: "MAX30"
top_factor_weight: 0.0751
---

## Ranked Watchlist

| Rank | Ticker | Score | Signal | MAX30 | MAX60 | IMAX20 | IMAX30 | MAX20 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | PLTR | 100.0 | STRONG_BUY | 1.1807 | 1.3615 | 0.8000 | 0.8667 | 1.1807 |
| 2 | MSFT | 50.4 | NEUTRAL | 1.1507 | 1.3611 | 0.2000 | 0.4667 | 1.1507 |
| 3 | AMZN | 26.3 | WATCH | 1.0971 | 1.2388 | 0.1500 | 0.4333 | 1.0971 |
| 4 | ETN | 21.4 | AVOID | 1.1521 | 1.1853 | 0.8500 | 0.0667 | 1.1075 |
| 5 | GEV | 0.0 | AVOID | 1.1603 | 1.1603 | 0.8500 | 0.9000 | 1.1603 |

## Alerts

- **WATCH** ETN: ETN: composite score 21.4 (rank #4) in bottom quartile — avoid or reduce exposure
- **ALERT** GEV: GEV: MAX30=1.1603 is above the 2-sigma threshold (1.1435) — mean-reversion buy signal (IC=+0.0751)
- **WATCH** GEV: GEV: composite score 0.0 (rank #5) in bottom quartile — avoid or reduce exposure

## Factor Weights

| Factor | IC Weight |
| --- | --- |
| MAX30 | 0.0751 |
| MAX60 | 0.0723 |
| IMAX20 | -0.0666 |
| IMAX30 | -0.0635 |
| MAX20 | 0.0626 |
