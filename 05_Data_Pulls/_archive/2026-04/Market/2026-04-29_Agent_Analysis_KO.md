---
title: "KO Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "KO"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "alert"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.76
synthesis_mode: "deterministic"
entropy_level: "compressed"
entropy_score: 0.14
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.59
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "ko"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 76%
- **Attention status**: alert
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 76% confidence. Agent entropy is compressed (0.14). Drivers: price, risk. 1 neutral layer(s).
- **Top drivers**: price, risk, sentiment
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: compressed (0.14)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 96%, bearish 0%, neutral 4%
- **Interpretation**: Low agent entropy: specialists are clustered, so treat the verdict as a higher-conviction but still non-guaranteed state.
- **Microstructure entropy**: mixed (0.59)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 118ms | KO closed at 78.35. 7d 3.4%, 30d 0.7%. RSI 59.6, MACD positive. |
| risk | BULLISH | 43% | 352ms | Risk read: 30d vol 19.8%, max drawdown -11.1%, 30d return 0.7%. |
| sentiment | BULLISH | 62% | 465ms | 12 headline(s): 5 positive, 0 negative, net score 5. |
| microstructure | BULLISH | 50% | 1013ms | Volume ratio 1.79x, price change 3.9%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 164ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 39% | 1282ms | Revenue growth 1.9%, net margin 27.3%, trailing FCF 12.6B. |
| prediction_market | NEUTRAL | 12% | 523ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Treat low entropy as move-risk compression, not directional certainty.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: KO closed at 78.35. 7d 3.4%, 30d 0.7%. RSI 59.6, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "KO",
  "bars": 260,
  "close": 78.35,
  "change_7d_pct": 3.45,
  "change_30d_pct": 0.68,
  "sma20": 76.2485,
  "sma50": 77.1988,
  "sma200": 71.8138,
  "ema21": 76.2225,
  "rsi14": 59.57,
  "macd": -0.0593,
  "macd_signal": -0.2441,
  "macd_crossover": "positive",
  "bollinger_position": 1.014
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 43%
- **Summary**: Risk read: 30d vol 19.8%, max drawdown -11.1%, 30d return 0.7%.
- **Evidence**:
  - Max drawdown: -11.1%
  - 30d realized volatility: 19.8%
  - Sharpe-like score: 1.81
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.1978,
  "realized_vol_90d": 0.1749,
  "max_drawdown_pct": -11.14,
  "atr14": null,
  "change_30d_pct": 0.68,
  "sharpe_like_90d": 1.81,
  "beta": 0.36163828,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 62%
- **Summary**: 12 headline(s): 5 positive, 0 negative, net score 5.
- **Evidence**:
  - Coke vs UPS: After Both Beat Q1 Earnings, Which Is the Better Buy for Retirement Investors?
  - Warren Buffett Will Never Sell These 4 Favorite ‘Forever' Dividend Giants
  - Greg Abel Has Over 50% of Berkshire Hathaway's Stock Portfolio Invested in 3 Forever Stocks
  - Coca-Cola Earnings Show Why This Dividend Stock, With Its 2.7% Dividend Yield, Remains a Buy
  - The Coca-Cola Company (KO) Q1 2026 Earnings Call Transcript

```json
{
  "headline_count": 12,
  "positive_count": 5,
  "negative_count": 0,
  "net_score": 5,
  "sample_headlines": [
    "Coke vs UPS: After Both Beat Q1 Earnings, Which Is the Better Buy for Retirement Investors?",
    "Warren Buffett Will Never Sell These 4 Favorite ‘Forever' Dividend Giants",
    "Greg Abel Has Over 50% of Berkshire Hathaway's Stock Portfolio Invested in 3 Forever Stocks",
    "Coca-Cola Earnings Show Why This Dividend Stock, With Its 2.7% Dividend Yield, Remains a Buy",
    "The Coca-Cola Company (KO) Q1 2026 Earnings Call Transcript"
  ]
}
```

## Microstructure Agent

- **Signal**: BULLISH
- **Confidence**: 50%
- **Summary**: Volume ratio 1.79x, price change 3.9%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 30.7M vs avg 17.2M
  - Market cap: 337.2B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.59) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 78.35,
  "change_pct": 3.86,
  "volume": 30686038,
  "avg_volume": 17169472,
  "volume_ratio": 1.79,
  "market_cap": 337230152500,
  "beta": 0.36163828,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.59,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 18.02
  - HY spread: 2.8%

```json
{
  "DFF": {
    "date": "2026-04-27",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-28",
    "value": 0.52
  },
  "VIXCLS": {
    "date": "2026-04-27",
    "value": 18.02
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-27",
    "value": 2.84
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 39%
- **Summary**: Revenue growth 1.9%, net margin 27.3%, trailing FCF 12.6B.
- **Evidence**:
  - Sector: Consumer Defensive
  - Revenue growth: 1.9%
  - Net cash: -33.3B

```json
{
  "company_name": "The Coca-Cola Company",
  "sector": "Consumer Defensive",
  "industry": "Beverages - Non-Alcoholic",
  "market_cap": 337230152500,
  "revenue_growth_pct": 1.87,
  "gross_margin_pct": 61.63,
  "net_margin_pct": 27.34,
  "trailing_fcf": 12562000000,
  "cash": 10574000000,
  "total_debt": 43890000000,
  "net_cash": -33316000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Buffett Style Quality Compounders".

```json
{
  "query": "Buffett Style Quality Compounders",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-04-29
