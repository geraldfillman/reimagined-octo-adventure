---
title: "SPY QQQ Entropy Monitor"
source: "Entropy Monitor"
agent_owner: "Orchestrator Agent"
agent_scope: "pull"
date_pulled: "2026-04-29"
domain: "market"
data_type: "entropy_monitor"
frequency: "intraday-shadow"
signal_status: "clear"
signals: []
symbols: ["CNC", "GM", "UPS", "KO", "NUE", "PCAR", "YUM", "GLW", "AIG", "AMAT", "FTAI", "EXR", "CDNS", "BRO", "VTR", "SOXX", "OMC", "AMKR", "QCOM", "SBUX"]
lookback_bars: 120
near_entropy_threshold: 0.6
low_entropy_threshold: 0.5
ledger_path: "scripts/.cache/entropy-monitor/entropy-monitor-ledger.csv"
tags: ["entropy-monitor", "market", "strategy-shadow"]
---

## Current Snapshot

| Symbol | Bar Time | Price | Entropy | Level | Bucket | Quote Chg % | Vol Ratio | Window Start |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CNC | 2026-04-29 14:53:00 | 53.9550 | 0.6800 | mixed | baseline | 8.92 | N/A | 2026-04-29 12:53:00 |
| GM | 2026-04-29 14:53:00 | 76.2500 | 0.6400 | mixed | baseline | -3.45 | N/A | 2026-04-29 12:53:00 |
| UPS | 2026-04-29 14:53:00 | 105.3200 | 0.6700 | mixed | baseline | 1.20 | N/A | 2026-04-29 12:53:00 |
| KO | 2026-04-29 14:53:00 | 78.7950 | 0.6800 | mixed | baseline | 0.61 | N/A | 2026-04-29 12:53:00 |
| NUE | 2026-04-29 14:53:00 | 221.0100 | 0.6300 | mixed | baseline | -1.89 | N/A | 2026-04-29 12:53:00 |
| PCAR | 2026-04-29 14:53:00 | 119.0700 | 0.6600 | mixed | baseline | -0.48 | N/A | 2026-04-29 12:53:00 |
| YUM | 2026-04-29 14:53:00 | 159.9700 | 0.6500 | mixed | baseline | 2.26 | N/A | 2026-04-29 12:52:00 |
| GLW | 2026-04-29 14:53:00 | 150.9600 | 0.6600 | mixed | baseline | -1.47 | N/A | 2026-04-29 12:53:00 |
| AIG | 2026-04-29 14:52:00 | 73.1200 | 0.6600 | mixed | baseline | -1.40 | N/A | 2026-04-29 12:52:00 |
| AMAT | 2026-04-29 14:53:00 | 379.5655 | 0.6800 | mixed | baseline | -0.31 | N/A | 2026-04-29 12:53:00 |
| FTAI | 2026-04-29 14:53:00 | 212.5606 | 0.6700 | mixed | baseline | -1.51 | N/A | 2026-04-29 12:53:00 |
| EXR | 2026-04-29 14:53:00 | 141.0600 | 0.6900 | mixed | baseline | 0.01 | N/A | 2026-04-29 12:53:00 |
| CDNS | 2026-04-29 14:53:00 | 326.0800 | 0.6600 | mixed | baseline | 0.16 | N/A | 2026-04-29 12:53:00 |
| BRO | 2026-04-29 14:53:00 | 62.0600 | 0.6700 | mixed | baseline | -1.72 | N/A | 2026-04-29 12:53:00 |
| VTR | 2026-04-29 14:53:00 | 87.4600 | 0.6900 | mixed | baseline | -0.11 | N/A | 2026-04-29 12:53:00 |
| SOXX | 2026-04-29 14:53:00 | 447.9700 | 0.6800 | mixed | baseline | 2.04 | N/A | 2026-04-29 12:53:00 |
| OMC | 2026-04-29 14:53:00 | 75.0900 | 0.6900 | mixed | baseline | -2.33 | N/A | 2026-04-29 12:53:00 |
| AMKR | 2026-04-29 14:53:00 | 71.1900 | 0.7000 | mixed | baseline | -0.39 | N/A | 2026-04-29 12:53:00 |
| QCOM | 2026-04-29 14:53:00 | 156.9600 | 0.6700 | mixed | baseline | 4.59 | N/A | 2026-04-29 12:53:00 |
| SBUX | 2026-04-29 14:53:00 | 105.8328 | 0.6800 | mixed | baseline | 8.85 | N/A | 2026-04-29 12:53:00 |

