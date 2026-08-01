---
node_type: "commodity"
name: "Wheat"
commodity_type: "agricultural"
unit: "$/bushel"
status: "Active"
key_countries: ["[[USA]]", "[[Brazil]]"]
key_sectors: ["[[Consumer Staples]]"]
bullish_drivers: ["[[Drought]]", "[[Geopolitical Disruption]]", "[[Export Bans]]"]
bearish_drivers: ["[[Bumper Harvest]]", "[[Strong Dollar]]"]
related_entities: []
data_sources: []
tags: [commodity, agricultural]
fred_series: "PWHEAMTUSDM"
frequency: "monthly"
---

## Overview
Staple food commodity. Prices driven by weather, geopolitics (Ukraine/Russia are major exporters), and inventory levels. Directly impacts [[CPI]] food component and food security in developing nations.

## Supply/Demand Dynamics
- **Major Producers**: Russia, [[USA]], Canada, Ukraine
- **Major Consumers**: [[China]], [[India]], Egypt

## Macro Sensitivity
- **Inflation**: Food price spikes feed [[CPI]]
- **Geopolitics**: Trade route disruptions cause price spikes
- **Weather**: Single largest variable

## Transmission Edges
Tracked via FRED `PWHEAMTUSDM` (monthly); scanned by `node run.mjs pull commodity-transmission`. Edges live in `scripts/config/transmission-map.json`.

- **On rise ≥ 12%** → hurts food_producers, grocers, restaurants (lag ~2q)
  - Grain cost inflation squeezes packaged food and baked goods margins; retail food prices rise and volumes dip
  - Tickers: GIS, K, KR, MCD
- **On rise ≥ 12%** → benefits farm_equipment, ag_inputs (lag ~2q)
  - Farm income rises; equipment, seed, and ag-trait spending follows
  - Tickers: DE, AGCO, CTVA
  - Theses: [[Bioengineered Food Systems]]

**Linked theses:** [[Bioengineered Food Systems]]
