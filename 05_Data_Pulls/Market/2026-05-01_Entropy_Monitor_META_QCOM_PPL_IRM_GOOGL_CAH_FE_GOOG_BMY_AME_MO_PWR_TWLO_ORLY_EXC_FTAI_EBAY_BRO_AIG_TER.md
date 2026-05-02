---
title: "SPY QQQ Entropy Monitor"
source: "Entropy Monitor"
agent_owner: "Orchestrator Agent"
agent_scope: "pull"
date_pulled: "2026-05-01"
domain: "market"
data_type: "entropy_monitor"
frequency: "intraday-shadow"
signal_status: "watch"
signals: ["ENTROPY_QCOM_NEAR_LOW_WATCH", "ENTROPY_BMY_NEAR_LOW_WATCH", "ENTROPY_ORLY_NEAR_LOW_WATCH", "ENTROPY_AIG_NEAR_LOW_WATCH"]
symbols: ["META", "QCOM", "PPL", "IRM", "GOOGL", "CAH", "FE", "GOOG", "BMY", "AME", "MO", "PWR", "TWLO", "ORLY", "EXC", "FTAI", "EBAY", "BRO", "AIG", "TER"]
lookback_bars: 120
near_entropy_threshold: 0.6
low_entropy_threshold: 0.5
ledger_path: "scripts/.cache/entropy-monitor/entropy-monitor-ledger.csv"
tags: ["entropy-monitor", "market", "strategy-shadow"]
---

## Current Snapshot

| Symbol | Bar Time | Price | Entropy | Level | Bucket | Quote Chg % | Vol Ratio | Window Start |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| META | 2026-05-01 09:33:00 | 611.6500 | 0.6700 | mixed | baseline | 0.28 | N/A | 2026-04-30 14:03:00 |
| QCOM | 2026-05-01 09:33:00 | 174.6500 | 0.5800 | mixed | near-low-watch | -2.81 | N/A | 2026-04-30 14:03:00 |
| PPL | 2026-05-01 09:33:00 | 37.9400 | 0.6600 | mixed | baseline | 1.43 | N/A | 2026-04-30 14:03:00 |
| IRM | 2026-05-01 09:33:00 | 125.9300 | 0.7100 | mixed | baseline | 0.01 | N/A | 2026-04-30 14:03:00 |
| GOOGL | 2026-05-01 09:33:00 | 381.8600 | 0.6500 | mixed | baseline | -0.65 | N/A | 2026-04-30 14:03:00 |
| CAH | 2026-05-01 09:33:00 | 196.1950 | 0.6600 | mixed | baseline | 1.63 | N/A | 2026-04-30 14:03:00 |
| FE | 2026-05-01 09:33:00 | 47.2000 | 0.6300 | mixed | baseline | -0.37 | N/A | 2026-04-30 14:03:00 |
| GOOG | 2026-05-01 09:33:00 | 378.2100 | 0.6400 | mixed | baseline | -0.83 | N/A | 2026-04-30 14:03:00 |
| BMY | 2026-05-01 09:33:00 | 58.4000 | 0.5900 | mixed | near-low-watch | -4.21 | N/A | 2026-04-30 14:03:00 |
| AME | 2026-05-01 09:33:00 | 233.0000 | 0.6700 | mixed | baseline | -0.68 | N/A | 2026-04-30 14:03:00 |
| MO | 2026-05-01 09:33:00 | 73.5600 | 0.6300 | mixed | baseline | 2.05 | N/A | 2026-04-30 14:03:00 |
| PWR | 2026-05-01 09:33:00 | 724.6600 | 0.6700 | mixed | baseline | 0.00 | N/A | 2026-04-30 14:03:00 |
| TWLO | 2026-05-01 09:33:00 | 175.6900 | 0.6600 | mixed | baseline | 18.08 | N/A | 2026-04-30 14:03:00 |
| ORLY | 2026-05-01 09:33:00 | 99.9100 | 0.5900 | mixed | near-low-watch | 0.28 | N/A | 2026-04-30 14:03:00 |
| EXC | 2026-05-01 09:33:00 | 46.1300 | 0.6400 | mixed | baseline | 0.75 | N/A | 2026-04-30 14:03:00 |
| FTAI | 2026-05-01 09:34:00 | 243.1500 | 0.6600 | mixed | baseline | -2.03 | N/A | 2026-04-30 14:04:00 |
| EBAY | 2026-05-01 09:34:00 | 101.8066 | 0.7000 | mixed | baseline | -1.38 | N/A | 2026-04-30 14:04:00 |
| BRO | 2026-05-01 09:33:00 | 60.7500 | 0.6100 | mixed | baseline | 0.76 | N/A | 2026-04-30 14:03:00 |
| AIG | 2026-05-01 09:33:00 | 78.2800 | 0.5900 | mixed | near-low-watch | 5.57 | N/A | 2026-04-30 14:03:00 |
| TER | 2026-05-01 09:33:00 | 340.0100 | 0.6600 | mixed | baseline | -0.29 | N/A | 2026-04-30 14:03:00 |

## Settled Movement Summary

