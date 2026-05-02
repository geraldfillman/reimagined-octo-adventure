---
title: "EIA Generation Mix Pull"
source: "EIA API v2"
date_pulled: "2026-04-27"
domain: "energy"
data_type: "time_series"
frequency: "monthly"
signal_status: "alert"
signals:
  -
    id: "GENERATION_GAP_NARROWING"
    severity: "alert"
    value: 1.0309278350515465
    threshold: 1.05
    message: "Generation/load ratio at 1.031 — reserve margin thinning"
tags: ["eia", "generation-mix", "energy", "energy"]
related_pulls: []
signal_state: new
---

## What is the US generating power from?

| Period | Fuel Type | Generation (MWh) |
| --- | --- | --- |
| 2026-02 | all fuels | 18533 |
| 2026-02 | coal, excluding waste coal | 42 |
| 2026-02 | natural gas | 3049 |
| 2026-02 | nuclear | 2075 |
| 2026-02 | solar | 31 |
| 2026-02 | wind | 414 |
| 2026-02 | all fuels | 8774 |
| 2026-02 | coal, excluding waste coal | 0 |
| 2026-02 | natural gas | 2032 |
| 2026-02 | solar | 3648 |
| 2026-02 | wind | 2007 |
| 2026-02 | all fuels | 1225 |

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
- **Auto-pulled**: 2026-04-27
