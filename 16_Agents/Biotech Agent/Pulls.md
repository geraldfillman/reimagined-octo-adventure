---
title: Biotech Agent Pulls
type: agent-dashboard
agent_owner: Biotech Agent
agent_scope: pull
tags: [agents, biotech, pulls]
last_updated: 2026-04-28
---

# Biotech Agent Pulls

```dataview
TABLE date_pulled AS "Date", source AS "Source", data_type AS "Type", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Biotech"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```
