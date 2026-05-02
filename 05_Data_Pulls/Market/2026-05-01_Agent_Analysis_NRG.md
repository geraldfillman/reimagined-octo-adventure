---
title: "NRG Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "NRG"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.22
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.99
entropy_dominant_signal: "bearish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.65
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "nrg"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 22%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 22% confidence. Agent entropy is diffuse (0.99). Drivers: macro, sentiment. Risks: risk, price. 6 neutral layer(s).
- **Top drivers**: macro, sentiment
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.99)
- **Dominant signal bucket**: bearish
- **Distribution**: bullish 27%, bearish 38%, neutral 36%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.65)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 60% | 1758ms | NRG closed at 153.37. 7d 2.5%, 30d -5.0%. RSI 46.6, MACD negative. |
| risk | BEARISH | 45% | 2019ms | Risk read: 30d vol 53.8%, max drawdown -23.3%, 30d return -5.0%. |
| sentiment | BULLISH | 38% | 2158ms | 20 headline(s): 1 positive, 0 negative, net score 2. |
| microstructure | NEUTRAL | 24% | 2648ms | Volume ratio 0.63x, price change -1.4%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 670ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | NEUTRAL | 26% | 2967ms | Revenue growth 9.2%, net margin 2.8%, trailing FCF 2.6B. |
| auction | NEUTRAL | 22% | 3266ms | Auction state: balance. at POC 153.7. Session bars: 390. |
| pair | NEUTRAL | 5% | 0ms | NRG is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 3394ms | No recent earnings within 90 days for NRG. |
| prediction_market | NEUTRAL | 12% | 130ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 60%
- **Summary**: NRG closed at 153.37. 7d 2.5%, 30d -5.0%. RSI 46.6, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "NRG",
  "bars": 260,
  "close": 153.37,
  "change_7d_pct": 2.52,
  "change_30d_pct": -4.98,
  "sma20": 158.9395,
  "sma50": 159.0772,
  "sma200": 159.823,
  "ema21": 156.6704,
  "rsi14": 46.56,
  "macd": -0.9027,
  "macd_signal": -0.0826,
  "macd_crossover": "negative",
  "bollinger_position": 0.307
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: Risk read: 30d vol 53.8%, max drawdown -23.3%, 30d return -5.0%.
- **Evidence**:
  - Max drawdown: -23.3%
  - 30d realized volatility: 53.8%
  - Sharpe-like score: 0.13
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5376,
  "realized_vol_90d": 0.4768,
  "max_drawdown_pct": -23.26,
  "atr14": null,
  "change_30d_pct": -4.98,
  "sharpe_like_90d": 0.13,
  "beta": 1.338,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 20 headline(s): 1 positive, 0 negative, net score 2.
- **Evidence**:
  - Which Is the Better Small-Cap ETF, Vanguard's VB or iShares' ISCB?
  - Why NRG Energy (NRG) Dipped More Than Broader Market Today
  - Vanguard vs. Schwab: Which Small-Cap ETF Belongs in Your Portfolio?
  - Analysts Estimate NRG Energy (NRG) to Report a Decline in Earnings: What to Look Out for
  - Which Is the Better Small-Cap ETF, Vanguard's VB or State Street's SPSM?

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "Which Is the Better Small-Cap ETF, Vanguard's VB or iShares' ISCB?",
    "Why NRG Energy (NRG) Dipped More Than Broader Market Today",
    "Vanguard vs. Schwab: Which Small-Cap ETF Belongs in Your Portfolio?",
    "Analysts Estimate NRG Energy (NRG) to Report a Decline in Earnings: What to Look Out for",
    "Which Is the Better Small-Cap ETF, Vanguard's VB or State Street's SPSM?"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.63x, price change -1.4%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.7M vs avg 2.8M
  - Market cap: 32.9B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.65) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 153.37,
  "change_pct": -1.42,
  "volume": 1744702,
  "avg_volume": 2776214,
  "volume_ratio": 0.63,
  "market_cap": 32906607090,
  "beta": 1.338,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.65,
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

- **Signal**: NEUTRAL
- **Confidence**: 26%
- **Summary**: Revenue growth 9.2%, net margin 2.8%, trailing FCF 2.6B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 9.2%
  - Net cash: -12.0B

```json
{
  "company_name": "NRG Energy, Inc.",
  "sector": "Utilities",
  "industry": "Independent Power Producers",
  "market_cap": 32906607090,
  "revenue_growth_pct": 9.17,
  "gross_margin_pct": 21.85,
  "net_margin_pct": 2.81,
  "trailing_fcf": 2600000000,
  "cash": 4738000000,
  "total_debt": 16766000000,
  "net_cash": -12028000000,
  "cfq_score": 2.43,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 3.25,
    "fcf_conversion": 3,
    "fcf_margin": 1,
    "capital_intensity": 4,
    "pricing_power": 0.5,
    "balance_sheet": 2,
    "share_count_quality": 5,
    "margin_stability": 1
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 153.7. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 153.6958, VAH: 155.8598, VAL: 152.7683
  - TPO POC: 155.8598
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 153.37,
  "poc": 153.6958,
  "vah": 155.8598,
  "val": 152.7683,
  "tpo_poc": 155.8598,
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
- **Auto-pulled**: 2026-05-01
