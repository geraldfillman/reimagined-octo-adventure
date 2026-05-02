---
title: Research Agent Pulls
type: agent-dashboard
agent_owner: Research Agent
agent_scope: pull
tags: [agents, research, pulls]
last_updated: 2026-04-28
---

# Research Agent Pulls

```dataview
TABLE date_pulled AS "Date", source AS "Source", data_type AS "Type", signal_status AS "Status", topic AS "Topic"
FROM "05_Data_Pulls/Research"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", source AS "Source", topic AS "Topic", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Research" OR "05_Data_Pulls/Biotech"
WHERE signal_status != null AND signal_status != "clear"
SORT date_pulled DESC, file.mtime DESC
LIMIT 30
```

## Thesis-Linked Research

Research pulls explicitly mapped to active investment theses via `related_theses` frontmatter.

```dataview
TABLE date_pulled AS "Date", source AS "Source", topic AS "Topic", related_theses AS "Theses", signal_status AS "Status"
FROM "05_Data_Pulls/Research" OR "05_Data_Pulls/Biotech" OR "05_Data_Pulls/Government"
WHERE related_theses != null
SORT date_pulled DESC, file.mtime DESC
LIMIT 60
```

## Investment Strategy Tests

```dataview
TABLE date_pulled AS "Date", strategy_filter AS "Strategy", entropy_levels AS "Entropy", signal_status AS "Status", symbol_count AS "Symbols"
FROM "05_Data_Pulls/Theses"
WHERE analysis_scope = "strategy" OR contains(tags, "strategy-rollup")
SORT date_pulled DESC, file.mtime DESC
LIMIT 30
```

## Strategy Basket Registry

```dataview
TABLE status AS "Status", conviction AS "Conviction", allocation_priority AS "Priority", fmp_primary_technical_status AS "Tape"
FROM "10_Theses/Baskets"
WHERE contains(tags, "strategy")
SORT allocation_rank ASC, file.name ASC
```

## Life Sciences

```dataview
TABLE date_pulled AS "Date", source AS "Source", topic AS "Topic", signal_status AS "Status"
FROM "05_Data_Pulls/Research" OR "05_Data_Pulls/Biotech"
WHERE contains(tags, "biotech") OR contains(tags, "amr") OR contains(tags, "glp1") OR contains(tags, "longevity") OR contains(tags, "psychedelics") OR contains(tags, "alzheimers") OR contains(tags, "geneediting") OR contains(tags, "oncology")
SORT date_pulled DESC, file.mtime DESC
LIMIT 30
```

## Defense, Drones & Frontier Tech

```dataview
TABLE date_pulled AS "Date", source AS "Source", topic AS "Topic", signal_status AS "Status"
FROM "05_Data_Pulls/Research"
WHERE contains(tags, "defense") OR contains(tags, "drones") OR contains(tags, "quantum") OR contains(tags, "humanoid") OR contains(tags, "space") OR contains(tags, "nuclear") OR contains(tags, "robotics")
SORT date_pulled DESC, file.mtime DESC
LIMIT 30
```
