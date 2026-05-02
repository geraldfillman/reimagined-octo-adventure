---
title: "ORB + Entropy Screen"
source: "FMP + Entropy Monitor"
date_pulled: "2026-05-01"
domain: "market"
data_type: "screen"
frequency: "intraday"
signal_status: "watch"
signals: ["ORB_SHORT_META", "ORB_SHORT_QCOM", "ORB_LONG_PPL", "ORB_SHORT_IRM", "ORB_LONG_GOOGL", "ORB_SHORT_CAH", "ORB_SHORT_FE", "ORB_LONG_GOOG", "ORB_SHORT_BMY", "ORB_SHORT_AME", "ORB_LONG_MO", "ORB_SHORT_PWR", "ORB_SHORT_TWLO", "ORB_SHORT_ORLY", "ORB_SHORT_EXC", "ORB_SHORT_FTAI", "ORB_SHORT_EBAY", "ORB_SHORT_BRO", "ORB_LONG_AIG", "ORB_SHORT_TER"]
capital: 25000
vol_scalar: 1.3
vol_regime: "low"
spy_realized_vol: 11.5
tags: ["equities", "orb", "entropy", "momentum", "intraday", "fmp"]
---

## Screen Parameters

- **Source**: 2026-05-01_FMP_RelVol_Screen.md
- **Capital**: $25,000
- **ORB window**: 9:30â€“9:35 AM ET (first 5-min candle)
- **Stop distance**: 10% Ã— ATR14 from entry
- **Risk per trade**: tiered by setup quality â€” Prime+â˜… 3% / Prime 2% / Confirmed 1.5% / Active 1%, max 4Ã— leverage
- **Entropy confirmed**: score â‰¤ 0.6 (near-low-watch or lower)
- **Gap filter**: opening gap must align with ORB direction (â‰¥ 0.1%) â€” gap up + LONG, gap down + SHORT
- **VWAP filter**: entry level (OR high/low) must be on the correct side of the ORB VWAP
- **Range filter**: OR range â‰¤ 50% Ã— ATR14 â€” tight coil leaves more room to expand
- **Prime setup**: all three filters pass (gap + VWAP + range) â€” highest conviction
- **Vol targeting**: SPY 20d realized vol 11.5% (low) â†’ size scalar **1.30Ã—** (target 15%, range 0.5Ã—â€“1.5Ã—)
- **Exit**: hold all open positions to 4:00 PM ET, exit at market â€” no profit target, no trailing stop, no scaling
- **Re-entry**: one attempt per symbol per session â€” no re-entry after stop-out
- **No direction flip**: if opposing range level breaks first, skip the trade entirely

## Exit Rules

| Rule | Detail |
| --- | --- |
| Income layer (50%) | Exit at 2R â€” see 2R Target column; locks baseline cash each session |
| Edge layer (50%) | Hold to 4:00 PM ET market-on-close â€” captures trend-day runners |
| Stop-loss | Triggered automatically at stop price (set on fill, never moved) |
| Trailing stop | Not used |
| Re-entry | Not permitted â€” one attempt per symbol per day |
| Direction flip | Not permitted â€” if opposing level breaks first, skip entirely |

See [[04_Reference/ORB + Entropy Strategy Playbook]] for full rules.

## Prime Setups

_All three quality filters pass: gap aligned + VWAP confirmed + tight OR range. Take these first._

| # | Ticker | Direction | Entry | Stop | 2R Target | Shares | Risk$ | Risk% | Entropy | Bucket | Gap | VWAP | OR/ATR | â˜… |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [[FTAI]] | SHORT | $239.96 | $241.69 | $236.50 | 376 | $651 | 2.0% | 0.670 | mixed | -1.57% ok | $242.53 ok | 0.36x ok |  |

## Options Layer

_Long calls/puts â€” Level 2 compatible, no short leg. Prime setups only. Priced for 5/8 (weekly) and 5/15 (monthly) expiry._
_Recommendation: use 5/8 weekly for intraday holds â€” higher delta, less wasted time value. Switch to 5/15 monthly only if weekly OI < 500 on the strike._
_Theoretical BSM via ATR-derived IV (leans high â€” verify actual bid/ask). Contracts sized to match equity risk budget. Each contract = 100 shares._

