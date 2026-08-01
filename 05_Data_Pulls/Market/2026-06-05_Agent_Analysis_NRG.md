---
title: "NRG Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "NRG"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-06-05"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH"]
final_verdict: "BEARISH"
final_confidence: 0.41
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.94
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.69
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "nrg"]
---

## Verdict

- **Final verdict**: BEARISH
- **Final confidence**: 41%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bearish at 41% confidence. Agent entropy is diffuse (0.94). Drivers: sentiment, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: sentiment, macro
- **Top risks**: risk, price, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.94)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 25%, bearish 52%, neutral 23%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.69)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 64% | 10074ms | NRG closed at 128.9. 7d -6.6%, 30d -16.6%. RSI 38.7, MACD positive. |
| risk | BEARISH | 72% | 10075ms | Risk read: 30d vol 49.6%, max drawdown -32.8%, 30d return -16.6%. |
| sentiment | BULLISH | 46% | 10232ms | 20 headline(s): 3 positive, 0 negative, net score 3. |
| microstructure | BEARISH | 31% | 10077ms | Volume ratio 0.27x, price change -3.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 10338ms | Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%. |
| fundamentals | NEUTRAL | 26% | 10068ms | Revenue growth 9.2%, net margin 2.8%, trailing FCF 1.9B. |
| auction | NEUTRAL | 22% | 10076ms | Auction state: balance. below VAL 128.97. Session bars: 329. |
| pair | NEUTRAL | 5% | 4ms | NRG is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 10067ms | No recent earnings within 90 days for NRG. |
| prediction_market | NEUTRAL | 12% | 10088ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 64%
- **Summary**: NRG closed at 128.9. 7d -6.6%, 30d -16.6%. RSI 38.7, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "NRG",
  "bars": 260,
  "close": 128.9,
  "change_7d_pct": -6.59,
  "change_30d_pct": -16.59,
  "sma20": 133.658,
  "sma50": 146.8108,
  "sma200": 157.3852,
  "ema21": 136.5873,
  "rsi14": 38.72,
  "macd": -4.2882,
  "macd_signal": -4.6747,
  "macd_crossover": "positive",
  "bollinger_position": 0.234
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 72%
- **Summary**: Risk read: 30d vol 49.6%, max drawdown -32.8%, 30d return -16.6%.
- **Evidence**:
  - Max drawdown: -32.8%
  - 30d realized volatility: 49.6%
  - Sharpe-like score: -0.83
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4963,
  "realized_vol_90d": 0.4942,
  "max_drawdown_pct": -32.78,
  "atr14": null,
  "change_30d_pct": -16.59,
  "sharpe_like_90d": -0.83,
  "beta": 1.315,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 3.
- **Evidence**:
  - Why Is NRG (NRG) Down 6% Since Last Earnings Report?
  - NRG Energy's Historic Run Isn't Over Yet
  - $700 Billion and Most Investors Are Watching The Wrong Companies
  - Investors Heavily Search NRG Energy, Inc. (NRG): Here is What You Need to Know
  - Small-Cap Value ETFs: SLYV Tops VBR in One Year Growth, VBR Offers Lower Fees

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 3,
  "sample_headlines": [
    "Why Is NRG (NRG) Down 6% Since Last Earnings Report?",
    "NRG Energy's Historic Run Isn't Over Yet",
    "$700 Billion and Most Investors Are Watching The Wrong Companies",
    "Investors Heavily Search NRG Energy, Inc. (NRG): Here is What You Need to Know",
    "Small-Cap Value ETFs: SLYV Tops VBR in One Year Growth, VBR Offers Lower Fees"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.27x, price change -3.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 753.1K vs avg 2.8M
  - Market cap: 27.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.69) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 128.46,
  "change_pct": -3.7,
  "volume": 753071,
  "avg_volume": 2836171,
  "volume_ratio": 0.27,
  "market_cap": 27103321936,
  "beta": 1.315,
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
  "market_cap": 27103321936,
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
- **Summary**: Auction state: balance. below VAL 128.97. Session bars: 329.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 128.9719, VAH: 130.5376, VAL: 128.9719
  - TPO POC: 128.9719
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-06, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 128.46,
  "poc": 128.9719,
  "vah": 130.5376,
  "val": 128.9719,
  "tpo_poc": 128.9719,
  "avwap": null,
  "avwap_anchor": "2026-05-06",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-06-05",
  "session_bar_count": 329,
  "daily_bar_count": 22
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
- **Auto-pulled**: 2026-06-05
