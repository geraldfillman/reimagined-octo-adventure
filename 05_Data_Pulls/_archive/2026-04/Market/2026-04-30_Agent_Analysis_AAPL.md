---
title: "AAPL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AAPL"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.55
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.53
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.64
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "aapl"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 55%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 55% confidence. Agent entropy is mixed (0.53). Drivers: price, sentiment. 3 neutral layer(s).
- **Top drivers**: price, sentiment, fundamentals
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.53)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 73%, bearish 0%, neutral 27%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.64)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 75% | 280ms | AAPL closed at 270.22. 7d -1.0%, 30d 6.3%. RSI 57.6, MACD positive. |
| risk | NEUTRAL | 36% | 293ms | Risk read: 30d vol 22.8%, max drawdown -13.8%, 30d return 6.3%. |
| sentiment | BULLISH | 54% | 432ms | 12 headline(s): 3 positive, 1 negative, net score 4. |
| microstructure | NEUTRAL | 24% | 428ms | Volume ratio 0.54x, price change -0.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 397ms | Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%. |
| fundamentals | BULLISH | 39% | 243ms | Revenue growth 6.4%, net margin 26.9%, trailing FCF 123.3B. |
| prediction_market | NEUTRAL | 12% | 728ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 75%
- **Summary**: AAPL closed at 270.22. 7d -1.0%, 30d 6.3%. RSI 57.6, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "AAPL",
  "bars": 260,
  "close": 270.22,
  "change_7d_pct": -1.04,
  "change_30d_pct": 6.29,
  "sma20": 264.3645,
  "sma50": 260.6884,
  "sma200": 254.5225,
  "ema21": 265.2567,
  "rsi14": 57.6,
  "macd": 3.7159,
  "macd_signal": 3.1042,
  "macd_crossover": "positive",
  "bollinger_position": 0.728
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 36%
- **Summary**: Risk read: 30d vol 22.8%, max drawdown -13.8%, 30d return 6.3%.
- **Evidence**:
  - Max drawdown: -13.8%
  - 30d realized volatility: 22.8%
  - Sharpe-like score: 0.05
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2279,
  "realized_vol_90d": 0.2352,
  "max_drawdown_pct": -13.82,
  "atr14": null,
  "change_30d_pct": 6.29,
  "sharpe_like_90d": 0.05,
  "beta": 1.109,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 54%
- **Summary**: 12 headline(s): 3 positive, 1 negative, net score 4.
- **Evidence**:
  - S&P 500 Rides Tech Earnings Wave Despite Inflation Warning Shot
  - Apple Earnings Are Imminent; These Most Accurate Analysts Revise Forecasts Ahead Of Earnings Call
  - Should iShares S&P 500 Value ETF (IVE) Be on Your Investing Radar?
  - SOXX vs. XLK: The Right Pick Depends on What You Already Own
  - Apple Reportedly Plans Major Camera AI Overhaul in iOS 27

```json
{
  "headline_count": 12,
  "positive_count": 3,
  "negative_count": 1,
  "net_score": 4,
  "sample_headlines": [
    "S&P 500 Rides Tech Earnings Wave Despite Inflation Warning Shot",
    "Apple Earnings Are Imminent; These Most Accurate Analysts Revise Forecasts Ahead Of Earnings Call",
    "Should iShares S&P 500 Value ETF (IVE) Be on Your Investing Radar?",
    "SOXX vs. XLK: The Right Pick Depends on What You Already Own",
    "Apple Reportedly Plans Major Camera AI Overhaul in iOS 27"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.54x, price change -0.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 24.1M vs avg 44.3M
  - Market cap: 4.0T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.64) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 270.17,
  "change_pct": -0.2,
  "volume": 24117049,
  "avg_volume": 44334911,
  "volume_ratio": 0.54,
  "market_cap": 3966403593800,
  "beta": 1.109,
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
- **Confidence**: 31%
- **Summary**: Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 17.83
  - HY spread: 2.9%

```json
{
  "DFF": {
    "date": "2026-04-28",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-29",
    "value": 0.5
  },
  "VIXCLS": {
    "date": "2026-04-28",
    "value": 17.83
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-28",
    "value": 2.85
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 39%
- **Summary**: Revenue growth 6.4%, net margin 26.9%, trailing FCF 123.3B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 6.4%
  - Net cash: -45.2B

```json
{
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "market_cap": 3966403593800,
  "revenue_growth_pct": 6.43,
  "gross_margin_pct": 46.91,
  "net_margin_pct": 26.92,
  "trailing_fcf": 123324000000,
  "cash": 45317000000,
  "total_debt": 90509000000,
  "net_cash": -45192000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Buffett Style Quality Compounders".

```json
{
  "query": "Buffett Style Quality Compounders",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-04-30
