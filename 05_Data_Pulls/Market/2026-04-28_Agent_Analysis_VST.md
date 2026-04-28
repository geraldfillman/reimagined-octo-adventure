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
final_confidence: 0.37
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "vst"]
---

## Verdict

- **Final verdict**: BEARISH
- **Final confidence**: 37%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bearish at 37% confidence. Drivers: sentiment, macro. Risks: risk, price. 1 neutral layer(s).
- **Top drivers**: sentiment, macro
- **Top risks**: risk, price, fundamentals

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 60% | 1165ms | VST closed at 160.09. 7d -2.1%, 30d -1.2%. RSI 51, MACD positive. |
| risk | BEARISH | 54% | 1421ms | Risk read: 30d vol 52.3%, max drawdown -34.6%, 30d return -1.2%. |
| sentiment | BULLISH | 62% | 1593ms | 20 headline(s): 4 positive, 0 negative, net score 5. |
| microstructure | BEARISH | 31% | 1866ms | Volume ratio 0.42x, price change -4.2%, short/float N/A. |
| macro | BULLISH | 36% | 330ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BEARISH | 33% | 3065ms | Revenue growth -12.4%, net margin 5.6%, trailing FCF 640.0M. |
| prediction_market | NEUTRAL | 12% | 502ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 60%
- **Summary**: VST closed at 160.09. 7d -2.1%, 30d -1.2%. RSI 51, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "VST",
  "bars": 260,
  "close": 160.09,
  "change_7d_pct": -2.06,
  "change_30d_pct": -1.17,
  "sma20": 157.819,
  "sma50": 161.07,
  "sma200": 178.4013,
  "ema21": 159.2474,
  "rsi14": 51.03,
  "macd": 0.9638,
  "macd_signal": 0.2601,
  "macd_crossover": "positive",
  "bollinger_position": 0.613
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 54%
- **Summary**: Risk read: 30d vol 52.3%, max drawdown -34.6%, 30d return -1.2%.
- **Evidence**:
  - Max drawdown: -34.6%
  - 30d realized volatility: 52.3%
  - Sharpe-like score: -0.14
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5227,
  "realized_vol_90d": 0.5404,
  "max_drawdown_pct": -34.6,
  "atr14": null,
  "change_30d_pct": -1.17,
  "sharpe_like_90d": -0.14,
  "beta": 1.498,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 62%
- **Summary**: 20 headline(s): 4 positive, 0 negative, net score 5.
- **Evidence**:
  - Vistra Corp. (VST) Laps the Stock Market: Here's Why
  - Stock Market Today (LIVE): Tehran's Hormuz Proposal and a Packed Magnificent Seven Earnings Week Give Investors Two Big Stories to Watch
  - Why Vistra Corp. (VST) is a Top Momentum Stock for the Long-Term
  - 3,633 Shares in Vistra Corp. $VST Purchased by Cornerstone Advisory LLC
  - Bosman Wealth Management LLC Purchases New Position in Vistra Corp. $VST

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 0,
  "net_score": 5,
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
- **Summary**: Volume ratio 0.42x, price change -4.2%, short/float N/A.
- **Evidence**:
  - Volume: 2.0M vs avg 4.7M
  - Market cap: 54.0B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 159.64,
  "change_pct": -4.17,
  "volume": 1968027,
  "avg_volume": 4650852,
  "volume_ratio": 0.42,
  "market_cap": 54046008975,
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
  "market_cap": 54046008975,
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
