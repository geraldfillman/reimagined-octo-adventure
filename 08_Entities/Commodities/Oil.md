---
node_type: "commodity"
name: "Crude Oil (WTI/Brent)"
commodity_type: "energy"
unit: "$/barrel"
status: "Active"
key_countries: ["[[USA]]", "[[Saudi Arabia]]", "[[Brazil]]"]
key_sectors: ["[[Energy]]", "[[Industrials]]"]
bullish_drivers: ["[[OPEC+ Cuts]]", "[[Geopolitical Risk]]", "[[China Reopening]]"]
bearish_drivers: ["[[Recession]]", "[[Demand Destruction]]", "[[Strong Dollar]]"]
related_entities: ["[[Natural Gas]]", "[[DXY]]"]
data_sources: []
tags: [commodity, energy]
fred_series: "DCOILWTICO"
frequency: "daily"
---

## Overview
The most important commodity in the world. Benchmark for global energy pricing. Priced in USD — inversely correlated with [[DXY]]. OPEC+ supply management is the dominant price driver.

## Supply/Demand Dynamics
- **Major Producers**: [[Saudi Arabia]], [[USA]], Russia
- **Major Consumers**: [[China]], [[USA]], [[India]]

## Macro Sensitivity
- **Inflation**: Oil price spikes feed directly into [[CPI]] and [[PPI]]
- **USD Strength**: Strong [[DXY]] bearish for oil (priced in USD)
- **Global Growth**: [[GDP Growth]] and [[PMI]] drive demand

## Bullish Factors
-

## Bearish Factors
-

## Transmission Edges
Tracked via FRED `DCOILWTICO` (daily); scanned by `node run.mjs pull commodity-transmission`. Edges live in `scripts/config/transmission-map.json`.

- **On fall ≥ 8%** → benefits construction, homebuilders, airlines, logistics (lag ~1q)
  - Cheaper fuel, asphalt, and petrochemical inputs lower construction and logistics costs
  - Tickers: VMC, MLM, DHI, LEN, DAL, UPS
  - Theses: [[Housing Supply Correction]]
- **On fall ≥ 8%** → hurts energy_services, exploration_production (lag ~2q)
  - E&P operators cut capex; oilfield services and equipment orders dry up first
  - Tickers: SLB, HAL, XOM, OXY
- **On rise ≥ 8%** → hurts airlines, logistics, consumer_discretionary (lag ~1q)
  - Fuel surcharge inflation squeezes transport margins and consumer discretionary spend
  - Tickers: DAL, UAL, FDX, TGT
- **On rise ≥ 8%** → benefits exploration_production, energy_services (lag ~1q)
  - Producer cash flows and drilling activity expand
  - Tickers: XOM, OXY, SLB

**Linked theses:** [[Housing Supply Correction]]
