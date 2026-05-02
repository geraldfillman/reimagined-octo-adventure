---
title: "ORB + Entropy Screen"
source: "FMP + Entropy Monitor"
date_pulled: "2026-04-30"
domain: "market"
data_type: "screen"
frequency: "intraday"
signal_status: "clear"
signals: ["ORB_LONG_GEHC", "ORB_LONG_TER", "ORB_SHORT_SBUX", "ORB_LONG_SOFI", "ORB_LONG_ODFL", "ORB_SHORT_CNC", "ORB_SHORT_V", "ORB_LONG_VTR", "ORB_SHORT_QCOM", "ORB_SHORT_TW", "ORB_LONG_IWR", "ORB_LONG_FTAI", "ORB_LONG_HOOD", "ORB_SHORT_GD", "ORB_SHORT_HUM", "ORB_LONG_HLT", "ORB_SHORT_IAU", "ORB_SHORT_BIIB", "ORB_LONG_VRSK", "ORB_SHORT_MA"]
capital: 25000
vol_scalar: 1.31
vol_regime: "low"
spy_realized_vol: 11.4
tags: ["equities", "orb", "entropy", "momentum", "intraday", "fmp"]
---

## Screen Parameters

- **Source**: 2026-04-30_FMP_RelVol_Screen.md
- **Capital**: $25,000
- **ORB window**: 9:30–9:35 AM ET (first 5-min candle)
- **Stop distance**: 10% × ATR14 from entry
- **Risk per trade**: tiered by setup quality — Prime+★ 3% / Prime 2% / Confirmed 1.5% / Active 1%, max 4× leverage
- **Entropy confirmed**: score ≤ 0.6 (near-low-watch or lower)
- **Gap filter**: opening gap must align with ORB direction (≥ 0.1%) — gap up + LONG, gap down + SHORT
- **VWAP filter**: entry level (OR high/low) must be on the correct side of the ORB VWAP
- **Range filter**: OR range ≤ 50% × ATR14 — tight coil leaves more room to expand
- **Prime setup**: all three filters pass (gap + VWAP + range) — highest conviction
- **Vol targeting**: SPY 20d realized vol 11.4% (low) → size scalar **1.31×** (target 15%, range 0.5×–1.5×)
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

| # | Ticker | Direction | Entry | Stop | 2R Target | Shares | Risk$ | Risk% | Entropy | Bucket | Gap | VWAP | OR/ATR | ★ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [[TER]] | LONG | $335.83 | $333.80 | $339.91 | 297 | $604 | 2.0% | 0.670 | mixed | +6.73% ok | $332.66 ok | 0.43x ok |  |
| 2 | [[SOFI]] | LONG | $15.82 | $15.72 | $16.01 | 6321 | $613 | 2.0% | 0.640 | mixed | +1.32% ok | $15.75 ok | 0.17x ok |  |
| 3 | [[ODFL]] | LONG | $212.75 | $211.96 | $214.34 | 470 | $373 | 2.0% | 0.680 | mixed | +0.21% ok | $211.13 ok | 0.38x ok |  |
| 4 | [[CNC]] | SHORT | $53.22 | $53.43 | $52.81 | 1878 | $387 | 2.0% | 0.650 | mixed | -0.91% ok | $53.27 ok | 0.13x ok |  |
| 5 | [[V]] | SHORT | $329.23 | $329.96 | $327.76 | 303 | $222 | 2.0% | 0.620 | mixed | -1.08% ok | $330.45 ok | 0.30x ok |  |
| 6 | [[TW]] | SHORT | $115.79 | $116.17 | $115.04 | 863 | $325 | 2.0% | 0.670 | mixed | -0.82% ok | $116.48 ok | 0.37x ok |  |
| 7 | [[IWR]] | LONG | $103.04 | $102.92 | $103.27 | 970 | $113 | 2.0% | 0.640 | mixed | +0.36% ok | $102.85 ok | 0.28x ok |  |
| 8 | [[HLT]] | LONG | $321.42 | $320.67 | $322.91 | 311 | $232 | 2.0% | 0.660 | mixed | +1.01% ok | $319.74 ok | 0.50x ok |  |

