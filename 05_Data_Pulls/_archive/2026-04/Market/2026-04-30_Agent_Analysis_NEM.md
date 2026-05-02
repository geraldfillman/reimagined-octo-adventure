---
title: "NEM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "NEM"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.16
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.77
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.63
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "nem"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 16%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 16% confidence. Agent entropy is diffuse (0.77). Drivers: fundamentals, macro. Risks: risk, price. 1 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk, price, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.77)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 51%, bearish 45%, neutral 5%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.63)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 1429ms | NEM closed at 107.61. 7d -6.3%, 30d -3.1%. RSI 44, MACD negative. |
| risk | BEARISH | 45% | 1554ms | Risk read: 30d vol 56.3%, max drawdown -27.4%, 30d return -3.1%. |
| sentiment | BULLISH | 38% | 3278ms | 12 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | BEARISH | 31% | 6692ms | Volume ratio 0.52x, price change -2.1%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 158ms | Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%. |
| fundamentals | BULLISH | 60% | 3155ms | Revenue growth 19.1%, net margin 32.1%, trailing FCF 12.3B. |
| prediction_market | NEUTRAL | 12% | 607ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: NEM closed at 107.61. 7d -6.3%, 30d -3.1%. RSI 44, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "NEM",
  "bars": 260,
  "close": 107.61,
  "change_7d_pct": -6.3,
  "change_30d_pct": -3.09,
  "sma20": 114.6735,
  "sma50": 114.1144,
  "sma200": 95.1759,
  "ema21": 112.9356,
  "rsi14": 44.02,
  "macd": -0.0555,
  "macd_signal": 0.4825,
  "macd_crossover": "negative",
  "bollinger_position": 0.017
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: Risk read: 30d vol 56.3%, max drawdown -27.4%, 30d return -3.1%.
- **Evidence**:
  - Max drawdown: -27.4%
  - 30d realized volatility: 56.3%
  - Sharpe-like score: 0.68
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5626,
  "realized_vol_90d": 0.534,
  "max_drawdown_pct": -27.4,
  "atr14": null,
  "change_30d_pct": -3.09,
  "sharpe_like_90d": 0.68,
  "beta": 0.475,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 12 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - Global X Silver ETF Outperforms Sprott Gold ETF in 1 Year Return
  - SIL vs. GDX: Silver Miners Outpaced Gold Miners in 2025. Will It Last?
  - Newmont Corp (NEM) Stock Down 3.8% but Still Overvalued -- GF Score: 83/100
  - Here's Why Newmont Corporation (NEM) is a Strong Momentum Stock
  - Gold's Worst Pullback in Months Is Here. Here's Why Safe-Haven Assets Are Sliding

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "Global X Silver ETF Outperforms Sprott Gold ETF in 1 Year Return",
    "SIL vs. GDX: Silver Miners Outpaced Gold Miners in 2025. Will It Last?",
    "Newmont Corp (NEM) Stock Down 3.8% but Still Overvalued -- GF Score: 83/100",
    "Here's Why Newmont Corporation (NEM) is a Strong Momentum Stock",
    "Gold's Worst Pullback in Months Is Here. Here's Why Safe-Haven Assets Are Sliding"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.52x, price change -2.1%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 5.5M vs avg 10.4M
  - Market cap: 114.9B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.63) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 107.61,
  "change_pct": -2.08,
  "volume": 5464798,
  "avg_volume": 10412250,
  "volume_ratio": 0.52,
  "market_cap": 114879352934,
  "beta": 0.475,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.63,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 31%
- **Summary**: Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 17.83
  - HY spread: 2.9%

```json
{
  "DFF": {
    "date": "2026-04-28",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-29",
    "value": 0.5
  },
  "VIXCLS": {
    "date": "2026-04-28",
    "value": 17.83
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-28",
    "value": 2.85
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 60%
- **Summary**: Revenue growth 19.1%, net margin 32.1%, trailing FCF 12.3B.
- **Evidence**:
  - Sector: Basic Materials
  - Revenue growth: 19.1%
  - Net cash: 3.2B

```json
{
  "company_name": "Newmont Corporation",
  "sector": "Basic Materials",
  "industry": "Gold",
  "market_cap": 114879352934,
  "revenue_growth_pct": 19.08,
  "gross_margin_pct": 49.78,
  "net_margin_pct": 32.06,
  "trailing_fcf": 12273000000,
  "cash": 8778000000,
  "total_debt": 5532000000,
  "net_cash": 3246000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Dalio Style All-Weather Hard Assets".

```json
{
  "query": "Dalio Style All-Weather Hard Assets",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-04-30
