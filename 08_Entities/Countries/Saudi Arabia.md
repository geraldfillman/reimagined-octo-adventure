---
node_type: "country"
name: "Saudi Arabia"
region: "Middle East"
currency: "[[SAR]]"
status: "Active"
key_sectors: ["[[Energy]]"]
key_commodities: ["[[Oil]]"]
bullish_drivers: ["[[Vision 2030]]", "[[OPEC+ Cuts]]"]
bearish_drivers: ["[[Oil Price Collapse]]", "[[Energy Transition]]"]
related_entities: ["[[USA]]"]
macro_indicators: ["[[GDP Growth]]"]
data_sources: []
tags: [country]
---

## Overview
World's largest oil exporter. OPEC+ swing producer with outsized influence on global oil prices. Vision 2030 diversification program investing in tech, tourism, and renewables.

## Linked Stocks
```dataview
TABLE ticker, sector, status
FROM "08_Entities/Stocks"
WHERE contains(string(country), "Saudi Arabia")
```
