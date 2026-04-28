---
title: Sports Agent Signals
type: agent-dashboard
agent_owner: Sports Agent
agent_scope: signal
tags: [agents, sports, signals]
last_updated: 2026-04-28
---

# Sports Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "sports") OR contains(tags, "prediction") OR contains(tags, "calibration")
SORT date DESC, file.mtime DESC
LIMIT 80
```

## Pending Predictions

```dataview
TABLE date_pulled AS "Pull Date", sport AS "Sport", event_date AS "Event", selection AS "Selection", odds_american AS "Odds", model_edge AS "Edge", settlement_status AS "Status"
FROM "05_Data_Pulls/Sports"
WHERE data_type = "prediction" AND (settlement_status = null OR settlement_status = "pending")
SORT event_date ASC
LIMIT 50
```
