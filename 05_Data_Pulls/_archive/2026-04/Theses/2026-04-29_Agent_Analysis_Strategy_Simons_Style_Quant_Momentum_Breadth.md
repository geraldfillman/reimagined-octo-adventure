---
title: "Agent Analysis Strategy Rollup"
source: "Agent Analyst"
agent_owner: "Research Agent"
agent_scope: "pull"
analysis_scope: "strategy"
date_pulled: "2026-04-29"
domain: "market"
data_type: "agent_analysis_rollup"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
strategy_filter: "Simons Style Quant Momentum Breadth"
thesis_count: 1
symbol_count: 5
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
entropy_levels: ["mixed", "diffuse"]
tags: ["agent-analysis", "strategy-rollup", "market"]
---

## Rollup

| Symbol | Verdict | Confidence | Entropy | Status | Note |
| --- | --- | --- | --- | --- | --- |
| AAPL | BULLISH | 53% | mixed (0.55) | watch | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_AAPL]] |
| AMZN | BULLISH | 47% | mixed (0.62) | watch | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_AMZN]] |
| GOOGL | BULLISH | 51% | mixed (0.6) | watch | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_GOOGL]] |
| MSFT | NEUTRAL | 21% | diffuse (0.94) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_MSFT]] |
| NVDA | NEUTRAL | 35% | diffuse (0.82) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_NVDA]] |

## Source

- **System**: native vault agent puller, no LangChain
- **Strategies matched**: Simons Style Quant Momentum Breadth
- **Auto-pulled**: 2026-04-29
