---
title: "Auction Features"
source: "Vault Orchestrator"
date_pulled: "2026-05-01"
domain: "market"
data_type: "auction_features"
frequency: "daily"
symbol_count: 15
alert_count: 0
signal_status: "clear"
signals: []
tags: ["auction", "volume-profile", "avwap", "market-microstructure"]
---

## Operating Rule

> Auction state shows where price is relative to the prior session value area.
> AVWAP Dist% > ±5% is extension territory — watch for mean-reversion setups.
> Relative volume > 1.5x on a breakout from the value area confirms auction participation.
> All entries require manual liquidity verification. No broker execution is generated.

## Auction Feature Scan

| Symbol | Auction State | POC    | VAH    | VAL    | AVWAP  | AVWAP Dist% | Rel Vol | Signal  |
| ------ | ------------- | ------ | ------ | ------ | ------ | ----------- | ------- | ------- |
| SPY    | balance       | 721.99 | 723.43 | 721.99 | —      | —           | —       | NEUTRAL |
| QQQ    | balance       | 674.18 | 675.52 | 672.83 | 674.46 | —           | —       | NEUTRAL |
| IWM    | balance       | 278.8  | 279.35 | 277.68 | —      | —           | —       | NEUTRAL |
| DIA    | balance       | 497.9  | 497.9  | 494.92 | —      | —           | —       | NEUTRAL |
| TLT    | balance       | 85.68  | 85.85  | 85.68  | —      | —           | —       | NEUTRAL |
| IEF    | balance       | 94.81  | 94.81  | 94.81  | —      | —           | —       | NEUTRAL |
| SHY    | balance       | 82.22  | 82.22  | 82.22  | —      | —           | —       | NEUTRAL |
| HYG    | balance       | 80.19  | 80.19  | 80.03  | —      | —           | —       | NEUTRAL |
| LQD    | balance       | 108.68 | 108.68 | 108.68 | —      | —           | —       | NEUTRAL |
| TIP    | balance       | 111.43 | 111.43 | 111.43 | —      | —           | —       | NEUTRAL |
| GLD    | balance       | 424.53 | 427.07 | 424.53 | —      | —           | —       | NEUTRAL |
| SLV    | balance       | 68.61  | 69.16  | 68.33  | —      | —           | —       | NEUTRAL |
| USO    | balance       | 142.47 | 143.04 | 140.78 | —      | —           | —       | NEUTRAL |
| UNG    | balance       | 10.66  | 10.68  | 10.59  | —      | —           | —       | NEUTRAL |
| UUP    | balance       | 27.31  | 27.37  | 27.26  | —      | —           | —       | NEUTRAL |

## Field Guide

- **Auction State**: `balanced` = price inside value area; `imbalance_up/down` = directional breakout; `gap_up/down` = overnight gap.
- **POC**: Point of Control — highest-volume price level in the session.
- **VAH / VAL**: Value Area High / Low — price range containing ~70% of session volume.
- **AVWAP**: Anchored VWAP from the most recent significant low or earnings date.
- **AVWAP Dist%**: Percentage distance of current price from AVWAP (positive = above).
- **Rel Vol**: Today's volume vs 20-day average volume ratio.
