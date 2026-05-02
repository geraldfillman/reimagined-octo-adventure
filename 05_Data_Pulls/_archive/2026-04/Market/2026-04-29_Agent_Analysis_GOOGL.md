---
title: "GOOGL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GOOGL"
asset_type: "stock"
thesis_name: "Druckenmiller Style Secular Trend Leaders"
related_theses: ["[[Druckenmiller Style Secular Trend Leaders]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.51
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.6
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.64
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "googl"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 51%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 51% confidence. Agent entropy is mixed (0.6). Drivers: price, fundamentals. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.6)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 64%, bearish 0%, neutral 36%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.64)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 79% | 99ms | GOOGL closed at 349.78. 7d 2.4%, 30d 14.5%. RSI 71.1, MACD positive. |
| risk | NEUTRAL | 33% | 235ms | Risk read: 30d vol 32.6%, max drawdown -20.4%, 30d return 14.5%. |
| sentiment | NEUTRAL | 22% | 362ms | 12 headline(s): 0 positive, 0 negative, net score 0. |
| microstructure | NEUTRAL | 28% | 903ms | Volume ratio 0.84x, price change -0.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 134ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 50% | 1102ms | Revenue growth 15.1%, net margin 32.8%, trailing FCF 73.3B. |
| prediction_market | NEUTRAL | 12% | 493ms | No relevant prediction markets found for "Druckenmiller Style Secular Trend Leaders". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 79%
- **Summary**: GOOGL closed at 349.78. 7d 2.4%, 30d 14.5%. RSI 71.1, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "GOOGL",
  "bars": 260,
  "close": 349.78,
  "change_7d_pct": 2.37,
  "change_30d_pct": 14.47,
  "sma20": 325.035,
  "sma50": 311.2672,
  "sma200": 278.2633,
  "ema21": 328.4019,
  "rsi14": 71.1,
  "macd": 11.5225,
  "macd_signal": 9.0703,
  "macd_crossover": "positive",
  "bollinger_position": 0.83
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 32.6%, max drawdown -20.4%, 30d return 14.5%.
- **Evidence**:
  - Max drawdown: -20.4%
  - 30d realized volatility: 32.6%
  - Sharpe-like score: 1.54
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3256,
  "realized_vol_90d": 0.2613,
  "max_drawdown_pct": -20.42,
  "atr14": null,
  "change_30d_pct": 14.47,
  "sharpe_like_90d": 1.54,
  "beta": 1.128,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 12 headline(s): 0 positive, 0 negative, net score 0.
- **Evidence**:
  - Nasdaq called higher ahead of Fed decision, Alphabet, Microsoft earnings
  - Cathie Wood Goes Bargain Hunting: 3 Stocks She Just Bought
  - Top Wall Street Forecasters Revamp Alphabet Expectations Ahead Of Q1 Earnings
  - Cathie Wood just made a massive bet on these two top AI stocks
  - 'This Is Madness': Investors Chasing Chip Stocks At Risky Extremes

```json
{
  "headline_count": 12,
  "positive_count": 0,
  "negative_count": 0,
  "net_score": 0,
  "sample_headlines": [
    "Nasdaq called higher ahead of Fed decision, Alphabet, Microsoft earnings",
    "Cathie Wood Goes Bargain Hunting: 3 Stocks She Just Bought",
    "Top Wall Street Forecasters Revamp Alphabet Expectations Ahead Of Q1 Earnings",
    "Cathie Wood just made a massive bet on these two top AI stocks",
    "'This Is Madness': Investors Chasing Chip Stocks At Risky Extremes"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.84x, price change -0.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 27.2M vs avg 32.3M
  - Market cap: 4.2T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.64) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 349.78,
  "change_pct": -0.16,
  "volume": 27244680,
  "avg_volume": 32266972,
  "volume_ratio": 0.84,
  "market_cap": 4231443775188,
  "beta": 1.128,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.64,
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
- **Summary**: Revenue growth 15.1%, net margin 32.8%, trailing FCF 73.3B.
- **Evidence**:
  - Sector: Communication Services
  - Revenue growth: 15.1%
  - Net cash: -28.6B

```json
{
  "company_name": "Alphabet Inc.",
  "sector": "Communication Services",
  "industry": "Internet Content & Information",
  "market_cap": 4231443775188,
  "revenue_growth_pct": 15.13,
  "gross_margin_pct": 59.67,
  "net_margin_pct": 32.8,
  "trailing_fcf": 73266000000,
  "cash": 30708000000,
  "total_debt": 59291000000,
  "net_cash": -28583000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Druckenmiller Style Secular Trend Leaders".

```json
{
  "query": "Druckenmiller Style Secular Trend Leaders",
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
