---
node_type: "commodity"
name: "Copper"
commodity_type: "metal"
unit: "$/lb"
status: "Active"
key_countries: ["[[China]]", "[[Brazil]]"]
key_sectors: ["[[Materials]]", "[[Industrials]]"]
bullish_drivers: ["[[China Stimulus]]", "[[Green Transition]]", "[[Infrastructure Spending]]", "[[Defense Manufacturing Demand]]"]
bearish_drivers: ["[[Recession]]", "[[China Slowdown]]"]
related_entities: ["[[Lithium]]"]
data_sources: []
tags: [commodity, metal]
fred_series: "PCOPPUSDM"
frequency: "monthly"
---

## Overview
"Dr. Copper" — the metal with a PhD in economics. Copper demand is a real-time gauge of global industrial activity. Used in construction, electronics, EVs, and power grids. [[China]] consumes ~55% of global supply.

## Supply/Demand Dynamics
- **Major Producers**: Chile, Peru, Congo
- **Major Consumers**: [[China]], [[USA]], [[Germany]]

## Macro Sensitivity
- **Global Growth**: Copper/gold ratio tracks [[PMI]] and [[GDP Growth]]
- **China**: The single largest demand driver
- **Green Transition**: EVs use 4x more copper than ICE vehicles

## Transmission Edges
Tracked via FRED `PCOPPUSDM` (monthly); scanned by `node run.mjs pull commodity-transmission`. Edges live in `scripts/config/transmission-map.json`.

- **On rise ≥ 10%** → hurts grid_equipment, electrical_equipment, construction_electrical (lag ~1q)
  - Copper is the binding input for transformers, switchgear, and cabling; grid equipment costs and lead times worsen — electrical bottleneck tightens
  - Tickers: ETN, PWR, HUBB, WCC
  - Theses: [[Grid Equipment Bottleneck]], [[AI Power Infrastructure]], [[Grid-Scale Battery Storage]]
- **On rise ≥ 10%** → benefits miners (lag ~0q)
  - Miners and copper-heavy producers capture price; scarcity confirms grid-buildout demand thesis
  - Tickers: FCX, SCCO, TECK
  - Theses: [[Grid Equipment Bottleneck]]
- **On fall ≥ 10%** → benefits grid_equipment, electrical_equipment, autos_ev (lag ~1q)
  - Input cost relief for electrical equipment, EV, and construction wiring
  - Tickers: ETN, HUBB, TSLA
  - Theses: [[AI Power Infrastructure]], [[Grid-Scale Battery Storage]]

**Linked theses:** [[Grid Equipment Bottleneck]], [[AI Power Infrastructure]], [[Grid-Scale Battery Storage]]
