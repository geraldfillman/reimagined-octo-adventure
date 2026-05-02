---
title: "FTAI Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "FTAI"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.17
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.91
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.68
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "ftai"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 17%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 17% confidence. Agent entropy is diffuse (0.91). Drivers: price, fundamentals. Risks: risk, microstructure. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: risk, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.91)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 52%, bearish 31%, neutral 16%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.68)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 38% | 260ms | FTAI closed at 239.08. 7d 4.8%, 30d -0.4%. RSI 48.3, MACD negative. |
| risk | BEARISH | 64% | 260ms | Risk read: 30d vol 77.5%, max drawdown -31.3%, 30d return -0.4%. |
| sentiment | BULLISH | 46% | 397ms | 20 headline(s): 2 positive, 1 negative, net score 3. |
| microstructure | BEARISH | 31% | 337ms | Volume ratio 0.12x, price change -2.9%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 244ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 39% | 201ms | Revenue growth 43.2%, net margin 20.0%, trailing FCF -2.2B. |
| auction | NEUTRAL | 22% | 1214ms | Auction state: balance. inside value 238.1–242.94. Session bars: 28. |
| pair | NEUTRAL | 5% | 11ms | FTAI is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 177ms | No recent earnings within 90 days for FTAI. |
| prediction_market | NEUTRAL | 12% | 20ms | No relevant prediction markets found for "FTAI". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: FTAI closed at 239.08. 7d 4.8%, 30d -0.4%. RSI 48.3, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "FTAI",
  "bars": 260,
  "close": 239.08,
  "change_7d_pct": 4.78,
  "change_30d_pct": -0.44,
  "sma20": 245.313,
  "sma50": 254.5952,
  "sma200": 201.592,
  "ema21": 241.3498,
  "rsi14": 48.27,
  "macd": -5.8245,
  "macd_signal": -4.9926,
  "macd_crossover": "negative",
  "bollinger_position": 0.402
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 64%
- **Summary**: Risk read: 30d vol 77.5%, max drawdown -31.3%, 30d return -0.4%.
- **Evidence**:
  - Max drawdown: -31.3%
  - 30d realized volatility: 77.5%
  - Sharpe-like score: 1.78
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.7751,
  "realized_vol_90d": 0.6749,
  "max_drawdown_pct": -31.26,
  "atr14": null,
  "change_30d_pct": -0.44,
  "sharpe_like_90d": 1.78,
  "beta": 1.649,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 2 positive, 1 negative, net score 3.
- **Evidence**:
  - Here's Why FTAI Aviation Popped Higher by More Than 15% Today
  - FTAI Aviation: Business Humming Macro Concerns Overblown
  - MARA to buy Ohio gas plant operator Long Ridge for $1.5 billion as it pivots beyond bitcoin
  - FTAI Aviation (FTAI) Q1 Earnings Miss Estimates
  - FTAI Aviation Ltd. Reports First Quarter 2026 Results, Increases Dividend to $0.45 per Ordinary Share

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 1,
  "net_score": 3,
  "sample_headlines": [
    "Here's Why FTAI Aviation Popped Higher by More Than 15% Today",
    "FTAI Aviation: Business Humming Macro Concerns Overblown",
    "MARA to buy Ohio gas plant operator Long Ridge for $1.5 billion as it pivots beyond bitcoin",
    "FTAI Aviation (FTAI) Q1 Earnings Miss Estimates",
    "FTAI Aviation Ltd. Reports First Quarter 2026 Results, Increases Dividend to $0.45 per Ordinary Share"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.12x, price change -2.9%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 194.4K vs avg 1.6M
  - Market cap: 24.9B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.68) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 242.37,
  "change_pct": -2.92,
  "volume": 194439.13716,
  "avg_volume": 1628229,
  "volume_ratio": 0.12,
  "market_cap": 24862474564,
  "beta": 1.649,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.68,
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
- **Confidence**: 39%
- **Summary**: Revenue growth 43.2%, net margin 20.0%, trailing FCF -2.2B.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 43.2%
  - Net cash: 412.2M

```json
{
  "company_name": "FTAI Aviation Ltd.",
  "sector": "Industrials",
  "industry": "Rental & Leasing Services",
  "market_cap": 24862474564,
  "revenue_growth_pct": 43.24,
  "gross_margin_pct": 31.08,
  "net_margin_pct": 19.98,
  "trailing_fcf": -2240439000,
  "cash": 412240000,
  "total_debt": 0,
  "net_cash": 412240000,
  "cfq_score": 1.71,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 0.75,
    "fcf_conversion": 0,
    "fcf_margin": 0,
    "capital_intensity": 0,
    "pricing_power": 4,
    "balance_sheet": 5,
    "share_count_quality": 2,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 238.1–242.94. Session bars: 28.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 239.0718, VAH: 242.9431, VAL: 238.1039
  - TPO POC: 239.0718
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 242.37,
  "poc": 239.0718,
  "vah": 242.9431,
  "val": 238.1039,
  "tpo_poc": 239.0718,
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
- **Summary**: FTAI is not in any configured pair watchlist.

```json
{
  "symbol": "FTAI",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for FTAI.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "FTAI",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "FTAI".

```json
{
  "query": "FTAI",
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
