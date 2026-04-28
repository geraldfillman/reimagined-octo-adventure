---
title: "GEV Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GEV"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-04-28"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.63
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "gev"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 63%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 63% confidence. Drivers: price, risk. Risks: microstructure. 1 neutral layer(s).
- **Top drivers**: price, risk, sentiment
- **Top risks**: microstructure

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 234ms | GEV closed at 1067.71. 7d 6.5%, 30d 29.0%. RSI 62.5, MACD positive. |
| risk | BULLISH | 43% | 245ms | Risk read: 30d vol 56.8%, max drawdown -17.5%, 30d return 29.0%. |
| sentiment | BULLISH | 62% | 384ms | 20 headline(s): 5 positive, 0 negative, net score 5. |
| microstructure | BEARISH | 31% | 377ms | Volume ratio 0.59x, price change -4.6%, short/float N/A. |
| macro | BULLISH | 36% | 249ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | BULLISH | 43% | 216ms | Revenue growth 8.9%, net margin 12.8%, trailing FCF 7.5B. |
| prediction_market | NEUTRAL | 12% | 716ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: GEV closed at 1067.71. 7d 6.5%, 30d 29.0%. RSI 62.5, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "GEV",
  "bars": 260,
  "close": 1067.71,
  "change_7d_pct": 6.48,
  "change_30d_pct": 29.05,
  "sma20": 995.554,
  "sma50": 907.811,
  "sma200": 700.9081,
  "ema21": 1008.0874,
  "rsi14": 62.49,
  "macd": 63.3939,
  "macd_signal": 53.8208,
  "macd_crossover": "positive",
  "bollinger_position": 0.714
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 43%
- **Summary**: Risk read: 30d vol 56.8%, max drawdown -17.5%, 30d return 29.0%.
- **Evidence**:
  - Max drawdown: -17.5%
  - 30d realized volatility: 56.8%
  - Sharpe-like score: 2.71
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5677,
  "realized_vol_90d": 0.5036,
  "max_drawdown_pct": -17.54,
  "atr14": null,
  "change_30d_pct": 29.05,
  "sharpe_like_90d": 2.71,
  "beta": 1.196,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 62%
- **Summary**: 20 headline(s): 5 positive, 0 negative, net score 5.
- **Evidence**:
  - 3 Green Energy Stocks for Investors Playing the Long Game in 2026
  - GEV vs. AEP: Which Grid Stock Is Positioned Better Today?
  - Here Are Monday’s Top Wall Street Analyst Research Calls: Adobe, Advanced Micro Devices, CrowdStrike, DoorDash, Fortinet, GE Vernova, Snap, StubHub, and More
  - First Look: Meta deal blocked, Intellia win, oil climbs
  - Three AI Stocks Surging As the Market Meanders

```json
{
  "headline_count": 20,
  "positive_count": 5,
  "negative_count": 0,
  "net_score": 5,
  "sample_headlines": [
    "3 Green Energy Stocks for Investors Playing the Long Game in 2026",
    "GEV vs. AEP: Which Grid Stock Is Positioned Better Today?",
    "Here Are Monday’s Top Wall Street Analyst Research Calls: Adobe, Advanced Micro Devices, CrowdStrike, DoorDash, Fortinet, GE Vernova, Snap, StubHub, and More",
    "First Look: Meta deal blocked, Intellia win, oil climbs",
    "Three AI Stocks Surging As the Market Meanders"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.59x, price change -4.6%, short/float N/A.
- **Evidence**:
  - Volume: 1.6M vs avg 2.7M
  - Market cap: 287.1B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 1068.49,
  "change_pct": -4.62,
  "volume": 1583606,
  "avg_volume": 2699238,
  "volume_ratio": 0.59,
  "market_cap": 287124632800,
  "beta": 1.196,
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
- **Confidence**: 43%
- **Summary**: Revenue growth 8.9%, net margin 12.8%, trailing FCF 7.5B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 8.9%
  - Net cash: 7.3B

```json
{
  "company_name": "GE Vernova Inc.",
  "sector": "Utilities",
  "industry": "Renewable Utilities",
  "market_cap": 287124632800,
  "revenue_growth_pct": 8.94,
  "gross_margin_pct": 19.79,
  "net_margin_pct": 12.83,
  "trailing_fcf": 7527000000,
  "cash": 10172000000,
  "total_debt": 2857000000,
  "net_cash": 7315000000
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
