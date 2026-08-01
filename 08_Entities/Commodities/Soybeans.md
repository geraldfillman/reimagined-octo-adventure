---
node_type: "commodity"
name: "Soybeans"
commodity_type: "agricultural"
unit: "USD/tonne"
status: "Active"
fred_series: "PSOYBUSDM"
frequency: "monthly"
key_countries: ["Brazil", "United States", "Argentina"]
key_sectors: ["protein_producers", "food_producers", "ag_processors", "ag_inputs"]
bullish_drivers: []
bearish_drivers: []
related_entities: []
data_sources: ["FRED (PSOYBUSDM)", "KoyFin export", "CFTC COT"]
tags: [commodity, transmission]
---

# Soybeans

## Summary
- Feed meal and edible oil complex. Links farm income, crush processors, and food producers.
- Tracked via FRED series `PSOYBUSDM` (monthly); scanned by `node run.mjs pull commodity-transmission`.

## Transmission Edges
- **On rise ≥ 12%** → hurts protein_producers, food_producers (lag ~2q)
  - Soy meal/oil inflation raises feed and packaged food costs
  - Tickers: TSN, BG
- **On rise ≥ 12%** → benefits ag_processors, ag_inputs (lag ~1q)
  - Crush spreads and ag processing volumes improve; trait-seed demand rises with farm income
  - Tickers: ADM, BG, CTVA
  - Theses: [[Bioengineered Food Systems]]

## Linked Theses
- [[Bioengineered Food Systems]]

## Macro Sensitivity
- **Inflation**: input-cost pass-through per edges above
- **USD Strength**: USD-priced — strong dollar pressures price
- **Global Growth**: demand-side driver

## Notes
- Edges live in `scripts/config/transmission-map.json` — edit there, then regenerate or update this note.
