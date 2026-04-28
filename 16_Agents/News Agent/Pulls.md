---
title: News Agent Pulls
type: agent-dashboard
agent_owner: News Agent
agent_scope: pull
tags: [agents, news, media, pulls]
last_updated: 2026-04-28
---

# News Agent Pulls

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", source AS "Source", signals AS "Signals"
FROM "05_Data_Pulls/News"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Reddit Sentiment

```dataview
TABLE date_pulled AS "Date", source AS "Source", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/social"
WHERE contains(tags, "reddit") OR contains(tags, "news") OR contains(tags, "sentiment")
SORT date_pulled DESC, file.mtime DESC
LIMIT 40
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", source AS "Source", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/News" OR "05_Data_Pulls/social"
WHERE signal_status != null AND signal_status != "clear"
SORT date_pulled DESC, file.mtime DESC
LIMIT 30
```
