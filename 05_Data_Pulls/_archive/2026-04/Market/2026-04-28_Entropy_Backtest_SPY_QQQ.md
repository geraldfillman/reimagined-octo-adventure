---
title: "SPY QQQ Entropy Backtest"
source: "Entropy Monitor"
agent_owner: "Orchestrator Agent"
agent_scope: "pull"
date_pulled: "2026-04-28"
domain: "market"
data_type: "entropy_backtest"
frequency: "on-demand"
signal_status: "watch"
signals: ["ENTROPY_BACKTEST_SPY_5M_LOW10_EXPANSION", "ENTROPY_BACKTEST_SPY_15M_LOW10_EXPANSION", "ENTROPY_BACKTEST_SPY_30M_LOW10_EXPANSION", "ENTROPY_BACKTEST_SPY_60M_LOW10_EXPANSION", "ENTROPY_BACKTEST_SPY_120M_LOW10_EXPANSION", "ENTROPY_BACKTEST_QQQ_5M_LOW10_EXPANSION", "ENTROPY_BACKTEST_QQQ_15M_LOW10_EXPANSION", "ENTROPY_BACKTEST_QQQ_30M_LOW10_EXPANSION", "ENTROPY_BACKTEST_QQQ_60M_LOW10_EXPANSION"]
symbols: ["SPY", "QQQ"]
lookback_bars: 120
sample_step_minutes: 1
near_entropy_threshold: 0.6
low_entropy_threshold: 0.5
backtest_rows: 2070
backtest_csv: "scripts/.cache/entropy-monitor/backtests/2026-04-28_Entropy_Backtest_SPY_QQQ.csv"
tags: ["entropy-monitor", "entropy-backtest", "market", "strategy-shadow"]
---

## Coverage

| Symbol | Bars | Trading Days | Observations | First Bar | Last Bar | First Obs | Last Obs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 1170 | 3 | 1035 | 2026-04-24 09:30:00 | 2026-04-28 15:59:00 | 2026-04-24 11:30:00 | 2026-04-28 15:54:00 |
| QQQ | 1170 | 3 | 1035 | 2026-04-24 09:30:00 | 2026-04-28 15:59:00 | 2026-04-24 11:30:00 | 2026-04-28 15:54:00 |

## Movement Expansion Summary

| Symbol | Horizon | Settled All | Avg All % | Near/Low n | Near/Low Avg % | Near/Low Expansion | Low 10% n | Low 10% Avg % | Low 10% Expansion | Low 20% n | Low 20% Avg % | Low 20% Expansion | High 20% Avg % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 5m | 1035 | 0.0301 | 76 | 0.0357 | 1.19x | 104 | 0.0391 | 1.30x | 207 | 0.0386 | 1.29x | 0.0237 |
| SPY | 15m | 1005 | 0.0488 | 75 | 0.0853 | 1.75x | 99 | 0.0778 | 1.60x | 200 | 0.0671 | 1.38x | 0.0393 |
| SPY | 30m | 960 | 0.0598 | 75 | 0.1098 | 1.84x | 99 | 0.0963 | 1.61x | 200 | 0.0805 | 1.35x | 0.0531 |
| SPY | 60m | 870 | 0.0823 | 75 | 0.1395 | 1.69x | 99 | 0.1500 | 1.82x | 198 | 0.1156 | 1.40x | 0.0683 |
| SPY | 120m | 690 | 0.1258 | 75 | 0.1866 | 1.48x | 99 | 0.2011 | 1.60x | 198 | 0.1658 | 1.32x | 0.1406 |
| QQQ | 5m | 1035 | 0.0470 | 44 | 0.0678 | 1.44x | 104 | 0.0654 | 1.39x | 207 | 0.0553 | 1.18x | 0.0344 |
| QQQ | 15m | 1005 | 0.0744 | 44 | 0.1370 | 1.84x | 104 | 0.1095 | 1.47x | 207 | 0.0849 | 1.14x | 0.0628 |
| QQQ | 30m | 960 | 0.0944 | 44 | 0.2845 | 3.01x | 104 | 0.1788 | 1.89x | 207 | 0.1230 | 1.30x | 0.0911 |
| QQQ | 60m | 870 | 0.1318 | 44 | 0.3163 | 2.40x | 104 | 0.1998 | 1.52x | 207 | 0.1489 | 1.13x | 0.1415 |
| QQQ | 120m | 690 | 0.1983 | 44 | 0.3452 | 1.74x | 102 | 0.2411 | 1.22x | 184 | 0.2053 | 1.04x | 0.1955 |

