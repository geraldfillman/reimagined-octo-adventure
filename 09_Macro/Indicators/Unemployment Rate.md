---
node_type: "indicator"
name: "Unemployment Rate"
frequency: "monthly"
source: "Bureau of Labor Statistics"
parent_regimes: ["[[Recession]]", "[[Rate Hike Cycle]]", "[[Goldilocks]]", "[[Stagflation]]"]
affects_sectors: ["[[Consumer Discretionary]]", "[[Financials]]"]
affects_commodities: []
current_value: ""
trend: ""
status: "Active"
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[NFP]]", "[[Initial Claims]]"]
data_sources: []
tags: [macro, indicator, labor]
---

## Overview
Percentage of the labor force that is jobless and actively seeking employment. Sahm Rule: if the 3-month moving average rises 0.5% from its 12-month low, a recession has begun.

## Current Reading
- **Value**:
- **Trend**:
- **Last Updated**:

## Regime Connections
```dataview
TABLE name, status, confidence
FROM "09_Macro/Regimes"
WHERE contains(string(key_indicators), "Unemployment Rate")
```

## Impact Chain
1. Unemployment rising → [[Recession]] signal, consumer spending weakens
2. Unemployment very low → [[Rate Hike Cycle]] (Fed tightens to cool overheating)
3. Directly impacts [[Consumer Discretionary]] and [[Financials]] (credit quality)
