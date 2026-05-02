---
title: "QCOM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "QCOM"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.26
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.84
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "qcom"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 26%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 26% confidence. Agent entropy is diffuse (0.84). Drivers: price, fundamentals. Risks: risk, microstructure. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, sentiment
- **Top risks**: risk, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.84)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 61%, bearish 24%, neutral 15%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 55% | 198ms | QCOM closed at 173.78. 7d 27.7%, 30d 32.4%. RSI 78.6, MACD positive. |
| risk | BEARISH | 48% | 203ms | Risk read: 30d vol 57.3%, max drawdown -33.9%, 30d return 32.4%. |
| sentiment | BULLISH | 54% | 297ms | 20 headline(s): 4 positive, 0 negative, net score 4. |
| microstructure | BEARISH | 31% | 384ms | Volume ratio 0.24x, price change -3.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 229ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 55% | 158ms | Revenue growth 13.7%, net margin 12.5%, trailing FCF 24.2B. |
| auction | NEUTRAL | 22% | 326ms | Auction state: balance. at POC 174.01. Session bars: 27. |
| pair | NEUTRAL | 5% | 13ms | QCOM is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 145ms | No recent earnings within 90 days for QCOM. |
| prediction_market | NEUTRAL | 12% | 20ms | No relevant prediction markets found for "QCOM". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 55%
- **Summary**: QCOM closed at 173.78. 7d 27.7%, 30d 32.4%. RSI 78.6, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "QCOM",
  "bars": 260,
  "close": 173.78,
  "change_7d_pct": 27.71,
  "change_30d_pct": 32.37,
  "sma20": 140.1245,
  "sma50": 136.6334,
  "sma200": 156.7069,
  "ema21": 145.2059,
  "rsi14": 78.63,
  "macd": 8.6983,
  "macd_signal": 4.0053,
  "macd_crossover": "positive",
  "bollinger_position": 1.064
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 48%
- **Summary**: Risk read: 30d vol 57.3%, max drawdown -33.9%, 30d return 32.4%.
- **Evidence**:
  - Max drawdown: -33.9%
  - 30d realized volatility: 57.3%
  - Sharpe-like score: 0.15
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5726,
  "realized_vol_90d": 0.4256,
  "max_drawdown_pct": -33.89,
  "atr14": null,
  "change_30d_pct": 32.37,
  "sharpe_like_90d": 0.15,
  "beta": 1.279,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 54%
- **Summary**: 20 headline(s): 4 positive, 0 negative, net score 4.
- **Evidence**:
  - Is It Too Late to Buy Qualcomm Stock?
  - Qualcomm CEO Cristiano Amon on expected China smartphone sales 'bottom' this current quarter
  - Is Qualcomm Ready for Primetime? What the Technicals Say.
  - Why Qualcomm Stock Is Soaring on Thursday
  - Qualcomm CEO Teases Deal with Large Hyperscaler

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 0,
  "net_score": 4,
  "sample_headlines": [
    "Is It Too Late to Buy Qualcomm Stock?",
    "Qualcomm CEO Cristiano Amon on expected China smartphone sales 'bottom' this current quarter",
    "Is Qualcomm Ready for Primetime? What the Technicals Say.",
    "Why Qualcomm Stock Is Soaring on Thursday",
    "Qualcomm CEO Teases Deal with Large Hyperscaler"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.24x, price change -3.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 3.3M vs avg 13.8M
  - Market cap: 185.5B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 173.895,
  "change_pct": -3.17,
  "volume": 3300398,
  "avg_volume": 13784030,
  "volume_ratio": 0.24,
  "market_cap": 185545965000,
  "beta": 1.279,
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
- **Confidence**: 55%
- **Summary**: Revenue growth 13.7%, net margin 12.5%, trailing FCF 24.2B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 13.7%
  - Net cash: -9.8B

```json
{
  "company_name": "QUALCOMM Incorporated",
  "sector": "Technology",
  "industry": "Semiconductors",
  "market_cap": 185545965000,
  "revenue_growth_pct": 13.66,
  "gross_margin_pct": 55.43,
  "net_margin_pct": 12.51,
  "trailing_fcf": 24208000000,
  "cash": 5435000000,
  "total_debt": 15270000000,
  "net_cash": -9835000000,
  "cfq_score": 4.15,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 5,
    "fcf_conversion": 5,
    "fcf_margin": 5,
    "capital_intensity": 4,
    "pricing_power": 3,
    "balance_sheet": 4,
    "share_count_quality": 4,
    "margin_stability": 2
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 174.01. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 174.0134, VAH: 174.7176, VAL: 172.9571
  - TPO POC: 174.0134
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 173.895,
  "poc": 174.0134,
  "vah": 174.7176,
  "val": 172.9571,
  "tpo_poc": 174.0134,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 27,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: QCOM is not in any configured pair watchlist.

```json
{
  "symbol": "QCOM",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for QCOM.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "QCOM",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "QCOM".

```json
{
  "query": "QCOM",
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
