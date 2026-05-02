---
title: "IRM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "IRM"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.36
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.62
entropy_dominant_signal: "neutral"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.7
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "irm"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 36%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 36% confidence. Agent entropy is mixed (0.62). Drivers: price, macro. 8 neutral layer(s).
- **Top drivers**: price, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.62)
- **Dominant signal bucket**: neutral
- **Distribution**: bullish 41%, bearish 0%, neutral 59%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.7)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 79% | 213ms | IRM closed at 125.81. 7d 7.3%, 30d 19.9%. RSI 72.8, MACD positive. |
| risk | NEUTRAL | 33% | 216ms | Risk read: 30d vol 41.6%, max drawdown -25.9%, 30d return 19.9%. |
| sentiment | NEUTRAL | 30% | 319ms | 20 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 271ms | Volume ratio 0.06x, price change -0.8%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 225ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | NEUTRAL | 28% | 168ms | Revenue growth 12.2%, net margin 2.1%, trailing FCF -1.5B. |
| auction | NEUTRAL | 22% | 258ms | Auction state: balance. below VAL 125.91. Session bars: 27. |
| pair | NEUTRAL | 5% | 12ms | IRM is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 166ms | No recent earnings within 90 days for IRM. |
| prediction_market | NEUTRAL | 12% | 20ms | No relevant prediction markets found for "IRM". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 79%
- **Summary**: IRM closed at 125.81. 7d 7.3%, 30d 19.9%. RSI 72.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "IRM",
  "bars": 260,
  "close": 125.81,
  "change_7d_pct": 7.32,
  "change_30d_pct": 19.89,
  "sma20": 114.4405,
  "sma50": 109.1918,
  "sma200": 98.1355,
  "ema21": 114.6215,
  "rsi14": 72.77,
  "macd": 4.0184,
  "macd_signal": 3.3012,
  "macd_crossover": "positive",
  "bollinger_position": 0.99
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 41.6%, max drawdown -25.9%, 30d return 19.9%.
- **Evidence**:
  - Max drawdown: -25.9%
  - 30d realized volatility: 41.6%
  - Sharpe-like score: 3.8
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4163,
  "realized_vol_90d": 0.3494,
  "max_drawdown_pct": -25.93,
  "atr14": null,
  "change_30d_pct": 19.89,
  "sharpe_like_90d": 3.8,
  "beta": 1.152,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - Iron Mountain stock just hit a crucial resistance after earnings: is it a good buy?
  - Iron Mountain's Q1 AFFO Tops Estimates on Data Center, ALM Strength
  - Iron Mountain Incorporated (IRM) Q1 2026 Earnings Call Transcript
  - Iron Mountain (IRM) Reports Q1 Earnings: What Key Metrics Have to Say
  - Iron Mountain (IRM) Surpasses Q1 Earnings and Revenue Estimates

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "Iron Mountain stock just hit a crucial resistance after earnings: is it a good buy?",
    "Iron Mountain's Q1 AFFO Tops Estimates on Data Center, ALM Strength",
    "Iron Mountain Incorporated (IRM) Q1 2026 Earnings Call Transcript",
    "Iron Mountain (IRM) Reports Q1 Earnings: What Key Metrics Have to Say",
    "Iron Mountain (IRM) Surpasses Q1 Earnings and Revenue Estimates"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.06x, price change -0.8%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 108.5K vs avg 1.8M
  - Market cap: 37.2B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.7) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 125.04,
  "change_pct": -0.75,
  "volume": 108507.74673,
  "avg_volume": 1770540,
  "volume_ratio": 0.06,
  "market_cap": 37196751278,
  "beta": 1.152,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.7,
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
- **Confidence**: 28%
- **Summary**: Revenue growth 12.2%, net margin 2.1%, trailing FCF -1.5B.
- **Evidence**:
  - Sector: Real Estate
  - Revenue growth: 12.2%
  - Net cash: -3.5B

```json
{
  "company_name": "Iron Mountain Incorporated",
  "sector": "Real Estate",
  "industry": "REIT - Specialty",
  "market_cap": 37196751278,
  "revenue_growth_pct": 12.23,
  "gross_margin_pct": 25.69,
  "net_margin_pct": 2.09,
  "trailing_fcf": -1514941000,
  "cash": 250710000,
  "total_debt": 3770285000,
  "net_cash": -3519575000,
  "cfq_score": 2.29,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 0,
    "fcf_margin": 0,
    "capital_intensity": 1,
    "pricing_power": 3.5,
    "balance_sheet": 3,
    "share_count_quality": 3,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. below VAL 125.91. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 126.41, VAH: 126.41, VAL: 125.906
  - TPO POC: 125.906
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 125.04,
  "poc": 126.41,
  "vah": 126.41,
  "val": 125.906,
  "tpo_poc": 125.906,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 27,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: IRM is not in any configured pair watchlist.

```json
{
  "symbol": "IRM",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for IRM.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "IRM",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "IRM".

```json
{
  "query": "IRM",
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
