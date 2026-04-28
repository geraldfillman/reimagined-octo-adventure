---
title: Sectors Agent Signals
type: agent-dashboard
agent_owner: Sectors Agent
agent_scope: signal
tags: [agents, sectors, signals]
last_updated: 2026-04-28
---

# Sectors Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", related_theses AS "Theses", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "sector") OR contains(tags, "sectors") OR contains(tags, "confirm") OR contains(tags, "contradict")
SORT date DESC, file.mtime DESC
LIMIT 80
```
