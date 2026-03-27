---
title: "FRED Interest Rates Pull"
source: "FRED API"
date_pulled: "2026-03-26"
domain: "macro"
data_type: "time_series"
frequency: "varies"
signal_status: "watch"
signals:
  -
    id: "YIELD_CURVE_FLATTENING"
    severity: "watch"
    value: 0.48999999999999977
    threshold: 0.5
    message: "Yield curve flattening: 10Y-2Y spread at 0.49%"
tags: ["fred", "rates", "macro"]
related_pulls: []
---

## What's the rate regime and curve shape?

| Series | Name | Latest Date | Latest Value | Prior Value | Change |
| --- | --- | --- | --- | --- | --- |
| DFF | Federal Funds Rate | 2026-03-24 | 3.64 | 3.64 | 0.00 |
| DGS2 | 2-Year Treasury Yield | 2026-03-24 | 3.90 | 3.83 | 0.07 |
| DGS10 | 10-Year Treasury Yield | 2026-03-24 | 4.39 | 4.34 | 0.05 |
| DGS30 | 30-Year Treasury Yield | 2026-03-24 | 4.94 | 4.91 | 0.03 |
| T10Y2Y | 10Y-2Y Spread | 2026-03-25 | 0.49 | 0.49 | 0.00 |

## Signals

### 🟡 Yield Curve Flattening (WATCH)

Yield curve flattening: 10Y-2Y spread at 0.49%

**Implications:**
- Late-cycle dynamics forming
- Begin reviewing defensive positions
- Watch for further compression toward inversion


## Federal Funds Rate (DFF)

| Date | Value (Percent) |
| --- | --- |
| 2026-03-24 | 3.64 |
| 2026-03-23 | 3.64 |
| 2026-03-22 | 3.64 |
| 2026-03-21 | 3.64 |
| 2026-03-20 | 3.64 |
| 2026-03-19 | 3.64 |
| 2026-03-18 | 3.64 |
| 2026-03-17 | 3.64 |
| 2026-03-16 | 3.64 |
| 2026-03-15 | 3.64 |
| 2026-03-14 | 3.64 |
| 2026-03-13 | 3.64 |

## 2-Year Treasury Yield (DGS2)

| Date | Value (Percent) |
| --- | --- |
| 2026-03-24 | 3.90 |
| 2026-03-23 | 3.83 |
| 2026-03-20 | 3.88 |
| 2026-03-19 | 3.79 |
| 2026-03-18 | 3.76 |
| 2026-03-17 | 3.68 |
| 2026-03-16 | 3.68 |
| 2026-03-13 | 3.73 |
| 2026-03-12 | 3.76 |
| 2026-03-11 | 3.64 |
| 2026-03-10 | 3.57 |
| 2026-03-09 | 3.56 |

## 10-Year Treasury Yield (DGS10)

| Date | Value (Percent) |
| --- | --- |
| 2026-03-24 | 4.39 |
| 2026-03-23 | 4.34 |
| 2026-03-20 | 4.39 |
| 2026-03-19 | 4.25 |
| 2026-03-18 | 4.26 |
| 2026-03-17 | 4.20 |
| 2026-03-16 | 4.23 |
| 2026-03-13 | 4.28 |
| 2026-03-12 | 4.27 |
| 2026-03-11 | 4.21 |
| 2026-03-10 | 4.15 |
| 2026-03-09 | 4.12 |

## 30-Year Treasury Yield (DGS30)

| Date | Value (Percent) |
| --- | --- |
| 2026-03-24 | 4.94 |
| 2026-03-23 | 4.91 |
| 2026-03-20 | 4.96 |
| 2026-03-19 | 4.83 |
| 2026-03-18 | 4.88 |
| 2026-03-17 | 4.85 |
| 2026-03-16 | 4.86 |
| 2026-03-13 | 4.90 |
| 2026-03-12 | 4.88 |
| 2026-03-11 | 4.86 |
| 2026-03-10 | 4.78 |
| 2026-03-09 | 4.72 |

## 10Y-2Y Spread (T10Y2Y)

| Date | Value (Percent) |
| --- | --- |
| 2026-03-25 | 0.49 |
| 2026-03-24 | 0.49 |
| 2026-03-23 | 0.51 |
| 2026-03-20 | 0.51 |
| 2026-03-19 | 0.46 |
| 2026-03-18 | 0.50 |
| 2026-03-17 | 0.52 |
| 2026-03-16 | 0.55 |
| 2026-03-13 | 0.55 |
| 2026-03-12 | 0.51 |
| 2026-03-11 | 0.57 |
| 2026-03-10 | 0.58 |

## Source

- **API**: FRED (Federal Reserve Economic Data)
- **Series**: DFF, DGS2, DGS10, DGS30, T10Y2Y
- **Observations**: Last 12 per series
- **Auto-pulled**: 2026-03-26
