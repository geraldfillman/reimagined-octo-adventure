---
title: Orchestrator Agent Sources
type: agent-dashboard
agent_owner: Orchestrator Agent
agent_scope: source
tags: [agents, orchestrator, sources]
last_updated: 2026-04-28
---

# Orchestrator Agent Sources

The Orchestrator does not own a dedicated data source category. It synthesises across all 15 domain agents. Sources below are the complete vault source inventory.

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources"
SORT category ASC, priority DESC, file.name ASC
```
