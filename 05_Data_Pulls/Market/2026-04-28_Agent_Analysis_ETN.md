---
title: "ETN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "ETN"
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
tags: ["agent-analysis", "market", "etn"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 47%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 47% confidence. Drivers: price, macro. 4 neutral layer(s).
- **Top drivers**: price, macro, fundamentals
- **Top risks**: N/A

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 75% | 203ms | ETN closed at 410.07. 7d 1.0%, 30d 13.6%. RSI 60.8, MACD positive. |
| risk | NEUTRAL | 33% | 198ms | Risk read: 30d vol 34.4%, max drawdown -19.6%, 30d return 13.6%. |
| sentiment | NEUTRAL | 30% | 338ms | 20 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 500ms | Volume ratio 0.33x, price change -1.6%, short/float N/A. |
| macro | BULLISH | 36% | 214ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BULLISH | 34% | 410ms | Revenue growth 10.3%, net margin 14.9%, trailing FCF 4.5B. |
| prediction_market | NEUTRAL | 12% | 671ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 75%
- **Summary**: ETN closed at 410.07. 7d 1.0%, 30d 13.6%. RSI 60.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "ETN",
  "bars": 260,
  "close": 410.075,
  "change_7d_pct": 0.95,
  "change_30d_pct": 13.58,
  "sma20": 395.5877,
  "sma50": 376.5817,
  "sma200": 361.758,
  "ema21": 398.1108,
  "rsi14": 60.83,
  "macd": 13.5136,
  "macd_signal": 12.2431,
  "macd_crossover": "positive",
  "bollinger_position": 0.674
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 34.4%, max drawdown -19.6%, 30d return 13.6%.
- **Evidence**:
  - Max drawdown: -19.6%
  - 30d realized volatility: 34.4%
  - Sharpe-like score: 2.01
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3442,
  "realized_vol_90d": 0.3295,
  "max_drawdown_pct": -19.59,
  "atr14": null,
  "change_30d_pct": 13.58,
  "sharpe_like_90d": 2.01,
  "beta": 1.164,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - Eaton (ETN) Earnings Expected to Grow: Should You Buy?
  - Eaton (ETN) Stock Declines While Market Improves: Some Information for Investors
  - This Oil ETN Pays a 21% Yield. Most Investors Don't Realize It's Not an ETF.
  - Eaton (NYSE:ETN) Sets New 1-Year High  – What’s Next?
  - Eaton Corporation, PLC (ETN) Is a Trending Stock: Facts to Know Before Betting on It

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "Eaton (ETN) Earnings Expected to Grow: Should You Buy?",
    "Eaton (ETN) Stock Declines While Market Improves: Some Information for Investors",
    "This Oil ETN Pays a 21% Yield. Most Investors Don't Realize It's Not an ETF.",
    "Eaton (NYSE:ETN) Sets New 1-Year High  – What’s Next?",
    "Eaton Corporation, PLC (ETN) Is a Trending Stock: Facts to Know Before Betting on It"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.33x, price change -1.6%, short/float N/A.
- **Evidence**:
  - Volume: 893.4K vs avg 2.7M
  - Market cap: 159.2B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 410.25,
  "change_pct": -1.56,
  "volume": 893429,
  "avg_volume": 2743056,
  "volume_ratio": 0.33,
  "market_cap": 159170846250,
  "beta": 1.164,
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
- **Confidence**: 34%
- **Summary**: Revenue growth 10.3%, net margin 14.9%, trailing FCF 4.5B.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 10.3%
  - Net cash: -10.5B

```json
{
  "company_name": "Eaton Corporation plc",
  "sector": "Industrials",
  "industry": "Industrial - Machinery",
  "market_cap": 159170846250,
  "revenue_growth_pct": 10.33,
  "gross_margin_pct": 37.59,
  "net_margin_pct": 14.9,
  "trailing_fcf": 4472000000,
  "cash": 622000000,
  "total_debt": 11169000000,
  "net_cash": -10547000000
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
