---
title: "GOLD Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GOLD"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.22
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.93
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "gold"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 22%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 22% confidence. Agent entropy is diffuse (0.93). Drivers: fundamentals, price. Risks: risk. 3 neutral layer(s).
- **Top drivers**: fundamentals, price, macro
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.93)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 52%, bearish 22%, neutral 27%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 38% | 187ms | GOLD closed at 45.17. 7d -7.1%, 30d -5.7%. RSI 47.2, MACD positive. |
| risk | BEARISH | 47% | 483ms | Risk read: 30d vol 53.3%, max drawdown -40.8%, 30d return -5.7%. |
| sentiment | NEUTRAL | 22% | 559ms | 12 headline(s): 0 positive, 0 negative, net score 0. |
| microstructure | NEUTRAL | 24% | 1380ms | Volume ratio 0.49x, price change -1.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 139ms | Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%. |
| fundamentals | BULLISH | 43% | 1723ms | Revenue growth 13.2%, net margin 0.2%, trailing FCF 283.4M. |
| prediction_market | NEUTRAL | 12% | 658ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: GOLD closed at 45.17. 7d -7.1%, 30d -5.7%. RSI 47.2, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "GOLD",
  "bars": 260,
  "close": 45.17,
  "change_7d_pct": -7.11,
  "change_30d_pct": -5.68,
  "sma20": 45.249,
  "sma50": 48.0506,
  "sma200": 35.1091,
  "ema21": 45.8467,
  "rsi14": 47.16,
  "macd": 0.1072,
  "macd_signal": -0.1363,
  "macd_crossover": "positive",
  "bollinger_position": 0.49
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 47%
- **Summary**: Risk read: 30d vol 53.3%, max drawdown -40.8%, 30d return -5.7%.
- **Evidence**:
  - Max drawdown: -40.8%
  - 30d realized volatility: 53.3%
  - Sharpe-like score: 1.73
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5333,
  "realized_vol_90d": 0.6364,
  "max_drawdown_pct": -40.79,
  "atr14": null,
  "change_30d_pct": -5.68,
  "sharpe_like_90d": 1.73,
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

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.49x, price change -1.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 349.1K vs avg 718.8K
  - Market cap: 1.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 45.17,
  "change_pct": -1.2,
  "volume": 349119,
  "avg_volume": 718834,
  "volume_ratio": 0.49,
  "market_cap": 1142665490,
  "beta": 0.567,
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
  "market_cap": 1142665490,
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
- **Auto-pulled**: 2026-04-30
