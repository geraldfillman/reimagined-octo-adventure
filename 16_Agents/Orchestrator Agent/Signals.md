---
title: Orchestrator Agent Signals
type: agent-dashboard
agent_owner: Orchestrator Agent
agent_scope: signal
tags: [agents, orchestrator, signals]
last_updated: 2026-04-28
---

# Orchestrator Agent Signals

## Cross-Agent Signal Board

All signals across all agents — single source of truth.

```dataview
TABLE WITHOUT ID
  choice(severity = "critical", "🔴",
    choice(severity = "alert", "🟠",
      choice(severity = "watch", "🟡", "⚪"))) AS "",
  file.link AS "Signal",
  signal_id AS "ID",
  source AS "Source",
  date AS "Date"
FROM "06_Signals"
SORT choice(severity = "critical", 0, choice(severity = "alert", 1, 2)) ASC, date DESC
LIMIT 60
```

## Thesis Confirmation Queue

Signals that directly confirm or challenge an active thesis position.

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "thesis") OR contains(tags, "confirm") OR contains(tags, "catalyst")
SORT date DESC, file.mtime DESC
LIMIT 30
```

## Requires Action

Pulls with elevated signal status that haven't been linked to a thesis yet.

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  domain AS "Domain",
  date_pulled AS "Date",
  signals AS "Signals"
FROM "05_Data_Pulls"
WHERE (signal_status = "critical" OR signal_status = "alert") AND (related_theses = null OR related_theses = "")
SORT date_pulled DESC
LIMIT 20
```
