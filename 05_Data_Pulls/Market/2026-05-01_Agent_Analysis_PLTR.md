---
title: "PLTR Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "PLTR"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.18
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.97
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.63
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "pltr"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 18%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 18% confidence. Agent entropy is diffuse (0.97). Drivers: fundamentals, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro, microstructure
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.97)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 41%, bearish 37%, neutral 22%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.63)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 60% | 41ms | PLTR closed at 144.07. 7d -5.6%, 30d -7.5%. RSI 50.6, MACD bullish_cross. |
| risk | BEARISH | 61% | 2687ms | Risk read: 30d vol 57.8%, max drawdown -38.2%, 30d return -7.5%. |
| sentiment | NEUTRAL | 22% | 752ms | 20 headline(s): 1 positive, 1 negative, net score 0. |
| microstructure | BULLISH | 31% | 2928ms | Volume ratio 0.62x, price change 3.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 3200ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 65% | 1482ms | Revenue growth 56.2%, net margin 36.3%, trailing FCF 3.2B. |
| auction | NEUTRAL | 22% | 1817ms | Auction state: balance. at POC 144.27. Session bars: 390. |
| pair | NEUTRAL | 5% | 1ms | PLTR is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 1947ms | No recent earnings within 90 days for PLTR. |
| prediction_market | NEUTRAL | 12% | 71ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 60%
- **Summary**: PLTR closed at 144.07. 7d -5.6%, 30d -7.5%. RSI 50.6, MACD bullish_cross.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: bullish_cross

```json
{
  "api_symbol": "PLTR",
  "bars": 260,
  "close": 144.07,
  "change_7d_pct": -5.6,
  "change_30d_pct": -7.46,
  "sma20": 141.5625,
  "sma50": 145.1838,
  "sma200": 164.2952,
  "ema21": 142.9665,
  "rsi14": 50.61,
  "macd": -1.1435,
  "macd_signal": -1.2551,
  "macd_crossover": "bullish_cross",
  "bollinger_position": 0.602
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 57.8%, max drawdown -38.2%, 30d return -7.5%.
- **Evidence**:
  - Max drawdown: -38.2%
  - 30d realized volatility: 57.8%
  - Sharpe-like score: -1.29
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5775,
  "realized_vol_90d": 0.5272,
  "max_drawdown_pct": -38.19,
  "atr14": null,
  "change_30d_pct": -7.46,
  "sharpe_like_90d": -1.29,
  "beta": 1.674,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 20 headline(s): 1 positive, 1 negative, net score 0.
- **Evidence**:
  - SoundHound, Palantir, or C3.ai: Which AI Stock Won April? The Answer Will Surprise You
  - Here's How Much Palantir Stock Is Expected to Move After Earnings
  - Why Is Palantir Stock Falling, and is it a Buying Opportunity Before the Huge Investor Update?
  - With Trump's $1.5 Trillion Defense Budget, Palantir Looks Less Like a "Story Stock" and More Like a Strategic Vendor
  - Will Top-Line Improvement Benefit Palantir in Q1 Earnings?

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 1,
  "net_score": 0,
  "sample_headlines": [
    "SoundHound, Palantir, or C3.ai: Which AI Stock Won April? The Answer Will Surprise You",
    "Here's How Much Palantir Stock Is Expected to Move After Earnings",
    "Why Is Palantir Stock Falling, and is it a Buying Opportunity Before the Huge Investor Update?",
    "With Trump's $1.5 Trillion Defense Budget, Palantir Looks Less Like a \"Story Stock\" and More Like a Strategic Vendor",
    "Will Top-Line Improvement Benefit Palantir in Q1 Earnings?"
  ]
}
```

## Microstructure Agent

- **Signal**: BULLISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.62x, price change 3.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 33.0M vs avg 52.9M
  - Market cap: 330.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.63) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 144.07,
  "change_pct": 3.57,
  "volume": 33013669,
  "avg_volume": 52854177,
  "volume_ratio": 0.62,
  "market_cap": 330132082900,
  "beta": 1.674,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.63,
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
    "date": "2026-04-30",
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
- **Confidence**: 65%
- **Summary**: Revenue growth 56.2%, net margin 36.3%, trailing FCF 3.2B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 56.2%
  - Net cash: 1.2B

```json
{
  "company_name": "Palantir Technologies Inc.",
  "sector": "Technology",
  "industry": "Software - Infrastructure",
  "market_cap": 330132082900,
  "revenue_growth_pct": 56.18,
  "gross_margin_pct": 82.37,
  "net_margin_pct": 36.31,
  "trailing_fcf": 3242821999,
  "cash": 1423796000,
  "total_debt": 229338000,
  "net_cash": 1194458000,
  "cfq_score": 4.28,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 5,
    "fcf_margin": 5,
    "capital_intensity": 5,
    "pricing_power": 5,
    "balance_sheet": 5,
    "share_count_quality": 1,
    "margin_stability": 2
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 144.27. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 144.2683, VAH: 145.1318, VAL: 142.2535
  - TPO POC: 144.2683
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 144.07,
  "poc": 144.2683,
  "vah": 145.1318,
  "val": 142.2535,
  "tpo_poc": 144.2683,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 390,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: PLTR is not in any configured pair watchlist.

```json
{
  "symbol": "PLTR",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for PLTR.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "PLTR",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "AI Power Defense Stack".

```json
{
  "query": "AI Power Defense Stack",
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
