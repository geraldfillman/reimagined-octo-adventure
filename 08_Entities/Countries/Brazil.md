---
node_type: "country"
name: "Brazil"
region: "South America"
currency: "[[BRL]]"
status: "Active"
key_sectors: ["[[Materials]]", "[[Energy]]"]
key_commodities: ["[[Oil]]", "[[Copper]]", "[[Wheat]]"]
bullish_drivers: ["[[Commodity Supercycle]]"]
bearish_drivers: ["[[Political Risk]]", "[[Currency Weakness]]"]
related_entities: ["[[China]]"]
macro_indicators: ["[[GDP Growth]]", "[[CPI]]"]
data_sources: []
tags: [country]
---

## Overview
Largest South American economy. Major commodity exporter — iron ore, soybeans, oil, sugar. China is the largest trading partner. High real interest rates.

## Linked Stocks
```dataview
TABLE ticker, sector, status
FROM "08_Entities/Stocks"
WHERE contains(string(country), "Brazil")
```
