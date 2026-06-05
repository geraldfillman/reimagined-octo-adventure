# Uploaded Neo4j Blind-Spot Graph Outline

Generated from the live Neo4j database after the first import attempt.

## Import Summary

- Base label: `BlindSpotNode`
- Nodes: `21,268`
- Relationships: `51,672`
- Candidate blind-spot links: `450`
- Database: `neo4j`
- Import date: `2026-06-01`

## Domain Nodes

| Domain | Node ID | Inbound `BELONGS_TO_DOMAIN` |
|---|---:|---:|
| Evidence | `domain:evidence` | 14,410 |
| Reports | `domain:reports` | 332 |
| Entities | `domain:entities` | 318 |
| DataSources | `domain:datasources` | 203 |
| Signals | `domain:signals` | 194 |
| Macro | `domain:macro` | 98 |
| Theses | `domain:theses` | 86 |
| Policy | `domain:policy` | 38 |
| Politics | `domain:politics` | 26 |
| News | `domain:news` | 22 |
| CompanyRisk | `domain:companyrisk` | 0 |

## Node Labels

All imported nodes carry `BlindSpotNode`. Additional labels currently present:

| Label | Count |
|---|---:|
| `VaultNote` | 7,866 |
| `EvidenceArtifact` | 7,380 |
| `DataPull` | 7,205 |
| `Entity` | 5,527 |
| `Company` | 1,385 |
| `Stock` | 1,384 |
| `SourceItem` | 242 |
| `DataSource` | 101 |
| `Signal` | 97 |
| `MacroIndicator` | 49 |
| `Thesis` | 43 |
| `Sector` | 34 |
| `Regime` | 30 |
| `PolicyAction` | 19 |
| `Domain` | 11 |
| `Country` | 10 |
| `PoliticalActor` | 10 |
| `NewsItem` | 9 |
| `Bill` | 8 |
| `Commodity` | 8 |
| `EconomicDataRelease` | 6 |
| `GeopoliticalEvent` | 6 |
| `Donor` | 2 |
| `ETF` | 2 |
| `YieldInstrument` | 2 |
| `LobbyingCampaign` | 1 |
| `PAC` | 1 |
| `PolicyTopic` | 1 |
| `Recipient` | 1 |
| `Regulation` | 1 |

## Node/Subnode Label Combinations

These are the concrete multi-label node shapes loaded so far.

| Label combination | Count |
|---|---:|
| `BlindSpotNode:VaultNote` | 7,866 |
| `BlindSpotNode:DataPull:EvidenceArtifact` | 7,205 |
| `BlindSpotNode:Entity` | 4,083 |
| `BlindSpotNode:Entity:Company:Stock` | 1,384 |
| `BlindSpotNode:EvidenceArtifact` | 166 |
| `BlindSpotNode:SourceItem` | 132 |
| `BlindSpotNode:DataSource:SourceItem` | 101 |
| `BlindSpotNode:Signal` | 97 |
| `BlindSpotNode:Thesis` | 43 |
| `BlindSpotNode:MacroIndicator` | 41 |
| `BlindSpotNode:Entity:Sector` | 34 |
| `BlindSpotNode:Regime` | 30 |
| `BlindSpotNode:Domain` | 11 |
| `BlindSpotNode:Entity:Country` | 10 |
| `BlindSpotNode:PolicyAction` | 9 |
| `BlindSpotNode:PoliticalActor` | 9 |
| `BlindSpotNode:SourceItem:EvidenceArtifact:NewsItem` | 9 |
| `BlindSpotNode:Commodity:Entity` | 8 |
| `BlindSpotNode:PolicyAction:Bill` | 8 |
| `BlindSpotNode:Entity:GeopoliticalEvent` | 6 |
| `BlindSpotNode:MacroIndicator:EconomicDataRelease` | 6 |
| `BlindSpotNode:Entity:ETF` | 2 |
| `BlindSpotNode:MacroIndicator:YieldInstrument` | 2 |
| `BlindSpotNode:Company:Donor` | 1 |
| `BlindSpotNode:Donor:PAC` | 1 |
| `BlindSpotNode:LobbyingCampaign` | 1 |
| `BlindSpotNode:PolicyAction:PolicyTopic` | 1 |
| `BlindSpotNode:PolicyAction:Regulation` | 1 |
| `BlindSpotNode:PoliticalActor:Recipient` | 1 |

## Node Properties

All node property keys currently present:

