---
signal_id: "COMMODITY_TRANSMISSION_CRUDE_OIL"
signal_name: "WTI Crude Oil fall 16.9% — transmission edges tripped"
domain: "commodities"
severity: "alert"
value: -16.9
threshold: 8
date: "2026-07-31"
source_pull: "Commodity_Transmission_Scan"
commodity: "crude_oil"
theses: ["Housing Supply Correction"]
tickers: ["VMC", "MLM", "DHI", "LEN", "DAL", "UPS", "SLB", "HAL", "XOM", "OXY"]
tags: ["signal", "commodities", "alert", "transmission"]
---

## WTI Crude Oil moved -16.9%

Recent average 78.71 vs baseline 94.75 USD/bbl. 2 transmission edge(s) tripped.

## Implications

- ✅ Cheaper fuel, asphalt, and petrochemical inputs lower construction and logistics costs (construction, homebuilders, airlines, logistics; lag ~1q)
- ❌ E&P operators cut capex; oilfield services and equipment orders dry up first (energy_services, exploration_production; lag ~2q)

## Affected

- Theses: [[Housing Supply Correction]]
- Tickers: VMC, MLM, DHI, LEN, DAL, UPS, SLB, HAL, XOM, OXY
