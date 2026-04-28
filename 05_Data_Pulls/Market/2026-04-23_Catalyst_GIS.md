---
title: "GIS Catalyst Note"
source: "FMP + Thesis Monitor"
symbol: "GIS"
primary_thesis: "[[Consumer Staples Sector Basket]]"
related_theses: ["[[Consumer Staples Sector Basket]]"]
linked_thesis_count: 1
primary_allocation_priority: "medium"
primary_monitor_status: "on-track"
high_priority_thesis_count: 0
non_on_track_thesis_count: 0
has_technical_context: true
has_earnings_context: false
technical_status: "alert"
technical_bias: "bearish"
momentum_state: "soft"
rsi14: 36.58
price_vs_sma200_pct: -22.97
catalyst_urgency: "near-term"
catalyst_score: 7
related_pulls: ["[[2026-04-23_FMP_Technicals_GIS_daily]]", "[[2026-04-23_FMP_Basket_Watchlist_Consumer_Staples_Sector_Basket]]"]
date_pulled: "2026-04-23"
domain: "market"
data_type: "catalyst_note"
frequency: "on-demand"
signal_status: "alert"
signals: ["TECHNICAL_ALERT", "TECHNICAL_BEARISH", "EARNINGS_GAP"]
tags: ["equities", "catalyst", "market", "thesis", "fmp", "gis"]
signal_state: new
---

## Catalyst Snapshot

- **Symbol**: GIS
- **Urgency**: near-term (score 7)
- **Primary Thesis**: [[Consumer Staples Sector Basket]]
- **Linked Theses**: [[Consumer Staples Sector Basket]]
- **Next Earnings**: none found
- **Technical**: alert | bearish | soft | -23.0% vs 200D
- **Monitor**: on-track

## Thesis Context

| Thesis | Priority | Conviction | Monitor | Next Catalyst | Action |
| --- | --- | --- | --- | --- | --- |
| [[Consumer Staples Sector Basket]] | medium | medium | on-track | Price realization, volume trends, and margin stability. | Refresh monthly for fundamentals, and rerun Qlib after the local data store is expanded to include staples coverage. |

## Earnings Catalyst

No earnings row found in the latest FMP calendar notes. Run `node run.mjs fmp --thesis-watchlists` or `node run.mjs fmp --earnings-calendar --from 2026-04-23 --to 2026-05-14` for fresh catalyst timing.

## Technical State

| Status | Bias | Momentum | RSI 14 | Vs 200D % | Snapshot |
| --- | --- | --- | --- | --- | --- |
| alert | bearish | soft | 36.6 | -23.0% | [[2026-04-23_FMP_Technicals_GIS_daily]] |

## Coverage Gaps

- Missing latest earnings-calendar row for GIS.

## Review Cue

- The tape is not clear (alert/bearish), so avoid treating the name as a clean add without confirmation.
- Market coverage is incomplete, so refresh thesis watchlists before making a sizing decision.

## Source

- **Window Logic**: earnings inside 21 days, non-clear tape, non-on-track thesis monitors, or high-priority thesis membership
- **Technical Snapshot**: [[2026-04-23_FMP_Technicals_GIS_daily]]
- **Earnings Calendar**: none found
- **Watchlist Reports**: [[2026-04-23_FMP_Basket_Watchlist_Consumer_Staples_Sector_Basket]]
- **Auto-pulled**: 2026-04-23
