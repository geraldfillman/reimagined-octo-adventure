---
title: "CAH Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "CAH"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.24
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.91
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "cah"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 24%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 24% confidence. Agent entropy is diffuse (0.91). Drivers: fundamentals, macro. Risks: price. 6 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.91)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 46%, bearish 14%, neutral 40%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 204ms | CAH closed at 195.2. 7d -2.7%, 30d -7.5%. RSI 35.4, MACD negative. |
| risk | NEUTRAL | 30% | 210ms | Risk read: 30d vol 25.3%, max drawdown -16.1%, 30d return -7.5%. |
| sentiment | BULLISH | 46% | 302ms | 20 headline(s): 4 positive, 1 negative, net score 3. |
| microstructure | NEUTRAL | 24% | 326ms | Volume ratio 0.10x, price change 1.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 251ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 37% | 293ms | Revenue growth -1.9%, net margin 0.7%, trailing FCF 6.8B. |
| auction | NEUTRAL | 22% | 290ms | Auction state: balance. at POC 195.86. Session bars: 27. |
| pair | NEUTRAL | 5% | 11ms | CAH is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 165ms | No recent earnings within 90 days for CAH. |
| prediction_market | NEUTRAL | 12% | 20ms | No relevant prediction markets found for "CAH". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: CAH closed at 195.2. 7d -2.7%, 30d -7.5%. RSI 35.4, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "CAH",
  "bars": 260,
  "close": 195.2,
  "change_7d_pct": -2.67,
  "change_30d_pct": -7.45,
  "sma20": 207.9985,
  "sma50": 213.3868,
  "sma200": 189.2897,
  "ema21": 205.8446,
  "rsi14": 35.35,
  "macd": -4.293,
  "macd_signal": -2.9493,
  "macd_crossover": "negative",
  "bollinger_position": 0.044
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: Risk read: 30d vol 25.3%, max drawdown -16.1%, 30d return -7.5%.
- **Evidence**:
  - Max drawdown: -16.1%
  - 30d realized volatility: 25.3%
  - Sharpe-like score: -0.22
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2535,
  "realized_vol_90d": 0.2991,
  "max_drawdown_pct": -16.1,
  "atr14": null,
  "change_30d_pct": -7.45,
  "sharpe_like_90d": -0.22,
  "beta": 0.65,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 4 positive, 1 negative, net score 3.
- **Evidence**:
  - Cardinal Health, Inc. (CAH) Q3 2026 Earnings Call Transcript
  - CAH Gains on Q3 Earnings Beat, '26 EPS View Up Despite Revenue Miss
  - Cardinal (CAH) Q3 Earnings: How Key Metrics Compare to Wall Street Estimates
  - Cardinal Health (CAH) Q3 Earnings Beat Estimates
  - Cardinal Health Rises. A Guidance Hike Powers the Stock Past These Weak Points.

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 1,
  "net_score": 3,
  "sample_headlines": [
    "Cardinal Health, Inc. (CAH) Q3 2026 Earnings Call Transcript",
    "CAH Gains on Q3 Earnings Beat, '26 EPS View Up Despite Revenue Miss",
    "Cardinal (CAH) Q3 Earnings: How Key Metrics Compare to Wall Street Estimates",
    "Cardinal Health (CAH) Q3 Earnings Beat Estimates",
    "Cardinal Health Rises. A Guidance Hike Powers the Stock Past These Weak Points."
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.10x, price change 1.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 180.8K vs avg 1.8M
  - Market cap: 46.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 195.735,
  "change_pct": 1.48,
  "volume": 180824,
  "avg_volume": 1764830,
  "volume_ratio": 0.1,
  "market_cap": 46059580392,
  "beta": 0.65,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.67,
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
- **Confidence**: 37%
- **Summary**: Revenue growth -1.9%, net margin 0.7%, trailing FCF 6.8B.
- **Evidence**:
  - Sector: Healthcare
  - Revenue growth: -1.9%
  - Net cash: -5.0B

```json
{
  "company_name": "Cardinal Health, Inc.",
  "sector": "Healthcare",
  "industry": "Medical - Distribution",
  "market_cap": 46059580392,
  "revenue_growth_pct": -1.87,
  "gross_margin_pct": 3.67,
  "net_margin_pct": 0.7,
  "trailing_fcf": 6831000000,
  "cash": 3937000000,
  "total_debt": 8916000000,
  "net_cash": -4979000000,
  "cfq_score": 3.55,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 3,
    "fcf_conversion": 5,
    "fcf_margin": 1,
    "capital_intensity": 5,
    "pricing_power": 3.5,
    "balance_sheet": 3,
    "share_count_quality": 5,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 195.86. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 195.8632, VAH: 195.8632, VAL: 195.0816
  - TPO POC: 195.4724
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 195.735,
  "poc": 195.8632,
  "vah": 195.8632,
  "val": 195.0816,
  "tpo_poc": 195.4724,
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
- **Summary**: CAH is not in any configured pair watchlist.

```json
{
  "symbol": "CAH",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for CAH.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "CAH",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "CAH".

```json
{
  "query": "CAH",
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
