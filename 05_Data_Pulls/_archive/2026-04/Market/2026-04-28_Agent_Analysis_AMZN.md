---
title: "AMZN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AMZN"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-04-28"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.47
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "amzn"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 47%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 47% confidence. Drivers: price, fundamentals. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 61% | 985ms | AMZN closed at 259.75. 7d 3.7%, 30d 22.7%. RSI 73.8, MACD positive. |
| risk | NEUTRAL | 33% | 1237ms | Risk read: 30d vol 32.9%, max drawdown -21.7%, 30d return 22.7%. |
| sentiment | NEUTRAL | 30% | 1377ms | 20 headline(s): 2 positive, 1 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 1664ms | Volume ratio 0.35x, price change -0.5%, short/float N/A. |
| macro | BULLISH | 36% | 221ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BULLISH | 50% | 2026ms | Revenue growth 12.4%, net margin 10.8%, trailing FCF 7.7B. |
| prediction_market | NEUTRAL | 12% | 444ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 61%
- **Summary**: AMZN closed at 259.75. 7d 3.7%, 30d 22.7%. RSI 73.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "AMZN",
  "bars": 260,
  "close": 259.745,
  "change_7d_pct": 3.67,
  "change_30d_pct": 22.67,
  "sma20": 238.9802,
  "sma50": 221.0905,
  "sma200": 226.772,
  "ema21": 241.9792,
  "rsi14": 73.8,
  "macd": 12.2156,
  "macd_signal": 10.4059,
  "macd_crossover": "positive",
  "bollinger_position": 0.778
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 32.9%, max drawdown -21.7%, 30d return 22.7%.
- **Evidence**:
  - Max drawdown: -21.7%
  - 30d realized volatility: 32.9%
  - Sharpe-like score: 1.56
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3286,
  "realized_vol_90d": 0.307,
  "max_drawdown_pct": -21.74,
  "atr14": null,
  "change_30d_pct": 22.67,
  "sharpe_like_90d": 1.56,
  "beta": 1.383,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 2 positive, 1 negative, net score 1.
- **Evidence**:
  - Will Strong AWS Performance Boost Amazon's Q1 Earnings Report?
  - FDX Aims to Trim Costs Amid Weak Demand: What Lies Ahead?
  - Should You Buy, Sell or Hold Roku Stock Ahead of Q1 Earnings?
  - Amazon Takes a Bite Out of Hims: What Its GLP-1 Entrance Means
  - Amazon Technical: Uptrend And Outperformance Factor Intact Above 231.00 Key Support

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 1,
  "net_score": 1,
  "sample_headlines": [
    "Will Strong AWS Performance Boost Amazon's Q1 Earnings Report?",
    "FDX Aims to Trim Costs Amid Weak Demand: What Lies Ahead?",
    "Should You Buy, Sell or Hold Roku Stock Ahead of Q1 Earnings?",
    "Amazon Takes a Bite Out of Hims: What Its GLP-1 Entrance Means",
    "Amazon Technical: Uptrend And Outperformance Factor Intact Above 231.00 Key Support"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.35x, price change -0.5%, short/float N/A.
- **Evidence**:
  - Volume: 17.9M vs avg 51.5M
  - Market cap: 2.8T
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 259.7765,
  "change_pct": -0.51,
  "volume": 17936242.78304,
  "avg_volume": 51525785,
  "volume_ratio": 0.35,
  "market_cap": 2793701763354,
  "beta": 1.383,
  "short_pct_float": null
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.6%
  - VIX: 18.02
  - HY spread: 2.9%

```json
{
  "DFF": {
    "date": "2026-04-24",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-27",
    "value": 0.57
  },
  "VIXCLS": {
    "date": "2026-04-27",
    "value": 18.02
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-24",
    "value": 2.86
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 50%
- **Summary**: Revenue growth 12.4%, net margin 10.8%, trailing FCF 7.7B.
- **Evidence**:
  - Sector: Consumer Cyclical
  - Revenue growth: 12.4%
  - Net cash: -66.2B

```json
{
  "company_name": "Amazon.com, Inc.",
  "sector": "Consumer Cyclical",
  "industry": "Specialty Retail",
  "market_cap": 2793701763354,
  "revenue_growth_pct": 12.38,
  "gross_margin_pct": 50.29,
  "net_margin_pct": 10.83,
  "trailing_fcf": 7695000000,
  "cash": 86810000000,
  "total_debt": 152987000000,
  "net_cash": -66177000000
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
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-04-28
