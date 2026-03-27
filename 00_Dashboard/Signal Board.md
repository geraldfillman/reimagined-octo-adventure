---
tags: [dashboard, signals]
---
# Signal Board

## Active Alerts

```dataview
TABLE WITHOUT ID
  choice(signal_status = "critical", "🔴",
    choice(signal_status = "alert", "🟠",
      choice(signal_status = "watch", "🟡", "⚪"))) AS "Level",
  file.link AS "Report",
  domain AS "Domain",
  date_pulled AS "Date",
  signal_status AS "Status"
FROM "05_Data_Pulls"
WHERE signal_status = "critical" OR signal_status = "alert"
SORT date_pulled DESC
```

## Watch Items

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  domain AS "Domain",
  date_pulled AS "Date"
FROM "05_Data_Pulls"
WHERE signal_status = "watch"
SORT date_pulled DESC
LIMIT 20
```

## Signal History

```dataview
TABLE WITHOUT ID
  file.link AS "Signal",
  signal_id AS "Signal ID",
  severity AS "Severity",
  date AS "Date"
FROM "06_Signals"
SORT date DESC
LIMIT 30
```

## All Clear

```dataview
LIST
FROM "05_Data_Pulls"
WHERE signal_status = "clear"
GROUP BY domain
```
