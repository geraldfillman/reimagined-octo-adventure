---
title: "ACAD Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "ACAD"
asset_type: "stock"
thesis_name: "Alzheimer's Disease Modification"
related_theses: ["[[Alzheimer's Disease Modification]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.24
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.97
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.61
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "acad"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 24%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 24% confidence. Agent entropy is diffuse (0.97). Drivers: fundamentals, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.97)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 28%, bearish 45%, neutral 26%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.61)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 53% | 34ms | ACAD closed at 21.95. 7d -1.3%, 30d 5.9%. RSI 48.5, MACD positive. |
| risk | BEARISH | 52% | 282ms | Risk read: 30d vol 35.8%, max drawdown -27.6%, 30d return 5.9%. |
| sentiment | NEUTRAL | 30% | 413ms | 20 headline(s): 2 positive, 1 negative, net score 1. |
| microstructure | BEARISH | 31% | 890ms | Volume ratio 0.61x, price change -2.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 114ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 49% | 1220ms | Revenue growth 11.9%, net margin 36.5%, trailing FCF 262.3M. |
| auction | NEUTRAL | 22% | 1483ms | Auction state: balance. at POC 21.94. Session bars: 390. |
| pair | NEUTRAL | 5% | 0ms | ACAD is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 1678ms | No recent earnings within 90 days for ACAD. |
| prediction_market | NEUTRAL | 12% | 164ms | No relevant prediction markets found for "Alzheimer's Disease Modification". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 53%
- **Summary**: ACAD closed at 21.95. 7d -1.3%, 30d 5.9%. RSI 48.5, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "ACAD",
  "bars": 260,
  "close": 21.95,
  "change_7d_pct": -1.3,
  "change_30d_pct": 5.94,
  "sma20": 22.0855,
  "sma50": 22.1904,
  "sma200": 23.7522,
  "ema21": 22.0845,
  "rsi14": 48.48,
  "macd": 0.044,
  "macd_signal": -0.0069,
  "macd_crossover": "positive",
  "bollinger_position": 0.404
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 52%
- **Summary**: Risk read: 30d vol 35.8%, max drawdown -27.6%, 30d return 5.9%.
- **Evidence**:
  - Max drawdown: -27.6%
  - 30d realized volatility: 35.8%
  - Sharpe-like score: -1.37
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3585,
  "realized_vol_90d": 0.3823,
  "max_drawdown_pct": -27.58,
  "atr14": null,
  "change_30d_pct": 5.94,
  "sharpe_like_90d": -1.37,
  "beta": 0.834,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 2 positive, 1 negative, net score 1.
- **Evidence**:
  - Acadia Pharmaceuticals Announces Planned Year-End Retirement of Elizabeth H.Z. Thompson, Ph.D.
  - CSLLY vs. ACAD: Which Stock Is the Better Value Option?
  - Iovance Biotherapeutics (IOVA) May Report Negative Earnings: Know the Trend Ahead of Next Week's Release
  - Acadia Pharmaceuticals (ACAD) Expected to Beat Earnings Estimates: Should You Buy?
  - Acadia Pharmaceuticals to Participate at Upcoming Investor Conferences

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 1,
  "net_score": 1,
  "sample_headlines": [
    "Acadia Pharmaceuticals Announces Planned Year-End Retirement of Elizabeth H.Z. Thompson, Ph.D.",
    "CSLLY vs. ACAD: Which Stock Is the Better Value Option?",
    "Iovance Biotherapeutics (IOVA) May Report Negative Earnings: Know the Trend Ahead of Next Week's Release",
    "Acadia Pharmaceuticals (ACAD) Expected to Beat Earnings Estimates: Should You Buy?",
    "Acadia Pharmaceuticals to Participate at Upcoming Investor Conferences"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.61x, price change -2.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.1M vs avg 1.8M
  - Market cap: 3.8B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.61) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 21.95,
  "change_pct": -2.23,
  "volume": 1102977,
  "avg_volume": 1821261,
  "volume_ratio": 0.61,
  "market_cap": 3758169250,
  "beta": 0.834,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.61,
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
- **Confidence**: 49%
- **Summary**: Revenue growth 11.9%, net margin 36.5%, trailing FCF 262.3M.
- **Evidence**:
  - Sector: Healthcare
  - Revenue growth: 11.9%
  - Net cash: 125.5M

```json
{
  "company_name": "ACADIA Pharmaceuticals Inc.",
  "sector": "Healthcare",
  "industry": "Biotechnology",
  "market_cap": 3758169250,
  "revenue_growth_pct": 11.87,
  "gross_margin_pct": 91.69,
  "net_margin_pct": 36.49,
  "trailing_fcf": 262342000,
  "cash": 177695000,
  "total_debt": 52187000,
  "net_cash": 125508000,
  "cfq_score": 3.26,
  "cfq_label": "acceptable",
  "cfq_factors": {
    "ocf_durability": 3.25,
    "fcf_conversion": 1,
    "fcf_margin": 3,
    "capital_intensity": 5,
    "pricing_power": 5,
    "balance_sheet": 5,
    "share_count_quality": 2,
    "margin_stability": 1.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 21.94. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 21.9378, VAH: 22.0697, VAL: 21.8498
  - TPO POC: 21.9378
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 21.95,
  "poc": 21.9378,
  "vah": 22.0697,
  "val": 21.8498,
  "tpo_poc": 21.9378,
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
- **Summary**: ACAD is not in any configured pair watchlist.

```json
{
  "symbol": "ACAD",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for ACAD.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "ACAD",
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
