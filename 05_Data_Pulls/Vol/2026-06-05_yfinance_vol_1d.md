---
type: "pull_note"
title: "Vol Surface (yfinance)"
source: "yfinance"
domain: "market"
data_type: "vol_surface"
frequency: "daily"
cadence: "daily"
date_pulled: "2026-06-05"
signal_status: "clear"
signals: ["VIX9D / VIX: 1.006: flat", "VIX / VIX3M: 0.924: curve normal", "SKEW: 142.1: mid-range"]
indices_count: 9
pcr_count: 0
tags: ["research-spine", "vol", "options", "yfinance"]
---

## Vol Indices

| Index | Ticker | Close | Change | % Change | High / Low | Last |
| --- | --- | --- | --- | --- | --- | --- |
| VIX | ^VIX | 19.34 | 3.94 | +25.58% | 19.34 / 15.56 | 2026-06-05 00:00 |
| VVIX | ^VVIX | 96.41 | 10.66 | +12.43% | 96.41 / 87.03 | 2026-06-05 00:00 |
| MOVE | ^MOVE | 71.16 | -2.42 | -3.29% | 73.58 / 71.16 | 2026-06-04 00:00 |
| SKEW | ^SKEW | 142.15 | 5.29 | +3.87% | 142.15 / 142.15 | 2026-06-04 00:00 |
| GVZ | ^GVZ | 27.74 | 3.87 | +16.21% | 27.75 / 24.78 | 2026-06-05 00:00 |
| OVX | ^OVX | 58.05 | -1.74 | -2.91% | 59.06 / 56.62 | 2026-06-05 00:00 |
| VXN | ^VXN | 28.64 | 5.42 | +23.34% | 28.64 / 23.79 | 2026-06-05 00:00 |
| VIX9D | ^VIX9D | 19.45 | 6.80 | +53.75% | 19.55 / 13.95 | 2026-06-05 00:00 |
| VIX3M | ^VIX3M | 20.93 | 1.70 | +8.84% | 21.01 / 19.49 | 2026-06-05 00:00 |

## Term-Structure Signals

| Signal | Value | Reading |
| --- | --- | --- |
| VIX9D / VIX | 1.006 | flat |
| VIX / VIX3M | 0.924 | curve normal |
| SKEW | 142.1 | mid-range |

## Put/Call Ratios

_No PCR computed (pass --pcr SPY,QQQ,IWM to compute)._

## IV Term Structure (ATM)

_No term structure computed (pass --term-structure SPY,QQQ to compute)._

## Notes

- Source: free Yahoo Finance via yfinance Python library.
- Vol indices follow CBOE definitions but Yahoo data may lag CBOE settle by 15 min.
- Option-chain ATM IV is the average of nearest-strike call and put implied vols.
- Run with `--interval 1m --period 1d` for intraday tape.
- Raw JSON sidecar saved alongside this note for deeper drill-down.
