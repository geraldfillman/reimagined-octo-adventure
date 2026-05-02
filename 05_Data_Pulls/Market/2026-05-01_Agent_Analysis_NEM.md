---
title: "NEM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "NEM"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.19
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.96
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.61
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "nem"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 19%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 19% confidence. Agent entropy is diffuse (0.96). Drivers: fundamentals, macro. Risks: risk, microstructure. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.96)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 48%, bearish 24%, neutral 28%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.61)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 33% | 1172ms | NEM closed at 108.62. 7d -2.9%, 30d 9.5%. RSI 45.6, MACD negative. |
| risk | BEARISH | 39% | 1425ms | Risk read: 30d vol 52.2%, max drawdown -27.4%, 30d return 9.5%. |
| sentiment | BULLISH | 38% | 1569ms | 12 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | BEARISH | 31% | 2434ms | Volume ratio 0.49x, price change -2.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 106ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 65% | 4001ms | Revenue growth 19.1%, net margin 32.1%, trailing FCF 16.5B. |
| auction | NEUTRAL | 22% | 2742ms | Auction state: balance. inside value 108.52–111.39. Session bars: 390. |
| pair | NEUTRAL | 5% | 0ms | NEM is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 2715ms | No recent earnings within 90 days for NEM. |
| prediction_market | NEUTRAL | 12% | 144ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 33%
- **Summary**: NEM closed at 108.62. 7d -2.9%, 30d 9.5%. RSI 45.6, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "NEM",
  "bars": 260,
  "close": 108.62,
  "change_7d_pct": -2.89,
  "change_30d_pct": 9.5,
  "sma20": 114.267,
  "sma50": 113.5068,
  "sma200": 95.6954,
  "ema21": 112.3908,
  "rsi14": 45.55,
  "macd": -0.4984,
  "macd_signal": 0.178,
  "macd_crossover": "negative",
  "bollinger_position": 0.143
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 39%
- **Summary**: Risk read: 30d vol 52.2%, max drawdown -27.4%, 30d return 9.5%.
- **Evidence**:
  - Max drawdown: -27.4%
  - 30d realized volatility: 52.2%
  - Sharpe-like score: 0.64
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5222,
  "realized_vol_90d": 0.537,
  "max_drawdown_pct": -27.4,
  "atr14": null,
  "change_30d_pct": 9.5,
  "sharpe_like_90d": 0.64,
  "beta": 0.475,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 12 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - Global X Silver ETF Outperforms Sprott Gold ETF in 1 Year Return
  - SIL vs. GDX: Silver Miners Outpaced Gold Miners in 2025. Will It Last?
  - Newmont Corp (NEM) Stock Down 3.8% but Still Overvalued -- GF Score: 83/100
  - Here's Why Newmont Corporation (NEM) is a Strong Momentum Stock
  - Gold's Worst Pullback in Months Is Here. Here's Why Safe-Haven Assets Are Sliding

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "Global X Silver ETF Outperforms Sprott Gold ETF in 1 Year Return",
    "SIL vs. GDX: Silver Miners Outpaced Gold Miners in 2025. Will It Last?",
    "Newmont Corp (NEM) Stock Down 3.8% but Still Overvalued -- GF Score: 83/100",
    "Here's Why Newmont Corporation (NEM) is a Strong Momentum Stock",
    "Gold's Worst Pullback in Months Is Here. Here's Why Safe-Haven Assets Are Sliding"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.49x, price change -2.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 5.0M vs avg 10.0M
  - Market cap: 116.0B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.61) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 108.62,
  "change_pct": -2.22,
  "volume": 4950873,
  "avg_volume": 10045508,
  "volume_ratio": 0.49,
  "market_cap": 115957581226,
  "beta": 0.475,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.61,
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
- **Confidence**: 65%
- **Summary**: Revenue growth 19.1%, net margin 32.1%, trailing FCF 16.5B.
- **Evidence**:
  - Sector: Basic Materials
  - Revenue growth: 19.1%
  - Net cash: 3.2B

```json
{
  "company_name": "Newmont Corporation",
  "sector": "Basic Materials",
  "industry": "Gold",
  "market_cap": 115957581226,
  "revenue_growth_pct": 19.08,
  "gross_margin_pct": 49.78,
  "net_margin_pct": 32.06,
  "trailing_fcf": 16513000000,
  "cash": 8778000000,
  "total_debt": 5532000000,
  "net_cash": 3246000000,
  "cfq_score": 4.11,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 5,
    "fcf_margin": 5,
    "capital_intensity": 5,
    "pricing_power": 3,
    "balance_sheet": 5,
    "share_count_quality": 1,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 108.52–111.39. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 110.0646, VAH: 111.3886, VAL: 108.52
  - TPO POC: 110.0646
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 108.62,
  "poc": 110.0646,
  "vah": 111.3886,
  "val": 108.52,
  "tpo_poc": 110.0646,
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
- **Summary**: NEM is not in any configured pair watchlist.

```json
{
  "symbol": "NEM",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for NEM.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "NEM",
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
