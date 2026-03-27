---
node_type: "sector"
name: "Utilities"
status: "Active"
key_stocks: []
key_commodities: ["[[Natural Gas]]"]
key_countries: ["[[USA]]"]
bullish_drivers: ["[[Recession]]", "[[Risk-Off]]", "[[Rate Cut Cycle]]"]
bearish_drivers: ["[[Rate Hike Cycle]]", "[[Inflationary Boom]]"]
related_entities: []
macro_sensitivity: "medium"
data_sources: []
tags: [sector]
---

## Overview
Electric, gas, and water utilities. Regulated revenue streams, high dividend yields. Bond proxy — inversely correlated with interest rates.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Recession]] | Bullish (relative) | Regulated revenue, dividend yield |
| [[Rate Cut Cycle]] | Bullish | Bond proxy benefits from lower rates |
| [[Rate Hike Cycle]] | Bearish | Higher rates make dividends less attractive |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Utilities")
SORT market_cap DESC
```
