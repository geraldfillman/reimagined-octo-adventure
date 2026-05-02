---
title: "BMY Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "BMY"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.36
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.81
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.6
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "bmy"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 36%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 36% confidence. Agent entropy is diffuse (0.81). Drivers: price, fundamentals. Risks: microstructure. 5 neutral layer(s).
- **Top drivers**: price, fundamentals, sentiment
- **Top risks**: microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.81)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 62%, bearish 11%, neutral 27%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.6)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 45% | 267ms | BMY closed at 58.15. 7d -1.1%, 30d 0.1%. RSI 47.1, MACD positive. |
| risk | NEUTRAL | 30% | 271ms | Risk read: 30d vol 30.8%, max drawdown -16.0%, 30d return 0.1%. |
| sentiment | BULLISH | 54% | 389ms | 20 headline(s): 3 positive, 0 negative, net score 4. |
| microstructure | BEARISH | 31% | 336ms | Volume ratio 0.14x, price change -3.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 1306ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 44% | 230ms | Revenue growth -0.2%, net margin 14.6%, trailing FCF 25.0B. |
| auction | NEUTRAL | 22% | 304ms | Auction state: balance. at POC 58.39. Session bars: 27. |
| pair | NEUTRAL | 5% | 13ms | BMY is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 228ms | No recent earnings within 90 days for BMY. |
| prediction_market | NEUTRAL | 12% | 20ms | No relevant prediction markets found for "BMY". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 45%
- **Summary**: BMY closed at 58.15. 7d -1.1%, 30d 0.1%. RSI 47.1, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "BMY",
  "bars": 260,
  "close": 58.15,
  "change_7d_pct": -1.11,
  "change_30d_pct": 0.07,
  "sma20": 58.7435,
  "sma50": 59.5246,
  "sma200": 52.0022,
  "ema21": 58.8459,
  "rsi14": 47.06,
  "macd": -0.1437,
  "macd_signal": -0.1476,
  "macd_crossover": "positive",
  "bollinger_position": 0.315
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: Risk read: 30d vol 30.8%, max drawdown -16.0%, 30d return 0.1%.
- **Evidence**:
  - Max drawdown: -16.0%
  - 30d realized volatility: 30.8%
  - Sharpe-like score: 0.88
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3075,
  "realized_vol_90d": 0.2623,
  "max_drawdown_pct": -15.96,
  "atr14": null,
  "change_30d_pct": 0.07,
  "sharpe_like_90d": 0.88,
  "beta": 0.2729237,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 54%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 4.
- **Evidence**:
  - These 2 Medical Stocks Could Beat Earnings: Why They Should Be on Your Radar
  - Why Bristol Myers Squibb Stock Rocked the Market Today
  - Bristol-Myers Squibb Company (BMY) Q1 2026 Earnings Call Transcript
  - Why Is Bristol-Myers Squibb Stock Trading Higher On Thursday?
  - BMY's Q1 Earnings Top Estimates, Breyanzi, Camzyos Drive Sales

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 4,
  "sample_headlines": [
    "These 2 Medical Stocks Could Beat Earnings: Why They Should Be on Your Radar",
    "Why Bristol Myers Squibb Stock Rocked the Market Today",
    "Bristol-Myers Squibb Company (BMY) Q1 2026 Earnings Call Transcript",
    "Why Is Bristol-Myers Squibb Stock Trading Higher On Thursday?",
    "BMY's Q1 Earnings Top Estimates, Breyanzi, Camzyos Drive Sales"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.14x, price change -3.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.7M vs avg 12.5M
  - Market cap: 119.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.6) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 58.32,
  "change_pct": -3.75,
  "volume": 1711966,
  "avg_volume": 12490785,
  "volume_ratio": 0.14,
  "market_cap": 119074011736,
  "beta": 0.2729237,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.6,
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
- **Confidence**: 44%
- **Summary**: Revenue growth -0.2%, net margin 14.6%, trailing FCF 25.0B.
- **Evidence**:
  - Sector: Healthcare
  - Revenue growth: -0.2%
  - Net cash: -34.9B

```json
{
  "company_name": "Bristol-Myers Squibb Company",
  "sector": "Healthcare",
  "industry": "Drug Manufacturers - General",
  "market_cap": 119074011736,
  "revenue_growth_pct": -0.22,
  "gross_margin_pct": 67.65,
  "net_margin_pct": 14.63,
  "trailing_fcf": 24994000000,
  "cash": 9574000000,
  "total_debt": 44460000000,
  "net_cash": -34886000000,
  "cfq_score": 3.86,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 5,
    "fcf_margin": 4,
    "capital_intensity": 4,
    "pricing_power": 2,
    "balance_sheet": 3,
    "share_count_quality": 4,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 58.39. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 58.3942, VAH: 58.3942, VAL: 58.1581
  - TPO POC: 58.3942
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 58.32,
  "poc": 58.3942,
  "vah": 58.3942,
  "val": 58.1581,
  "tpo_poc": 58.3942,
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
- **Summary**: BMY is not in any configured pair watchlist.

```json
{
  "symbol": "BMY",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for BMY.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "BMY",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "BMY".

```json
{
  "query": "BMY",
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
