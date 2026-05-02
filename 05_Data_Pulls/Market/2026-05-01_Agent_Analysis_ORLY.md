---
title: "ORLY Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "ORLY"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.46
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.58
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.59
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "orly"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 46%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 46% confidence. Agent entropy is mixed (0.58). Drivers: price, sentiment. 6 neutral layer(s).
- **Top drivers**: price, sentiment, fundamentals
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.58)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 66%, bearish 0%, neutral 34%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.59)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 65% | 221ms | ORLY closed at 99.07. 7d 5.5%, 30d 12.7%. RSI 67.7, MACD positive. |
| risk | NEUTRAL | 33% | 222ms | Risk read: 30d vol 30.6%, max drawdown -19.0%, 30d return 12.7%. |
| sentiment | BULLISH | 62% | 317ms | 20 headline(s): 3 positive, 1 negative, net score 5. |
| microstructure | NEUTRAL | 24% | 296ms | Volume ratio 0.09x, price change -0.3%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 220ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 44% | 173ms | Revenue growth 6.4%, net margin 14.3%, trailing FCF 4.0B. |
| auction | NEUTRAL | 22% | 252ms | Auction state: balance. at POC 99.03. Session bars: 27. |
| pair | NEUTRAL | 5% | 13ms | ORLY is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 154ms | No recent earnings within 90 days for ORLY. |
| prediction_market | NEUTRAL | 12% | 21ms | No relevant prediction markets found for "ORLY". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 65%
- **Summary**: ORLY closed at 99.07. 7d 5.5%, 30d 12.7%. RSI 67.7, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "ORLY",
  "bars": 260,
  "close": 99.07,
  "change_7d_pct": 5.48,
  "change_30d_pct": 12.69,
  "sma20": 93.607,
  "sma50": 92.6656,
  "sma200": 97.2769,
  "ema21": 93.7431,
  "rsi14": 67.68,
  "macd": 0.9511,
  "macd_signal": 0.4094,
  "macd_crossover": "positive",
  "bollinger_position": 1.164
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: Risk read: 30d vol 30.6%, max drawdown -19.0%, 30d return 12.7%.
- **Evidence**:
  - Max drawdown: -19.0%
  - 30d realized volatility: 30.6%
  - Sharpe-like score: 1.05
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3062,
  "realized_vol_90d": 0.2589,
  "max_drawdown_pct": -19.03,
  "atr14": null,
  "change_30d_pct": 12.69,
  "sharpe_like_90d": 1.05,
  "beta": 0.598,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 62%
- **Summary**: 20 headline(s): 3 positive, 1 negative, net score 5.
- **Evidence**:
  - O'Reilly Automotive Inc (ORLY) Q1 2026 Earnings Call Highlights: Strong Sales Growth and Strategic Expansion
  - O'Reilly Automotive, Inc. (ORLY) Q1 2026 Earnings Call Transcript
  - O'Reilly Q1 Earnings Surpass Estimates on Strong Comps Growth
  - O'Reilly Automotive (ORLY) Q1 Earnings: Taking a Look at Key Metrics Versus Estimates
  - O'Reilly Automotive (ORLY) Beats Q1 Earnings and Revenue Estimates

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 1,
  "net_score": 5,
  "sample_headlines": [
    "O'Reilly Automotive Inc (ORLY) Q1 2026 Earnings Call Highlights: Strong Sales Growth and Strategic Expansion",
    "O'Reilly Automotive, Inc. (ORLY) Q1 2026 Earnings Call Transcript",
    "O'Reilly Q1 Earnings Surpass Estimates on Strong Comps Growth",
    "O'Reilly Automotive (ORLY) Q1 Earnings: Taking a Look at Key Metrics Versus Estimates",
    "O'Reilly Automotive (ORLY) Beats Q1 Earnings and Revenue Estimates"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.09x, price change -0.3%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 512.3K vs avg 5.9M
  - Market cap: 82.9B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.59) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 99.1,
  "change_pct": -0.3,
  "volume": 512345,
  "avg_volume": 5887985,
  "volume_ratio": 0.09,
  "market_cap": 82916870900,
  "beta": 0.598,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.59,
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
- **Confidence**: 44%
- **Summary**: Revenue growth 6.4%, net margin 14.3%, trailing FCF 4.0B.
- **Evidence**:
  - Sector: Consumer Cyclical
  - Revenue growth: 6.4%
  - Net cash: -8.5B

```json
{
  "company_name": "O'Reilly Automotive, Inc.",
  "sector": "Consumer Cyclical",
  "industry": "Auto - Parts",
  "market_cap": 82916870900,
  "revenue_growth_pct": 6.42,
  "gross_margin_pct": 51.59,
  "net_margin_pct": 14.27,
  "trailing_fcf": 3952858000,
  "cash": 252632000,
  "total_debt": 8731224999,
  "net_cash": -8478592999,
  "cfq_score": 3.57,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 3,
    "fcf_margin": 3,
    "capital_intensity": 3,
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
- **Summary**: Auction state: balance. at POC 99.03. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 99.0345, VAH: 100.2312, VAL: 99.0345
  - TPO POC: 99.0345
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 99.1,
  "poc": 99.0345,
  "vah": 100.2312,
  "val": 99.0345,
  "tpo_poc": 99.0345,
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
- **Summary**: ORLY is not in any configured pair watchlist.

```json
{
  "symbol": "ORLY",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for ORLY.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "ORLY",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "ORLY".

```json
{
  "query": "ORLY",
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
