---
node_type: "indicator"
name: "ISM Manufacturing Index"
frequency: "monthly"
source: "Institute for Supply Management"
parent_regimes: ["[[Recession]]", "[[Inflationary Boom]]"]
affects_sectors: ["[[Industrials]]", "[[Materials]]"]
affects_commodities: ["[[Copper]]"]
current_value: ""
trend: ""
status: "Active"
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[PMI]]"]
data_sources: []
tags: [macro, indicator, activity]
---

## Overview
The ISM Manufacturing PMI is the most-watched US manufacturing survey. Prices paid sub-index is an inflation signal; new orders sub-index is a growth signal.

## Current Reading
- **Value**:
- **Trend**:
- **Last Updated**:

## Regime Connections
```dataview
TABLE name, status, confidence
FROM "09_Macro/Regimes"
WHERE contains(string(key_indicators), "ISM Manufacturing")
```

## Impact Chain
1. ISM < 48 for 3+ months → strong [[Recession]] signal
2. ISM prices paid rising → inflation pressure → [[Inflationary Boom]]
3. New orders sub-index leads GDP by ~2 quarters