| # | Ticker | Type | Strike | 5/8 Debit | 5/8 Qty | 5/8 Cost | 5/15 Debit | 5/15 Qty | 5/15 Cost | 5/8 B/E% | 5/15 B/E% | Est. IV |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [[FTAI]] | Long Put | $240.00 | $15.07 | 1 | $1507 | $20.90 | 1 | $2090 | -6.26% | -8.69% | 115% |

## Compression + ORB Setups

_No overlap between today's ORB setups and sustained compression symbols (2026-04-30_Entropy_Compression_Scan.md)._

## Trade Sheet

| # | Ticker | Direction | Entry | Stop | R/share | 2R Target | Shares | Risk$ | Risk% | RelVol | ATR14 | Entropy | Bucket | Tier | Gap | VWAP | OR/ATR | â˜… |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [[META]] | SHORT | $611.15 | $613.12 | $1.97 | $607.20 | 163 | $322 | 1.0% | 336% | $19.73 | 0.680 | mixed | active | +0.43% no | $615.19 ok | 0.36x ok |  |
| 2 | [[QCOM]] | SHORT | $174.54 | $175.29 | $0.75 | $173.04 | 572 | $429 | 1.5% | 302% | $7.50 | 0.600 | near-low-watch | confirmed | -0.08% | $176.21 ok | 0.66x no |  |
| 3 | [[PPL]] | LONG | $37.95 | $37.87 | $0.08 | $38.10 | 2635 | $206 | 1.0% | 289% | $0.78 | 0.670 | mixed | active | +0.40% ok | $37.84 ok | 0.53x no |  |
| 4 | [[IRM]] | SHORT | $125.73 | $126.09 | $0.36 | $125.00 | 795 | $289 | 1.0% | 284% | $3.63 | 0.700 | mixed | active | +0.87% no | $126.23 ok | 0.31x ok |  |
| 5 | [[GOOGL]] | LONG | $382.27 | $381.29 | $0.98 | $384.23 | 261 | $255 | 1.0% | 258% | $9.78 | 0.650 | mixed | active | -0.85% no | $380.73 ok | 0.32x ok |  |
| 6 | [[CAH]] | SHORT | $194.30 | $194.88 | $0.58 | $193.13 | 514 | $300 | 1.0% | 250% | $5.84 | 0.660 | mixed | active | +1.81% no | $195.40 ok | 0.37x ok |  |
| 7 | [[FE]] | SHORT | $47.20 | $47.30 | $0.10 | $46.99 | 2118 | $218 | 1.0% | 248% | $1.03 | 0.620 | mixed | active | +0.27% no | $47.43 ok | 0.41x ok |  |
| 8 | [[GOOG]] | LONG | $378.26 | $377.31 | $0.95 | $380.16 | 264 | $251 | 1.0% | 245% | $9.50 | 0.640 | mixed | active | -1.06% no | $377.03 ok | 0.30x ok |  |
| 9 | [[BMY]] | SHORT | $58.30 | $58.44 | $0.14 | $58.03 | 1715 | $235 | 1.5% | 243% | $1.37 | 0.600 | near-low-watch | confirmed | -0.91% ok | $58.83 ok | 1.26x no |  |
| 10 | [[AME]] | SHORT | $233.00 | $233.58 | $0.58 | $231.83 | 429 | $251 | 1.0% | 242% | $5.84 | 0.670 | mixed | active | +0.11% no | $234.10 ok | 0.47x ok |  |
| 11 | [[MO]] | LONG | $73.72 | $73.56 | $0.16 | $74.05 | 1356 | $221 | 1.0% | 241% | $1.63 | 0.630 | mixed | active | +1.22% ok | $73.35 ok | 0.60x no |  |
| 12 | [[PWR]] | SHORT | $722.38 | $724.57 | $2.19 | $718.00 | 138 | $302 | 1.0% | 231% | $21.89 | 0.670 | mixed | active | +0.66% no | $725.90 ok | 0.56x no |  |
| 13 | [[TWLO]] | SHORT | $174.78 | $175.43 | $0.66 | $173.46 | 496 | $325 | 1.0% | 230% | $6.56 | 0.670 | mixed | active | +20.51% no | $176.14 ok | 0.72x no |  |
| 14 | [[ORLY]] | SHORT | $99.78 | $100.00 | $0.22 | $99.35 | 1002 | $216 | 1.5% | 219% | $2.16 | 0.590 | near-low-watch | confirmed | +0.59% no | $100.20 ok | 0.39x ok |  |
| 15 | [[EXC]] | SHORT | $45.97 | $46.07 | $0.10 | $45.77 | 2175 | $218 | 1.0% | 214% | $1.00 | 0.630 | mixed | active | +0.54% no | $46.18 ok | 0.30x ok |  |
| 16 | [[FTAI]] | SHORT | $239.96 | $241.69 | $1.73 | $236.50 | 376 | $651 | 2.0% | 211% | $17.32 | 0.670 | mixed | prime | -1.57% ok | $242.53 ok | 0.36x ok |  |
| 17 | [[EBAY]] | SHORT | $101.00 | $101.37 | $0.37 | $100.27 | 882 | $325 | 1.0% | 210% | $3.69 | 0.690 | mixed | active | -0.47% ok | $102.38 ok | 0.61x no |  |
| 18 | [[BRO]] | SHORT | $60.48 | $60.67 | $0.19 | $60.10 | 1653 | $317 | 1.5% | 210% | $1.92 | 0.600 | near-low-watch | confirmed | +1.40% no | $60.87 ok | 0.38x ok |  |
| 19 | [[AIG]] | LONG | $78.98 | $78.82 | $0.16 | $79.30 | 1266 | $203 | 1.5% | 210% | $1.60 | 0.580 | near-low-watch | confirmed | +4.40% ok | $78.54 ok | 0.54x no |  |
| 20 | [[TER]] | SHORT | $337.55 | $339.86 | $2.31 | $332.93 | 141 | $326 | 1.0% | 207% | $23.09 | 0.670 | mixed | active | -0.02% | $339.92 ok | 0.25x ok |  |

