---
title: "FRED Liquidity Pull"
source: "FRED API"
date_pulled: "2026-05-01"
domain: "macro"
data_type: "time_series"
frequency: "varies"
signal_status: "alert"
signals:
  -
    id: "REVERSE_REPO_DEPLETED"
    severity: "alert"
    value: 0.607
    threshold: 100
    message: "RRP facility near zero at $1bn"
tags: ["fred", "liquidity", "macro"]
related_pulls: []
ack_status: "reviewed"
signal_state: new
---

## Is the market running on fuel or friction?

| Series | Name | Latest Date | Latest Value | Prior Value | Change |
| --- | --- | --- | --- | --- | --- |
| WALCL | Fed Total Assets (Balance Sheet) | 2026-04-29 | 6699950.00 | 6707419.00 | -0.1% |
| RRPONTSYD | Overnight Reverse Repo | 2026-05-01 | 0.61 | 8.26 | -92.7% |
| BAMLH0A0HYM2 | ICE BofA US High Yield Spread | 2026-04-30 | 2.83 | 2.82 | 0.01 |
| BAMLC0A4CBBB | ICE BofA BBB Corporate Spread | 2026-04-30 | 1.02 | 1.01 | 0.01 |
| WRESBAL | Reserve Balances with Fed Banks | 2026-04-29 | 2918599.00 | 2901825.00 | 0.6% |

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
| 2026-04-29 | 6699950.00 |
| 2026-04-22 | 6707419.00 |
| 2026-04-15 | 6705696.00 |
| 2026-04-08 | 6693871.00 |
| 2026-04-01 | 6675344.00 |
| 2026-03-25 | 6657161.00 |
| 2026-03-18 | 6655939.00 |
| 2026-03-11 | 6646344.00 |
| 2026-03-04 | 6628894.00 |
| 2026-02-25 | 6613797.00 |
| 2026-02-18 | 6613395.00 |
| 2026-02-11 | 6622382.00 |

## Overnight Reverse Repo (RRPONTSYD)

| Date | Value (Billions) |
| --- | --- |
| 2026-05-01 | 0.61 |
| 2026-04-30 | 8.26 |
| 2026-04-29 | 0.75 |
| 2026-04-28 | 0.64 |
| 2026-04-27 | 0.36 |
| 2026-04-24 | 0.08 |
| 2026-04-23 | 0.11 |
| 2026-04-22 | 0.54 |
| 2026-04-21 | 0.81 |
| 2026-04-20 | 0.50 |
| 2026-04-17 | 0.14 |
| 2026-04-16 | 0.16 |

## ICE BofA US High Yield Spread (BAMLH0A0HYM2)

| Date | Value (Percent) |
| --- | --- |
| 2026-04-30 | 2.83 |
| 2026-04-29 | 2.82 |
| 2026-04-28 | 2.85 |
| 2026-04-27 | 2.84 |
| 2026-04-24 | 2.86 |
| 2026-04-23 | 2.86 |
| 2026-04-22 | 2.84 |
| 2026-04-21 | 2.85 |
| 2026-04-20 | 2.87 |
| 2026-04-17 | 2.83 |
| 2026-04-16 | 2.86 |
| 2026-04-15 | 2.85 |

## ICE BofA BBB Corporate Spread (BAMLC0A4CBBB)

| Date | Value (Percent) |
| --- | --- |
| 2026-04-30 | 1.02 |
| 2026-04-29 | 1.01 |
| 2026-04-28 | 1.02 |
| 2026-04-27 | 1.01 |
| 2026-04-24 | 1.00 |
| 2026-04-23 | 1.00 |
| 2026-04-22 | 0.99 |
| 2026-04-21 | 1.00 |
| 2026-04-20 | 1.01 |
| 2026-04-17 | 1.01 |
| 2026-04-16 | 1.01 |
| 2026-04-15 | 1.01 |

## Reserve Balances with Fed Banks (WRESBAL)

| Date | Value (Millions) |
| --- | --- |
| 2026-04-29 | 2918599.00 |
| 2026-04-22 | 2901825.00 |
| 2026-04-15 | 3129588.00 |
| 2026-04-08 | 3116247.00 |
| 2026-04-01 | 3026708.00 |
| 2026-03-25 | 2993955.00 |
| 2026-03-18 | 3019995.00 |
| 2026-03-11 | 3037665.00 |
| 2026-03-04 | 3015531.00 |
| 2026-02-25 | 2965765.00 |
| 2026-02-18 | 2949804.00 |
| 2026-02-11 | 2939557.00 |

## Source

- **API**: FRED (Federal Reserve Economic Data)
- **Series**: WALCL, RRPONTSYD, BAMLH0A0HYM2, BAMLC0A4CBBB, WRESBAL
- **Observations**: Last 12 per series
- **Auto-pulled**: 2026-05-01