`id`, `name`, `canonicalName`, `label`, `nodeType`, `tags`, `domain`, `asOfDate`, `sourceFolder`, `obsidianUrl`, `provider`, `relativePath`, `vault`, `sourcePath`, `summary`, `dataType`, `url`, `subdomain`, `sourceVault`, `status`, `source`, `signalStatus`, `frequency`, `datePulled`, `symbol`, `conviction`, `sector`, `ticker`, `date`, `timeframe`, `jurisdiction`, `lastUpdated`, `currency`, `country`, `exchange`, `trend`, `confidence`

Common identity/provenance fields:

- `id`, `name`, `canonicalName`, `label`, `nodeType`, `tags`, `domain`, `asOfDate`
- `vault`, `relativePath`, `obsidianUrl`, `sourcePath`, `sourceVault`, `sourceFolder`

Evidence/source fields:

- `source`, `provider`, `dataType`, `datePulled`, `frequency`, `summary`, `url`

Market/classification fields:

- `ticker`, `symbol`, `exchange`, `currency`, `sector`, `country`

State/review fields:

- `status`, `signalStatus`, `conviction`, `confidence`, `timeframe`, `trend`, `date`, `lastUpdated`

Label-specific notable additions:

- `DataSource` / `SourceItem`: `provider`, `summary`, `url`, `dataType`, `status`
- `DataPull` / `EvidenceArtifact`: `source`, `signalStatus`, `frequency`, `datePulled`, `symbol`, `conviction`, `sector`
- `Stock` / `Company`: `ticker`, `symbol`, `sector`, `country`, `exchange`
- `ETF`: `ticker`, `symbol`, `sector`, `country`, `exchange`
- `Country`: `currency`, `date`, `dataType`
- `MacroIndicator` / `YieldInstrument` / `EconomicDataRelease`: `source`, `signalStatus`, `frequency`, `lastUpdated`, `trend`, `dataType`, `date`
- `Regime`: `date`, `lastUpdated`, `status`, `confidence`
- `Thesis`: `conviction`, `timeframe`, `status`
- `PolicyAction` / `Bill` / `Regulation` / `PolicyTopic`: `sector`, `jurisdiction`, `lastUpdated`, `source`, `date`
- `PoliticalActor` / `Recipient`: `sector`, `jurisdiction`, `source`, `signalStatus`, `date`
- `Donor` / `PAC` / `LobbyingCampaign`: `sector`, `jurisdiction`, `ticker`, `symbol` where available
- `NewsItem` / `GeopoliticalEvent`: `source`, `date`, `summary`, `dataType`

## Relationship Types

| Relationship type | Count | Main purpose |
|---|---:|---|
| `MENTIONS` | 18,919 | Extracted wikilink/text/entity mentions from evidence, theses, notes, and sources |
| `BELONGS_TO_DOMAIN` | 15,727 | Connects every typed node to a domain node |
| `DERIVED_FROM_NOTE` | 7,866 | Connects promoted typed nodes back to source vault notes |
| `SOURCED_FROM` | 7,460 | Connects evidence artifacts/signals/macros to source items and data sources |
| `LINKS_TO` | 463 | Structured thesis/macro/entity links |
| `CANDIDATE_LINK` | 450 | Reviewable inferred blind-spot edges |
| `RELATED_TO` | 401 | Explicit or normalized relatedness between entities, stocks, sectors, ETFs, regimes, theses |
| `SUPPORTS_THESIS` | 128 | Thesis to supporting regimes/entities |
| `AFFECTS_STOCK` | 105 | Sector exposure edges into stocks |
| `INDICATES_REGIME` | 74 | Macro/economic/stock indicators pointing to regimes |
| `FAVORS_SECTOR` | 29 | Regime tailwind edges into sectors |
| `HURTS_SECTOR` | 20 | Regime headwind edges into sectors |
| `AFFECTS_COMMODITY` | 17 | Macro/economic indicators affecting commodities or related stocks |
| `TARGETS_SECTOR` | 13 | Policy/politics/lobbying edges into sectors/entities |

## Relationship Properties

All relationship property keys currently present:

`id`, `asOfDate`, `source`, `method`, `firstSeen`, `weight`, `lastSeen`, `status`, `reason`, `evidenceCount`, `missingEvidence`, `createdBy`, `reviewState`

Standard relationship fields:

- `id`
- `asOfDate`
- `source`
- `method`

Weighted evidence-style relationship fields:

- `firstSeen`
- `lastSeen`
- `weight`

Candidate blind-spot fields:

- `status`
- `reason`
- `evidenceCount`
- `missingEvidence`
- `createdBy`
- `reviewState`

## Relationship Pattern Outline

### Provenance and structure

