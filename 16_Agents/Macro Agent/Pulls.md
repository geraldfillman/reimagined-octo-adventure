---
title: Macro Agent Pulls
type: agent-dashboard
agent_owner: Macro Agent
agent_scope: pull
tags: [agents, macro, pulls]
last_updated: 2026-04-28
---

# Macro Agent Pulls

```dataview
TABLE date_pulled AS "Date", source AS "Source", data_type AS "Type", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Macro"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", source AS "Source", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Macro"
WHERE signal_status != null AND signal_status != "clear"
SORT date_pulled DESC, file.mtime DESC
LIMIT 50
```
