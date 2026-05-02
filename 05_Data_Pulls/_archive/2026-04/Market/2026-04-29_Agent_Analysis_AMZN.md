---
title: "AMZN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AMZN"
asset_type: "stock"
thesis_name: "Simons Style Quant Momentum Breadth"
related_theses: ["[[Simons Style Quant Momentum Breadth]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.47
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.62
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.62
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "amzn"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 47%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 47% confidence. Agent entropy is mixed (0.62). Drivers: price, fundamentals. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.62)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 59%, bearish 0%, neutral 41%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.62)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 61% | 386ms | AMZN closed at 259.7. 7d 3.6%, 30d 22.7%. RSI 73.7, MACD positive. |
| risk | NEUTRAL | 33% | 203ms | Risk read: 30d vol 32.9%, max drawdown -21.7%, 30d return 22.7%. |
| sentiment | NEUTRAL | 30% | 305ms | 12 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 28% | 635ms | Volume ratio 0.81x, price change -0.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 1324ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 50% | 664ms | Revenue growth 12.4%, net margin 10.8%, trailing FCF 7.7B. |
| prediction_market | NEUTRAL | 12% | 756ms | No relevant prediction markets found for "Simons Style Quant Momentum Breadth". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 61%
- **Summary**: AMZN closed at 259.7. 7d 3.6%, 30d 22.7%. RSI 73.7, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "AMZN",
  "bars": 260,
  "close": 259.7,
  "change_7d_pct": 3.65,
  "change_30d_pct": 22.65,
  "sma20": 238.978,
  "sma50": 221.0896,
  "sma200": 226.7718,
  "ema21": 241.9751,
  "rsi14": 73.73,
  "macd": 12.212,
  "macd_signal": 10.4052,
  "macd_crossover": "positive",
  "bollinger_position": 0.777
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 32.9%, max drawdown -21.7%, 30d return 22.7%.
- **Evidence**:
  - Max drawdown: -21.7%
  - 30d realized volatility: 32.9%
  - Sharpe-like score: 1.56
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3287,
  "realized_vol_90d": 0.307,
  "max_drawdown_pct": -21.74,
  "atr14": null,
  "change_30d_pct": 22.65,
  "sharpe_like_90d": 1.56,
  "beta": 1.383,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 12 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - Is iShares Core S&P U.S. Value ETF (IUSV) a Strong ETF Right Now?
  - 'This Is Madness': Investors Chasing Chip Stocks At Risky Extremes
  - META, MSFT, AMZN, GOOG head for 'biggest earnings day': why it matters
  - The Stock Market's Most Important Day of the Quarter Has Arrived
  - 4 "Magnificent Seven" Companies Are About to Report Earnings -- All on the Same Day. Here's What to Watch.

```json
{
  "headline_count": 12,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "Is iShares Core S&P U.S. Value ETF (IUSV) a Strong ETF Right Now?",
    "'This Is Madness': Investors Chasing Chip Stocks At Risky Extremes",
    "META, MSFT, AMZN, GOOG head for 'biggest earnings day': why it matters",
    "The Stock Market's Most Important Day of the Quarter Has Arrived",
    "4 \"Magnificent Seven\" Companies Are About to Report Earnings -- All on the Same Day. Here's What to Watch."
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.81x, price change -0.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 42.1M vs avg 52.0M
  - Market cap: 2.8T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.62) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 259.7,
  "change_pct": -0.54,
  "volume": 42065244,
  "avg_volume": 52037331,
  "volume_ratio": 0.81,
  "market_cap": 2792879192200,
  "beta": 1.383,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.62,
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
- **Confidence**: 50%
- **Summary**: Revenue growth 12.4%, net margin 10.8%, trailing FCF 7.7B.
- **Evidence**:
  - Sector: Consumer Cyclical
  - Revenue growth: 12.4%
  - Net cash: -66.2B

```json
{
  "company_name": "Amazon.com, Inc.",
  "sector": "Consumer Cyclical",
  "industry": "Specialty Retail",
  "market_cap": 2792879192200,
  "revenue_growth_pct": 12.38,
  "gross_margin_pct": 50.29,
  "net_margin_pct": 10.83,
  "trailing_fcf": 7695000000,
  "cash": 86810000000,
  "total_debt": 152987000000,
  "net_cash": -66177000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Simons Style Quant Momentum Breadth".

```json
{
  "query": "Simons Style Quant Momentum Breadth",
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
