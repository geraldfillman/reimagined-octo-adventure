---
title: "FE Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "FE"
asset_type: "stock"
related_theses: []
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.33
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.88
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.65
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "fe"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 33%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 33% confidence. Agent entropy is diffuse (0.88). Drivers: risk, fundamentals. Risks: price. 5 neutral layer(s).
- **Top drivers**: risk, fundamentals, macro
- **Top risks**: price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.88)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 55%, bearish 13%, neutral 32%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.65)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 41% | 203ms | FE closed at 47.07. 7d -2.8%, 30d -5.3%. RSI 29.6, MACD negative. |
| risk | BULLISH | 43% | 206ms | Risk read: 30d vol 17.5%, max drawdown -9.3%, 30d return -5.3%. |
| sentiment | BULLISH | 46% | 346ms | 20 headline(s): 3 positive, 0 negative, net score 3. |
| microstructure | NEUTRAL | 24% | 724ms | Volume ratio 0.37x, price change -0.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 253ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 43% | 192ms | Revenue growth 12.0%, net margin 6.8%, trailing FCF 1.1B. |
| auction | NEUTRAL | 22% | 205ms | Auction state: balance. above VAH 47.2. Session bars: 27. |
| pair | NEUTRAL | 5% | 13ms | FE is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 133ms | No recent earnings within 90 days for FE. |
| prediction_market | NEUTRAL | 36% | 22ms | 6 prediction market(s) matched "FE". Top venue: Agent Analyst. |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 41%
- **Summary**: FE closed at 47.07. 7d -2.8%, 30d -5.3%. RSI 29.6, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "FE",
  "bars": 260,
  "close": 47.07,
  "change_7d_pct": -2.81,
  "change_30d_pct": -5.27,
  "sma20": 49.903,
  "sma50": 50.2452,
  "sma200": 46.4391,
  "ema21": 49.4259,
  "rsi14": 29.62,
  "macd": -0.595,
  "macd_signal": -0.2823,
  "macd_crossover": "negative",
  "bollinger_position": -0.042
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 43%
- **Summary**: Risk read: 30d vol 17.5%, max drawdown -9.3%, 30d return -5.3%.
- **Evidence**:
  - Max drawdown: -9.3%
  - 30d realized volatility: 17.5%
  - Sharpe-like score: 1.18
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.1746,
  "realized_vol_90d": 0.159,
  "max_drawdown_pct": -9.32,
  "atr14": null,
  "change_30d_pct": -5.27,
  "sharpe_like_90d": 1.18,
  "beta": 0.59,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 20 headline(s): 3 positive, 0 negative, net score 3.
- **Evidence**:
  - FE vs. NEE: Which Stock Is the Better Value Option?
  - FirstEnergy Corp. (FE) Q1 2026 Earnings Call Transcript
  - FirstEnergy Sees Revenue Growth in Q1, Earnings Match Estimates
  - FirstEnergy (FE) Q1 Earnings Meet Estimates
  - FirstEnergy's quarterly profit rises on higher rates, data-center demand

```json
{
  "headline_count": 20,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 3,
  "sample_headlines": [
    "FE vs. NEE: Which Stock Is the Better Value Option?",
    "FirstEnergy Corp. (FE) Q1 2026 Earnings Call Transcript",
    "FirstEnergy Sees Revenue Growth in Q1, Earnings Match Estimates",
    "FirstEnergy (FE) Q1 Earnings Meet Estimates",
    "FirstEnergy's quarterly profit rises on higher rates, data-center demand"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.37x, price change -0.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.8M vs avg 4.8M
  - Market cap: 27.4B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.65) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 47.3,
  "change_pct": -0.46,
  "volume": 1772623,
  "avg_volume": 4843554,
  "volume_ratio": 0.37,
  "market_cap": 27359786300,
  "beta": 0.59,
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
- **Confidence**: 43%
- **Summary**: Revenue growth 12.0%, net margin 6.8%, trailing FCF 1.1B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 12.0%
  - Net cash: -28.0B

```json
{
  "company_name": "FirstEnergy Corp.",
  "sector": "Utilities",
  "industry": "Regulated Electric",
  "market_cap": 27336648089,
  "revenue_growth_pct": 12.01,
  "gross_margin_pct": 54.77,
  "net_margin_pct": 6.76,
  "trailing_fcf": 1118000000,
  "cash": 80000000,
  "total_debt": 28060000000,
  "net_cash": -27980000000,
  "cfq_score": 3.47,
  "cfq_label": "acceptable",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 5,
    "fcf_margin": 3,
    "capital_intensity": 3,
    "pricing_power": 4,
    "balance_sheet": 1,
    "share_count_quality": 3,
    "margin_stability": 4
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. above VAH 47.2. Session bars: 27.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 47.1046, VAH: 47.1993, VAL: 47.1046
  - TPO POC: 47.1046
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 47.26,
  "poc": 47.1046,
  "vah": 47.1993,
  "val": 47.1046,
  "tpo_poc": 47.1046,
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
- **Summary**: FE is not in any configured pair watchlist.

```json
{
  "symbol": "FE",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for FE.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "FE",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 36%
- **Summary**: 6 prediction market(s) matched "FE". Top venue: Agent Analyst.
- **Evidence**:
  - Agent Analyst: CAH Agent Analysis (N/A)
  - Agent Analyst: GOOGL Agent Analysis (N/A)
  - Agent Analyst: IRM Agent Analysis (N/A)
  - Agent Analyst: META Agent Analysis (N/A)
  - Agent Analyst: PPL Agent Analysis (N/A)
- **Warnings**:
  - Live prediction-market APIs were disabled; local notes only.

```json
{
  "query": "FE",
  "live_enabled": false,
  "market_count": 6,
  "markets": [
    {
      "venue": "Agent Analyst",
      "title": "CAH Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    },
    {
      "venue": "Agent Analyst",
      "title": "GOOGL Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    },
    {
      "venue": "Agent Analyst",
      "title": "IRM Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    },
    {
      "venue": "Agent Analyst",
      "title": "META Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    },
    {
      "venue": "Agent Analyst",
      "title": "PPL Agent Analysis",
      "probability": null,
      "volume": null,
      "liquidity": null,
      "close_time": null,
      "url": null,
      "source": "local_note",
      "polarity": "context-only"
    }
  ]
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-05-01
