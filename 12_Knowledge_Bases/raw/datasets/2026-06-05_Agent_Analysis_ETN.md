---
title: "ETN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "ETN"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-05"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.14
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.98
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.69
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "etn"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 14%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 14% confidence. Agent entropy is diffuse (0.98). Drivers: price, fundamentals. Risks: risk, microstructure. 5 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: risk, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.98)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 44%, bearish 28%, neutral 28%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.69)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 38% | 21508ms | ETN closed at 393.94. 7d -3.1%, 30d -7.2%. RSI 46.3, MACD positive. |
| risk | BEARISH | 39% | 31674ms | Risk read: 30d vol 43.4%, max drawdown -19.6%, 30d return -7.2%. |
| sentiment | NEUTRAL | 22% | 41843ms | 20 headline(s): 1 positive, 1 negative, net score 0. |
| microstructure | BEARISH | 31% | 42042ms | Volume ratio 0.58x, price change -5.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 318ms | Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%. |
| fundamentals | BULLISH | 38% | 20987ms | Revenue growth 10.3%, net margin 14.9%, trailing FCF 8.0B. |
| auction | NEUTRAL | 22% | 31560ms | Auction state: balance. below VAL 395.06. Session bars: 328. |
| pair | NEUTRAL | 5% | 10ms | ETN is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 21287ms | No recent earnings within 90 days for ETN. |
| prediction_market | NEUTRAL | 12% | 23ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: ETN closed at 393.94. 7d -3.1%, 30d -7.2%. RSI 46.3, MACD positive.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "ETN",
  "bars": 260,
  "close": 393.94,
  "change_7d_pct": -3.06,
  "change_30d_pct": -7.2,
  "sma20": 400.316,
  "sma50": 398.0446,
  "sma200": 366.4253,
  "ema21": 403.1646,
  "rsi14": 46.27,
  "macd": 2.3059,
  "macd_signal": 1.3169,
  "macd_crossover": "positive",
  "bollinger_position": 0.382
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 39%
- **Summary**: Risk read: 30d vol 43.4%, max drawdown -19.6%, 30d return -7.2%.
- **Evidence**:
  - Max drawdown: -19.6%
  - 30d realized volatility: 43.4%
  - Sharpe-like score: 1.24
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4338,
  "realized_vol_90d": 0.3858,
  "max_drawdown_pct": -19.59,
  "atr14": null,
  "change_30d_pct": -7.2,
  "sharpe_like_90d": 1.24,
  "beta": 1.24,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 20 headline(s): 1 positive, 1 negative, net score 0.
- **Evidence**:
  - Data Center Power Demands Push This Dividend Aristocrat to All Time Highs
  - Eaton Rallies 32% YTD: Should Investors Bet on the Stock Now?
  - Why Is Eaton (ETN) Down 0% Since Last Earnings Report?
  - The Boring Sector Quietly Powering the Entire AI Revolution
  - Watch These 5 Non-Tech Stocks Thriving in 2026 on AI Data Center Boom

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 1,
  "net_score": 0,
  "sample_headlines": [
    "Data Center Power Demands Push This Dividend Aristocrat to All Time Highs",
    "Eaton Rallies 32% YTD: Should Investors Bet on the Stock Now?",
    "Why Is Eaton (ETN) Down 0% Since Last Earnings Report?",
    "The Boring Sector Quietly Powering the Entire AI Revolution",
    "Watch These 5 Non-Tech Stocks Thriving in 2026 on AI Data Center Boom"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.58x, price change -5.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.5M vs avg 2.7M
  - Market cap: 153.4B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.69) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 394.96,
  "change_pct": -5.65,
  "volume": 1539179,
  "avg_volume": 2657484,
  "volume_ratio": 0.58,
  "market_cap": 153362968000,
  "beta": 1.24,
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

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: Revenue growth 10.3%, net margin 14.9%, trailing FCF 8.0B.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 10.3%
  - Net cash: -21.3B

```json
{
  "company_name": "Eaton Corporation plc",
  "sector": "Industrials",
  "industry": "Industrial - Machinery",
  "market_cap": 153463926000,
  "revenue_growth_pct": 10.33,
  "gross_margin_pct": 37.59,
  "net_margin_pct": 14.9,
  "trailing_fcf": 8013000000,
  "cash": 565000000,
  "total_debt": 21833000000,
  "net_cash": -21268000000,
  "cfq_score": 3.93,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 4,
    "fcf_margin": 4,
    "capital_intensity": 5,
    "pricing_power": 4.5,
    "balance_sheet": 2,
    "share_count_quality": 4,
    "margin_stability": 4
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. below VAL 395.06. Session bars: 328.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 399.078, VAH: 406.314, VAL: 395.058
  - TPO POC: 399.078
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-06, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 394.68,
  "poc": 399.078,
  "vah": 406.314,
  "val": 395.058,
  "tpo_poc": 399.078,
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
- **Summary**: ETN is not in any configured pair watchlist.

```json
{
  "symbol": "ETN",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for ETN.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "ETN",
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
