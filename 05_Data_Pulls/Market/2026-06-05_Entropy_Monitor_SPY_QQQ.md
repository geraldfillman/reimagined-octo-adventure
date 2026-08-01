---
title: "SPY QQQ Entropy Monitor"
source: "Entropy Monitor"
agent_owner: "Orchestrator Agent"
agent_scope: "pull"
date_pulled: "2026-06-05"
domain: "market"
data_type: "entropy_monitor"
frequency: "intraday-shadow"
signal_status: "clear"
signals: []
symbols: ["SPY", "QQQ"]
lookback_bars: 120
near_entropy_threshold: 0.6
low_entropy_threshold: 0.5
ledger_path: "scripts/.cache/entropy-monitor/entropy-monitor-ledger.csv"
tags: ["entropy-monitor", "market", "strategy-shadow"]
---

## Current Snapshot

| Symbol | Bar Time | Price | Entropy | Level | Bucket | Quote Chg % | Vol Ratio | Window Start |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 2026-06-05 14:52:00 | 738.9700 | 0.7100 | mixed | baseline | -2.44 | N/A | 2026-06-05 12:52:00 |
| QQQ | 2026-06-05 14:52:00 | 707.8800 | 0.6600 | mixed | baseline | -4.44 | N/A | 2026-06-05 12:52:00 |

## Settled Movement Summary

| Symbol | Horizon | Obs | Watch Obs | Settled All | Avg Abs All % | Settled Watch | Avg Abs Watch % | Expansion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 5m | 21 | 3 | 12 | 0.0371 | 1 | 0.0192 | 0.52x |
| SPY | 15m | 21 | 3 | 11 | 0.0636 | 0 | N/A | N/A |
| SPY | 30m | 21 | 3 | 9 | 0.0983 | 0 | N/A | N/A |
| SPY | 60m | 21 | 3 | 9 | 0.1569 | 0 | N/A | N/A |
| SPY | 120m | 21 | 3 | 6 | 0.2587 | 0 | N/A | N/A |
| QQQ | 5m | 21 | 1 | 12 | 0.0721 | 1 | 0.0181 | 0.25x |
| QQQ | 15m | 21 | 1 | 11 | 0.1246 | 1 | 0.1153 | 0.93x |
| QQQ | 30m | 21 | 1 | 9 | 0.1299 | 1 | 0.2626 | 2.02x |
| QQQ | 60m | 21 | 1 | 9 | 0.2137 | 1 | 0.2501 | 1.17x |
| QQQ | 120m | 21 | 1 | 6 | 0.3406 | 1 | 0.0959 | 0.28x |

## Recent Ledger Rows

| Symbol | Time | Entropy | Bucket | Abs 5m % | Abs 15m % | Abs 30m % | Abs 60m % | Abs 120m % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 2026-06-05 14:52:00 | 0.7100 | baseline | N/A | N/A | N/A | N/A | N/A |
| QQQ | 2026-06-05 14:52:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| QQQ | 2026-06-03 12:45:00 | 0.6700 | baseline | 0.1327 | 0.1623 | 0.0155 | 0.2149 | 0.3442 |
| SPY | 2026-06-03 12:45:00 | 0.6800 | baseline | 0.0530 | 0.0888 | 0.0199 | 0.1114 | 0.1869 |
| QQQ | 2026-06-03 12:41:00 | 0.6600 | baseline | 0.1328 | 0.2178 | 0.1800 | 0.2583 | 0.4147 |
| SPY | 2026-06-03 12:41:00 | 0.6700 | baseline | 0.0982 | 0.1433 | 0.1552 | 0.1977 | 0.2641 |
| QQQ | 2026-06-02 15:59:00 | 0.6500 | baseline | N/A | N/A | N/A | N/A | N/A |
| SPY | 2026-06-02 15:59:00 | 0.6000 | near-low-watch | N/A | N/A | N/A | N/A | N/A |
| QQQ | 2026-05-22 15:59:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| SPY | 2026-05-22 15:59:00 | 0.6400 | baseline | N/A | N/A | N/A | N/A | N/A |
| QQQ | 2026-05-15 15:59:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| SPY | 2026-05-15 15:59:00 | 0.6400 | baseline | N/A | N/A | N/A | N/A | N/A |

## Use Rules

- Entropy is a magnitude monitor, not a direction signal.
- `near-low-watch` is a relative shadow-monitor bucket for SPY/QQQ while this ledger builds history.
- Review 5m, 15m, 30m, 60m, and 120m absolute movement after each reading.
- Do not promote to active use until the ledger has at least 20 to 30 settled observations per symbol.
- Reference: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]].
