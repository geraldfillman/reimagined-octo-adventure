# Neo4j Blind-Spot Graph Export - 2026-06-01

This export is a typed analytical graph over `World_Machine` and `My_Data` concepts. It is not a direct Obsidian mirror.

- Nodes: `21268`
- Relationships: `51672`
- Candidate blind-spot links: `450`

## Files

- `nodes.csv` - compact node table for scripted LOAD CSV import.
- `relationships.csv` - compact relationship table.
- `candidate_links.csv` - review queue of inferred blind-spot relationships.
- `blind_spot_graph.json` - detailed graph model.
- `load_blind_spot_graph.cypher` - starter loader; review before running.
- `data-importer/` - split CSVs for Neo4j Data Importer.

## Node Labels

- Bill: 8
- Commodity: 8
- Company: 1385
- Country: 10
- DataPull: 7205
- DataSource: 101
- Domain: 11
- Donor: 2
- ETF: 2
- EconomicDataRelease: 6
- Entity: 5527
- EvidenceArtifact: 7380
- GeopoliticalEvent: 6
- LobbyingCampaign: 1
- MacroIndicator: 49
- NewsItem: 9
- PAC: 1
- PolicyAction: 19
- PolicyTopic: 1
- PoliticalActor: 10
- Recipient: 1
- Regime: 30
- Regulation: 1
- Sector: 34
- Signal: 97
- SourceItem: 242
- Stock: 1384
- Thesis: 43
- VaultNote: 7866
- YieldInstrument: 2

## Relationship Types

- AFFECTS_COMMODITY: 17
- AFFECTS_STOCK: 105
- BELONGS_TO_DOMAIN: 15727
- CANDIDATE_LINK: 450
- DERIVED_FROM_NOTE: 7866
- FAVORS_SECTOR: 29
- HURTS_SECTOR: 20
- INDICATES_REGIME: 74
- LINKS_TO: 463
- MENTIONS: 18919
- RELATED_TO: 401
- SOURCED_FROM: 7460
- SUPPORTS_THESIS: 128
- TARGETS_SECTOR: 13

## Starter Queries

```cypher
MATCH (a)-[r:CANDIDATE_LINK]->(b)
RETURN a.name, labels(a), r.method, r.reason, r.missingEvidence, b.name, labels(b)
ORDER BY r.method, a.name
LIMIT 100;
```

```cypher
MATCH p=(regime:Regime)-[:CANDIDATE_LINK]->(stock:Stock)
RETURN p
LIMIT 100;
```

```cypher
MATCH (indicator:MacroIndicator)-[:INDICATES_REGIME]->(regime:Regime)
RETURN indicator.name, collect(regime.name) AS regimes
ORDER BY indicator.name;
```

Local path: `C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\99_System\exports\neo4j\blind-spot-graph-2026-06-01`
