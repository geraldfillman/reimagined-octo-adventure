---
title: "GEV Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GEV"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.46
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.6
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "gev"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 46%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 46% confidence. Agent entropy is mixed (0.6). Drivers: price, risk. 6 neutral layer(s).
- **Top drivers**: price, risk, fundamentals
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.6)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 64%, bearish 0%, neutral 36%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 53% | 322ms | GEV closed at 1062.95. 7d -5.7%, 30d 21.1%. RSI 59.7, MACD bearish_cross. |
| risk | BULLISH | 43% | 341ms | Risk read: 30d vol 56.6%, max drawdown -17.5%, 30d return 21.1%. |
| sentiment | NEUTRAL | 30% | 498ms | 20 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 517ms | Volume ratio 0.65x, price change -1.9%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 673ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 48% | 276ms | Revenue growth 8.9%, net margin 12.8%, trailing FCF 10.9B. |
| auction | NEUTRAL | 22% | 466ms | Auction state: balance. below VAL 1068.78. Session bars: 390. |
| pair | NEUTRAL | 5% | 13ms | GEV is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 259ms | No recent earnings within 90 days for GEV. |
| prediction_market | NEUTRAL | 12% | 105ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 53%
- **Summary**: GEV closed at 1062.95. 7d -5.7%, 30d 21.1%. RSI 59.7, MACD bearish_cross.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: bearish_cross

```json
{
  "api_symbol": "GEV",
  "bars": 260,
  "close": 1062.95,
  "change_7d_pct": -5.73,
  "change_30d_pct": 21.15,
  "sma20": 1023.7785,
  "sma50": 922.9996,
  "sma200": 708.6827,
  "ema21": 1024.8873,
  "rsi14": 59.75,
  "macd": 54.3556,
  "macd_signal": 55.7553,
  "macd_crossover": "bearish_cross",
  "bollinger_position": 0.631
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 43%
- **Summary**: Risk read: 30d vol 56.6%, max drawdown -17.5%, 30d return 21.1%.
- **Evidence**:
  - Max drawdown: -17.5%
  - 30d realized volatility: 56.6%
  - Sharpe-like score: 3.13
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5656,
  "realized_vol_90d": 0.4629,
  "max_drawdown_pct": -17.54,
  "atr14": null,
  "change_30d_pct": 21.15,
  "sharpe_like_90d": 3.13,
  "beta": 1.196,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - Here's How AI Data Center Spending Helped This Stock Pop to an All-Time High Today
  - VOLT Investors: Here's the One Signal That Predicts Your Returns This Year
  - Should You Invest in the iShares U.S. Power Infrastructure ETF (POWR)?
  - GE Vernova Inc. (GEV) is Attracting Investor Attention: Here is What You Should Know
  - Why GE Vernova Stock Slid Today

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "Here's How AI Data Center Spending Helped This Stock Pop to an All-Time High Today",
    "VOLT Investors: Here's the One Signal That Predicts Your Returns This Year",
    "Should You Invest in the iShares U.S. Power Infrastructure ETF (POWR)?",
    "GE Vernova Inc. (GEV) is Attracting Investor Attention: Here is What You Should Know",
    "Why GE Vernova Stock Slid Today"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.65x, price change -1.9%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.9M vs avg 2.9M
  - Market cap: 285.6B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 1062.95,
  "change_pct": -1.89,
  "volume": 1882688,
  "avg_volume": 2889787,
  "volume_ratio": 0.65,
  "market_cap": 285635924000,
  "beta": 1.196,
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
- **Confidence**: 48%
- **Summary**: Revenue growth 8.9%, net margin 12.8%, trailing FCF 10.9B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 8.9%
  - Net cash: 7.3B

```json
{
  "company_name": "GE Vernova Inc.",
  "sector": "Utilities",
  "industry": "Renewable Utilities",
  "market_cap": 285635924000,
  "revenue_growth_pct": 8.94,
  "gross_margin_pct": 19.79,
  "net_margin_pct": 12.83,
  "trailing_fcf": 10863000000,
  "cash": 10172000000,
  "total_debt": 2857000000,
  "net_cash": 7315000000,
  "cfq_score": 3.88,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 3.25,
    "fcf_conversion": 5,
    "fcf_margin": 4,
    "capital_intensity": 4,
    "pricing_power": 3.5,
    "balance_sheet": 5,
    "share_count_quality": 4,
    "margin_stability": 1.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. below VAL 1068.78. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 1070.934, VAH: 1083.855, VAL: 1068.7805
  - TPO POC: 1073.0875
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 1062.95,
  "poc": 1070.934,
  "vah": 1083.855,
  "val": 1068.7805,
  "tpo_poc": 1073.0875,
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
- **Summary**: GEV is not in any configured pair watchlist.

```json
{
  "symbol": "GEV",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for GEV.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "GEV",
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
- **Auto-pulled**: 2026-05-01
