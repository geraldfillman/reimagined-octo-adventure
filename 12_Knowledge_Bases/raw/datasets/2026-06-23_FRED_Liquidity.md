---
title: "FRED Liquidity Pull"
source: "FRED API"
date_pulled: "2026-06-23"
domain: "macro"
data_type: "time_series"
frequency: "varies"
signal_status: "alert"
signals:
  -
    id: "REVERSE_REPO_DEPLETED"
    severity: "alert"
    value: 3.925
    threshold: 100
    message: "RRP facility near zero at $4bn"
tags: ["fred", "liquidity", "macro"]
related_pulls: []
---

## Is the market running on fuel or friction?

| Series | Name | Latest Date | Latest Value | Prior Value | Change |
| --- | --- | --- | --- | --- | --- |
| WALCL | Fed Total Assets (Balance Sheet) | 2026-06-17 | 6736424.00 | 6725397.00 | 0.2% |
| RRPONTSYD | Overnight Reverse Repo | 2026-06-22 | 3.92 | 0.25 | 1463.7% |
| WTREGEN | Treasury General Account (TGA) | 2026-06-17 | 880713.00 | 828122.00 | 6.4% |
| BAMLH0A0HYM2 | ICE BofA US High Yield Spread | 2026-06-22 | 2.65 | 2.66 | -0.01 |
| BAMLC0A4CBBB | ICE BofA BBB Corporate Spread | 2026-06-22 | 0.93 | 0.93 | 0.00 |
| WRESBAL | Reserve Balances with Fed Banks | 2026-06-17 | 3033444.00 | 3080723.00 | -1.5% |

## Signals

### 🟠 Reverse Repo Facility Near Depleted (ALERT)

RRP facility near zero at $4bn

**Implications:**
- Liquidity buffer exhausted, Treasury issuance now drains reserves directly
- Watch for funding stress in money markets
- Monitor repo rates and SOFR for stress signals


## Fed Total Assets (Balance Sheet) (WALCL)

| Date | Value (Millions) |
| --- | --- |
| 2026-06-17 | 6736424.00 |
| 2026-06-10 | 6725397.00 |
| 2026-06-03 | 6711495.00 |
| 2026-05-27 | 6704383.00 |
| 2026-05-20 | 6713643.00 |
| 2026-05-13 | 6728502.00 |
| 2026-05-06 | 6709505.00 |
| 2026-04-29 | 6699950.00 |
| 2026-04-22 | 6707419.00 |
| 2026-04-15 | 6705696.00 |
| 2026-04-08 | 6693871.00 |
| 2026-04-01 | 6675344.00 |

## Overnight Reverse Repo (RRPONTSYD)

| Date | Value (Billions) |
| --- | --- |
| 2026-06-22 | 3.92 |
| 2026-06-18 | 0.25 |
| 2026-06-17 | 6.83 |
| 2026-06-16 | 10.72 |
| 2026-06-15 | 0.58 |
| 2026-06-12 | 0.45 |
| 2026-06-11 | 0.46 |
| 2026-06-10 | 0.39 |
| 2026-06-09 | 0.58 |
| 2026-06-08 | 1.83 |
| 2026-06-05 | 0.76 |

## Treasury General Account (TGA) (WTREGEN)

| Date | Value (Millions) |
| --- | --- |
| 2026-06-17 | 880713.00 |
| 2026-06-10 | 828122.00 |
| 2026-06-03 | 875713.00 |
| 2026-05-27 | 830296.00 |
| 2026-05-20 | 781293.00 |
| 2026-05-13 | 838584.00 |
| 2026-05-06 | 877761.00 |
| 2026-04-29 | 981929.00 |
| 2026-04-22 | 1005968.00 |
| 2026-04-15 | 751354.00 |
| 2026-04-08 | 748376.00 |
| 2026-04-01 | 847718.00 |

## ICE BofA US High Yield Spread (BAMLH0A0HYM2)

| Date | Value (Percent) |
| --- | --- |
| 2026-06-22 | 2.65 |
| 2026-06-19 | 2.66 |
| 2026-06-18 | 2.66 |
| 2026-06-17 | 2.63 |
| 2026-06-16 | 2.71 |
| 2026-06-15 | 2.66 |
| 2026-06-12 | 2.71 |
| 2026-06-11 | 2.78 |
| 2026-06-10 | 2.80 |
| 2026-06-09 | 2.78 |
| 2026-06-08 | 2.75 |
| 2026-06-05 | 2.76 |

## ICE BofA BBB Corporate Spread (BAMLC0A4CBBB)

| Date | Value (Percent) |
| --- | --- |
| 2026-06-22 | 0.93 |
| 2026-06-19 | 0.93 |
| 2026-06-18 | 0.93 |
| 2026-06-17 | 0.92 |
| 2026-06-16 | 0.93 |
| 2026-06-15 | 0.92 |
| 2026-06-12 | 0.93 |
| 2026-06-11 | 0.94 |
| 2026-06-10 | 0.94 |
| 2026-06-09 | 0.93 |
| 2026-06-08 | 0.93 |
| 2026-06-05 | 0.93 |

## Reserve Balances with Fed Banks (WRESBAL)

| Date | Value (Millions) |
| --- | --- |
| 2026-06-17 | 3033444.00 |
| 2026-06-10 | 3080723.00 |
| 2026-06-03 | 3013902.00 |
| 2026-05-27 | 3066560.00 |
| 2026-05-20 | 3129562.00 |
| 2026-05-13 | 3102810.00 |
| 2026-05-06 | 3032588.00 |
| 2026-04-29 | 2918599.00 |
| 2026-04-22 | 2901825.00 |
| 2026-04-15 | 3129588.00 |
| 2026-04-08 | 3116247.00 |
| 2026-04-01 | 3026708.00 |

## Source

- **API**: FRED (Federal Reserve Economic Data)
- **Series**: WALCL, RRPONTSYD, WTREGEN, BAMLH0A0HYM2, BAMLC0A4CBBB, WRESBAL
- **Observations**: Last 12 per series
- **Auto-pulled**: 2026-06-23
