---
title: "FRED Liquidity Pull"
source: "FRED API"
date_pulled: "2026-06-05"
domain: "macro"
data_type: "time_series"
frequency: "varies"
signal_status: "alert"
signals:
  -
    id: "REVERSE_REPO_DEPLETED"
    severity: "alert"
    value: 0.761
    threshold: 100
    message: "RRP facility near zero at $1bn"
tags: ["fred", "liquidity", "macro"]
related_pulls: []
---

## Is the market running on fuel or friction?

| Series | Name | Latest Date | Latest Value | Prior Value | Change |
| --- | --- | --- | --- | --- | --- |
| WALCL | Fed Total Assets (Balance Sheet) | 2026-06-03 | 6711495.00 | 6704383.00 | 0.1% |
| RRPONTSYD | Overnight Reverse Repo | 2026-06-05 | 0.76 | 1.12 | -32.2% |
| WTREGEN | Treasury General Account (TGA) | 2026-06-03 | 875713.00 | 830296.00 | 5.5% |
| BAMLH0A0HYM2 | ICE BofA US High Yield Spread | 2026-06-04 | 2.74 | 2.75 | -0.01 |
| BAMLC0A4CBBB | ICE BofA BBB Corporate Spread | 2026-06-04 | 0.93 | 0.93 | 0.00 |
| WRESBAL | Reserve Balances with Fed Banks | 2026-06-03 | 3013902.00 | 3066560.00 | -1.7% |

## Signals

### 🟠 Reverse Repo Facility Near Depleted (ALERT)

RRP facility near zero at $1bn

**Implications:**
- Liquidity buffer exhausted, Treasury issuance now drains reserves directly
- Watch for funding stress in money markets
- Monitor repo rates and SOFR for stress signals


## Fed Total Assets (Balance Sheet) (WALCL)

| Date | Value (Millions) |
| --- | --- |
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
| 2026-03-25 | 6657161.00 |
| 2026-03-18 | 6655939.00 |

## Overnight Reverse Repo (RRPONTSYD)

| Date | Value (Billions) |
| --- | --- |
| 2026-06-05 | 0.76 |
| 2026-06-04 | 1.12 |
| 2026-06-03 | 2.06 |
| 2026-06-02 | 2.50 |
| 2026-06-01 | 1.30 |
| 2026-05-29 | 11.68 |
| 2026-05-28 | 1.16 |
| 2026-05-27 | 1.85 |
| 2026-05-26 | 1.79 |
| 2026-05-22 | 0.96 |
| 2026-05-21 | 3.28 |

## Treasury General Account (TGA) (WTREGEN)

| Date | Value (Millions) |
| --- | --- |
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
| 2026-03-25 | 874077.00 |
| 2026-03-18 | 853052.00 |

## ICE BofA US High Yield Spread (BAMLH0A0HYM2)

| Date | Value (Percent) |
| --- | --- |
| 2026-06-04 | 2.74 |
| 2026-06-03 | 2.75 |
| 2026-06-02 | 2.71 |
| 2026-06-01 | 2.72 |
| 2026-05-31 | 2.74 |
| 2026-05-29 | 2.72 |
| 2026-05-28 | 2.72 |
| 2026-05-27 | 2.71 |
| 2026-05-26 | 2.72 |
| 2026-05-25 | 2.74 |
| 2026-05-22 | 2.74 |
| 2026-05-21 | 2.78 |

## ICE BofA BBB Corporate Spread (BAMLC0A4CBBB)

| Date | Value (Percent) |
| --- | --- |
| 2026-06-04 | 0.93 |
| 2026-06-03 | 0.93 |
| 2026-06-02 | 0.92 |
| 2026-06-01 | 0.92 |
| 2026-05-31 | 0.93 |
| 2026-05-29 | 0.92 |
| 2026-05-28 | 0.93 |
| 2026-05-27 | 0.93 |
| 2026-05-26 | 0.93 |
| 2026-05-25 | 0.93 |
| 2026-05-22 | 0.93 |
| 2026-05-21 | 0.94 |

## Reserve Balances with Fed Banks (WRESBAL)

| Date | Value (Millions) |
| --- | --- |
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
| 2026-03-25 | 2993955.00 |
| 2026-03-18 | 3019995.00 |

## Source

- **API**: FRED (Federal Reserve Economic Data)
- **Series**: WALCL, RRPONTSYD, WTREGEN, BAMLH0A0HYM2, BAMLC0A4CBBB, WRESBAL
- **Observations**: Last 12 per series
- **Auto-pulled**: 2026-06-05
