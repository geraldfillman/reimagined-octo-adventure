---
title: Housing Intelligence Dashboard
type: dashboard
tags:
  - dashboard
  - housing
  - index
last_updated: 2026-03-27
---

# Housing Intelligence Dashboard

Summary:
- Housing entrypoint for source coverage, key indicators, and recent reports.
- Use this before opening national or metro source folders directly.

## Housing Data Sources

```dataview
TABLE WITHOUT ID
  file.link AS "Source",
  pricing AS "Pricing",
  priority AS "Priority",
  provides AS "Key Data",
  integrated AS "Live?"
FROM "01_Data_Sources/Housing_Real_Estate"
SORT priority ASC, name ASC
```

## Key National Indicators

| Indicator | Primary Source | Update Frequency |
|-----------|---------------|-----------------|
| Case-Shiller Home Price Index | [[FRED Housing Series]] | Monthly (2-month lag) |
| Housing Starts & Permits | [[Census Bureau Housing Data]] | Monthly |
| FHFA House Price Index | [[FHFA House Price Index]] | Quarterly + Monthly |
| Mortgage Rates (30yr) | [[FRED Housing Series]] | Weekly |
| Homeownership Rate | [[Census Bureau Housing Data]] | Quarterly |

## Key Metro Indicators

| Indicator | Primary Source | Granularity |
|-----------|---------------|------------|
| Home Values (ZHVI) | [[Zillow Research Data]] | Metro / ZIP |
| Median Sale Price | [[Redfin Data Center]] | Metro |
| Active Inventory | [[Realtor.com Research]] | Metro |
| Days on Market | [[Redfin Data Center]] | Metro |
| Fair Market Rent | [[HUD User Datasets]] | Metro / County |

## Recent Housing Reports

### National
```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  date AS "Date",
  report_type AS "Type"
FROM "01_Data_Sources/Housing_Real_Estate/National"
SORT date DESC
LIMIT 10
```

### Metro
```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  date AS "Date",
  region AS "Metro",
  report_type AS "Type"
FROM "01_Data_Sources/Housing_Real_Estate/Metro"
SORT date DESC
LIMIT 10
```

## Affordability Context

- Fair Market Rents: [[HUD User Datasets]]
- Income Limits: [[HUD User Datasets]]
- Mortgage Application Index: [[Mortgage Bankers Association]]
- Delinquency Rates: [[Mortgage Bankers Association]]

## Getting Started

1. Install the **Dataview** community plugin for tables to render
2. Mark sources as `integrated: true` in their frontmatter as you connect them
3. Use the **Housing Report** template in `03_Templates/` to write new reports
4. Link reports to the sources they reference using `[[wikilinks]]`
