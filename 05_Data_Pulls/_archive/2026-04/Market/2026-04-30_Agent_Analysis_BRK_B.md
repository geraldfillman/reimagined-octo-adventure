---
title: "BRK_B Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "BRK_B"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_MACRO_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.21
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.56
entropy_dominant_signal: "neutral"
agent_count: 7
failed_agent_count: 1
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "brk_b"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 21%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 21% confidence. Agent entropy is mixed (0.56). Drivers: macro. 5 neutral layer(s). 1 layer(s) failed and were treated as neutral.
- **Top drivers**: macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.56)
- **Dominant signal bucket**: neutral
- **Distribution**: bullish 30%, bearish 0%, neutral 70%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: N/A
- **Microstructure read**: N/A
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 10% | 40ms | Only 0 price bars were available. |
| risk | NEUTRAL | 10% | 1112ms | Only 0 bars were available for risk metrics. |
| sentiment | NEUTRAL | 15% | 2006ms | No recent headlines were available for sentiment scoring. |
| microstructure | NEUTRAL | 0% | 2232ms | microstructure agent failed: No quote returned. |
| macro | BULLISH | 31% | 202ms | Macro backdrop: VIX 17.83, curve 0.50, HY spread 2.9%. |
| fundamentals | NEUTRAL | 24% | 1636ms | Revenue growth N/A, net margin N/A, trailing FCF 0.0. |
| prediction_market | NEUTRAL | 12% | 589ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Rerun failed agents or inspect API keys.

## Price Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: Only 0 price bars were available.
- **Warnings**:
  - Insufficient price history for robust technical read.

```json
{
  "bars": 0
}
```

## Risk Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: Only 0 bars were available for risk metrics.
- **Warnings**:
  - Insufficient price history for volatility and drawdown metrics.

```json
{
  "bars": 0
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 15%
- **Summary**: No recent headlines were available for sentiment scoring.

```json
{
  "headline_count": 0
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 0%
- **Summary**: microstructure agent failed: No quote returned.
- **Warnings**:
  - No quote returned.

```json
{}
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

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Revenue growth N/A, net margin N/A, trailing FCF 0.0.
- **Evidence**:
  - Sector: N/A
  - Revenue growth: N/A
  - Net cash: N/A

```json
{
  "company_name": null,
  "sector": null,
  "industry": null,
  "market_cap": null,
  "revenue_growth_pct": null,
  "gross_margin_pct": null,
  "net_margin_pct": null,
  "trailing_fcf": 0,
  "cash": null,
  "total_debt": 0,
  "net_cash": null
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
