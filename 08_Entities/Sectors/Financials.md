---
node_type: "sector"
name: "Financials"
status: "Active"
key_stocks: []
key_commodities: []
key_countries: ["[[USA]]", "[[UK]]"]
bullish_drivers: ["[[Rate Hike Cycle]]", "[[Goldilocks]]", "[[Inflationary Boom]]"]
bearish_drivers: ["[[Recession]]", "[[Rate Cut Cycle]]"]
related_entities: []
macro_sensitivity: "high"
data_sources: []
tags: [sector]
---

## Overview
Banks, insurance, asset management, and capital markets. Revenue driven by net interest margins (rate-sensitive), trading volumes, and credit quality.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Rate Hike Cycle]] | Bullish | Wider net interest margins |
| [[Rate Cut Cycle]] | Bearish | Margins compress |
| [[Recession]] | Bearish | Loan losses spike |
| [[Goldilocks]] | Bullish | Healthy credit, stable margins |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Financials")
SORT market_cap DESC
```
