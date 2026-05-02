---
title: "ORB + Entropy Screen"
source: "FMP + Entropy Monitor"
date_pulled: "2026-04-29"
domain: "market"
data_type: "screen"
frequency: "intraday"
signal_status: "clear"
signals: ["ORB_LONG_CNC", "ORB_SHORT_GM", "ORB_LONG_UPS", "ORB_LONG_KO", "ORB_LONG_NUE", "ORB_LONG_PCAR", "ORB_LONG_YUM", "ORB_SHORT_GLW", "ORB_LONG_AIG", "ORB_SHORT_AMAT", "ORB_SHORT_FTAI", "ORB_SHORT_EXR", "ORB_SHORT_CDNS", "ORB_LONG_BRO", "ORB_SHORT_VTR", "ORB_SHORT_SOXX", "ORB_SHORT_OMC", "ORB_SHORT_AMKR", "ORB_LONG_QCOM", "ORB_LONG_SBUX"]
capital: 25000
vol_scalar: 1.3
vol_regime: "low"
spy_realized_vol: 11.5
tags: ["equities", "orb", "entropy", "momentum", "intraday", "fmp"]
---

## Screen Parameters

- **Source**: 2026-04-29_FMP_RelVol_Screen.md
- **Capital**: $25,000
- **ORB window**: 9:30–9:35 AM ET (first 5-min candle)
- **Stop distance**: 10% × ATR14 from entry
- **Risk per trade**: tiered by setup quality — Prime+★ 3% / Prime 2% / Confirmed 1.5% / Active 1%, max 4× leverage
- **Entropy confirmed**: score ≤ 0.6 (near-low-watch or lower)
- **Gap filter**: opening gap must align with ORB direction (≥ 0.1%) — gap up + LONG, gap down + SHORT
- **VWAP filter**: entry level (OR high/low) must be on the correct side of the ORB VWAP
- **Range filter**: OR range ≤ 50% × ATR14 — tight coil leaves more room to expand
- **Prime setup**: all three filters pass (gap + VWAP + range) — highest conviction
- **Vol targeting**: SPY 20d realized vol 11.5% (low) → size scalar **1.30×** (target 15%, range 0.5×–1.5×)
- **Exit**: hold all open positions to 4:00 PM ET, exit at market — no profit target, no trailing stop, no scaling
- **Re-entry**: one attempt per symbol per session — no re-entry after stop-out
- **No direction flip**: if opposing range level breaks first, skip the trade entirely

## Exit Rules

| Rule | Detail |
| --- | --- |
| Income layer (50%) | Exit at 2R — see 2R Target column; locks baseline cash each session |
| Edge layer (50%) | Hold to 4:00 PM ET market-on-close — captures trend-day runners |
| Stop-loss | Triggered automatically at stop price (set on fill, never moved) |
| Trailing stop | Not used |
| Re-entry | Not permitted — one attempt per symbol per day |
| Direction flip | Not permitted — if opposing level breaks first, skip entirely |

See [[04_Reference/ORB + Entropy Strategy Playbook]] for full rules.

## Prime Setups

_All three quality filters pass: gap aligned + VWAP confirmed + tight OR range. Take these first._

| #   | Ticker   | Direction | Entry   | Stop    | 2R Target | Shares | Risk$ | Risk% | Entropy | Bucket   | Gap       | VWAP       | OR/ATR   | ★   |
| --- | -------- | --------- | ------- | ------- | --------- | ------ | ----- | ----- | ------- | -------- | --------- | ---------- | -------- | --- |
| 1   | [[UPS]]  | LONG      | $105.34 | $105.10 | $105.83   | 949    | $232  | 2.0%  | 0.670   | baseline | +0.64% ok | $104.94 ok | 0.42x ok |     |
| 2   | [[NUE]]  | LONG      | $227.00 | $226.44 | $228.11   | 440    | $244  | 2.0%  | 0.700   | baseline | +0.61% ok | $225.92 ok | 0.36x ok |     |
| 3   | [[EXR]]  | SHORT     | $139.97 | $140.27 | $139.37   | 714    | $216  | 2.0%  | 0.690   | baseline | -0.62% ok | $140.73 ok | 0.41x ok |     |
| 4   | [[CDNS]] | SHORT     | $320.60 | $322.04 | $317.73   | 311    | $446  | 2.0%  | 0.680   | baseline | -0.78% ok | $321.98 ok | 0.19x ok |     |
| 5   | [[BRO]]  | LONG      | $63.92  | $63.74  | $64.29    | 1564   | $288  | 2.0%  | 0.650   | baseline | +0.76% ok | $63.70 ok  | 0.28x ok |     |
| 6   | [[QCOM]] | LONG      | $152.76 | $152.25 | $153.78   | 654    | $334  | 2.0%  | 0.710   | baseline | +1.16% ok | $152.35 ok | 0.34x ok |     |

## Options Layer

