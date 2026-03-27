---
node_type: "sector"
name: "Communication Services"
status: "Active"
key_stocks: []
key_commodities: []
key_countries: ["[[USA]]"]
bullish_drivers: ["[[Risk-On]]", "[[Rate Cut Cycle]]"]
bearish_drivers: ["[[Recession]]", "[[Regulatory Risk]]"]
related_entities: ["[[Tech Sector]]"]
macro_sensitivity: "medium"
data_sources: []
tags: [sector]
---

## Overview
Telecom, social media, entertainment, and interactive media. Mix of defensive (telecom) and cyclical (advertising-dependent media). Overlaps with tech for mega-cap names.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Recession]] | Mixed | Telecom defensive; ad revenue cyclical |
| [[Risk-On]] | Bullish | Ad spending rises with economy |
| [[Rate Cut Cycle]] | Bullish | Growth names benefit |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Communication Services")
SORT market_cap DESC
```
