---
title: "GOLD Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GOLD"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.17
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.9
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.68
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "gold"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 17%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 17% confidence. Agent entropy is diffuse (0.9). Drivers: fundamentals, price. Risks: risk, microstructure. 2 neutral layer(s).
- **Top drivers**: fundamentals, price, macro
- **Top risks**: risk, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.9)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 51%, bearish 34%, neutral 15%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.68)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 38% | 63ms | GOLD closed at 45.72. 7d -5.1%, 30d -2.1%. RSI 49, MACD positive. |
| risk | BEARISH | 47% | 305ms | Risk read: 30d vol 53.8%, max drawdown -40.8%, 30d return -2.1%. |
| sentiment | NEUTRAL | 22% | 466ms | 12 headline(s): 0 positive, 0 negative, net score 0. |
| microstructure | BEARISH | 31% | 954ms | Volume ratio 0.50x, price change -3.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 199ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 43% | 1209ms | Revenue growth 13.2%, net margin 0.2%, trailing FCF 283.4M. |
| prediction_market | NEUTRAL | 12% | 463ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: GOLD closed at 45.72. 7d -5.1%, 30d -2.1%. RSI 49, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "GOLD",
  "bars": 260,
  "close": 45.72,
  "change_7d_pct": -5.11,
  "change_30d_pct": -2.14,
  "sma20": 44.9945,
  "sma50": 48.321,
  "sma200": 35.0012,
  "ema21": 45.9144,
  "rsi14": 48.97,
  "macd": 0.204,
  "macd_signal": -0.1971,
  "macd_crossover": "positive",
  "bollinger_position": 0.579
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 47%
- **Summary**: Risk read: 30d vol 53.8%, max drawdown -40.8%, 30d return -2.1%.
- **Evidence**:
  - Max drawdown: -40.8%
  - 30d realized volatility: 53.8%
  - Sharpe-like score: 1.86
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5376,
  "realized_vol_90d": 0.6361,
  "max_drawdown_pct": -40.79,
  "atr14": null,
  "change_30d_pct": -2.14,
  "sharpe_like_90d": 1.86,
  "beta": 0.567,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 12 headline(s): 0 positive, 0 negative, net score 0.
- **Evidence**:
  - Gold.com (GOLD) Registers a Bigger Fall Than the Market: Important Facts to Note
  - DENARIUS METALS ANNOUNCES DETAILS FOR THE APRIL 30, 2026 INTEREST PAYMENTS ON ITS CONVERTIBLE UNSECURED DEBENTURES AND THE GOLD PREMIUM PAYMENTS DUE ON ITS 2023 DEBENTURES
  - LUCA INTERSECTS 118 METRES OF 2.5 G/T GOLD, 78.0 G/T SILVER, 0.8% COPPER, 0.6% PB AND 2.0% ZINC AT LARGO NORTE ZONE, CAMPO MORADO MINE
  - SONORO GOLD ANNOUNCES CLOSING OF OVERSUBSCRIBED $12.2M PRIVATE PLACEMENT
  - SRANAN GOLD Announces Private Placement of Up to $3 Million Led by Concept Capital Management Ltd

```json
{
  "headline_count": 12,
  "positive_count": 0,
  "negative_count": 0,
  "net_score": 0,
  "sample_headlines": [
    "Gold.com (GOLD) Registers a Bigger Fall Than the Market: Important Facts to Note",
    "DENARIUS METALS ANNOUNCES DETAILS FOR THE APRIL 30, 2026 INTEREST PAYMENTS ON ITS CONVERTIBLE UNSECURED DEBENTURES AND THE GOLD PREMIUM PAYMENTS DUE ON ITS 2023 DEBENTURES",
    "LUCA INTERSECTS 118 METRES OF 2.5 G/T GOLD, 78.0 G/T SILVER, 0.8% COPPER, 0.6% PB AND 2.0% ZINC AT LARGO NORTE ZONE, CAMPO MORADO MINE",
    "SONORO GOLD ANNOUNCES CLOSING OF OVERSUBSCRIBED $12.2M PRIVATE PLACEMENT",
    "SRANAN GOLD Announces Private Placement of Up to $3 Million Led by Concept Capital Management Ltd"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.50x, price change -3.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 362.0K vs avg 718.8K
  - Market cap: 1.2B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.68) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 45.72,
  "change_pct": -3.16,
  "volume": 361999,
  "avg_volume": 718834,
  "volume_ratio": 0.5,
  "market_cap": 1156578840,
  "beta": 0.567,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.68,
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
- **Confidence**: 43%
- **Summary**: Revenue growth 13.2%, net margin 0.2%, trailing FCF 283.4M.
- **Evidence**:
  - Sector: Financial Services
  - Revenue growth: 13.2%
  - Net cash: -155.3M

```json
{
  "company_name": "Gold.com, Inc.",
  "sector": "Financial Services",
  "industry": "Financial - Capital Markets",
  "market_cap": 1156578840,
  "revenue_growth_pct": 13.19,
  "gross_margin_pct": 1.92,
  "net_margin_pct": 0.16,
  "trailing_fcf": 283401000,
  "cash": 152050000,
  "total_debt": 307328000,
  "net_cash": -155278000
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
