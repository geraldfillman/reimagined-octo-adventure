// Neo4j load script for World_Machine inbox event graph (2026-05-25)
// Upload nodes.csv and relationships.csv somewhere Neo4j can read, then replace the two file:/// URLs if needed.
// Aura Data Importer users can upload the CSV files directly instead of running this script.

CREATE CONSTRAINT neo4j_node_id IF NOT EXISTS FOR (n:Neo4jImportNode) REQUIRE n.id IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'file:///nodes.csv' AS row
MERGE (n:Neo4jImportNode {id: row.id})
SET n.name = row.name,
    n.date = row.date,
    n.kind = row.kind,
    n.status = row.status,
    n.score = CASE row.score WHEN '' THEN null ELSE toFloat(row.score) END,
    n.route = row.route,
    n.source_count = CASE row.source_count WHEN '' THEN null ELSE toInteger(row.source_count) END,
    n.evidence_count = CASE row.evidence_count WHEN '' THEN null ELSE toInteger(row.evidence_count) END,
    n.summary = row.summary,
    n.vault = row.vault,
    n.relative_path = row.relative_path,
    n.obsidian_url = row.obsidian_url,
    n.command = row.command,
    n.tags = CASE row.tags WHEN '' THEN [] ELSE split(row.tags, ';') END,
    n.import_label = row.label
FOREACH (_ IN CASE row.label WHEN 'InboxBatch' THEN [1] ELSE [] END | SET n:InboxBatch)
FOREACH (_ IN CASE row.label WHEN 'VisualArtifact' THEN [1] ELSE [] END | SET n:VisualArtifact)
FOREACH (_ IN CASE row.label WHEN 'EventCandidate' THEN [1] ELSE [] END | SET n:EventCandidate)
FOREACH (_ IN CASE row.label WHEN 'Trend' THEN [1] ELSE [] END | SET n:Trend)
FOREACH (_ IN CASE row.label WHEN 'Scenario' THEN [1] ELSE [] END | SET n:Scenario)
FOREACH (_ IN CASE row.label WHEN 'ReviewRoute' THEN [1] ELSE [] END | SET n:ReviewRoute)
FOREACH (_ IN CASE row.label WHEN 'SourceItem' THEN [1] ELSE [] END | SET n:SourceItem)
FOREACH (_ IN CASE row.label WHEN 'Evidence' THEN [1] ELSE [] END | SET n:Evidence)
FOREACH (_ IN CASE row.label WHEN 'Command' THEN [1] ELSE [] END | SET n:Command);

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
MATCH (source:Neo4jImportNode {id: row.source_id})
MATCH (target:Neo4jImportNode {id: row.target_id})
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'HAS_ARTIFACT'
  MERGE (source)-[r:HAS_ARTIFACT {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'HAS_CANDIDATE'
  MERGE (source)-[r:HAS_CANDIDATE {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'SYNTHESIZES'
  MERGE (source)-[r:SYNTHESIZES {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'MAPS_TO_SCENARIO'
  MERGE (source)-[r:MAPS_TO_SCENARIO {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'ROUTES_TO'
  MERGE (source)-[r:ROUTES_TO {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'SUMMARIZES_SOURCE'
  MERGE (source)-[r:SUMMARIZES_SOURCE {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'SUPPORTED_BY'
  MERGE (source)-[r:SUPPORTED_BY {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'HAS_REVIEW_COMMAND'
  MERGE (source)-[r:HAS_REVIEW_COMMAND {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
};

// Starter exploration
MATCH p=(b:InboxBatch)-[:HAS_CANDIDATE]->(c:EventCandidate)-[*1..2]->()
RETURN p
LIMIT 150;
