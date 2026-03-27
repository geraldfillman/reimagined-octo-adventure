---
node_type: "sector"
name: "Real Estate"
status: "Active"
key_stocks: []
key_commodities: []
key_countries: ["[[USA]]"]
bullish_drivers: ["[[Rate Cut Cycle]]", "[[Goldilocks]]"]
bearish_drivers: ["[[Rate Hike Cycle]]", "[[Recession]]"]
related_entities: []
macro_sensitivity: "high"
data_sources: []
tags: [sector]
---

## Overview
REITs and real estate services. Highly interest rate sensitive — mortgage rates directly impact affordability, valuations, and transaction volumes.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Rate Hike Cycle]] | Bearish | Mortgage rates rise, affordability drops |
| [[Rate Cut Cycle]] | Bullish | Mortgage rates fall, refinancing surge |
| [[Recession]] | Bearish | Vacancy rates rise |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Real Estate")
SORT market_cap DESC
```
