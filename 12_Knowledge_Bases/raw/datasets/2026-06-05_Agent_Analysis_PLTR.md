---
title: "PLTR Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "PLTR"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-05"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.24
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.92
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "pltr"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 24%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 24% confidence. Agent entropy is diffuse (0.92). Drivers: fundamentals, sentiment. Risks: risk, price. 4 neutral layer(s).
- **Top drivers**: fundamentals, sentiment, macro
- **Top risks**: risk, price, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.92)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 44%, bearish 42%, neutral 15%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 49% | 46ms | PLTR closed at 134.89. 7d 1.8%, 30d -4.7%. RSI 44.3, MACD positive. |
| risk | BEARISH | 61% | 42ms | Risk read: 30d vol 55.9%, max drawdown -38.2%, 30d return -4.7%. |
| sentiment | BULLISH | 46% | 176ms | 20 headline(s): 4 positive, 1 negative, net score 3. |
| microstructure | BEARISH | 31% | 248ms | Volume ratio 0.52x, price change -4.9%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 204ms | Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%. |
| fundamentals | BULLISH | 65% | 48ms | Revenue growth 56.2%, net margin 36.3%, trailing FCF 4.0B. |
| auction | NEUTRAL | 22% | 247ms | Auction state: balance. below VAL 135.16. Session bars: 328. |
| pair | NEUTRAL | 5% | 3ms | PLTR is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 113ms | No recent earnings within 90 days for PLTR. |
| prediction_market | NEUTRAL | 12% | 21ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 49%
- **Summary**: PLTR closed at 134.89. 7d 1.8%, 30d -4.7%. RSI 44.3, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "PLTR",
  "bars": 260,
  "close": 134.89,
  "change_7d_pct": 1.8,
  "change_30d_pct": -4.72,
  "sma20": 139.5455,
  "sma50": 140.8868,
  "sma200": 161.0705,
  "ema21": 141.5672,
  "rsi14": 44.33,
  "macd": 1.0431,
  "macd_signal": 0.783,
  "macd_crossover": "positive",
  "bollinger_position": 0.352
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 61%
- **Summary**: Risk read: 30d vol 55.9%, max drawdown -38.2%, 30d return -4.7%.
- **Evidence**:
  - Max drawdown: -38.2%
  - 30d realized volatility: 55.9%
  - Sharpe-like score: -0.68
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5592,
  "realized_vol_90d": 0.5886,
  "max_drawdown_pct": -38.19,
  "atr14": null,
  "change_30d_pct": -4.72,
  "sharpe_like_90d": -0.68,
  "beta": 1.515,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 4 positive, 1 negative, net score 3.
- **Evidence**:
  - Palantir's Rule of 40 Explosion Indicates Strong AI Dominance
  - 3 Good AI Stocks to Take Profits On Right Now
  - SpaceX Has Turned Space Investing Into One of the Hottest Trades of 2026. But Which ETF Is Actually Worth Buying?
  - Prediction: Palantir Stock Will Hit $200 on This Date
  - Trump Ballroom Tracker outperforms the market by 140%

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 1,
  "net_score": 3,
  "sample_headlines": [
    "Palantir's Rule of 40 Explosion Indicates Strong AI Dominance",
    "3 Good AI Stocks to Take Profits On Right Now",
    "SpaceX Has Turned Space Investing Into One of the Hottest Trades of 2026. But Which ETF Is Actually Worth Buying?",
    "Prediction: Palantir Stock Will Hit $200 on This Date",
    "Trump Ballroom Tracker outperforms the market by 140%"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.52x, price change -4.9%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 23.7M vs avg 45.9M
  - Market cap: 309.5B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 134.78,
  "change_pct": -4.88,
  "volume": 23706811,
  "avg_volume": 45909012,
  "volume_ratio": 0.52,
  "market_cap": 309464314600,
  "beta": 1.515,
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
- **Summary**: Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.4%
  - VIX: 15.40
  - HY spread: 2.7%

```json
{
  "DFF": {
    "date": "2026-06-03",
    "value": 3.62
  },
  "T10Y2Y": {
    "date": "2026-06-04",
    "value": 0.42
  },
  "VIXCLS": {
    "date": "2026-06-04",
    "value": 15.4
  },
  "BAMLH0A0HYM2": {
    "date": "2026-06-04",
    "value": 2.74
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
  "market_cap": 309464314600,
  "revenue_growth_pct": 56.18,
  "gross_margin_pct": 82.37,
  "net_margin_pct": 36.31,
  "trailing_fcf": 4007670999,
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
- **Summary**: Auction state: balance. below VAL 135.16. Session bars: 328.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 138.482, VAH: 139.0351, VAL: 135.1631
  - TPO POC: 138.482
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-06, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 134.78,
  "poc": 138.482,
  "vah": 139.0351,
  "val": 135.1631,
  "tpo_poc": 138.482,
  "avwap": null,
  "avwap_anchor": "2026-05-06",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-06-05",
  "session_bar_count": 328,
  "daily_bar_count": 22
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
- **Auto-pulled**: 2026-06-05
