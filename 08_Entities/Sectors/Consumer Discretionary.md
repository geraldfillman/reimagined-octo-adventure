---
node_type: "sector"
name: "Consumer Discretionary"
status: "Active"
key_stocks: []
key_commodities: []
key_countries: ["[[USA]]", "[[China]]"]
bullish_drivers: ["[[Risk-On]]", "[[Rate Cut Cycle]]", "[[Goldilocks]]"]
bearish_drivers: ["[[Recession]]", "[[Rate Hike Cycle]]", "[[Stagflation]]"]
related_entities: ["[[Consumer Staples]]"]
macro_sensitivity: "high"
data_sources: []
tags: [sector]
---

## Overview
Retail, autos, apparel, housing, restaurants, travel, and leisure. Highly cyclical — performance tied to consumer confidence and disposable income.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Recession]] | Bearish | Consumers cut discretionary spending first |
| [[Risk-On]] | Bullish | Consumer confidence high |
| [[Stagflation]] | Bearish | Squeezed consumer — inflation + stagnation |
| [[Rate Cut Cycle]] | Bullish | Cheaper credit fuels spending |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Consumer Discretionary")
SORT market_cap DESC
```
