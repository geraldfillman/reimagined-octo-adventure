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
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_MACRO_BULLISH"]
strategy_filter: "SPY QQQ Entropy Expansion Monitor"
thesis_count: 1
symbol_count: 2
agent_names: ["price", "risk", "microstructure", "macro"]
entropy_levels: ["ordered"]
tags: ["agent-analysis", "strategy-rollup", "market"]
---

## Rollup

| Symbol | Verdict | Confidence | Entropy | Status | Note |
| --- | --- | --- | --- | --- | --- |
| SPY | BULLISH | 70% | ordered (0.36) | watch | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_SPY]] |
| QQQ | BULLISH | 71% | ordered (0.36) | watch | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_QQQ]] |

## Source

- **System**: native vault agent puller, no LangChain
- **Strategies matched**: SPY QQQ Entropy Expansion Monitor
- **Auto-pulled**: 2026-04-29
