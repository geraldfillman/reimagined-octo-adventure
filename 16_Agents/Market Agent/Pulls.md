---
title: Market Agent Pulls
type: agent-dashboard
agent_owner: Market Agent
agent_scope: pull
tags: [agents, market, pulls]
last_updated: 2026-04-28
---

# Market Agent Pulls

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", final_verdict AS "Verdict", symbol AS "Symbol"
FROM "05_Data_Pulls/Market"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", signals AS "Signals", symbol AS "Symbol"
FROM "05_Data_Pulls/Market"
WHERE signal_status != null AND signal_status != "clear"
SORT date_pulled DESC, file.mtime DESC
LIMIT 50
```
