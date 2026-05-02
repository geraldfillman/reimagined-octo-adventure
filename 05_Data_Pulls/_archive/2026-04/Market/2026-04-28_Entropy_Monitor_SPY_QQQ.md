---
title: "SPY QQQ Entropy Monitor"
source: "Entropy Monitor"
agent_owner: "Orchestrator Agent"
agent_scope: "pull"
date_pulled: "2026-04-28"
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
| SPY | 2026-04-28 14:41:00 | 711.2200 | 0.6800 | mixed | baseline | -0.56 | N/A | 2026-04-28 12:41:00 |
| QQQ | 2026-04-28 14:41:00 | 657.7200 | 0.7000 | mixed | baseline | -0.99 | N/A | 2026-04-28 12:41:00 |

## Settled Movement Summary

| Symbol | Horizon | Obs | Watch Obs | Settled All | Avg Abs All % | Settled Watch | Avg Abs Watch % | Expansion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPY | 5m | 2 | 0 | 1 | 0.0056 | 0 | N/A | N/A |
| SPY | 15m | 2 | 0 | 1 | 0.0422 | 0 | N/A | N/A |
| SPY | 30m | 2 | 0 | 1 | 0.0098 | 0 | N/A | N/A |
| SPY | 60m | 2 | 0 | 0 | N/A | 0 | N/A | N/A |
| SPY | 120m | 2 | 0 | 0 | N/A | 0 | N/A | N/A |
| QQQ | 5m | 2 | 0 | 1 | 0.0277 | 0 | N/A | N/A |
| QQQ | 15m | 2 | 0 | 1 | 0.1180 | 0 | N/A | N/A |
| QQQ | 30m | 2 | 0 | 1 | 0.0990 | 0 | N/A | N/A |
| QQQ | 60m | 2 | 0 | 0 | N/A | 0 | N/A | N/A |
| QQQ | 120m | 2 | 0 | 0 | N/A | 0 | N/A | N/A |

## Recent Ledger Rows

| Symbol | Time | Entropy | Bucket | Abs 5m % | Abs 15m % | Abs 30m % | Abs 60m % | Abs 120m % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QQQ | 2026-04-28 14:41:00 | 0.7000 | baseline | N/A | N/A | N/A | N/A | N/A |
| SPY | 2026-04-28 14:41:00 | 0.6800 | baseline | N/A | N/A | N/A | N/A | N/A |
| QQQ | 2026-04-28 14:07:00 | 0.7200 | baseline | 0.0277 | 0.1180 | 0.0990 | N/A | N/A |
| SPY | 2026-04-28 14:07:00 | 0.6600 | baseline | 0.0056 | 0.0422 | 0.0098 | N/A | N/A |

## Use Rules

- Entropy is a magnitude monitor, not a direction signal.
- `near-low-watch` is a relative shadow-monitor bucket for SPY/QQQ while this ledger builds history.
- Review 5m, 15m, 30m, 60m, and 120m absolute movement after each reading.
- Do not promote to active use until the ledger has at least 20 to 30 settled observations per symbol.
- Reference: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]].
