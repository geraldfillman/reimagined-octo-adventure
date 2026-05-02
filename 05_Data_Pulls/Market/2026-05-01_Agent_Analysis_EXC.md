---
title: "EXC Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "EXC"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_MACRO_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.23
synthesis_mode: "deterministic"
entropy_level: "ordered"
entropy_score: 0.39
entropy_dominant_signal: "neutral"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "exc"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 23%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 23% confidence. Agent entropy is ordered (0.39). Drivers: macro. 9 neutral layer(s).
- **Top drivers**: macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: ordered (0.39)
- **Dominant signal bucket**: neutral
- **Distribution**: bullish 15%, bearish 0%, neutral 85%
- **Interpretation**: Below-average agent entropy: the stack has a clear lean with some counter-evidence.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 34% | 217ms | EXC closed at 46.56. 7d 1.5%, 30d -3.0%. RSI 43.2, MACD negative. |
| risk | NEUTRAL | 36% | 210ms | Risk read: 30d vol 19.3%, max drawdown -11.1%, 30d return -3.0%. |
| sentiment | NEUTRAL | 30% | 308ms | 20 headline(s): 3 positive, 2 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 288ms | Volume ratio 0.11x, price change 1.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 3263ms | Macro backdrop: VIX N/A, curve 0.52, HY spread 2.8%. |
| fundamentals | NEUTRAL | 30% | 164ms | Revenue growth 5.3%, net margin 11.4%, trailing FCF -3.8B. |
| auction | NEUTRAL | 22% | 218ms | Auction state: balance. above VAH 46.62. Session bars: 27. |
| pair | NEUTRAL | 5% | 12ms | EXC is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 166ms | No recent earnings within 90 days for EXC. |
| prediction_market | NEUTRAL | 12% | 25ms | No relevant prediction markets found for "EXC". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 34%
- **Summary**: EXC closed at 46.56. 7d 1.5%, 30d -3.0%. RSI 43.2, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "EXC",
  "bars": 260,
  "close": 46.565,
  "change_7d_pct": 1.54,
  "change_30d_pct": -3.01,
  "sma20": 47.4937,
  "sma50": 48.2489,
  "sma200": 45.7106,
  "ema21": 47.2526,
  "rsi14": 43.22,
  "macd": -0.4935,
  "macd_signal": -0.404,
  "macd_crossover": "negative",
  "bollinger_position": 0.293
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 36%
- **Summary**: Risk read: 30d vol 19.3%, max drawdown -11.1%, 30d return -3.0%.
- **Evidence**:
  - Max drawdown: -11.1%
  - 30d realized volatility: 19.3%
  - Sharpe-like score: 0.98
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.1929,
  "realized_vol_90d": 0.2052,
  "max_drawdown_pct": -11.07,
  "atr14": null,
  "change_30d_pct": -3.01,
  "sharpe_like_90d": 0.98,
  "beta": 0.505,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 3 positive, 2 negative, net score 1.
- **Evidence**:
  - Xcel Energy Q1 Earnings Match Estimates, Revenues Miss, Both Up Y/Y
  - Consolidated Edison (ED) Earnings Expected to Grow: What to Know Ahead of Next Week's Release
  - Exelon Commends FERC for Order Extending PJM Price Collar, Continuing Cost-Saving Measure for Customers
  - Earnings Preview: Exelon (EXC) Q1 Earnings Expected to Decline
  - Exelon Corporation Declares Dividend

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 2,
  "net_score": 1,
  "sample_headlines": [
    "Xcel Energy Q1 Earnings Match Estimates, Revenues Miss, Both Up Y/Y",
    "Consolidated Edison (ED) Earnings Expected to Grow: What to Know Ahead of Next Week's Release",
    "Exelon Commends FERC for Order Extending PJM Price Collar, Continuing Cost-Saving Measure for Customers",
    "Earnings Preview: Exelon (EXC) Q1 Earnings Expected to Decline",
    "Exelon Corporation Declares Dividend"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.11x, price change 1.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 981.2K vs avg 9.0M
  - Market cap: 47.8B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 46.77,
  "change_pct": 1.7,
  "volume": 981163,
  "avg_volume": 9004785,
  "volume_ratio": 0.11,
  "market_cap": 47840565768,
  "beta": 0.505,
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
- **Summary**: Macro backdrop: VIX N/A, curve 0.52, HY spread 2.8%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: N/A
  - HY spread: 2.8%
- **Warnings**:
  - VIXCLS unavailable: Failed after 2 attempts: Server error 500: Internal Server Error

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
  "BAMLH0A0HYM2": {
    "date": "2026-04-30",
    "value": 2.83
  }
}
```

## Fundamentals Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: Revenue growth 5.3%, net margin 11.4%, trailing FCF -3.8B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 5.3%
  - Net cash: -49.4B

```json
{
  "company_name": "Exelon Corporation",
  "sector": "Utilities",
  "industry": "Regulated Electric",
  "market_cap": 47840565768,
  "revenue_growth_pct": 5.34,
  "gross_margin_pct": 27.92,
  "net_margin_pct": 11.41,
  "trailing_fcf": -3803000000,
  "cash": 1151000000,
  "total_debt": 50553000000,
  "net_cash": -49402000000,
  "cfq_score": 2,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 0,
    "fcf_margin": 0,
    "capital_intensity": 0,
    "pricing_power": 3.5,
    "balance_sheet": 1,
    "share_count_quality": 3,
    "margin_stability": 4
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. above VAH 46.62. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 46.1555, VAH: 46.6193, VAL: 46.1555
  - TPO POC: 46.2483
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 46.77,
  "poc": 46.1555,
  "vah": 46.6193,
  "val": 46.1555,
  "tpo_poc": 46.2483,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 27,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: EXC is not in any configured pair watchlist.

```json
{
  "symbol": "EXC",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for EXC.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "EXC",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "EXC".

```json
{
  "query": "EXC",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-05-01
