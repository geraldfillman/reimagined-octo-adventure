---
node_type: "sector"
name: "Consumer Staples"
status: "Active"
key_stocks: []
key_commodities: ["[[Wheat]]"]
key_countries: ["[[USA]]"]
bullish_drivers: ["[[Recession]]", "[[Risk-Off]]", "[[Stagflation]]"]
bearish_drivers: ["[[Risk-On]]", "[[Inflationary Boom]]"]
related_entities: ["[[Consumer Discretionary]]"]
macro_sensitivity: "low"
data_sources: []
tags: [sector]
---

## Overview
Food, beverages, household products, tobacco. Defensive sector with stable demand regardless of economic conditions. Pricing power and dividend yield provide downside protection.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Recession]] | Bullish (relative) | Inelastic demand |
| [[Risk-Off]] | Bullish (relative) | Defensive rotation |
| [[Stagflation]] | Neutral/Bullish | Can pass through costs |
| [[Risk-On]] | Underperforms | Low beta drags in rallies |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Consumer Staples")
SORT market_cap DESC
```
