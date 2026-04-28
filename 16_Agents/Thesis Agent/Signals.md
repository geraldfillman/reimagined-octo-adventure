---
title: Thesis Agent Signals
type: agent-dashboard
agent_owner: Thesis Agent
agent_scope: signal
tags: [agents, thesis, signals]
last_updated: 2026-04-28
---

# Thesis Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", related_theses AS "Theses", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "thesis") OR contains(tags, "confirm") OR contains(tags, "contradict") OR contains(tags, "conviction")
SORT date DESC, file.mtime DESC
LIMIT 80
```
