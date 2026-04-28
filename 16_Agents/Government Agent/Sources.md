---
title: Government Agent Sources
type: agent-dashboard
agent_owner: Government Agent
agent_scope: source
tags: [agents, government, sources]
last_updated: 2026-04-28
---

# Government Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Government_Contracts" OR "01_Data_Sources/Legal_Courts"
SORT category ASC, priority DESC, file.name ASC
```
