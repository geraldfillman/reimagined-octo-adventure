---
title: Fundamentals Agent Pulls
type: agent-dashboard
agent_owner: Fundamentals Agent
agent_scope: pull
tags: [agents, fundamentals, pulls]
last_updated: 2026-04-28
---

# Fundamentals Agent Pulls

```dataview
TABLE date_pulled AS "Date", source AS "Source", data_type AS "Type", signal_status AS "Status", symbol AS "Symbol"
FROM "05_Data_Pulls/Fundamentals"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", signals AS "Signals", symbol AS "Symbol"
FROM "05_Data_Pulls/Fundamentals"
WHERE signal_status != null AND signal_status != "clear"
SORT date_pulled DESC, file.mtime DESC
LIMIT 50
```
