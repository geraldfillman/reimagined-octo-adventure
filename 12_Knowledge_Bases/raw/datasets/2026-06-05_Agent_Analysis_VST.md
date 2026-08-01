---
title: "VST Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "VST"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-06-05"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BEARISH"]
final_verdict: "BEARISH"
final_confidence: 0.42
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.87
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.68
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "vst"]
---

## Verdict

- **Final verdict**: BEARISH
- **Final confidence**: 42%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bearish at 42% confidence. Agent entropy is diffuse (0.87). Drivers: sentiment, macro. Risks: risk, price. 4 neutral layer(s).
- **Top drivers**: sentiment, macro
- **Top risks**: risk, price, fundamentals

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.87)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 26%, bearish 58%, neutral 16%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.68)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 64% | 38ms | VST closed at 148.38. 7d -7.3%, 30d -5.4%. RSI 44.8, MACD positive. |
| risk | BEARISH | 54% | 42ms | Risk read: 30d vol 49.8%, max drawdown -38.2%, 30d return -5.4%. |
| sentiment | BULLISH | 46% | 112ms | 20 headline(s): 3 positive, 0 negative, net score 3. |
| microstructure | BEARISH | 31% | 199ms | Volume ratio 0.51x, price change -3.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 10247ms | Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%. |
| fundamentals | BEARISH | 33% | 51ms | Revenue growth -12.4%, net margin 5.6%, trailing FCF 3.4B. |
| auction | NEUTRAL | 22% | 184ms | Auction state: balance. below VAL 149.02. Session bars: 328. |
| pair | NEUTRAL | 5% | 3ms | VST is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 39ms | No recent earnings within 90 days for VST. |
| prediction_market | NEUTRAL | 12% | 30ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 64%
- **Summary**: VST closed at 148.38. 7d -7.3%, 30d -5.4%. RSI 44.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "VST",
  "bars": 260,
  "close": 148.38,
  "change_7d_pct": -7.35,
  "change_30d_pct": -5.4,
  "sma20": 150.2735,
  "sma50": 154.3716,
  "sma200": 172.0957,
  "ema21": 153.3174,
  "rsi14": 44.79,
  "macd": 0.079,
  "macd_signal": -0.1833,
  "macd_crossover": "positive",
  "bollinger_position": 0.443
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 54%
- **Summary**: Risk read: 30d vol 49.8%, max drawdown -38.2%, 30d return -5.4%.
- **Evidence**:
  - Max drawdown: -38.2%
  - 30d realized volatility: 49.8%
  - Sharpe-like score: -0.34
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4979,
  "realized_vol_90d": 0.4824,
  "max_drawdown_pct": -38.18,
  "atr14": null,
  "change_30d_pct": -5.4,
  "sharpe_like_90d": -0.34,
  "beta": 1.447,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 3.
- **Evidence**:
  - Vistra vs. Constellation: Which AI Power Stock Is the Better Buy Right Now?
  - High Oil Prices Are Doing What Policy Never Could: It Is Making For Winning Comeback Stories
  - Vistra: A Buy On AI Demand, Nuclear Power, And Strong Cash Flow
  - How to Recession-Proof Your Retirement Before the Second Half of 2026
  - Vistra vs. Constellation Energy: The Big Revenue Face-Off

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 3,
  "sample_headlines": [
    "Vistra vs. Constellation: Which AI Power Stock Is the Better Buy Right Now?",
    "High Oil Prices Are Doing What Policy Never Could: It Is Making For Winning Comeback Stories",
    "Vistra: A Buy On AI Demand, Nuclear Power, And Strong Cash Flow",
    "How to Recession-Proof Your Retirement Before the Second Half of 2026",
    "Vistra vs. Constellation Energy: The Big Revenue Face-Off"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.51x, price change -3.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.4M vs avg 4.7M
  - Market cap: 50.0B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.68) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 148.36,
  "change_pct": -3.47,
  "volume": 2388570.20946,
  "avg_volume": 4661193,
  "volume_ratio": 0.51,
  "market_cap": 50024390952,
  "beta": 1.447,
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

- **Signal**: BEARISH
- **Confidence**: 33%
- **Summary**: Revenue growth -12.4%, net margin 5.6%, trailing FCF 3.4B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: -12.4%
  - Net cash: -19.2B

```json
{
  "company_name": "Vistra Corp.",
  "sector": "Utilities",
  "industry": "Independent Power Producers",
  "market_cap": 50024390952,
  "revenue_growth_pct": -12.41,
  "gross_margin_pct": 17.52,
  "net_margin_pct": 5.56,
  "trailing_fcf": 3434000000,
  "cash": 671000000,
  "total_debt": 19913000000,
  "net_cash": -19242000000,
  "cfq_score": 2.6,
  "cfq_label": "acceptable",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 4,
    "fcf_margin": 2,
    "capital_intensity": 1,
    "pricing_power": 1,
    "balance_sheet": 2,
    "share_count_quality": 5,
    "margin_stability": 1.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. below VAL 149.02. Session bars: 328.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 149.3192, VAH: 151.4354, VAL: 149.0169
  - TPO POC: 149.3192
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-06, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 148.36,
  "poc": 149.3192,
  "vah": 151.4354,
  "val": 149.0169,
  "tpo_poc": 149.3192,
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
- **Summary**: VST is not in any configured pair watchlist.

```json
{
  "symbol": "VST",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for VST.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "VST",
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
- **Auto-pulled**: 2026-06-05
