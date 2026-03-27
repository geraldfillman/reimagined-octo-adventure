---
node_type: "sector"
name: "Healthcare"
status: "Active"
key_stocks: []
key_commodities: []
key_countries: ["[[USA]]"]
bullish_drivers: ["[[Recession]]", "[[Risk-Off]]"]
bearish_drivers: ["[[Regulatory Risk]]"]
related_entities: []
macro_sensitivity: "low"
data_sources: []
tags: [sector]
---

## Overview
Pharma, biotech, medical devices, healthcare services, and managed care. Defensive sector with non-discretionary demand. Less correlated with economic cycles.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Recession]] | Bullish (relative) | Defensive — healthcare spending is non-discretionary |
| [[Risk-Off]] | Bullish (relative) | Flight to quality |
| [[Risk-On]] | Underperforms | Boring in a risk-on world |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Healthcare")
SORT market_cap DESC
```
