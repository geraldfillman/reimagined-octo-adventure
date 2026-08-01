---
signal_id: "FUTURES_BACKWARDATION"
signal_name: "Strong backwardation: WTI Crude"
domain: "commodities"
severity: "watch"
value: 13.9
threshold: 5
date: "2026-07-31"
source_pull: "Futures_Curve"
commodities: ["crude_oil"]
tags: ["signal", "commodities", "futures", "watch"]
---

## Physical tightness confirmed by the curve

- **WTI Crude**: front 86.80 vs CLF27.NYM 76.23 (+13.9%)

## Implications

- Treat matching `COMMODITY_TRANSMISSION_*` signals with higher confidence — spot moves backed by curve tightness persist longer.
- Check COT positioning for the same markets: tightness + crowded shorts = squeeze fuel.
