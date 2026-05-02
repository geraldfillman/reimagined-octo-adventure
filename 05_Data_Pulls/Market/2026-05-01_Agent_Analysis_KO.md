---
title: "KO Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "KO"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.54
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.5
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.61
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "ko"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 54%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 54% confidence. Agent entropy is mixed (0.5). Drivers: price, risk. 5 neutral layer(s).
- **Top drivers**: price, risk, fundamentals
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.5)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 76%, bearish 0%, neutral 24%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.61)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 2455ms | KO closed at 78.58. 7d 5.3%, 30d 4.0%. RSI 59.7, MACD positive. |
| risk | BULLISH | 43% | 1076ms | Risk read: 30d vol 18.7%, max drawdown -11.1%, 30d return 4.0%. |
| sentiment | BULLISH | 38% | 1209ms | 12 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | NEUTRAL | 24% | 1765ms | Volume ratio 0.68x, price change -0.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 126ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 44% | 2731ms | Revenue growth 1.9%, net margin 27.3%, trailing FCF 11.6B. |
| auction | NEUTRAL | 22% | 3040ms | Auction state: balance. at POC 78.67. Session bars: 390. |
| pair | NEUTRAL | 10% | 3141ms | KO pair scan: 1 pairs. Most stretched: KO_PEP z_60=N/A [unknown] corr_120=N/A. |
| pead | NEUTRAL | 10% | 3214ms | No recent earnings within 90 days for KO. |
| prediction_market | NEUTRAL | 12% | 63ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: KO closed at 78.58. 7d 5.3%, 30d 4.0%. RSI 59.7, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "KO",
  "bars": 260,
  "close": 78.58,
  "change_7d_pct": 5.29,
  "change_30d_pct": 4.01,
  "sma20": 76.6165,
  "sma50": 77.1638,
  "sma200": 71.9544,
  "ema21": 76.8455,
  "rsi14": 59.7,
  "macd": 0.4243,
  "macd_signal": 0.0308,
  "macd_crossover": "positive",
  "bollinger_position": 0.863
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 43%
- **Summary**: Risk read: 30d vol 18.7%, max drawdown -11.1%, 30d return 4.0%.
- **Evidence**:
  - Max drawdown: -11.1%
  - 30d realized volatility: 18.7%
  - Sharpe-like score: 1.93
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.1875,
  "realized_vol_90d": 0.1747,
  "max_drawdown_pct": -11.14,
  "atr14": null,
  "change_30d_pct": 4.01,
  "sharpe_like_90d": 1.93,
  "beta": 0.361,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 12 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - Is Coca-Cola a Buy, Hold, or Sell After Its Q1 2026 Earnings Report?
  - Coca-Cola vs. PepsiCo: Which Stock Is the Better Buy?
  - 3 of the Best Consumer Staples Stocks in 2026
  - Want $1,307 in Passive Income? Invest $10,000 Into These 3 Dividend Kings
  - Board of Directors of The Coca-Cola Company Elects Two New Officers and Declares Regular Quarterly Dividend

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "Is Coca-Cola a Buy, Hold, or Sell After Its Q1 2026 Earnings Report?",
    "Coca-Cola vs. PepsiCo: Which Stock Is the Better Buy?",
    "3 of the Best Consumer Staples Stocks in 2026",
    "Want $1,307 in Passive Income? Invest $10,000 Into These 3 Dividend Kings",
    "Board of Directors of The Coca-Cola Company Elects Two New Officers and Declares Regular Quarterly Dividend"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.68x, price change -0.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 11.5M vs avg 17.0M
  - Market cap: 338.2B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.61) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 78.58,
  "change_pct": -0.23,
  "volume": 11491273,
  "avg_volume": 17005938,
  "volume_ratio": 0.68,
  "market_cap": 338220107000,
  "beta": 0.361,
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
- **Confidence**: 44%
- **Summary**: Revenue growth 1.9%, net margin 27.3%, trailing FCF 11.6B.
- **Evidence**:
  - Sector: Consumer Defensive
  - Revenue growth: 1.9%
  - Net cash: -33.3B

```json
{
  "company_name": "The Coca-Cola Company",
  "sector": "Consumer Defensive",
  "industry": "Beverages - Non-Alcoholic",
  "market_cap": 338220107000,
  "revenue_growth_pct": 1.87,
  "gross_margin_pct": 61.63,
  "net_margin_pct": 27.34,
  "trailing_fcf": 11634000000,
  "cash": 10574000000,
  "total_debt": 43890000000,
  "net_cash": -33316000000,
  "cfq_score": 3.86,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 3,
    "fcf_conversion": 4,
    "fcf_margin": 5,
    "capital_intensity": 4,
    "pricing_power": 4,
    "balance_sheet": 3,
    "share_count_quality": 4,
    "margin_stability": 4.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 78.67. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 78.6707, VAH: 79.4591, VAL: 78.513
  - TPO POC: 78.3554
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 78.58,
  "poc": 78.6707,
  "vah": 79.4591,
  "val": 78.513,
  "tpo_poc": 78.3554,
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
- **Confidence**: 10%
- **Summary**: KO pair scan: 1 pairs. Most stretched: KO_PEP z_60=N/A [unknown] corr_120=N/A.
- **Evidence**:
  - KO_PEP: z_60=N/A corr_120=N/A [unknown]

```json
{
  "symbol": "KO",
  "pairs_analyzed": 1,
  "pairs_stretched": 0,
  "pairs_broken": 0,
  "most_stretched_pair": "KO_PEP",
  "most_stretched_z60": null,
  "pair_details": [
    {
      "pair_id": "KO_PEP",
      "symbol_a": "KO",
      "symbol_b": "PEP",
      "ratio": null,
      "z_20": null,
      "z_60": null,
      "z_120": null,
      "corr_60": null,
      "corr_120": null,
      "beta_120": null,
      "half_life": null,
      "status": "unknown",
      "bar_count": 124
    }
  ]
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for KO.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "KO",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Buffett Style Quality Compounders".

```json
{
  "query": "Buffett Style Quality Compounders",
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
