---
tags: [dashboard, graph, infranodus]
---

# InfraNodus Measurements

Use this dashboard as the entry point for graph measurement work in the vault. For setup and interpretation rules, see [[InfraNodus Graph Measurements]]. Capture findings with the `Graph Session` template.

## Recommended Scopes

| Scope | Open in InfraNodus | Best modes | Main question |
|-------|--------------------|------------|---------------|
| `08_Entities/` | Folder | Topics, Gaps | Which assets cluster together, and which bridges are missing? |
| `09_Macro/` | Folder | Topics, Concepts | Are regimes and indicators forming one system or several islands? |
| `10_Theses/` | Folder | Topics, Gaps | Which theses overlap, and which themes need bridge notes? |
| `05_Data_Pulls/<domain>/` | Folder | Trends, Topics | What changed inside one evidence stream recently? |
| `01_Data_Sources/` | Folder | Topics, Gaps | Where does the source catalog overlap, and where are the blind spots? |

## Hub Candidates

```dataview
TABLE WITHOUT ID
  file.link AS "Node",
  node_type AS "Type",
  length(bullish_drivers) AS "Bull",
  length(bearish_drivers) AS "Bear",
  length(related_entities) AS "Related"
FROM "08_Entities" OR "09_Macro" OR "10_Theses"
WHERE node_type AND (length(bullish_drivers) > 0 OR length(bearish_drivers) > 0 OR length(related_entities) > 0)
SORT length(related_entities) DESC, length(bullish_drivers) DESC, length(bearish_drivers) DESC
LIMIT 25
```

## Bridge Candidate Theses

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  length(core_entities) AS "Core",
  length(supporting_regimes) AS "Regimes",
  length(key_indicators) AS "Indicators"
FROM "10_Theses"
WHERE length(core_entities) > 1 OR length(supporting_regimes) > 1 OR length(key_indicators) > 1
SORT length(core_entities) DESC, length(supporting_regimes) DESC, length(key_indicators) DESC
LIMIT 20
```

## Low Connectivity Queue

```dataview
TABLE WITHOUT ID
  file.link AS "Node",
  node_type AS "Type"
FROM "08_Entities" OR "09_Macro" OR "10_Theses"
WHERE node_type AND length(bullish_drivers) = 0 AND length(bearish_drivers) = 0 AND length(related_entities) = 0
SORT node_type ASC, file.name ASC
```

## Recent Signal-Rich Pulls

```dataview
TABLE WITHOUT ID
  file.link AS "Pull",
  domain AS "Domain",
  source AS "Source",
  signal_status AS "Signal",
  date_pulled AS "Date"
FROM "05_Data_Pulls"
WHERE signal_status = "critical" OR signal_status = "alert" OR signal_status = "watch"
SORT date_pulled DESC
LIMIT 20
```

## Recent Graph Sessions

```dataview
TABLE WITHOUT ID
  file.link AS "Session",
  scope AS "Scope",
  cluster_count AS "Topics",
  gap_count AS "Gaps",
  date AS "Date"
FROM "07_Playbooks/Graph_Sessions"
SORT date DESC, file.name DESC
LIMIT 10
```

## Working Rules

- Start in `topics`, move to `gaps`, then check `graph` for structural sanity.
- Measure one folder at a time. Use a thesis note when you need a cross-folder graph.
- Save takeaways in a Graph Session note instead of leaving them only in the plugin view.
- Favor notes with explicit `[[Wiki Links]]`; InfraNodus reads those better than implied relationships.
