---
title: "NVDA Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "NVDA"
asset_type: "stock"
thesis_name: "Druckenmiller Style Secular Trend Leaders"
related_theses: ["[[Druckenmiller Style Secular Trend Leaders]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.36
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.82
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.65
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "nvda"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 36%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 36% confidence. Agent entropy is diffuse (0.82). Drivers: price, fundamentals. Risks: risk. 3 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.82)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 64%, bearish 14%, neutral 22%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.65)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 79% | 1291ms | NVDA closed at 213.17. 7d 5.7%, 30d 16.3%. RSI 71, MACD positive. |
| risk | BEARISH | 39% | 1525ms | Risk read: 30d vol 34.5%, max drawdown -20.2%, 30d return 16.3%. |
| sentiment | NEUTRAL | 22% | 1771ms | 12 headline(s): 0 positive, 0 negative, net score 0. |
| microstructure | NEUTRAL | 24% | 2165ms | Volume ratio 1.02x, price change -1.6%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 131ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 56% | 2376ms | Revenue growth 65.5%, net margin 55.6%, trailing FCF 96.7B. |
| prediction_market | NEUTRAL | 12% | 527ms | No relevant prediction markets found for "Druckenmiller Style Secular Trend Leaders". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 79%
- **Summary**: NVDA closed at 213.17. 7d 5.7%, 30d 16.3%. RSI 71, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "NVDA",
  "bars": 260,
  "close": 213.17,
  "change_7d_pct": 5.7,
  "change_30d_pct": 16.35,
  "sma20": 193.2375,
  "sma50": 186.2258,
  "sma200": 183.3506,
  "ema21": 196.2977,
  "rsi14": 70.99,
  "macd": 8.0386,
  "macd_signal": 5.7479,
  "macd_crossover": "positive",
  "bollinger_position": 0.895
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 39%
- **Summary**: Risk read: 30d vol 34.5%, max drawdown -20.2%, 30d return 16.3%.
- **Evidence**:
  - Max drawdown: -20.2%
  - 30d realized volatility: 34.5%
  - Sharpe-like score: 1.62
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.3454,
  "realized_vol_90d": 0.3533,
  "max_drawdown_pct": -20.22,
  "atr14": null,
  "change_30d_pct": 16.35,
  "sharpe_like_90d": 1.62,
  "beta": 2.335,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 12 headline(s): 0 positive, 0 negative, net score 0.
- **Evidence**:
  - Arrive AI Deploys NVIDIA Isaac Sim and Blackwell GPU Systems to Accelerate AI, Robotics, and Computer Vision Development
  - Should WisdomTree U.S. LargeCap Dividend ETF (DLN) Be on Your Investing Radar?
  - Should You Invest in the Fidelity MSCI Information Technology Index ETF (FTEC)?
  - Cathie Wood just made a massive bet on these two top AI stocks
  - 'This Is Madness': Investors Chasing Chip Stocks At Risky Extremes

```json
{
  "headline_count": 12,
  "positive_count": 0,
  "negative_count": 0,
  "net_score": 0,
  "sample_headlines": [
    "Arrive AI Deploys NVIDIA Isaac Sim and Blackwell GPU Systems to Accelerate AI, Robotics, and Computer Vision Development",
    "Should WisdomTree U.S. LargeCap Dividend ETF (DLN) Be on Your Investing Radar?",
    "Should You Invest in the Fidelity MSCI Information Technology Index ETF (FTEC)?",
    "Cathie Wood just made a massive bet on these two top AI stocks",
    "'This Is Madness': Investors Chasing Chip Stocks At Risky Extremes"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 1.02x, price change -1.6%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 179.4M vs avg 175.8M
  - Market cap: 5.2T
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.65) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 213.17,
  "change_pct": -1.59,
  "volume": 179415428,
  "avg_volume": 175780455,
  "volume_ratio": 1.02,
  "market_cap": 5181096612529,
  "beta": 2.335,
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
- **Confidence**: 56%
- **Summary**: Revenue growth 65.5%, net margin 55.6%, trailing FCF 96.7B.
- **Evidence**:
  - Sector: Technology
  - Revenue growth: 65.5%
  - Net cash: -807.0M

```json
{
  "company_name": "NVIDIA Corporation",
  "sector": "Technology",
  "industry": "Semiconductors",
  "market_cap": 5181096612529,
  "revenue_growth_pct": 65.47,
  "gross_margin_pct": 71.07,
  "net_margin_pct": 55.6,
  "trailing_fcf": 96676000000,
  "cash": 10605000000,
  "total_debt": 11412000000,
  "net_cash": -807000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Druckenmiller Style Secular Trend Leaders".

```json
{
  "query": "Druckenmiller Style Secular Trend Leaders",
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
