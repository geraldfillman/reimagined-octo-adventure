---
node_type: "commodity"
name: "Fertilizer"
commodity_type: "agricultural_input"
unit: "PPI Index"
status: "Active"
fred_series: "WPU0652"
frequency: "monthly"
key_countries: ["China", "Russia", "Canada", "Morocco"]
key_sectors: ["food_producers", "grocers", "fertilizer_producers", "precision_ag", "farm_equipment"]
bullish_drivers: []
bearish_drivers: []
related_entities: []
data_sources: ["FRED (WPU0652)", "KoyFin export", "CFTC COT"]
tags: [commodity, transmission]
---

# Fertilizer

## Summary
- Derived from natural gas (nitrogen) and mined rock (potash/phosphate). Expensive fertilizer raises crop costs → food prices → weaker food retail volumes.
- Tracked via FRED series `WPU0652` (monthly); scanned by `node run.mjs pull commodity-transmission`.

## Transmission Edges
- **On rise ≥ 10%** → hurts food_producers, grocers (lag ~3q)
  - Expensive fertilizer raises crop production cost → food prices rise → grocery volumes and food producer margins dip
  - Tickers: GIS, KR, TSN
  - Theses: [[Bioengineered Food Systems]]
- **On rise ≥ 10%** → benefits fertilizer_producers, precision_ag (lag ~1q)
  - Fertilizer producers capture pricing; efficiency traits and precision-ag adoption accelerate as farmers economize
  - Tickers: CF, NTR, MOS, CTVA
  - Theses: [[Bioengineered Food Systems]]
- **On fall ≥ 10%** → benefits food_producers, farm_equipment (lag ~2q)
  - Farm input relief supports planting volumes and food margin recovery
  - Tickers: GIS, DE

## Linked Theses
- [[Bioengineered Food Systems]]

## Macro Sensitivity
- **Inflation**: input-cost pass-through per edges above
- **USD Strength**: USD-priced — strong dollar pressures price
- **Global Growth**: demand-side driver

## Notes
- Edges live in `scripts/config/transmission-map.json` — edit there, then regenerate or update this note.
