---
node_type: "commodity"
name: "Natural Gas"
commodity_type: "energy"
unit: "$/MMBtu"
status: "Active"
key_countries: ["[[USA]]", "[[Germany]]"]
key_sectors: ["[[Energy]]", "[[Utilities]]"]
bullish_drivers: ["[[Winter Demand]]", "[[LNG Export Growth]]"]
bearish_drivers: ["[[Warm Weather]]", "[[Overproduction]]"]
related_entities: ["[[Oil]]"]
data_sources: []
tags: [commodity, energy]
fred_series: "DHHNGSP"
frequency: "daily"
---

## Overview
Key fuel for power generation, heating, and industrial use. US Henry Hub and European TTF are the main benchmarks. Highly seasonal and weather-sensitive. LNG trade connecting regional markets.

## Supply/Demand Dynamics
- **Major Producers**: [[USA]], Russia, Qatar
- **Major Consumers**: [[USA]], [[Germany]], [[Japan]]

## Macro Sensitivity
- **Inflation**: Natural gas spikes hit utility bills and [[CPI]]
- **EUR/USD**: European gas crisis weakens euro, strengthens [[DXY]]
- **Global Growth**: Industrial demand tied to [[PMI]]

## Transmission Edges
Tracked via FRED `DHHNGSP` (daily); scanned by `node run.mjs pull commodity-transmission`. Edges live in `scripts/config/transmission-map.json`.

- **On rise ≥ 15%** → hurts fertilizer_consumers, food_producers, grocers (lag ~2q)
  - Nat gas is the feedstock for ammonia; fertilizer costs rise, farm input inflation squeezes food producer and grocer margins
  - Tickers: GIS, K, KR, TSN
  - Theses: [[Bioengineered Food Systems]]
- **On rise ≥ 15%** → benefits fertilizer_producers, lng_exporters (lag ~1q)
  - Fertilizer producers with fixed-cost gas or ammonia capacity capture the spread; LNG exporters gain
  - Tickers: CF, NTR, MOS, LNG
- **On rise ≥ 15%** → hurts utilities, data_centers (lag ~1q)
  - Gas-fired generation cost rises; utilities with weak fuel pass-through and data-center power buyers face higher power prices
  - Tickers: AEP, DUK
  - Theses: [[AI Power Infrastructure]], [[Nuclear Renaissance SMRs]]
- **On fall ≥ 15%** → benefits chemicals, food_producers, utilities (lag ~1q)
  - Cheap gas lowers fertilizer, chemical, and power input costs across the chain
  - Tickers: DOW, LYB, GIS

**Linked theses:** [[Bioengineered Food Systems]], [[AI Power Infrastructure]], [[Nuclear Renaissance SMRs]]
