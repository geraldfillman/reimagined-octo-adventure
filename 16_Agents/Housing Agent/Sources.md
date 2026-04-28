---
title: Housing Agent Sources
type: agent-dashboard
agent_owner: Housing Agent
agent_scope: source
tags: [agents, housing, sources]
last_updated: 2026-04-28
---

# Housing Agent Sources

```dataview
TABLE provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Housing_Real_Estate"
SORT priority DESC, file.name ASC
```
