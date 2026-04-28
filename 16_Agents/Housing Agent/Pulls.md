---
title: Housing Agent Pulls
type: agent-dashboard
agent_owner: Housing Agent
agent_scope: pull
tags: [agents, housing, pulls]
last_updated: 2026-04-28
---

# Housing Agent Pulls

```dataview
TABLE date_pulled AS "Date", source AS "Source", data_type AS "Type", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Housing"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```
