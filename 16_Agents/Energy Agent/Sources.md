---
title: Energy Agent Sources
type: agent-dashboard
agent_owner: Energy Agent
agent_scope: source
tags: [agents, energy, sources]
last_updated: 2026-04-28
---

# Energy Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Climate_Energy" OR "01_Data_Sources/Supply_Chain_Trade"
SORT category ASC, priority DESC, file.name ASC
```
