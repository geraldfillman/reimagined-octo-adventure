---
title: Catalyst Radar
type: dashboard
tags: [dashboard, market, catalyst, theses]
last_updated: 2026-04-02
---
# Catalyst Radar

Summary:
- Company-level review board for catalyst notes generated from thesis watchlists, technical state, and earnings timing.
- Use this after `node run.mjs thesis-catalysts` when you want the symbols that need attention before opening individual pull notes.
- Open [[Technical Risk]] for deeper tape detail and [[Earnings Calendar]] for the full event calendar.

## Urgent Catalysts

```dataview
TABLE WITHOUT ID
  file.link AS "Catalyst",
  symbol AS "Symbol",
  primary_thesis AS "Primary Thesis",
  catalyst_urgency AS "Urgency",
  next_earnings_date AS "Next Earnings",
  technical_status AS "Tech",
  technical_bias AS "Bias",
  primary_monitor_status AS "Monitor",
  date_pulled AS "Pulled"
FROM "05_Data_Pulls/Market"
WHERE data_type = "catalyst_note"
  AND (signal_status = "critical" OR signal_status = "alert")
SORT date_pulled DESC, catalyst_score DESC, symbol ASC
LIMIT 30
```

## Earnings Window

```dataview
TABLE WITHOUT ID
  file.link AS "Catalyst",
  symbol AS "Symbol",
  primary_thesis AS "Primary Thesis",
  next_earnings_date AS "Next Earnings",
  days_to_earnings AS "Days",
  technical_status AS "Tech",
  catalyst_score AS "Score"
FROM "05_Data_Pulls/Market"
WHERE data_type = "catalyst_note"
  AND next_earnings_date != null
SORT next_earnings_date ASC, catalyst_score DESC, symbol ASC
LIMIT 40
```

## High Priority Conflicts

```dataview
TABLE WITHOUT ID
  file.link AS "Catalyst",
  symbol AS "Symbol",
  primary_thesis AS "Primary Thesis",
  primary_monitor_status AS "Monitor",
  technical_status AS "Tech",
  technical_bias AS "Bias",
  has_technical_context AS "Has Tech",
  has_earnings_context AS "Has Earnings",
  next_earnings_date AS "Next Earnings"
FROM "05_Data_Pulls/Market"
WHERE data_type = "catalyst_note"
  AND primary_allocation_priority = "high"
  AND (
    primary_monitor_status != "on-track"
    OR technical_status != null
    OR has_technical_context = false
    OR has_earnings_context = false
  )
SORT date_pulled DESC, catalyst_score DESC, symbol ASC
LIMIT 40
```

## Recent Runs

```dataview
TABLE WITHOUT ID
  file.link AS "Catalyst",
  symbol AS "Symbol",
  related_theses AS "Linked Theses",
  catalyst_urgency AS "Urgency",
  signal_status AS "Status",
  date_pulled AS "Pulled"
FROM "05_Data_Pulls/Market"
WHERE data_type = "catalyst_note"
SORT date_pulled DESC, catalyst_score DESC, symbol ASC
LIMIT 50
```

## Operating Notes

1. Run `node run.mjs thesis-catalysts` after `node run.mjs fmp --thesis-watchlists` when you want fresh symbol-level review notes.
2. Use `--thesis "<name>"` or `--symbol <CSV>` when you only want one slice of the thesis book.
3. Treat missing technical or earnings coverage as a process gap before making a sizing change.
4. Use this board to decide what to open next, not as a substitute for reading the underlying thesis or pull notes.
