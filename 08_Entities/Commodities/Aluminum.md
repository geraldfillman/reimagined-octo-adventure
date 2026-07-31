---
node_type: "commodity"
name: "Aluminum"
commodity_type: "industrial_metal"
unit: "USD/tonne"
status: "Active"
fred_series: "PALUMUSDM"
frequency: "monthly"
key_countries: ["China", "India", "Russia", "Canada"]
key_sectors: ["aerospace", "packaging", "autos_ev", "miners", "metals_producers"]
bullish_drivers: []
bearish_drivers: []
related_entities: []
data_sources: ["FRED (PALUMUSDM)", "KoyFin export", "CFTC COT"]
tags: [commodity, transmission]
---

# Aluminum

## Summary
- Energy-intensive light metal for aerospace, packaging, autos, and defense platforms.
- Tracked via FRED series `PALUMUSDM` (monthly); scanned by `node run.mjs pull commodity-transmission`.

## Transmission Edges
- **On rise ≥ 10%** → hurts aerospace, packaging, autos_ev (lag ~2q)
  - Airframe, packaging, and EV body input costs rise; defense procurement unit costs creep
  - Tickers: BA, BLL, F
  - Theses: [[Fiscal Scarcity Rearmament]]
- **On rise ≥ 10%** → benefits miners, metals_producers (lag ~0q)
  - Smelters and recyclers capture price
  - Tickers: AA, CENX

## Linked Theses
- [[Fiscal Scarcity Rearmament]]

## Macro Sensitivity
- **Inflation**: input-cost pass-through per edges above
- **USD Strength**: USD-priced — strong dollar pressures price
- **Global Growth**: demand-side driver

## Notes
- Edges live in `scripts/config/transmission-map.json` — edit there, then regenerate or update this note.
