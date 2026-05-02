---
title: "SPY QQQ Entropy Monitor"
source: "Entropy Monitor"
agent_owner: "Orchestrator Agent"
agent_scope: "pull"
date_pulled: "2026-04-30"
domain: "market"
data_type: "entropy_monitor"
frequency: "intraday-shadow"
signal_status: "watch"
signals: ["ENTROPY_MA_NEAR_LOW_WATCH"]
symbols: ["GEHC", "TER", "SBUX", "SOFI", "ODFL", "CNC", "V", "VTR", "QCOM", "TW", "IWR", "FTAI", "HOOD", "GD", "HUM", "HLT", "IAU", "BIIB", "VRSK", "MA"]
lookback_bars: 120
near_entropy_threshold: 0.6
low_entropy_threshold: 0.5
ledger_path: "scripts/.cache/entropy-monitor/entropy-monitor-ledger.csv"
tags: ["entropy-monitor", "market", "strategy-shadow"]
---

## Current Snapshot

| Symbol | Bar Time | Price | Entropy | Level | Bucket | Quote Chg % | Vol Ratio | Window Start |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GEHC | 2026-04-30 09:33:00 | 60.2600 | 0.6300 | mixed | baseline | 0.92 | N/A | 2026-04-29 14:03:00 |
| TER | 2026-04-30 09:33:00 | 331.1300 | 0.6600 | mixed | baseline | 8.88 | N/A | 2026-04-29 14:03:00 |
| SBUX | 2026-04-30 09:33:00 | 104.4300 | 0.6300 | mixed | baseline | -1.13 | N/A | 2026-04-29 14:03:00 |
| SOFI | 2026-04-30 09:33:00 | 15.8200 | 0.6300 | mixed | baseline | 1.58 | N/A | 2026-04-29 14:03:00 |
| ODFL | 2026-04-30 09:33:00 | 212.0700 | 0.6700 | mixed | baseline | 0.71 | N/A | 2026-04-29 14:03:00 |
| CNC | 2026-04-30 09:33:00 | 53.2200 | 0.6600 | mixed | baseline | -0.89 | N/A | 2026-04-29 14:03:00 |
| V | 2026-04-30 09:33:00 | 330.5850 | 0.6200 | mixed | baseline | -1.01 | N/A | 2026-04-29 14:03:00 |
| VTR | 2026-04-30 09:33:00 | 88.1600 | 0.7100 | mixed | baseline | 0.87 | N/A | 2026-04-29 14:03:00 |
| QCOM | 2026-04-30 09:33:00 | 165.5799 | 0.6700 | mixed | baseline | 6.78 | N/A | 2026-04-29 14:03:00 |
| TW | 2026-04-30 09:33:00 | 116.0075 | 0.6700 | mixed | baseline | -0.82 | N/A | 2026-04-29 14:03:00 |
| IWR | 2026-04-30 09:33:00 | 103.0000 | 0.6400 | mixed | baseline | 0.54 | N/A | 2026-04-29 14:03:00 |
| FTAI | 2026-04-30 09:34:00 | 245.3300 | 0.6400 | mixed | baseline | 15.20 | N/A | 2026-04-29 14:04:00 |
| HOOD | 2026-04-30 09:33:00 | 71.9847 | 0.6600 | mixed | baseline | 1.18 | N/A | 2026-04-29 14:03:00 |
| GD | 2026-04-30 09:33:00 | 339.0000 | 0.6400 | mixed | baseline | 0.13 | N/A | 2026-04-29 14:03:00 |
| HUM | 2026-04-30 09:33:00 | 243.1200 | 0.6500 | mixed | baseline | -0.09 | N/A | 2026-04-29 14:03:00 |
| HLT | 2026-04-30 09:33:00 | 321.4200 | 0.6500 | mixed | baseline | 2.12 | N/A | 2026-04-29 14:03:00 |
| IAU | 2026-04-30 09:33:00 | 87.1050 | 0.6100 | mixed | baseline | 1.77 | N/A | 2026-04-29 14:03:00 |
| BIIB | 2026-04-30 09:33:00 | 192.5000 | 0.6100 | mixed | baseline | -1.35 | N/A | 2026-04-29 14:03:00 |
| VRSK | 2026-04-30 09:34:00 | 187.0900 | 0.6600 | mixed | baseline | -0.36 | N/A | 2026-04-29 14:04:00 |
| MA | 2026-04-30 09:34:00 | 502.7400 | 0.6000 | mixed | near-low-watch | -4.08 | N/A | 2026-04-29 14:04:00 |

## Settled Movement Summary

