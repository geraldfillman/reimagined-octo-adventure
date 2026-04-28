---
title: VC Agent Sources
type: agent-dashboard
agent_owner: VC Agent
agent_scope: source
tags: [agents, vc, deal-flow, sources]
last_updated: 2026-04-28
---

# VC Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Private_Markets_VC"
SORT priority DESC, file.name ASC
```
