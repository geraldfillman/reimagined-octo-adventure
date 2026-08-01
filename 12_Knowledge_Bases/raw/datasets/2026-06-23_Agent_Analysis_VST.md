---
title: "VST Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "VST"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-06-23"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BEARISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.19
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.99
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.7
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "vst"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 19%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 19% confidence. Agent entropy is diffuse (0.99). Drivers: price, sentiment. Risks: risk, fundamentals. 5 neutral layer(s).
- **Top drivers**: price, sentiment, macro
- **Top risks**: risk, fundamentals

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.99)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 42%, bearish 31%, neutral 28%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.7)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 41% | 33ms | VST closed at 163.44. 7d 11.7%, 30d 10.6%. RSI 58.8, MACD positive. |
| risk | BEARISH | 48% | 47ms | Risk read: 30d vol 49.5%, max drawdown -38.2%, 30d return 10.6%. |
| sentiment | BULLISH | 38% | 110ms | 20 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | NEUTRAL | 24% | 381ms | Volume ratio 0.41x, price change -2.0%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 316ms | Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%. |
| fundamentals | BEARISH | 33% | 468ms | Revenue growth -12.4%, net margin 5.6%, trailing FCF 3.6B. |
| auction | NEUTRAL | 22% | 1046ms | Auction state: balance. inside value 162.35–164.96. Session bars: 246. |
| pair | NEUTRAL | 5% | 1ms | VST is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 2092ms | No recent earnings within 90 days for VST. |
| prediction_market | NEUTRAL | 12% | 35ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 41%
- **Summary**: VST closed at 163.44. 7d 11.7%, 30d 10.6%. RSI 58.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: positive

```json
{
  "api_symbol": "VST",
  "bars": 260,
  "close": 163.44,
  "change_7d_pct": 11.65,
  "change_30d_pct": 10.64,
  "sma20": 155.284,
  "sma50": 154.62,
  "sma200": 170.0403,
  "ema21": 155.1817,
  "rsi14": 58.8,
  "macd": 2.4148,
  "macd_signal": 0.4919,
  "macd_crossover": "positive",
  "bollinger_position": 0.777
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 48%
- **Summary**: Risk read: 30d vol 49.5%, max drawdown -38.2%, 30d return 10.6%.
- **Evidence**:
  - Max drawdown: -38.2%
  - 30d realized volatility: 49.5%
  - Sharpe-like score: 0.36
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.4954,
  "realized_vol_90d": 0.4809,
  "max_drawdown_pct": -38.18,
  "atr14": null,
  "change_30d_pct": 10.64,
  "sharpe_like_90d": 0.36,
  "beta": 1.405,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 20 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - Vistra, Generac, Rockwell Automation And A Basic Material Stock: CNBC's ‘Final Trades'
  - Vistra Corp. (VST) Advances While Market Declines: Some Information for Investors
  - The Nuclear Power Comeback Is Real -- and These 3 Stocks Are the Best Way to Play It
  - Better AI Energy Stock: Constellation Energy or Vistra?
  - Nuclear stocks to own as AI demand drives power boom

```json
{
  "headline_count": 20,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "Vistra, Generac, Rockwell Automation And A Basic Material Stock: CNBC's ‘Final Trades'",
    "Vistra Corp. (VST) Advances While Market Declines: Some Information for Investors",
    "The Nuclear Power Comeback Is Real -- and These 3 Stocks Are the Best Way to Play It",
    "Better AI Energy Stock: Constellation Energy or Vistra?",
    "Nuclear stocks to own as AI demand drives power boom"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.41x, price change -2.0%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.9M vs avg 4.7M
  - Market cap: 55.3B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.7) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 163.99,
  "change_pct": -1.96,
  "volume": 1904528,
  "avg_volume": 4662517,
  "volume_ratio": 0.41,
  "market_cap": 55294552927,
  "beta": 1.405,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.7,
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

- **Signal**: BEARISH
- **Confidence**: 33%
- **Summary**: Revenue growth -12.4%, net margin 5.6%, trailing FCF 3.6B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: -12.4%
  - Net cash: -19.2B

```json
{
  "company_name": "Vistra Corp.",
  "sector": "Utilities",
  "industry": "Independent Power Producers",
  "market_cap": 55294552927,
  "revenue_growth_pct": -12.41,
  "gross_margin_pct": 17.52,
  "net_margin_pct": 5.56,
  "trailing_fcf": 3594000000,
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
- **Summary**: Auction state: balance. inside value 162.35–164.96. Session bars: 246.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 163.3308, VAH: 164.9585, VAL: 162.3542
  - TPO POC: 164.6329
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-24, bars: 20).

```json
{
  "auction_state": "balance",
  "current_price": 163.99,
  "poc": 163.3308,
  "vah": 164.9585,
  "val": 162.3542,
  "tpo_poc": 164.6329,
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
- **Auto-pulled**: 2026-06-23
