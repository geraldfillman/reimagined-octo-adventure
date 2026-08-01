---
title: "STRL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "STRL"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-06-23"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.19
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.86
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "strl"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 19%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 19% confidence. Agent entropy is diffuse (0.86). Drivers: price, fundamentals. Risks: risk, microstructure. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, sentiment
- **Top risks**: risk, microstructure

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.86)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 58%, bearish 29%, neutral 14%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 68% | 31ms | STRL closed at 900.9. 7d 7.4%, 30d 6.6%. RSI 57.7, MACD negative. |
| risk | BEARISH | 70% | 111ms | Risk read: 30d vol 82.8%, max drawdown -31.0%, 30d return 6.6%. |
| sentiment | BULLISH | 46% | 152ms | 20 headline(s): 3 positive, 0 negative, net score 3. |
| microstructure | BEARISH | 31% | 842ms | Volume ratio 0.59x, price change -3.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 254ms | Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%. |
| fundamentals | BULLISH | 59% | 395ms | Revenue growth 17.7%, net margin 11.7%, trailing FCF 896.2M. |
| auction | NEUTRAL | 22% | 676ms | Auction state: balance. inside value 853.82–899.2. Session bars: 246. |
| pair | NEUTRAL | 5% | 5ms | STRL is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 908ms | No recent earnings within 90 days for STRL. |
| prediction_market | NEUTRAL | 12% | 59ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 68%
- **Summary**: STRL closed at 900.9. 7d 7.4%, 30d 6.6%. RSI 57.7, MACD negative.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "STRL",
  "bars": 260,
  "close": 900.905,
  "change_7d_pct": 7.44,
  "change_30d_pct": 6.64,
  "sma20": 864.1698,
  "sma50": 727.9389,
  "sma200": 455.6427,
  "ema21": 846.7096,
  "rsi14": 57.68,
  "macd": 39.85,
  "macd_signal": 45.4469,
  "macd_crossover": "negative",
  "bollinger_position": 0.671
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 70%
- **Summary**: Risk read: 30d vol 82.8%, max drawdown -31.0%, 30d return 6.6%.
- **Evidence**:
  - Max drawdown: -31.0%
  - 30d realized volatility: 82.8%
  - Sharpe-like score: 2.3
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.8277,
  "realized_vol_90d": 1.1306,
  "max_drawdown_pct": -31.02,
  "atr14": null,
  "change_30d_pct": 6.64,
  "sharpe_like_90d": 2.3,
  "beta": 1.819,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 3.
- **Evidence**:
  - Sterling vs. MasTec: Which Infrastructure Stock is the Better Buy?
  - This Top Construction Stock is a #1 (Strong Buy): Why It Should Be on Your Radar
  - Buy 3 AI-Driven Stocks for 2H 2026 Despite Triple-Digit Returns in 1H
  - Here's Why 'Trend' Investors Would Love Betting on Sterling Infrastructure (STRL)
  - Sterling Infrastructure, Inc. (STRL) is Attracting Investor Attention: Here is What You Should Know

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 3,
  "sample_headlines": [
    "Sterling vs. MasTec: Which Infrastructure Stock is the Better Buy?",
    "This Top Construction Stock is a #1 (Strong Buy): Why It Should Be on Your Radar",
    "Buy 3 AI-Driven Stocks for 2H 2026 Despite Triple-Digit Returns in 1H",
    "Here's Why 'Trend' Investors Would Love Betting on Sterling Infrastructure (STRL)",
    "Sterling Infrastructure, Inc. (STRL) is Attracting Investor Attention: Here is What You Should Know"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.59x, price change -3.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 367.1K vs avg 618.9K
  - Market cap: 27.6B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 898.6985,
  "change_pct": -3.65,
  "volume": 367096.44887,
  "avg_volume": 618858,
  "volume_ratio": 0.59,
  "market_cap": 27577420831,
  "beta": 1.819,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.66,
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
- **Confidence**: 59%
- **Summary**: Revenue growth 17.7%, net margin 11.7%, trailing FCF 896.2M.
- **Evidence**:
  - Sector: Industrials
  - Revenue growth: 17.7%
  - Net cash: 169.7M

```json
{
  "company_name": "Sterling Infrastructure, Inc.",
  "sector": "Industrials",
  "industry": "Engineering & Construction",
  "market_cap": 27577420831,
  "revenue_growth_pct": 17.69,
  "gross_margin_pct": 22.98,
  "net_margin_pct": 11.65,
  "trailing_fcf": 896197000,
  "cash": 511858000,
  "total_debt": 342186000,
  "net_cash": 169672000,
  "cfq_score": 4.03,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 5,
    "fcf_margin": 4,
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
- **Summary**: Auction state: balance. inside value 853.82–899.2. Session bars: 246.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 873.0208, VAH: 899.2048, VAL: 853.8192
  - TPO POC: 881.7488
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-24, bars: 20).

```json
{
  "auction_state": "balance",
  "current_price": 898.6985,
  "poc": 873.0208,
  "vah": 899.2048,
  "val": 853.8192,
  "tpo_poc": 881.7488,
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
- **Auto-pulled**: 2026-06-23
