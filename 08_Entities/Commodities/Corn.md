---
node_type: "commodity"
name: "Corn"
commodity_type: "agricultural"
unit: "USD/tonne"
status: "Active"
fred_series: "PMAIZMTUSDM"
frequency: "monthly"
key_countries: ["United States", "Brazil", "Argentina"]
key_sectors: ["protein_producers", "food_producers", "farm_equipment", "ag_inputs"]
bullish_drivers: []
bearish_drivers: []
related_entities: []
data_sources: ["FRED (PMAIZMTUSDM)", "KoyFin export", "CFTC COT"]
tags: [commodity, transmission]
---

# Corn

## Summary
- Primary animal feed input. Corn inflation hits protein producers first, then retail meat prices.
- Tracked via FRED series `PMAIZMTUSDM` (monthly); scanned by `node run.mjs pull commodity-transmission`.

## Transmission Edges
- **On rise ≥ 12%** → hurts protein_producers, food_producers (lag ~2q)
  - Feed cost inflation hits protein producers (chicken, pork, beef) hardest; ethanol blend margins compress
  - Tickers: TSN, PPC, HRL
- **On rise ≥ 12%** → benefits farm_equipment, ag_inputs (lag ~2q)
  - Farm income and ag input demand rise
  - Tickers: DE, CTVA
  - Theses: [[Bioengineered Food Systems]]

## Linked Theses
- [[Bioengineered Food Systems]]

## Macro Sensitivity
- **Inflation**: input-cost pass-through per edges above
- **USD Strength**: USD-priced — strong dollar pressures price
- **Global Growth**: demand-side driver

## Notes
- Edges live in `scripts/config/transmission-map.json` — edit there, then regenerate or update this note.
