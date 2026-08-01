---
title: "MSFT Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "MSFT"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-05"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.3
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.97
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "msft"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 30%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 30% confidence. Agent entropy is diffuse (0.97). Drivers: fundamentals, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.97)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 31%, bearish 44%, neutral 24%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 38% | 299ms | MSFT closed at 417.2. 7d 1.1%, 30d 0.3%. RSI 47.7, MACD bearish_cross. |
| risk | BEARISH | 61% | 140ms | Risk read: 30d vol 32.8%, max drawdown -34.2%, 30d return 0.3%. |
| sentiment | NEUTRAL | 22% | 142ms | 20 headline(s): 1 positive, 1 negative, net score 0. |
| microstructure | BEARISH | 31% | 500ms | Volume ratio 0.53x, price change -2.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 498ms | Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%. |
| fundamentals | BULLISH | 55% | 432ms | Revenue growth 14.9%, net margin 36.1%, trailing FCF 142.3B. |
| auction | NEUTRAL | 22% | 811ms | Auction state: balance. below VAL 417.41. Session bars: 328. |
| pair | NEUTRAL | 5% | 2ms | MSFT is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 171ms | No recent earnings within 90 days for MSFT. |
| prediction_market | NEUTRAL | 12% | 15ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 38%
- **Summary**: MSFT closed at 417.2. 7d 1.1%, 30d 0.3%. RSI 47.7, MACD bearish_cross.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: bearish_cross

```json
{
  "api_symbol": "MSFT",
  "bars": 260,
  "close": 417.2,
  "change_7d_pct": 1.1,
  "change_30d_pct": 0.35,
  "sma20": 422.607,
  "sma50": 408.3606,
  "sma200": 456.3831,
  "ema21": 424.2104,
  "rsi14": 47.7,
  "macd": 5.5821,
  "macd_signal": 6.1954,
  "macd_crossover": "bearish_cross",
  "bollinger_position": 0.401
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 32.8%, max drawdown -34.2%, 30d return 0.3%.
- **Evidence**:
  - Max drawdown: -34.2%
  - 30d realized volatility: 32.8%
  - Sharpe-like score: -0.97
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3276,
  "realized_vol_90d": 0.3443,
  "max_drawdown_pct": -34.18,
  "atr14": null,
  "change_30d_pct": 0.35,
  "sharpe_like_90d": -0.97,
  "beta": 1.093,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 20 headline(s): 1 positive, 1 negative, net score 0.
- **Evidence**:
  - Microsoft Stock Charts Look Vulnerable. Software Stocks Could Follow.
  - Reid Hoffman to Leave Microsoft's Board of Directors
  - 3 Good AI Stocks to Take Profits On Right Now
  - Texas grid flags risks as data centers, crypto sites fail voltage tests
  - Billionaire Investor Bill Ackman: Buying Microsoft, Meta, and Amazon Today Could Be Like Adding Buffett's Berkshire Hathaway 25 Years Ago

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 1,
  "net_score": 0,
  "sample_headlines": [
    "Microsoft Stock Charts Look Vulnerable. Software Stocks Could Follow.",
    "Reid Hoffman to Leave Microsoft's Board of Directors",
    "3 Good AI Stocks to Take Profits On Right Now",
    "Texas grid flags risks as data centers, crypto sites fail voltage tests",
    "Billionaire Investor Bill Ackman: Buying Microsoft, Meta, and Amazon Today Could Be Like Adding Buffett's Berkshire Hathaway 25 Years Ago"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.53x, price change -2.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 20.3M vs avg 38.5M
  - Market cap: 3.1T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 416.95,
  "change_pct": -2.59,
  "volume": 20251623,
  "avg_volume": 38464356,
  "volume_ratio": 0.53,
  "market_cap": 3097283888500,
  "beta": 1.093,
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
- **Summary**: Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.4%
  - VIX: 15.40
  - HY spread: 2.7%

```json
{
  "DFF": {
    "date": "2026-06-03",
    "value": 3.62
  },
  "T10Y2Y": {
    "date": "2026-06-04",
    "value": 0.42
  },
  "VIXCLS": {
    "date": "2026-06-04",
    "value": 15.4
  },
  "BAMLH0A0HYM2": {
    "date": "2026-06-04",
    "value": 2.74
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
  "market_cap": 3097283888500,
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
- **Summary**: Auction state: balance. below VAL 417.41. Session bars: 328.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 419.9439, VAH: 423.3278, VAL: 417.406
  - TPO POC: 419.9439
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-06, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 416.95,
  "poc": 419.9439,
  "vah": 423.3278,
  "val": 417.406,
  "tpo_poc": 419.9439,
  "avwap": null,
  "avwap_anchor": "2026-05-06",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-06-05",
  "session_bar_count": 328,
  "daily_bar_count": 22
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
- **Auto-pulled**: 2026-06-05
