---
title: "ETN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "ETN"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-23"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.18
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.94
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "etn"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 18%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 18% confidence. Agent entropy is diffuse (0.94). Drivers: price, fundamentals. Risks: risk, microstructure. 5 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: risk, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.94)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 51%, bearish 26%, neutral 24%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 2644ms | ETN closed at 412.2. 7d 4.7%, 30d 2.7%. RSI 52.6, MACD positive. |
| risk | BEARISH | 45% | 2221ms | Risk read: 30d vol 48.1%, max drawdown -19.6%, 30d return 2.7%. |
| sentiment | NEUTRAL | 22% | 586ms | 20 headline(s): 0 positive, 0 negative, net score 0. |
| microstructure | BEARISH | 31% | 657ms | Volume ratio 0.48x, price change -5.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 679ms | Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%. |
| fundamentals | BULLISH | 38% | 1729ms | Revenue growth 10.3%, net margin 14.9%, trailing FCF 8.0B. |
| auction | NEUTRAL | 22% | 8667ms | Auction state: balance. at POC 410.71. Session bars: 246. |
| pair | NEUTRAL | 5% | 10ms | ETN is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 2558ms | No recent earnings within 90 days for ETN. |
| prediction_market | NEUTRAL | 12% | 54ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: ETN closed at 412.2. 7d 4.7%, 30d 2.7%. RSI 52.6, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "ETN",
  "bars": 260,
  "close": 412.2,
  "change_7d_pct": 4.71,
  "change_30d_pct": 2.66,
  "sma20": 406.2505,
  "sma50": 405.9932,
  "sma200": 369.5937,
  "ema21": 406.8074,
  "rsi14": 52.56,
  "macd": 4.4081,
  "macd_signal": 1.9718,
  "macd_crossover": "positive",
  "bollinger_position": 0.617
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: Risk read: 30d vol 48.1%, max drawdown -19.6%, 30d return 2.7%.
- **Evidence**:
  - Max drawdown: -19.6%
  - 30d realized volatility: 48.1%
  - Sharpe-like score: 0.48
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4812,
  "realized_vol_90d": 0.4056,
  "max_drawdown_pct": -19.59,
  "atr14": null,
  "change_30d_pct": 2.66,
  "sharpe_like_90d": 0.48,
  "beta": 1.16,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 20 headline(s): 0 positive, 0 negative, net score 0.
- **Evidence**:
  - A Look at Eaton Corp PLC (ETN) After 3.3% Gain -- GF Value $386.36 vs Price $435.78
  - Eaton vs. Rockwell Automation: Which Industrial Tech Stock Leads?
  - Eaton (ETN) Outpaces Stock Market Gains: What You Should Know
  - Eaton Corporation, PLC (ETN) is Attracting Investor Attention: Here is What You Should Know
  - VWDRY vs. ETN: Which Stock Is the Better Value Option?

```json
{
  "headline_count": 20,
  "positive_count": 0,
  "negative_count": 0,
  "net_score": 0,
  "sample_headlines": [
    "A Look at Eaton Corp PLC (ETN) After 3.3% Gain -- GF Value $386.36 vs Price $435.78",
    "Eaton vs. Rockwell Automation: Which Industrial Tech Stock Leads?",
    "Eaton (ETN) Outpaces Stock Market Gains: What You Should Know",
    "Eaton Corporation, PLC (ETN) is Attracting Investor Attention: Here is What You Should Know",
    "VWDRY vs. ETN: Which Stock Is the Better Value Option?"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.48x, price change -5.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.2M vs avg 2.6M
  - Market cap: 159.8B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 411.5724,
  "change_pct": -5.55,
  "volume": 1235483,
  "avg_volume": 2550396,
  "volume_ratio": 0.48,
  "market_cap": 159813562920,
  "beta": 1.16,
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
- **Confidence**: 31%
- **Summary**: Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.3%
  - VIX: 17.28
  - HY spread: 2.6%

```json
{
  "DFF": {
    "date": "2026-06-19",
    "value": 3.63
  },
  "T10Y2Y": {
    "date": "2026-06-22",
    "value": 0.27
  },
  "VIXCLS": {
    "date": "2026-06-22",
    "value": 17.28
  },
  "BAMLH0A0HYM2": {
    "date": "2026-06-22",
    "value": 2.65
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
  "industry": "Electrical Equipment & Parts",
  "market_cap": 159813562920,
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
- **Summary**: Auction state: balance. at POC 410.71. Session bars: 246.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 410.7106, VAH: 413.195, VAL: 409.8825
  - TPO POC: 412.3668
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-24, bars: 20).

```json
{
  "auction_state": "balance",
  "current_price": 411.5724,
  "poc": 410.7106,
  "vah": 413.195,
  "val": 409.8825,
  "tpo_poc": 412.3668,
  "avwap": null,
  "avwap_anchor": "2026-05-24",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-06-23",
  "session_bar_count": 246,
  "daily_bar_count": 20
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
- **Auto-pulled**: 2026-06-23
