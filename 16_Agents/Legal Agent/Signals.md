---
title: Legal Agent Signals
type: agent-dashboard
agent_owner: Legal Agent
agent_scope: signal
tags: [agents, legal, regulatory, signals]
last_updated: 2026-04-28
---

# Legal Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "legal") OR contains(tags, "regulatory") OR contains(tags, "rulemaking") OR contains(tags, "faa") OR contains(tags, "court")
SORT date DESC, file.mtime DESC
LIMIT 80
```

## Regulatory Catalyst Watch

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Government"
WHERE (signal_status = "alert" OR signal_status = "critical" OR signal_status = "watch") AND (contains(tags, "legal") OR contains(tags, "rulemaking") OR contains(tags, "regulatory"))
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```
