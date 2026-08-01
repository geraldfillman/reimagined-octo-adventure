---
title: "STRL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "STRL"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-06-05"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.33
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.8
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.71
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "strl"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 33%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 33% confidence. Agent entropy is diffuse (0.8). Drivers: price, fundamentals. Risks: risk. 5 neutral layer(s).
- **Top drivers**: price, fundamentals, sentiment
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.8)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 65%, bearish 15%, neutral 20%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.71)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 174ms | STRL closed at 869.18. 7d 11.1%, 30d 75.4%. RSI 58.5, MACD positive. |
| risk | BEARISH | 58% | 188ms | Risk read: 30d vol 170.7%, max drawdown -31.0%, 30d return 75.4%. |
| sentiment | BULLISH | 75% | 10326ms | 20 headline(s): 7 positive, 0 negative, net score 7. |
| microstructure | NEUTRAL | 27% | 10328ms | Volume ratio 0.98x, price change -11.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 272ms | Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%. |
| fundamentals | BULLISH | 59% | 266ms | Revenue growth 17.7%, net margin 11.7%, trailing FCF 896.2M. |
| auction | NEUTRAL | 22% | 10330ms | Auction state: balance. inside value 871.02–968.31. Session bars: 329. |
| pair | NEUTRAL | 5% | 6ms | STRL is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 183ms | No recent earnings within 90 days for STRL. |
| prediction_market | NEUTRAL | 12% | 37ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: STRL closed at 869.18. 7d 11.1%, 30d 75.4%. RSI 58.5, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "STRL",
  "bars": 260,
  "close": 869.18,
  "change_7d_pct": 11.13,
  "change_30d_pct": 75.35,
  "sma20": 834.2275,
  "sma50": 629.3754,
  "sma200": 423.8282,
  "ema21": 808.934,
  "rsi14": 58.48,
  "macd": 76.4652,
  "macd_signal": 74.2266,
  "macd_crossover": "positive",
  "bollinger_position": 0.625
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 58%
- **Summary**: Risk read: 30d vol 170.7%, max drawdown -31.0%, 30d return 75.4%.
- **Evidence**:
  - Max drawdown: -31.0%
  - 30d realized volatility: 170.7%
  - Sharpe-like score: 2.6
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 1.7067,
  "realized_vol_90d": 1.1278,
  "max_drawdown_pct": -31.02,
  "atr14": null,
  "change_30d_pct": 75.35,
  "sharpe_like_90d": 2.6,
  "beta": 1.639,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 75%
- **Summary**: 20 headline(s): 7 positive, 0 negative, net score 7.
- **Evidence**:
  - Sterling Infrastructure: The E-Infrastructure Story Has A Long Way To Go
  - Sterling Infrastructure, Inc. (STRL) Is a Trending Stock: Facts to Know Before Betting on It
  - Why Is Sterling Infrastructure (STRL) Up 8.6% Since Last Earnings Report?
  - Sterling Infrastructure (STRL) is on the Move, Here's Why the Trend Could be Sustainable
  - Sterling Infrastructure: Navigating Secular Data Center Tailwinds At A Premium Valuation

```json
{
  "headline_count": 20,
  "positive_count": 7,
  "negative_count": 0,
  "net_score": 7,
  "sample_headlines": [
    "Sterling Infrastructure: The E-Infrastructure Story Has A Long Way To Go",
    "Sterling Infrastructure, Inc. (STRL) Is a Trending Stock: Facts to Know Before Betting on It",
    "Why Is Sterling Infrastructure (STRL) Up 8.6% Since Last Earnings Report?",
    "Sterling Infrastructure (STRL) is on the Move, Here's Why the Trend Could be Sustainable",
    "Sterling Infrastructure: Navigating Secular Data Center Tailwinds At A Premium Valuation"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 27%
- **Summary**: Volume ratio 0.98x, price change -11.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 566.0K vs avg 577.1K
  - Market cap: 26.9B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.71) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 877.155,
  "change_pct": -11.73,
  "volume": 565975.6763,
  "avg_volume": 577144,
  "volume_ratio": 0.98,
  "market_cap": 26916337981,
  "beta": 1.639,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.71,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.4%
  - VIX: 15.40
  - HY spread: 2.7%

```json
{
  "DFF": {
    "date": "2026-06-03",
    "value": 3.62
  },
  "T10Y2Y": {
    "date": "2026-06-04",
    "value": 0.42
  },
  "VIXCLS": {
    "date": "2026-06-04",
    "value": 15.4
  },
  "BAMLH0A0HYM2": {
    "date": "2026-06-04",
    "value": 2.74
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 59%
- **Summary**: Revenue growth 17.7%, net margin 11.7%, trailing FCF 896.2M.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 17.7%
  - Net cash: 169.7M

```json
{
  "company_name": "Sterling Infrastructure, Inc.",
  "sector": "Industrials",
  "industry": "Engineering & Construction",
  "market_cap": 26916337981,
  "revenue_growth_pct": 17.69,
  "gross_margin_pct": 22.98,
  "net_margin_pct": 11.65,
  "trailing_fcf": 896197000,
  "cash": 511858000,
  "total_debt": 342186000,
  "net_cash": 169672000,
  "cfq_score": 4.03,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 5,
    "fcf_margin": 4,
    "capital_intensity": 4,
    "pricing_power": 3.5,
    "balance_sheet": 5,
    "share_count_quality": 3,
    "margin_stability": 2.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 871.02–968.31. Session bars: 329.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 900.3885, VAH: 968.3098, VAL: 871.0171
  - TPO POC: 920.5813
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-06, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 877.155,
  "poc": 900.3885,
  "vah": 968.3098,
  "val": 871.0171,
  "tpo_poc": 920.5813,
  "avwap": null,
  "avwap_anchor": "2026-05-06",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-06-05",
  "session_bar_count": 329,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: STRL is not in any configured pair watchlist.

```json
{
  "symbol": "STRL",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for STRL.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "STRL",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "AI Power Infrastructure".

```json
{
  "query": "AI Power Infrastructure",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-06-05
