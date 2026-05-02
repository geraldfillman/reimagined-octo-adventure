---
title: Research Agent Investment Strategies
type: agent-dashboard
agent_owner: Research Agent
agent_scope: dashboard
tags: [agents, research, strategy, investment-strategies]
last_updated: 2026-04-28
---

# Research Agent Investment Strategies

Purpose: A strategy lab for investor-style, factor-style, and paper-derived baskets that need repeatable testing before promotion into active thesis workflow.

Entropy monitoring guide: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]]

## Strategy Registry

```dataview
TABLE status AS "Status", conviction AS "Conviction", allocation_priority AS "Priority", fmp_primary_technical_status AS "Tape"
FROM "10_Theses/Baskets"
WHERE contains(tags, "strategy")
SORT allocation_rank ASC, file.name ASC
```

## Recent Strategy Agent Tests

```dataview
TABLE date_pulled AS "Date", analysis_scope AS "Scope", strategy_filter AS "Strategy", entropy_levels AS "Entropy", signal_status AS "Status"
FROM "05_Data_Pulls/Theses"
WHERE contains(tags, "strategy-rollup") OR analysis_scope = "strategy"
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```

## Strategy Pull Commands

```powershell
node run.mjs pull entropy-monitor
node run.mjs pull entropy-monitor --backtest
node run.mjs pull agent-analyst --strategy "SPY QQQ Entropy Expansion Monitor" --agents price,risk,microstructure,macro --skip-llm
node run.mjs pull agent-analyst --strategy "Simons Style Quant Momentum Breadth" --limit 5 --skip-llm
node run.mjs pull agent-analyst --all-strategies --limit 12 --skip-llm
node run.mjs pull agent-analyst --all-strategies --agents price,risk,microstructure,fundamentals --skip-llm
```

## New Strategy Intake

Use [[03_Templates/Investment Strategy Basket]] for any new strategy. Keep it in `10_Theses/Baskets/`, tag it with `strategy`, and make `core_entities` ticker-linked so `agent-analyst` and FMP watchlists can reuse it.
