---
node_type: "indicator"
name: "GDP Growth (Real)"
frequency: "quarterly"
source: "Bureau of Economic Analysis"
parent_regimes: ["[[Recession]]", "[[Goldilocks]]", "[[Inflationary Boom]]", "[[Stagflation]]", "[[Risk-On]]"]
affects_sectors: ["[[Industrials]]", "[[Consumer Discretionary]]", "[[Financials]]"]
affects_commodities: ["[[Oil]]", "[[Copper]]"]
current_value: ""
trend: ""
status: "Active"
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[PMI]]", "[[Retail Sales]]"]
data_sources: []
tags: [macro, indicator, growth]
---

## Overview
The broadest measure of economic output. Real GDP strips out inflation. Two consecutive quarters of negative growth is the textbook recession definition. Released quarterly with advance, preliminary, and final estimates.

## Current Reading
- **Value**:
- **Trend**:
- **Last Updated**:

## Regime Connections
```dataview
TABLE name, status, confidence
FROM "09_Macro/Regimes"
WHERE contains(string(key_indicators), "GDP Growth")
```

## Impact Chain
1. GDP negative → [[Recession]] confirmed → defensive rotation
2. GDP >3% → [[Inflationary Boom]] risk → commodity demand rises
3. GDP 2-3% → [[Goldilocks]] → broad market support