_Long calls/puts — Level 2 compatible, no short leg. Prime setups only. Priced for 5/1 (weekly) and 5/15 (monthly) expiry._
_Recommendation: use 5/1 weekly for intraday holds — higher delta, less wasted time value. Switch to 5/15 monthly only if weekly OI < 500 on the strike._
_Theoretical BSM via ATR-derived IV (leans high — verify actual bid/ask). Contracts sized to match equity risk budget. Each contract = 100 shares._

| # | Ticker | Type | Strike | 5/1 Debit | 5/1 Qty | 5/1 Cost | 5/15 Debit | 5/15 Qty | 5/15 Cost | 5/1 B/E% | 5/15 B/E% | Est. IV |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [[UPS]] | Long Call | $105.00 | $1.34 | 1 | $134 | $3.45 | 1 | $345 | +0.94% | +2.95% | 37% |
| 2 | [[NUE]] | Long Call | $227.50 | $2.39 | 1 | $239 | $7.19 | 1 | $719 | +1.27% | +3.39% | 39% |
| 3 | [[EXR]] | Long Put | $140.00 | $1.41 | 1 | $141 | $3.79 | 1 | $379 | -0.99% | -2.68% | 34% |
| 4 | [[CDNS]] | Long Put | $320.00 | $6.38 | 1 | $638 | $17.95 | 1 | $1795 | -2.18% | -5.79% | 71% |
| 5 | [[BRO]] | Long Call | $64.00 | $0.83 | 3 | $250 | $2.41 | 1 | $241 | +1.43% | +3.90% | 46% |
| 6 | [[QCOM]] | Long Call | $152.50 | $2.55 | 1 | $255 | $6.91 | 1 | $691 | +1.50% | +4.36% | 53% |

## Compression + ORB Setups

_No overlap between today's ORB setups and sustained compression symbols (2026-04-29_Entropy_Compression_Scan.md)._

## Trade Sheet

| # | Ticker | Direction | Entry | Stop | R/share | 2R Target | Shares | Risk$ | Risk% | RelVol | ATR14 | Entropy | Bucket | Tier | Gap | VWAP | OR/ATR | ★ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [[CNC]] | LONG | $52.74 | $52.56 | $0.18 | $53.09 | 1853 | $326 | 1.0% | 267% | $1.76 | 0.680 | baseline | active | +2.04% ok | $51.58 ok | 1.33x no |  |
| 2 | [[GM]] | SHORT | $76.09 | $76.31 | $0.22 | $75.65 | 1314 | $286 | 1.0% | 243% | $2.18 | 0.670 | baseline | active | -0.71% ok | $76.77 ok | 1.07x no |  |
| 3 | [[UPS]] | LONG | $105.34 | $105.10 | $0.24 | $105.83 | 949 | $232 | 2.0% | 222% | $2.44 | 0.670 | baseline | prime | +0.64% ok | $104.94 ok | 0.42x ok |  |
| 4 | [[KO]] | LONG | $78.86 | $78.72 | $0.14 | $79.15 | 1268 | $184 | 1.0% | 220% | $1.45 | 0.640 | baseline | active | +0.01% | $78.70 ok | 0.45x ok |  |
| 5 | [[NUE]] | LONG | $227.00 | $226.44 | $0.56 | $228.11 | 440 | $244 | 2.0% | 217% | $5.55 | 0.700 | baseline | prime | +0.61% ok | $225.92 ok | 0.36x ok |  |
| 6 | [[PCAR]] | LONG | $121.12 | $120.77 | $0.35 | $121.82 | 825 | $288 | 1.0% | 202% | $3.49 | 0.640 | baseline | active | -0.03% | $120.55 ok | 0.44x ok |  |
| 7 | [[YUM]] | LONG | $163.54 | $163.25 | $0.29 | $164.11 | 611 | $175 | 1.0% | 192% | $2.87 | 0.650 | baseline | active | +2.20% ok | $162.51 ok | 1.32x no |  |
| 8 | [[GLW]] | SHORT | $150.00 | $150.90 | $0.90 | $148.21 | 364 | $326 | 1.0% | 192% | $8.95 | 0.660 | baseline | active | +1.61% no | $151.20 ok | 0.67x no |  |
| 9 | [[AIG]] | LONG | $74.40 | $74.24 | $0.16 | $74.72 | 1344 | $215 | 1.0% | 188% | $1.60 | 0.670 | baseline | active | -0.43% no | $74.20 ok | 0.35x ok |  |
| 10 | [[AMAT]] | SHORT | $380.50 | $381.84 | $1.34 | $377.82 | 243 | $325 | 1.0% | 181% | $13.38 | 0.630 | baseline | active | +0.75% no | $382.47 ok | 0.41x ok |  |
| 11 | [[FTAI]] | SHORT | $214.55 | $216.04 | $1.49 | $211.57 | 218 | $325 | 1.0% | 178% | $14.92 | 0.670 | baseline | active | +0.09% | $215.26 ok | 0.23x ok |  |
| 12 | [[EXR]] | SHORT | $139.97 | $140.27 | $0.30 | $139.37 | 714 | $216 | 2.0% | 174% | $3.02 | 0.690 | baseline | prime | -0.62% ok | $140.73 ok | 0.41x ok |  |
| 13 | [[CDNS]] | SHORT | $320.60 | $322.04 | $1.44 | $317.73 | 311 | $446 | 2.0% | 171% | $14.35 | 0.680 | baseline | prime | -0.78% ok | $321.98 ok | 0.19x ok |  |
| 14 | [[BRO]] | LONG | $63.92 | $63.74 | $0.18 | $64.29 | 1564 | $288 | 2.0% | 166% | $1.84 | 0.650 | baseline | prime | +0.76% ok | $63.70 ok | 0.28x ok |  |
| 15 | [[VTR]] | SHORT | $87.39 | $87.60 | $0.21 | $86.97 | 1144 | $243 | 1.0% | 166% | $2.12 | 0.690 | baseline | active | -0.01% | $87.72 ok | 0.37x ok |  |
| 16 | [[SOXX]] | SHORT | $442.50 | $443.69 | $1.19 | $440.12 | 225 | $268 | 1.0% | 166% | $11.89 | 0.620 | baseline | active | +1.66% no | $444.59 ok | 0.37x ok |  |
| 17 | [[OMC]] | SHORT | $74.80 | $74.99 | $0.19 | $74.42 | 1336 | $255 | 1.0% | 164% | $1.91 | 0.640 | baseline | active | -0.26% ok | $75.89 ok | 1.76x no |  |
| 18 | [[AMKR]] | SHORT | $69.61 | $70.04 | $0.43 | $68.74 | 751 | $326 | 1.0% | 164% | $4.34 | 0.670 | baseline | active | +2.19% no | $70.73 ok | 0.80x no |  |
| 19 | [[QCOM]] | LONG | $152.76 | $152.25 | $0.51 | $153.78 | 654 | $334 | 2.0% | 163% | $5.11 | 0.710 | baseline | prime | +1.16% ok | $152.35 ok | 0.34x ok |  |
| 20 | [[SBUX]] | LONG | $102.16 | $101.98 | $0.18 | $102.53 | 978 | $179 | 1.0% | 163% | $1.83 | 0.680 | baseline | active | +4.74% ok | $101.25 ok | 1.14x no |  |

