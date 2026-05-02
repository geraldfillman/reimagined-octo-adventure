---
title: "STRL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "STRL"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.37
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.74
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.65
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "strl"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 37%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 37% confidence. Agent entropy is mixed (0.74). Drivers: price, fundamentals. Risks: risk. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: mixed (0.74)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 70%, bearish 16%, neutral 14%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.65)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 3495ms | STRL closed at 532.67. 7d 9.2%, 30d 23.4%. RSI 67.2, MACD positive. |
| risk | BEARISH | 58% | 3740ms | Risk read: 30d vol 75.6%, max drawdown -31.0%, 30d return 23.4%. |
| sentiment | BULLISH | 38% | 3862ms | 20 headline(s): 3 positive, 1 negative, net score 2. |
| microstructure | BULLISH | 36% | 4506ms | Volume ratio 0.88x, price change 3.3%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 123ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 59% | 4709ms | Revenue growth 17.7%, net margin 11.7%, trailing FCF 777.4M. |
| auction | NEUTRAL | 22% | 4978ms | Auction state: balance. at POC 533.04. Session bars: 390. |
| pair | NEUTRAL | 5% | 0ms | STRL is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 5117ms | No recent earnings within 90 days for STRL. |
| prediction_market | NEUTRAL | 12% | 134ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: STRL closed at 532.67. 7d 9.2%, 30d 23.4%. RSI 67.2, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "STRL",
  "bars": 260,
  "close": 532.67,
  "change_7d_pct": 9.18,
  "change_30d_pct": 23.37,
  "sma20": 464.374,
  "sma50": 438.52,
  "sma200": 358.062,
  "ema21": 471.1881,
  "rsi14": 67.15,
  "macd": 22.8405,
  "macd_signal": 18.3301,
  "macd_crossover": "positive",
  "bollinger_position": 0.964
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 58%
- **Summary**: Risk read: 30d vol 75.6%, max drawdown -31.0%, 30d return 23.4%.
- **Evidence**:
  - Max drawdown: -31.0%
  - 30d realized volatility: 75.6%
  - Sharpe-like score: 2.82
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.7563,
  "realized_vol_90d": 0.6107,
  "max_drawdown_pct": -31.02,
  "atr14": null,
  "change_30d_pct": 23.37,
  "sharpe_like_90d": 2.82,
  "beta": 1.511,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 20 headline(s): 3 positive, 1 negative, net score 2.
- **Evidence**:
  - Sterling Infrastructure: Why The Growth Story Isn't Over (Earnings Preview)
  - Sterling Before Q1 Earnings: Buy, Sell or Hold the Stock?
  - Sterling vs. Quanta: Which Infrastructure Stock Wins Today?
  - Analysts Estimate KBR Inc. (KBR) to Report a Decline in Earnings: What to Look Out for
  - Sterling Infrastructure (STRL) Rises Higher Than Market: Key Facts

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 1,
  "net_score": 2,
  "sample_headlines": [
    "Sterling Infrastructure: Why The Growth Story Isn't Over (Earnings Preview)",
    "Sterling Before Q1 Earnings: Buy, Sell or Hold the Stock?",
    "Sterling vs. Quanta: Which Infrastructure Stock Wins Today?",
    "Analysts Estimate KBR Inc. (KBR) to Report a Decline in Earnings: What to Look Out for",
    "Sterling Infrastructure (STRL) Rises Higher Than Market: Key Facts"
  ]
}
```

## Microstructure Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Volume ratio 0.88x, price change 3.3%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 441.9K vs avg 501.0K
  - Market cap: 16.3B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.65) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 532.67,
  "change_pct": 3.31,
  "volume": 441930,
  "avg_volume": 500998,
  "volume_ratio": 0.88,
  "market_cap": 16342706580,
  "beta": 1.511,
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

- **Signal**: BULLISH
- **Confidence**: 59%
- **Summary**: Revenue growth 17.7%, net margin 11.7%, trailing FCF 777.4M.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 17.7%
  - Net cash: 40.8M

```json
{
  "company_name": "Sterling Infrastructure, Inc.",
  "sector": "Industrials",
  "industry": "Engineering & Construction",
  "market_cap": 16342706580,
  "revenue_growth_pct": 17.69,
  "gross_margin_pct": 22.09,
  "net_margin_pct": 11.65,
  "trailing_fcf": 777417000,
  "cash": 390721000,
  "total_debt": 349914000,
  "net_cash": 40807000,
  "cfq_score": 3.91,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 5,
    "fcf_margin": 3,
    "capital_intensity": 4,
    "pricing_power": 3.5,
    "balance_sheet": 5,
    "share_count_quality": 3,
    "margin_stability": 2.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 533.04. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 533.045, VAH: 536.1875, VAL: 519.4275
  - TPO POC: 530.95
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 532.67,
  "poc": 533.045,
  "vah": 536.1875,
  "val": 519.4275,
  "tpo_poc": 530.95,
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
- **Summary**: STRL is not in any configured pair watchlist.

```json
{
  "symbol": "STRL",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for STRL.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "STRL",
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
