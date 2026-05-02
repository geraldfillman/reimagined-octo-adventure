---
title: "AMZN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AMZN"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-05-02"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.45
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.59
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "amzn"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 45%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 45% confidence. Agent entropy is mixed (0.59). Drivers: price, fundamentals. 6 neutral layer(s).
- **Top drivers**: price, fundamentals, sentiment
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.59)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 64%, bearish 0%, neutral 36%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 55% | 31ms | AMZN closed at 268.26. 7d 5.1%, 30d 28.5%. RSI 78.1, MACD positive. |
| risk | NEUTRAL | 33% | 286ms | Risk read: 30d vol 31.2%, max drawdown -21.7%, 30d return 28.5%. |
| sentiment | BULLISH | 54% | 429ms | 20 headline(s): 4 positive, 0 negative, net score 4. |
| microstructure | NEUTRAL | 28% | 997ms | Volume ratio 0.92x, price change 1.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 1112ms | Macro backdrop: VIX 16.89, curve 0.51, HY spread 2.8%. |
| fundamentals | BULLISH | 50% | 1241ms | Revenue growth 12.4%, net margin 10.8%, trailing FCF 18.3B. |
| auction | NEUTRAL | 22% | 1586ms | Auction state: balance. at POC 268.64. Session bars: 390. |
| pair | NEUTRAL | 5% | 1ms | AMZN is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 1661ms | No recent earnings within 90 days for AMZN. |
| prediction_market | NEUTRAL | 12% | 152ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 55%
- **Summary**: AMZN closed at 268.26. 7d 5.1%, 30d 28.5%. RSI 78.1, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "AMZN",
  "bars": 260,
  "close": 268.26,
  "change_7d_pct": 5.05,
  "change_30d_pct": 28.5,
  "sma20": 247.3655,
  "sma50": 224.8008,
  "sma200": 227.3774,
  "ema21": 247.8551,
  "rsi14": 78.12,
  "macd": 12.554,
  "macd_signal": 11.3915,
  "macd_crossover": "positive",
  "bollinger_position": 0.827
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 31.2%, max drawdown -21.7%, 30d return 28.5%.
- **Evidence**:
  - Max drawdown: -21.7%
  - 30d realized volatility: 31.2%
  - Sharpe-like score: 1.67
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3121,
  "realized_vol_90d": 0.3055,
  "max_drawdown_pct": -21.74,
  "atr14": null,
  "change_30d_pct": 28.5,
  "sharpe_like_90d": 1.67,
  "beta": 1.383,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 54%
- **Summary**: 20 headline(s): 4 positive, 0 negative, net score 4.
- **Evidence**:
  - The Shocking Similarity Between Micron and Nvidia as AI Turns Memory Into a Goldmine
  - Warren Buffett's Parting Gift to Investors Is Crushing the Market 6 Months Later
  - Amazon: Why Is There No Focus On The Chip Business, Mr. Market?
  - Mag 7 Just Committed $710 Billion To AI Capex
  - Why the Biggest AI Winners May Not Be AI Companies

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 0,
  "net_score": 4,
  "sample_headlines": [
    "The Shocking Similarity Between Micron and Nvidia as AI Turns Memory Into a Goldmine",
    "Warren Buffett's Parting Gift to Investors Is Crushing the Market 6 Months Later",
    "Amazon: Why Is There No Focus On The Chip Business, Mr. Market?",
    "Mag 7 Just Committed $710 Billion To AI Capex",
    "Why the Biggest AI Winners May Not Be AI Companies"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.92x, price change 1.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 49.0M vs avg 53.5M
  - Market cap: 2.9T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 268.26,
  "change_pct": 1.21,
  "volume": 48967586,
  "avg_volume": 53457138,
  "volume_ratio": 0.92,
  "market_cap": 2884935587600,
  "beta": 1.383,
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
- **Summary**: Macro backdrop: VIX 16.89, curve 0.51, HY spread 2.8%.
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
    "date": "2026-05-01",
    "value": 0.51
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
- **Summary**: Revenue growth 12.4%, net margin 10.8%, trailing FCF 18.3B.
- **Evidence**:
  - Sector: Consumer Cyclical
  - Revenue growth: 12.4%
  - Net cash: -108.1B

```json
{
  "company_name": "Amazon.com, Inc.",
  "sector": "Consumer Cyclical",
  "industry": "Specialty Retail",
  "market_cap": 2884935587600,
  "revenue_growth_pct": 12.38,
  "gross_margin_pct": 50.29,
  "net_margin_pct": 10.83,
  "trailing_fcf": 18338000000,
  "cash": 101816000000,
  "total_debt": 209888000000,
  "net_cash": -108072000000,
  "cfq_score": 2.23,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 0,
    "fcf_margin": 0,
    "capital_intensity": 1,
    "pricing_power": 4.5,
    "balance_sheet": 4,
    "share_count_quality": 2,
    "margin_stability": 2
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 268.64. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 268.6365, VAH: 272.925, VAL: 268.1005
  - TPO POC: 268.6365
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-02, bars: 21).

```json
{
  "auction_state": "balance",
  "current_price": 268.26,
  "poc": 268.6365,
  "vah": 272.925,
  "val": 268.1005,
  "tpo_poc": 268.6365,
  "avwap": null,
  "avwap_anchor": "2026-04-02",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 390,
  "daily_bar_count": 21
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: AMZN is not in any configured pair watchlist.

```json
{
  "symbol": "AMZN",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for AMZN.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "AMZN",
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
- **Auto-pulled**: 2026-05-02
