---
title: "PRTA Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "PRTA"
asset_type: "stock"
thesis_name: "Alzheimer's Disease Modification"
related_theses: ["[[Alzheimer's Disease Modification]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BEARISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.17
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.99
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "prta"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 17%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 17% confidence. Agent entropy is diffuse (0.99). Drivers: price, macro. Risks: risk, fundamentals. 5 neutral layer(s).
- **Top drivers**: price, macro
- **Top risks**: risk, fundamentals, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.99)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 34%, bearish 39%, neutral 27%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 60% | 4418ms | PRTA closed at 10.64. 7d -0.7%, 30d 24.6%. RSI 53.2, MACD bearish_cross. |
| risk | BEARISH | 41% | 4676ms | Risk read: 30d vol 44.9%, max drawdown -52.8%, 30d return 24.6%. |
| sentiment | NEUTRAL | 30% | 4810ms | 20 headline(s): 1 positive, 2 negative, net score -1. |
| microstructure | BEARISH | 31% | 5111ms | Volume ratio 1.04x, price change -3.8%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 324ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BEARISH | 40% | 3907ms | Revenue growth -92.8%, net margin -2520.6%, trailing FCF -317.9M. |
| auction | NEUTRAL | 22% | 4166ms | Auction state: balance. below VAL 10.69. Session bars: 388. |
| pair | NEUTRAL | 5% | 0ms | PRTA is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 4339ms | No recent earnings within 90 days for PRTA. |
| prediction_market | NEUTRAL | 12% | 127ms | No relevant prediction markets found for "Alzheimer's Disease Modification". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 60%
- **Summary**: PRTA closed at 10.64. 7d -0.7%, 30d 24.6%. RSI 53.2, MACD bearish_cross.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: bearish_cross

```json
{
  "api_symbol": "PRTA",
  "bars": 260,
  "close": 10.64,
  "change_7d_pct": -0.75,
  "change_30d_pct": 24.59,
  "sma20": 10.691,
  "sma50": 9.8194,
  "sma200": 9.3293,
  "ema21": 10.5708,
  "rsi14": 53.2,
  "macd": 0.3315,
  "macd_signal": 0.363,
  "macd_crossover": "bearish_cross",
  "bollinger_position": 0.456
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 41%
- **Summary**: Risk read: 30d vol 44.9%, max drawdown -52.8%, 30d return 24.6%.
- **Evidence**:
  - Max drawdown: -52.8%
  - 30d realized volatility: 44.9%
  - Sharpe-like score: 1.12
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4486,
  "realized_vol_90d": 0.4538,
  "max_drawdown_pct": -52.78,
  "atr14": null,
  "change_30d_pct": 24.59,
  "sharpe_like_90d": 1.12,
  "beta": -0.331,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 1 positive, 2 negative, net score -1.
- **Evidence**:
  - Prothena Announces Novo Nordisk Obtains Fast Track Designation from the U.S. FDA for Coramitug (PRX004) in ATTR Amyloidosis with Cardiomyopathy
  - Prothena Announces Leadership Team Updates
  - Wall Street Analysts Think Prothena (PRTA) Could Surge 120.19%: Read This Before Placing a Bet
  - Prothena Partners Present Data Supporting Next Generation Treatments for Parkinson's and Alzheimer's Disease at AD/PD™ 2026
  - Prothena Announces Achievement of $50 Million Clinical Milestone Payment from Novo Nordisk Related to Ongoing Phase 3 Clinical Trial for Coramitug (Formerly PRX004) in ATTR Amyloidosis with Cardiomyopathy

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 2,
  "net_score": -1,
  "sample_headlines": [
    "Prothena Announces Novo Nordisk Obtains Fast Track Designation from the U.S. FDA for Coramitug (PRX004) in ATTR Amyloidosis with Cardiomyopathy",
    "Prothena Announces Leadership Team Updates",
    "Wall Street Analysts Think Prothena (PRTA) Could Surge 120.19%: Read This Before Placing a Bet",
    "Prothena Partners Present Data Supporting Next Generation Treatments for Parkinson's and Alzheimer's Disease at AD/PD™ 2026",
    "Prothena Announces Achievement of $50 Million Clinical Milestone Payment from Novo Nordisk Related to Ongoing Phase 3 Clinical Trial for Coramitug (Formerly PRX004) in ATTR Amyloidosis with Cardiomyopathy"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 1.04x, price change -3.8%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 505.5K vs avg 487.3K
  - Market cap: 572.8M
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 10.64,
  "change_pct": -3.8,
  "volume": 505519,
  "avg_volume": 487326,
  "volume_ratio": 1.04,
  "market_cap": 572782928,
  "beta": -0.331,
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

- **Signal**: BEARISH
- **Confidence**: 40%
- **Summary**: Revenue growth -92.8%, net margin -2520.6%, trailing FCF -317.9M.
- **Evidence**:
  - Sector: Healthcare
  - Revenue growth: -92.8%
  - Net cash: 293.7M

```json
{
  "company_name": "Prothena Corporation plc",
  "sector": "Healthcare",
  "industry": "Biotechnology",
  "market_cap": 572782928,
  "revenue_growth_pct": -92.83,
  "gross_margin_pct": 61.77,
  "net_margin_pct": -2520.57,
  "trailing_fcf": -317917969,
  "cash": 307531000,
  "total_debt": 13860000,
  "net_cash": 293671000,
  "cfq_score": 2.17,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 1,
    "fcf_conversion": 3,
    "fcf_margin": 0,
    "capital_intensity": 5,
    "pricing_power": 2,
    "balance_sheet": 4,
    "share_count_quality": 1,
    "margin_stability": 0.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. below VAL 10.69. Session bars: 388.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 10.6934, VAH: 10.9754, VAL: 10.6934
  - TPO POC: 10.9537
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 10.64,
  "poc": 10.6934,
  "vah": 10.9754,
  "val": 10.6934,
  "tpo_poc": 10.9537,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 388,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: PRTA is not in any configured pair watchlist.

```json
{
  "symbol": "PRTA",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for PRTA.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "PRTA",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Alzheimer's Disease Modification".

```json
{
  "query": "Alzheimer's Disease Modification",
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
