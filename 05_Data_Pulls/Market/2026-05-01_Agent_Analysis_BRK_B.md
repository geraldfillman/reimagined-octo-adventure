---
title: "BRK_B Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "BRK_B"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_MACRO_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.21
synthesis_mode: "deterministic"
entropy_level: "mixed"
entropy_score: 0.53
entropy_dominant_signal: "neutral"
agent_count: 10
failed_agent_count: 1
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "brk_b"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 21%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 21% confidence. Agent entropy is mixed (0.53). Drivers: macro. 8 neutral layer(s). 1 layer(s) failed and were treated as neutral.
- **Top drivers**: macro
- **Top risks**: N/A

## Entropy Levels

- **Orchestrator entropy**: mixed (0.53)
- **Dominant signal bucket**: neutral
- **Distribution**: bullish 27%, bearish 0%, neutral 73%
- **Interpretation**: Mid-range agent entropy: the stack is partially split and needs thesis context.
- **Microstructure entropy**: N/A
- **Microstructure read**: N/A
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | NEUTRAL | 10% | 4972ms | Only 0 price bars were available. |
| risk | NEUTRAL | 10% | 5148ms | Only 0 bars were available for risk metrics. |
| sentiment | NEUTRAL | 15% | 3470ms | No recent headlines were available for sentiment scoring. |
| microstructure | NEUTRAL | 0% | 3778ms | microstructure agent failed: No quote returned. |
| macro | BULLISH | 36% | 112ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | NEUTRAL | 24% | 1810ms | Revenue growth N/A, net margin N/A, trailing FCF 0.0. |
| auction | NEUTRAL | 10% | 2069ms | Auction state: unknown. unknown. Session bars: 0. |
| pair | NEUTRAL | 5% | 0ms | BRK_B is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 2230ms | No recent earnings within 90 days for BRK_B. |
| prediction_market | NEUTRAL | 12% | 51ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

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
    "date": "2026-04-30",
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
  "net_cash": null,
  "cfq_score": 2.5,
  "cfq_label": "acceptable",
  "cfq_factors": {
    "ocf_durability": 2.5,
    "fcf_conversion": 2.5,
    "fcf_margin": 2.5,
    "capital_intensity": 2.5,
    "pricing_power": 2.5,
    "balance_sheet": 2.5,
    "share_count_quality": 2.5,
    "margin_stability": 2.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: Auction state: unknown. unknown. Session bars: 0.
- **Evidence**:
  - Auction state: unknown
  - Volume Profile unavailable
  - TPO unavailable
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Only 0 intraday bars available; VP/TPO skipped.
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 0).

```json
{
  "auction_state": "unknown",
  "current_price": null,
  "poc": null,
  "vah": null,
  "val": null,
  "tpo_poc": null,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": null,
  "session_bar_count": 0,
  "daily_bar_count": 0
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: BRK_B is not in any configured pair watchlist.

```json
{
  "symbol": "BRK_B",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for BRK_B.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "BRK_B",
  "earnings_in_window": 0
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
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-05-01
