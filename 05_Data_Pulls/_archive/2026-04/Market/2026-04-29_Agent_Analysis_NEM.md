---
title: "NEM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "NEM"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.25
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.9
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.64
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "nem"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 25%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 25% confidence. Agent entropy is diffuse (0.9). Drivers: fundamentals, macro. Risks: risk. 3 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.9)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 55%, bearish 17%, neutral 28%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.64)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 33% | 71ms | NEM closed at 109.9. 7d -5.7%, 30d -0.3%. RSI 46.2, MACD bearish_cross. |
| risk | BEARISH | 45% | 276ms | Risk read: 30d vol 56.0%, max drawdown -27.4%, 30d return -0.3%. |
| sentiment | BULLISH | 46% | 401ms | 12 headline(s): 3 positive, 0 negative, net score 3. |
| microstructure | NEUTRAL | 27% | 1094ms | Volume ratio 0.94x, price change -5.3%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 176ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 60% | 1174ms | Revenue growth 19.1%, net margin 32.1%, trailing FCF 12.3B. |
| prediction_market | NEUTRAL | 12% | 529ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: NEM closed at 109.9. 7d -5.7%, 30d -0.3%. RSI 46.2, MACD bearish_cross.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: bearish_cross

```json
{
  "api_symbol": "NEM",
  "bars": 260,
  "close": 109.9,
  "change_7d_pct": -5.67,
  "change_30d_pct": -0.26,
  "sma20": 114.7055,
  "sma50": 114.4084,
  "sma200": 94.9419,
  "ema21": 113.4682,
  "rsi14": 46.22,
  "macd": 0.4771,
  "macd_signal": 0.6171,
  "macd_crossover": "bearish_cross",
  "bollinger_position": 0.166
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: Risk read: 30d vol 56.0%, max drawdown -27.4%, 30d return -0.3%.
- **Evidence**:
  - Max drawdown: -27.4%
  - 30d realized volatility: 56.0%
  - Sharpe-like score: 0.87
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5598,
  "realized_vol_90d": 0.5331,
  "max_drawdown_pct": -27.4,
  "atr14": null,
  "change_30d_pct": -0.26,
  "sharpe_like_90d": 0.87,
  "beta": 0.475,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 12 headline(s): 3 positive, 0 negative, net score 3.
- **Evidence**:
  - Newmont Corp (NEM) Stock Down 3.8% but Still Overvalued -- GF Score: 83/100
  - Here's Why Newmont Corporation (NEM) is a Strong Momentum Stock
  - Gold's Worst Pullback in Months Is Here. Here's Why Safe-Haven Assets Are Sliding
  - Investors Heavily Search Newmont Corporation (NEM): Here is What You Need to Know
  - Metal, Chips, & Cash: Q1 ‘26 Additions to VictoryShares GFLW

```json
{
  "headline_count": 12,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 3,
  "sample_headlines": [
    "Newmont Corp (NEM) Stock Down 3.8% but Still Overvalued -- GF Score: 83/100",
    "Here's Why Newmont Corporation (NEM) is a Strong Momentum Stock",
    "Gold's Worst Pullback in Months Is Here. Here's Why Safe-Haven Assets Are Sliding",
    "Investors Heavily Search Newmont Corporation (NEM): Here is What You Need to Know",
    "Metal, Chips, & Cash: Q1 ‘26 Additions to VictoryShares GFLW"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 27%
- **Summary**: Volume ratio 0.94x, price change -5.3%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 9.8M vs avg 10.4M
  - Market cap: 117.3B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.64) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 109.9,
  "change_pct": -5.32,
  "volume": 9782037,
  "avg_volume": 10412250,
  "volume_ratio": 0.94,
  "market_cap": 117324048764,
  "beta": 0.475,
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
  "market_cap": 117324048764,
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
- **Auto-pulled**: 2026-04-29
