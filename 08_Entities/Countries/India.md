---
node_type: "country"
name: "India"
region: "Asia"
currency: "[[INR]]"
status: "Active"
key_sectors: ["[[Tech Sector]]", "[[Financials]]", "[[Consumer Discretionary]]"]
key_commodities: ["[[Oil]]", "[[Gold]]"]
bullish_drivers: ["[[Demographics]]", "[[Digital Transformation]]"]
bearish_drivers: ["[[Oil Import Dependence]]", "[[Rupee Weakness]]"]
related_entities: []
macro_indicators: ["[[GDP Growth]]", "[[CPI]]"]
data_sources: []
tags: [country]
---

## Overview
Fifth-largest economy, fastest-growing major economy. Young demographics, rising middle class. IT services export powerhouse. Vulnerable to oil price shocks as major importer.

## Linked Stocks
```dataview
TABLE ticker, sector, status
FROM "08_Entities/Stocks"
WHERE contains(string(country), "India")
```