## Options Layer

_Long calls/puts — Level 2 compatible, no short leg. Prime setups only. Priced for 5/1 (weekly) and 5/15 (monthly) expiry._
_Recommendation: use 5/1 weekly for intraday holds — higher delta, less wasted time value. Switch to 5/15 monthly only if weekly OI < 500 on the strike._
_Theoretical BSM via ATR-derived IV (leans high — verify actual bid/ask). Contracts sized to match equity risk budget. Each contract = 100 shares._

| #   | Ticker   | Type      | Strike  | 5/1 Debit | 5/1 Qty | 5/1 Cost | 5/15 Debit | 5/15 Qty | 5/15 Cost | 5/1 B/E% | 5/15 B/E% | Est. IV |
| --- | -------- | --------- | ------- | --------- | ------- | -------- | ---------- | -------- | --------- | -------- | --------- | ------- |
| 1   | [[TER]]  | Long Call | $335.00 | $7.18     | 1       | $718     | $26.43     | 1        | $2643     | +1.89%   | +7.62%    | 96%     |
| 2   | [[SOFI]] | Long Call | $16.00  | $0.24     | 25      | $605     | $1.16      | 5        | $580      | +2.67%   | +8.47%    | 97%     |
| 3   | [[ODFL]] | Long Call | $212.50 | $2.77     | 1       | $277     | $10.37     | 1        | $1037     | +1.18%   | +4.76%    | 59%     |
| 4   | [[CNC]]  | Long Put  | $53.00  | $0.57     | 6       | $344     | $2.44      | 1        | $244      | -1.49%   | -5.00%    | 61%     |
| 5   | [[V]]    | Long Put  | $330.00 | $2.81     | 1       | $281     | $9.34      | 1        | $934      | -0.62%   | -2.60%    | 35%     |
| 6   | [[TW]]   | Long Put  | $115.00 | $0.88     | 3       | $265     | $4.26      | 1        | $426      | -1.45%   | -4.36%    | 52%     |
| 7   | [[IWR]]  | Long Call | $102.50 | $0.72     | 1       | $72      | $1.87      | 1        | $187      | +0.18%   | +1.29%    | 18%     |
| 8   | [[HLT]]  | Long Call | $320.00 | $3.27     | 1       | $327     | $10.49     | 1        | $1049     | +0.58%   | +2.82%    | 37%     |

## Compression + ORB Setups

_No overlap between today's ORB setups and sustained compression symbols (2026-04-29_Entropy_Compression_Scan.md)._

## Trade Sheet

