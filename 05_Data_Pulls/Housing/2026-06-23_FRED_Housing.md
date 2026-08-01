---
title: "FRED Housing Pull"
source: "FRED API"
date_pulled: "2026-06-23"
domain: "housing"
data_type: "time_series"
frequency: "varies"
signal_status: "alert"
signals:
  -
    id: "HOUSING_STARTS_DROP"
    severity: "alert"
    value: -15.445402298850574
    threshold: -10
    message: "Housing starts fell 15.4% MoM"
tags: ["fred", "housing", "housing"]
related_pulls: []
---

## Is housing expanding or contracting?

| Series | Name | Latest Date | Latest Value | Prior Value | Change |
| --- | --- | --- | --- | --- | --- |
| HOUST | Housing Starts | 2026-05-01 | 1177.00 | 1392.00 | -15.4% |
| PERMIT | Building Permits | 2026-05-01 | 1413.00 | 1423.00 | -0.7% |
| CSUSHPINSA | Case-Shiller Home Price Index | 2026-03-01 | 329.94 | 327.59 | 2.35 |
| MORTGAGE30US | 30-Year Fixed Mortgage Rate | 2026-06-18 | 6.47 | 6.52 | -0.05 |

## Signals

### 🟠 Housing Starts Sharp Decline (ALERT)

Housing starts fell 15.4% MoM

**Implications:**
- Builder pullback — check permits for confirmation
- Review homebuilder equities (ITB, XHB)
- May signal rate sensitivity or demand destruction
- Supply pipeline shrinking — future inventory constraint


## Housing Starts (HOUST)

| Date | Value (Thousands) |
| --- | --- |
| 2026-05-01 | 1177.00 |
| 2026-04-01 | 1392.00 |
| 2026-03-01 | 1522.00 |
| 2026-02-01 | 1346.00 |
| 2026-01-01 | 1385.00 |
| 2025-12-01 | 1378.00 |
| 2025-11-01 | 1319.00 |
| 2025-10-01 | 1273.00 |
| 2025-09-01 | 1319.00 |
| 2025-08-01 | 1291.00 |
| 2025-07-01 | 1432.00 |
| 2025-06-01 | 1379.00 |

## Building Permits (PERMIT)

| Date | Value (Thousands) |
| --- | --- |
| 2026-05-01 | 1413.00 |
| 2026-04-01 | 1423.00 |
| 2026-03-01 | 1363.00 |
| 2026-02-01 | 1540.00 |
| 2026-01-01 | 1393.00 |
| 2025-12-01 | 1482.00 |
| 2025-11-01 | 1414.00 |
| 2025-10-01 | 1418.00 |
| 2025-09-01 | 1444.00 |
| 2025-08-01 | 1347.00 |
| 2025-07-01 | 1400.00 |
| 2025-06-01 | 1399.00 |

## Case-Shiller Home Price Index (CSUSHPINSA)

| Date | Value (Index) |
| --- | --- |
| 2026-03-01 | 329.94 |
| 2026-02-01 | 327.59 |
| 2026-01-01 | 326.48 |
| 2025-12-01 | 326.97 |
| 2025-11-01 | 327.82 |
| 2025-10-01 | 328.24 |
| 2025-09-01 | 328.88 |
| 2025-08-01 | 329.85 |
| 2025-07-01 | 330.95 |
| 2025-06-01 | 331.61 |
| 2025-05-01 | 331.43 |
| 2025-04-01 | 329.91 |

## 30-Year Fixed Mortgage Rate (MORTGAGE30US)

| Date | Value (Percent) |
| --- | --- |
| 2026-06-18 | 6.47 |
| 2026-06-11 | 6.52 |
| 2026-06-04 | 6.48 |
| 2026-05-28 | 6.53 |
| 2026-05-21 | 6.51 |
| 2026-05-14 | 6.36 |
| 2026-05-07 | 6.37 |
| 2026-04-30 | 6.30 |
| 2026-04-23 | 6.23 |
| 2026-04-16 | 6.30 |
| 2026-04-09 | 6.37 |
| 2026-04-02 | 6.46 |

## Source

- **API**: FRED (Federal Reserve Economic Data)
- **Series**: HOUST, PERMIT, CSUSHPINSA, MORTGAGE30US
- **Observations**: Last 12 per series
- **Auto-pulled**: 2026-06-23