- `(:BlindSpotNode)-[:BELONGS_TO_DOMAIN]->(:Domain)`
- `(:BlindSpotNode)-[:DERIVED_FROM_NOTE]->(:VaultNote)`
- `(:DataPull:EvidenceArtifact)-[:SOURCED_FROM]->(:DataSource:SourceItem)`
- `(:DataPull:EvidenceArtifact)-[:SOURCED_FROM]->(:SourceItem)`
- `(:Signal)-[:SOURCED_FROM]->(:SourceItem)`
- `(:MacroIndicator)-[:SOURCED_FROM]->(:SourceItem)`

### Evidence and mentions

- `(:DataPull:EvidenceArtifact)-[:MENTIONS]->(:Entity)`
- `(:DataPull:EvidenceArtifact)-[:MENTIONS]->(:Stock:Company:Entity)`
- `(:DataPull:EvidenceArtifact)-[:MENTIONS]->(:Thesis)`
- `(:DataPull:EvidenceArtifact)-[:MENTIONS]->(:Sector:Entity)`
- `(:DataPull:EvidenceArtifact)-[:MENTIONS]->(:Regime)`
- `(:Thesis)-[:MENTIONS]->(:Stock:Company:Entity)`

### Thesis and entity graph

- `(:Thesis)-[:LINKS_TO]->(:Stock:Company:Entity)`
- `(:Thesis)-[:LINKS_TO]->(:Sector:Entity)`
- `(:Thesis)-[:LINKS_TO]->(:Entity)`
- `(:Thesis)-[:SUPPORTS_THESIS]->(:Regime)`
- `(:Thesis)-[:SUPPORTS_THESIS]->(:Entity)`
- `(:Stock:Company:Entity)-[:RELATED_TO]->(:Stock:Company:Entity)`
- `(:Stock:Company:Entity)-[:RELATED_TO]->(:Sector:Entity)`
- `(:Stock:Company:Entity)-[:RELATED_TO]->(:ETF:Entity)`

### Macro/regime/market graph

- `(:MacroIndicator)-[:INDICATES_REGIME]->(:Regime)`
- `(:EconomicDataRelease:MacroIndicator)-[:INDICATES_REGIME]->(:Regime)`
- `(:YieldInstrument:MacroIndicator)-[:INDICATES_REGIME]->(:Regime)`
- `(:Stock:Company:Entity)-[:INDICATES_REGIME]->(:Regime)`
- `(:Regime)-[:FAVORS_SECTOR]->(:Sector:Entity)`
- `(:Regime)-[:HURTS_SECTOR]->(:Sector:Entity)`
- `(:Sector:Entity)-[:AFFECTS_STOCK]->(:Stock:Company:Entity)`
- `(:MacroIndicator)-[:AFFECTS_COMMODITY]->(:Commodity:Entity)`
- `(:EconomicDataRelease:MacroIndicator)-[:AFFECTS_COMMODITY]->(:Commodity:Entity)`

### Policy, politics, and blind-spot graph

- `(:PolicyAction:Bill)-[:TARGETS_SECTOR]->(:Sector:Entity)`
- `(:PolicyAction)-[:TARGETS_SECTOR]->(:Sector:Entity)`
- `(:PolicyTopic:PolicyAction)-[:TARGETS_SECTOR]->(:Sector:Entity)`
- `(:Regulation:PolicyAction)-[:TARGETS_SECTOR]->(:Sector:Entity)`
- `(:LobbyingCampaign)-[:TARGETS_SECTOR]->(:Sector:Entity)`
- `(:Donor:PAC)-[:TARGETS_SECTOR]->(:Sector:Entity)`
- `(:PoliticalActor:Recipient)-[:TARGETS_SECTOR]->(:Sector:Entity)`

### Candidate blind spots

Current `CANDIDATE_LINK` patterns:

- `(:Regime)-[:CANDIDATE_LINK]->(:Stock:Company:Entity)` — 386
- `(:Thesis)-[:CANDIDATE_LINK]->(:Domain)` — 43
- `(:NewsItem:SourceItem:EvidenceArtifact)-[:CANDIDATE_LINK]->(:Regime)` — 9
- `(:PolicyAction:Bill)-[:CANDIDATE_LINK]->(:Sector:Entity)` — 6
- Additional single-edge candidates from policy, lobbying, and political nodes into sectors/entities.

Candidate link defaults observed:

- `status`: candidate
- `reviewState`: needs review
- `method`: commonly `regime_data_gap`, plus policy/news/source gap routes where available
- `reason`: human-readable gap explanation
- `missingEvidence`: confirmation or rejection criteria

## Constraints

- `blind_spot_node_id`: uniqueness constraint on `(:BlindSpotNode {id})`

