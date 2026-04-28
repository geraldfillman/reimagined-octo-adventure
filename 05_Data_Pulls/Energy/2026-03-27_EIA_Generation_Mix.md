---
title: "EIA Generation Mix Pull"
source: "EIA API v2"
date_pulled: "2026-03-27"
domain: "energy"
data_type: "time_series"
frequency: "monthly"
signal_status: "alert"
signals:
  -
    id: "GENERATION_GAP_NARROWING"
    severity: "alert"
    value: 1.0309278350515463
    threshold: 1.05
    message: "Generation/load ratio at 1.031 — reserve margin thinning"
tags: ["eia", "generation-mix", "energy", "energy"]
related_pulls: []
signal_state: new
---

## What is the US generating power from?

| Period | Fuel Type | Generation (MWh) |
| --- | --- | --- |
| 2026-01 | all fuels | 22890 |
| 2026-01 | coal, excluding waste coal | 46 |
| 2026-01 | natural gas | 3417 |
| 2026-01 | nuclear | 2542 |
| 2026-01 | solar | 27 |
| 2026-01 | wind | 437 |
| 2026-01 | all fuels | 8919 |
| 2026-01 | coal, excluding waste coal | 0 |
| 2026-01 | natural gas | 2378 |
| 2026-01 | solar | 3223 |
| 2026-01 | wind | 2085 |
| 2026-01 | all fuels | 1388 |

## Signals

### 🟠 Generation Gap Narrowing (ALERT)

Generation/load ratio at 1.031 — reserve margin thinning

**Implications:**
- Power pricing pressure building
- Peaker plants and storage becoming critical
- Watch for capacity auction results


## Source

- **API**: EIA (Energy Information Administration) v2
- **Endpoint**: /electricity/electric-power-operational-data/data/
- **Frequency**: monthly
- **Records**: 12
- **Auto-pulled**: 2026-03-27
