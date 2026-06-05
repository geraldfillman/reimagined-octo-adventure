# Cypher Cheat Sheet: Connecting Vault Data

Use this with the imported blind-spot graph in Neo4j Browser.

```cypher
:use neo4j
```

## Orientation Queries

### Count the imported graph

```cypher
MATCH (n:BlindSpotNode)
WITH count(n) AS nodes
MATCH ()-[r]->()
WITH nodes, count(r) AS relationships
MATCH ()-[c:CANDIDATE_LINK]->()
RETURN nodes, relationships, count(c) AS candidateLinks;
```

### List labels and counts

```cypher
MATCH (n:BlindSpotNode)
UNWIND labels(n) AS label
RETURN label, count(*) AS count
ORDER BY count DESC, label;
```

### List concrete subnode shapes

```cypher
MATCH (n:BlindSpotNode)
RETURN labels(n) AS labels, count(*) AS count
ORDER BY count DESC, labels;
```

### List relationship types

```cypher
MATCH ()-[r]->()
RETURN type(r) AS relationshipType, count(*) AS count
ORDER BY count DESC, relationshipType;
```

### List domains

```cypher
MATCH (d:Domain)
RETURN d.name AS domain, d.id AS id,
       count { (:BlindSpotNode)-[:BELONGS_TO_DOMAIN]->(d) } AS inbound
ORDER BY inbound DESC, domain;
```

## Finding Nodes

### Find anything by name text

```cypher
MATCH (n:BlindSpotNode)
WHERE toLower(n.name) CONTAINS toLower($text)
   OR toLower(n.canonicalName) CONTAINS toLower($text)
RETURN n.id, labels(n) AS labels, n.name, n.domain, n.relativePath
ORDER BY n.name
LIMIT 50;
```

Example parameter:

```json
{ "text": "gold" }
```

### Find a stock by ticker

```cypher
MATCH (s:Stock)
WHERE toUpper(s.ticker) = toUpper($ticker)
   OR toUpper(s.symbol) = toUpper($ticker)
RETURN s.id, labels(s) AS labels, s.name, s.ticker, s.sector, s.relativePath;
```

Example parameter:

```json
{ "ticker": "NVDA" }
```

### Find a vault note by path fragment

```cypher
MATCH (n:VaultNote)
WHERE toLower(n.relativePath) CONTAINS toLower($pathFragment)
RETURN n.id, n.name, n.vault, n.relativePath, n.obsidianUrl
ORDER BY n.relativePath
LIMIT 50;
```

Example parameter:

```json
{ "pathFragment": "World_Machine/Macro" }
```

### Find nodes from a specific vault/folder

```cypher
MATCH (n:BlindSpotNode)
WHERE n.vault = $vault
  AND toLower(n.sourceFolder) CONTAINS toLower($folder)
RETURN labels(n) AS labels, n.id, n.name, n.sourceFolder, n.relativePath
ORDER BY n.sourceFolder, n.name
LIMIT 100;
```

Example parameter:

```json
{ "vault": "World_Machine", "folder": "Policy" }
```

## Inspecting Existing Connections

### Show a node neighborhood

```cypher
MATCH (n:BlindSpotNode {id: $id})
MATCH p=(n)-[r]-(m:BlindSpotNode)
RETURN p
LIMIT 100;
```

### Show a compact relationship table for one node

```cypher
MATCH (n:BlindSpotNode {id: $id})-[r]-(m:BlindSpotNode)
RETURN type(r) AS relationshipType,
       startNode(r).id AS fromId,
       startNode(r).name AS fromName,
       endNode(r).id AS toId,
       endNode(r).name AS toName,
       r.method AS method,
       r.weight AS weight,
       r.status AS status,
       r.reviewState AS reviewState,
       r.reason AS reason
ORDER BY relationshipType, toName
LIMIT 200;
```

### Trace a typed node back to its note

```cypher
MATCH (n:BlindSpotNode {id: $id})-[:DERIVED_FROM_NOTE]->(note:VaultNote)
RETURN n.id, n.name, labels(n) AS labels,
       note.name AS noteName,
       note.relativePath AS notePath,
       note.obsidianUrl AS obsidianUrl;
```

### Trace evidence to source definitions

```cypher
MATCH (e:EvidenceArtifact)-[r:SOURCED_FROM]->(source:SourceItem)
RETURN e.name AS evidence,
       labels(e) AS evidenceLabels,
       source.name AS source,
       labels(source) AS sourceLabels,
       r.method AS method,
       r.weight AS weight
ORDER BY evidence, source
LIMIT 100;
```

## Blind-Spot Review

### List candidate links needing review