| Symbol | Horizon | Obs | Watch Obs | Settled All | Avg Abs All % | Settled Watch | Avg Abs Watch % | Expansion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| META | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| META | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| META | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| META | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| META | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| QCOM | 5m | 5 | 2 | 3 | 0.1978 | 1 | 0.0916 | 0.46x |
| QCOM | 15m | 5 | 2 | 3 | 0.6374 | 1 | 0.1047 | 0.16x |
| QCOM | 30m | 5 | 2 | 3 | 1.9604 | 1 | 1.0537 | 0.54x |
| QCOM | 60m | 5 | 2 | 3 | 3.3074 | 1 | 1.7868 | 0.54x |
| QCOM | 120m | 5 | 2 | 2 | 6.0176 | 1 | 0.5694 | 0.09x |
| PPL | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PPL | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PPL | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PPL | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PPL | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IRM | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IRM | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IRM | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IRM | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| IRM | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOGL | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOGL | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOGL | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOGL | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOGL | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| CAH | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| CAH | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| CAH | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| CAH | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| CAH | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| FE | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| FE | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| FE | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| FE | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| FE | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOG | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOG | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOG | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOG | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| GOOG | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| BMY | 5m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| BMY | 15m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| BMY | 30m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| BMY | 60m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| BMY | 120m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| AME | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| AME | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| AME | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| AME | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| AME | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| MO | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| MO | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| MO | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| MO | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| MO | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PWR | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PWR | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PWR | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PWR | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| PWR | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TWLO | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TWLO | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TWLO | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TWLO | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| TWLO | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| ORLY | 5m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| ORLY | 15m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| ORLY | 30m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| ORLY | 60m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| ORLY | 120m | 1 | 1 | 0 | N/A | 0 | N/A | N/A |
| EXC | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| EXC | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| EXC | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| EXC | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| EXC | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| FTAI | 5m | 5 | 0 | 3 | 0.7041 | 0 | N/A | N/A |
| FTAI | 15m | 5 | 0 | 3 | 1.4154 | 0 | N/A | N/A |
| FTAI | 30m | 5 | 0 | 3 | 1.2805 | 0 | N/A | N/A |
| FTAI | 60m | 5 | 0 | 3 | 2.0146 | 0 | N/A | N/A |
| FTAI | 120m | 5 | 0 | 2 | 2.4569 | 0 | N/A | N/A |
| EBAY | 5m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| EBAY | 15m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| EBAY | 30m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| EBAY | 60m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| EBAY | 120m | 1 | 0 | 0 | N/A | 0 | N/A | N/A |
| BRO | 5m | 4 | 0 | 2 | 0.6092 | 0 | N/A | N/A |
| BRO | 15m | 4 | 0 | 2 | 1.0523 | 0 | N/A | N/A |
| BRO | 30m | 4 | 0 | 2 | 1.3319 | 0 | N/A | N/A |
| BRO | 60m | 4 | 0 | 2 | 1.5696 | 0 | N/A | N/A |
| BRO | 120m | 4 | 0 | 1 | 3.2683 | 0 | N/A | N/A |
| AIG | 5m | 4 | 1 | 2 | 0.0681 | 0 | N/A | N/A |
| AIG | 15m | 4 | 1 | 2 | 0.2101 | 0 | N/A | N/A |
| AIG | 30m | 4 | 1 | 2 | 0.3204 | 0 | N/A | N/A |
| AIG | 60m | 4 | 1 | 2 | 0.7772 | 0 | N/A | N/A |
| AIG | 120m | 4 | 1 | 1 | 0.7510 | 0 | N/A | N/A |
| TER | 5m | 2 | 0 | 1 | 1.0147 | 0 | N/A | N/A |
| TER | 15m | 2 | 0 | 1 | 4.1434 | 0 | N/A | N/A |
| TER | 30m | 2 | 0 | 1 | 4.8168 | 0 | N/A | N/A |
| TER | 60m | 2 | 0 | 1 | 5.1219 | 0 | N/A | N/A |
| TER | 120m | 2 | 0 | 1 | 6.1637 | 0 | N/A | N/A |

## Recent Ledger Rows

| Symbol | Time | Entropy | Bucket | Abs 5m % | Abs 15m % | Abs 30m % | Abs 60m % | Abs 120m % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FTAI | 2026-05-01 09:34:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| EBAY | 2026-05-01 09:34:00 | 0.7000 | baseline | N/A | N/A | N/A | N/A | N/A |
| META | 2026-05-01 09:33:00 | 0.6700 | baseline | N/A | N/A | N/A | N/A | N/A |
| QCOM | 2026-05-01 09:33:00 | 0.5800 | near-low-watch | N/A | N/A | N/A | N/A | N/A |
| PPL | 2026-05-01 09:33:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| IRM | 2026-05-01 09:33:00 | 0.7100 | baseline | N/A | N/A | N/A | N/A | N/A |
| GOOGL | 2026-05-01 09:33:00 | 0.6500 | baseline | N/A | N/A | N/A | N/A | N/A |
| CAH | 2026-05-01 09:33:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| FE | 2026-05-01 09:33:00 | 0.6300 | baseline | N/A | N/A | N/A | N/A | N/A |
| GOOG | 2026-05-01 09:33:00 | 0.6400 | baseline | N/A | N/A | N/A | N/A | N/A |
| BMY | 2026-05-01 09:33:00 | 0.5900 | near-low-watch | N/A | N/A | N/A | N/A | N/A |
| AME | 2026-05-01 09:33:00 | 0.6700 | baseline | N/A | N/A | N/A | N/A | N/A |

## Use Rules

- Entropy is a magnitude monitor, not a direction signal.
- `near-low-watch` is a relative shadow-monitor bucket for SPY/QQQ while this ledger builds history.
- Review 5m, 15m, 30m, 60m, and 120m absolute movement after each reading.
- Do not promote to active use until the ledger has at least 20 to 30 settled observations per symbol.
- Reference: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]].
