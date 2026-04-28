---
title: Technical Risk
type: dashboard
tags: [dashboard, market, technical, risk]
last_updated: 2026-04-02
---
# Technical Risk

Summary:
- Technical review board for FMP-driven price trend, momentum, and moving-average damage.
- Use this after `node run.mjs fmp --technical <SYMBOL>` runs or before changing size in market-sensitive theses.
- Open [[Earnings Calendar]] when catalyst timing matters as much as tape damage.

## Active Technical Alerts

```dataview
TABLE WITHOUT ID
  file.link AS "Snapshot",
  symbol AS "Symbol",
  interval AS "Interval",
  signal_status AS "Status",
  technical_bias AS "Bias",
  rsi14 AS "RSI 14",
  price_vs_sma200_pct AS "Vs 200D %",
  date_pulled AS "Date"
FROM "05_Data_Pulls/Market"
WHERE data_type = "technical_snapshot"
  AND signal_status != "clear"
SORT date_pulled DESC, technical_signal_count DESC, symbol ASC
LIMIT 25
```

## Technical Tape

```dataview
TABLE WITHOUT ID
  file.link AS "Snapshot",
  symbol AS "Symbol",
  close AS "Close",
  change_pct AS "Chg %",
  momentum_state AS "Momentum",
  technical_bias AS "Bias",
  price_vs_sma20_pct AS "Vs 20D %",
  price_vs_sma50_pct AS "Vs 50D %",
  price_vs_sma200_pct AS "Vs 200D %",
  technical_signal_count AS "Signals"
FROM "05_Data_Pulls/Market"
WHERE data_type = "technical_snapshot"
  AND close != null
SORT date_pulled DESC, technical_signal_count DESC, symbol ASC
LIMIT 30
```

## Momentum Extremes

```dataview
TABLE WITHOUT ID
  file.link AS "Snapshot",
  symbol AS "Symbol",
  rsi14 AS "RSI 14",
  momentum_state AS "Momentum",
  technical_bias AS "Bias",
  date_pulled AS "Date"
FROM "05_Data_Pulls/Market"
WHERE data_type = "technical_snapshot"
  AND rsi14 != null
  AND (rsi14 >= 70 OR rsi14 <= 30)
SORT date_pulled DESC, rsi14 DESC, symbol ASC
LIMIT 20
```

## Bias Mix

```dataview
TABLE WITHOUT ID
  technical_bias AS "Bias",
  length(rows) AS "Snapshots"
FROM "05_Data_Pulls/Market"
WHERE data_type = "technical_snapshot"
  AND technical_bias != null
GROUP BY technical_bias
SORT length(rows) DESC
```

## Operating Notes

1. Run `node run.mjs fmp --technical <SYMBOL>` before using this board for a thesis sizing decision.
2. Treat `signal_status != clear` plus `technical_bias = bearish` as a review trigger, not an automatic sell rule.
3. Use `Momentum Extremes` to spot names that need confirmation from fundamentals or catalysts.
4. Older technical notes may not show the normalized summary fields until the next fresh pull writes them.
5. Run `node run.mjs thesis-fmp-sync` after fresh technical pulls if you want the thesis dashboards to inherit this tape view.
