---
title: Thesis Agent Pulls
type: agent-dashboard
agent_owner: Thesis Agent
agent_scope: pull
tags: [agents, thesis, pulls]
last_updated: 2026-04-28
---

# Thesis Agent Pulls

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", thesis_name AS "Thesis", final_verdict AS "Verdict"
FROM "05_Data_Pulls/Theses"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Active Theses

```dataview
TABLE conviction AS "Conviction", monitor_status AS "Monitor", allocation_priority AS "Allocation", fmp_last_sync AS "FMP Sync"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses"
SORT allocation_priority DESC, conviction DESC, file.name ASC
```