```cypher
MATCH (a:BlindSpotNode)-[r:CANDIDATE_LINK]->(b:BlindSpotNode)
WHERE coalesce(r.reviewState, 'needs_review') = 'needs_review'
RETURN r.id AS candidateId,
       labels(a) AS sourceLabels,
       a.name AS source,
       a.id AS sourceId,
       labels(b) AS targetLabels,
       b.name AS target,
       b.id AS targetId,
       r.method AS method,
       r.reason AS reason,
       r.missingEvidence AS missingEvidence,
       r.weight AS weight
ORDER BY r.weight DESC, source, target
LIMIT 100;
```

### Candidate links by method

```cypher
MATCH ()-[r:CANDIDATE_LINK]->()
RETURN r.method AS method,
       r.reviewState AS reviewState,
       r.status AS status,
       count(*) AS count
ORDER BY count DESC, method;
```

### Candidate regime-to-stock gaps

```cypher
MATCH (regime:Regime)-[r:CANDIDATE_LINK]->(stock:Stock)
RETURN regime.name AS regime,
       stock.ticker AS ticker,
       stock.name AS stock,
       r.reason AS reason,
       r.missingEvidence AS missingEvidence,
       r.id AS candidateId
ORDER BY regime, ticker
LIMIT 100;
```

### Candidate news-to-regime gaps

```cypher
MATCH (news:NewsItem)-[r:CANDIDATE_LINK]->(regime:Regime)
RETURN news.name AS news,
       news.date AS date,
       regime.name AS regime,
       r.reason AS reason,
       r.missingEvidence AS missingEvidence,
       news.relativePath AS notePath
ORDER BY date DESC, news
LIMIT 100;
```

### Candidate policy-to-sector gaps

```cypher
MATCH (policy:PolicyAction)-[r:CANDIDATE_LINK]->(sector:Sector)
RETURN labels(policy) AS policyLabels,
       policy.name AS policy,
       sector.name AS sector,
       r.reason AS reason,
       r.missingEvidence AS missingEvidence,
       policy.relativePath AS policyPath
ORDER BY sector, policy
LIMIT 100;
```

## Creating Review-Safe Connections

These are write queries. Use them intentionally. The pattern is:

1. Keep `CANDIDATE_LINK` as the audit trail.
2. Add a confirmed relationship with a new deterministic ID.
3. Mark the candidate as promoted or rejected.

### Promote a candidate to `RELATED_TO`

```cypher
MATCH (a:BlindSpotNode)-[candidate:CANDIDATE_LINK {id: $candidateId}]->(b:BlindSpotNode)
MERGE (a)-[r:RELATED_TO {id: 'review:' + candidate.id + ':RELATED_TO'}]->(b)
SET r.source = 'human_review',
    r.method = 'candidate_promotion',
    r.weight = coalesce(candidate.weight, 1.0),
    r.firstSeen = coalesce(candidate.firstSeen, date().toString()),
    r.lastSeen = date().toString(),
    r.asOfDate = date().toString()
SET candidate.reviewState = 'promoted',
    candidate.status = 'promoted',
    candidate.lastSeen = date().toString()
RETURN a.name AS source, type(r) AS relationshipType, b.name AS target, candidate.reviewState AS reviewState;
```

Example parameter:

```json
{ "candidateId": "rel:example:CANDIDATE_LINK:example" }
```

### Promote a candidate regime-to-stock link to `INDICATES_REGIME`

Use this only when the stock or company behavior is evidence for a regime.

```cypher
MATCH (stock:Stock)-[candidate:CANDIDATE_LINK {id: $candidateId}]->(regime:Regime)
MERGE (stock)-[r:INDICATES_REGIME {id: 'review:' + candidate.id + ':INDICATES_REGIME'}]->(regime)
SET r.source = 'human_review',
    r.method = 'candidate_promotion',
    r.weight = coalesce(candidate.weight, 1.0),
    r.firstSeen = coalesce(candidate.firstSeen, date().toString()),
    r.lastSeen = date().toString(),
    r.asOfDate = date().toString()
SET candidate.reviewState = 'promoted',
    candidate.status = 'promoted',
    candidate.lastSeen = date().toString()
RETURN stock.ticker AS ticker, stock.name AS stock, regime.name AS regime;
```

If the imported candidate direction is `(:Regime)-[:CANDIDATE_LINK]->(:Stock)`, use:

```cypher
MATCH (regime:Regime)-[candidate:CANDIDATE_LINK {id: $candidateId}]->(stock:Stock)
MERGE (stock)-[r:INDICATES_REGIME {id: 'review:' + candidate.id + ':INDICATES_REGIME'}]->(regime)
SET r.source = 'human_review',
    r.method = 'candidate_promotion',
    r.weight = coalesce(candidate.weight, 1.0),
    r.firstSeen = coalesce(candidate.firstSeen, date().toString()),
    r.lastSeen = date().toString(),
    r.asOfDate = date().toString()
SET candidate.reviewState = 'promoted',
    candidate.status = 'promoted',
    candidate.lastSeen = date().toString()
RETURN stock.ticker AS ticker, stock.name AS stock, regime.name AS regime;
```

