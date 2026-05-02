---
title: Orchestrator Agent Pulls
type: agent-dashboard
agent_owner: Orchestrator Agent
agent_scope: pull
tags: [agents, orchestrator, pulls]
last_updated: 2026-04-28
---

# Orchestrator Agent Pulls

## Priority Queue

All critical and alert items across every domain — act on these first.

```dataview
TABLE WITHOUT ID
  choice(signal_status = "critical", "🔴",
    choice(signal_status = "alert", "🟠", "🟡")) AS "",
  file.link AS "Report",
  domain AS "Domain",
  date_pulled AS "Date",
  choice((date(today) - date_pulled) > dur("30 days"), "🔴 stale",
    choice((date(today) - date_pulled) > dur("7 days"), "⚠️ aging", "")) AS "Age",
  signals AS "Signals"
FROM "05_Data_Pulls"
WHERE signal_status = "critical" OR signal_status = "alert"
SORT choice(signal_status = "critical", 0, 1) ASC, date_pulled DESC
LIMIT 40
```

## Watch Queue

Active watch items from the past 14 days.

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  domain AS "Domain",
  date_pulled AS "Date",
  signals AS "Signals"
FROM "05_Data_Pulls"
WHERE signal_status = "watch" AND date_pulled >= (date(today) - dur("14 days"))
SORT date_pulled DESC
LIMIT 25
```

## Opportunity Viewpoints

Cross-source ranked investment research from evidence overlap.

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls"
WHERE contains(data_type, "opportunity") OR contains(tags, "opportunity-viewpoints") OR contains(tags, "viewpoints")
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```

## Agent Analysis

Thesis-wide multi-agent market intelligence.

```dataview
TABLE date_pulled AS "Date", symbol AS "Symbol", final_verdict AS "Verdict", entropy_level AS "Entropy", microstructure_entropy_level AS "Flow", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Market"
WHERE contains(data_type, "agent-analysis") OR contains(tags, "agent-analysis") OR contains(tags, "agent-analyst")
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```

## Entropy Compression Queue

Low entropy means the agent stack or order-flow proxy is unusually ordered. Per the entropy paper, treat this as move-risk timing evidence, not directional certainty.

```dataview
TABLE date_pulled AS "Date", symbol AS "Symbol", final_verdict AS "Verdict", entropy_score AS "Agent H", microstructure_entropy_score AS "Flow H", signal_status AS "Status"
FROM "05_Data_Pulls/Market"
WHERE contains(tags, "agent-analysis") AND (entropy_level = "compressed" OR microstructure_entropy_level = "compressed")
SORT signal_status DESC, date_pulled DESC, entropy_score ASC
LIMIT 20
```

## SPY / QQQ Entropy Monitor

Shadow ledger for testing whether lower order-flow entropy precedes larger absolute moves.

```dataview
TABLE date_pulled AS "Date", symbols AS "Symbols", signal_status AS "Status", near_entropy_threshold AS "Near H", low_entropy_threshold AS "Low H", ledger_path AS "Ledger"
FROM "05_Data_Pulls/Market"
WHERE data_type = "entropy_monitor" OR data_type = "entropy_backtest" OR contains(tags, "entropy-monitor")
SORT date_pulled DESC, file.mtime DESC
LIMIT 10
```

## Disclosure Reality

Counterparty-confirmed high-conviction 8-K events.

```dataview
TABLE date_pulled AS "Date", ticker AS "Ticker", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls"
WHERE contains(data_type, "disclosure-reality") OR contains(tags, "disclosure-reality")
SORT date_pulled DESC, file.mtime DESC
LIMIT 10
```

## Backtest Results

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signals AS "Signals"
FROM "05_Data_Pulls/Backtest" OR "05_Data_Pulls/Orchestrator"
WHERE contains(data_type, "backtest") OR contains(tags, "backtest")
SORT date_pulled DESC, file.mtime DESC
LIMIT 15
```
