---
title: Energy Agent Signals
type: agent-dashboard
agent_owner: Energy Agent
agent_scope: signal
tags: [agents, energy, signals]
last_updated: 2026-04-28
---

# Energy Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "energy") OR contains(tags, "grid") OR contains(tags, "power") OR contains(tags, "climate")
SORT date DESC, file.mtime DESC
LIMIT 80
```
