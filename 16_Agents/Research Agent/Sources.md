---
title: Research Agent Sources
type: agent-dashboard
agent_owner: Research Agent
agent_scope: source
tags: [agents, research, sources]
last_updated: 2026-04-28
---

# Research Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Frontier_Science" OR "01_Data_Sources/Developer_Code"
SORT category ASC, priority DESC, file.name ASC
```