## Entropy Distribution

| Symbol | Obs | Min H | Median H | Max H | Low <=0.50 | Near <=0.60 | Baseline >0.60 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 1035 | 0.5400 | 0.6500 | 0.7000 | 0 | 76 | 959 |
| QQQ | 1035 | 0.5700 | 0.6600 | 0.7200 | 0 | 44 | 991 |

## Lowest Entropy Windows

| Symbol | Time | Price | Entropy | Pctile | Bucket | Abs 5m % | Abs 15m % | Abs 30m % | Abs 60m % | Abs 120m % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 2026-04-28 12:31:00 | 710.1501 | 0.5400 | 0.00 | near-low-watch | 0.0606 | 0.0662 | 0.0035 | 0.0127 | 0.1380 |
| SPY | 2026-04-28 12:32:00 | 710.1400 | 0.5400 | 0.10 | near-low-watch | 0.0535 | 0.0845 | 0.0310 | 0.0338 | 0.1281 |
| SPY | 2026-04-28 12:33:00 | 710.0600 | 0.5500 | 0.19 | near-low-watch | 0.0451 | 0.0507 | 0.0591 | 0.0465 | 0.1422 |
| SPY | 2026-04-28 12:28:00 | 710.4200 | 0.5600 | 0.29 | near-low-watch | 0.0507 | 0.1436 | 0.0549 | 0.0197 | 0.1295 |
| SPY | 2026-04-28 12:29:00 | 710.3501 | 0.5600 | 0.39 | near-low-watch | 0.0732 | 0.1183 | 0.0239 | 0.0338 | 0.1394 |
| SPY | 2026-04-28 12:30:00 | 710.3600 | 0.5600 | 0.48 | near-low-watch | 0.0851 | 0.1028 | 0.0197 | 0.0211 | 0.1316 |
| SPY | 2026-04-28 12:34:00 | 709.8300 | 0.5600 | 0.58 | near-low-watch | 0.0169 | 0.0113 | 0.0225 | 0.0902 | 0.1747 |
| SPY | 2026-04-28 12:37:00 | 709.7600 | 0.5600 | 0.68 | near-low-watch | 0.0225 | 0.0465 | 0.0070 | 0.1367 | 0.1536 |
| SPY | 2026-04-28 12:38:00 | 709.7400 | 0.5600 | 0.77 | near-low-watch | 0.0479 | 0.0676 | 0.0085 | 0.1254 | 0.1818 |
| QQQ | 2026-04-28 10:14:00 | 658.5500 | 0.5700 | 0.00 | near-low-watch | 0.0729 | 0.1367 | 0.3857 | 0.4054 | 0.4996 |
| QQQ | 2026-04-28 10:17:00 | 658.6300 | 0.5700 | 0.10 | near-low-watch | 0.0805 | 0.1503 | 0.3993 | 0.4418 | 0.5380 |
| QQQ | 2026-04-28 10:18:00 | 658.5200 | 0.5700 | 0.19 | near-low-watch | 0.1124 | 0.2126 | 0.4723 | 0.4146 | 0.4774 |
| SPY | 2026-04-28 12:35:00 | 709.7557 | 0.5700 | 0.87 | near-low-watch | 0.0034 | 0.0093 | 0.0233 | 0.1316 | 0.1711 |
| SPY | 2026-04-28 12:36:00 | 709.7200 | 0.5700 | 0.97 | near-low-watch | 0.0070 | 0.0225 | 0.0113 | 0.1268 | 0.1705 |
| SPY | 2026-04-28 12:39:00 | 709.7100 | 0.5700 | 1.06 | near-low-watch | 0.0282 | 0.0775 | 0.0240 | 0.1296 | 0.1927 |
| QQQ | 2026-04-28 10:01:00 | 658.1200 | 0.5800 | 0.29 | near-low-watch | 0.1109 | 0.0395 | 0.1064 | 0.3708 | 0.4710 |

## Read

- **Backtest CSV**: `scripts/.cache/entropy-monitor/backtests/2026-04-28_Entropy_Backtest_SPY_QQQ.csv`
- **Lookback**: 120 one-minute bars.
- **Sampling step**: every 1 minute(s), using only same-day future bars.
- **Fixed watch thresholds**: near <= 0.6, low <= 0.5.
- **Relative rows**: lowest 10% and lowest 20% are included because SPY/QQQ may rarely hit fixed low-entropy thresholds.
- **Interpretation**: entropy is judged by absolute movement expansion, not direction.
