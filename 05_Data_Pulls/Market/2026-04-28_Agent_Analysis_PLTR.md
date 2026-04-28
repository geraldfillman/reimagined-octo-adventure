---
title: "PLTR Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "PLTR"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-04-28"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.24
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "pltr"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 24%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 24% confidence. Drivers: fundamentals, macro. Risks: risk, price. 3 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 60% | 46ms | PLTR closed at 141.38. 7d -3.4%, 30d -7.4%. RSI 47, MACD positive. |
| risk | BEARISH | 61% | 1250ms | Risk read: 30d vol 57.0%, max drawdown -38.2%, 30d return -7.4%. |
| sentiment | NEUTRAL | 30% | 1379ms | 20 headline(s): 2 positive, 2 negative, net score -1. |
| microstructure | NEUTRAL | 24% | 1685ms | Volume ratio 0.23x, price change -1.3%, short/float N/A. |
| macro | BULLISH | 36% | 1238ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BULLISH | 60% | 2026ms | Revenue growth 56.2%, net margin 36.3%, trailing FCF 2.1B. |
| prediction_market | NEUTRAL | 12% | 540ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 60%
- **Summary**: PLTR closed at 141.38. 7d -3.4%, 30d -7.4%. RSI 47, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "PLTR",
  "bars": 260,
  "close": 141.3843,
  "change_7d_pct": -3.42,
  "change_30d_pct": -7.42,
  "sma20": 142.5767,
  "sma50": 144.8307,
  "sma200": 164.4337,
  "ema21": 143.7755,
  "rsi14": 46.98,
  "macd": -0.8703,
  "macd_signal": -1.2472,
  "macd_crossover": "positive",
  "bollinger_position": 0.453
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 57.0%, max drawdown -38.2%, 30d return -7.4%.
- **Evidence**:
  - Max drawdown: -38.2%
  - 30d realized volatility: 57.0%
  - Sharpe-like score: -1.19
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5697,
  "realized_vol_90d": 0.5409,
  "max_drawdown_pct": -38.19,
  "atr14": null,
  "change_30d_pct": -7.42,
  "sharpe_like_90d": -1.19,
  "beta": 1.674,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 2 positive, 2 negative, net score -1.
- **Evidence**:
  - Citi Cuts Palantir Price Target to $210: Is the AI Software Multiple Compression Catching Up?
  - Wall Street sets Palantir stock price for the next 12 months
  - Here is What to Know Beyond Why Palantir Technologies Inc. (PLTR) is a Trending Stock
  - Michael Burry Thinks Tech Stocks are Pricier Than They Seem. Is the Value Case Just an Illusion?
  - If Palantir Keeps Proving the Skeptics Wrong, PTIR Could Go Vertical Again

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 2,
  "net_score": -1,
  "sample_headlines": [
    "Citi Cuts Palantir Price Target to $210: Is the AI Software Multiple Compression Catching Up?",
    "Wall Street sets Palantir stock price for the next 12 months",
    "Here is What to Know Beyond Why Palantir Technologies Inc. (PLTR) is a Trending Stock",
    "Michael Burry Thinks Tech Stocks are Pricier Than They Seem. Is the Value Case Just an Illusion?",
    "If Palantir Keeps Proving the Skeptics Wrong, PTIR Could Go Vertical Again"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.23x, price change -1.3%, short/float N/A.
- **Evidence**:
  - Volume: 12.3M vs avg 53.4M
  - Market cap: 323.6B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 141.2,
  "change_pct": -1.33,
  "volume": 12331317,
  "avg_volume": 53441050,
  "volume_ratio": 0.23,
  "market_cap": 323555564000,
  "beta": 1.674,
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
- **Confidence**: 60%
- **Summary**: Revenue growth 56.2%, net margin 36.3%, trailing FCF 2.1B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 56.2%
  - Net cash: 1.2B

```json
{
  "company_name": "Palantir Technologies Inc.",
  "sector": "Technology",
  "industry": "Software - Infrastructure",
  "market_cap": 323555564000,
  "revenue_growth_pct": 56.18,
  "gross_margin_pct": 82.37,
  "net_margin_pct": 36.31,
  "trailing_fcf": 2101590999,
  "cash": 1423796000,
  "total_debt": 229338000,
  "net_cash": 1194458000
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
