---
node_type: "country"
name: "United Kingdom"
region: "Europe"
currency: "[[GBP]]"
status: "Active"
key_sectors: ["[[Financials]]", "[[Energy]]", "[[Materials]]"]
key_commodities: ["[[Oil]]"]
bullish_drivers: []
bearish_drivers: []
related_entities: ["[[Germany]]"]
macro_indicators: ["[[CPI]]", "[[GDP Growth]]"]
data_sources: []
tags: [country]
---

## Overview
Sixth-largest economy. London is a global financial center. FTSE 100 is heavily weighted toward energy, materials, and financials — more value/commodity oriented than US indices.

## Linked Stocks
```dataview
TABLE ticker, sector, status
FROM "08_Entities/Stocks"
WHERE contains(string(country), "UK")
```
