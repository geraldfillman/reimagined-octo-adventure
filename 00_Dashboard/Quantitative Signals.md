# Quantitative Signals

Primary operator board for Qlib reporting. Use `node scripts/run.mjs qlib refresh --thesis "<name>"` for the default factor + score + thesis-rollup workflow, and add `--with-backtest` when you want a fresh simulation run.

## Thesis Quant Rollup

```dataview
TABLE
  conviction AS "Conviction",
  allocation_priority AS "Priority",
  qlib_signal_status AS "Quant",
  qlib_best_ic AS "Best IC",
  qlib_positive_factor_count AS "+IC",
  qlib_universe_size AS "Universe",
  qlib_backtest_sharpe AS "Sharpe",
  qlib_last_score_date AS "Score Date",
  qlib_last_backtest_date AS "Backtest Date",
  qlib_last_run AS "Last Run"
FROM "10_Theses"
WHERE qlib_last_run != null
SORT qlib_last_run DESC, allocation_rank ASC, file.name ASC
```

## Fresh Score Alerts

```dataview
TABLE
  universe AS "Universe",
  signal_status AS "Signal",
  alert_count AS "Alerts",
  top_ticker AS "Top Ticker",
  top_score AS "Top Score",
  strong_buy_count AS "Strong Buys",
  avoid_count AS "Avoids",
  scoring_date AS "Score Date",
  file.link AS "Report"
FROM "05_Data_Pulls/Quant"
WHERE data_type = "factor_scores"
  AND (signal_status != "clear" OR date(date_pulled) >= date(today) - dur(3 days))
SORT date_pulled DESC
```

## Backtest Health

```dataview
TABLE
  universe AS "Universe",
  sharpe AS "Sharpe",
  annual_return AS "Ann. Return",
  max_drawdown AS "Max DD",
  win_rate AS "Win Rate",
  avg_turnover AS "Turnover",
  total_trades AS "Trades",
  qlib_schema_version AS "Schema",
  file.link AS "Report"
FROM "05_Data_Pulls/Quant"
WHERE data_type = "backtest"
SORT date_pulled DESC
```

## Stale Or Missing Quant Coverage

```dataview
TABLE
  allocation_priority AS "Priority",
  conviction AS "Conviction",
  qlib_signal_status AS "Quant",
  qlib_last_run AS "Last Run"
FROM "10_Theses"
WHERE node_type = "thesis"
  AND (qlib_last_run = null OR date(today) - date(qlib_last_run) > dur(7 days))
SORT allocation_rank ASC, file.name ASC
```

## Recent Quant Notes

```dataview
TABLE
  data_type AS "Type",
  universe AS "Universe",
  signal_status AS "Signal",
  date_pulled AS "Date",
  file.link AS "Report"
FROM "05_Data_Pulls/Quant"
SORT date_pulled DESC
LIMIT 20
```