| Symbol | Horizon | Obs | Watch Obs | Settled All | Avg Abs All % | Settled Watch | Avg Abs Watch % | Expansion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GEHC | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GEHC | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GEHC | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GEHC | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GEHC | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TER | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TER | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TER | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TER | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TER | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| SBUX | 5m | 4 | 2 | 2 | 0.6544 | 1 | 1.1415 | 1.74x |
| SBUX | 15m | 4 | 2 | 2 | 0.7106 | 1 | 0.9842 | 1.39x |
| SBUX | 30m | 4 | 2 | 2 | 1.0994 | 1 | 2.1637 | 1.97x |
| SBUX | 60m | 4 | 2 | 2 | 1.9685 | 1 | 3.4808 | 1.77x |
| SBUX | 120m | 4 | 2 | 1 | 4.8667 | 1 | 4.8667 | 1.00x |
| SOFI | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| SOFI | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| SOFI | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| SOFI | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| SOFI | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| ODFL | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| ODFL | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| ODFL | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| ODFL | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| ODFL | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| CNC | 5m | 4 | 1 | 2 | 0.2413 | 0 | N/A | N/A |
| CNC | 15m | 4 | 1 | 2 | 1.3233 | 0 | N/A | N/A |
| CNC | 30m | 4 | 1 | 2 | 0.3941 | 0 | N/A | N/A |
| CNC | 60m | 4 | 1 | 2 | 0.6209 | 0 | N/A | N/A |
| CNC | 120m | 4 | 1 | 1 | 1.0452 | 0 | N/A | N/A |
| V | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| V | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| V | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| V | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| V | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| VTR | 5m | 4 | 0 | 2 | 0.1291 | 0 | N/A | N/A |
| VTR | 15m | 4 | 0 | 2 | 0.2092 | 0 | N/A | N/A |
| VTR | 30m | 4 | 0 | 2 | 0.2636 | 0 | N/A | N/A |
| VTR | 60m | 4 | 0 | 2 | 0.0659 | 0 | N/A | N/A |
| VTR | 120m | 4 | 0 | 1 | 0.3503 | 0 | N/A | N/A |
| QCOM | 5m | 4 | 1 | 2 | 0.1095 | 1 | 0.0916 | 0.84x |
| QCOM | 15m | 4 | 1 | 2 | 0.2253 | 1 | 0.1047 | 0.46x |
| QCOM | 30m | 4 | 1 | 2 | 0.7212 | 1 | 1.0537 | 1.46x |
| QCOM | 60m | 4 | 1 | 2 | 1.2438 | 1 | 1.7868 | 1.44x |
| QCOM | 120m | 4 | 1 | 1 | 0.5694 | 1 | 0.5694 | 1.00x |
| TW | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TW | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TW | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TW | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TW | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IWR | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IWR | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IWR | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IWR | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IWR | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| FTAI | 5m | 4 | 0 | 2 | 0.4121 | 0 | N/A | N/A |
| FTAI | 15m | 4 | 0 | 2 | 1.1713 | 0 | N/A | N/A |
| FTAI | 30m | 4 | 0 | 2 | 1.5498 | 0 | N/A | N/A |
| FTAI | 60m | 4 | 0 | 2 | 1.6706 | 0 | N/A | N/A |
| FTAI | 120m | 4 | 0 | 1 | 3.5239 | 0 | N/A | N/A |
| HOOD | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HOOD | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HOOD | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HOOD | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HOOD | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GD | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GD | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GD | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GD | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GD | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HUM | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HUM | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HUM | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HUM | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HUM | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HLT | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HLT | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HLT | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HLT | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| HLT | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IAU | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IAU | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IAU | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IAU | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IAU | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| BIIB | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| BIIB | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| BIIB | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| BIIB | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| BIIB | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| VRSK | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| VRSK | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| VRSK | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| VRSK | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| VRSK | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| MA | 5m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| MA | 15m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| MA | 30m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| MA | 60m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| MA | 120m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |

## Recent Ledger Rows

| Symbol | Time | Entropy | Bucket | Abs 5m % | Abs 15m % | Abs 30m % | Abs 60m % | Abs 120m % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FTAI | 2026-04-30 09:34:00 | 0.6400 | baseline | N/A | N/A | N/A | N/A | N/A |
| VRSK | 2026-04-30 09:34:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| MA | 2026-04-30 09:34:00 | 0.6000 | near-low-watch | N/A | N/A | N/A | N/A | N/A |
| GEHC | 2026-04-30 09:33:00 | 0.6300 | baseline | N/A | N/A | N/A | N/A | N/A |
| TER | 2026-04-30 09:33:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| SBUX | 2026-04-30 09:33:00 | 0.6300 | baseline | N/A | N/A | N/A | N/A | N/A |
| SOFI | 2026-04-30 09:33:00 | 0.6300 | baseline | N/A | N/A | N/A | N/A | N/A |
| ODFL | 2026-04-30 09:33:00 | 0.6700 | baseline | N/A | N/A | N/A | N/A | N/A |
| CNC | 2026-04-30 09:33:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| V | 2026-04-30 09:33:00 | 0.6200 | baseline | N/A | N/A | N/A | N/A | N/A |
| VTR | 2026-04-30 09:33:00 | 0.7100 | baseline | N/A | N/A | N/A | N/A | N/A |
| QCOM | 2026-04-30 09:33:00 | 0.6700 | baseline | N/A | N/A | N/A | N/A | N/A |

## Use Rules

- Entropy is a magnitude monitor, not a direction signal.
- `near-low-watch` is a relative shadow-monitor bucket for SPY/QQQ while this ledger builds history.
- Review 5m, 15m, 30m, 60m, and 120m absolute movement after each reading.
- Do not promote to active use until the ledger has at least 20 to 30 settled observations per symbol.
- Reference: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]].
