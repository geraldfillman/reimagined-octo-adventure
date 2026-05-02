---
title: "SPY QQQ Entropy Backtest"
source: "Entropy Monitor"
agent_owner: "Orchestrator Agent"
agent_scope: "pull"
date_pulled: "2026-04-29"
domain: "market"
data_type: "entropy_backtest"
frequency: "on-demand"
signal_status: "watch"
signals: ["ENTROPY_BACKTEST_SPY_15M_LOW10_EXPANSION", "ENTROPY_BACKTEST_SPY_30M_LOW10_EXPANSION", "ENTROPY_BACKTEST_SPY_60M_LOW10_EXPANSION", "ENTROPY_BACKTEST_SPY_120M_LOW10_EXPANSION", "ENTROPY_BACKTEST_QQQ_15M_LOW10_EXPANSION", "ENTROPY_BACKTEST_QQQ_30M_LOW10_EXPANSION", "ENTROPY_BACKTEST_QQQ_60M_LOW10_EXPANSION", "ENTROPY_BACKTEST_QQQ_120M_LOW10_EXPANSION"]
symbols: ["SPY", "QQQ"]
lookback_bars: 120
sample_step_minutes: 5
near_entropy_threshold: 0.6
low_entropy_threshold: 0.5
backtest_rows: 414
backtest_csv: "scripts/.cache/entropy-monitor/backtests/2026-04-29_Entropy_Backtest_SPY_QQQ.csv"
tags: ["entropy-monitor", "entropy-backtest", "market", "strategy-shadow"]
---

## Coverage

| Symbol | Bars | Trading Days | Observations | First Bar | Last Bar | First Obs | Last Obs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 1170 | 3 | 207 | 2026-04-27 09:30:00 | 2026-04-29 15:59:00 | 2026-04-27 11:30:00 | 2026-04-29 15:50:00 |
| QQQ | 1170 | 3 | 207 | 2026-04-27 09:30:00 | 2026-04-29 15:59:00 | 2026-04-27 11:30:00 | 2026-04-29 15:50:00 |

## Movement Expansion Summary

| Symbol | Horizon | Settled All | Avg All % | Near/Low n | Near/Low Avg % | Near/Low Expansion | Low 10% n | Low 10% Avg % | Low 10% Expansion | Low 20% n | Low 20% Avg % | Low 20% Expansion | High 20% Avg % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 5m | 207 | 0.0341 | 17 | 0.0333 | 0.97x | 21 | 0.0379 | 1.11x | 42 | 0.0359 | 1.05x | 0.0314 |
| SPY | 15m | 201 | 0.0525 | 17 | 0.0768 | 1.46x | 20 | 0.0733 | 1.40x | 40 | 0.0645 | 1.23x | 0.0465 |
| SPY | 30m | 192 | 0.0696 | 17 | 0.1173 | 1.68x | 20 | 0.1095 | 1.57x | 40 | 0.0830 | 1.19x | 0.0540 |
| SPY | 60m | 174 | 0.1015 | 17 | 0.1333 | 1.31x | 20 | 0.1454 | 1.43x | 40 | 0.1278 | 1.26x | 0.0758 |
| SPY | 120m | 138 | 0.1431 | 17 | 0.1701 | 1.19x | 20 | 0.1811 | 1.26x | 40 | 0.1519 | 1.06x | 0.1213 |
| QQQ | 5m | 207 | 0.0556 | 11 | 0.0613 | 1.10x | 21 | 0.0617 | 1.11x | 42 | 0.0763 | 1.37x | 0.0507 |
| QQQ | 15m | 201 | 0.0837 | 11 | 0.1733 | 2.07x | 21 | 0.1397 | 1.67x | 42 | 0.1085 | 1.30x | 0.0653 |
| QQQ | 30m | 192 | 0.1168 | 11 | 0.2881 | 2.47x | 21 | 0.1889 | 1.62x | 42 | 0.1339 | 1.15x | 0.1071 |
| QQQ | 60m | 174 | 0.1698 | 11 | 0.3775 | 2.22x | 21 | 0.2729 | 1.61x | 42 | 0.2179 | 1.28x | 0.1681 |
| QQQ | 120m | 138 | 0.2463 | 11 | 0.3961 | 1.61x | 19 | 0.3200 | 1.30x | 36 | 0.2911 | 1.18x | 0.2043 |

## Entropy Distribution