| #   | Ticker   | Direction | Entry   | Stop    | R/share | 2R Target | Shares | Risk$ | Risk% | RelVol | ATR14  | Entropy | Bucket | Tier   | Gap        | VWAP       | OR/ATR   | ★   |
| --- | -------- | --------- | ------- | ------- | ------- | --------- | ------ | ----- | ----- | ------ | ------ | ------- | ------ | ------ | ---------- | ---------- | -------- | --- |
| 1   | [[GEHC]] | LONG      | $60.26  | $60.02  | $0.24   | $60.74    | 1362   | $328  | 1.0%  | 499%   | $2.41  | 0.630   | mixed  | active | -0.39% no  | $59.55 ok  | 0.44x ok |     |
| 2   | [[TER]]  | LONG      | $335.83 | $333.80 | $2.04   | $339.91   | 297    | $604  | 2.0%  | 373%   | $20.35 | 0.670   | mixed  | prime  | +6.73% ok  | $332.66 ok | 0.43x ok |     |
| 3   | [[SBUX]] | SHORT     | $104.19 | $104.43 | $0.24   | $103.71   | 959    | $232  | 1.0%  | 342%   | $2.42  | 0.630   | mixed  | active | +0.06%     | $104.88 ok | 0.56x no |     |
| 4   | [[SOFI]] | LONG      | $15.82  | $15.72  | $0.10   | $16.01    | 6321   | $613  | 2.0%  | 298%   | $0.97  | 0.640   | mixed  | prime  | +1.32% ok  | $15.75 ok  | 0.17x ok |     |
| 5   | [[ODFL]] | LONG      | $212.75 | $211.96 | $0.79   | $214.34   | 470    | $373  | 2.0%  | 265%   | $7.94  | 0.680   | mixed  | prime  | +0.21% ok  | $211.13 ok | 0.38x ok |     |
| 6   | [[CNC]]  | SHORT     | $53.22  | $53.43  | $0.21   | $52.81    | 1878   | $387  | 2.0%  | 260%   | $2.06  | 0.650   | mixed  | prime  | -0.91% ok  | $53.27 ok  | 0.13x ok |     |
| 7   | [[V]]    | SHORT     | $329.23 | $329.96 | $0.73   | $327.76   | 303    | $222  | 2.0%  | 236%   | $7.33  | 0.620   | mixed  | prime  | -1.08% ok  | $330.45 ok | 0.30x ok |     |
| 8   | [[VTR]]  | LONG      | $88.16  | $87.95  | $0.21   | $88.57    | 1134   | $234  | 1.0%  | 225%   | $2.06  | 0.710   | mixed  | active | -0.44% no  | $87.73 ok  | 0.59x no |     |
| 9   | [[QCOM]] | SHORT     | $164.87 | $165.42 | $0.55   | $163.76   | 597    | $328  | 1.0%  | 214%   | $5.50  | 0.670   | mixed  | active | +10.37% no | $168.06 ok | 1.34x no |     |
| 10  | [[TW]]   | SHORT     | $115.79 | $116.17 | $0.38   | $115.04   | 863    | $325  | 2.0%  | 213%   | $3.77  | 0.670   | mixed  | prime  | -0.82% ok  | $116.48 ok | 0.37x ok |     |
| 11  | [[IWR]]  | LONG      | $103.04 | $102.92 | $0.12   | $103.27   | 970    | $113  | 2.0%  | 206%   | $1.16  | 0.640   | mixed  | prime  | +0.36% ok  | $102.85 ok | 0.28x ok |     |
| 12  | [[FTAI]] | LONG      | $246.68 | $245.16 | $1.52   | $249.73   | 215    | $327  | 1.0%  | 204%   | $15.23 | 0.640   | mixed  | active | +9.15% ok  | $238.61 ok | 1.01x no |     |
| 13  | [[HOOD]] | LONG      | $72.22  | $71.69  | $0.53   | $73.28    | 617    | $328  | 1.0%  | 202%   | $5.32  | 0.660   | mixed  | active | +0.06%     | $71.68 ok  | 0.18x ok |     |
| 14  | [[GD]]   | SHORT     | $338.56 | $339.49 | $0.93   | $336.70   | 295    | $275  | 1.0%  | 197%   | $9.32  | 0.630   | mixed  | active | +0.41% no  | $339.84 ok | 0.25x ok |     |
| 15  | [[HUM]]  | SHORT     | $241.60 | $242.51 | $0.91   | $239.78   | 361    | $328  | 1.0%  | 195%   | $9.09  | 0.650   | mixed  | active | +0.03%     | $242.80 ok | 0.30x ok |     |
| 16  | [[HLT]]  | LONG      | $321.42 | $320.67 | $0.75   | $322.91   | 311    | $232  | 2.0%  | 192%   | $7.47  | 0.660   | mixed  | prime  | +1.01% ok  | $319.74 ok | 0.50x ok |     |
| 17  | [[IAU]]  | SHORT     | $87.08  | $87.23  | $0.15   | $86.79    | 1148   | $169  | 1.0%  | 191%   | $1.47  | 0.610   | mixed  | active | +1.85% no  | $87.12 ok  | 0.06x ok |     |
| 18  | [[BIIB]] | SHORT     | $192.50 | $193.09 | $0.59   | $191.32   | 519    | $305  | 1.0%  | 188%   | $5.88  | 0.610   | mixed  | active | -0.23% ok  | $194.17 ok | 0.60x no |     |
| 19  | [[VRSK]] | LONG      | $187.20 | $186.61 | $0.59   | $188.39   | 534    | $317  | 1.0%  | 187%   | $5.94  | 0.660   | mixed  | active | -1.35% no  | $186.02 ok | 0.48x ok |     |
| 20  | [[MA]]   | SHORT     | $500.18 | $501.26 | $1.08   | $498.01   | 199    | $215  | 1.0%  | 186%   | $10.82 | 0.610   | mixed  | active | -3.99% ok  | $503.86 ok | 1.18x no |     |

