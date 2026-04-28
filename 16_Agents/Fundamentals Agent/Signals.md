---
title: Fundamentals Agent Signals
type: agent-dashboard
agent_owner: Fundamentals Agent
agent_scope: signal
tags: [agents, fundamentals, signals]
last_updated: 2026-04-28
---

# Fundamentals Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "fundamentals") OR contains(tags, "dilution") OR contains(tags, "filing") OR contains(tags, "company-risk")
SORT date DESC, file.mtime DESC
LIMIT 80
```
