---
title: "VST Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "VST"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-04-28"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BEARISH"]
final_verdict: "BEARISH"
final_confidence: 0.38
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "vst"]
---

## Verdict

- **Final verdict**: BEARISH
- **Final confidence**: 38%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bearish at 38% confidence. Drivers: sentiment, macro. Risks: risk, price. 1 neutral layer(s).
- **Top drivers**: sentiment, macro
- **Top risks**: risk, price, fundamentals

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 60% | 1187ms | VST closed at 159.76. 7d -2.3%, 30d -1.4%. RSI 50.7, MACD positive. |
| risk | BEARISH | 54% | 1771ms | Risk read: 30d vol 52.4%, max drawdown -34.6%, 30d return -1.4%. |
| sentiment | BULLISH | 54% | 1678ms | 20 headline(s): 3 positive, 0 negative, net score 4. |
| microstructure | BEARISH | 31% | 1864ms | Volume ratio 0.37x, price change -4.1%, short/float N/A. |
| macro | BULLISH | 36% | 285ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BEARISH | 33% | 2213ms | Revenue growth -12.4%, net margin 5.6%, trailing FCF 640.0M. |
| prediction_market | NEUTRAL | 12% | 462ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 60%
- **Summary**: VST closed at 159.76. 7d -2.3%, 30d -1.4%. RSI 50.7, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "VST",
  "bars": 260,
  "close": 159.76,
  "change_7d_pct": -2.26,
  "change_30d_pct": -1.38,
  "sma20": 157.8025,
  "sma50": 161.0634,
  "sma200": 178.3997,
  "ema21": 159.2174,
  "rsi14": 50.7,
  "macd": 0.9375,
  "macd_signal": 0.2549,
  "macd_crossover": "positive",
  "bollinger_position": 0.597
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 54%
- **Summary**: Risk read: 30d vol 52.4%, max drawdown -34.6%, 30d return -1.4%.
- **Evidence**:
  - Max drawdown: -34.6%
  - 30d realized volatility: 52.4%
  - Sharpe-like score: -0.15
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.524,
  "realized_vol_90d": 0.5408,
  "max_drawdown_pct": -34.6,
  "atr14": null,
  "change_30d_pct": -1.38,
  "sharpe_like_90d": -0.15,
  "beta": 1.498,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 54%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 4.
- **Evidence**:
  - Vistra Corp. (VST) Laps the Stock Market: Here's Why
  - Stock Market Today (LIVE): Tehran's Hormuz Proposal and a Packed Magnificent Seven Earnings Week Give Investors Two Big Stories to Watch
  - Why Vistra Corp. (VST) is a Top Momentum Stock for the Long-Term
  - 3,633 Shares in Vistra Corp. $VST Purchased by Cornerstone Advisory LLC
  - Bosman Wealth Management LLC Purchases New Position in Vistra Corp. $VST

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 4,
  "sample_headlines": [
    "Vistra Corp. (VST) Laps the Stock Market: Here's Why",
    "Stock Market Today (LIVE): Tehran's Hormuz Proposal and a Packed Magnificent Seven Earnings Week Give Investors Two Big Stories to Watch",
    "Why Vistra Corp. (VST) is a Top Momentum Stock for the Long-Term",
    "3,633 Shares in Vistra Corp. $VST Purchased by Cornerstone Advisory LLC",
    "Bosman Wealth Management LLC Purchases New Position in Vistra Corp. $VST"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.37x, price change -4.1%, short/float N/A.
- **Evidence**:
  - Volume: 1.7M vs avg 4.7M
  - Market cap: 54.1B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 159.73,
  "change_pct": -4.11,
  "volume": 1734156.01963,
  "avg_volume": 4650852,
  "volume_ratio": 0.37,
  "market_cap": 54076478411,
  "beta": 1.498,
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

- **Signal**: BEARISH
- **Confidence**: 33%
- **Summary**: Revenue growth -12.4%, net margin 5.6%, trailing FCF 640.0M.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: -12.4%
  - Net cash: -19.6B

```json
{
  "company_name": "Vistra Corp.",
  "sector": "Utilities",
  "industry": "Independent Power Producers",
  "market_cap": 54076478411,
  "revenue_growth_pct": -12.41,
  "gross_margin_pct": 17.52,
  "net_margin_pct": 5.56,
  "trailing_fcf": 640000000,
  "cash": 816000000,
  "total_debt": 20395000000,
  "net_cash": -19579000000
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
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-04-28
