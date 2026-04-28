---
title: Legal Agent Sources
type: agent-dashboard
agent_owner: Legal Agent
agent_scope: source
tags: [agents, legal, regulatory, sources]
last_updated: 2026-04-28
---

# Legal Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Legal_Courts"
SORT priority DESC, file.name ASC
```
