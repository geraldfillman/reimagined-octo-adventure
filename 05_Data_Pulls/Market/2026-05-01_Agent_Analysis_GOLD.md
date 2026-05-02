---
title: "GOLD Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GOLD"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.22
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.98
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "gold"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 22%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 22% confidence. Agent entropy is diffuse (0.98). Drivers: fundamentals, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.98)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 30%, bearish 43%, neutral 27%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 574ms | GOLD closed at 42.63. 7d -9.8%, 30d -3.0%. RSI 39.4, MACD bearish_cross. |
| risk | BEARISH | 47% | 1598ms | Risk read: 30d vol 53.1%, max drawdown -40.8%, 30d return -3.0%. |
| sentiment | NEUTRAL | 22% | 3354ms | 12 headline(s): 0 positive, 0 negative, net score 0. |
| microstructure | BEARISH | 31% | 2300ms | Volume ratio 1.06x, price change -5.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 103ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 43% | 3408ms | Revenue growth 13.2%, net margin 0.2%, trailing FCF 412.2M. |
| auction | NEUTRAL | 22% | 1547ms | Auction state: balance. at POC 42.63. Session bars: 367. |
| pair | NEUTRAL | 5% | 1ms | GOLD is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 235ms | No recent earnings within 90 days for GOLD. |
| prediction_market | NEUTRAL | 12% | 150ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: GOLD closed at 42.63. 7d -9.8%, 30d -3.0%. RSI 39.4, MACD bearish_cross.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: bearish_cross

```json
{
  "api_symbol": "GOLD",
  "bars": 260,
  "close": 42.63,
  "change_7d_pct": -9.82,
  "change_30d_pct": -3.05,
  "sma20": 45.486,
  "sma50": 47.4782,
  "sma200": 35.3234,
  "ema21": 45.5,
  "rsi14": 39.36,
  "macd": -0.232,
  "macd_signal": -0.1285,
  "macd_crossover": "bearish_cross",
  "bollinger_position": 0.08
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 47%
- **Summary**: Risk read: 30d vol 53.1%, max drawdown -40.8%, 30d return -3.0%.
- **Evidence**:
  - Max drawdown: -40.8%
  - 30d realized volatility: 53.1%
  - Sharpe-like score: 1.41
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5314,
  "realized_vol_90d": 0.644,
  "max_drawdown_pct": -40.79,
  "atr14": null,
  "change_30d_pct": -3.05,
  "sharpe_like_90d": 1.41,
  "beta": 0.567,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 12 headline(s): 0 positive, 0 negative, net score 0.
- **Evidence**:
  - Red River Bancshares (RRBI) Q1 Earnings Surpass Estimates
  - Gold.com (GOLD) Registers a Bigger Fall Than the Market: Important Facts to Note
  - DENARIUS METALS ANNOUNCES DETAILS FOR THE APRIL 30, 2026 INTEREST PAYMENTS ON ITS CONVERTIBLE UNSECURED DEBENTURES AND THE GOLD PREMIUM PAYMENTS DUE ON ITS 2023 DEBENTURES
  - LUCA INTERSECTS 118 METRES OF 2.5 G/T GOLD, 78.0 G/T SILVER, 0.8% COPPER, 0.6% PB AND 2.0% ZINC AT LARGO NORTE ZONE, CAMPO MORADO MINE
  - SONORO GOLD ANNOUNCES CLOSING OF OVERSUBSCRIBED $12.2M PRIVATE PLACEMENT

```json
{
  "headline_count": 12,
  "positive_count": 0,
  "negative_count": 0,
  "net_score": 0,
  "sample_headlines": [
    "Red River Bancshares (RRBI) Q1 Earnings Surpass Estimates",
    "Gold.com (GOLD) Registers a Bigger Fall Than the Market: Important Facts to Note",
    "DENARIUS METALS ANNOUNCES DETAILS FOR THE APRIL 30, 2026 INTEREST PAYMENTS ON ITS CONVERTIBLE UNSECURED DEBENTURES AND THE GOLD PREMIUM PAYMENTS DUE ON ITS 2023 DEBENTURES",
    "LUCA INTERSECTS 118 METRES OF 2.5 G/T GOLD, 78.0 G/T SILVER, 0.8% COPPER, 0.6% PB AND 2.0% ZINC AT LARGO NORTE ZONE, CAMPO MORADO MINE",
    "SONORO GOLD ANNOUNCES CLOSING OF OVERSUBSCRIBED $12.2M PRIVATE PLACEMENT"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 1.06x, price change -5.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 760.7K vs avg 718.8K
  - Market cap: 1.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 42.63,
  "change_pct": -5.66,
  "volume": 760725,
  "avg_volume": 718834,
  "volume_ratio": 1.06,
  "market_cap": 1078411110,
  "beta": 0.567,
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
- **Confidence**: 43%
- **Summary**: Revenue growth 13.2%, net margin 0.2%, trailing FCF 412.2M.
- **Evidence**:
  - Sector: Financial Services
  - Revenue growth: 13.2%
  - Net cash: -155.3M

```json
{
  "company_name": "Gold.com, Inc.",
  "sector": "Financial Services",
  "industry": "Financial - Capital Markets",
  "market_cap": 1078411110,
  "revenue_growth_pct": 13.19,
  "gross_margin_pct": 1.92,
  "net_margin_pct": 0.16,
  "trailing_fcf": 412189000,
  "cash": 152050000,
  "total_debt": 307328000,
  "net_cash": -155278000,
  "cfq_score": 3.16,
  "cfq_label": "acceptable",
  "cfq_factors": {
    "ocf_durability": 2.5,
    "fcf_conversion": 5,
    "fcf_margin": 1,
    "capital_intensity": 5,
    "pricing_power": 3.5,
    "balance_sheet": 3,
    "share_count_quality": 2,
    "margin_stability": 2
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 42.63. Session bars: 367.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 42.6315, VAH: 44.026, VAL: 42.4572
  - TPO POC: 42.7186
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 42.63,
  "poc": 42.6315,
  "vah": 44.026,
  "val": 42.4572,
  "tpo_poc": 42.7186,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 367,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: GOLD is not in any configured pair watchlist.

```json
{
  "symbol": "GOLD",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for GOLD.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "GOLD",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Dalio Style All-Weather Hard Assets".

```json
{
  "query": "Dalio Style All-Weather Hard Assets",
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
