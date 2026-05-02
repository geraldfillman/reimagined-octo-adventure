---
title: "PLTR Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "PLTR"
asset_type: "stock"
thesis_name: "Druckenmiller Style Secular Trend Leaders"
related_theses: ["[[Druckenmiller Style Secular Trend Leaders]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.24
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.96
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.6
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "pltr"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 24%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 24% confidence. Agent entropy is diffuse (0.96). Drivers: fundamentals, macro. Risks: risk, price. 3 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.96)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 35%, bearish 44%, neutral 21%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.6)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 60% | 1180ms | PLTR closed at 141.18. 7d -3.6%, 30d -7.6%. RSI 46.8, MACD positive. |
| risk | BEARISH | 61% | 1441ms | Risk read: 30d vol 57.0%, max drawdown -38.2%, 30d return -7.6%. |
| sentiment | NEUTRAL | 22% | 1563ms | 12 headline(s): 2 positive, 1 negative, net score 0. |
| microstructure | NEUTRAL | 24% | 2094ms | Volume ratio 0.46x, price change -1.3%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 116ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 60% | 2311ms | Revenue growth 56.2%, net margin 36.3%, trailing FCF 2.1B. |
| prediction_market | NEUTRAL | 12% | 490ms | No relevant prediction markets found for "Druckenmiller Style Secular Trend Leaders". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 60%
- **Summary**: PLTR closed at 141.18. 7d -3.6%, 30d -7.6%. RSI 46.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "PLTR",
  "bars": 260,
  "close": 141.18,
  "change_7d_pct": -3.56,
  "change_30d_pct": -7.56,
  "sma20": 142.5665,
  "sma50": 144.8266,
  "sma200": 164.4326,
  "ema21": 143.7569,
  "rsi14": 46.79,
  "macd": -0.8866,
  "macd_signal": -1.2504,
  "macd_crossover": "positive",
  "bollinger_position": 0.445
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 57.0%, max drawdown -38.2%, 30d return -7.6%.
- **Evidence**:
  - Max drawdown: -38.2%
  - 30d realized volatility: 57.0%
  - Sharpe-like score: -1.2
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5699,
  "realized_vol_90d": 0.541,
  "max_drawdown_pct": -38.19,
  "atr14": null,
  "change_30d_pct": -7.56,
  "sharpe_like_90d": -1.2,
  "beta": 1.674,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 12 headline(s): 2 positive, 1 negative, net score 0.
- **Evidence**:
  - How To Get 12% Yield And 40% Safety On Palantir Stock
  - Should Invesco Large Cap Growth ETF (PWB) Be on Your Investing Radar?
  - Trading expert sets date when Palantir stock will crash to $115
  - The AI Supercycle Isn't Slowing Down -- It Just Shifted. These 2 Stocks Are Riding the Next Wave.
  - Palantir Down 31%: Might Nibble Around Earnings

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 1,
  "net_score": 0,
  "sample_headlines": [
    "How To Get 12% Yield And 40% Safety On Palantir Stock",
    "Should Invesco Large Cap Growth ETF (PWB) Be on Your Investing Radar?",
    "Trading expert sets date when Palantir stock will crash to $115",
    "The AI Supercycle Isn't Slowing Down -- It Just Shifted. These 2 Stocks Are Riding the Next Wave.",
    "Palantir Down 31%: Might Nibble Around Earnings"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.46x, price change -1.3%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 24.5M vs avg 53.4M
  - Market cap: 323.5B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.6) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 141.18,
  "change_pct": -1.34,
  "volume": 24542303,
  "avg_volume": 53441050,
  "volume_ratio": 0.46,
  "market_cap": 323509734600,
  "beta": 1.674,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.6,
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
- **Confidence**: 60%
- **Summary**: Revenue growth 56.2%, net margin 36.3%, trailing FCF 2.1B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 56.2%
  - Net cash: 1.2B

```json
{
  "company_name": "Palantir Technologies Inc.",
  "sector": "Technology",
  "industry": "Software - Infrastructure",
  "market_cap": 323509734600,
  "revenue_growth_pct": 56.18,
  "gross_margin_pct": 82.37,
  "net_margin_pct": 36.31,
  "trailing_fcf": 2101590999,
  "cash": 1423796000,
  "total_debt": 229338000,
  "net_cash": 1194458000
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
