---
title: "LLY Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "LLY"
asset_type: "stock"
thesis_name: "Alzheimer's Disease Modification"
related_theses: ["[[Alzheimer's Disease Modification]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.36
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.75
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "lly"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 36%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 36% confidence. Agent entropy is diffuse (0.75). Drivers: price, fundamentals. Risks: risk. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.75)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 69%, bearish 17%, neutral 14%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 1371ms | LLY closed at 963.33. 7d 4.5%, 30d 5.0%. RSI 57.9, MACD positive. |
| risk | BEARISH | 61% | 1717ms | Risk read: 30d vol 41.4%, max drawdown -30.4%, 30d return 5.0%. |
| sentiment | BULLISH | 38% | 1771ms | 20 headline(s): 4 positive, 5 negative, net score 2. |
| microstructure | BULLISH | 36% | 2824ms | Volume ratio 1.23x, price change 3.1%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 159ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 55% | 3013ms | Revenue growth 44.7%, net margin 31.7%, trailing FCF 12.3B. |
| auction | NEUTRAL | 22% | 2409ms | Auction state: balance. inside value 962.18–977.63. Session bars: 389. |
| pair | NEUTRAL | 5% | 1ms | LLY is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 3096ms | No recent earnings within 90 days for LLY. |
| prediction_market | NEUTRAL | 12% | 147ms | No relevant prediction markets found for "Alzheimer's Disease Modification". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: LLY closed at 963.33. 7d 4.5%, 30d 5.0%. RSI 57.9, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "LLY",
  "bars": 260,
  "close": 963.33,
  "change_7d_pct": 4.54,
  "change_30d_pct": 5,
  "sma20": 916.596,
  "sma50": 947.662,
  "sma200": 911.3419,
  "ema21": 915.7562,
  "rsi14": 57.86,
  "macd": -9.8068,
  "macd_signal": -14.8504,
  "macd_crossover": "positive",
  "bollinger_position": 0.907
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 41.4%, max drawdown -30.4%, 30d return 5.0%.
- **Evidence**:
  - Max drawdown: -30.4%
  - 30d realized volatility: 41.4%
  - Sharpe-like score: -0.52
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4142,
  "realized_vol_90d": 0.4115,
  "max_drawdown_pct": -30.4,
  "atr14": null,
  "change_30d_pct": 5,
  "sharpe_like_90d": -0.52,
  "beta": 0.504,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 20 headline(s): 4 positive, 5 negative, net score 2.
- **Evidence**:
  - Eli Lilly: Buying Opportunity Knocking On The Front Door Again (Rating Upgrade)
  - Eli Lilly and Co (LLY) Stock Up 9.8% and Still Undervalued -- GF Score: 95/100
  - Eli Lilly and Company (LLY) Q1 2026 Earnings Call Transcript
  - LLY Stock Jumps After Q1 Earnings Beat, 2026 Guidance Raised
  - Eli Lilly Raises 2026 Outlook On Strong Mounjaro And Zepbound Demand

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 5,
  "net_score": 2,
  "sample_headlines": [
    "Eli Lilly: Buying Opportunity Knocking On The Front Door Again (Rating Upgrade)",
    "Eli Lilly and Co (LLY) Stock Up 9.8% and Still Undervalued -- GF Score: 95/100",
    "Eli Lilly and Company (LLY) Q1 2026 Earnings Call Transcript",
    "LLY Stock Jumps After Q1 Earnings Beat, 2026 Guidance Raised",
    "Eli Lilly Raises 2026 Outlook On Strong Mounjaro And Zepbound Demand"
  ]
}
```

## Microstructure Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Volume ratio 1.23x, price change 3.1%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 4.1M vs avg 3.3M
  - Market cap: 910.2B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 963.33,
  "change_pct": 3.07,
  "volume": 4107733,
  "avg_volume": 3331309,
  "volume_ratio": 1.23,
  "market_cap": 910172487270,
  "beta": 0.504,
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
- **Confidence**: 55%
- **Summary**: Revenue growth 44.7%, net margin 31.7%, trailing FCF 12.3B.
- **Evidence**:
  - Sector: Healthcare
  - Revenue growth: 44.7%
  - Net cash: -38.1B

```json
{
  "company_name": "Eli Lilly and Company",
  "sector": "Healthcare",
  "industry": "Drug Manufacturers - General",
  "market_cap": 910172487270,
  "revenue_growth_pct": 44.7,
  "gross_margin_pct": 83.79,
  "net_margin_pct": 31.66,
  "trailing_fcf": 12310100000,
  "cash": 5282000000,
  "total_debt": 43370000000,
  "net_cash": -38088000000,
  "cfq_score": 3.57,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 3,
    "fcf_margin": 4,
    "capital_intensity": 2,
    "pricing_power": 5,
    "balance_sheet": 3,
    "share_count_quality": 5,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 962.18–977.63. Session bars: 389.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 973.7665, VAH: 977.6289, VAL: 962.1794
  - TPO POC: 973.7665
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 963.33,
  "poc": 973.7665,
  "vah": 977.6289,
  "val": 962.1794,
  "tpo_poc": 973.7665,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 389,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: LLY is not in any configured pair watchlist.

```json
{
  "symbol": "LLY",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for LLY.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "LLY",
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
