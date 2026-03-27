---
node_type: "stock"
ticker: "AAPL"
exchange: "NASDAQ"
sector: "[[Tech Sector]]"
country: "[[USA]]"
market_cap: "~$3T"
status: "Active"
bullish_drivers: ["[[Risk-On]]", "[[Rate Cut Cycle]]", "[[AI Integration]]"]
bearish_drivers: ["[[Rate Hike Cycle]]", "[[China Slowdown]]", "[[Regulatory Risk]]"]
related_entities: ["[[TSLA]]", "[[Copper]]", "[[Lithium]]"]
data_sources: []
tags: [stock]
---

## Overview
World's largest company by market cap. Consumer electronics (iPhone, Mac, iPad), services (App Store, iCloud, Apple TV+), and growing wearables/AR segment. Massive buyback program and Services transition driving margin expansion.

## Sector & Macro Exposure
- **Sector**: [[Tech Sector]]
- **Country**: [[USA]] (HQ), [[China]] (manufacturing + 20% revenue)
- **Key Commodities**: [[Lithium]] (batteries), [[Copper]] (electronics)
- **Currency Exposure**: [[DXY]] headwind when strong (international revenue ~60%)

## Bullish Factors
- Services revenue growing at 15%+ with 80%+ margins
- AI integration into devices (Apple Intelligence)
- Installed base of 2B+ active devices

## Bearish Factors
- China regulatory and geopolitical risk
- iPhone upgrade cycles lengthening
- [[Rate Hike Cycle]] compresses growth multiples

## Macro Sensitivity
- **Rising Rates**: Bearish — long-duration growth stock, P/E compresses
- **Recession**: Mixed — premium brand resilience vs. consumer pullback
- **Inflation**: Mild negative — can pass through with pricing power

## Signals
```dataview
TABLE signal_id, severity, date
FROM "06_Signals"
WHERE contains(string(tags), "AAPL")
SORT date DESC
LIMIT 10
```

## Related Data Sources
```dataview
TABLE name, status
FROM "01_Data_Sources"
WHERE contains(string(file.name), "AAPL") OR contains(string(related_sources), "AAPL")
```
