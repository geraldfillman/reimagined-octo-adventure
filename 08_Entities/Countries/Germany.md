---
node_type: "country"
name: "Germany"
region: "Europe"
currency: "[[EUR]]"
status: "Active"
key_sectors: ["[[Industrials]]", "[[Consumer Discretionary]]", "[[Materials]]"]
key_commodities: ["[[Natural Gas]]"]
bullish_drivers: []
bearish_drivers: ["[[Energy Dependence]]", "[[Manufacturing Slowdown]]"]
related_entities: ["[[UK]]", "[[China]]"]
macro_indicators: ["[[PMI]]", "[[GDP Growth]]"]
data_sources: []
tags: [country]
---

## Overview
Europe's largest economy. Manufacturing and export powerhouse — autos, machinery, chemicals. Heavily dependent on energy imports. China exposure through exports.

## Linked Stocks
```dataview
TABLE ticker, sector, status
FROM "08_Entities/Stocks"
WHERE contains(string(country), "Germany")
```