## Entropy-Confirmed Setups

| # | Ticker | Direction | Entry | Stop | 2R Target | Shares | Risk$ | Risk% | Entropy | Bucket | Gap | VWAP | OR/ATR | â˜… |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [[QCOM]] | SHORT | $174.54 | $175.29 | $173.04 | 572 | $429 | 1.5% | 0.600 | near-low-watch | -0.08% | $176.21 ok | 0.66x no |  |
| 2 | [[BMY]] | SHORT | $58.30 | $58.44 | $58.03 | 1715 | $235 | 1.5% | 0.600 | near-low-watch | -0.91% ok | $58.83 ok | 1.26x no |  |
| 3 | [[ORLY]] | SHORT | $99.78 | $100.00 | $99.35 | 1002 | $216 | 1.5% | 0.590 | near-low-watch | +0.59% no | $100.20 ok | 0.39x ok |  |
| 4 | [[BRO]] | SHORT | $60.48 | $60.67 | $60.10 | 1653 | $317 | 1.5% | 0.600 | near-low-watch | +1.40% no | $60.87 ok | 0.38x ok |  |
| 5 | [[AIG]] | LONG | $78.98 | $78.82 | $79.30 | 1266 | $203 | 1.5% | 0.580 | near-low-watch | +4.40% ok | $78.54 ok | 0.54x no |  |

## Position Sizing by Account Size

