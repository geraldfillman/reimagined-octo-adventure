---
title: "BIIB Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "BIIB"
asset_type: "stock"
thesis_name: "Alzheimer's Disease Modification"
related_theses: ["[[Alzheimer's Disease Modification]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.41
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.63
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "biib"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 41%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 41% confidence. Agent entropy is mixed (0.63). Drivers: price, fundamentals. 7 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.63)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 54%, bearish 0%, neutral 46%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 68% | 42ms | BIIB closed at 187.06. 7d -1.6%, 30d 2.0%. RSI 53.1, MACD positive. |
| risk | NEUTRAL | 30% | 313ms | Risk read: 30d vol 36.7%, max drawdown -14.3%, 30d return 2.0%. |
| sentiment | NEUTRAL | 30% | 451ms | 20 headline(s): 2 positive, 2 negative, net score -1. |
| microstructure | NEUTRAL | 24% | 1380ms | Volume ratio 0.54x, price change -1.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 168ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 50% | 1243ms | Revenue growth 1.4%, net margin 13.2%, trailing FCF 4.9B. |
| auction | NEUTRAL | 22% | 2061ms | Auction state: balance. at POC 186.92. Session bars: 390. |
| pair | NEUTRAL | 5% | 1ms | BIIB is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 1692ms | No recent earnings within 90 days for BIIB. |
| prediction_market | NEUTRAL | 12% | 197ms | No relevant prediction markets found for "Alzheimer's Disease Modification". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 68%
- **Summary**: BIIB closed at 187.06. 7d -1.6%, 30d 2.0%. RSI 53.1, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "BIIB",
  "bars": 260,
  "close": 187.06,
  "change_7d_pct": -1.58,
  "change_30d_pct": 1.99,
  "sma20": 181.678,
  "sma50": 184.7116,
  "sma200": 164.4459,
  "ema21": 184.2916,
  "rsi14": 53.07,
  "macd": 1.4838,
  "macd_signal": 0.4267,
  "macd_crossover": "positive",
  "bollinger_position": 0.727
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: Risk read: 30d vol 36.7%, max drawdown -14.3%, 30d return 2.0%.
- **Evidence**:
  - Max drawdown: -14.3%
  - 30d realized volatility: 36.7%
  - Sharpe-like score: 0.71
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3666,
  "realized_vol_90d": 0.3574,
  "max_drawdown_pct": -14.34,
  "atr14": null,
  "change_30d_pct": 1.99,
  "sharpe_like_90d": 0.71,
  "beta": 0.162,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 2 positive, 2 negative, net score -1.
- **Evidence**:
  - Biogen Analysts Boost Their Forecasts Following Upbeat Q1 Earnings
  - Is Biogen (BIIB) 2.7% Undervalued After Q1 2026? Non-GAAP EPS $3.57 Beats (est. $2.52), GAAP $2.15 Misses; Revenue $2,477.8M Beats (est. $2,255.38M) | GF Score 73/100
  - Why Biogen Stock Was a Winner on Wednesday
  - Biogen Inc. (BIIB) Q1 2026 Earnings Call Transcript
  - Big Boosts to Econ Growth from AI Investment, Inventories & More

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 2,
  "net_score": -1,
  "sample_headlines": [
    "Biogen Analysts Boost Their Forecasts Following Upbeat Q1 Earnings",
    "Is Biogen (BIIB) 2.7% Undervalued After Q1 2026? Non-GAAP EPS $3.57 Beats (est. $2.52), GAAP $2.15 Misses; Revenue $2,477.8M Beats (est. $2,255.38M) | GF Score 73/100",
    "Why Biogen Stock Was a Winner on Wednesday",
    "Biogen Inc. (BIIB) Q1 2026 Earnings Call Transcript",
    "Big Boosts to Econ Growth from AI Investment, Inventories & More"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.54x, price change -1.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 680.9K vs avg 1.3M
  - Market cap: 27.6B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 187.06,
  "change_pct": -1.17,
  "volume": 680856,
  "avg_volume": 1258782,
  "volume_ratio": 0.54,
  "market_cap": 27616977220,
  "beta": 0.162,
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
- **Confidence**: 50%
- **Summary**: Revenue growth 1.4%, net margin 13.2%, trailing FCF 4.9B.
- **Evidence**:
  - Sector: Healthcare
  - Revenue growth: 1.4%
  - Net cash: -3.2B

```json
{
  "company_name": "Biogen Inc.",
  "sector": "Healthcare",
  "industry": "Drug Manufacturers - General",
  "market_cap": 27616977220,
  "revenue_growth_pct": 1.39,
  "gross_margin_pct": 70.47,
  "net_margin_pct": 13.18,
  "trailing_fcf": 4918800000,
  "cash": 3382700000,
  "total_debt": 6561900000,
  "net_cash": -3179200000,
  "cfq_score": 3.9,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 5,
    "fcf_margin": 5,
    "capital_intensity": 5,
    "pricing_power": 3,
    "balance_sheet": 3,
    "share_count_quality": 3,
    "margin_stability": 2
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 186.92. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 186.9231, VAH: 189.5588, VAL: 186.9231
  - TPO POC: 186.9231
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 187.06,
  "poc": 186.9231,
  "vah": 189.5588,
  "val": 186.9231,
  "tpo_poc": 186.9231,
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
- **Summary**: BIIB is not in any configured pair watchlist.

```json
{
  "symbol": "BIIB",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for BIIB.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "BIIB",
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
