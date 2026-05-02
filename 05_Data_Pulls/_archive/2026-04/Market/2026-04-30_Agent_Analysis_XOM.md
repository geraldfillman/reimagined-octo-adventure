---
title: "XOM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "XOM"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.48
synthesis_mode: "deterministic"
entropy_level: "ordered"
entropy_score: 0.48
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "xom"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 48%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 48% confidence. Agent entropy is ordered (0.48). Drivers: price, fundamentals. 2 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: ordered (0.48)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 78%, bearish 0%, neutral 22%
- **Interpretation**: Below-average agent entropy: the stack has a clear lean with some counter-evidence.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 38% | 55ms | XOM closed at 154.67. 7d 4.7%, 30d -2.6%. RSI 52.8, MACD negative. |
| risk | NEUTRAL | 37% | 37ms | Risk read: 30d vol 31.3%, max drawdown -14.6%, 30d return -2.6%. |
| sentiment | BULLISH | 38% | 225ms | 12 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | BULLISH | 31% | 250ms | Volume ratio 0.65x, price change 2.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 301ms | Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%. |
| fundamentals | BULLISH | 34% | 138ms | Revenue growth -4.5%, net margin 8.9%, trailing FCF 23.6B. |
| prediction_market | NEUTRAL | 12% | 625ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: XOM closed at 154.67. 7d 4.7%, 30d -2.6%. RSI 52.8, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "XOM",
  "bars": 260,
  "close": 154.67,
  "change_7d_pct": 4.73,
  "change_30d_pct": -2.61,
  "sma20": 153.0115,
  "sma50": 154.714,
  "sma200": 127.4195,
  "ema21": 152.6793,
  "rsi14": 52.8,
  "macd": -1.6946,
  "macd_signal": -1.6376,
  "macd_crossover": "negative",
  "bollinger_position": 0.579
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 37%
- **Summary**: Risk read: 30d vol 31.3%, max drawdown -14.6%, 30d return -2.6%.
- **Evidence**:
  - Max drawdown: -14.6%
  - 30d realized volatility: 31.3%
  - Sharpe-like score: 2.87
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3126,
  "realized_vol_90d": 0.2837,
  "max_drawdown_pct": -14.6,
  "atr14": null,
  "change_30d_pct": -2.61,
  "sharpe_like_90d": 2.87,
  "beta": 0.288,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 12 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - These two energy stocks will benefit from UAE's decision to leave OPEC
  - Should iShares S&P 500 Value ETF (IVE) Be on Your Investing Radar?
  - Oil Surged to Its Highest Level Since 2022. Here's Why And the Best Oil Stocks to Buy.
  - FDVV vs. VYM: Same Dividend Focus, Very Different Sector Bets
  - Occidental Petroleum vs. Exxon Mobil: Comparing Scale in Quarterly Revenue

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "These two energy stocks will benefit from UAE's decision to leave OPEC",
    "Should iShares S&P 500 Value ETF (IVE) Be on Your Investing Radar?",
    "Oil Surged to Its Highest Level Since 2022. Here's Why And the Best Oil Stocks to Buy.",
    "FDVV vs. VYM: Same Dividend Focus, Very Different Sector Bets",
    "Occidental Petroleum vs. Exxon Mobil: Comparing Scale in Quarterly Revenue"
  ]
}
```

## Microstructure Agent

- **Signal**: BULLISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.65x, price change 2.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 14.6M vs avg 22.4M
  - Market cap: 642.9B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 154.67,
  "change_pct": 2.73,
  "volume": 14616787,
  "avg_volume": 22406372,
  "volume_ratio": 0.65,
  "market_cap": 642895135200,
  "beta": 0.288,
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
- **Confidence**: 34%
- **Summary**: Revenue growth -4.5%, net margin 8.9%, trailing FCF 23.6B.
- **Evidence**:
  - Sector: Energy
  - Revenue growth: -4.5%
  - Net cash: -59.6B

```json
{
  "company_name": "Exxon Mobil Corporation",
  "sector": "Energy",
  "industry": "Oil & Gas Integrated",
  "market_cap": 642895135200,
  "revenue_growth_pct": -4.52,
  "gross_margin_pct": 21.68,
  "net_margin_pct": 8.91,
  "trailing_fcf": 23612000000,
  "cash": 10681000000,
  "total_debt": 70257000000,
  "net_cash": -59576000000
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
