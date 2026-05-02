---
title: "XOM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "XOM"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.39
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.63
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "xom"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 39%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 39% confidence. Agent entropy is mixed (0.63). Drivers: price, macro. 4 neutral layer(s).
- **Top drivers**: price, macro, fundamentals
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.63)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 51%, bearish 0%, neutral 49%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 38% | 489ms | XOM closed at 150.56. 7d 2.8%, 30d -4.2%. RSI 45.6, MACD negative. |
| risk | NEUTRAL | 37% | 730ms | Risk read: 30d vol 30.3%, max drawdown -14.6%, 30d return -4.2%. |
| sentiment | NEUTRAL | 30% | 911ms | 12 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 1664ms | Volume ratio 0.64x, price change 1.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 98ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 34% | 1594ms | Revenue growth -4.5%, net margin 8.9%, trailing FCF 23.6B. |
| prediction_market | NEUTRAL | 12% | 532ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: XOM closed at 150.56. 7d 2.8%, 30d -4.2%. RSI 45.6, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "XOM",
  "bars": 260,
  "close": 150.56,
  "change_7d_pct": 2.81,
  "change_30d_pct": -4.24,
  "sma20": 153.761,
  "sma50": 154.5444,
  "sma200": 127.2158,
  "ema21": 152.4802,
  "rsi14": 45.56,
  "macd": -2.1695,
  "macd_signal": -1.6233,
  "macd_crossover": "negative",
  "bollinger_position": 0.375
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 37%
- **Summary**: Risk read: 30d vol 30.3%, max drawdown -14.6%, 30d return -4.2%.
- **Evidence**:
  - Max drawdown: -14.6%
  - 30d realized volatility: 30.3%
  - Sharpe-like score: 2.84
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3034,
  "realized_vol_90d": 0.283,
  "max_drawdown_pct": -14.6,
  "atr14": null,
  "change_30d_pct": -4.24,
  "sharpe_like_90d": 2.84,
  "beta": 0.288,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 12 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - Is iShares Core S&P U.S. Value ETF (IUSV) a Strong ETF Right Now?
  - Should You Invest in the iShares U.S. Energy ETF (IYE)?
  - Airlines will have a hard time making profits as jet fuel increases, expert says
  - Why These 3 Forever Stocks Belong on Your Watchlist
  - Is Chevron Stock Worth Buying Ahead of Q1 Earnings Release?

```json
{
  "headline_count": 12,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "Is iShares Core S&P U.S. Value ETF (IUSV) a Strong ETF Right Now?",
    "Should You Invest in the iShares U.S. Energy ETF (IYE)?",
    "Airlines will have a hard time making profits as jet fuel increases, expert says",
    "Why These 3 Forever Stocks Belong on Your Watchlist",
    "Is Chevron Stock Worth Buying Ahead of Q1 Earnings Release?"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.64x, price change 1.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 14.7M vs avg 23.0M
  - Market cap: 625.8B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 150.56,
  "change_pct": 1.6,
  "volume": 14703645,
  "avg_volume": 23017850,
  "volume_ratio": 0.64,
  "market_cap": 625811673600,
  "beta": 0.288,
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
  "market_cap": 625811673600,
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
- **Auto-pulled**: 2026-04-29
