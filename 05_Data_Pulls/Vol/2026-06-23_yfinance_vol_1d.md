---
type: "pull_note"
title: "Vol Surface (yfinance)"
source: "yfinance"
domain: "market"
data_type: "vol_surface"
frequency: "daily"
cadence: "daily"
date_pulled: "2026-06-23"
signal_status: "clear"
signals: ["VIX9D / VIX: 0.981: flat", "VIX / VIX3M: 0.911: curve normal", "SKEW: 141.9: mid-range"]
indices_count: 9
pcr_count: 0
tags: ["research-spine", "vol", "options", "yfinance"]
---

## Vol Indices

| Index | Ticker | Close | Change | % Change | High / Low | Last |
| --- | --- | --- | --- | --- | --- | --- |
| VIX | ^VIX | 18.88 | 1.60 | +9.26% | 20.54 / 18.79 | 2026-06-23 00:00 |
| VVIX | ^VVIX | 98.76 | 7.04 | +7.68% | 101.65 / 98.39 | 2026-06-23 00:00 |
| MOVE | ^MOVE | 65.39 | -5.27 | -7.46% | 70.66 / 65.39 | 2026-06-18 00:00 |
| SKEW | ^SKEW | 141.85 | -4.87 | -3.32% | 141.85 / 141.85 | 2026-06-22 00:00 |
| GVZ | ^GVZ | 27.33 | 1.18 | +4.51% | 28.51 / 27.30 | 2026-06-23 00:00 |
| OVX | ^OVX | 47.84 | -2.86 | -5.64% | 49.87 / 47.72 | 2026-06-23 00:00 |
| VXN | ^VXN | 31.66 | 3.99 | +14.42% | 32.48 / 30.56 | 2026-06-23 00:00 |
| VIX9D | ^VIX9D | 18.52 | 4.59 | +32.95% | 21.54 / 18.39 | 2026-06-23 00:00 |
| VIX3M | ^VIX3M | 20.73 | 1.16 | +5.93% | 21.52 / 20.69 | 2026-06-23 00:00 |

## Term-Structure Signals

| Signal | Value | Reading |
| --- | --- | --- |
| VIX9D / VIX | 0.981 | flat |
| VIX / VIX3M | 0.911 | curve normal |
| SKEW | 141.9 | mid-range |

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