### Promote a regime-to-sector edge

Use `FAVORS_SECTOR` or `HURTS_SECTOR` depending on the evidence.

```cypher
MATCH (regime:Regime)-[candidate:CANDIDATE_LINK {id: $candidateId}]->(sector:Sector)
MERGE (regime)-[r:FAVORS_SECTOR {id: 'review:' + candidate.id + ':FAVORS_SECTOR'}]->(sector)
SET r.source = 'human_review',
    r.method = 'candidate_promotion',
    r.weight = coalesce(candidate.weight, 1.0),
    r.firstSeen = coalesce(candidate.firstSeen, date().toString()),
    r.lastSeen = date().toString(),
    r.asOfDate = date().toString()
SET candidate.reviewState = 'promoted',
    candidate.status = 'promoted',
    candidate.lastSeen = date().toString()
RETURN regime.name AS regime, type(r) AS relationshipType, sector.name AS sector;
```

To create a headwind instead, change both instances of `FAVORS_SECTOR` to `HURTS_SECTOR`.

### Reject a candidate link

```cypher
MATCH ()-[candidate:CANDIDATE_LINK {id: $candidateId}]->()
SET candidate.reviewState = 'rejected',
    candidate.status = 'rejected',
    candidate.reason = coalesce($reason, candidate.reason),
    candidate.lastSeen = date().toString()
RETURN candidate.id AS candidateId,
       candidate.reviewState AS reviewState,
       candidate.reason AS reason;
```

Example parameter:

```json
{
  "candidateId": "rel:example:CANDIDATE_LINK:example",
  "reason": "Reviewed source note; no market-impact evidence found."
}
```

## Connecting Vault Notes to Concepts

### Add a reviewed mention from a note to a concept

Use when a vault note clearly mentions or discusses an existing graph concept.

```cypher
MATCH (note:VaultNote {id: $noteId})
MATCH (concept:BlindSpotNode {id: $conceptId})
MERGE (note)-[r:MENTIONS {id: 'review:' + note.id + ':MENTIONS:' + concept.id}]->(concept)
SET r.source = 'human_review',
    r.method = 'manual_note_link',
    r.weight = coalesce($weight, 1.0),
    r.firstSeen = coalesce(r.firstSeen, date().toString()),
    r.lastSeen = date().toString(),
    r.asOfDate = date().toString()
RETURN note.name AS note, type(r) AS relationshipType, concept.name AS concept;
```

Example parameter:

```json
{
  "noteId": "world:note:example",
  "conceptId": "world:regime:example",
  "weight": 1.0
}
```

### Add a reviewed note-to-source relationship

```cypher
MATCH (note:VaultNote {id: $noteId})
MATCH (source:SourceItem {id: $sourceId})
MERGE (note)-[r:SOURCED_FROM {id: 'review:' + note.id + ':SOURCED_FROM:' + source.id}]->(source)
SET r.source = 'human_review',
    r.method = 'manual_source_link',
    r.weight = coalesce($weight, 1.0),
    r.firstSeen = coalesce(r.firstSeen, date().toString()),
    r.lastSeen = date().toString(),
    r.asOfDate = date().toString()
RETURN note.name AS note, type(r) AS relationshipType, source.name AS source;
```

## Creating New Concepts From Vault Review

Prefer linking to existing nodes. Create a new concept only after search confirms it does not already exist.

### Create a reviewed entity placeholder

```cypher
MERGE (entity:BlindSpotNode:Entity {id: $id})
SET entity.name = $name,
    entity.canonicalName = coalesce($canonicalName, $name),
    entity.label = $name,
    entity.nodeType = 'entity',
    entity.domain = coalesce($domain, 'Entities'),
    entity.subdomain = $subdomain,
    entity.tags = coalesce($tags, []),
    entity.source = 'human_review',
    entity.status = 'reviewed',
    entity.asOfDate = date().toString()
WITH entity
MATCH (domain:Domain {id: $domainId})
MERGE (entity)-[r:BELONGS_TO_DOMAIN {id: 'review:' + entity.id + ':BELONGS_TO_DOMAIN:' + domain.id}]->(domain)
SET r.source = 'human_review',
    r.method = 'manual_concept_create',
    r.asOfDate = date().toString()
RETURN entity.id, entity.name, labels(entity) AS labels, domain.name AS domain;
```

Example parameter:

```json
{
  "id": "review:entity:rare-earth-processing",
  "name": "Rare Earth Processing",
  "canonicalName": "Rare Earth Processing",
  "domain": "Entities",
  "subdomain": "Industries",
  "domainId": "domain:entities",
  "tags": ["reviewed", "manual"]
}
```

