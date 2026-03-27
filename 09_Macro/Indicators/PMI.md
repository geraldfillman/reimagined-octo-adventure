---
node_type: "indicator"
name: "Purchasing Managers Index (PMI)"
frequency: "monthly"
source: "S&P Global / ISM"
parent_regimes: ["[[Recession]]", "[[Risk-On]]", "[[Stagflation]]", "[[Goldilocks]]", "[[Inflationary Boom]]"]
affects_sectors: ["[[Industrials]]", "[[Materials]]"]
affects_commodities: ["[[Copper]]", "[[Oil]]"]
current_value: ""
trend: ""
status: "Active"
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[ISM Manufacturing]]", "[[GDP Growth]]"]
data_sources: []
tags: [macro, indicator, activity]
---

## Overview
A survey-based leading indicator of economic activity. Above 50 signals expansion, below 50 signals contraction. Covers new orders, production, employment, supplier deliveries, and inventories.

## Current Reading
- **Value**:
- **Trend**:
- **Last Updated**:

## Regime Connections
```dataview
TABLE name, status, confidence
FROM "09_Macro/Regimes"
WHERE contains(string(key_indicators), "PMI")
```

## Impact Chain
1. PMI < 50 → Manufacturing contraction → [[Recession]] risk rises
2. PMI > 55 → Expansion → supports [[Risk-On]], potentially [[Inflationary Boom]]
3. New orders sub-index most forward-looking
