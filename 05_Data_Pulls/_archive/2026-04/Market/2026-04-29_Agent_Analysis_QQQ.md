---
title: "QQQ Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "QQQ"
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
final_confidence: 0.71
synthesis_mode: "deterministic"
entropy_level: "ordered"
entropy_score: 0.36
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.63
agent_count: 4
failed_agent_count: 0
agent_names: ["price", "risk", "microstructure", "macro"]
tags: ["agent-analysis", "market", "qqq"]
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 71%
- **Attention status**: watch
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is bullish at 71% confidence. Agent entropy is ordered (0.36). Drivers: price, risk. 1 neutral layer(s).
- **Top drivers**: price, risk, macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: ordered (0.36)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 87%, bearish 0%, neutral 13%
- **Interpretation**: Below-average agent entropy: the stack has a clear lean with some counter-evidence.
- **Microstructure entropy**: mixed (0.63)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 72% | 224ms | QQQ closed at 657.55. 7d 1.3%, 30d 9.5%. RSI 69.2, MACD positive. |
| risk | BULLISH | 49% | 677ms | Risk read: 30d vol 21.3%, max drawdown -12.2%, 30d return 9.5%. |
| microstructure | NEUTRAL | 24% | 353ms | Volume ratio 0.53x, price change -1.0%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 1322ms | Macro backdrop: VIX 18.02, curve 0.52, HY spread 2.8%. |

## Follow Up Actions

- Compare with latest thesis full-picture report.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 72%
- **Summary**: QQQ closed at 657.55. 7d 1.3%, 30d 9.5%. RSI 69.2, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "QQQ",
  "bars": 260,
  "close": 657.55,
  "change_7d_pct": 1.34,
  "change_30d_pct": 9.52,
  "sma20": 625.3465,
  "sma50": 608.8038,
  "sma200": 602.4184,
  "ema21": 631.9951,
  "rsi14": 69.19,
  "macd": 17.2505,
  "macd_signal": 13.3512,
  "macd_crossover": "positive",
  "bollinger_position": 0.78
}
```

## Risk Agent

- **Signal**: BULLISH
- **Confidence**: 49%
- **Summary**: Risk read: 30d vol 21.3%, max drawdown -12.2%, 30d return 9.5%.
- **Evidence**:
  - Max drawdown: -12.2%
  - 30d realized volatility: 21.3%
  - Sharpe-like score: 1.21
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2126,
  "realized_vol_90d": 0.1803,
  "max_drawdown_pct": -12.19,
  "atr14": null,
  "change_30d_pct": 9.52,
  "sharpe_like_90d": 1.21,
  "beta": 1.11,
  "days_to_cover": null
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.53x, price change -1.0%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 33.8M vs avg 63.8M
  - Market cap: 368.8B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.63) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 657.55,
  "change_pct": -1.01,
  "volume": 33787266,
  "avg_volume": 63834183,
  "volume_ratio": 0.53,
  "market_cap": 368777751911,
  "beta": 1.11,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.63,
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
