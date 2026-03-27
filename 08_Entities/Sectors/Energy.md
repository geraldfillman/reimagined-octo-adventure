---
node_type: "sector"
name: "Energy"
status: "Active"
key_stocks: []
key_commodities: ["[[Oil]]", "[[Natural Gas]]"]
key_countries: ["[[USA]]", "[[Saudi Arabia]]"]
bullish_drivers: ["[[Inflationary Boom]]", "[[Stagflation]]", "[[Supply Constraints]]"]
bearish_drivers: ["[[Recession]]", "[[Demand Destruction]]"]
related_entities: []
macro_sensitivity: "high"
data_sources: []
tags: [sector]
---

## Overview
Oil & gas exploration, production, refining, and services. Highly correlated with crude oil prices. Beneficiary of inflation and supply constraints.

## Key Holdings
-

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Rate Hike Cycle]] | Neutral/Bullish | Often hiking because of energy-driven inflation |
| [[Recession]] | Bearish | Demand destruction lowers oil prices |
| [[Stagflation]] | Bullish | Supply-driven inflation benefits producers |
| [[Inflationary Boom]] | Bullish | Strong demand + rising prices |
| [[Risk-On]] | Bullish | Commodity demand rises |

## Bullish Factors
-

## Bearish Factors
-

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Energy")
SORT market_cap DESC
```
