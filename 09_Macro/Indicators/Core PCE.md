---
node_type: "indicator"
name: "Core PCE Price Index"
frequency: "monthly"
source: "Bureau of Economic Analysis"
parent_regimes: ["[[Rate Hike Cycle]]", "[[Rate Cut Cycle]]", "[[Goldilocks]]"]
affects_sectors: ["[[Tech Sector]]", "[[Financials]]"]
affects_commodities: []
current_value: ""
trend: ""
status: "Active"
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[CPI]]", "[[Fed Funds Rate]]"]
data_sources: []
tags: [macro, indicator, inflation]
---

## Overview
The Fed's preferred inflation gauge. Excludes food and energy. Measures personal consumption expenditure price changes. The 2% target is based on this metric.

## Current Reading
- **Value**:
- **Trend**:
- **Last Updated**:

## Regime Connections
```dataview
TABLE name, status, confidence
FROM "09_Macro/Regimes"
WHERE contains(string(key_indicators), "Core PCE")
```

## Impact Chain
1. Core PCE above 2% → Fed maintains or raises rates
2. Core PCE trending to 2% → Opens door for [[Rate Cut Cycle]]
3. Directly informs [[Fed Funds Rate]] decisions
