# Neo4j Inbox Event Graph Export - 2026-05-25

This export is built from:

- Source artifact: `C:\Users\CaveUser\Documents\Obsidian Vault\World_Machine\Reports\System\event_connections\2026-05-25_Inbox_Event_Connections.html`
- Nodes: `82`
- Relationships: `155`

## Files

- `nodes.csv` - one node table for Neo4j Data Importer.
- `relationships.csv` - one relationship table with `source_id` and `target_id`.
- `inbox_event_graph.json` - detailed graph data with sample queries.
- `load_inbox_event_graph.cypher` - Cypher loader for environments that can read CSV files.
- `data-importer/` - split node-label and relationship-type CSVs for the visual Neo4j Data Importer.

## Suggested Data Importer Mapping

Fastest visual path: upload the split files in `data-importer/`. Each `nodes_*.csv` file maps to its matching node label. Each `rel_*.csv` file maps to its matching relationship type. Use `id` as the node key, and map relationship `source_id` / `target_id` to node `id`.

Alternative compact path: upload `nodes.csv` as one generic node table and `relationships.csv` as one relationship table. Use `label` and `type` as guide columns while mapping.

Neo4j Aura Data Importer is CSV-oriented, while `LOAD CSV` can also load small and medium CSV datasets when the files are reachable by the database.

## Starter Queries

```cypher
MATCH p=(b:InboxBatch)-[:HAS_CANDIDATE]->(c:EventCandidate)-[*1..2]->()
RETURN p
LIMIT 150;
```

```cypher
MATCH (c:EventCandidate)-[:SUPPORTED_BY]->(e:Evidence)
RETURN c.name, c.status, collect(e.name) AS evidence
ORDER BY c.status, c.score DESC;
```

```cypher
MATCH (c:EventCandidate)-[:MAPS_TO_SCENARIO]->(s:Scenario)
RETURN s.name, collect(c.name) AS candidates, count(*) AS candidate_count
ORDER BY candidate_count DESC;
```

```cypher
MATCH (c:EventCandidate)-[:HAS_REVIEW_COMMAND]->(cmd:Command)
RETURN c.name, collect(cmd.command) AS dry_run_commands;
```

Local path:

`C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\99_System\exports\neo4j\inbox-event-connections-2026-05-25`
