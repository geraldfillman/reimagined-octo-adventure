---
title: "SPY Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "SPY"
asset_type: "stock"
thesis_name: "SPY QQQ Entropy Expansion Monitor"
related_theses: ["[[SPY QQQ Entropy Expansion Monitor]]"]
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_MACRO_BULLISH"]
final_verdict: "BULLISH"
final_confidence: 0.7
synthesis_mode: "deterministic"
entropy_level: "ordered"
entropy_score: 0.36
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.62
agent_count: 4
failed_agent_count: 0
agent_names: ["price", "risk", "microstructure", "macro"]
tags: ["agent-analysis", "market", "spy"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 70%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 70% confidence. Agent entropy is ordered (0.36). Drivers: price, risk. 1 neutral layer(s).
- **Top drivers**: price, risk, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: ordered (0.36)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 87%, bearish 0%, neutral 13%
- **Interpretation**: Below-average agent entropy: the stack has a clear lean with some counter-evidence.
- **Microstructure entropy**: mixed (0.62)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 75% | 263ms | SPY closed at 711.69. 7d 0.2%, 30d 6.4%. RSI 67.1, MACD positive. |
| risk | BULLISH | 43% | 273ms | Risk read: 30d vol 17.0%, max drawdown -9.1%, 30d return 6.4%. |
| microstructure | NEUTRAL | 24% | 743ms | Volume ratio 0.45x, price change -0.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 1339ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 75%
- **Summary**: SPY closed at 711.69. 7d 0.2%, 30d 6.4%. RSI 67.1, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "SPY",
  "bars": 260,
  "close": 711.69,
  "change_7d_pct": 0.22,
  "change_30d_pct": 6.38,
  "sma20": 689.025,
  "sma50": 678.2708,
  "sma200": 669.5416,
  "ema21": 693.6721,
  "rsi14": 67.09,
  "macd": 12.5457,
  "macd_signal": 9.9121,
  "macd_crossover": "positive",
  "bollinger_position": 0.754
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 43%
- **Summary**: Risk read: 30d vol 17.0%, max drawdown -9.1%, 30d return 6.4%.
- **Evidence**:
  - Max drawdown: -9.1%
  - 30d realized volatility: 17.0%
  - Sharpe-like score: 1.03
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.1703,
  "realized_vol_90d": 0.1378,
  "max_drawdown_pct": -9.13,
  "atr14": null,
  "change_30d_pct": 6.38,
  "sharpe_like_90d": 1.03,
  "beta": 1,
  "days_to_cover": null
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.45x, price change -0.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 37.3M vs avg 83.5M
  - Market cap: 726.8B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.62) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 711.69,
  "change_pct": -0.49,
  "volume": 37342531,
  "avg_volume": 83543869,
  "volume_ratio": 0.45,
  "market_cap": 726765437477,
  "beta": 1,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.62,
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

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, microstructure, macro
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-04-29
