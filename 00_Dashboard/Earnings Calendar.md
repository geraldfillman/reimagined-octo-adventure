---
title: Earnings Calendar
type: dashboard
tags: [dashboard, market, earnings, catalysts]
last_updated: 2026-04-02
---
# Earnings Calendar

Summary:
- Catalyst timing board for FMP earnings-calendar pulls across broad market and watchlist scopes.
- Use this after `node run.mjs fmp --earnings-calendar` runs when you need to know which names are reporting next.
- Open [[Technical Risk]] when the same names also need a trend and damage check.

## Calendar Pull History

```dataview
TABLE WITHOUT ID
  file.link AS "Pull",
  calendar_scope AS "Scope",
  calendar_from AS "From",
  calendar_to AS "To",
  earnings_row_count AS "Rows",
  next_earnings_date AS "Next Date",
  earnings_today_count AS "Today",
  earnings_upcoming_count AS "Upcoming",
  earnings_recent_count AS "Recent",
  date_pulled AS "Pulled"
FROM "05_Data_Pulls/Market"
WHERE data_type = "calendar"
SORT date_pulled DESC
LIMIT 20
```

## Broad Market Snapshots

```dataview
TABLE WITHOUT ID
  file.link AS "Pull",
  calendar_from AS "From",
  calendar_to AS "To",
  earnings_row_count AS "Rows",
  next_earnings_date AS "Next Date",
  today_symbols AS "Today Symbols",
  upcoming_symbols AS "Upcoming Symbols"
FROM "05_Data_Pulls/Market"
WHERE data_type = "calendar"
  AND calendar_scope = "broad"
SORT date_pulled DESC
LIMIT 15
```

## Watchlist Runs

```dataview
TABLE WITHOUT ID
  file.link AS "Pull",
  filtered_symbols AS "Filter",
  next_earnings_date AS "Next Date",
  earnings_today_count AS "Today",
  earnings_upcoming_count AS "Upcoming",
  today_symbols AS "Today Symbols",
  upcoming_symbols AS "Upcoming Symbols",
  date_pulled AS "Pulled"
FROM "05_Data_Pulls/Market"
WHERE data_type = "calendar"
  AND calendar_scope = "watchlist"
SORT date_pulled DESC
LIMIT 20
```

## Calendar Gaps

```dataview
TABLE WITHOUT ID
  file.link AS "Pull",
  calendar_scope AS "Scope",
  calendar_from AS "From",
  calendar_to AS "To",
  earnings_row_count AS "Rows",
  signal_status AS "Status",
  date_pulled AS "Pulled"
FROM "05_Data_Pulls/Market"
WHERE data_type = "calendar"
  AND signal_status = "watch"
SORT date_pulled DESC
```

## Operating Notes

1. Run `node run.mjs fmp --earnings-calendar --from YYYY-MM-DD --to YYYY-MM-DD` for the broad tape.
2. Use `--symbol` or `--symbols` for thesis baskets when you want a tighter catalyst window.
3. Treat `next_earnings_date` as the anchor for follow-up note creation, sizing review, and technical checks.
4. Older earnings notes may not show the new summary fields until a fresh pull writes them.
5. Run `node run.mjs thesis-fmp-sync` after earnings pulls if you want thesis boards to inherit the latest catalyst dates.