## Entropy-Confirmed Setups

_No entropy-confirmed setups this session._

## Position Sizing by Account Size

| Ticker | Dir | Entry | R/share | $1K Shares | $1K Risk | $5K Shares | $5K Risk | $25K Shares | $25K Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[GEHC]] | LONG | $60.26 | $0.24 | 54 | $13 | 272 | $66 | 1362 | $328 |
| [[TER]] | LONG | $335.83 | $2.04 | 11 | $22 | 59 | $120 | 297 | $604 |
| [[SBUX]] | SHORT | $104.19 | $0.24 | 38 | $9 | 191 | $46 | 959 | $232 |
| [[SOFI]] | LONG | $15.82 | $0.10 | 252 | $24 | 1264 | $123 | 6321 | $613 |
| [[ODFL]] | LONG | $212.75 | $0.79 | 18 | $14 | 94 | $75 | 470 | $373 |
| [[CNC]] | SHORT | $53.22 | $0.21 | 75 | $15 | 375 | $77 | 1878 | $387 |
| [[V]] | SHORT | $329.23 | $0.73 | 12 | $9 | 60 | $44 | 303 | $222 |
| [[VTR]] | LONG | $88.16 | $0.21 | 45 | $9 | 226 | $47 | 1134 | $234 |
| [[QCOM]] | SHORT | $164.87 | $0.55 | 23 | $13 | 119 | $65 | 597 | $328 |
| [[TW]] | SHORT | $115.79 | $0.38 | 34 | $13 | 172 | $65 | 863 | $325 |
| [[IWR]] | LONG | $103.04 | $0.12 | 38 | $4 | 194 | $23 | 970 | $113 |
| [[FTAI]] | LONG | $246.68 | $1.52 | 8 | $12 | 43 | $65 | 215 | $327 |
| [[HOOD]] | LONG | $72.22 | $0.53 | 24 | $13 | 123 | $65 | 617 | $328 |
| [[GD]] | SHORT | $338.56 | $0.93 | 11 | $10 | 59 | $55 | 295 | $275 |
| [[HUM]] | SHORT | $241.60 | $0.91 | 14 | $13 | 72 | $65 | 361 | $328 |
| [[HLT]] | LONG | $321.42 | $0.75 | 12 | $9 | 62 | $46 | 311 | $232 |
| [[IAU]] | SHORT | $87.08 | $0.15 | 45 | $7 | 229 | $34 | 1148 | $169 |
| [[BIIB]] | SHORT | $192.50 | $0.59 | 20 | $12 | 103 | $61 | 519 | $305 |
| [[VRSK]] | LONG | $187.20 | $0.59 | 21 | $12 | 106 | $63 | 534 | $317 |
| [[MA]] | SHORT | $500.18 | $1.08 | 7 | $8 | 39 | $42 | 199 | $215 |

## Source

- **Intraday**: FMP 1-min bars via `fetchIntradayPrices`
- **Entropy**: `computeTransitionEntropyFromBars` (120-bar window)
- **Auto-pulled**: 2026-04-30
