---
title: Market Agent Sources
type: agent-dashboard
agent_owner: Market Agent
agent_scope: source
tags: [agents, market, sources]
last_updated: 2026-04-28
---

# Market Agent Sources

```dataview
TABLE category AS "Category", provider AS "Provider", status AS "Status", priority AS "Priority", integrated AS "Integrated", linked_puller AS "Puller"
FROM "01_Data_Sources/Market_Data" OR "01_Data_Sources/Prediction_Markets" OR "01_Data_Sources/Social_Sentiment"
SORT category ASC, priority DESC, file.name ASC
```
