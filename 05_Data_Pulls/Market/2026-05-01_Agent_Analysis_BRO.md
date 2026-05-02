---
title: "BRO Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "BRO"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.25
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.96
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "bro"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 25%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 25% confidence. Agent entropy is diffuse (0.96). Drivers: fundamentals, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.96)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 36%, bearish 43%, neutral 20%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 83% | 197ms | BRO closed at 59.3. 7d -12.6%, 30d -10.9%. RSI 28.5, MACD negative. |
| risk | BEARISH | 72% | 201ms | Risk read: 30d vol 31.3%, max drawdown -49.8%, 30d return -10.9%. |
| sentiment | BULLISH | 38% | 299ms | 20 headline(s): 3 positive, 1 negative, net score 2. |
| microstructure | NEUTRAL | 24% | 259ms | Volume ratio 0.07x, price change -0.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 306ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 55% | 148ms | Revenue growth 26.6%, net margin 17.7%, trailing FCF 2.8B. |
| auction | NEUTRAL | 22% | 313ms | Auction state: balance. at POC 60.01. Session bars: 28. |
| pair | NEUTRAL | 5% | 13ms | BRO is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 143ms | No recent earnings within 90 days for BRO. |
| prediction_market | NEUTRAL | 12% | 25ms | No relevant prediction markets found for "BRO". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 83%
- **Summary**: BRO closed at 59.3. 7d -12.6%, 30d -10.9%. RSI 28.5, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "BRO",
  "bars": 260,
  "close": 59.305,
  "change_7d_pct": -12.63,
  "change_30d_pct": -10.91,
  "sma20": 65.9608,
  "sma50": 67.4589,
  "sma200": 81.2071,
  "ema21": 65.1804,
  "rsi14": 28.49,
  "macd": -1.604,
  "macd_signal": -0.8071,
  "macd_crossover": "negative",
  "bollinger_position": -0.118
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 72%
- **Summary**: Risk read: 30d vol 31.3%, max drawdown -49.8%, 30d return -10.9%.
- **Evidence**:
  - Max drawdown: -49.8%
  - 30d realized volatility: 31.3%
  - Sharpe-like score: -2.63
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3135,
  "realized_vol_90d": 0.303,
  "max_drawdown_pct": -49.83,
  "atr14": null,
  "change_30d_pct": -10.91,
  "sharpe_like_90d": -2.63,
  "beta": 0.826,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 20 headline(s): 3 positive, 1 negative, net score 2.
- **Evidence**:
  - Brown & Brown: No Significant Upside After 1Q26
  - Brown & Brown, Inc. (BRO) Q1 2026 Earnings Call Transcript
  - Brown & Brown Q1 Earnings Top Estimates on Higher Commissions
  - Brown & Brown (BRO) Reports Q1 Earnings: What Key Metrics Have to Say
  - Brown & Brown (BRO) Tops Q1 Earnings and Revenue Estimates

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 1,
  "net_score": 2,
  "sample_headlines": [
    "Brown & Brown: No Significant Upside After 1Q26",
    "Brown & Brown, Inc. (BRO) Q1 2026 Earnings Call Transcript",
    "Brown & Brown Q1 Earnings Top Estimates on Higher Commissions",
    "Brown & Brown (BRO) Reports Q1 Earnings: What Key Metrics Have to Say",
    "Brown & Brown (BRO) Tops Q1 Earnings and Revenue Estimates"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.07x, price change -0.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 232.9K vs avg 3.3M
  - Market cap: 20.3B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 59.87,
  "change_pct": -0.47,
  "volume": 232913,
  "avg_volume": 3337419,
  "volume_ratio": 0.07,
  "market_cap": 20292816398,
  "beta": 0.826,
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

- **Signal**: BULLISH
- **Confidence**: 55%
- **Summary**: Revenue growth 26.6%, net margin 17.7%, trailing FCF 2.8B.
- **Evidence**:
  - Sector: Financial Services
  - Revenue growth: 26.6%
  - Net cash: -7.1B

```json
{
  "company_name": "Brown & Brown, Inc.",
  "sector": "Financial Services",
  "industry": "Insurance - Brokers",
  "market_cap": 20292816398,
  "revenue_growth_pct": 26.59,
  "gross_margin_pct": 87.68,
  "net_margin_pct": 17.7,
  "trailing_fcf": 2763000000,
  "cash": 1003000000,
  "total_debt": 8060000000,
  "net_cash": -7057000000,
  "cfq_score": 4.04,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 5,
    "fcf_margin": 4,
    "capital_intensity": 5,
    "pricing_power": 4,
    "balance_sheet": 2,
    "share_count_quality": 1,
    "margin_stability": 4.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 60.01. Session bars: 28.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 60.0122, VAH: 60.8541, VAL: 59.1704
  - TPO POC: 60.6135
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 59.87,
  "poc": 60.0122,
  "vah": 60.8541,
  "val": 59.1704,
  "tpo_poc": 60.6135,
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
- **Summary**: BRO is not in any configured pair watchlist.

```json
{
  "symbol": "BRO",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for BRO.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "BRO",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "BRO".

```json
{
  "query": "BRO",
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