## Settled Movement Summary

| Symbol | Horizon | Obs | Watch Obs | Settled All | Avg Abs All % | Settled Watch | Avg Abs Watch % | Expansion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CNC | 5m | 3 | 1 | 1 | 0.3991 | 0 | N/A | N/A |
| CNC | 15m | 3 | 1 | 1 | 2.4705 | 0 | N/A | N/A |
| CNC | 30m | 3 | 1 | 1 | 0.0190 | 0 | N/A | N/A |
| CNC | 60m | 3 | 1 | 1 | 1.1212 | 0 | N/A | N/A |
| CNC | 120m | 3 | 1 | 1 | 1.0452 | 0 | N/A | N/A |
| GM | 5m | 3 | 0 | 1 | 0.3156 | 0 | N/A | N/A |
| GM | 15m | 3 | 0 | 1 | 0.4471 | 0 | N/A | N/A |
| GM | 30m | 3 | 0 | 1 | 0.2235 | 0 | N/A | N/A |
| GM | 60m | 3 | 0 | 1 | 0.7627 | 0 | N/A | N/A |
| GM | 120m | 3 | 0 | 1 | 0.3549 | 0 | N/A | N/A |
| UPS | 5m | 3 | 0 | 1 | 0.2504 | 0 | N/A | N/A |
| UPS | 15m | 3 | 0 | 1 | 0.6644 | 0 | N/A | N/A |
| UPS | 30m | 3 | 0 | 1 | 1.6755 | 0 | N/A | N/A |
| UPS | 60m | 3 | 0 | 1 | 2.3014 | 0 | N/A | N/A |
| UPS | 120m | 3 | 0 | 1 | 1.7044 | 0 | N/A | N/A |
| KO | 5m | 3 | 2 | 1 | 0.0760 | 1 | 0.0760 | 1.00x |
| KO | 15m | 3 | 2 | 1 | 0.1014 | 1 | 0.1014 | 1.00x |
| KO | 30m | 3 | 2 | 1 | 0.0127 | 1 | 0.0127 | 1.00x |
| KO | 60m | 3 | 2 | 1 | 0.6716 | 1 | 0.6716 | 1.00x |
| KO | 120m | 3 | 2 | 1 | 0.3928 | 1 | 0.3928 | 1.00x |
| NUE | 5m | 3 | 0 | 1 | 0.0843 | 0 | N/A | N/A |
| NUE | 15m | 3 | 0 | 1 | 0.5477 | 0 | N/A | N/A |
| NUE | 30m | 3 | 0 | 1 | 1.0998 | 0 | N/A | N/A |
| NUE | 60m | 3 | 0 | 1 | 1.2324 | 0 | N/A | N/A |
| NUE | 120m | 3 | 0 | 1 | 1.5388 | 0 | N/A | N/A |
| PCAR | 5m | 3 | 0 | 1 | 0.6564 | 0 | N/A | N/A |
| PCAR | 15m | 3 | 0 | 1 | 0.4432 | 0 | N/A | N/A |
| PCAR | 30m | 3 | 0 | 1 | 0.8060 | 0 | N/A | N/A |
| PCAR | 60m | 3 | 0 | 1 | 0.2468 | 0 | N/A | N/A |
| PCAR | 120m | 3 | 0 | 1 | 1.0885 | 0 | N/A | N/A |
| YUM | 5m | 3 | 0 | 1 | 0.6382 | 0 | N/A | N/A |
| YUM | 15m | 3 | 0 | 1 | 1.8286 | 0 | N/A | N/A |
| YUM | 30m | 3 | 0 | 1 | 1.3868 | 0 | N/A | N/A |
| YUM | 60m | 3 | 0 | 1 | 1.3009 | 0 | N/A | N/A |
| YUM | 120m | 3 | 0 | 1 | 1.5954 | 0 | N/A | N/A |
| GLW | 5m | 3 | 1 | 1 | 0.6051 | 1 | 0.6051 | 1.00x |
| GLW | 15m | 3 | 1 | 1 | 0.0798 | 1 | 0.0798 | 1.00x |
| GLW | 30m | 3 | 1 | 1 | 0.3391 | 1 | 0.3391 | 1.00x |
| GLW | 60m | 3 | 1 | 1 | 1.3366 | 1 | 1.3366 | 1.00x |
| GLW | 120m | 3 | 1 | 1 | 0.0931 | 1 | 0.0931 | 1.00x |
| AIG | 5m | 3 | 0 | 1 | 0.0406 | 0 | N/A | N/A |
| AIG | 15m | 3 | 0 | 1 | 0.3518 | 0 | N/A | N/A |
| AIG | 30m | 3 | 0 | 1 | 0.1894 | 0 | N/A | N/A |
| AIG | 60m | 3 | 0 | 1 | 0.4330 | 0 | N/A | N/A |
| AIG | 120m | 3 | 0 | 1 | 0.7510 | 0 | N/A | N/A |
| AMAT | 5m | 3 | 0 | 1 | 0.2435 | 0 | N/A | N/A |
| AMAT | 15m | 3 | 0 | 1 | 0.1126 | 0 | N/A | N/A |
| AMAT | 30m | 3 | 0 | 1 | 0.6258 | 0 | N/A | N/A |
| AMAT | 60m | 3 | 0 | 1 | 0.3980 | 0 | N/A | N/A |
| AMAT | 120m | 3 | 0 | 1 | 0.0707 | 0 | N/A | N/A |
| FTAI | 5m | 3 | 0 | 1 | 0.3046 | 0 | N/A | N/A |
| FTAI | 15m | 3 | 0 | 1 | 1.2231 | 0 | N/A | N/A |
| FTAI | 30m | 3 | 0 | 1 | 2.4930 | 0 | N/A | N/A |
| FTAI | 60m | 3 | 0 | 1 | 3.2052 | 0 | N/A | N/A |
| FTAI | 120m | 3 | 0 | 1 | 3.5239 | 0 | N/A | N/A |
| EXR | 5m | 3 | 0 | 1 | 0.0572 | 0 | N/A | N/A |
| EXR | 15m | 3 | 0 | 1 | 0.0858 | 0 | N/A | N/A |
| EXR | 30m | 3 | 0 | 1 | 0.4863 | 0 | N/A | N/A |
| EXR | 60m | 3 | 0 | 1 | 0.6079 | 0 | N/A | N/A |
| EXR | 120m | 3 | 0 | 1 | 1.4446 | 0 | N/A | N/A |
| CDNS | 5m | 3 | 0 | 1 | 0.4844 | 0 | N/A | N/A |
| CDNS | 15m | 3 | 0 | 1 | 1.1178 | 0 | N/A | N/A |
| CDNS | 30m | 3 | 0 | 1 | 1.6643 | 0 | N/A | N/A |
| CDNS | 60m | 3 | 0 | 1 | 1.6426 | 0 | N/A | N/A |
| CDNS | 120m | 3 | 0 | 1 | 0.9377 | 0 | N/A | N/A |
| BRO | 5m | 3 | 0 | 1 | 1.1218 | 0 | N/A | N/A |
| BRO | 15m | 3 | 0 | 1 | 1.6858 | 0 | N/A | N/A |
| BRO | 30m | 3 | 0 | 1 | 2.4222 | 0 | N/A | N/A |
| BRO | 60m | 3 | 0 | 1 | 2.7042 | 0 | N/A | N/A |
| BRO | 120m | 3 | 0 | 1 | 3.2683 | 0 | N/A | N/A |
| VTR | 5m | 3 | 0 | 1 | 0.2125 | 0 | N/A | N/A |
| VTR | 15m | 3 | 0 | 1 | 0.2355 | 0 | N/A | N/A |
| VTR | 30m | 3 | 0 | 1 | 0.2584 | 0 | N/A | N/A |
| VTR | 60m | 3 | 0 | 1 | 0.0861 | 0 | N/A | N/A |
| VTR | 120m | 3 | 0 | 1 | 0.3503 | 0 | N/A | N/A |
| SOXX | 5m | 3 | 1 | 1 | 0.3422 | 0 | N/A | N/A |
| SOXX | 15m | 3 | 1 | 1 | 0.1936 | 0 | N/A | N/A |
| SOXX | 30m | 3 | 1 | 1 | 0.2826 | 0 | N/A | N/A |
| SOXX | 60m | 3 | 1 | 1 | 1.1100 | 0 | N/A | N/A |
| SOXX | 120m | 3 | 1 | 1 | 0.6754 | 0 | N/A | N/A |
| OMC | 5m | 3 | 0 | 1 | 0.1217 | 0 | N/A | N/A |
| OMC | 15m | 3 | 0 | 1 | 0.7098 | 0 | N/A | N/A |
| OMC | 30m | 3 | 0 | 1 | 1.8659 | 0 | N/A | N/A |
| OMC | 60m | 3 | 0 | 1 | 1.3926 | 0 | N/A | N/A |
| OMC | 120m | 3 | 0 | 1 | 0.3649 | 0 | N/A | N/A |
| AMKR | 5m | 3 | 0 | 1 | 0.6599 | 0 | N/A | N/A |
| AMKR | 15m | 3 | 0 | 1 | 1.0902 | 0 | N/A | N/A |
| AMKR | 30m | 3 | 0 | 1 | 2.1087 | 0 | N/A | N/A |
| AMKR | 60m | 3 | 0 | 1 | 2.5247 | 0 | N/A | N/A |
| AMKR | 120m | 3 | 0 | 1 | 1.8792 | 0 | N/A | N/A |
| QCOM | 5m | 3 | 1 | 1 | 0.0916 | 1 | 0.0916 | 1.00x |
| QCOM | 15m | 3 | 1 | 1 | 0.1047 | 1 | 0.1047 | 1.00x |
| QCOM | 30m | 3 | 1 | 1 | 1.0537 | 1 | 1.0537 | 1.00x |
| QCOM | 60m | 3 | 1 | 1 | 1.7868 | 1 | 1.7868 | 1.00x |
| QCOM | 120m | 3 | 1 | 1 | 0.5694 | 1 | 0.5694 | 1.00x |
| SBUX | 5m | 3 | 2 | 1 | 1.1415 | 1 | 1.1415 | 1.00x |
| SBUX | 15m | 3 | 2 | 1 | 0.9842 | 1 | 0.9842 | 1.00x |
| SBUX | 30m | 3 | 2 | 1 | 2.1637 | 1 | 2.1637 | 1.00x |
| SBUX | 60m | 3 | 2 | 1 | 3.4808 | 1 | 3.4808 | 1.00x |
| SBUX | 120m | 3 | 2 | 1 | 4.8667 | 1 | 4.8667 | 1.00x |

