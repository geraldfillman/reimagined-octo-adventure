---
title: Biotech Agent Signals
type: agent-dashboard
agent_owner: Biotech Agent
agent_scope: signal
tags: [agents, biotech, signals]
last_updated: 2026-04-28
---

# Biotech Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "biotech") OR contains(tags, "healthcare") OR contains(tags, "fda") OR contains(tags, "clinical")
SORT date DESC, file.mtime DESC
LIMIT 80
```
