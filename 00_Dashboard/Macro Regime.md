---
tags: [dashboard, macro, regime]
---
# Macro Regime Dashboard

## Latest Macro Data

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  source AS "Source",
  date_pulled AS "Date",
  choice(signal_status = "critical", "🔴",
    choice(signal_status = "alert", "🟠",
      choice(signal_status = "watch", "🟡", "⚪"))) AS "Signal"
FROM "05_Data_Pulls/Macro"
SORT date_pulled DESC
LIMIT 15
```

## Rate Environment

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  date_pulled AS "Date",
  signal_status AS "Status"
FROM "05_Data_Pulls/Macro"
WHERE contains(tags, "rates") OR contains(tags, "yields") OR contains(tags, "treasury")
SORT date_pulled DESC
LIMIT 5
```

## Labor Market

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  date_pulled AS "Date",
  signal_status AS "Status"
FROM "05_Data_Pulls/Macro"
WHERE contains(tags, "labor") OR contains(tags, "employment") OR contains(tags, "unemployment")
SORT date_pulled DESC
LIMIT 5
```

## Inflation

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  date_pulled AS "Date",
  signal_status AS "Status"
FROM "05_Data_Pulls/Macro"
WHERE contains(tags, "inflation") OR contains(tags, "cpi") OR contains(tags, "pce")
SORT date_pulled DESC
LIMIT 5
```

## GDP & Income

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  date_pulled AS "Date",
  signal_status AS "Status"
FROM "05_Data_Pulls/Macro"
WHERE contains(tags, "gdp") OR contains(tags, "income") OR contains(tags, "bea")
SORT date_pulled DESC
LIMIT 5
```

## News Sentiment

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  topic AS "Topic",
  date_pulled AS "Date"
FROM "05_Data_Pulls"
WHERE contains(tags, "news") OR contains(tags, "newsapi")
SORT date_pulled DESC
LIMIT 5
```

## Key Questions

- **Yield curve shape?** → Check Rate Environment section
- **Labor tight or loosening?** → Check Labor Market section
- **Inflation hot or anchored?** → Check Inflation section
- **Growth accelerating or slowing?** → Check GDP & Income section
