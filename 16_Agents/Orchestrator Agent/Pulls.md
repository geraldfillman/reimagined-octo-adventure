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
TABLE date_pulled AS "Date", ticker AS "Ticker", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Market"
WHERE contains(data_type, "agent-analysis") OR contains(tags, "agent-analysis") OR contains(tags, "agent-analyst")
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
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
TABLE date_pulled AS "Date", data_type AS "Type", sport AS "Sport", signals AS "Signals"
FROM "05_Data_Pulls/Sports" OR "05_Data_Pulls/Orchestrator"
WHERE contains(data_type, "backtest") OR contains(data_type, "calibration") OR contains(tags, "backtest") OR contains(tags, "quant")
SORT date_pulled DESC, file.mtime DESC
LIMIT 15
```