## Entropy-Confirmed Setups

_No entropy-confirmed setups this session._

## Position Sizing by Account Size

| Ticker | Dir | Entry | R/share | $1K Shares | $1K Risk | $5K Shares | $5K Risk | $25K Shares | $25K Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[CNC]] | LONG | $52.74 | $0.18 | 74 | $13 | 370 | $65 | 1853 | $326 |
| [[GM]] | SHORT | $76.09 | $0.22 | 52 | $11 | 262 | $57 | 1314 | $286 |
| [[UPS]] | LONG | $105.34 | $0.24 | 37 | $9 | 189 | $46 | 949 | $232 |
| [[KO]] | LONG | $78.86 | $0.14 | 50 | $7 | 253 | $37 | 1268 | $184 |
| [[NUE]] | LONG | $227.00 | $0.56 | 17 | $9 | 88 | $49 | 440 | $244 |
| [[PCAR]] | LONG | $121.12 | $0.35 | 33 | $12 | 165 | $58 | 825 | $288 |
| [[YUM]] | LONG | $163.54 | $0.29 | 24 | $7 | 122 | $35 | 611 | $175 |
| [[GLW]] | SHORT | $150.00 | $0.90 | 14 | $13 | 72 | $64 | 364 | $326 |
| [[AIG]] | LONG | $74.40 | $0.16 | 53 | $8 | 268 | $43 | 1344 | $215 |
| [[AMAT]] | SHORT | $380.50 | $1.34 | 9 | $12 | 48 | $64 | 243 | $325 |
| [[FTAI]] | SHORT | $214.55 | $1.49 | 8 | $12 | 43 | $64 | 218 | $325 |
| [[EXR]] | SHORT | $139.97 | $0.30 | 28 | $8 | 142 | $43 | 714 | $216 |
| [[CDNS]] | SHORT | $320.60 | $1.44 | 12 | $17 | 62 | $89 | 311 | $446 |
| [[BRO]] | LONG | $63.92 | $0.18 | 62 | $11 | 312 | $57 | 1564 | $288 |
| [[VTR]] | SHORT | $87.39 | $0.21 | 45 | $10 | 228 | $48 | 1144 | $243 |
| [[SOXX]] | SHORT | $442.50 | $1.19 | 9 | $11 | 45 | $54 | 225 | $268 |
| [[OMC]] | SHORT | $74.80 | $0.19 | 53 | $10 | 267 | $51 | 1336 | $255 |
| [[AMKR]] | SHORT | $69.61 | $0.43 | 30 | $13 | 150 | $65 | 751 | $326 |
| [[QCOM]] | LONG | $152.76 | $0.51 | 26 | $13 | 130 | $66 | 654 | $334 |
| [[SBUX]] | LONG | $102.16 | $0.18 | 39 | $7 | 195 | $36 | 978 | $179 |

## Source

- **Intraday**: FMP 1-min bars via `fetchIntradayPrices`
- **Entropy**: `computeTransitionEntropyFromBars` (120-bar window)
- **Auto-pulled**: 2026-04-29
