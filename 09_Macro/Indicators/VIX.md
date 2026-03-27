---
node_type: "indicator"
name: "CBOE Volatility Index (VIX)"
frequency: "daily"
source: "CBOE"
parent_regimes: ["[[Risk-On]]", "[[Risk-Off]]"]
affects_sectors: []
affects_commodities: ["[[Gold]]"]
current_value: ""
trend: ""
status: "Active"
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[DXY]]"]
data_sources: []
tags: [macro, indicator, market]
---

## Overview
Measures 30-day implied volatility of S&P 500 options. Known as the "fear gauge." Below 15 = complacency, 15-20 = normal, 20-30 = elevated fear, 30+ = panic. Mean-reverting — extreme highs tend to snap back.

## Current Reading
- **Value**:
- **Trend**:
- **Last Updated**:

## Impact Chain
1. VIX < 15 → [[Risk-On]] confirmed, complacency may signal reversal
2. VIX > 30 → [[Risk-Off]], flight to [[Gold]] and treasuries
3. VIX spike + reversal → often marks market bottoms (contrarian signal)
