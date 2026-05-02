---
title: "MSFT Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "MSFT"
asset_type: "stock"
thesis_name: "Simons Style Quant Momentum Breadth"
related_theses: ["[[Simons Style Quant Momentum Breadth]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.21
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.94
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "msft"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 21%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 21% confidence. Agent entropy is diffuse (0.94). Drivers: fundamentals, price. Risks: risk. 3 neutral layer(s).
- **Top drivers**: fundamentals, price, macro
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.94)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 51%, bearish 24%, neutral 25%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 41% | 1486ms | MSFT closed at 429.25. 7d 1.5%, 30d 7.3%. RSI 65.4, MACD positive. |
| risk | BEARISH | 61% | 2331ms | Risk read: 30d vol 30.0%, max drawdown -34.2%, 30d return 7.3%. |
| sentiment | NEUTRAL | 22% | 1855ms | 12 headline(s): 0 positive, 0 negative, net score 0. |
| microstructure | NEUTRAL | 28% | 3069ms | Volume ratio 0.84x, price change 1.0%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 3373ms | Macro backdrop: VIX N/A, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 50% | 2496ms | Revenue growth 14.9%, net margin 36.1%, trailing FCF 77.4B. |
| prediction_market | NEUTRAL | 12% | 523ms | No relevant prediction markets found for "Simons Style Quant Momentum Breadth". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 41%
- **Summary**: MSFT closed at 429.25. 7d 1.5%, 30d 7.3%. RSI 65.4, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "MSFT",
  "bars": 260,
  "close": 429.25,
  "change_7d_pct": 1.53,
  "change_30d_pct": 7.33,
  "sma20": 398.889,
  "sma50": 395.0752,
  "sma200": 469.3415,
  "ema21": 406.7586,
  "rsi14": 65.38,
  "macd": 10.795,
  "macd_signal": 6.7431,
  "macd_crossover": "positive",
  "bollinger_position": 0.811
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 30.0%, max drawdown -34.2%, 30d return 7.3%.
- **Evidence**:
  - Max drawdown: -34.2%
  - 30d realized volatility: 30.0%
  - Sharpe-like score: -0.77
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3002,
  "realized_vol_90d": 0.3124,
  "max_drawdown_pct": -34.18,
  "atr14": null,
  "change_30d_pct": 7.33,
  "sharpe_like_90d": -0.77,
  "beta": 1.107,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 12 headline(s): 0 positive, 0 negative, net score 0.
- **Evidence**:
  - Nasdaq called higher ahead of Fed decision, Alphabet, Microsoft earnings
  - Richtech Robotics Inc. Now Available in the Microsoft Marketplace
  - Should You Invest in the Fidelity MSCI Information Technology Index ETF (FTEC)?
  - META, MSFT, AMZN, GOOG head for 'biggest earnings day': why it matters
  - The Stock Market's Most Important Day of the Quarter Has Arrived

```json
{
  "headline_count": 12,
  "positive_count": 0,
  "negative_count": 0,
  "net_score": 0,
  "sample_headlines": [
    "Nasdaq called higher ahead of Fed decision, Alphabet, Microsoft earnings",
    "Richtech Robotics Inc. Now Available in the Microsoft Marketplace",
    "Should You Invest in the Fidelity MSCI Information Technology Index ETF (FTEC)?",
    "META, MSFT, AMZN, GOOG head for 'biggest earnings day': why it matters",
    "The Stock Market's Most Important Day of the Quarter Has Arrived"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.84x, price change 1.0%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 30.3M vs avg 36.3M
  - Market cap: 3.2T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 429.25,
  "change_pct": 1.04,
  "volume": 30312242,
  "avg_volume": 36251950,
  "volume_ratio": 0.84,
  "market_cap": 3187451677500,
  "beta": 1.107,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.67,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX N/A, curve 0.52, HY spread 2.8%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: N/A
  - HY spread: 2.8%
- **Warnings**:
  - VIXCLS unavailable: Failed after 2 attempts: Server error 500: Internal Server Error

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
  "BAMLH0A0HYM2": {
    "date": "2026-04-27",
    "value": 2.84
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
  "market_cap": 3187451677500,
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
