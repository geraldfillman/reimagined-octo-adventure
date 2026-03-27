---
node_type: "indicator"
name: "Producer Price Index (PPI)"
frequency: "monthly"
source: "Bureau of Labor Statistics"
parent_regimes: ["[[Stagflation]]", "[[Inflationary Boom]]"]
affects_sectors: ["[[Materials]]", "[[Industrials]]", "[[Consumer Staples]]"]
affects_commodities: ["[[Oil]]", "[[Copper]]"]
current_value: ""
trend: ""
status: "Active"
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[CPI]]"]
data_sources: []
tags: [macro, indicator, inflation]
---

## Overview
Measures average change in selling prices received by domestic producers. A leading indicator for CPI — producer costs eventually pass through to consumers.

## Current Reading
- **Value**:
- **Trend**:
- **Last Updated**:

## Regime Connections
```dataview
TABLE name, status, confidence
FROM "09_Macro/Regimes"
WHERE contains(string(key_indicators), "PPI")
```

## Impact Chain
1. PPI rising → margin pressure for companies that can't pass through costs
2. Leads [[CPI]] by 1-3 months
3. Affects [[Materials]] and [[Industrials]] margins directly
