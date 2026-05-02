---
title: "AXP Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AXP"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.22
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.99
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.65
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "axp"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 22%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 22% confidence. Agent entropy is diffuse (0.99). Drivers: fundamentals, macro. Risks: risk, price. 3 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.99)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 32%, bearish 41%, neutral 28%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.65)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 45% | 206ms | AXP closed at 315.9. 7d -4.8%, 30d 5.9%. RSI 48.4, MACD bearish_cross. |
| risk | BEARISH | 52% | 205ms | Risk read: 30d vol 25.3%, max drawdown -24.1%, 30d return 5.9%. |
| sentiment | NEUTRAL | 30% | 289ms | 12 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 761ms | Volume ratio 0.56x, price change -1.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 1337ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 39% | 327ms | Revenue growth 8.4%, net margin 13.5%, trailing FCF 14.3B. |
| prediction_market | NEUTRAL | 12% | 722ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: AXP closed at 315.9. 7d -4.8%, 30d 5.9%. RSI 48.4, MACD bearish_cross.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: bearish_cross

```json
{
  "api_symbol": "AXP",
  "bars": 260,
  "close": 315.9,
  "change_7d_pct": -4.76,
  "change_30d_pct": 5.94,
  "sma20": 318.085,
  "sma50": 313.6394,
  "sma200": 335.967,
  "ema21": 318.3176,
  "rsi14": 48.36,
  "macd": 2.563,
  "macd_signal": 3.0802,
  "macd_crossover": "bearish_cross",
  "bollinger_position": 0.447
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 52%
- **Summary**: Risk read: 30d vol 25.3%, max drawdown -24.1%, 30d return 5.9%.
- **Evidence**:
  - Max drawdown: -24.1%
  - 30d realized volatility: 25.3%
  - Sharpe-like score: -1.61
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2533,
  "realized_vol_90d": 0.2969,
  "max_drawdown_pct": -24.06,
  "atr14": null,
  "change_30d_pct": 5.94,
  "sharpe_like_90d": -1.61,
  "beta": 1.133,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 12 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - Warren Buffett Will Never Sell These 4 Favorite ‘Forever' Dividend Giants
  - Greg Abel Has Over 50% of Berkshire Hathaway's Stock Portfolio Invested in 3 Forever Stocks
  - Visa, Mastercard, American Express Are Down by Double Digits in 2026: Buying Opportunity or Trap?
  - Mastercard Before Q1 Earnings: A Smart Bet or an Expensive Checkout?
  - Sustainability LIVE Confirms Speakers from Jaguar Land Rover, Virgin and American Express for London Climate Action Week

```json
{
  "headline_count": 12,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "Warren Buffett Will Never Sell These 4 Favorite ‘Forever' Dividend Giants",
    "Greg Abel Has Over 50% of Berkshire Hathaway's Stock Portfolio Invested in 3 Forever Stocks",
    "Visa, Mastercard, American Express Are Down by Double Digits in 2026: Buying Opportunity or Trap?",
    "Mastercard Before Q1 Earnings: A Smart Bet or an Expensive Checkout?",
    "Sustainability LIVE Confirms Speakers from Jaguar Land Rover, Virgin and American Express for London Climate Action Week"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.56x, price change -1.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.0M vs avg 3.6M
  - Market cap: 214.9B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.65) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 314.96,
  "change_pct": -1.22,
  "volume": 2046898,
  "avg_volume": 3647840,
  "volume_ratio": 0.56,
  "market_cap": 214905536487,
  "beta": 1.133,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.65,
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
- **Confidence**: 39%
- **Summary**: Revenue growth 8.4%, net margin 13.5%, trailing FCF 14.3B.
- **Evidence**:
  - Sector: Financial Services
  - Revenue growth: 8.4%
  - Net cash: -6.7B

```json
{
  "company_name": "American Express Company",
  "sector": "Financial Services",
  "industry": "Financial - Credit Services",
  "market_cap": 214905536487,
  "revenue_growth_pct": 8.44,
  "gross_margin_pct": 83.23,
  "net_margin_pct": 13.46,
  "trailing_fcf": 14324000000,
  "cash": 53757000000,
  "total_debt": 60442000000,
  "net_cash": -6685000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Buffett Style Quality Compounders".

```json
{
  "query": "Buffett Style Quality Compounders",
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
