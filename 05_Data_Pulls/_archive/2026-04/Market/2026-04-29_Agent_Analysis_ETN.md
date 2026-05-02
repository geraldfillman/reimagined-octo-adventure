---
title: "ETN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "ETN"
asset_type: "stock"
thesis_name: "Druckenmiller Style Secular Trend Leaders"
related_theses: ["[[Druckenmiller Style Secular Trend Leaders]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.49
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.61
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.65
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "etn"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 49%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 49% confidence. Agent entropy is mixed (0.61). Drivers: price, macro. 4 neutral layer(s).
- **Top drivers**: price, macro, fundamentals
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.61)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 62%, bearish 0%, neutral 38%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.65)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 2530ms | ETN closed at 413.07. 7d 1.7%, 30d 14.4%. RSI 63.1, MACD positive. |
| risk | NEUTRAL | 33% | 2727ms | Risk read: 30d vol 34.1%, max drawdown -19.6%, 30d return 14.4%. |
| sentiment | NEUTRAL | 22% | 2845ms | 11 headline(s): 0 positive, 0 negative, net score 0. |
| microstructure | NEUTRAL | 28% | 3342ms | Volume ratio 0.92x, price change -0.9%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 247ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 34% | 3595ms | Revenue growth 10.3%, net margin 14.9%, trailing FCF 4.5B. |
| prediction_market | NEUTRAL | 12% | 464ms | No relevant prediction markets found for "Druckenmiller Style Secular Trend Leaders". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: ETN closed at 413.07. 7d 1.7%, 30d 14.4%. RSI 63.1, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "ETN",
  "bars": 260,
  "close": 413.07,
  "change_7d_pct": 1.69,
  "change_30d_pct": 14.41,
  "sma20": 395.7375,
  "sma50": 376.6416,
  "sma200": 361.7729,
  "ema21": 398.3831,
  "rsi14": 63.09,
  "macd": 13.7525,
  "macd_signal": 12.2909,
  "macd_crossover": "positive",
  "bollinger_position": 0.708
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 34.1%, max drawdown -19.6%, 30d return 14.4%.
- **Evidence**:
  - Max drawdown: -19.6%
  - 30d realized volatility: 34.1%
  - Sharpe-like score: 2.08
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3412,
  "realized_vol_90d": 0.3286,
  "max_drawdown_pct": -19.59,
  "atr14": null,
  "change_30d_pct": 14.41,
  "sharpe_like_90d": 2.08,
  "beta": 1.164,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 11 headline(s): 0 positive, 0 negative, net score 0.
- **Evidence**:
  - Eaton (ETN) Earnings Expected to Grow: Should You Buy?
  - Eaton (ETN) Stock Declines While Market Improves: Some Information for Investors
  - This Oil ETN Pays a 21% Yield. Most Investors Don't Realize It's Not an ETF.
  - Eaton (NYSE:ETN) Sets New 1-Year High  – What’s Next?
  - Eaton Corporation, PLC (ETN) Is a Trending Stock: Facts to Know Before Betting on It

```json
{
  "headline_count": 11,
  "positive_count": 0,
  "negative_count": 0,
  "net_score": 0,
  "sample_headlines": [
    "Eaton (ETN) Earnings Expected to Grow: Should You Buy?",
    "Eaton (ETN) Stock Declines While Market Improves: Some Information for Investors",
    "This Oil ETN Pays a 21% Yield. Most Investors Don't Realize It's Not an ETF.",
    "Eaton (NYSE:ETN) Sets New 1-Year High  – What’s Next?",
    "Eaton Corporation, PLC (ETN) Is a Trending Stock: Facts to Know Before Betting on It"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.92x, price change -0.9%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.5M vs avg 2.7M
  - Market cap: 160.3B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.65) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 413.07,
  "change_pct": -0.89,
  "volume": 2482757,
  "avg_volume": 2700708,
  "volume_ratio": 0.92,
  "market_cap": 160264963950,
  "beta": 1.164,
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
- **Confidence**: 34%
- **Summary**: Revenue growth 10.3%, net margin 14.9%, trailing FCF 4.5B.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 10.3%
  - Net cash: -10.5B

```json
{
  "company_name": "Eaton Corporation plc",
  "sector": "Industrials",
  "industry": "Industrial - Machinery",
  "market_cap": 160264963950,
  "revenue_growth_pct": 10.33,
  "gross_margin_pct": 37.59,
  "net_margin_pct": 14.9,
  "trailing_fcf": 4472000000,
  "cash": 622000000,
  "total_debt": 11169000000,
  "net_cash": -10547000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Druckenmiller Style Secular Trend Leaders".

```json
{
  "query": "Druckenmiller Style Secular Trend Leaders",
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
