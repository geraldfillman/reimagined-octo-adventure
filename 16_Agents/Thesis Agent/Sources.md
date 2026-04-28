---
title: Thesis Agent Sources
type: agent-dashboard
agent_owner: Thesis Agent
agent_scope: source
tags: [agents, thesis, sources]
last_updated: 2026-04-28
---

# Thesis Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", linked_puller AS "Puller"
FROM "01_Data_Sources"
WHERE contains(tags, "thesis") OR contains(best_use_cases, "thesis") OR contains(notes, "thesis")
SORT priority DESC, category ASC, file.name ASC
```
