---
title: "EBAY Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "EBAY"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.46
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.58
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.62
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "ebay"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 46%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 46% confidence. Agent entropy is mixed (0.58). Drivers: price, sentiment. 6 neutral layer(s).
- **Top drivers**: price, sentiment, fundamentals
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.58)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 67%, bearish 0%, neutral 33%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.62)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 53% | 185ms | EBAY closed at 101.58. 7d -3.8%, 30d 12.0%. RSI 55.7, MACD negative. |
| risk | NEUTRAL | 33% | 199ms | Risk read: 30d vol 32.7%, max drawdown -21.2%, 30d return 12.0%. |
| sentiment | BULLISH | 75% | 296ms | 20 headline(s): 4 positive, 0 negative, net score 8. |
| microstructure | NEUTRAL | 24% | 270ms | Volume ratio 0.08x, price change -1.8%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 221ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 50% | 150ms | Revenue growth 7.9%, net margin 18.3%, trailing FCF 3.8B. |
| auction | NEUTRAL | 22% | 634ms | Auction state: balance. at POC 101.62. Session bars: 28. |
| pair | NEUTRAL | 5% | 12ms | EBAY is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 141ms | No recent earnings within 90 days for EBAY. |
| prediction_market | NEUTRAL | 12% | 23ms | No relevant prediction markets found for "EBAY". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 53%
- **Summary**: EBAY closed at 101.58. 7d -3.8%, 30d 12.0%. RSI 55.7, MACD negative.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "EBAY",
  "bars": 260,
  "close": 101.585,
  "change_7d_pct": -3.83,
  "change_30d_pct": 11.95,
  "sma20": 100.7833,
  "sma50": 94.3627,
  "sma200": 90.2108,
  "ema21": 100.007,
  "rsi14": 55.67,
  "macd": 2.4954,
  "macd_signal": 2.8325,
  "macd_crossover": "negative",
  "bollinger_position": 0.557
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 32.7%, max drawdown -21.2%, 30d return 12.0%.
- **Evidence**:
  - Max drawdown: -21.2%
  - 30d realized volatility: 32.7%
  - Sharpe-like score: 1.63
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3272,
  "realized_vol_90d": 0.3527,
  "max_drawdown_pct": -21.2,
  "atr14": null,
  "change_30d_pct": 11.95,
  "sharpe_like_90d": 1.63,
  "beta": 1.33,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 75%
- **Summary**: 20 headline(s): 4 positive, 0 negative, net score 8.
- **Evidence**:
  - eBay Inc. (EBAY) Q1 2026 Earnings Call Transcript
  - Stock Market Today, April 30: Amazon Rises on AWS AI Growth and an Earnings Beat
  - eBay: Soaring GMV At A Reasonable Price
  - eBay's strong first half overshadowed by second-half growth concerns
  - eBay Inc (EBAY) Q1 2026 Earnings Call Highlights: Strong Growth Amidst Global Challenges

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 0,
  "net_score": 8,
  "sample_headlines": [
    "eBay Inc. (EBAY) Q1 2026 Earnings Call Transcript",
    "Stock Market Today, April 30: Amazon Rises on AWS AI Growth and an Earnings Beat",
    "eBay: Soaring GMV At A Reasonable Price",
    "eBay's strong first half overshadowed by second-half growth concerns",
    "eBay Inc (EBAY) Q1 2026 Earnings Call Highlights: Strong Growth Amidst Global Challenges"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.08x, price change -1.8%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 474.4K vs avg 5.7M
  - Market cap: 45.5B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.62) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 101.66,
  "change_pct": -1.76,
  "volume": 474403.04232,
  "avg_volume": 5667109,
  "volume_ratio": 0.08,
  "market_cap": 45543680000,
  "beta": 1.33,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.62,
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
- **Confidence**: 50%
- **Summary**: Revenue growth 7.9%, net margin 18.3%, trailing FCF 3.8B.
- **Evidence**:
  - Sector: Consumer Cyclical
  - Revenue growth: 7.9%
  - Net cash: -4.2B

```json
{
  "company_name": "eBay Inc.",
  "sector": "Consumer Cyclical",
  "industry": "Specialty Retail",
  "market_cap": 45543680000,
  "revenue_growth_pct": 7.95,
  "gross_margin_pct": 71.45,
  "net_margin_pct": 18.3,
  "trailing_fcf": 3816000000,
  "cash": 2894000000,
  "total_debt": 7076000000,
  "net_cash": -4182000000,
  "cfq_score": 3.73,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 3,
    "fcf_margin": 4,
    "capital_intensity": 4,
    "pricing_power": 4,
    "balance_sheet": 3,
    "share_count_quality": 5,
    "margin_stability": 3.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 101.62. Session bars: 28.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 101.6158, VAH: 102.8415, VAL: 101.2073
  - TPO POC: 101.6158
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 101.66,
  "poc": 101.6158,
  "vah": 102.8415,
  "val": 101.2073,
  "tpo_poc": 101.6158,
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
- **Summary**: EBAY is not in any configured pair watchlist.

```json
{
  "symbol": "EBAY",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for EBAY.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "EBAY",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "EBAY".

```json
{
  "query": "EBAY",
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
