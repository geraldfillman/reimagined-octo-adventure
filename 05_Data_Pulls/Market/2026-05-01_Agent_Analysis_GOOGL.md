---
title: "GOOGL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GOOGL"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.47
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.58
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.61
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "googl"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 47%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 47% confidence. Agent entropy is mixed (0.58). Drivers: price, fundamentals. 6 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.58)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 67%, bearish 0%, neutral 33%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.61)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 73% | 202ms | GOOGL closed at 379.79. 7d 11.9%, 30d 23.7%. RSI 77.7, MACD positive. |
| risk | NEUTRAL | 33% | 198ms | Risk read: 30d vol 42.3%, max drawdown -20.4%, 30d return 23.7%. |
| sentiment | BULLISH | 46% | 281ms | 20 headline(s): 3 positive, 0 negative, net score 3. |
| microstructure | NEUTRAL | 24% | 382ms | Volume ratio 0.18x, price change -0.3%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 250ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 55% | 155ms | Revenue growth 15.1%, net margin 32.8%, trailing FCF 148.1B. |
| auction | NEUTRAL | 22% | 595ms | Auction state: balance. above VAH 382.19. Session bars: 27. |
| pair | NEUTRAL | 5% | 11ms | GOOGL is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 140ms | No recent earnings within 90 days for GOOGL. |
| prediction_market | NEUTRAL | 12% | 20ms | No relevant prediction markets found for "GOOGL". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 73%
- **Summary**: GOOGL closed at 379.79. 7d 11.9%, 30d 23.7%. RSI 77.7, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "GOOGL",
  "bars": 260,
  "close": 379.79,
  "change_7d_pct": 11.93,
  "change_30d_pct": 23.66,
  "sma20": 336.7255,
  "sma50": 315.3938,
  "sma200": 281.1033,
  "ema21": 339.3528,
  "rsi14": 77.69,
  "macd": 16.1373,
  "macd_signal": 11.6926,
  "macd_crossover": "positive",
  "bollinger_position": 1.023
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 42.3%, max drawdown -20.4%, 30d return 23.7%.
- **Evidence**:
  - Max drawdown: -20.4%
  - 30d realized volatility: 42.3%
  - Sharpe-like score: 2.12
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.423,
  "realized_vol_90d": 0.3015,
  "max_drawdown_pct": -20.42,
  "atr14": null,
  "change_30d_pct": 23.66,
  "sharpe_like_90d": 2.12,
  "beta": 1.128,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 3.
- **Evidence**:
  - Nasdaq Composite Takes Off as Tech Bulls Retake Control on Strong Earnings, M&A
  - Meta, Microsoft, or Alphabet: Which Magnificent 7 Stock Dominated in April?
  - Google, SpaceX and OpenAI are being tapped to make the U.S. an ‘AI-first fighting force'
  - Forget MSFT: Google Search Revenue is Up 19% Despite ‘Nearly Monopoly-Like Market Share'
  - Rosen: GOOGL $5T Target, AAPL's AI Hardware Strategy

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 3,
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
- **Summary**: Volume ratio 0.18x, price change -0.3%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 5.9M vs avg 33.0M
  - Market cap: 4.6T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.61) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 383.61,
  "change_pct": -0.31,
  "volume": 5910641,
  "avg_volume": 32977985,
  "volume_ratio": 0.18,
  "market_cap": 4640748147943,
  "beta": 1.128,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.61,
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
  "market_cap": 4640748147943,
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
- **Summary**: Auction state: balance. above VAH 382.19. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 382.1864, VAH: 382.1864, VAL: 379.8979
  - TPO POC: 382.1864
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 383.61,
  "poc": 382.1864,
  "vah": 382.1864,
  "val": 379.8979,
  "tpo_poc": 382.1864,
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
- **Summary**: GOOGL is not in any configured pair watchlist.

```json
{
  "symbol": "GOOGL",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for GOOGL.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "GOOGL",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "GOOGL".

```json
{
  "query": "GOOGL",
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
