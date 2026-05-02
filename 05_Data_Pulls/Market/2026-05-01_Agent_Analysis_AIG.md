---
title: "AIG Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AIG"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.38
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.62
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.65
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "aig"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 38%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 38% confidence. Agent entropy is mixed (0.62). Drivers: fundamentals, macro. 6 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.62)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 59%, bearish 0%, neutral 41%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.65)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 30% | 196ms | AIG closed at 78.36. 7d 3.1%, 30d 6.0%. RSI 58.6, MACD negative. |
| risk | NEUTRAL | 31% | 198ms | Risk read: 30d vol 22.6%, max drawdown -17.7%, 30d return 6.0%. |
| sentiment | BULLISH | 46% | 308ms | 20 headline(s): 3 positive, 1 negative, net score 3. |
| microstructure | BULLISH | 31% | 591ms | Volume ratio 0.28x, price change 5.0%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 273ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 44% | 387ms | Revenue growth -1.8%, net margin 11.6%, trailing FCF 6.6B. |
| auction | NEUTRAL | 22% | 223ms | Auction state: balance. at POC 78.43. Session bars: 28. |
| pair | NEUTRAL | 5% | 11ms | AIG is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 155ms | No recent earnings within 90 days for AIG. |
| prediction_market | NEUTRAL | 12% | 22ms | No relevant prediction markets found for "AIG". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: AIG closed at 78.36. 7d 3.1%, 30d 6.0%. RSI 58.6, MACD negative.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "AIG",
  "bars": 260,
  "close": 78.355,
  "change_7d_pct": 3.06,
  "change_30d_pct": 6.04,
  "sma20": 76.6348,
  "sma50": 76.9253,
  "sma200": 78.388,
  "ema21": 76.172,
  "rsi14": 58.58,
  "macd": -0.2576,
  "macd_signal": -0.1878,
  "macd_crossover": "negative",
  "bollinger_position": 0.785
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 31%
- **Summary**: Risk read: 30d vol 22.6%, max drawdown -17.7%, 30d return 6.0%.
- **Evidence**:
  - Max drawdown: -17.7%
  - 30d realized volatility: 22.6%
  - Sharpe-like score: -0.9
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2262,
  "realized_vol_90d": 0.2544,
  "max_drawdown_pct": -17.69,
  "atr14": null,
  "change_30d_pct": 6.04,
  "sharpe_like_90d": -0.9,
  "beta": 0.6017133,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 3 positive, 1 negative, net score 3.
- **Evidence**:
  - American International Group: Underwriting Proves Resilient Again In Q1
  - American International Group (AIG) Q1 Earnings and Revenues Beat Estimates
  - Compared to Estimates, American International Group (AIG) Q1 Earnings: A Look at Key Metrics
  - AIG Reports Excellent First Quarter 2026 Results
  - What Analyst Projections for Key Metrics Reveal About American International Group (AIG) Q1 Earnings

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 1,
  "net_score": 3,
  "sample_headlines": [
    "American International Group: Underwriting Proves Resilient Again In Q1",
    "American International Group (AIG) Q1 Earnings and Revenues Beat Estimates",
    "Compared to Estimates, American International Group (AIG) Q1 Earnings: A Look at Key Metrics",
    "AIG Reports Excellent First Quarter 2026 Results",
    "What Analyst Projections for Key Metrics Reveal About American International Group (AIG) Q1 Earnings"
  ]
}
```

## Microstructure Agent

- **Signal**: BULLISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.28x, price change 5.0%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.2M vs avg 4.3M
  - Market cap: 42.2B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.65) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 78.56,
  "change_pct": 5.03,
  "volume": 1205346,
  "avg_volume": 4261362,
  "volume_ratio": 0.28,
  "market_cap": 42152153521,
  "beta": 0.6017133,
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
- **Summary**: Revenue growth -1.8%, net margin 11.6%, trailing FCF 6.6B.
- **Evidence**:
  - Sector: Financial Services
  - Revenue growth: -1.8%
  - Net cash: 0.0

```json
{
  "company_name": "American International Group, Inc.",
  "sector": "Financial Services",
  "industry": "Insurance - Diversified",
  "market_cap": 42152153521,
  "revenue_growth_pct": -1.82,
  "gross_margin_pct": 34.51,
  "net_margin_pct": 11.56,
  "trailing_fcf": 6587000000,
  "cash": 0,
  "total_debt": 0,
  "net_cash": 0,
  "cfq_score": 3.64,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 3,
    "fcf_conversion": 4,
    "fcf_margin": 3,
    "capital_intensity": 5,
    "pricing_power": 1,
    "balance_sheet": 5,
    "share_count_quality": 5,
    "margin_stability": 4
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 78.43. Session bars: 28.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 78.4262, VAH: 78.5837, VAL: 78.2688
  - TPO POC: 78.4262
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 78.56,
  "poc": 78.4262,
  "vah": 78.5837,
  "val": 78.2688,
  "tpo_poc": 78.4262,
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
- **Summary**: AIG is not in any configured pair watchlist.

```json
{
  "symbol": "AIG",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for AIG.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "AIG",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "AIG".

```json
{
  "query": "AIG",
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