## Recent Ledger Rows

| Symbol | Time | Entropy | Bucket | Abs 5m % | Abs 15m % | Abs 30m % | Abs 60m % | Abs 120m % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CNC | 2026-04-29 14:53:00 | 0.6800 | baseline | N/A | N/A | N/A | N/A | N/A |
| GM | 2026-04-29 14:53:00 | 0.6400 | baseline | N/A | N/A | N/A | N/A | N/A |
| UPS | 2026-04-29 14:53:00 | 0.6700 | baseline | N/A | N/A | N/A | N/A | N/A |
| KO | 2026-04-29 14:53:00 | 0.6800 | baseline | N/A | N/A | N/A | N/A | N/A |
| NUE | 2026-04-29 14:53:00 | 0.6300 | baseline | N/A | N/A | N/A | N/A | N/A |
| PCAR | 2026-04-29 14:53:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| YUM | 2026-04-29 14:53:00 | 0.6500 | baseline | N/A | N/A | N/A | N/A | N/A |
| GLW | 2026-04-29 14:53:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| AMAT | 2026-04-29 14:53:00 | 0.6800 | baseline | N/A | N/A | N/A | N/A | N/A |
| FTAI | 2026-04-29 14:53:00 | 0.6700 | baseline | N/A | N/A | N/A | N/A | N/A |
| EXR | 2026-04-29 14:53:00 | 0.6900 | baseline | N/A | N/A | N/A | N/A | N/A |
| CDNS | 2026-04-29 14:53:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |

## Use Rules

- Entropy is a magnitude monitor, not a direction signal.
- `near-low-watch` is a relative shadow-monitor bucket for SPY/QQQ while this ledger builds history.
- Review 5m, 15m, 30m, 60m, and 120m absolute movement after each reading.
- Do not promote to active use until the ledger has at least 20 to 30 settled observations per symbol.
- Reference: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]].
