---
title: Sectors Agent Sources
type: agent-dashboard
agent_owner: Sectors Agent
agent_scope: source
tags: [agents, sectors, sources]
last_updated: 2026-04-28
---

# Sectors Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", linked_puller AS "Puller"
FROM "01_Data_Sources"
WHERE contains(tags, "sector") OR contains(provides, "sector") OR contains(best_use_cases, "sector")
SORT priority DESC, category ASC, file.name ASC
```
