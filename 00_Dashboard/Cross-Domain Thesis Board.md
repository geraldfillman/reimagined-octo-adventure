---
tags: [dashboard, thesis, cross-domain]
---
# Cross-Domain Thesis Board

## Active Signals Across Domains

```dataview
TABLE WITHOUT ID
  choice(signal_status = "critical", "🔴",
    choice(signal_status = "alert", "🟠",
      choice(signal_status = "watch", "🟡", "⚪"))) AS "",
  file.link AS "Report",
  domain AS "Domain",
  date_pulled AS "Date"
FROM "05_Data_Pulls"
WHERE signal_status != "clear" AND signal_status != null
SORT date_pulled DESC
```

## Housing + Macro Convergence

Is macro pressure affecting housing?

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  domain AS "Domain",
  signal_status AS "Signal",
  date_pulled AS "Date"
FROM "05_Data_Pulls"
WHERE (domain = "housing" OR domain = "macro") AND signal_status != "clear" AND signal_status != null
SORT date_pulled DESC
LIMIT 10
```

## Government + Disaster Risk

Where is federal spending going? Are disasters affecting housing markets?

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  source AS "Source",
  signal_status AS "Signal",
  date_pulled AS "Date"
FROM "05_Data_Pulls/Government"
SORT date_pulled DESC
LIMIT 10
```

## Biotech Pipeline

Recent FDA activity and healthcare news.

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  source AS "Source",
  signal_status AS "Signal",
  date_pulled AS "Date"
FROM "05_Data_Pulls/Biotech"
SORT date_pulled DESC
LIMIT 10
```

## Market Snapshots

Latest equity data and company profiles.

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  source AS "Source",
  date_pulled AS "Date"
FROM "05_Data_Pulls/Market"
SORT date_pulled DESC
LIMIT 10
```

## Cross-Domain Thesis Templates

| Thesis | Data Sources | Key Question |
|--------|-------------|--------------|
| **Housing Cycle** | FRED housing + rates + labor, OpenFEMA | Is housing expanding, peaking, cooling, or contracting? |
| **Recession Watch** | FRED rates + labor + credit, Treasury, BEA GDP | What's the recession probability over next 12 months? |
| **Biotech Catalyst** | FDA approvals, NewsAPI health | Which therapy areas are seeing concentrated approval activity? |
| **GovCon Pipeline** | USASpending, SAM.gov | Which companies are winning large federal contracts? |
| **Regional Risk** | OpenFEMA + housing + Socrata permits | Which metros have elevated disaster risk AND rising housing? |
| **Energy Transition** | EIA, NOAA storms | Is energy supply/demand shifting? Are storms disrupting infrastructure? |

## How to Read This Board

1. **Check Active Signals** — any 🔴 or 🟠 requires immediate attention
2. **Check Convergence** — signals in multiple domains pointing the same direction = high conviction
3. **Check Freshness** — stale data means blind spots. See [[Data Freshness]] dashboard
4. **Run Playbooks** — use `node run.mjs playbook housing-cycle` for automated multi-source analysis
