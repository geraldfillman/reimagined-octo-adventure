---
title: News Agent Signals
type: agent-dashboard
agent_owner: News Agent
agent_scope: signal
tags: [agents, news, media, signals]
last_updated: 2026-04-28
---

# News Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "news") OR contains(tags, "media") OR contains(tags, "sentiment") OR contains(tags, "reddit")
SORT date DESC, file.mtime DESC
LIMIT 80
```

## Narrative Momentum

```dataview
TABLE date_pulled AS "Date", source AS "Source", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/News" OR "05_Data_Pulls/social"
WHERE signal_status = "alert" OR signal_status = "critical"
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```
