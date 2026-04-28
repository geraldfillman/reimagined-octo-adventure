---
title: Macro Agent Sources
type: agent-dashboard
agent_owner: Macro Agent
agent_scope: source
tags: [agents, macro, sources]
last_updated: 2026-04-28
---

# Macro Agent Sources

```dataview
TABLE provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Macro"
SORT priority DESC, file.name ASC
```
