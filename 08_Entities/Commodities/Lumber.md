---
node_type: "commodity"
name: "Lumber"
commodity_type: "construction_material"
unit: "PPI Index"
status: "Active"
fred_series: "WPU081"
frequency: "monthly"
key_countries: ["United States", "Canada"]
key_sectors: ["homebuilders", "construction"]
bullish_drivers: []
bearish_drivers: []
related_entities: []
data_sources: ["FRED (WPU081)", "KoyFin export", "CFTC COT"]
tags: [commodity, transmission]
---

# Lumber

## Summary
- Primary homebuilding input. Directly moves homebuilder gross margins and single-family start economics.
- Tracked via FRED series `WPU081` (monthly); scanned by `node run.mjs pull commodity-transmission`.

## Transmission Edges
- **On rise ≥ 12%** → hurts homebuilders, construction (lag ~1q)
  - Framing cost inflation squeezes homebuilder gross margins and slows starts
  - Tickers: DHI, LEN, PHM, BLDR
  - Theses: [[Housing Supply Correction]]
- **On fall ≥ 12%** → benefits homebuilders (lag ~1q)
  - Cheaper framing improves builder margins and single-family start economics
  - Tickers: DHI, LEN, PHM
  - Theses: [[Housing Supply Correction]]

## Linked Theses
- [[Housing Supply Correction]]

## Macro Sensitivity
- **Inflation**: input-cost pass-through per edges above
- **USD Strength**: USD-priced — strong dollar pressures price
- **Global Growth**: demand-side driver

## Notes
- Edges live in `scripts/config/transmission-map.json` — edit there, then regenerate or update this note.
