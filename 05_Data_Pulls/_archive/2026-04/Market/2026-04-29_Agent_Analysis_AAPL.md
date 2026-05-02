---
title: "AAPL Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AAPL"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.53
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.55
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.65
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "aapl"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 53%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 53% confidence. Agent entropy is mixed (0.55). Drivers: price, fundamentals. 3 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.55)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 71%, bearish 0%, neutral 29%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: mixed (0.65)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 75% | 225ms | AAPL closed at 270.71. 7d 0.2%, 30d 7.1%. RSI 58.3, MACD positive. |
| risk | NEUTRAL | 36% | 240ms | Risk read: 30d vol 22.8%, max drawdown -13.8%, 30d return 7.1%. |
| sentiment | BULLISH | 38% | 334ms | 12 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | NEUTRAL | 28% | 387ms | Volume ratio 0.72x, price change 1.2%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 286ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 39% | 188ms | Revenue growth 6.4%, net margin 26.9%, trailing FCF 123.3B. |
| prediction_market | NEUTRAL | 12% | 684ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 75%
- **Summary**: AAPL closed at 270.71. 7d 0.2%, 30d 7.1%. RSI 58.3, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "AAPL",
  "bars": 260,
  "close": 270.71,
  "change_7d_pct": 0.18,
  "change_30d_pct": 7.08,
  "sma20": 263.543,
  "sma50": 260.5616,
  "sma200": 254.2145,
  "ema21": 264.7604,
  "rsi14": 58.26,
  "macd": 3.7869,
  "macd_signal": 2.9513,
  "macd_crossover": "positive",
  "bollinger_position": 0.769
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 36%
- **Summary**: Risk read: 30d vol 22.8%, max drawdown -13.8%, 30d return 7.1%.
- **Evidence**:
  - Max drawdown: -13.8%
  - 30d realized volatility: 22.8%
  - Sharpe-like score: -0.05
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2278,
  "realized_vol_90d": 0.2358,
  "max_drawdown_pct": -13.82,
  "atr14": null,
  "change_30d_pct": 7.08,
  "sharpe_like_90d": -0.05,
  "beta": 1.109,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 12 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - GD Culture Group Limited Provides Business Progress on AI Interactive Novel Platform - Fato Now Available on Apple App Store
  - Should WisdomTree U.S. LargeCap Dividend ETF (DLN) Be on Your Investing Radar?
  - Should You Invest in the Fidelity MSCI Information Technology Index ETF (FTEC)?
  - Is iShares Core S&P U.S. Value ETF (IUSV) a Strong ETF Right Now?
  - 'This Is Madness': Investors Chasing Chip Stocks At Risky Extremes

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "GD Culture Group Limited Provides Business Progress on AI Interactive Novel Platform - Fato Now Available on Apple App Store",
    "Should WisdomTree U.S. LargeCap Dividend ETF (DLN) Be on Your Investing Radar?",
    "Should You Invest in the Fidelity MSCI Information Technology Index ETF (FTEC)?",
    "Is iShares Core S&P U.S. Value ETF (IUSV) a Strong ETF Right Now?",
    "'This Is Madness': Investors Chasing Chip Stocks At Risky Extremes"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 28%
- **Summary**: Volume ratio 0.72x, price change 1.2%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 32.8M vs avg 45.4M
  - Market cap: 4.0T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.65) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 270.71,
  "change_pct": 1.16,
  "volume": 32820055,
  "avg_volume": 45360691,
  "volume_ratio": 0.72,
  "market_cap": 3974331409400,
  "beta": 1.109,
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
- **Summary**: Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 18.02
  - HY spread: 2.8%

```json
{
  "DFF": {
    "date": "2026-04-27",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-28",
    "value": 0.52
  },
  "VIXCLS": {
    "date": "2026-04-27",
    "value": 18.02
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-27",
    "value": 2.84
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 39%
- **Summary**: Revenue growth 6.4%, net margin 26.9%, trailing FCF 123.3B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 6.4%
  - Net cash: -45.2B

```json
{
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "market_cap": 3974331409400,
  "revenue_growth_pct": 6.43,
  "gross_margin_pct": 46.91,
  "net_margin_pct": 26.92,
  "trailing_fcf": 123324000000,
  "cash": 45317000000,
  "total_debt": 90509000000,
  "net_cash": -45192000000
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
- **Auto-pulled**: 2026-04-29
