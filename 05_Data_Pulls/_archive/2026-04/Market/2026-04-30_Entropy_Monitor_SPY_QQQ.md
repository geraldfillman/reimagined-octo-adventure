---
title: "SPY QQQ Entropy Monitor"
source: "Entropy Monitor"
agent_owner: "Orchestrator Agent"
agent_scope: "pull"
date_pulled: "2026-04-30"
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
| SPY | 2026-04-29 15:59:00 | 711.4900 | 0.6400 | mixed | baseline | -0.02 | N/A | 2026-04-29 13:59:00 |
| QQQ | 2026-04-29 15:59:00 | 661.4300 | 0.6600 | mixed | baseline | 0.61 | N/A | 2026-04-29 13:59:00 |

## Settled Movement Summary

| Symbol | Horizon | Obs | Watch Obs | Settled All | Avg Abs All % | Settled Watch | Avg Abs Watch % | Expansion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 5m | 4 | 0 | 2 | 0.0106 | 0 | N/A | N/A |
| SPY | 15m | 4 | 0 | 2 | 0.0345 | 0 | N/A | N/A |
| SPY | 30m | 4 | 0 | 2 | 0.0674 | 0 | N/A | N/A |
| SPY | 60m | 4 | 0 | 2 | 0.1030 | 0 | N/A | N/A |
| SPY | 120m | 4 | 0 | 0 | N/A | 0 | N/A | N/A |
| QQQ | 5m | 4 | 0 | 2 | 0.0161 | 0 | N/A | N/A |
| QQQ | 15m | 4 | 0 | 2 | 0.0696 | 0 | N/A | N/A |
| QQQ | 30m | 4 | 0 | 2 | 0.1346 | 0 | N/A | N/A |
| QQQ | 60m | 4 | 0 | 2 | 0.1797 | 0 | N/A | N/A |
| QQQ | 120m | 4 | 0 | 0 | N/A | 0 | N/A | N/A |

## Recent Ledger Rows

| Symbol | Time | Entropy | Bucket | Abs 5m % | Abs 15m % | Abs 30m % | Abs 60m % | Abs 120m % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 2026-04-29 15:59:00 | 0.6400 | baseline | N/A | N/A | N/A | N/A | N/A |
| QQQ | 2026-04-29 15:59:00 | 0.6600 | baseline | N/A | N/A | N/A | N/A | N/A |
| QQQ | 2026-04-28 15:59:00 | 0.6300 | baseline | N/A | N/A | N/A | N/A | N/A |
| SPY | 2026-04-28 15:59:00 | 0.6200 | baseline | N/A | N/A | N/A | N/A | N/A |
| QQQ | 2026-04-28 14:41:00 | 0.7000 | baseline | 0.0046 | 0.0213 | 0.1703 | 0.0517 | N/A |
| SPY | 2026-04-28 14:41:00 | 0.6800 | baseline | 0.0155 | 0.0267 | 0.1251 | 0.0717 | N/A |
| QQQ | 2026-04-28 14:07:00 | 0.7200 | baseline | 0.0277 | 0.1180 | 0.0990 | 0.3076 | N/A |
| SPY | 2026-04-28 14:07:00 | 0.6600 | baseline | 0.0056 | 0.0422 | 0.0098 | 0.1343 | N/A |

## Use Rules

- Entropy is a magnitude monitor, not a direction signal.
- `near-low-watch` is a relative shadow-monitor bucket for SPY/QQQ while this ledger builds history.
- Review 5m, 15m, 30m, 60m, and 120m absolute movement after each reading.
- Do not promote to active use until the ledger has at least 20 to 30 settled observations per symbol.
- Reference: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]].
