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
final_confidence: 0.19
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "msft"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 19%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 19% confidence. Drivers: fundamentals, macro. Risks: risk. 3 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 33% | 36ms | MSFT closed at 425.98. 7d 0.8%, 30d 6.5%. RSI 64, MACD positive. |
| risk | BEARISH | 61% | 286ms | Risk read: 30d vol 29.9%, max drawdown -34.2%, 30d return 6.5%. |
| sentiment | BULLISH | 46% | 411ms | 20 headline(s): 2 positive, 0 negative, net score 3. |
| microstructure | NEUTRAL | 24% | 724ms | Volume ratio 0.24x, price change 0.2%, short/float N/A. |
| macro | BULLISH | 36% | 180ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BULLISH | 50% | 2001ms | Revenue growth 14.9%, net margin 36.1%, trailing FCF 77.4B. |
| prediction_market | NEUTRAL | 12% | 483ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: MSFT closed at 425.98. 7d 0.8%, 30d 6.5%. RSI 64, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "MSFT",
  "bars": 260,
  "close": 425.98,
  "change_7d_pct": 0.75,
  "change_30d_pct": 6.51,
  "sma20": 398.7255,
  "sma50": 395.0098,
  "sma200": 469.3252,
  "ema21": 406.4613,
  "rsi14": 64.04,
  "macd": 10.5341,
  "macd_signal": 6.6909,
  "macd_crossover": "positive",
  "bollinger_position": 0.781
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 29.9%, max drawdown -34.2%, 30d return 6.5%.
- **Evidence**:
  - Max drawdown: -34.2%
  - 30d realized volatility: 29.9%
  - Sharpe-like score: -0.84
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2993,
  "realized_vol_90d": 0.3119,
  "max_drawdown_pct": -34.18,
  "atr14": null,
  "change_30d_pct": 6.51,
  "sharpe_like_90d": -0.84,
  "beta": 1.107,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 2 positive, 0 negative, net score 3.
- **Evidence**:
  - Wall Street analyst updates Microsoft (MSFT) stock price target
  - Microsoft's AI Moat Holds up Even After the OpenAI Reset
  - Earnings Growth & Price Strength Make Microsoft (MSFT) a Stock to Watch
  - Commvault Systems (CVLT) Beats Q4 Earnings and Revenue Estimates
  - KULR Welcomes Microsoft Director and Pricing Optimization Specialist to Board of Directors

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 3,
  "sample_headlines": [
    "Wall Street analyst updates Microsoft (MSFT) stock price target",
    "Microsoft's AI Moat Holds up Even After the OpenAI Reset",
    "Earnings Growth & Price Strength Make Microsoft (MSFT) a Stock to Watch",
    "Commvault Systems (CVLT) Beats Q4 Earnings and Revenue Estimates",
    "KULR Welcomes Microsoft Director and Pricing Optimization Specialist to Board of Directors"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.24x, price change 0.2%, short/float N/A.
- **Evidence**:
  - Volume: 9.1M vs avg 37.8M
  - Market cap: 3.2T
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 425.78,
  "change_pct": 0.23,
  "volume": 9053767,
  "avg_volume": 37823058,
  "volume_ratio": 0.24,
  "market_cap": 3161684732336,
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
  "market_cap": 3161350588050,
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
