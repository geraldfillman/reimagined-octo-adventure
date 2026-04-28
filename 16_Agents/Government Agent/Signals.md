---
title: Government Agent Signals
type: agent-dashboard
agent_owner: Government Agent
agent_scope: signal
tags: [agents, government, signals]
last_updated: 2026-04-28
---

# Government Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "government") OR contains(tags, "contracts") OR contains(tags, "sec") OR contains(tags, "fema") OR contains(tags, "regulatory")
SORT date DESC, file.mtime DESC
LIMIT 80
```
