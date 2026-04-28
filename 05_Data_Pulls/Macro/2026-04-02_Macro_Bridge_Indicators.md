---
title: "Macro Bridge Indicators"
source: "Macro Bridge Puller"
date_pulled: "2026-04-02"
domain: "macro"
data_type: "time_series"
frequency: "varies"
signal_status: "clear"
signals: []
tags: ["macro", "bridges", "cross-asset", "thesis"]
related_pulls: []
---

## Core Indicator Snapshot

| Series | Name | Latest Date | Latest Value | Prior Value | Change |
| --- | --- | --- | --- | --- | --- |
| GFDEGDQ188S | Federal Debt to GDP | 2025-10-01 | 122.5% | 121.0% | +1.5 |
| DTWEXBGS | Trade Weighted U.S. Dollar Index (DXY Proxy) | 2026-03-27 | 120.89 | 120.39 | +0.50 |
| FDEFX | Federal Defense Spending Proxy | 2025-10-01 | $1159.3B | $1161.9B | -0.2% |
| XAUUSD | Gold Spot Price | 2026-04-02 | $4,676.75 | $4,758.20 | -$81.46 |
| BTCUSD | Bitcoin Price | 2026-04-02 | $66,750.00 | $66,894.48 | -$144.48 |

## Indicator Mapping

| Thesis Indicator | Series | Source Family | Notes |
| --- | --- | --- | --- |
| US Debt/GDP | GFDEGDQ188S | FRED | Official FRED debt-to-GDP series from OMB/St. Louis Fed. |
| DXY Dollar Index | DTWEXBGS | FRED | Uses the broad trade-weighted dollar index as the local DXY proxy. |
| Defense Budget | FDEFX | FRED | Uses BEA/FRED national defense expenditures as the local defense-budget proxy. |
| Gold Spot Price | XAUUSD | FMP | Pulled from FMP forex/commodity coverage. |
| Bitcoin Price | BTCUSD | FMP | Pulled from FMP crypto coverage. |

## Source

- **FRED Series**: GFDEGDQ188S, DTWEXBGS, FDEFX
- **FMP Symbols**: XAUUSD, BTCUSD
- **Purpose**: Fill core thesis macro gaps that are not covered by the default grouped pulls.
- **Auto-pulled**: 2026-04-02
