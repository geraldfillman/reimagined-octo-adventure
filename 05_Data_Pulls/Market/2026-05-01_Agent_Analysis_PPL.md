---
title: "PPL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "PPL"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.36
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.63
entropy_dominant_signal: "neutral"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "ppl"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 36%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 36% confidence. Agent entropy is mixed (0.63). Drivers: risk, macro. 7 neutral layer(s).
- **Top drivers**: risk, macro, sentiment
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.63)
- **Dominant signal bucket**: neutral
- **Distribution**: bullish 49%, bearish 0%, neutral 51%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 30% | 202ms | PPL closed at 37.88. 7d 0.3%, 30d 0.6%. RSI 44, MACD negative. |
| risk | BULLISH | 43% | 209ms | Risk read: 30d vol 17.9%, max drawdown -12.4%, 30d return 0.6%. |
| sentiment | BULLISH | 46% | 314ms | 20 headline(s): 3 positive, 1 negative, net score 3. |
| microstructure | NEUTRAL | 24% | 254ms | Volume ratio 0.24x, price change 1.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 210ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | NEUTRAL | 30% | 165ms | Revenue growth 6.9%, net margin 13.1%, trailing FCF -1.9B. |
| auction | NEUTRAL | 22% | 212ms | Auction state: balance. above VAH 37.99. Session bars: 28. |
| pair | NEUTRAL | 5% | 12ms | PPL is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 157ms | No recent earnings within 90 days for PPL. |
| prediction_market | NEUTRAL | 12% | 18ms | No relevant prediction markets found for "PPL". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: PPL closed at 37.88. 7d 0.3%, 30d 0.6%. RSI 44, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "PPL",
  "bars": 260,
  "close": 37.875,
  "change_7d_pct": 0.25,
  "change_30d_pct": 0.6,
  "sma20": 38.8367,
  "sma50": 38.3365,
  "sma200": 36.6748,
  "ema21": 38.4915,
  "rsi14": 44.05,
  "macd": -0.024,
  "macd_signal": 0.1442,
  "macd_crossover": "negative",
  "bollinger_position": 0.117
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 43%
- **Summary**: Risk read: 30d vol 17.9%, max drawdown -12.4%, 30d return 0.6%.
- **Evidence**:
  - Max drawdown: -12.4%
  - 30d realized volatility: 17.9%
  - Sharpe-like score: 1.65
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.179,
  "realized_vol_90d": 0.1782,
  "max_drawdown_pct": -12.4,
  "atr14": null,
  "change_30d_pct": 0.6,
  "sharpe_like_90d": 1.65,
  "beta": 0.68,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 3 positive, 1 negative, net score 3.
- **Evidence**:
  - PPL (PPL) Stock Drops Despite Market Gains: Important Facts to Note
  - LG&E and KU collaborate with X-energy to explore nuclear energy
  - PPL vs. XEL: Which Utility Stock Has Better Upside Potential in 2026?
  - Pembina Pipeline Co. (TSE:PPL) Given Consensus Recommendation of “Moderate Buy” by Analysts
  - Churchill Downs Racetrack, LG&E and KU Team Up Green Energy Partnership for 152nd Kentucky Derby

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 1,
  "net_score": 3,
  "sample_headlines": [
    "PPL (PPL) Stock Drops Despite Market Gains: Important Facts to Note",
    "LG&E and KU collaborate with X-energy to explore nuclear energy",
    "PPL vs. XEL: Which Utility Stock Has Better Upside Potential in 2026?",
    "Pembina Pipeline Co. (TSE:PPL) Given Consensus Recommendation of “Moderate Buy” by Analysts",
    "Churchill Downs Racetrack, LG&E and KU Team Up Green Energy Partnership for 152nd Kentucky Derby"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.24x, price change 1.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.2M vs avg 9.3M
  - Market cap: 28.6B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 38.021,
  "change_pct": 1.55,
  "volume": 2215885,
  "avg_volume": 9309220,
  "volume_ratio": 0.24,
  "market_cap": 28598065396,
  "beta": 0.68,
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

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: Revenue growth 6.9%, net margin 13.1%, trailing FCF -1.9B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 6.9%
  - Net cash: -18.3B

```json
{
  "company_name": "PPL Corporation",
  "sector": "Utilities",
  "industry": "Regulated Electric",
  "market_cap": 28598065396,
  "revenue_growth_pct": 6.85,
  "gross_margin_pct": 39.05,
  "net_margin_pct": 13.06,
  "trailing_fcf": -1866000000,
  "cash": 1086000000,
  "total_debt": 19350000000,
  "net_cash": -18264000000,
  "cfq_score": 2.05,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 0,
    "fcf_margin": 0,
    "capital_intensity": 0,
    "pricing_power": 3.5,
    "balance_sheet": 1,
    "share_count_quality": 3,
    "margin_stability": 4.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. above VAH 37.99. Session bars: 28.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 37.9134, VAH: 37.989, VAL: 37.9134
  - TPO POC: 37.9134
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 38.021,
  "poc": 37.9134,
  "vah": 37.989,
  "val": 37.9134,
  "tpo_poc": 37.9134,
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
- **Summary**: PPL is not in any configured pair watchlist.

```json
{
  "symbol": "PPL",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for PPL.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "PPL",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "PPL".

```json
{
  "query": "PPL",
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
