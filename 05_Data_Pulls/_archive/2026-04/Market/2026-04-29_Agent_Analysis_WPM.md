---
title: "WPM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "WPM"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.14
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.9
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.63
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "wpm"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 14%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 14% confidence. Agent entropy is diffuse (0.9). Drivers: fundamentals, macro. Risks: risk, price. 2 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.9)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 51%, bearish 34%, neutral 15%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.63)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 41ms | WPM closed at 129.43. 7d -15.1%, 30d -7.0%. RSI 39.4, MACD negative. |
| risk | BEARISH | 54% | 270ms | Risk read: 30d vol 53.7%, max drawdown -30.8%, 30d return -7.0%. |
| sentiment | BULLISH | 38% | 391ms | 12 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | NEUTRAL | 27% | 964ms | Volume ratio 1.10x, price change -5.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 147ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 60% | 1144ms | Revenue growth 83.3%, net margin 63.6%, trailing FCF 565.3M. |
| prediction_market | NEUTRAL | 12% | 485ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: WPM closed at 129.43. 7d -15.1%, 30d -7.0%. RSI 39.4, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "WPM",
  "bars": 260,
  "close": 129.43,
  "change_7d_pct": -15.06,
  "change_30d_pct": -7.01,
  "sma20": 140.96,
  "sma50": 141.3518,
  "sma200": 117.7978,
  "ema21": 139.7294,
  "rsi14": 39.4,
  "macd": 0.2422,
  "macd_signal": 1.4731,
  "macd_crossover": "negative",
  "bollinger_position": 0.02
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 54%
- **Summary**: Risk read: 30d vol 53.7%, max drawdown -30.8%, 30d return -7.0%.
- **Evidence**:
  - Max drawdown: -30.8%
  - 30d realized volatility: 53.7%
  - Sharpe-like score: 0.91
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5369,
  "realized_vol_90d": 0.544,
  "max_drawdown_pct": -30.84,
  "atr14": null,
  "change_30d_pct": -7.01,
  "sharpe_like_90d": 0.91,
  "beta": 1.218,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 12 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - SSRM vs. WPM: Which Stock Is the Better Value Option?
  - Here's Why Wheaton Precious Metals Corp. (WPM) is a Strong Momentum Stock
  - Have Global Tensions Affected the Price of Wheaton Precious Metal Stock?
  - Spanish Mountain Gold Announces Sale of a 1.5% Royalty to Wheaton Precious Metals for US$55 Million
  - The Top 10 Gold Royalty And Streaming Companies

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "SSRM vs. WPM: Which Stock Is the Better Value Option?",
    "Here's Why Wheaton Precious Metals Corp. (WPM) is a Strong Momentum Stock",
    "Have Global Tensions Affected the Price of Wheaton Precious Metal Stock?",
    "Spanish Mountain Gold Announces Sale of a 1.5% Royalty to Wheaton Precious Metals for US$55 Million",
    "The Top 10 Gold Royalty And Streaming Companies"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 27%
- **Summary**: Volume ratio 1.10x, price change -5.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.7M vs avg 2.5M
  - Market cap: 58.8B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.63) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 129.43,
  "change_pct": -5.19,
  "volume": 2743237,
  "avg_volume": 2486588,
  "volume_ratio": 1.1,
  "market_cap": 58768668438,
  "beta": 1.218,
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
- **Summary**: Revenue growth 83.3%, net margin 63.6%, trailing FCF 565.3M.
- **Evidence**:
  - Sector: Basic Materials
  - Revenue growth: 83.3%
  - Net cash: 1.1B

```json
{
  "company_name": "Wheaton Precious Metals Corp.",
  "sector": "Basic Materials",
  "industry": "Gold",
  "market_cap": 58768668438,
  "revenue_growth_pct": 83.33,
  "gross_margin_pct": 72.17,
  "net_margin_pct": 63.58,
  "trailing_fcf": 565306387,
  "cash": 1151493633,
  "total_debt": 7890613,
  "net_cash": 1143603020
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
