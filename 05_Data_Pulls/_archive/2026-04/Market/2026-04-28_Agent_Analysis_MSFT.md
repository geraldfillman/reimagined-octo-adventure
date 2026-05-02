---
title: "MSFT Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "MSFT"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-04-28"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.21
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "msft"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 21%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 21% confidence. Drivers: fundamentals, sentiment. Risks: risk. 3 neutral layer(s).
- **Top drivers**: fundamentals, sentiment, macro
- **Top risks**: risk

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 33% | 35ms | MSFT closed at 426.46. 7d 0.9%, 30d 6.6%. RSI 64.2, MACD positive. |
| risk | BEARISH | 61% | 265ms | Risk read: 30d vol 29.9%, max drawdown -34.2%, 30d return 6.6%. |
| sentiment | BULLISH | 62% | 390ms | 20 headline(s): 4 positive, 0 negative, net score 5. |
| microstructure | NEUTRAL | 24% | 696ms | Volume ratio 0.28x, price change 0.3%, short/float N/A. |
| macro | BULLISH | 36% | 174ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BULLISH | 50% | 1060ms | Revenue growth 14.9%, net margin 36.1%, trailing FCF 77.4B. |
| prediction_market | NEUTRAL | 12% | 507ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: MSFT closed at 426.46. 7d 0.9%, 30d 6.6%. RSI 64.2, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "MSFT",
  "bars": 260,
  "close": 426.465,
  "change_7d_pct": 0.87,
  "change_30d_pct": 6.63,
  "sma20": 398.7498,
  "sma50": 395.0195,
  "sma200": 469.3276,
  "ema21": 406.5054,
  "rsi14": 64.24,
  "macd": 10.5728,
  "macd_signal": 6.6986,
  "macd_crossover": "positive",
  "bollinger_position": 0.786
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 29.9%, max drawdown -34.2%, 30d return 6.6%.
- **Evidence**:
  - Max drawdown: -34.2%
  - 30d realized volatility: 29.9%
  - Sharpe-like score: -0.83
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2994,
  "realized_vol_90d": 0.3119,
  "max_drawdown_pct": -34.18,
  "atr14": null,
  "change_30d_pct": 6.63,
  "sharpe_like_90d": -0.83,
  "beta": 1.107,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 62%
- **Summary**: 20 headline(s): 4 positive, 0 negative, net score 5.
- **Evidence**:
  - Microsoft has conceded more ground to OpenAI in win for Amazon, says UBS
  - Will Strong AWS Performance Boost Amazon's Q1 Earnings Report?
  - Azure Drives Microsoft's AI Strategy: Wait for Q3 Before Buying
  - Wall Street analyst updates Microsoft (MSFT) stock price target
  - Microsoft's AI Moat Holds up Even After the OpenAI Reset

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 0,
  "net_score": 5,
  "sample_headlines": [
    "Microsoft has conceded more ground to OpenAI in win for Amazon, says UBS",
    "Will Strong AWS Performance Boost Amazon's Q1 Earnings Report?",
    "Azure Drives Microsoft's AI Strategy: Wait for Q3 Before Buying",
    "Wall Street analyst updates Microsoft (MSFT) stock price target",
    "Microsoft's AI Moat Holds up Even After the OpenAI Reset"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.28x, price change 0.3%, short/float N/A.
- **Evidence**:
  - Volume: 10.6M vs avg 37.8M
  - Market cap: 3.2T
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 426.11,
  "change_pct": 0.3,
  "volume": 10632093,
  "avg_volume": 37823058,
  "volume_ratio": 0.28,
  "market_cap": 3164135199300,
  "beta": 1.107,
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
- **Summary**: Revenue growth 14.9%, net margin 36.1%, trailing FCF 77.4B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 14.9%
  - Net cash: -99.0B

```json
{
  "company_name": "Microsoft Corporation",
  "sector": "Technology",
  "industry": "Software - Infrastructure",
  "market_cap": 3164209455600,
  "revenue_growth_pct": 14.93,
  "gross_margin_pct": 68.82,
  "net_margin_pct": 36.15,
  "trailing_fcf": 77412000000,
  "cash": 24296000000,
  "total_debt": 123278000000,
  "net_cash": -98982000000
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
