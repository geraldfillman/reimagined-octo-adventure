---
title: OSINT Agent Pulls
type: agent-dashboard
agent_owner: OSINT Agent
agent_scope: pull
tags: [agents, osint, pulls]
last_updated: 2026-04-28
---

# OSINT Agent Pulls

```dataview
TABLE date_pulled AS "Date", source AS "Source", data_type AS "Type", signal_status AS "Status", target AS "Target"
FROM "05_Data_Pulls/osint" OR "05_Data_Pulls/social"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", source AS "Source", signal_status AS "Status", signals AS "Signals", target AS "Target"
FROM "05_Data_Pulls/osint" OR "05_Data_Pulls/social"
WHERE signal_status != null AND signal_status != "clear"
SORT date_pulled DESC, file.mtime DESC
LIMIT 50
```
