---
title: "ETN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "ETN"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-05-02"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.42
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.63
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "etn"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 42%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 42% confidence. Agent entropy is mixed (0.63). Drivers: price, fundamentals. 7 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.63)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 53%, bearish 0%, neutral 47%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 250ms | ETN closed at 425.55. 7d 2.8%, 30d 18.1%. RSI 64.9, MACD positive. |
| risk | NEUTRAL | 33% | 358ms | Risk read: 30d vol 37.4%, max drawdown -19.6%, 30d return 18.1%. |
| sentiment | NEUTRAL | 30% | 564ms | 20 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 28% | 1031ms | Volume ratio 0.92x, price change -1.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 347ms | Macro backdrop: VIX 16.89, curve 0.51, HY spread 2.8%. |
| fundamentals | BULLISH | 38% | 1310ms | Revenue growth 10.3%, net margin 14.9%, trailing FCF 8.0B. |
| auction | NEUTRAL | 22% | 1632ms | Auction state: balance. inside value 423.75–429.77. Session bars: 390. |
| pair | NEUTRAL | 5% | 37ms | ETN is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 1728ms | No recent earnings within 90 days for ETN. |
| prediction_market | NEUTRAL | 12% | 460ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: ETN closed at 425.55. 7d 2.8%, 30d 18.1%. RSI 64.9, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "ETN",
  "bars": 260,
  "close": 425.55,
  "change_7d_pct": 2.82,
  "change_30d_pct": 18.13,
  "sma20": 404.9875,
  "sma50": 379.0444,
  "sma200": 362.6931,
  "ema21": 404.6452,
  "rsi14": 64.85,
  "macd": 13.9865,
  "macd_signal": 12.9814,
  "macd_crossover": "positive",
  "bollinger_position": 0.798
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 37.4%, max drawdown -19.6%, 30d return 18.1%.
- **Evidence**:
  - Max drawdown: -19.6%
  - 30d realized volatility: 37.4%
  - Sharpe-like score: 2.63
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3735,
  "realized_vol_90d": 0.3327,
  "max_drawdown_pct": -19.59,
  "atr14": null,
  "change_30d_pct": 18.13,
  "sharpe_like_90d": 2.63,
  "beta": 1.164,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - Distribution Dates and Amounts Announced for Eaton Vance Closed-End Funds
  - VOLT Investors: Here's the One Signal That Predicts Your Returns This Year
  - Eaton Vance Closed-End Funds Release Estimated Sources of Distributions
  - Countdown to Eaton (ETN) Q1 Earnings: A Look at Estimates Beyond Revenue and EPS
  - Should You Invest in the iShares U.S. Power Infrastructure ETF (POWR)?

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "Distribution Dates and Amounts Announced for Eaton Vance Closed-End Funds",
    "VOLT Investors: Here's the One Signal That Predicts Your Returns This Year",
    "Eaton Vance Closed-End Funds Release Estimated Sources of Distributions",
    "Countdown to Eaton (ETN) Q1 Earnings: A Look at Estimates Beyond Revenue and EPS",
    "Should You Invest in the iShares U.S. Power Infrastructure ETF (POWR)?"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.92x, price change -1.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.5M vs avg 2.7M
  - Market cap: 165.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 425.55,
  "change_pct": -1.72,
  "volume": 2474298,
  "avg_volume": 2700708,
  "volume_ratio": 0.92,
  "market_cap": 165107016750,
  "beta": 1.164,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.66,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX 16.89, curve 0.51, HY spread 2.8%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 16.89
  - HY spread: 2.8%

```json
{
  "DFF": {
    "date": "2026-04-30",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-05-01",
    "value": 0.51
  },
  "VIXCLS": {
    "date": "2026-04-30",
    "value": 16.89
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-30",
    "value": 2.83
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: Revenue growth 10.3%, net margin 14.9%, trailing FCF 8.0B.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 10.3%
  - Net cash: -10.5B

```json
{
  "company_name": "Eaton Corporation plc",
  "sector": "Industrials",
  "industry": "Industrial - Machinery",
  "market_cap": 165107016750,
  "revenue_growth_pct": 10.33,
  "gross_margin_pct": 37.59,
  "net_margin_pct": 14.9,
  "trailing_fcf": 7991000000,
  "cash": 622000000,
  "total_debt": 11169000000,
  "net_cash": -10547000000,
  "cfq_score": 4.06,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 4,
    "fcf_margin": 4,
    "capital_intensity": 5,
    "pricing_power": 4.5,
    "balance_sheet": 3,
    "share_count_quality": 4,
    "margin_stability": 4
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 423.75–429.77. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 427.1876, VAH: 429.7662, VAL: 423.7495
  - TPO POC: 427.1876
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-02, bars: 21).

```json
{
  "auction_state": "balance",
  "current_price": 425.55,
  "poc": 427.1876,
  "vah": 429.7662,
  "val": 423.7495,
  "tpo_poc": 427.1876,
  "avwap": null,
  "avwap_anchor": "2026-04-02",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 390,
  "daily_bar_count": 21
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: ETN is not in any configured pair watchlist.

```json
{
  "symbol": "ETN",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for ETN.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "ETN",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "AI Power Defense Stack".

```json
{
  "query": "AI Power Defense Stack",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-05-02
