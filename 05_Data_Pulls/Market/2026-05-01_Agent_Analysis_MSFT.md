---
title: "MSFT Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "MSFT"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.18
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.96
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.64
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "msft"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 18%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 18% confidence. Agent entropy is diffuse (0.96). Drivers: fundamentals, macro. Risks: risk. 6 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.96)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 43%, bearish 20%, neutral 36%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.64)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 30% | 318ms | MSFT closed at 414.44. 7d -4.3%, 30d 6.5%. RSI 54.5, MACD positive. |
| risk | BEARISH | 61% | 1865ms | Risk read: 30d vol 32.1%, max drawdown -34.2%, 30d return 6.5%. |
| sentiment | BULLISH | 38% | 613ms | 20 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | NEUTRAL | 28% | 1176ms | Volume ratio 0.85x, price change 1.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 605ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 55% | 3671ms | Revenue growth 14.9%, net margin 36.1%, trailing FCF 142.3B. |
| auction | NEUTRAL | 22% | 1701ms | Auction state: balance. at POC 413.92. Session bars: 390. |
| pair | NEUTRAL | 5% | 0ms | MSFT is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 1763ms | No recent earnings within 90 days for MSFT. |
| prediction_market | NEUTRAL | 12% | 65ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: MSFT closed at 414.44. 7d -4.3%, 30d 6.5%. RSI 54.5, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "MSFT",
  "bars": 260,
  "close": 414.44,
  "change_7d_pct": -4.27,
  "change_30d_pct": 6.53,
  "sma20": 405.573,
  "sma50": 396.1104,
  "sma200": 468.0026,
  "ema21": 408.8713,
  "rsi14": 54.48,
  "macd": 8.4696,
  "macd_signal": 7.9952,
  "macd_crossover": "positive",
  "bollinger_position": 0.601
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 32.1%, max drawdown -34.2%, 30d return 6.5%.
- **Evidence**:
  - Max drawdown: -34.2%
  - 30d realized volatility: 32.1%
  - Sharpe-like score: -1.23
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3212,
  "realized_vol_90d": 0.3191,
  "max_drawdown_pct": -34.18,
  "atr14": null,
  "change_30d_pct": 6.53,
  "sharpe_like_90d": -1.23,
  "beta": 1.107,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 20 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - Microsoft: Underdog Cloud Player With Serious Upside
  - Big Tech capex ranked: What Alphabet, Amazon, Apple, Meta, and Microsoft are spending as AI investment surges
  - Amazon vs. Microsoft and the Great AI Capex Divergence
  - Pentagon inks deals with Nvidia, Microsoft and AWS to deploy AI on classified networks
  - Big Tech Bets Big on AI Spending: ETFs to Win

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "Microsoft: Underdog Cloud Player With Serious Upside",
    "Big Tech capex ranked: What Alphabet, Amazon, Apple, Meta, and Microsoft are spending as AI investment surges",
    "Amazon vs. Microsoft and the Great AI Capex Divergence",
    "Pentagon inks deals with Nvidia, Microsoft and AWS to deploy AI on classified networks",
    "Big Tech Bets Big on AI Spending: ETFs to Win"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.85x, price change 1.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 31.1M vs avg 36.5M
  - Market cap: 3.1T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.64) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 414.44,
  "change_pct": 1.63,
  "volume": 31134780,
  "avg_volume": 36482890,
  "volume_ratio": 0.85,
  "market_cap": 3078638529200,
  "beta": 1.107,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.64,
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
- **Summary**: Revenue growth 14.9%, net margin 36.1%, trailing FCF 142.3B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 14.9%
  - Net cash: -24.9B

```json
{
  "company_name": "Microsoft Corporation",
  "sector": "Technology",
  "industry": "Software - Infrastructure",
  "market_cap": 3078638529200,
  "revenue_growth_pct": 14.93,
  "gross_margin_pct": 68.82,
  "net_margin_pct": 36.15,
  "trailing_fcf": 142281000000,
  "cash": 32105000000,
  "total_debt": 56965000000,
  "net_cash": -24860000000,
  "cfq_score": 3.94,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 3,
    "fcf_margin": 5,
    "capital_intensity": 1,
    "pricing_power": 5,
    "balance_sheet": 4,
    "share_count_quality": 4,
    "margin_stability": 4.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 413.92. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 413.9207, VAH: 415.576, VAL: 412.2653
  - TPO POC: 413.9207
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 414.44,
  "poc": 413.9207,
  "vah": 415.576,
  "val": 412.2653,
  "tpo_poc": 413.9207,
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
- **Summary**: MSFT is not in any configured pair watchlist.

```json
{
  "symbol": "MSFT",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for MSFT.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "MSFT",
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
