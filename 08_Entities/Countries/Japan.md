---
node_type: "country"
name: "Japan"
region: "Asia"
currency: "[[JPY]]"
status: "Active"
key_sectors: ["[[Industrials]]", "[[Tech Sector]]", "[[Consumer Discretionary]]"]
key_commodities: []
bullish_drivers: ["[[Yen Weakness]]", "[[Corporate Governance Reform]]"]
bearish_drivers: ["[[Deflation]]", "[[Demographics]]"]
related_entities: []
macro_indicators: ["[[GDP Growth]]", "[[CPI]]"]
data_sources: []
tags: [country]
---

## Overview
Third-largest economy. Export-driven with strength in autos, electronics, robotics, and precision manufacturing. BOJ monetary policy unique among developed markets.

## Macro Environment
- **Current Regime**: [[]]
- **Key Indicators**: [[GDP Growth]], [[CPI]]

## Key Sectors
- [[Industrials]] (autos, machinery), [[Tech Sector]] (semis)

## Linked Stocks
```dataview
TABLE ticker, sector, status
FROM "08_Entities/Stocks"
WHERE contains(string(country), "Japan")
```
