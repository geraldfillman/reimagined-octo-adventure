---
title: "NRG Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "NRG"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-06-23"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.29
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 1
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "nrg"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 29%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 29% confidence. Agent entropy is diffuse (1). Drivers: sentiment, macro. Risks: risk, price. 6 neutral layer(s).
- **Top drivers**: sentiment, macro
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (1)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 29%, bearish 37%, neutral 34%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 45% | 826ms | NRG closed at 138.31. 7d 11.8%, 30d 0.1%. RSI 54.9, MACD positive. |
| risk | BEARISH | 61% | 826ms | Risk read: 30d vol 48.0%, max drawdown -34.4%, 30d return 0.1%. |
| sentiment | BULLISH | 54% | 861ms | 20 headline(s): 3 positive, 0 negative, net score 4. |
| microstructure | NEUTRAL | 24% | 1023ms | Volume ratio 0.35x, price change -0.3%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 825ms | Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%. |
| fundamentals | NEUTRAL | 26% | 2663ms | Revenue growth 9.2%, net margin 2.8%, trailing FCF 1.9B. |
| auction | NEUTRAL | 22% | 2981ms | Auction state: balance. above VAH 138.43. Session bars: 246. |
| pair | NEUTRAL | 5% | 2ms | NRG is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 2568ms | No recent earnings within 90 days for NRG. |
| prediction_market | NEUTRAL | 12% | 873ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: NRG closed at 138.31. 7d 11.8%, 30d 0.1%. RSI 54.9, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "NRG",
  "bars": 260,
  "close": 138.31,
  "change_7d_pct": 11.81,
  "change_30d_pct": 0.14,
  "sma20": 132.187,
  "sma50": 142.0478,
  "sma200": 156.4963,
  "ema21": 133.4841,
  "rsi14": 54.87,
  "macd": -1.3661,
  "macd_signal": -3.2242,
  "macd_crossover": "positive",
  "bollinger_position": 0.799
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 48.0%, max drawdown -34.4%, 30d return 0.1%.
- **Evidence**:
  - Max drawdown: -34.4%
  - 30d realized volatility: 48.0%
  - Sharpe-like score: -0.59
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4796,
  "realized_vol_90d": 0.4959,
  "max_drawdown_pct": -34.44,
  "atr14": null,
  "change_30d_pct": 0.14,
  "sharpe_like_90d": -0.59,
  "beta": 1.216,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 54%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 4.
- **Evidence**:
  - Is It Worth Investing in NRG (NRG) Based on Wall Street's Bullish Views?
  - NRG Energy (NRG) Beats Stock Market Upswing: What Investors Need to Know
  - NRG Energy (NRG) Surpasses Market Returns: Some Facts Worth Knowing
  - NRG Energy, Inc. (NRG) Is a Trending Stock: Facts to Know Before Betting on It
  - Why Is NRG (NRG) Down 6% Since Last Earnings Report?

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 4,
  "sample_headlines": [
    "Is It Worth Investing in NRG (NRG) Based on Wall Street's Bullish Views?",
    "NRG Energy (NRG) Beats Stock Market Upswing: What Investors Need to Know",
    "NRG Energy (NRG) Surpasses Market Returns: Some Facts Worth Knowing",
    "NRG Energy, Inc. (NRG) Is a Trending Stock: Facts to Know Before Betting on It",
    "Why Is NRG (NRG) Down 6% Since Last Earnings Report?"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.35x, price change -0.3%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 922.0K vs avg 2.6M
  - Market cap: 29.2B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 138.56,
  "change_pct": -0.25,
  "volume": 921955,
  "avg_volume": 2646900,
  "volume_ratio": 0.35,
  "market_cap": 29234285283,
  "beta": 1.216,
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

- **Signal**: NEUTRAL
- **Confidence**: 26%
- **Summary**: Revenue growth 9.2%, net margin 2.8%, trailing FCF 1.9B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 9.2%
  - Net cash: -23.1B

```json
{
  "company_name": "NRG Energy, Inc.",
  "sector": "Utilities",
  "industry": "Independent Power Producers",
  "market_cap": 29234285283,
  "revenue_growth_pct": 9.17,
  "gross_margin_pct": 21.85,
  "net_margin_pct": 2.81,
  "trailing_fcf": 1916000000,
  "cash": 235000000,
  "total_debt": 23357000000,
  "net_cash": -23122000000,
  "cfq_score": 1.67,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 3.25,
    "fcf_conversion": 0,
    "fcf_margin": 0,
    "capital_intensity": 4,
    "pricing_power": 0.5,
    "balance_sheet": 1,
    "share_count_quality": 5,
    "margin_stability": 1
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. above VAH 138.43. Session bars: 246.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 137.0736, VAH: 138.4314, VAL: 134.3579
  - TPO POC: 137.3451
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-24, bars: 20).

```json
{
  "auction_state": "balance",
  "current_price": 138.55,
  "poc": 137.0736,
  "vah": 138.4314,
  "val": 134.3579,
  "tpo_poc": 137.3451,
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
- **Summary**: NRG is not in any configured pair watchlist.

```json
{
  "symbol": "NRG",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for NRG.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "NRG",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "AI Power Infrastructure".

```json
{
  "query": "AI Power Infrastructure",
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
