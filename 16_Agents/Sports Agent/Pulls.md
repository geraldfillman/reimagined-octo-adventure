---
title: Sports Agent Pulls
type: agent-dashboard
agent_owner: Sports Agent
agent_scope: pull
tags: [agents, sports, pulls]
last_updated: 2026-04-28
---

# Sports Agent Pulls

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", sport AS "Sport", event_date AS "Event Date"
FROM "05_Data_Pulls/Sports"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", sport AS "Sport", event_date AS "Event", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Sports"
WHERE signal_status != null AND signal_status != "clear"
SORT date_pulled DESC, file.mtime DESC
LIMIT 40
```

## Calibration & Backtest

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", sport AS "Sport", signals AS "Signals"
FROM "05_Data_Pulls/Sports"
WHERE contains(data_type, "calibration") OR contains(data_type, "backtest")
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```
