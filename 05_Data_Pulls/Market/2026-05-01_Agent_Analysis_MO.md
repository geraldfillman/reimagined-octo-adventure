---
title: "MO Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "MO"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.42
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.63
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "mo"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 42%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 42% confidence. Agent entropy is mixed (0.63). Drivers: price, fundamentals. 7 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.63)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 51%, bearish 0%, neutral 49%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 79% | 214ms | MO closed at 73.54. 7d 12.8%, 30d 13.0%. RSI 74.8, MACD positive. |
| risk | NEUTRAL | 33% | 210ms | Risk read: 30d vol 27.0%, max drawdown -19.1%, 30d return 13.0%. |
| sentiment | NEUTRAL | 22% | 301ms | 19 headline(s): 2 positive, 2 negative, net score 0. |
| microstructure | NEUTRAL | 24% | 307ms | Volume ratio 0.14x, price change 0.9%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 236ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 44% | 168ms | Revenue growth -1.5%, net margin 34.5%, trailing FCF 17.1B. |
| auction | NEUTRAL | 22% | 451ms | Auction state: balance. below VAL 73.33. Session bars: 28. |
| pair | NEUTRAL | 5% | 12ms | MO is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 150ms | No recent earnings within 90 days for MO. |
| prediction_market | NEUTRAL | 40% | 21ms | 10 prediction market(s) matched "MO". Top venue: Agent Analyst. |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 79%
- **Summary**: MO closed at 73.54. 7d 12.8%, 30d 13.0%. RSI 74.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "MO",
  "bars": 260,
  "close": 73.54,
  "change_7d_pct": 12.83,
  "change_30d_pct": 13.02,
  "sma20": 66.853,
  "sma50": 66.868,
  "sma200": 63.3293,
  "ema21": 67.4229,
  "rsi14": 74.77,
  "macd": 1.1901,
  "macd_signal": 0.3565,
  "macd_crossover": "positive",
  "bollinger_position": 1.2
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 27.0%, max drawdown -19.1%, 30d return 13.0%.
- **Evidence**:
  - Max drawdown: -19.1%
  - 30d realized volatility: 27.0%
  - Sharpe-like score: 2.72
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2699,
  "realized_vol_90d": 0.255,
  "max_drawdown_pct": -19.15,
  "atr14": null,
  "change_30d_pct": 13.02,
  "sharpe_like_90d": 2.72,
  "beta": 0.44691688,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 19 headline(s): 2 positive, 2 negative, net score 0.
- **Evidence**:
  - Altria: Inflation Is A Double-Edged Sword, But The Dividend Train Keeps Smoking
  - 5 Quality Passive Income Blue-Chips That All Yield 5% and More Safely
  - Why Altria Stock Popped Today
  - Want $1,307 in Passive Income? Invest $10,000 Into These 3 Dividend Kings
  - Altria Group, Inc. (MO) Q1 2026 Earnings Call Transcript

```json
{
  "headline_count": 19,
  "positive_count": 2,
  "negative_count": 2,
  "net_score": 0,
  "sample_headlines": [
    "Altria: Inflation Is A Double-Edged Sword, But The Dividend Train Keeps Smoking",
    "5 Quality Passive Income Blue-Chips That All Yield 5% and More Safely",
    "Why Altria Stock Popped Today",
    "Want $1,307 in Passive Income? Invest $10,000 Into These 3 Dividend Kings",
    "Altria Group, Inc. (MO) Q1 2026 Earnings Call Transcript"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.14x, price change 0.9%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.3M vs avg 9.4M
  - Market cap: 122.6B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 73.32,
  "change_pct": 0.92,
  "volume": 1274625,
  "avg_volume": 9363716,
  "volume_ratio": 0.14,
  "market_cap": 122583570085,
  "beta": 0.44691688,
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
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 16.89
  - HY spread: 2.8%

```json
{
  "DFF": {
    "date": "2026-04-29",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-30",
    "value": 0.52
  },
  "VIXCLS": {
    "date": "2026-04-30",
    "value": 16.89
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-30",
    "value": 2.83
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 44%
- **Summary**: Revenue growth -1.5%, net margin 34.5%, trailing FCF 17.1B.
- **Evidence**:
  - Sector: Consumer Defensive
  - Revenue growth: -1.5%
  - Net cash: -45.1B

```json
{
  "company_name": "Altria Group, Inc.",
  "sector": "Consumer Defensive",
  "industry": "Tobacco",
  "market_cap": 122583570085,
  "revenue_growth_pct": -1.49,
  "gross_margin_pct": 86.59,
  "net_margin_pct": 34.5,
  "trailing_fcf": 17074000000,
  "cash": 3531000000,
  "total_debt": 48662000000,
  "net_cash": -45131000000,
  "cfq_score": 3.91,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 5,
    "fcf_margin": 5,
    "capital_intensity": 5,
    "pricing_power": 2,
    "balance_sheet": 1,
    "share_count_quality": 5,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. below VAL 73.33. Session bars: 28.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 73.6218, VAH: 74.0627, VAL: 73.3279
  - TPO POC: 73.4748
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 73.32,
  "poc": 73.6218,
  "vah": 74.0627,
  "val": 73.3279,
  "tpo_poc": 73.4748,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 28,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: MO is not in any configured pair watchlist.

```json
{
  "symbol": "MO",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for MO.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "MO",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 40%
- **Summary**: 10 prediction market(s) matched "MO". Top venue: Agent Analyst.
- **Evidence**:
  - Agent Analyst: AME Agent Analysis (N/A)
  - Agent Analyst: BMY Agent Analysis (N/A)
  - Agent Analyst: CAH Agent Analysis (N/A)
  - Agent Analyst: FE Agent Analysis (N/A)
  - Agent Analyst: GOOG Agent Analysis (N/A)
- **Warnings**:
  - Live prediction-market APIs were disabled; local notes only.

```json
{
  "query": "MO",
  "live_enabled": false,
  "market_count": 10,
  "markets": [
    {
      "venue": "Agent Analyst",
      "title": "AME Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    },
    {
      "venue": "Agent Analyst",
      "title": "BMY Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    },
    {
      "venue": "Agent Analyst",
      "title": "CAH Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    },
    {
      "venue": "Agent Analyst",
      "title": "FE Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    },
    {
      "venue": "Agent Analyst",
      "title": "GOOG Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    }
  ]
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-05-01
