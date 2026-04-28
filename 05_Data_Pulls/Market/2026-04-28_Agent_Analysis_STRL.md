---
title: "STRL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "STRL"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-04-28"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.33
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "strl"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 33%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 33% confidence. Drivers: price, fundamentals. Risks: risk, microstructure. 1 neutral layer(s).
- **Top drivers**: price, fundamentals, sentiment
- **Top risks**: risk, microstructure

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 75% | 308ms | STRL closed at 470.4. 7d 1.5%, 30d 12.6%. RSI 55, MACD positive. |
| risk | BEARISH | 58% | 566ms | Risk read: 30d vol 71.1%, max drawdown -31.0%, 30d return 12.6%. |
| sentiment | BULLISH | 70% | 705ms | 20 headline(s): 6 positive, 1 negative, net score 6. |
| microstructure | BEARISH | 31% | 1003ms | Volume ratio 0.38x, price change -7.0%, short/float N/A. |
| macro | BULLISH | 36% | 1210ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BULLISH | 54% | 1344ms | Revenue growth 17.7%, net margin 11.7%, trailing FCF 361.3M. |
| prediction_market | NEUTRAL | 12% | 504ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 75%
- **Summary**: STRL closed at 470.4. 7d 1.5%, 30d 12.6%. RSI 55, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "STRL",
  "bars": 260,
  "close": 470.4,
  "change_7d_pct": 1.46,
  "change_30d_pct": 12.6,
  "sma20": 450.6445,
  "sma50": 433.0694,
  "sma200": 354.0792,
  "ema21": 458.8733,
  "rsi14": 55.01,
  "macd": 19.5126,
  "macd_signal": 16.1096,
  "macd_crossover": "positive",
  "bollinger_position": 0.645
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 58%
- **Summary**: Risk read: 30d vol 71.1%, max drawdown -31.0%, 30d return 12.6%.
- **Evidence**:
  - Max drawdown: -31.0%
  - 30d realized volatility: 71.1%
  - Sharpe-like score: 2.04
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.7109,
  "realized_vol_90d": 0.6305,
  "max_drawdown_pct": -31.02,
  "atr14": null,
  "change_30d_pct": 12.6,
  "sharpe_like_90d": 2.04,
  "beta": 1.511,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 70%
- **Summary**: 20 headline(s): 6 positive, 1 negative, net score 6.
- **Evidence**:
  - Analysts Estimate KBR Inc. (KBR) to Report a Decline in Earnings: What to Look Out for
  - Sterling Infrastructure (STRL) Rises Higher Than Market: Key Facts
  - Sterling Infrastructure (STRL) Earnings Expected to Grow: Should You Buy?
  - Joseph Cutillo Sells 50,000 Shares of Sterling Infrastructure (NASDAQ:STRL) Stock
  - Will Sterling's Geographic Expansion Fuel Its Next Growth Cycle?

```json
{
  "headline_count": 20,
  "positive_count": 6,
  "negative_count": 1,
  "net_score": 6,
  "sample_headlines": [
    "Analysts Estimate KBR Inc. (KBR) to Report a Decline in Earnings: What to Look Out for",
    "Sterling Infrastructure (STRL) Rises Higher Than Market: Key Facts",
    "Sterling Infrastructure (STRL) Earnings Expected to Grow: Should You Buy?",
    "Joseph Cutillo Sells 50,000 Shares of Sterling Infrastructure (NASDAQ:STRL) Stock",
    "Will Sterling's Geographic Expansion Fuel Its Next Growth Cycle?"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.38x, price change -7.0%, short/float N/A.
- **Evidence**:
  - Volume: 188.4K vs avg 501.0K
  - Market cap: 14.4B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 470,
  "change_pct": -7.01,
  "volume": 188367.86609,
  "avg_volume": 500998,
  "volume_ratio": 0.38,
  "market_cap": 14419944980,
  "beta": 1.511,
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
- **Confidence**: 54%
- **Summary**: Revenue growth 17.7%, net margin 11.7%, trailing FCF 361.3M.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 17.7%
  - Net cash: 40.8M

```json
{
  "company_name": "Sterling Infrastructure, Inc.",
  "sector": "Industrials",
  "industry": "Engineering & Construction",
  "market_cap": 14419944980,
  "revenue_growth_pct": 17.69,
  "gross_margin_pct": 22.09,
  "net_margin_pct": 11.65,
  "trailing_fcf": 361267000,
  "cash": 390721000,
  "total_debt": 349914000,
  "net_cash": 40807000
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
