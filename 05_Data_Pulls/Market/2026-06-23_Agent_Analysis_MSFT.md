---
title: "MSFT Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "MSFT"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-23"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BEARISH"
final_confidence: 0.41
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.91
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.68
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "msft"]
---

## Verdict

- **Final verdict**: BEARISH
- **Final confidence**: 41%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bearish at 41% confidence. Agent entropy is diffuse (0.91). Drivers: fundamentals, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price, sentiment

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.91)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 24%, bearish 55%, neutral 21%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.68)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 83% | 28ms | MSFT closed at 373.22. 7d -4.4%, 30d -10.1%. RSI 34.8, MACD negative. |
| risk | BEARISH | 72% | 40ms | Risk read: 30d vol 34.3%, max drawdown -34.2%, 30d return -10.1%. |
| sentiment | BEARISH | 38% | 78ms | 20 headline(s): 1 positive, 2 negative, net score -2. |
| microstructure | NEUTRAL | 24% | 270ms | Volume ratio 0.55x, price change 1.9%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 239ms | Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%. |
| fundamentals | BULLISH | 55% | 529ms | Revenue growth 14.9%, net margin 36.1%, trailing FCF 142.3B. |
| auction | NEUTRAL | 22% | 855ms | Auction state: balance. inside value 372.91–375.16. Session bars: 245. |
| pair | NEUTRAL | 5% | 1ms | MSFT is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 953ms | No recent earnings within 90 days for MSFT. |
| prediction_market | NEUTRAL | 12% | 44ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 83%
- **Summary**: MSFT closed at 373.22. 7d -4.4%, 30d -10.1%. RSI 34.8, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "MSFT",
  "bars": 260,
  "close": 373.22,
  "change_7d_pct": -4.39,
  "change_30d_pct": -10.09,
  "sma20": 408.2935,
  "sma50": 412.9082,
  "sma200": 449.9857,
  "ema21": 399.4553,
  "rsi14": 34.83,
  "macd": -11.3085,
  "macd_signal": -6.1998,
  "macd_crossover": "negative",
  "bollinger_position": 0.149
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 72%
- **Summary**: Risk read: 30d vol 34.3%, max drawdown -34.2%, 30d return -10.1%.
- **Evidence**:
  - Max drawdown: -34.2%
  - 30d realized volatility: 34.3%
  - Sharpe-like score: -0.61
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3434,
  "realized_vol_90d": 0.2976,
  "max_drawdown_pct": -34.18,
  "atr14": null,
  "change_30d_pct": -10.09,
  "sharpe_like_90d": -0.61,
  "beta": 1.103,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BEARISH
- **Confidence**: 38%
- **Summary**: 20 headline(s): 1 positive, 2 negative, net score -2.
- **Evidence**:
  - Deadline Approaching: Microsoft Corporation (MSFT) Shareholders Who Lost Money Urged To Contact Law Offices of Howard G. Smith
  - 3 Screaming Buy Artificial Intelligence (AI) Stocks Set for a Massive Summer Rebound
  - Why Microsoft Needs to Carve its Own AI Path
  - Wall Street analyst updates Microsoft stock price target
  - MSFT Investors Have Opportunity to Lead Microsoft Corporation Securities Fraud Lawsuit with the Schall Law Firm

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 2,
  "net_score": -2,
  "sample_headlines": [
    "Deadline Approaching: Microsoft Corporation (MSFT) Shareholders Who Lost Money Urged To Contact Law Offices of Howard G. Smith",
    "3 Screaming Buy Artificial Intelligence (AI) Stocks Set for a Massive Summer Rebound",
    "Why Microsoft Needs to Carve its Own AI Path",
    "Wall Street analyst updates Microsoft stock price target",
    "MSFT Investors Have Opportunity to Lead Microsoft Corporation Securities Fraud Lawsuit with the Schall Law Firm"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.55x, price change 1.9%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 20.7M vs avg 37.4M
  - Market cap: 2.8T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.68) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 374.2558,
  "change_pct": 1.88,
  "volume": 20692986.7327,
  "avg_volume": 37384649,
  "volume_ratio": 0.55,
  "market_cap": 2780133012394,
  "beta": 1.103,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.68,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 31%
- **Summary**: Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.3%
  - VIX: 17.28
  - HY spread: 2.6%

```json
{
  "DFF": {
    "date": "2026-06-19",
    "value": 3.63
  },
  "T10Y2Y": {
    "date": "2026-06-22",
    "value": 0.27
  },
  "VIXCLS": {
    "date": "2026-06-22",
    "value": 17.28
  },
  "BAMLH0A0HYM2": {
    "date": "2026-06-22",
    "value": 2.65
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 55%
- **Summary**: Revenue growth 14.9%, net margin 36.1%, trailing FCF 142.3B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 14.9%
  - Net cash: -24.9B

```json
{
  "company_name": "Microsoft Corporation",
  "sector": "Technology",
  "industry": "Software - Infrastructure",
  "market_cap": 2780133012394,
  "revenue_growth_pct": 14.93,
  "gross_margin_pct": 68.82,
  "net_margin_pct": 36.15,
  "trailing_fcf": 142281000000,
  "cash": 32105000000,
  "total_debt": 56965000000,
  "net_cash": -24860000000,
  "cfq_score": 3.94,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 3,
    "fcf_margin": 5,
    "capital_intensity": 1,
    "pricing_power": 5,
    "balance_sheet": 4,
    "share_count_quality": 4,
    "margin_stability": 4.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 372.91–375.16. Session bars: 245.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 372.9136, VAH: 375.1572, VAL: 372.9136
  - TPO POC: 372.9136
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-24, bars: 20).

```json
{
  "auction_state": "balance",
  "current_price": 374.2558,
  "poc": 372.9136,
  "vah": 375.1572,
  "val": 372.9136,
  "tpo_poc": 372.9136,
  "avwap": null,
  "avwap_anchor": "2026-05-24",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-06-23",
  "session_bar_count": 245,
  "daily_bar_count": 20
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: MSFT is not in any configured pair watchlist.

```json
{
  "symbol": "MSFT",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for MSFT.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "MSFT",
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
- **Auto-pulled**: 2026-06-23
