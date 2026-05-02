---
title: "KO Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "KO"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.69
synthesis_mode: "deterministic"
entropy_level: "ordered"
entropy_score: 0.36
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "ko"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 69%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 69% confidence. Agent entropy is ordered (0.36). Drivers: price, risk. 2 neutral layer(s).
- **Top drivers**: price, risk, sentiment
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: ordered (0.36)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 87%, bearish 0%, neutral 13%
- **Interpretation**: Below-average agent entropy: the stack has a clear lean with some counter-evidence.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 44ms | KO closed at 78.87. 7d 4.5%, 30d 1.7%. RSI 61.4, MACD positive. |
| risk | BULLISH | 43% | 301ms | Risk read: 30d vol 19.8%, max drawdown -11.1%, 30d return 1.7%. |
| sentiment | BULLISH | 70% | 421ms | 12 headline(s): 5 positive, 0 negative, net score 6. |
| microstructure | NEUTRAL | 28% | 967ms | Volume ratio 0.73x, price change 0.7%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 179ms | Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%. |
| fundamentals | BULLISH | 39% | 2276ms | Revenue growth 1.9%, net margin 27.3%, trailing FCF 12.6B. |
| prediction_market | NEUTRAL | 12% | 561ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: KO closed at 78.87. 7d 4.5%, 30d 1.7%. RSI 61.4, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "KO",
  "bars": 260,
  "close": 78.87,
  "change_7d_pct": 4.49,
  "change_30d_pct": 1.66,
  "sma20": 76.3895,
  "sma50": 77.185,
  "sma200": 71.8608,
  "ema21": 76.4632,
  "rsi14": 61.41,
  "macd": 0.1578,
  "macd_signal": -0.1637,
  "macd_crossover": "positive",
  "bollinger_position": 1.03
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 43%
- **Summary**: Risk read: 30d vol 19.8%, max drawdown -11.1%, 30d return 1.7%.
- **Evidence**:
  - Max drawdown: -11.1%
  - 30d realized volatility: 19.8%
  - Sharpe-like score: 1.84
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.1984,
  "realized_vol_90d": 0.175,
  "max_drawdown_pct": -11.14,
  "atr14": null,
  "change_30d_pct": 1.66,
  "sharpe_like_90d": 1.84,
  "beta": 0.36163828,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 70%
- **Summary**: 12 headline(s): 5 positive, 0 negative, net score 6.
- **Evidence**:
  - 3 Unstoppable Growth Stocks For Years Of Passive Income
  - Why Vita Coco Skyrocketed Today
  - The Coca-Cola Company (KO) Shareholder/Analyst Call Transcript
  - Warren Buffett's Coca-Cola Bet Just Got $3.4 Billion Sweeter
  - Coca-Cola's Beverage Portfolio Shift: Beyond Soda for Growth?

```json
{
  "headline_count": 12,
  "positive_count": 5,
  "negative_count": 0,
  "net_score": 6,
  "sample_headlines": [
    "3 Unstoppable Growth Stocks For Years Of Passive Income",
    "Why Vita Coco Skyrocketed Today",
    "The Coca-Cola Company (KO) Shareholder/Analyst Call Transcript",
    "Warren Buffett's Coca-Cola Bet Just Got $3.4 Billion Sweeter",
    "Coca-Cola's Beverage Portfolio Shift: Beyond Soda for Growth?"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.73x, price change 0.7%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 12.4M vs avg 17.0M
  - Market cap: 339.5B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 78.87,
  "change_pct": 0.66,
  "volume": 12379310,
  "avg_volume": 17036347,
  "volume_ratio": 0.73,
  "market_cap": 339468310500,
  "beta": 0.36163828,
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
- **Summary**: Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 17.83
  - HY spread: 2.9%

```json
{
  "DFF": {
    "date": "2026-04-28",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-29",
    "value": 0.5
  },
  "VIXCLS": {
    "date": "2026-04-28",
    "value": 17.83
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-28",
    "value": 2.85
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 39%
- **Summary**: Revenue growth 1.9%, net margin 27.3%, trailing FCF 12.6B.
- **Evidence**:
  - Sector: Consumer Defensive
  - Revenue growth: 1.9%
  - Net cash: -33.3B

```json
{
  "company_name": "The Coca-Cola Company",
  "sector": "Consumer Defensive",
  "industry": "Beverages - Non-Alcoholic",
  "market_cap": 339468310500,
  "revenue_growth_pct": 1.87,
  "gross_margin_pct": 61.63,
  "net_margin_pct": 27.34,
  "trailing_fcf": 12562000000,
  "cash": 10574000000,
  "total_debt": 43890000000,
  "net_cash": -33316000000
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
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-04-30
