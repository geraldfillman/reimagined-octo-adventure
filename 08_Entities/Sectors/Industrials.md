---
node_type: "sector"
name: "Industrials"
status: "Active"
key_stocks: ["[[ONDS]]", "[[DPRO]]", "[[EH]]", "[[EVTL]]", "[[ACHR]]", "[[JOBY]]", "[[HOVR]]"]
key_commodities: ["[[Copper]]", "[[Oil]]"]
key_countries: ["[[USA]]", "[[China]]", "[[Germany]]"]
bullish_drivers: ["[[Risk-On]]", "[[Inflationary Boom]]", "[[Goldilocks]]"]
bearish_drivers: ["[[Recession]]"]
related_entities: ["[[Materials]]", "[[Aerospace & Defense]]", "[[FAA Regulatory Progress]]"]
macro_sensitivity: "high"
data_sources: []
tags: [sector]
---

## Overview
Aerospace, defense, machinery, construction, transportation, and professional services. Cyclical sector tied to capex cycles and global trade.

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Recession]] | Bearish | Capex freezes |
| [[Risk-On]] | Bullish | Expansion drives orders |
| [[Inflationary Boom]] | Bullish | Riding the boom |

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Industrials")
SORT market_cap DESC
```
