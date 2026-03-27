---
node_type: "sector"
name: "Technology"
status: "Active"
key_stocks: []
key_commodities: ["[[Lithium]]", "[[Copper]]"]
key_countries: ["[[USA]]", "[[China]]"]
bullish_drivers: ["[[Rate Cut Cycle]]", "[[Risk-On]]", "[[Goldilocks]]"]
bearish_drivers: ["[[Rate Hike Cycle]]", "[[Stagflation]]", "[[Risk-Off]]"]
related_entities: ["[[Communication Services]]"]
macro_sensitivity: "high"
data_sources: []
tags: [sector]
---

## Overview
Includes software, semiconductors, hardware, IT services, and cloud computing. The largest S&P 500 sector by weight. Highly sensitive to interest rates (long-duration cash flows) and growth expectations.

## Key Holdings
-

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Rate Hike Cycle]] | Bearish | Higher discount rate compresses P/E |
| [[Rate Cut Cycle]] | Bullish | Lower rates boost growth valuations |
| [[Recession]] | Mixed | Defensive tech (cloud) holds; cyclical (semis) drops |
| [[Risk-On]] | Bullish | Growth premium rewarded |
| [[Stagflation]] | Bearish | Double hit: rates up + growth down |
| [[Goldilocks]] | Bullish | Best of both worlds |

## Bullish Factors
-

## Bearish Factors
-

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Tech Sector")
SORT market_cap DESC
```
