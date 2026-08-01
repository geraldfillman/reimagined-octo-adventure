---
title: "AMZN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AMZN"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-05"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.19
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.98
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.6
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "amzn"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 19%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 19% confidence. Agent entropy is diffuse (0.98). Drivers: fundamentals, sentiment. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, sentiment, macro
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.98)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 44%, bearish 29%, neutral 27%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.6)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 33ms | AMZN closed at 248.02. 7d -8.8%, 30d -2.8%. RSI 39.1, MACD negative. |
| risk | BEARISH | 45% | 43ms | Risk read: 30d vol 25.8%, max drawdown -21.7%, 30d return -2.8%. |
| sentiment | BULLISH | 38% | 145ms | 20 headline(s): 3 positive, 2 negative, net score 2. |
| microstructure | NEUTRAL | 27% | 199ms | Volume ratio 0.74x, price change -2.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 218ms | Macro backdrop: VIX 15.40, curve 0.42, HY spread 2.7%. |
| fundamentals | BULLISH | 50% | 45ms | Revenue growth 12.4%, net margin 10.8%, trailing FCF 18.3B. |
| auction | NEUTRAL | 22% | 222ms | Auction state: balance. inside value 248.16–254.21. Session bars: 328. |
| pair | NEUTRAL | 5% | 2ms | AMZN is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 119ms | No recent earnings within 90 days for AMZN. |
| prediction_market | NEUTRAL | 12% | 18ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: AMZN closed at 248.02. 7d -8.8%, 30d -2.8%. RSI 39.1, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "AMZN",
  "bars": 260,
  "close": 248.02,
  "change_7d_pct": -8.77,
  "change_30d_pct": -2.77,
  "sma20": 264.218,
  "sma50": 251.1974,
  "sma200": 232.1382,
  "ema21": 260.6658,
  "rsi14": 39.13,
  "macd": -0.2606,
  "macd_signal": 3.1081,
  "macd_crossover": "negative",
  "bollinger_position": -0.066
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: Risk read: 30d vol 25.8%, max drawdown -21.7%, 30d return -2.8%.
- **Evidence**:
  - Max drawdown: -21.7%
  - 30d realized volatility: 25.8%
  - Sharpe-like score: 0.28
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2583,
  "realized_vol_90d": 0.3061,
  "max_drawdown_pct": -21.74,
  "atr14": null,
  "change_30d_pct": -2.77,
  "sharpe_like_90d": 0.28,
  "beta": 1.468,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 20 headline(s): 3 positive, 2 negative, net score 2.
- **Evidence**:
  - 3 Good AI Stocks to Take Profits On Right Now
  - Good News for NVIDIA, Amazon, and Micron Investors: New Research Shows Trillion-Dollar Stocks May 10X
  - Texas grid flags risks as data centers, crypto sites fail voltage tests
  - Billionaire Investor Bill Ackman: Buying Microsoft, Meta, and Amazon Today Could Be Like Adding Buffett's Berkshire Hathaway 25 Years Ago
  - Warren Buffett's Investment Advice Is Putting Retirement Portfolios at Risk

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 2,
  "net_score": 2,
  "sample_headlines": [
    "3 Good AI Stocks to Take Profits On Right Now",
    "Good News for NVIDIA, Amazon, and Micron Investors: New Research Shows Trillion-Dollar Stocks May 10X",
    "Texas grid flags risks as data centers, crypto sites fail voltage tests",
    "Billionaire Investor Bill Ackman: Buying Microsoft, Meta, and Amazon Today Could Be Like Adding Buffett's Berkshire Hathaway 25 Years Ago",
    "Warren Buffett's Investment Advice Is Putting Retirement Portfolios at Risk"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 27%
- **Summary**: Volume ratio 0.74x, price change -2.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 33.1M vs avg 44.9M
  - Market cap: 2.7T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.6) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 248.21001,
  "change_pct": -2.2,
  "volume": 33132778,
  "avg_volume": 44933614,
  "volume_ratio": 0.74,
  "market_cap": 2670019863222,
  "beta": 1.468,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.6,
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
- **Confidence**: 50%
- **Summary**: Revenue growth 12.4%, net margin 10.8%, trailing FCF 18.3B.
- **Evidence**:
  - Sector: Consumer Cyclical
  - Revenue growth: 12.4%
  - Net cash: -108.1B

```json
{
  "company_name": "Amazon.com, Inc.",
  "sector": "Consumer Cyclical",
  "industry": "Specialty Retail",
  "market_cap": 2670019863222,
  "revenue_growth_pct": 12.38,
  "gross_margin_pct": 50.29,
  "net_margin_pct": 10.83,
  "trailing_fcf": 18338000000,
  "cash": 101816000000,
  "total_debt": 209888000000,
  "net_cash": -108072000000,
  "cfq_score": 2.23,
  "cfq_label": "low",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 0,
    "fcf_margin": 0,
    "capital_intensity": 1,
    "pricing_power": 4.5,
    "balance_sheet": 4,
    "share_count_quality": 2,
    "margin_stability": 2
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 248.16–254.21. Session bars: 328.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 253.2039, VAH: 254.2119, VAL: 248.164
  - TPO POC: 253.2039
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-06, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 248.21001,
  "poc": 253.2039,
  "vah": 254.2119,
  "val": 248.164,
  "tpo_poc": 253.2039,
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
- **Summary**: AMZN is not in any configured pair watchlist.

```json
{
  "symbol": "AMZN",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for AMZN.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "AMZN",
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
