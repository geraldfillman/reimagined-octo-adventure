---
title: Macro Agent Signals
type: agent-dashboard
agent_owner: Macro Agent
agent_scope: signal
tags: [agents, macro, signals]
last_updated: 2026-04-28
---

# Macro Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "macro") OR contains(tags, "rates") OR contains(tags, "inflation") OR contains(tags, "liquidity")
SORT date DESC, file.mtime DESC
LIMIT 80
```
