---
title: "TER Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "TER"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.32
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.83
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.69
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "ter"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 32%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 32% confidence. Agent entropy is diffuse (0.83). Drivers: fundamentals, price. Risks: risk. 5 neutral layer(s).
- **Top drivers**: fundamentals, price, sentiment
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.83)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 63%, bearish 15%, neutral 22%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.69)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 53% | 200ms | TER closed at 345.26. 7d -10.4%, 30d 14.2%. RSI 48.5, MACD negative. |
| risk | BEARISH | 50% | 197ms | Risk read: 30d vol 92.5%, max drawdown -26.7%, 30d return 14.2%. |
| sentiment | BULLISH | 54% | 326ms | 20 headline(s): 4 positive, 0 negative, net score 4. |
| microstructure | NEUTRAL | 24% | 339ms | Volume ratio 0.12x, price change 2.0%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 315ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 65% | 161ms | Revenue growth 13.1%, net margin 17.4%, trailing FCF 1.2B. |
| auction | NEUTRAL | 22% | 286ms | Auction state: balance. above VAH 347.18. Session bars: 28. |
| pair | NEUTRAL | 5% | 12ms | TER is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 132ms | No recent earnings within 90 days for TER. |
| prediction_market | NEUTRAL | 12% | 24ms | No relevant prediction markets found for "TER". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 53%
- **Summary**: TER closed at 345.26. 7d -10.4%, 30d 14.2%. RSI 48.5, MACD negative.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "TER",
  "bars": 260,
  "close": 345.26,
  "change_7d_pct": -10.36,
  "change_30d_pct": 14.17,
  "sma20": 365.494,
  "sma50": 329.7988,
  "sma200": 209.4146,
  "ema21": 356.8395,
  "rsi14": 48.48,
  "macd": 9.7557,
  "macd_signal": 16.8283,
  "macd_crossover": "negative",
  "bollinger_position": 0.318
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 50%
- **Summary**: Risk read: 30d vol 92.5%, max drawdown -26.7%, 30d return 14.2%.
- **Evidence**:
  - Max drawdown: -26.7%
  - 30d realized volatility: 92.5%
  - Sharpe-like score: 2.55
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.9247,
  "realized_vol_90d": 0.7366,
  "max_drawdown_pct": -26.73,
  "atr14": null,
  "change_30d_pct": 14.17,
  "sharpe_like_90d": 2.55,
  "beta": 1.794,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 54%
- **Summary**: 20 headline(s): 4 positive, 0 negative, net score 4.
- **Evidence**:
  - Here's Why This AI-Related Company's Stock Soared Today
  - Best Momentum Stocks to Buy for April 30th
  - Here Are Thursday’s Top Wall Street Analyst Research Calls: AbbVie, Equinix, GE Healthcare, Kratos Defense, Meta Platforms, Oneok, Palantir Technologies, Wingstop, and More
  - Why Teradyne Tumbled Today
  - Teradyne, Inc. (TER) Q1 2026 Earnings Call Transcript

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 0,
  "net_score": 4,
  "sample_headlines": [
    "Here's Why This AI-Related Company's Stock Soared Today",
    "Best Momentum Stocks to Buy for April 30th",
    "Here Are Thursday’s Top Wall Street Analyst Research Calls: AbbVie, Equinix, GE Healthcare, Kratos Defense, Meta Platforms, Oneok, Palantir Technologies, Wingstop, and More",
    "Why Teradyne Tumbled Today",
    "Teradyne, Inc. (TER) Q1 2026 Earnings Call Transcript"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.12x, price change 2.0%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 441.4K vs avg 3.7M
  - Market cap: 54.8B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.69) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 350.17,
  "change_pct": 1.95,
  "volume": 441363,
  "avg_volume": 3717338,
  "volume_ratio": 0.12,
  "market_cap": 54822265030,
  "beta": 1.794,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.69,
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
- **Confidence**: 65%
- **Summary**: Revenue growth 13.1%, net margin 17.4%, trailing FCF 1.2B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 13.1%
  - Net cash: 159.5M

```json
{
  "company_name": "Teradyne, Inc.",
  "sector": "Technology",
  "industry": "Semiconductors",
  "market_cap": 54822265030,
  "revenue_growth_pct": 13.13,
  "gross_margin_pct": 58.55,
  "net_margin_pct": 17.37,
  "trailing_fcf": 1161620999,
  "cash": 241944000,
  "total_debt": 82398000,
  "net_cash": 159546000,
  "cfq_score": 3.87,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 4,
    "fcf_margin": 4,
    "capital_intensity": 3,
    "pricing_power": 3,
    "balance_sheet": 5,
    "share_count_quality": 4,
    "margin_stability": 2
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. above VAH 347.18. Session bars: 28.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 345.8003, VAH: 347.1754, VAL: 338.9251
  - TPO POC: 345.8003
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 350.17,
  "poc": 345.8003,
  "vah": 347.1754,
  "val": 338.9251,
  "tpo_poc": 345.8003,
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
- **Summary**: TER is not in any configured pair watchlist.

```json
{
  "symbol": "TER",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for TER.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "TER",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "TER".

```json
{
  "query": "TER",
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
