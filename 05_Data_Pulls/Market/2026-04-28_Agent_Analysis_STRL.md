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
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.26
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "strl"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 26%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 26% confidence. Drivers: price, fundamentals. Risks: risk, microstructure. 2 neutral layer(s).
- **Top drivers**: price, fundamentals, sentiment
- **Top risks**: risk, microstructure

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 40ms | STRL closed at 473.29. 7d 2.1%, 30d 13.3%. RSI 55.8, MACD positive. |
| risk | BEARISH | 58% | 268ms | Risk read: 30d vol 70.6%, max drawdown -31.0%, 30d return 13.3%. |
| sentiment | BULLISH | 62% | 399ms | 20 headline(s): 5 positive, 1 negative, net score 5. |
| microstructure | BEARISH | 31% | 705ms | Volume ratio 0.32x, price change -7.2%, short/float N/A. |
| macro | NEUTRAL | 25% | 3406ms | Macro backdrop: VIX N/A, curve N/A, HY spread N/A. |
| fundamentals | BULLISH | 54% | 1050ms | Revenue growth 17.7%, net margin 11.7%, trailing FCF 361.3M. |
| prediction_market | NEUTRAL | 12% | 470ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: STRL closed at 473.29. 7d 2.1%, 30d 13.3%. RSI 55.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "STRL",
  "bars": 260,
  "close": 473.29,
  "change_7d_pct": 2.08,
  "change_30d_pct": 13.29,
  "sma20": 450.789,
  "sma50": 433.1272,
  "sma200": 354.0937,
  "ema21": 459.136,
  "rsi14": 55.83,
  "macd": 19.7431,
  "macd_signal": 16.1557,
  "macd_crossover": "positive",
  "bollinger_position": 0.664
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 58%
- **Summary**: Risk read: 30d vol 70.6%, max drawdown -31.0%, 30d return 13.3%.
- **Evidence**:
  - Max drawdown: -31.0%
  - 30d realized volatility: 70.6%
  - Sharpe-like score: 2.08
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.7061,
  "realized_vol_90d": 0.6287,
  "max_drawdown_pct": -31.02,
  "atr14": null,
  "change_30d_pct": 13.29,
  "sharpe_like_90d": 2.08,
  "beta": 1.511,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 62%
- **Summary**: 20 headline(s): 5 positive, 1 negative, net score 5.
- **Evidence**:
  - Analysts Estimate KBR Inc. (KBR) to Report a Decline in Earnings: What to Look Out for
  - Sterling Infrastructure (STRL) Rises Higher Than Market: Key Facts
  - Sterling Infrastructure (STRL) Earnings Expected to Grow: Should You Buy?
  - Joseph Cutillo Sells 50,000 Shares of Sterling Infrastructure (NASDAQ:STRL) Stock
  - Will Sterling's Geographic Expansion Fuel Its Next Growth Cycle?

```json
{
  "headline_count": 20,
  "positive_count": 5,
  "negative_count": 1,
  "net_score": 5,
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
- **Summary**: Volume ratio 0.32x, price change -7.2%, short/float N/A.
- **Evidence**:
  - Volume: 161.7K vs avg 501.0K
  - Market cap: 14.4B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 469,
  "change_pct": -7.21,
  "volume": 161725,
  "avg_volume": 500998,
  "volume_ratio": 0.32,
  "market_cap": 14389264246,
  "beta": 1.511,
  "short_pct_float": null
}
```

## Macro Agent

- **Signal**: NEUTRAL
- **Confidence**: 25%
- **Summary**: Macro backdrop: VIX N/A, curve N/A, HY spread N/A.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: N/A
  - VIX: N/A
  - HY spread: N/A
- **Warnings**:
  - T10Y2Y unavailable: Failed after 2 attempts: Server error 500: Internal Server Error
  - VIXCLS unavailable: Failed after 2 attempts: Server error 500: Internal Server Error
  - BAMLH0A0HYM2 unavailable: Failed after 2 attempts: Server error 500: Internal Server Error

```json
{
  "DFF": {
    "date": "2026-04-24",
    "value": 3.64
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
  "market_cap": 14389264246,
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
