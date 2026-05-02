---
title: "AXP Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AXP"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.23
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.99
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.64
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "axp"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 23%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 23% confidence. Agent entropy is diffuse (0.99). Drivers: fundamentals, macro. Risks: risk, price. 3 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.99)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 29%, bearish 41%, neutral 30%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.64)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 45% | 231ms | AXP closed at 315.65. 7d -4.3%, 30d 5.1%. RSI 48.1, MACD negative. |
| risk | BEARISH | 52% | 241ms | Risk read: 30d vol 25.3%, max drawdown -24.1%, 30d return 5.1%. |
| sentiment | NEUTRAL | 30% | 360ms | 12 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 28% | 426ms | Volume ratio 0.80x, price change -0.1%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 342ms | Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%. |
| fundamentals | BULLISH | 39% | 661ms | Revenue growth 8.4%, net margin 13.5%, trailing FCF 14.3B. |
| prediction_market | NEUTRAL | 12% | 762ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: AXP closed at 315.65. 7d -4.3%, 30d 5.1%. RSI 48.1, MACD negative.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "AXP",
  "bars": 260,
  "close": 315.65,
  "change_7d_pct": -4.31,
  "change_30d_pct": 5.12,
  "sma20": 318.7435,
  "sma50": 313.0618,
  "sma200": 335.9406,
  "ema21": 318.0751,
  "rsi14": 48.15,
  "macd": 1.9976,
  "macd_signal": 2.8636,
  "macd_crossover": "negative",
  "bollinger_position": 0.42
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 52%
- **Summary**: Risk read: 30d vol 25.3%, max drawdown -24.1%, 30d return 5.1%.
- **Evidence**:
  - Max drawdown: -24.1%
  - 30d realized volatility: 25.3%
  - Sharpe-like score: -1.49
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.253,
  "realized_vol_90d": 0.2962,
  "max_drawdown_pct": -24.06,
  "atr14": null,
  "change_30d_pct": 5.12,
  "sharpe_like_90d": -1.49,
  "beta": 1.133,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 12 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - U.S. Consumer American Express® Gold Card Introduces New and Enhanced Benefits as Part of 60th Anniversary Celebration
  - Warren Buffett Will Never Sell These 4 Favorite ‘Forever' Dividend Giants
  - Greg Abel Has Over 50% of Berkshire Hathaway's Stock Portfolio Invested in 3 Forever Stocks
  - Visa, Mastercard, American Express Are Down by Double Digits in 2026: Buying Opportunity or Trap?
  - Mastercard Before Q1 Earnings: A Smart Bet or an Expensive Checkout?

```json
{
  "headline_count": 12,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "U.S. Consumer American Express® Gold Card Introduces New and Enhanced Benefits as Part of 60th Anniversary Celebration",
    "Warren Buffett Will Never Sell These 4 Favorite ‘Forever' Dividend Giants",
    "Greg Abel Has Over 50% of Berkshire Hathaway's Stock Portfolio Invested in 3 Forever Stocks",
    "Visa, Mastercard, American Express Are Down by Double Digits in 2026: Buying Opportunity or Trap?",
    "Mastercard Before Q1 Earnings: A Smart Bet or an Expensive Checkout?"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.80x, price change -0.1%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.9M vs avg 3.6M
  - Market cap: 215.4B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.64) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 315.64,
  "change_pct": -0.08,
  "volume": 2905062,
  "avg_volume": 3647840,
  "volume_ratio": 0.8,
  "market_cap": 215369518469,
  "beta": 1.133,
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
  "market_cap": 215369518469,
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
- **Auto-pulled**: 2026-04-30
