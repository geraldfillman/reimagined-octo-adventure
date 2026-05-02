---
title: "META Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "META"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.23
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.99
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.64
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "meta"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 23%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 23% confidence. Agent entropy is diffuse (0.99). Drivers: fundamentals, macro. Risks: price, risk. 6 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: price, risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.99)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 28%, bearish 41%, neutral 31%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.64)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 79% | 285ms | META closed at 611.96. 7d -9.3%, 30d 0.9%. RSI 41.4, MACD negative. |
| risk | BEARISH | 54% | 297ms | Risk read: 30d vol 50.9%, max drawdown -33.5%, 30d return 0.9%. |
| sentiment | NEUTRAL | 30% | 452ms | 20 headline(s): 3 positive, 2 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 441ms | Volume ratio 0.20x, price change 0.1%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 291ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 55% | 252ms | Revenue growth 22.2%, net margin 30.1%, trailing FCF 100.6B. |
| auction | NEUTRAL | 22% | 392ms | Auction state: balance. at POC 612.69. Session bars: 27. |
| pair | NEUTRAL | 5% | 11ms | META is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 249ms | No recent earnings within 90 days for META. |
| prediction_market | NEUTRAL | 12% | 18ms | No relevant prediction markets found for "META". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 79%
- **Summary**: META closed at 611.96. 7d -9.3%, 30d 0.9%. RSI 41.4, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "META",
  "bars": 260,
  "close": 611.96,
  "change_7d_pct": -9.3,
  "change_30d_pct": 0.87,
  "sma20": 647.218,
  "sma50": 630.3788,
  "sma200": 678.297,
  "ema21": 643.6197,
  "rsi14": 41.41,
  "macd": 7.0225,
  "macd_signal": 12.1424,
  "macd_crossover": "negative",
  "bollinger_position": 0.242
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 54%
- **Summary**: Risk read: 30d vol 50.9%, max drawdown -33.5%, 30d return 0.9%.
- **Evidence**:
  - Max drawdown: -33.5%
  - 30d realized volatility: 50.9%
  - Sharpe-like score: -0.3
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5094,
  "realized_vol_90d": 0.4085,
  "max_drawdown_pct": -33.45,
  "atr14": null,
  "change_30d_pct": 0.87,
  "sharpe_like_90d": -0.3,
  "beta": 1.309,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 3 positive, 2 negative, net score 1.
- **Evidence**:
  - Nasdaq Composite Takes Off as Tech Bulls Retake Control on Strong Earnings, M&A
  - Meta, Microsoft, or Alphabet: Which Magnificent 7 Stock Dominated in April?
  - Meta Stock Just Dropped 9%: Is This the Dip to Buy?
  - Meta Platforms: What You Buy For AI Technology Growth
  - Hyperscalers Hit $700 Billion in 2026 AI Spending Plans

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 2,
  "net_score": 1,
  "sample_headlines": [
    "Nasdaq Composite Takes Off as Tech Bulls Retake Control on Strong Earnings, M&A",
    "Meta, Microsoft, or Alphabet: Which Magnificent 7 Stock Dominated in April?",
    "Meta Stock Just Dropped 9%: Is This the Dip to Buy?",
    "Meta Platforms: What You Buy For AI Technology Growth",
    "Hyperscalers Hit $700 Billion in 2026 AI Spending Plans"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.20x, price change 0.1%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 3.0M vs avg 15.3M
  - Market cap: 1.6T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.64) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 612.76,
  "change_pct": 0.14,
  "volume": 3048011,
  "avg_volume": 15272064,
  "volume_ratio": 0.2,
  "market_cap": 1552748687175,
  "beta": 1.309,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.64,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 16.89
  - HY spread: 2.8%

```json
{
  "DFF": {
    "date": "2026-04-29",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-30",
    "value": 0.52
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
- **Confidence**: 55%
- **Summary**: Revenue growth 22.2%, net margin 30.1%, trailing FCF 100.6B.
- **Evidence**:
  - Sector: Communication Services
  - Revenue growth: 22.2%
  - Net cash: -63.3B

```json
{
  "company_name": "Meta Platforms, Inc.",
  "sector": "Communication Services",
  "industry": "Internet Content & Information",
  "market_cap": 1552748687175,
  "revenue_growth_pct": 22.17,
  "gross_margin_pct": 82,
  "net_margin_pct": 30.08,
  "trailing_fcf": 100564000000,
  "cash": 23426000000,
  "total_debt": 86769000000,
  "net_cash": -63343000000,
  "cfq_score": 3.63,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 3,
    "fcf_margin": 4,
    "capital_intensity": 0,
    "pricing_power": 5,
    "balance_sheet": 4,
    "share_count_quality": 5,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 612.69. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 612.687, VAH: 613.9154, VAL: 611.4585
  - TPO POC: 612.687
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 612.76,
  "poc": 612.687,
  "vah": 613.9154,
  "val": 611.4585,
  "tpo_poc": 612.687,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 27,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: META is not in any configured pair watchlist.

```json
{
  "symbol": "META",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for META.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "META",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "META".

```json
{
  "query": "META",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-05-01
