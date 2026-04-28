---
title: Fundamentals Agent Sources
type: agent-dashboard
agent_owner: Fundamentals Agent
agent_scope: source
tags: [agents, fundamentals, sources]
last_updated: 2026-04-28
---

# Fundamentals Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Fundamentals" OR "01_Data_Sources/Private_Markets_VC"
SORT category ASC, priority DESC, file.name ASC
```