### Create a reviewed regime placeholder

```cypher
MERGE (regime:BlindSpotNode:Regime {id: $id})
SET regime.name = $name,
    regime.canonicalName = coalesce($canonicalName, $name),
    regime.label = $name,
    regime.nodeType = 'regime',
    regime.domain = 'Macro',
    regime.subdomain = coalesce($subdomain, 'Regimes'),
    regime.tags = coalesce($tags, []),
    regime.source = 'human_review',
    regime.status = 'reviewed',
    regime.confidence = coalesce($confidence, 'watch'),
    regime.asOfDate = date().toString()
WITH regime
MATCH (domain:Domain {id: 'domain:macro'})
MERGE (regime)-[r:BELONGS_TO_DOMAIN {id: 'review:' + regime.id + ':BELONGS_TO_DOMAIN:domain:macro'}]->(domain)
SET r.source = 'human_review',
    r.method = 'manual_regime_create',
    r.asOfDate = date().toString()
RETURN regime.id, regime.name, labels(regime) AS labels;
```

## Common Blind-Spot Discovery Queries

### Stocks with sector but no regime link

```cypher
MATCH (stock:Stock)
WHERE stock.sector IS NOT NULL
  AND NOT (stock)-[:INDICATES_REGIME]->(:Regime)
  AND NOT (:Regime)-[:CANDIDATE_LINK]->(stock)
RETURN stock.ticker, stock.name, stock.sector, stock.relativePath
ORDER BY stock.sector, stock.ticker
LIMIT 100;
```

### Regimes without sector impact edges

```cypher
MATCH (regime:Regime)
WHERE NOT (regime)-[:FAVORS_SECTOR|HURTS_SECTOR]->(:Sector)
RETURN regime.id, regime.name, regime.status, regime.confidence, regime.relativePath
ORDER BY regime.name;
```

### Policy notes with no market-impact edge

```cypher
MATCH (policy:PolicyAction)
WHERE NOT (policy)-[:TARGETS_SECTOR]->(:Sector)
  AND NOT (policy)-[:CANDIDATE_LINK]->(:Sector)
RETURN labels(policy) AS labels,
       policy.id,
       policy.name,
       policy.relativePath,
       policy.sector,
       policy.jurisdiction
ORDER BY policy.name;
```

### Theses missing fresh evidence links

```cypher
MATCH (thesis:Thesis)
WHERE NOT (thesis)<-[:MENTIONS]-(:EvidenceArtifact)
  AND NOT (thesis)-[:CANDIDATE_LINK]->(:Domain {id: 'domain:evidence'})
RETURN thesis.id, thesis.name, thesis.conviction, thesis.timeframe, thesis.relativePath
ORDER BY thesis.name;
```

### High-degree concepts worth reviewing

```cypher
MATCH (n:BlindSpotNode)
WITH n, count { (n)--() } AS degree
WHERE degree >= $minimumDegree
RETURN labels(n) AS labels, n.id, n.name, n.domain, degree
ORDER BY degree DESC, n.name
LIMIT 100;
```

Example parameter:

```json
{ "minimumDegree": 25 }
```

## Starter Graph Views

### Candidate-link graph

```cypher
MATCH p=(a:BlindSpotNode)-[:CANDIDATE_LINK]->(b:BlindSpotNode)
RETURN p
LIMIT 100;
```

### Regime-to-sector-to-stock graph

```cypher
MATCH p=(regime:Regime)-[:FAVORS_SECTOR|HURTS_SECTOR]->(:Sector)-[:AFFECTS_STOCK]->(:Stock)
RETURN p
LIMIT 100;
```

### Thesis neighborhood graph

```cypher
MATCH (thesis:Thesis {id: $thesisId})
MATCH p=(thesis)-[:LINKS_TO|SUPPORTS_THESIS|MENTIONS|CANDIDATE_LINK]-(n:BlindSpotNode)
RETURN p
LIMIT 150;
```

### Evidence-to-thesis-to-regime graph

```cypher
MATCH p=(e:EvidenceArtifact)-[:MENTIONS]->(thesis:Thesis)-[:SUPPORTS_THESIS]->(regime:Regime)
RETURN p
LIMIT 100;
```

## Hygiene Rules

- Prefer `MERGE` on `id` for nodes and relationships.
- Keep imported IDs stable; use `review:` prefixes for manually reviewed additions.
- Do not delete candidate links after review; mark `reviewState`.
- Use `CANDIDATE_LINK` only as a review queue, not as confirmed evidence.
- Use `DERIVED_FROM_NOTE` and `SOURCED_FROM` whenever adding manual relationships so provenance remains traceable.
- Run discovery queries before creating new nodes to avoid duplicates.

