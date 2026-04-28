---
title: Data Freshness
type: dashboard
tags: [dashboard, freshness, maintenance]
last_updated: 2026-03-27
---
# Data Freshness

Summary:
- Freshness monitor for generated pull notes across all domains.
- Use this dashboard before rerunning pullers so refresh effort stays targeted.

## Base View

![[Data Freshness.base]]

## Stale Data (7+ Days Old)

```dataview
TABLE WITHOUT ID
  file.link AS "Pull",
  domain AS "Domain",
  source AS "Source",
  date_pulled AS "Last Pull",
  dateformat(date(today) - date(date_pulled), "d") AS "Days Stale"
FROM "05_Data_Pulls"
WHERE date_pulled != null AND (date(today) - date(date_pulled)) > dur(7 days)
SORT date_pulled ASC
```

## Fresh Data (Last 3 Days)

```dataview
TABLE WITHOUT ID
  file.link AS "Pull",
  domain AS "Domain",
  source AS "Source",
  choice(signal_status = "critical", "🔴",
    choice(signal_status = "alert", "🟠",
      choice(signal_status = "watch", "🟡", "⚪"))) AS "Signal"
FROM "05_Data_Pulls"
WHERE date_pulled != null AND (date(today) - date(date_pulled)) <= dur(3 days)
SORT date_pulled DESC
```

## Pull Counts by Domain

```dataview
TABLE WITHOUT ID
  domain AS "Domain",
  length(rows) AS "Total Pulls"
FROM "05_Data_Pulls"
WHERE domain != null
GROUP BY domain
SORT length(rows) DESC
```

## Recommended Refresh Schedule

| Domain | Frequency | Command |
|--------|-----------|---------|
| Macro (Rates) | Weekly | `node run.mjs fred --group rates` |
| Macro (Labor) | Monthly | `node run.mjs fred --group labor` |
| Macro (Inflation) | Monthly | `node run.mjs fred --group inflation` |
| Macro (GDP) | Quarterly | `node run.mjs bea --gdp` |
| Housing | Monthly | `node run.mjs fred --group housing` |
| Biotech | Monthly | `node run.mjs fda --recent-approvals` |
| Government | Monthly | `node run.mjs openfema --recent` |
| Government | Monthly | `node run.mjs usaspending --recent` |
| Market Quotes | On-demand | `node run.mjs fmp --quote SPY` |
| News | Weekly | `node run.mjs newsapi --topic business` |
| Local Data | Monthly | `node run.mjs socrata --permits` |
| Treasury | Monthly | `node run.mjs treasury --yields` |
