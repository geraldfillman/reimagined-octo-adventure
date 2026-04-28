---
title: Sectors Agent Pulls
type: agent-dashboard
agent_owner: Sectors Agent
agent_scope: pull
tags: [agents, sectors, pulls]
last_updated: 2026-04-28
---

# Sectors Agent Pulls

```dataview
TABLE date_pulled AS "Date", source AS "Source", data_type AS "Type", signal_status AS "Status", sector AS "Sector"
FROM "05_Data_Pulls/Sectors"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```