| Ticker | Dir | Entry | R/share | $1K Shares | $1K Risk | $5K Shares | $5K Risk | $25K Shares | $25K Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[META]] | SHORT | $611.15 | $1.97 | 6 | $12 | 32 | $63 | 163 | $322 |
| [[QCOM]] | SHORT | $174.54 | $0.75 | 22 | $17 | 114 | $86 | 572 | $429 |
| [[PPL]] | LONG | $37.95 | $0.08 | 105 | $8 | 527 | $41 | 2635 | $206 |
| [[IRM]] | SHORT | $125.73 | $0.36 | 31 | $11 | 159 | $58 | 795 | $289 |
| [[GOOGL]] | LONG | $382.27 | $0.98 | 10 | $10 | 52 | $51 | 261 | $255 |
| [[CAH]] | SHORT | $194.30 | $0.58 | 20 | $12 | 102 | $60 | 514 | $300 |
| [[FE]] | SHORT | $47.20 | $0.10 | 84 | $9 | 423 | $44 | 2118 | $218 |
| [[GOOG]] | LONG | $378.26 | $0.95 | 10 | $9 | 52 | $49 | 264 | $251 |
| [[BMY]] | SHORT | $58.30 | $0.14 | 68 | $9 | 343 | $47 | 1715 | $235 |
| [[AME]] | SHORT | $233.00 | $0.58 | 17 | $10 | 85 | $50 | 429 | $251 |
| [[MO]] | LONG | $73.72 | $0.16 | 54 | $9 | 271 | $44 | 1356 | $221 |
| [[PWR]] | SHORT | $722.38 | $2.19 | 5 | $11 | 27 | $59 | 138 | $302 |
| [[TWLO]] | SHORT | $174.78 | $0.66 | 19 | $12 | 99 | $65 | 496 | $325 |
| [[ORLY]] | SHORT | $99.78 | $0.22 | 40 | $9 | 200 | $43 | 1002 | $216 |
| [[EXC]] | SHORT | $45.97 | $0.10 | 87 | $9 | 435 | $44 | 2175 | $218 |
| [[FTAI]] | SHORT | $239.96 | $1.73 | 15 | $26 | 75 | $130 | 376 | $651 |
| [[EBAY]] | SHORT | $101.00 | $0.37 | 35 | $13 | 176 | $65 | 882 | $325 |
| [[BRO]] | SHORT | $60.48 | $0.19 | 66 | $13 | 330 | $63 | 1653 | $317 |
| [[AIG]] | LONG | $78.98 | $0.16 | 50 | $8 | 253 | $40 | 1266 | $203 |
| [[TER]] | SHORT | $337.55 | $2.31 | 5 | $12 | 28 | $65 | 141 | $326 |

## Source

- **Intraday**: FMP 1-min bars via `fetchIntradayPrices`
- **Entropy**: `computeTransitionEntropyFromBars` (120-bar window)
- **Auto-pulled**: 2026-05-01

## Strategy Overlay

_Agent scoring run 09:58 ET - alert notes in [[05_Data_Pulls/Alerts/]]_

| #   | Ticker    | Dir   | Score | Signal          | Auction State | Crowding | Edge Types | Flags |
| --- | --------- | ----- | ----- | --------------- | ------------- | -------- | ---------- | ----- |
| 1   | [[ORLY]]  | SHORT | -     | below-threshold | -             | -        | -          |       |
| 2   | [[EXC]]   | SHORT | -     | below-threshold | -             | -        | -          |       |
| 3   | [[TWLO]]  | SHORT | -     | below-threshold | -             | -        | -          |       |
| 4   | [[MO]]    | LONG  | -     | below-threshold | -             | -        | -          |       |
| 5   | [[PWR]]   | SHORT | -     | below-threshold | -             | -        | -          |       |
| 6   | [[AIG]]   | LONG  | -     | below-threshold | -             | -        | -          |       |
| 7   | [[TER]]   | SHORT | -     | below-threshold | -             | -        | -          |       |
| 8   | [[BRO]]   | SHORT | -     | below-threshold | -             | -        | -          |       |
| 9   | [[FTAI]]  | SHORT | -     | below-threshold | -             | -        | -          |       |
| 10  | [[EBAY]]  | SHORT | -     | below-threshold | -             | -        | -          |       |
| 11  | [[IRM]]   | SHORT | -     | below-threshold | -             | -        | -          |       |
| 12  | [[GOOGL]] | LONG  | -     | below-threshold | -             | -        | -          |       |
| 13  | [[PPL]]   | LONG  | -     | below-threshold | -             | -        | -          |       |
| 14  | [[META]]  | SHORT | -     | below-threshold | -             | -        | -          |       |
| 15  | [[QCOM]]  | SHORT | -     | below-threshold | -             | -        | -          |       |
| 16  | [[BMY]]   | SHORT | -     | below-threshold | -             | -        | -          |       |
| 17  | [[AME]]   | SHORT | -     | below-threshold | -             | -        | -          |       |
| 18  | [[GOOG]]  | LONG  | -     | below-threshold | -             | -        | -          |       |
| 19  | [[CAH]]   | SHORT | -     | below-threshold | -             | -        | -          |       |
| 20  | [[FE]]    | SHORT | -     | below-threshold | -             | -        | -          |       |

> **Flag key** - HIGH_CROWD: crowding score >= 4.0 (high/exit-door-risk, reduce or skip). AUCTION_CONFLICT: auction state contradicts ORB direction. Review flagged rows before sizing.

