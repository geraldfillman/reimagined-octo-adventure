---
title: "AMZN Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AMZN"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-23"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.19
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.97
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.67
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
- **Reasoning**: Deterministic synthesis is neutral at 19% confidence. Agent entropy is diffuse (0.97). Drivers: fundamentals, sentiment. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, sentiment, macro
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.97)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 44%, bearish 30%, neutral 25%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.67)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 32ms | AMZN closed at 233.94. 7d -3.1%, 30d -14.2%. RSI 37.7, MACD negative. |
| risk | BEARISH | 50% | 281ms | Risk read: 30d vol 31.4%, max drawdown -21.7%, 30d return -14.2%. |
| sentiment | BULLISH | 46% | 77ms | 20 headline(s): 3 positive, 0 negative, net score 3. |
| microstructure | NEUTRAL | 24% | 243ms | Volume ratio 0.59x, price change 0.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 252ms | Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%. |
| fundamentals | BULLISH | 50% | 508ms | Revenue growth 12.4%, net margin 10.8%, trailing FCF 18.3B. |
| auction | NEUTRAL | 22% | 821ms | Auction state: balance. at POC 234.55. Session bars: 246. |
| pair | NEUTRAL | 5% | 0ms | AMZN is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 931ms | No recent earnings within 90 days for AMZN. |
| prediction_market | NEUTRAL | 12% | 42ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: AMZN closed at 233.94. 7d -3.1%, 30d -14.2%. RSI 37.7, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "AMZN",
  "bars": 260,
  "close": 233.935,
  "change_7d_pct": -3.14,
  "change_30d_pct": -14.21,
  "sma20": 249.8753,
  "sma50": 256.9941,
  "sma200": 232.8289,
  "ema21": 247.1598,
  "rsi14": 37.66,
  "macd": -5.9911,
  "macd_signal": -4.3194,
  "macd_crossover": "negative",
  "bollinger_position": 0.179
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 50%
- **Summary**: Risk read: 30d vol 31.4%, max drawdown -21.7%, 30d return -14.2%.
- **Evidence**:
  - Max drawdown: -21.7%
  - 30d realized volatility: 31.4%
  - Sharpe-like score: 1.41
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3145,
  "realized_vol_90d": 0.3054,
  "max_drawdown_pct": -21.74,
  "atr14": null,
  "change_30d_pct": -14.21,
  "sharpe_like_90d": 1.41,
  "beta": 1.444,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 3.
- **Evidence**:
  - Amazon's Pullback Deepens as a New FTC Risk Hits the Stock
  - Is Amazon a Buy? Nearly Every Analyst Says Yes
  - These new Amazon ads don't just recommend products—they can make your purchases for you
  - Amazon Prime Day expected to drive record $26B in online spending
  - Why Amazon (AMZN) is a Top Growth Stock for the Long-Term

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 3,
  "sample_headlines": [
    "Amazon's Pullback Deepens as a New FTC Risk Hits the Stock",
    "Is Amazon a Buy? Nearly Every Analyst Says Yes",
    "These new Amazon ads don't just recommend products—they can make your purchases for you",
    "Amazon Prime Day expected to drive record $26B in online spending",
    "Why Amazon (AMZN) is a Top Growth Stock for the Long-Term"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.59x, price change 0.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 26.4M vs avg 45.0M
  - Market cap: 2.5T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.67) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 234.29,
  "change_pct": 0.64,
  "volume": 26442956,
  "avg_volume": 44954648,
  "volume_ratio": 0.59,
  "market_cap": 2520280959000,
  "beta": 1.444,
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
  "market_cap": 2520280959000,
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
- **Summary**: Auction state: balance. at POC 234.55. Session bars: 246.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 234.5452, VAH: 236.4214, VAL: 232.669
  - TPO POC: 234.5452
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-24, bars: 20).

```json
{
  "auction_state": "balance",
  "current_price": 234.29,
  "poc": 234.5452,
  "vah": 236.4214,
  "val": 232.669,
  "tpo_poc": 234.5452,
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
- **Auto-pulled**: 2026-06-23
