---
title: Housing Agent Signals
type: agent-dashboard
agent_owner: Housing Agent
agent_scope: signal
tags: [agents, housing, signals]
last_updated: 2026-04-28
---

# Housing Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "housing") OR contains(tags, "real-estate") OR contains(tags, "mortgage")
SORT date DESC, file.mtime DESC
LIMIT 80
```
