---
title: Market Agent Signals
type: agent-dashboard
agent_owner: Market Agent
agent_scope: signal
tags: [agents, market, signals]
last_updated: 2026-04-28
---

# Market Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "market") OR contains(tags, "equities") OR contains(tags, "technical") OR contains(tags, "agent-analysis")
SORT date DESC, file.mtime DESC
LIMIT 80
```