| Symbol | Obs | Min H | Median H | Max H | Low <=0.50 | Near <=0.60 | Baseline >0.60 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 207 | 0.5500 | 0.6400 | 0.7100 | 0 | 17 | 190 |
| QQQ | 207 | 0.5800 | 0.6500 | 0.7200 | 0 | 11 | 196 |

## Lowest Entropy Windows

| Symbol | Time | Price | Entropy | Pctile | Bucket | Abs 5m % | Abs 15m % | Abs 30m % | Abs 60m % | Abs 120m % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 2026-04-28 12:30:00 | 710.3400 | 0.5500 | 0.00 | near-low-watch | 0.0831 | 0.1014 | 0.0225 | 0.0155 | 0.1351 |
| SPY | 2026-04-28 12:35:00 | 709.7500 | 0.5500 | 0.49 | near-low-watch | 0.0014 | 0.0085 | 0.0225 | 0.1338 | 0.1691 |
| SPY | 2026-04-28 12:40:00 | 709.7600 | 0.5600 | 0.97 | near-low-watch | 0.0197 | 0.0592 | 0.0042 | 0.1254 | 0.2001 |
| QQQ | 2026-04-28 10:20:00 | 658.3900 | 0.5800 | 0.00 | near-low-watch | 0.0942 | 0.3296 | 0.6394 | 0.4268 | 0.4481 |
| QQQ | 2026-04-29 10:55:00 | 660.8500 | 0.5800 | 0.49 | near-low-watch | 0.0197 | 0.1846 | 0.0908 | 0.2451 | 0.3450 |
| SPY | 2026-04-28 10:15:00 | 711.4400 | 0.5800 | 1.46 | near-low-watch | 0.0337 | 0.0169 | 0.1926 | 0.1574 | 0.1729 |
| SPY | 2026-04-28 12:25:00 | 710.3300 | 0.5800 | 1.94 | near-low-watch | 0.0014 | 0.0802 | 0.0211 | 0.0605 | 0.1520 |
| QQQ | 2026-04-28 10:05:00 | 658.4900 | 0.5900 | 0.97 | near-low-watch | 0.0501 | 0.0152 | 0.3447 | 0.4784 | 0.4920 |
| QQQ | 2026-04-28 10:15:00 | 658.3600 | 0.5900 | 1.46 | near-low-watch | 0.0046 | 0.0987 | 0.4268 | 0.4557 | 0.5088 |
| SPY | 2026-04-28 10:10:00 | 711.9900 | 0.5900 | 2.43 | near-low-watch | 0.0772 | 0.0632 | 0.3062 | 0.2584 | 0.2514 |
| SPY | 2026-04-28 11:20:00 | 710.4300 | 0.5900 | 2.91 | near-low-watch | 0.0845 | 0.1070 | 0.0999 | 0.0014 | 0.1028 |
| SPY | 2026-04-28 12:20:00 | 710.4400 | 0.5900 | 3.40 | near-low-watch | 0.0155 | 0.0971 | 0.1056 | 0.1042 | 0.1379 |
| QQQ | 2026-04-28 10:00:00 | 658.3500 | 0.6000 | 1.94 | near-low-watch | 0.0213 | 0.0015 | 0.0972 | 0.3326 | 0.5438 |
| QQQ | 2026-04-28 10:10:00 | 658.8200 | 0.6000 | 2.43 | near-low-watch | 0.0698 | 0.1594 | 0.6254 | 0.5844 | 0.5601 |
| QQQ | 2026-04-28 10:25:00 | 657.7700 | 0.6000 | 2.91 | near-low-watch | 0.0091 | 0.4667 | 0.4895 | 0.5078 | 0.3877 |
| QQQ | 2026-04-28 11:20:00 | 655.5800 | 0.6000 | 3.40 | near-low-watch | 0.1754 | 0.2197 | 0.1907 | 0.0214 | 0.0854 |

## Read

- **Backtest CSV**: `scripts/.cache/entropy-monitor/backtests/2026-04-29_Entropy_Backtest_SPY_QQQ.csv`
- **Lookback**: 120 one-minute bars.
- **Sampling step**: every 5 minute(s), using only same-day future bars.
- **Fixed watch thresholds**: near <= 0.6, low <= 0.5.
- **Relative rows**: lowest 10% and lowest 20% are included because SPY/QQQ may rarely hit fixed low-entropy thresholds.
- **Interpretation**: entropy is judged by absolute movement expansion, not direction.
