---
title: News Agent Sources
type: agent-dashboard
agent_owner: News Agent
agent_scope: source
tags: [agents, news, media, sources]
last_updated: 2026-04-28
---

# News Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/News_Media"
SORT priority DESC, file.name ASC
```
