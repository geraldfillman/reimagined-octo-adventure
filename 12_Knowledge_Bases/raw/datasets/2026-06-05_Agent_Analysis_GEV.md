---
title: "GEV Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GEV"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-05"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.23
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 1
entropy_dominant_signal: "neutral"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "gev"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 23%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 23% confidence. Agent entropy is diffuse (1). Drivers: fundamentals, macro. Risks: risk, price. 6 neutral layer(s).
- **Top drivers**: fundamentals, macro
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (1)
- **Dominant signal bucket**: neutral
- **Distribution**: bullish 30%, bearish 32%, neutral 38%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 267ms | GEV closed at 924.75. 7d -10.4%, 30d -19.6%. RSI 36.1, MACD negative. |
| risk | BEARISH | 50% | 257ms | Risk read: 30d vol 39.1%, max drawdown -19.6%, 30d return -19.6%. |
| sentiment | NEUTRAL | 30% | 429ms | 20 headline(s): 2 positive, 1 negative, net score 1. |
| microstructure | NEUTRAL | 27% | 477ms | Volume ratio 0.75x, price change -3.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 381ms | Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%. |
| fundamentals | BULLISH | 48% | 223ms | Revenue growth 8.9%, net margin 12.8%, trailing FCF 10.9B. |
| auction | NEUTRAL | 22% | 427ms | Auction state: balance. below VAL 940.24. Session bars: 328. |
| pair | NEUTRAL | 5% | 14ms | GEV is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 216ms | No recent earnings within 90 days for GEV. |
| prediction_market | NEUTRAL | 12% | 27ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: GEV closed at 924.75. 7d -10.4%, 30d -19.6%. RSI 36.1, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "GEV",
  "bars": 260,
  "close": 924.75,
  "change_7d_pct": -10.38,
  "change_30d_pct": -19.55,
  "sma20": 1017.65,
  "sma50": 1007.444,
  "sma200": 756.6205,
  "ema21": 1002.7822,
  "rsi14": 36.14,
  "macd": -20.9803,
  "macd_signal": -7.1623,
  "macd_crossover": "negative",
  "bollinger_position": 0.004
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 50%
- **Summary**: Risk read: 30d vol 39.1%, max drawdown -19.6%, 30d return -19.6%.
- **Evidence**:
  - Max drawdown: -19.6%
  - 30d realized volatility: 39.1%
  - Sharpe-like score: 1.93
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3914,
  "realized_vol_90d": 0.4788,
  "max_drawdown_pct": -19.55,
  "atr14": null,
  "change_30d_pct": -19.55,
  "sharpe_like_90d": 1.93,
  "beta": 1.045,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 30%
- **Summary**: 20 headline(s): 2 positive, 1 negative, net score 1.
- **Evidence**:
  - GE Vernova Stock Surges 47.2% YTD: Should Investors Jump in Now?
  - GE Vernova Lands 100 MW India Wind Deal
  - GE Vernova (GEV) Dips More Than Broader Market: What You Should Know
  - High Oil Prices Are Doing What Policy Never Could: It Is Making For Winning Comeback Stories
  - Watch 3 AI-Powered Nuclear Energy OEMs Amid Double-Digit Price Upside

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 1,
  "net_score": 1,
  "sample_headlines": [
    "GE Vernova Stock Surges 47.2% YTD: Should Investors Jump in Now?",
    "GE Vernova Lands 100 MW India Wind Deal",
    "GE Vernova (GEV) Dips More Than Broader Market: What You Should Know",
    "High Oil Prices Are Doing What Policy Never Could: It Is Making For Winning Comeback Stories",
    "Watch 3 AI-Powered Nuclear Energy OEMs Amid Double-Digit Price Upside"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 27%
- **Summary**: Volume ratio 0.75x, price change -3.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.9M vs avg 2.5M
  - Market cap: 249.4B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 928.085,
  "change_pct": -3.66,
  "volume": 1896677,
  "avg_volume": 2520498,
  "volume_ratio": 0.75,
  "market_cap": 249395001200,
  "beta": 1.045,
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
- **Confidence**: 48%
- **Summary**: Revenue growth 8.9%, net margin 12.8%, trailing FCF 10.9B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 8.9%
  - Net cash: 7.3B

```json
{
  "company_name": "GE Vernova Inc.",
  "sector": "Utilities",
  "industry": "Renewable Utilities",
  "market_cap": 249395001200,
  "revenue_growth_pct": 8.94,
  "gross_margin_pct": 19.79,
  "net_margin_pct": 12.83,
  "trailing_fcf": 10863000000,
  "cash": 10172000000,
  "total_debt": 2857000000,
  "net_cash": 7315000000,
  "cfq_score": 3.88,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 3.25,
    "fcf_conversion": 5,
    "fcf_margin": 4,
    "capital_intensity": 4,
    "pricing_power": 3.5,
    "balance_sheet": 5,
    "share_count_quality": 4,
    "margin_stability": 1.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. below VAL 940.24. Session bars: 328.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 945.8601, VAH: 951.4839, VAL: 940.2362
  - TPO POC: 947.7347
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-06, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 928.085,
  "poc": 945.8601,
  "vah": 951.4839,
  "val": 940.2362,
  "tpo_poc": 947.7347,
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
- **Summary**: GEV is not in any configured pair watchlist.

```json
{
  "symbol": "GEV",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for GEV.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "GEV",
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
