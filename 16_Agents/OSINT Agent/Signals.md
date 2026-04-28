---
title: OSINT Agent Signals
type: agent-dashboard
agent_owner: OSINT Agent
agent_scope: signal
tags: [agents, osint, signals]
last_updated: 2026-04-28
---

# OSINT Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "osint") OR contains(tags, "social") OR contains(tags, "geospatial") OR contains(tags, "breach")
SORT date DESC, file.mtime DESC
LIMIT 80
```
