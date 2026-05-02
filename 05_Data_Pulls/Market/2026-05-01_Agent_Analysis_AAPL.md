---
title: "AAPL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AAPL"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.65
synthesis_mode: "deterministic"
entropy_level: "ordered"
entropy_score: 0.35
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.64
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "aapl"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 65%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 65% confidence. Agent entropy is ordered (0.35). Drivers: price, fundamentals. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, risk
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: ordered (0.35)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 87%, bearish 0%, neutral 13%
- **Interpretation**: Below-average agent entropy: the stack has a clear lean with some counter-evidence.
- **Microstructure entropy**: mixed (0.64)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 432ms | AAPL closed at 280.25. 7d 2.6%, 30d 12.6%. RSI 66.5, MACD positive. |
| risk | BULLISH | 42% | 216ms | Risk read: 30d vol 23.6%, max drawdown -13.8%, 30d return 12.6%. |
| sentiment | BULLISH | 70% | 294ms | 12 headline(s): 5 positive, 0 negative, net score 6. |
| microstructure | BULLISH | 50% | 405ms | Volume ratio 1.69x, price change 3.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 326ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 54% | 194ms | Revenue growth 6.4%, net margin 26.9%, trailing FCF 227.7B. |
| auction | NEUTRAL | 22% | 334ms | Auction state: balance. inside value 280.07–285.16. Session bars: 390. |
| pair | NEUTRAL | 5% | 12ms | AAPL is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 154ms | No recent earnings within 90 days for AAPL. |
| prediction_market | NEUTRAL | 12% | 173ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: AAPL closed at 280.25. 7d 2.6%, 30d 12.6%. RSI 66.5, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "AAPL",
  "bars": 260,
  "close": 280.25,
  "change_7d_pct": 2.59,
  "change_30d_pct": 12.57,
  "sma20": 266.367,
  "sma50": 261.2218,
  "sma200": 255.1841,
  "ema21": 267.1233,
  "rsi14": 66.54,
  "macd": 4.3695,
  "macd_signal": 3.4539,
  "macd_crossover": "positive",
  "bollinger_position": 1.019
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 42%
- **Summary**: Risk read: 30d vol 23.6%, max drawdown -13.8%, 30d return 12.6%.
- **Evidence**:
  - Max drawdown: -13.8%
  - 30d realized volatility: 23.6%
  - Sharpe-like score: 0.4
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2357,
  "realized_vol_90d": 0.2414,
  "max_drawdown_pct": -13.82,
  "atr14": null,
  "change_30d_pct": 12.57,
  "sharpe_like_90d": 0.4,
  "beta": 1.0646569,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 70%
- **Summary**: 12 headline(s): 5 positive, 0 negative, net score 6.
- **Evidence**:
  - Dow slips 152 pts as S&P 500 hits record high, Apple lifts Nasdaq
  - Apple Warns the Memory Shortage Is Getting Worse. Experts Say It Could Drive Up Prices
  - Apple just gave a subtle clue that a splashy AI acquisition may be in the cards
  - Apple Forecasts Sales Growth Amid Memory Shortage | Bloomberg Tech 5/1/2026
  - 360 Roundtable: AAPL Earnings Reaction & Possible Stagnation Risk

```json
{
  "headline_count": 12,
  "positive_count": 5,
  "negative_count": 0,
  "net_score": 6,
  "sample_headlines": [
    "Dow slips 152 pts as S&P 500 hits record high, Apple lifts Nasdaq",
    "Apple Warns the Memory Shortage Is Getting Worse. Experts Say It Could Drive Up Prices",
    "Apple just gave a subtle clue that a splashy AI acquisition may be in the cards",
    "Apple Forecasts Sales Growth Amid Memory Shortage | Bloomberg Tech 5/1/2026",
    "360 Roundtable: AAPL Earnings Reaction & Possible Stagnation Risk"
  ]
}
```

## Microstructure Agent

- **Signal**: BULLISH
- **Confidence**: 50%
- **Summary**: Volume ratio 1.69x, price change 3.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 76.0M vs avg 45.1M
  - Market cap: 4.1T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.64) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 280.14,
  "change_pct": 3.24,
  "volume": 76013740,
  "avg_volume": 45077117,
  "volume_ratio": 1.69,
  "market_cap": 4112774559600,
  "beta": 1.0646569,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.64,
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
- **Confidence**: 54%
- **Summary**: Revenue growth 6.4%, net margin 26.9%, trailing FCF 227.7B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 6.4%
  - Net cash: 43.6B

```json
{
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "market_cap": 4112774559600,
  "revenue_growth_pct": 6.43,
  "gross_margin_pct": 46.91,
  "net_margin_pct": 26.92,
  "trailing_fcf": 227660000000,
  "cash": 45572000000,
  "total_debt": 1997000000,
  "net_cash": 43575000000,
  "cfq_score": 4.17,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 4,
    "fcf_margin": 5,
    "capital_intensity": 4,
    "pricing_power": 2.5,
    "balance_sheet": 5,
    "share_count_quality": 5,
    "margin_stability": 4.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 280.07–285.16. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 283.4602, VAH: 285.157, VAL: 280.0667
  - TPO POC: 283.4602
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 280.14,
  "poc": 283.4602,
  "vah": 285.157,
  "val": 280.0667,
  "tpo_poc": 283.4602,
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
- **Summary**: AAPL is not in any configured pair watchlist.

```json
{
  "symbol": "AAPL",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for AAPL.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "AAPL",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Buffett Style Quality Compounders".

```json
{
  "query": "Buffett Style Quality Compounders",
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
