---
node_type: "indicator"
name: "Consumer Price Index (CPI)"
frequency: "monthly"
source: "Bureau of Labor Statistics"
parent_regimes: ["[[Stagflation]]", "[[Rate Hike Cycle]]", "[[Inflationary Boom]]", "[[Goldilocks]]"]
affects_sectors: ["[[Tech Sector]]", "[[Consumer Discretionary]]", "[[Consumer Staples]]"]
affects_commodities: ["[[Gold]]"]
current_value: ""
trend: ""
status: "Active"
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[Core PCE]]", "[[PPI]]"]
data_sources: []
tags: [macro, indicator, inflation]
---

## Overview
The Consumer Price Index measures the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services. The headline CPI and core CPI (excluding food and energy) are the most watched inflation gauges.

## Current Reading
- **Value**:
- **Trend**:
- **Last Updated**:

## Regime Connections
```dataview
TABLE name, status, confidence
FROM "09_Macro/Regimes"
WHERE contains(string(key_indicators), "CPI")
```

## Impact Chain
1. CPI rises above target → Fed hawkish → [[Rate Hike Cycle]]
2. Affects sectors: [[Tech Sector]] (bearish — higher discount rate), [[Consumer Staples]] (neutral — pass-through pricing)
3. Affects commodities: [[Gold]] (bullish — inflation hedge)
4. Affects currencies: [[DXY]] (bullish short-term on rate hike expectations)
