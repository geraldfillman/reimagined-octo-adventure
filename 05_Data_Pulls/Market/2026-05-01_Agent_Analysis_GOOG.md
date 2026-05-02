---
title: "GOOG Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GOOG"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
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
microstructure_entropy_score: 0.58
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "goog"]
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
- **Microstructure entropy**: mixed (0.58)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 73% | 209ms | GOOG closed at 376.46. 7d 11.5%, 30d 23.1%. RSI 77.3, MACD positive. |
| risk | NEUTRAL | 33% | 194ms | Risk read: 30d vol 41.2%, max drawdown -20.8%, 30d return 23.1%. |
| sentiment | NEUTRAL | 30% | 296ms | 20 headline(s): 2 positive, 1 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 342ms | Volume ratio 0.33x, price change -0.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 1335ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 55% | 159ms | Revenue growth 15.1%, net margin 32.8%, trailing FCF 148.1B. |
| auction | NEUTRAL | 22% | 314ms | Auction state: balance. above VAH 379.17. Session bars: 28. |
| pair | NEUTRAL | 5% | 12ms | GOOG is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 156ms | No recent earnings within 90 days for GOOG. |
| prediction_market | NEUTRAL | 21% | 20ms | 1 prediction market(s) matched "GOOG". Top venue: Agent Analyst. |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 73%
- **Summary**: GOOG closed at 376.46. 7d 11.5%, 30d 23.1%. RSI 77.3, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "GOOG",
  "bars": 260,
  "close": 376.4632,
  "change_7d_pct": 11.47,
  "change_30d_pct": 23.14,
  "sma20": 334.5127,
  "sma50": 314.0861,
  "sma200": 281.2624,
  "ema21": 337.2449,
  "rsi14": 77.3,
  "macd": 15.7593,
  "macd_signal": 11.3759,
  "macd_crossover": "positive",
  "bollinger_position": 1.015
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 41.2%, max drawdown -20.8%, 30d return 23.1%.
- **Evidence**:
  - Max drawdown: -20.8%
  - 30d realized volatility: 41.2%
  - Sharpe-like score: 2.03
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4118,
  "realized_vol_90d": 0.2956,
  "max_drawdown_pct": -20.81,
  "atr14": null,
  "change_30d_pct": 23.14,
  "sharpe_like_90d": 2.03,
  "beta": 1.128,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 2 positive, 1 negative, net score 1.
- **Evidence**:
  - Nasdaq Composite Takes Off as Tech Bulls Retake Control on Strong Earnings, M&A
  - Meta, Microsoft, or Alphabet: Which Magnificent 7 Stock Dominated in April?
  - Google, SpaceX and OpenAI are being tapped to make the U.S. an ‘AI-first fighting force'
  - Forget MSFT: Google Search Revenue is Up 19% Despite ‘Nearly Monopoly-Like Market Share'
  - Rosen: GOOGL $5T Target, AAPL's AI Hardware Strategy

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 1,
  "net_score": 1,
  "sample_headlines": [
    "Nasdaq Composite Takes Off as Tech Bulls Retake Control on Strong Earnings, M&A",
    "Meta, Microsoft, or Alphabet: Which Magnificent 7 Stock Dominated in April?",
    "Google, SpaceX and OpenAI are being tapped to make the U.S. an ‘AI-first fighting force'",
    "Forget MSFT: Google Search Revenue is Up 19% Despite ‘Nearly Monopoly-Like Market Share'",
    "Rosen: GOOGL $5T Target, AAPL's AI Hardware Strategy"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.33x, price change -0.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 7.1M vs avg 21.2M
  - Market cap: 4.6T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.58) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 380.07,
  "change_pct": -0.49,
  "volume": 7096236,
  "avg_volume": 21201948,
  "volume_ratio": 0.33,
  "market_cap": 4597706978895,
  "beta": 1.128,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.58,
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
- **Summary**: Revenue growth 15.1%, net margin 32.8%, trailing FCF 148.1B.
- **Evidence**:
  - Sector: Communication Services
  - Revenue growth: 15.1%
  - Net cash: -52.4B

```json
{
  "company_name": "Alphabet Inc.",
  "sector": "Communication Services",
  "industry": "Internet Content & Information",
  "market_cap": 4597706978895,
  "revenue_growth_pct": 15.13,
  "gross_margin_pct": 59.67,
  "net_margin_pct": 32.8,
  "trailing_fcf": 148147000000,
  "cash": 38063000000,
  "total_debt": 90484000000,
  "net_cash": -52421000000,
  "cfq_score": 3.71,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 2,
    "fcf_margin": 4,
    "capital_intensity": 1,
    "pricing_power": 5,
    "balance_sheet": 4,
    "share_count_quality": 5,
    "margin_stability": 4.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. above VAH 379.17. Session bars: 28.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 377.6635, VAH: 379.1749, VAL: 376.9078
  - TPO POC: 378.4192
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 380.07,
  "poc": 377.6635,
  "vah": 379.1749,
  "val": 376.9078,
  "tpo_poc": 378.4192,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 28,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: GOOG is not in any configured pair watchlist.

```json
{
  "symbol": "GOOG",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for GOOG.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "GOOG",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 21%
- **Summary**: 1 prediction market(s) matched "GOOG". Top venue: Agent Analyst.
- **Evidence**:
  - Agent Analyst: GOOGL Agent Analysis (N/A)
- **Warnings**:
  - Live prediction-market APIs were disabled; local notes only.

```json
{
  "query": "GOOG",
  "live_enabled": false,
  "market_count": 1,
  "markets": [
    {
      "venue": "Agent Analyst",
      "title": "GOOGL Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    }
  ]
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-05-01
