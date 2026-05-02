---
title: "Agent Signal Quality"
type: "dashboard"
tags: ["dashboard", "signal-quality", "agents", "orchestrator"]
---

# Agent Signal Quality

Signal output and quality metrics by domain agent, rolling 30 days.

## Module Scorecards — Latest Scan

```dataview
TABLE WITHOUT ID
  top_module AS "Top Module",
  bottom_module AS "Bottom Module",
  modules_scored AS "Scored",
  join(low_quality_modules, ", ") AS "Low Quality",
  signal_status AS "Status",
  date_pulled AS "Date"
FROM "05_Data_Pulls/Orchestrator"
WHERE data_type = "signal_quality"
SORT date_pulled DESC
LIMIT 1
```

## Signal Output by Domain

```dataview
TABLE
  length(rows) AS "Notes",
  length(filter(rows, (r) => r.signal_status = "alert" OR r.signal_status = "critical")) AS "Alerts",
  length(filter(rows, (r) => r.signal_status = "watch")) AS "Watch",
  length(filter(rows, (r) => r.signal_status = "clear")) AS "Clear"
FROM "05_Data_Pulls"
WHERE date(date_pulled) >= date(today) - dur(30 days)
  AND domain != null
GROUP BY domain
SORT length(rows) DESC
```

## COT Report — Positioning History

```dataview
TABLE
  report_date AS "Report Date",
  signal_status AS "Status",
  signal_count AS "Signals",
  markets_tracked AS "Markets"
FROM "05_Data_Pulls/Macro"
WHERE data_type = "cot_report"
SORT report_date DESC
LIMIT 12
```

## Macro Volatility — Regime History

```dataview
TABLE
  stress_regime AS "Regime",
  stress_pct AS "Stress%",
  signal_status AS "Status",
  date_pulled AS "Date"
FROM "05_Data_Pulls/Macro"
WHERE data_type = "macro_volatility"
SORT date_pulled DESC
LIMIT 12
```
