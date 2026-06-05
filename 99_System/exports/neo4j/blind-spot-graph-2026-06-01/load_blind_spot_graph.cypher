// Neo4j loader for My_Data / World_Machine blind-spot graph.
// Upload nodes.csv and relationships.csv somewhere Neo4j can read, then update file:/// URLs if needed.
// This script creates no data until you run it in Neo4j.

CREATE CONSTRAINT blind_spot_node_id IF NOT EXISTS FOR (n:BlindSpotNode) REQUIRE n.id IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'file:///nodes.csv' AS row
CALL (row) {
  MERGE (n:BlindSpotNode {id: row.id})
  SET n.name = row.name,
      n.canonicalName = row.canonicalName,
      n.label = row.label,
      n.vault = nullIf(row.vault, ''),
      n.relativePath = nullIf(row.relativePath, ''),
      n.obsidianUrl = nullIf(row.obsidianUrl, ''),
      n.sourcePath = nullIf(row.sourcePath, ''),
      n.sourceVault = nullIf(row.sourceVault, ''),
      n.sourceFolder = nullIf(row.sourceFolder, ''),
      n.nodeType = nullIf(row.nodeType, ''),
      n.domain = nullIf(row.domain, ''),
      n.subdomain = nullIf(row.subdomain, ''),
      n.assetClass = nullIf(row.assetClass, ''),
      n.sector = nullIf(row.sector, ''),
      n.industry = nullIf(row.industry, ''),
      n.country = nullIf(row.country, ''),
      n.jurisdiction = nullIf(row.jurisdiction, ''),
      n.tags = CASE row.tags WHEN '' THEN [] ELSE split(row.tags, ';') END,
      n.status = nullIf(row.status, ''),
      n.signalStatus = nullIf(row.signalStatus, ''),
      n.confidence = nullIf(row.confidence, ''),
      n.conviction = nullIf(row.conviction, ''),
      n.timeframe = nullIf(row.timeframe, ''),
      n.frequency = nullIf(row.frequency, ''),
      n.lastUpdated = nullIf(row.lastUpdated, ''),
      n.date = nullIf(row.date, ''),
      n.asOfDate = nullIf(row.asOfDate, ''),
      n.ticker = nullIf(row.ticker, ''),
      n.exchange = nullIf(row.exchange, ''),
      n.symbol = nullIf(row.symbol, ''),
      n.currency = nullIf(row.currency, ''),
      n.instrumentType = nullIf(row.instrumentType, ''),
      n.currentValue = nullIf(row.currentValue, ''),
      n.trend = nullIf(row.trend, ''),
      n.source = nullIf(row.source, ''),
      n.provider = nullIf(row.provider, ''),
      n.dataType = nullIf(row.dataType, ''),
      n.datePulled = nullIf(row.datePulled, ''),
      n.freshnessDate = nullIf(row.freshnessDate, ''),
      n.summary = nullIf(row.summary, ''),
      n.url = nullIf(row.url, '')
  FOREACH (_ IN CASE WHEN 'Domain' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Domain)
  FOREACH (_ IN CASE WHEN 'VaultNote' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:VaultNote)
  FOREACH (_ IN CASE WHEN 'Entity' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Entity)
  FOREACH (_ IN CASE WHEN 'Stock' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Stock:Company:Entity)
  FOREACH (_ IN CASE WHEN 'ETF' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:ETF:Entity)
  FOREACH (_ IN CASE WHEN 'Commodity' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Commodity:Entity)
  FOREACH (_ IN CASE WHEN 'Country' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Country:Entity)
  FOREACH (_ IN CASE WHEN 'Sector' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Sector:Entity)
  FOREACH (_ IN CASE WHEN 'Industry' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Industry:Entity)
  FOREACH (_ IN CASE WHEN 'Regime' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Regime)
  FOREACH (_ IN CASE WHEN 'MacroIndicator' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:MacroIndicator)
  FOREACH (_ IN CASE WHEN 'YieldInstrument' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:YieldInstrument)
  FOREACH (_ IN CASE WHEN 'EconomicDataRelease' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:EconomicDataRelease)
  FOREACH (_ IN CASE WHEN 'NewsItem' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:NewsItem)
  FOREACH (_ IN CASE WHEN 'SourceItem' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:SourceItem)
  FOREACH (_ IN CASE WHEN 'DataPull' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:DataPull)
  FOREACH (_ IN CASE WHEN 'Signal' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Signal)
  FOREACH (_ IN CASE WHEN 'Thesis' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Thesis)
  FOREACH (_ IN CASE WHEN 'EvidenceArtifact' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:EvidenceArtifact)
  FOREACH (_ IN CASE WHEN 'PolicyAction' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:PolicyAction)
  FOREACH (_ IN CASE WHEN 'Bill' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Bill)
  FOREACH (_ IN CASE WHEN 'Regulation' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Regulation)
  FOREACH (_ IN CASE WHEN 'PolicyTopic' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:PolicyTopic)
  FOREACH (_ IN CASE WHEN 'PoliticalActor' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:PoliticalActor)
  FOREACH (_ IN CASE WHEN 'PAC' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:PAC)
  FOREACH (_ IN CASE WHEN 'LobbyingCampaign' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:LobbyingCampaign)
  FOREACH (_ IN CASE WHEN 'Recipient' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Recipient)
  FOREACH (_ IN CASE WHEN 'Donor' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Donor)
  FOREACH (_ IN CASE WHEN 'GeopoliticalEvent' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:GeopoliticalEvent)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'BELONGS_TO_DOMAIN'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:BELONGS_TO_DOMAIN {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'DERIVED_FROM_NOTE'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:DERIVED_FROM_NOTE {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'SOURCED_FROM'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:SOURCED_FROM {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'HAS_EVIDENCE'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:HAS_EVIDENCE {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'HAS_PULL'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:HAS_PULL {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'HAS_SIGNAL'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:HAS_SIGNAL {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'LINKS_TO'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:LINKS_TO {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'RELATED_TO'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:RELATED_TO {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'MENTIONS'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:MENTIONS {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'SUPPORTS_THESIS'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:SUPPORTS_THESIS {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'INVALIDATES_THESIS'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:INVALIDATES_THESIS {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'PART_OF_REGIME'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:PART_OF_REGIME {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'INDICATES_REGIME'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:INDICATES_REGIME {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'FAVORS_SECTOR'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:FAVORS_SECTOR {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'HURTS_SECTOR'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:HURTS_SECTOR {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'AFFECTS_STOCK'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:AFFECTS_STOCK {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'AFFECTS_COMMODITY'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:AFFECTS_COMMODITY {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'AFFECTS_FOREX'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:AFFECTS_FOREX {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'AFFECTS_FUTURES'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:AFFECTS_FUTURES {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'RELEASED_ON'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:RELEASED_ON {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'HAS_EARNINGS_EVENT'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:HAS_EARNINGS_EVENT {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'TRIGGERS'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:TRIGGERS {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'CONFIRMS'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:CONFIRMS {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'CONTRADICTS'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:CONTRADICTS {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'ESCALATES'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:ESCALATES {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'SPONSORS'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:SPONSORS {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'LOBBIES_FOR'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:LOBBIES_FOR {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'FUNDS'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:FUNDS {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'REGULATES'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:REGULATES {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'TARGETS_SECTOR'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:TARGETS_SECTOR {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'IMPACTS_COMPANY'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:IMPACTS_COMPANY {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = 'CANDIDATE_LINK'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:CANDIDATE_LINK {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');


MATCH (n:BlindSpotNode) RETURN labels(n) AS labels, count(*) AS count ORDER BY count DESC;
MATCH ()-[r:CANDIDATE_LINK]->() RETURN r.method AS method, count(*) AS count ORDER BY count DESC;
