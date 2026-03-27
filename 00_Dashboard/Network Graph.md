---
tags: [dashboard, network, graph, infranodus]
---

# Network Graph Dashboard

Use [[InfraNodus Measurements]] when you want cluster, gap, and bridge analysis instead of a raw Obsidian graph. Use [[InfraNodus Graph Measurements]] for the measurement workflow and plugin defaults.

## All Entities
```dataview
TABLE node_type AS "Type", status, length(bullish_drivers) AS "Bull", length(bearish_drivers) AS "Bear"
FROM "08_Entities" OR "09_Macro" OR "10_Theses"
WHERE node_type
SORT node_type ASC, file.name ASC
```

## Active Macro Regimes
```dataview
TABLE confidence, length(key_indicators) AS "Indicators", length(favors_sectors) AS "Favors", length(hurts_sectors) AS "Hurts"
FROM "09_Macro/Regimes"
WHERE status = "Active"
SORT confidence DESC
```

## Stocks by Sector
```dataview
TABLE ticker, sector, country, status
FROM "08_Entities/Stocks"
SORT sector ASC, ticker ASC
```

## Commodities Overview
```dataview
TABLE commodity_type AS "Type", length(key_countries) AS "Countries", length(key_sectors) AS "Sectors"
FROM "08_Entities/Commodities"
SORT commodity_type ASC
```

## Macro Indicators by Category
```dataview
TABLE frequency, source, trend, length(parent_regimes) AS "Regimes"
FROM "09_Macro/Indicators"
SORT file.name ASC
```

## Bridge Candidates
```dataview
TABLE WITHOUT ID
  file.link AS "Node",
  node_type AS "Type",
  length(bullish_drivers) AS "Bull",
  length(bearish_drivers) AS "Bear",
  length(related_entities) AS "Related"
FROM "08_Entities" OR "09_Macro" OR "10_Theses"
WHERE node_type AND (length(bullish_drivers) > 0 OR length(bearish_drivers) > 0) AND length(related_entities) > 0
SORT length(related_entities) DESC, length(bullish_drivers) DESC, length(bearish_drivers) DESC
LIMIT 20
```

## Orphan Detection (Low Connectivity)
```dataview
TABLE WITHOUT ID
  file.link AS "Node",
  node_type AS "Type"
FROM "08_Entities" OR "09_Macro" OR "10_Theses"
WHERE node_type AND length(bullish_drivers) = 0 AND length(bearish_drivers) = 0 AND length(related_entities) = 0
SORT node_type ASC
```

## How To Use

- Open the local Obsidian graph when you want visual sanity-checks.
- Open [[InfraNodus Measurements]] when you want graph measurements and gap detection.
- Open one folder at a time in InfraNodus for cleaner results.
