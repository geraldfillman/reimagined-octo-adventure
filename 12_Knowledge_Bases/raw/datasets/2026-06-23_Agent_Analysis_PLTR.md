---
title: "PLTR Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "PLTR"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-23"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.32
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.98
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.6
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "pltr"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 32%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 32% confidence. Agent entropy is diffuse (0.98). Drivers: fundamentals, macro. Risks: risk, price. 6 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.98)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 28%, bearish 44%, neutral 28%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.6)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 83% | 37ms | PLTR closed at 118.85. 7d -9.3%, 30d -13.8%. RSI 34.1, MACD negative. |
| risk | BEARISH | 66% | 38ms | Risk read: 30d vol 56.9%, max drawdown -42.6%, 30d return -13.8%. |
| sentiment | NEUTRAL | 22% | 79ms | 20 headline(s): 1 positive, 1 negative, net score 0. |
| microstructure | NEUTRAL | 24% | 286ms | Volume ratio 0.52x, price change -0.4%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 212ms | Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%. |
| fundamentals | BULLISH | 65% | 1008ms | Revenue growth 56.2%, net margin 36.3%, trailing FCF 4.0B. |
| auction | NEUTRAL | 22% | 1354ms | Auction state: balance. at POC 119.13. Session bars: 246. |
| pair | NEUTRAL | 5% | 1ms | PLTR is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 1424ms | No recent earnings within 90 days for PLTR. |
| prediction_market | NEUTRAL | 12% | 46ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 83%
- **Summary**: PLTR closed at 118.85. 7d -9.3%, 30d -13.8%. RSI 34.1, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "PLTR",
  "bars": 260,
  "close": 118.85,
  "change_7d_pct": -9.33,
  "change_30d_pct": -13.75,
  "sma20": 136.2235,
  "sma50": 138.03,
  "sma200": 159.5466,
  "ema21": 132.8517,
  "rsi14": 34.12,
  "macd": -4.4013,
  "macd_signal": -2.5272,
  "macd_crossover": "negative",
  "bollinger_position": 0.088
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 66%
- **Summary**: Risk read: 30d vol 56.9%, max drawdown -42.6%, 30d return -13.8%.
- **Evidence**:
  - Max drawdown: -42.6%
  - 30d realized volatility: 56.9%
  - Sharpe-like score: -0.44
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5695,
  "realized_vol_90d": 0.5289,
  "max_drawdown_pct": -42.63,
  "atr14": null,
  "change_30d_pct": -13.75,
  "sharpe_like_90d": -0.44,
  "beta": 1.515,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 20 headline(s): 1 positive, 1 negative, net score 0.
- **Evidence**:
  - Palantir Stock Flirts With Oversold, Down Nearly 40% In 2026
  - Forget Palantir: This Enterprise Software Fortress Is a No-Brainer Buy
  - Zeta Stock Jumps After Palantir Partnership — Deal Could Drive $100 Million in Annual Revenue
  - SpaceX vs Palantir Stock: 1 May Offer You a Significantly Bigger Gain, According to Wall Street.
  - Palantir Technologies Inc. (PLTR) Registers a Bigger Fall Than the Market: Important Facts to Note

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 1,
  "net_score": 0,
  "sample_headlines": [
    "Palantir Stock Flirts With Oversold, Down Nearly 40% In 2026",
    "Forget Palantir: This Enterprise Software Fortress Is a No-Brainer Buy",
    "Zeta Stock Jumps After Palantir Partnership — Deal Could Drive $100 Million in Annual Revenue",
    "SpaceX vs Palantir Stock: 1 May Offer You a Significantly Bigger Gain, According to Wall Street.",
    "Palantir Technologies Inc. (PLTR) Registers a Bigger Fall Than the Market: Important Facts to Note"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.52x, price change -0.4%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 23.2M vs avg 44.4M
  - Market cap: 273.3B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.6) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 119.051,
  "change_pct": -0.38,
  "volume": 23191122.0625,
  "avg_volume": 44404548,
  "volume_ratio": 0.52,
  "market_cap": 273349429570,
  "beta": 1.515,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.6,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 31%
- **Summary**: Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.3%
  - VIX: 17.28
  - HY spread: 2.6%

```json
{
  "DFF": {
    "date": "2026-06-19",
    "value": 3.63
  },
  "T10Y2Y": {
    "date": "2026-06-22",
    "value": 0.27
  },
  "VIXCLS": {
    "date": "2026-06-22",
    "value": 17.28
  },
  "BAMLH0A0HYM2": {
    "date": "2026-06-22",
    "value": 2.65
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 65%
- **Summary**: Revenue growth 56.2%, net margin 36.3%, trailing FCF 4.0B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 56.2%
  - Net cash: 2.1B

```json
{
  "company_name": "Palantir Technologies Inc.",
  "sector": "Technology",
  "industry": "Software - Infrastructure",
  "market_cap": 273349429570,
  "revenue_growth_pct": 56.18,
  "gross_margin_pct": 82.37,
  "net_margin_pct": 36.31,
  "trailing_fcf": 4007671000,
  "cash": 2291631000,
  "total_debt": 211977000,
  "net_cash": 2079654000,
  "cfq_score": 4.28,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 5,
    "fcf_margin": 5,
    "capital_intensity": 5,
    "pricing_power": 5,
    "balance_sheet": 5,
    "share_count_quality": 1,
    "margin_stability": 2
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 119.13. Session bars: 246.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 119.1337, VAH: 120.0888, VAL: 118.4175
  - TPO POC: 118.895
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-24, bars: 20).

```json
{
  "auction_state": "balance",
  "current_price": 119.051,
  "poc": 119.1337,
  "vah": 120.0888,
  "val": 118.4175,
  "tpo_poc": 118.895,
  "avwap": null,
  "avwap_anchor": "2026-05-24",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-06-23",
  "session_bar_count": 246,
  "daily_bar_count": 20
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: PLTR is not in any configured pair watchlist.

```json
{
  "symbol": "PLTR",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for PLTR.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "PLTR",
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
- **Auto-pulled**: 2026-06-23
