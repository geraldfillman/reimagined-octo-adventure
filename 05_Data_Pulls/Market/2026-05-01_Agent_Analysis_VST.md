---
title: "VST Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "VST"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BEARISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.37
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.88
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.68
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "vst"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 37%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 37% confidence. Agent entropy is diffuse (0.88). Drivers: macro. Risks: risk, price. 6 neutral layer(s).
- **Top drivers**: macro
- **Top risks**: risk, price, fundamentals

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.88)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 12%, bearish 53%, neutral 35%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.68)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 68% | 1081ms | VST closed at 155.28. 7d -0.3%, 30d -7.2%. RSI 46.6, MACD negative. |
| risk | BEARISH | 54% | 1344ms | Risk read: 30d vol 52.9%, max drawdown -34.6%, 30d return -7.2%. |
| sentiment | NEUTRAL | 30% | 1697ms | 20 headline(s): 1 positive, 0 negative, net score 1. |
| microstructure | NEUTRAL | 24% | 2028ms | Volume ratio 0.63x, price change -1.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 1067ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BEARISH | 33% | 2282ms | Revenue growth -12.4%, net margin 5.6%, trailing FCF 3.0B. |
| auction | NEUTRAL | 22% | 2610ms | Auction state: balance. at POC 155.56. Session bars: 390. |
| pair | NEUTRAL | 5% | 0ms | VST is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 2710ms | No recent earnings within 90 days for VST. |
| prediction_market | NEUTRAL | 12% | 123ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 68%
- **Summary**: VST closed at 155.28. 7d -0.3%, 30d -7.2%. RSI 46.6, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "VST",
  "bars": 260,
  "close": 155.28,
  "change_7d_pct": -0.33,
  "change_30d_pct": -7.22,
  "sma20": 158.4425,
  "sma50": 160.0938,
  "sma200": 177.8895,
  "ema21": 158.4308,
  "rsi14": 46.62,
  "macd": -0.0183,
  "macd_signal": 0.2446,
  "macd_crossover": "negative",
  "bollinger_position": 0.326
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 54%
- **Summary**: Risk read: 30d vol 52.9%, max drawdown -34.6%, 30d return -7.2%.
- **Evidence**:
  - Max drawdown: -34.6%
  - 30d realized volatility: 52.9%
  - Sharpe-like score: 0.01
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5288,
  "realized_vol_90d": 0.5264,
  "max_drawdown_pct": -34.6,
  "atr14": null,
  "change_30d_pct": -7.22,
  "sharpe_like_90d": 0.01,
  "beta": 1.498,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 1 positive, 0 negative, net score 1.
- **Evidence**:
  - Vistra Declares Dividend on Common Stock, Series B Preferred Stock, and Series C Preferred Stock
  - Vistra or Southern Co.: Which Utility Stock Looks Stronger in 2026?
  - Vistra Corp. (VST) Earnings Expected to Grow: What to Know Ahead of Next Week's Release
  - Comerica Bank Lowers Stock Holdings in Vistra Corp. $VST
  - Vistra Corp. (VST) is Attracting Investor Attention: Here is What You Should Know

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 1,
  "sample_headlines": [
    "Vistra Declares Dividend on Common Stock, Series B Preferred Stock, and Series C Preferred Stock",
    "Vistra or Southern Co.: Which Utility Stock Looks Stronger in 2026?",
    "Vistra Corp. (VST) Earnings Expected to Grow: What to Know Ahead of Next Week's Release",
    "Comerica Bank Lowers Stock Holdings in Vistra Corp. $VST",
    "Vistra Corp. (VST) is Attracting Investor Attention: Here is What You Should Know"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.63x, price change -1.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 3.0M vs avg 4.7M
  - Market cap: 52.6B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.68) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 155.28,
  "change_pct": -1.62,
  "volume": 2975313,
  "avg_volume": 4690852,
  "volume_ratio": 0.63,
  "market_cap": 52569934062,
  "beta": 1.498,
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

- **Signal**: BEARISH
- **Confidence**: 33%
- **Summary**: Revenue growth -12.4%, net margin 5.6%, trailing FCF 3.0B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: -12.4%
  - Net cash: -19.6B

```json
{
  "company_name": "Vistra Corp.",
  "sector": "Utilities",
  "industry": "Independent Power Producers",
  "market_cap": 52569934062,
  "revenue_growth_pct": -12.41,
  "gross_margin_pct": 17.52,
  "net_margin_pct": 5.56,
  "trailing_fcf": 2994000000,
  "cash": 816000000,
  "total_debt": 20395000000,
  "net_cash": -19579000000,
  "cfq_score": 2.42,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 3,
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
- **Summary**: Auction state: balance. at POC 155.56. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 155.5601, VAH: 159.656, VAL: 155.2451
  - TPO POC: 155.5601
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 155.28,
  "poc": 155.5601,
  "vah": 159.656,
  "val": 155.2451,
  "tpo_poc": 155.5601,
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
- **Auto-pulled**: 2026-05-01
