---
node_type: "sector"
name: "Materials"
status: "Active"
key_stocks: []
key_commodities: ["[[Copper]]", "[[Gold]]", "[[Lithium]]"]
key_countries: ["[[China]]", "[[Brazil]]", "[[USA]]"]
bullish_drivers: ["[[Inflationary Boom]]", "[[Stagflation]]"]
bearish_drivers: ["[[Recession]]", "[[Strong Dollar]]"]
related_entities: ["[[Industrials]]"]
macro_sensitivity: "high"
data_sources: []
tags: [sector]
---

## Overview
Chemicals, mining, metals, construction materials, and packaging. Commodity-sensitive sector with pricing power during inflation. China demand is a key driver.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Inflationary Boom]] | Bullish | Pricing power with scarce resources |
| [[Stagflation]] | Bullish | Real asset play |
| [[Recession]] | Bearish | Demand collapse |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Materials")
SORT market_cap DESC
```
