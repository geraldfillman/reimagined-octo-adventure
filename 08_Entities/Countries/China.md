---
node_type: "country"
name: "China"
region: "Asia"
currency: "[[CNY]]"
status: "Active"
key_sectors: ["[[Tech Sector]]", "[[Materials]]", "[[Industrials]]", "[[Consumer Discretionary]]"]
key_commodities: ["[[Copper]]", "[[Oil]]", "[[Lithium]]"]
bullish_drivers: ["[[Stimulus Package]]", "[[Property Recovery]]"]
bearish_drivers: ["[[Deflation]]", "[[Geopolitical Tension]]", "[[Property Crisis]]"]
related_entities: ["[[USA]]"]
macro_indicators: ["[[PMI]]", "[[GDP Growth]]"]
data_sources: []
tags: [country]
---

## Overview
World's second-largest economy. Manufacturing powerhouse, largest commodity importer. Key driver of global industrial demand. Property sector and local government debt are structural risks.

## Macro Environment
- **Current Regime**: [[]]
- **Key Indicators**: [[PMI]], [[GDP Growth]]

## Key Sectors
- [[Materials]] (largest consumer), [[Industrials]], [[Tech Sector]] (growing)

## Key Commodities (Export/Import)
- **Import**: [[Copper]], [[Oil]], [[Lithium]], iron ore
- **Export**: Manufactured goods, rare earths

## Bullish Factors
-

## Bearish Factors
-

## Linked Stocks
```dataview
TABLE ticker, sector, status
FROM "08_Entities/Stocks"
WHERE contains(string(country), "China")
```
