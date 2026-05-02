---
title: "WPM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "WPM"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.15
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.91
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "wpm"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 15%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 15% confidence. Agent entropy is diffuse (0.91). Drivers: fundamentals, macro. Risks: risk, price. 2 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.91)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 50%, bearish 35%, neutral 15%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 128ms | WPM closed at 124.89. 7d -16.3%, 30d -9.0%. RSI 36, MACD negative. |
| risk | BEARISH | 54% | 301ms | Risk read: 30d vol 54.4%, max drawdown -30.8%, 30d return -9.0%. |
| sentiment | BULLISH | 38% | 428ms | 12 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | NEUTRAL | 27% | 5481ms | Volume ratio 1.06x, price change -3.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 265ms | Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%. |
| fundamentals | BULLISH | 60% | 1323ms | Revenue growth 83.3%, net margin 63.6%, trailing FCF 565.3M. |
| prediction_market | NEUTRAL | 12% | 493ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: WPM closed at 124.89. 7d -16.3%, 30d -9.0%. RSI 36, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "WPM",
  "bars": 260,
  "close": 124.89,
  "change_7d_pct": -16.3,
  "change_30d_pct": -8.97,
  "sma20": 140.654,
  "sma50": 141.003,
  "sma200": 117.9654,
  "ema21": 138.3803,
  "rsi14": 35.98,
  "macd": -0.9673,
  "macd_signal": 0.985,
  "macd_crossover": "negative",
  "bollinger_position": -0.095
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 54%
- **Summary**: Risk read: 30d vol 54.4%, max drawdown -30.8%, 30d return -9.0%.
- **Evidence**:
  - Max drawdown: -30.8%
  - 30d realized volatility: 54.4%
  - Sharpe-like score: 0.7
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5441,
  "realized_vol_90d": 0.5475,
  "max_drawdown_pct": -30.84,
  "atr14": null,
  "change_30d_pct": -8.97,
  "sharpe_like_90d": 0.7,
  "beta": 1.218,
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
  - SSRM vs. WPM: Which Stock Is the Better Value Option?
  - Here's Why Wheaton Precious Metals Corp. (WPM) is a Strong Momentum Stock
  - Have Global Tensions Affected the Price of Wheaton Precious Metal Stock?

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "Global X Silver ETF Outperforms Sprott Gold ETF in 1 Year Return",
    "SIL vs. GDX: Silver Miners Outpaced Gold Miners in 2025. Will It Last?",
    "SSRM vs. WPM: Which Stock Is the Better Value Option?",
    "Here's Why Wheaton Precious Metals Corp. (WPM) is a Strong Momentum Stock",
    "Have Global Tensions Affected the Price of Wheaton Precious Metal Stock?"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 27%
- **Summary**: Volume ratio 1.06x, price change -3.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.6M vs avg 2.5M
  - Market cap: 56.7B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 124.89,
  "change_pct": -3.51,
  "volume": 2634243,
  "avg_volume": 2486588,
  "volume_ratio": 1.06,
  "market_cap": 56707247170,
  "beta": 1.218,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.66,
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
  "market_cap": 56707247170,
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
- **Auto-pulled**: 2026-04-30
