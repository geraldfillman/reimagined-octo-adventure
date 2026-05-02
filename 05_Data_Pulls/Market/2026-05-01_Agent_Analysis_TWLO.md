---
title: "TWLO Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "TWLO"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.38
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.72
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.61
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "twlo"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 38%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 38% confidence. Agent entropy is mixed (0.72). Drivers: price, fundamentals. Risks: risk. 4 neutral layer(s).
- **Top drivers**: price, fundamentals, sentiment
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: mixed (0.72)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 72%, bearish 15%, neutral 13%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.61)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 73% | 187ms | TWLO closed at 176.08. 7d 17.0%, 30d 38.3%. RSI 77.8, MACD positive. |
| risk | BEARISH | 58% | 199ms | Risk read: 30d vol 73.9%, max drawdown -30.3%, 30d return 38.3%. |
| sentiment | BULLISH | 75% | 282ms | 17 headline(s): 9 positive, 0 negative, net score 12. |
| microstructure | BULLISH | 31% | 298ms | Volume ratio 0.64x, price change 20.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 217ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 58% | 151ms | Revenue growth 13.7%, net margin 0.7%, trailing FCF 1.7B. |
| auction | NEUTRAL | 22% | 253ms | Auction state: balance. above VAH 177.54. Session bars: 27. |
| pair | NEUTRAL | 5% | 12ms | TWLO is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 150ms | No recent earnings within 90 days for TWLO. |
| prediction_market | NEUTRAL | 12% | 20ms | No relevant prediction markets found for "TWLO". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 73%
- **Summary**: TWLO closed at 176.08. 7d 17.0%, 30d 38.3%. RSI 77.8, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "TWLO",
  "bars": 260,
  "close": 176.08,
  "change_7d_pct": 17.04,
  "change_30d_pct": 38.26,
  "sma20": 138.6065,
  "sma50": 129.593,
  "sma200": 121.765,
  "ema21": 141.0275,
  "rsi14": 77.81,
  "macd": 7.576,
  "macd_signal": 5.1962,
  "macd_crossover": "positive",
  "bollinger_position": 1.26
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 58%
- **Summary**: Risk read: 30d vol 73.9%, max drawdown -30.3%, 30d return 38.3%.
- **Evidence**:
  - Max drawdown: -30.3%
  - 30d realized volatility: 73.9%
  - Sharpe-like score: 1.33
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.7392,
  "realized_vol_90d": 0.5806,
  "max_drawdown_pct": -30.34,
  "atr14": null,
  "change_30d_pct": 38.26,
  "sharpe_like_90d": 1.33,
  "beta": 1.2839457,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 75%
- **Summary**: 17 headline(s): 9 positive, 0 negative, net score 12.
- **Evidence**:
  - What SaaSpocalypse? Atlassian, Twilio, and Five9 stocks soar as their AI moves deliver earnings beats
  - Twilio's stock is soaring. The company says it's because of ‘unprecedented demand' for one AI function.
  - Twilio stock soared to its highest level in 4 years. Its CEO shares how AI helped the company turn things around.
  - Twilio Inc. (TWLO) Q1 2026 Earnings Call Transcript
  - Twilio: AI Deals Are Changing This Company's Growth Trajectory

```json
{
  "headline_count": 17,
  "positive_count": 9,
  "negative_count": 0,
  "net_score": 12,
  "sample_headlines": [
    "What SaaSpocalypse? Atlassian, Twilio, and Five9 stocks soar as their AI moves deliver earnings beats",
    "Twilio's stock is soaring. The company says it's because of ‘unprecedented demand' for one AI function.",
    "Twilio stock soared to its highest level in 4 years. Its CEO shares how AI helped the company turn things around.",
    "Twilio Inc. (TWLO) Q1 2026 Earnings Call Transcript",
    "Twilio: AI Deals Are Changing This Company's Growth Trajectory"
  ]
}
```

## Microstructure Agent

- **Signal**: BULLISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.64x, price change 20.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.6M vs avg 2.4M
  - Market cap: 27.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.61) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 178.66,
  "change_pct": 20.67,
  "volume": 1564624,
  "avg_volume": 2444800,
  "volume_ratio": 0.64,
  "market_cap": 27069491240,
  "beta": 1.2839457,
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
    "date": "2026-04-29",
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
- **Confidence**: 58%
- **Summary**: Revenue growth 13.7%, net margin 0.7%, trailing FCF 1.7B.
- **Evidence**:
  - Sector: Communication Services
  - Revenue growth: 13.7%
  - Net cash: 466.6M

```json
{
  "company_name": "Twilio Inc.",
  "sector": "Communication Services",
  "industry": "Internet Content & Information",
  "market_cap": 27069491240,
  "revenue_growth_pct": 13.66,
  "gross_margin_pct": 48.02,
  "net_margin_pct": 0.67,
  "trailing_fcf": 1666351000,
  "cash": 541976000,
  "total_debt": 75409000,
  "net_cash": 466567000,
  "cfq_score": 4.2,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 3.25,
    "fcf_conversion": 5,
    "fcf_margin": 4,
    "capital_intensity": 5,
    "pricing_power": 4.5,
    "balance_sheet": 5,
    "share_count_quality": 5,
    "margin_stability": 1.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. above VAH 177.54. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 175.4267, VAH: 177.5392, VAL: 174.0183
  - TPO POC: 175.0746
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 178.66,
  "poc": 175.4267,
  "vah": 177.5392,
  "val": 174.0183,
  "tpo_poc": 175.0746,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 27,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: TWLO is not in any configured pair watchlist.

```json
{
  "symbol": "TWLO",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for TWLO.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "TWLO",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "TWLO".

```json
{
  "query": "TWLO",
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
