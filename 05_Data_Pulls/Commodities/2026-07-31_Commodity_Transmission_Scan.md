---
title: "Commodity Transmission Scan"
source: "FRED API + transmission-map.json"
date_pulled: "2026-07-31"
domain: "commodities"
data_type: "transmission_scan"
signal_status: "alert"
tripped_commodities: ["crude_oil", "copper", "wheat", "fertilizer", "aluminum"]
tags: ["commodities", "transmission", "scan"]
related_pulls: []
---

## Which input costs are moving, and who inherits them?

| Commodity | Series | Latest | Move (recent vs baseline) | Direction | Edges Tripped |
| --- | --- | --- | --- | --- | --- |
| WTI Crude Oil | DCOILWTICO | 84.25 | -16.9% | fall | 2 (alert) |
| Henry Hub Natural Gas | DHHNGSP | 2.63 | -1.1% | fall | none |
| Copper (IMF Global Price) | PCOPPUSDM | 13552.04 | +18.4% | rise | 2 (watch) |
| Wheat (IMF Global Price) | PWHEAMTUSDM | 199.65 | +23.8% | rise | 2 (watch) |
| Corn (IMF Global Price) | PMAIZMTUSDM | 195.78 | +4.1% | rise | none |
| Soybeans (IMF Global Price) | PSOYBUSDM | 414.54 | +9.3% | rise | none |
| Fertilizer Materials (PPI) | WPU0652 | 449.23 | +19.5% | rise | 2 (watch) |
| Lumber & Wood Products (PPI) | WPU081 | 280.11 | +6.2% | rise | none |
| Aluminum (IMF Global Price) | PALUMUSDM | 3438.85 | +23.7% | rise | 2 (alert) |

## WTI Crude Oil — fall 16.9%

- **Benefits** construction, homebuilders, airlines, logistics (lag ~1q)
  - Cheaper fuel, asphalt, and petrochemical inputs lower construction and logistics costs
  - Tickers: VMC, MLM, DHI, LEN, DAL, UPS
  - Theses: [[Housing Supply Correction]]
- **Hurts** energy_services, exploration_production (lag ~2q)
  - E&P operators cut capex; oilfield services and equipment orders dry up first
  - Tickers: SLB, HAL, XOM, OXY

## Copper (IMF Global Price) — rise 18.4%

- **Hurts** grid_equipment, electrical_equipment, construction_electrical (lag ~1q)
  - Copper is the binding input for transformers, switchgear, and cabling; grid equipment costs and lead times worsen — electrical bottleneck tightens
  - Tickers: ETN, PWR, HUBB, WCC
  - Theses: [[Grid Equipment Bottleneck]], [[AI Power Infrastructure]], [[Grid-Scale Battery Storage]]
- **Benefits** miners (lag ~0q)
  - Miners and copper-heavy producers capture price; scarcity confirms grid-buildout demand thesis
  - Tickers: FCX, SCCO, TECK
  - Theses: [[Grid Equipment Bottleneck]]

## Wheat (IMF Global Price) — rise 23.8%

- **Hurts** food_producers, grocers, restaurants (lag ~2q)
  - Grain cost inflation squeezes packaged food and baked goods margins; retail food prices rise and volumes dip
  - Tickers: GIS, K, KR, MCD
- **Benefits** farm_equipment, ag_inputs (lag ~2q)
  - Farm income rises; equipment, seed, and ag-trait spending follows
  - Tickers: DE, AGCO, CTVA
  - Theses: [[Bioengineered Food Systems]]

## Fertilizer Materials (PPI) — rise 19.5%

- **Hurts** food_producers, grocers (lag ~3q)
  - Expensive fertilizer raises crop production cost → food prices rise → grocery volumes and food producer margins dip
  - Tickers: GIS, KR, TSN
  - Theses: [[Bioengineered Food Systems]]
- **Benefits** fertilizer_producers, precision_ag (lag ~1q)
  - Fertilizer producers capture pricing; efficiency traits and precision-ag adoption accelerate as farmers economize
  - Tickers: CF, NTR, MOS, CTVA
  - Theses: [[Bioengineered Food Systems]]

## Aluminum (IMF Global Price) — rise 23.7%

- **Hurts** aerospace, packaging, autos_ev (lag ~2q)
  - Airframe, packaging, and EV body input costs rise; defense procurement unit costs creep
  - Tickers: BA, BLL, F
  - Theses: [[Fiscal Scarcity Rearmament]]
- **Benefits** miners, metals_producers (lag ~0q)
  - Smelters and recyclers capture price
  - Tickers: AA, CENX

## Method

- Daily series: 20-obs average vs prior 40-obs average.
- Monthly series: 3-obs average vs prior 9-obs average.
- Edges trip when the move direction matches and magnitude ≥ edge threshold.
- Map: `scripts/config/transmission-map.json` — edit edges there.
