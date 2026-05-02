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
signal_status: "alert"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
thesis_count: 7
symbol_count: 12
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
entropy_levels: ["mixed", "diffuse", "compressed"]
tags: ["agent-analysis", "strategy-rollup", "market"]
---

## Rollup

| Symbol | Verdict | Confidence | Entropy | Status | Note |
| --- | --- | --- | --- | --- | --- |
| AAPL | BULLISH | 53% | mixed (0.55) | watch | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_AAPL]] |
| AXP | NEUTRAL | 22% | diffuse (0.99) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_AXP]] |
| BRK_B | NEUTRAL | 22% | mixed (0.58) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_BRK_B]] |
| KO | BULLISH | 76% | compressed (0.14) | alert | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_KO]] |
| GOLD | NEUTRAL | 17% | diffuse (0.9) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_GOLD]] |
| NEM | NEUTRAL | 25% | diffuse (0.9) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_NEM]] |
| WPM | NEUTRAL | 14% | diffuse (0.9) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_WPM]] |
| XOM | NEUTRAL | 39% | mixed (0.63) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_XOM]] |
| NVDA | NEUTRAL | 36% | diffuse (0.82) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_NVDA]] |
| PLTR | NEUTRAL | 24% | diffuse (0.96) | clear | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_PLTR]] |
| ETN | BULLISH | 49% | mixed (0.61) | watch | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_ETN]] |
| GOOGL | BULLISH | 51% | mixed (0.6) | watch | [[05_Data_Pulls/Market/2026-04-29_Agent_Analysis_GOOGL]] |

## Source

- **System**: native vault agent puller, no LangChain
- **Strategies matched**: Buffett Style Quality Compounders, Dalio Style All-Weather Hard Assets, Druckenmiller Style Secular Trend Leaders, Graham Style Deep Value Re-Rating, Lynch Style GARP Leaders, Simons Style Quant Momentum Breadth, SPY QQQ Entropy Expansion Monitor
- **Auto-pulled**: 2026-04-29
