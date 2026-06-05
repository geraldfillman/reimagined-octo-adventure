# Step A — Import Filter Spec + VaultNote Purge Migration

Part 1 of 3 in the Neo4j refactor for `blind-spot-graph-2026-06-01`.

## (a) Goal

Remove the `VaultNote` label (7,866 nodes) and the `DERIVED_FROM_NOTE` relationship (7,866 edges) from the graph. Provenance (relativePath / obsidianUrl / sourcePath / vault / sourceFolder) becomes scalar properties on the typed nodes that previously pointed at a VaultNote — primarily `EvidenceArtifact` and any other `BlindSpotNode` carrying a `DERIVED_FROM_NOTE` edge. Also: define the forward import filter so the puller stops minting `VaultNote` nodes at all, and decide the `Company` vs `Stock` overlap (1,385 vs 1,384).

Expected VaultNote-purge delta:
- Node count: -7,866 (VaultNotes gone).
- Relationship count: -15,732 (`DERIVED_FROM_NOTE` plus redundant `VaultNote -> BELONGS_TO_DOMAIN` edges gone).
- `EvidenceArtifact` count: unchanged (7,380) minus any quarantined orphans (expected single digits — see step (d)).

Expected full Step-A net delta after the Company/Stock split:
- Node count: -6,482 on the 2026-06-01 baseline (remove 7,866 VaultNotes, add 1,384 issuer `Company` peers).
- Relationship count: -14,243 on the 2026-06-01 baseline (remove 15,732 VaultNote relationships, add 1,384 `ISSUED_BY` edges plus 105 copied issuer-domain edges).

---

## (b) Pre-flight checks

Run all of these before touching anything. Numbers must match the locked baseline; if they drift, STOP and reconcile.

```cypher
// 1. VaultNote count — expect 7866
MATCH (v:VaultNote) RETURN count(v) AS vaultNoteCount;

// 2. DERIVED_FROM_NOTE count — expect 7866
MATCH ()-[r:DERIVED_FROM_NOTE]->() RETURN count(r) AS derivedEdgeCount;

// 3. EvidenceArtifact count — expect 7380
MATCH (e:EvidenceArtifact) RETURN count(e) AS evidenceCount;

// 4. EvidenceArtifacts with a DERIVED_FROM_NOTE edge
MATCH (e:EvidenceArtifact)-[:DERIVED_FROM_NOTE]->(:VaultNote)
RETURN count(DISTINCT e) AS evidenceWithNote;

// 5. Non-EvidenceArtifact nodes carrying DERIVED_FROM_NOTE (Thesis/Stock/Sector/etc promoted from notes)
MATCH (n)-[:DERIVED_FROM_NOTE]->(:VaultNote)
WHERE NOT n:EvidenceArtifact
RETURN labels(n) AS lbls, count(*) AS c
ORDER BY c DESC;

// 6. VaultNotes that are the SOLE provenance source for an EvidenceArtifact (will become orphans
//    after deletion if EvidenceArtifact has no other inbound/outbound non-DERIVED edges)
MATCH (e:EvidenceArtifact)
WHERE EXISTS { (e)-[:DERIVED_FROM_NOTE]->(:VaultNote) }
  AND NOT EXISTS {
    MATCH (e)-[r]-()
    WHERE type(r) <> 'DERIVED_FROM_NOTE'
  }
RETURN count(e) AS evidenceOnlyDerivedFromNote;

// 7. Provenance-property presence on VaultNote (sanity — should be near-100%)
MATCH (v:VaultNote)
RETURN
  count(v) AS total,
  count(v.relativePath) AS withRelPath,
  count(v.obsidianUrl)  AS withObsidianUrl,
  count(v.sourcePath)   AS withSourcePath,
  count(v.vault)        AS withVault,
  count(v.sourceFolder) AS withSourceFolder;

// 8. Confirm no other relationship type ends at VaultNote (would silently die in DETACH DELETE)
MATCH (:VaultNote)<-[r]-()
RETURN type(r) AS relType, count(*) AS c
ORDER BY c DESC;
MATCH (:VaultNote)-[r]->()
RETURN type(r) AS relType, count(*) AS c
ORDER BY c DESC;

// 9. VaultNote domain edges must be redundant mirrors of typed-node domain edges.
// Expect noteDomainEdges = 7866.
MATCH (n)-[:DERIVED_FROM_NOTE]->(v:VaultNote)-[:BELONGS_TO_DOMAIN]->(d:Domain)
RETURN count(*) AS noteDomainEdges;

// 10. Expect no typed nodes missing a direct domain edge.
MATCH (n)-[:DERIVED_FROM_NOTE]->(v:VaultNote)-[:BELONGS_TO_DOMAIN]->(:Domain)
WHERE NOT EXISTS { (n)-[:BELONGS_TO_DOMAIN]->(:Domain) }
RETURN count(DISTINCT n) AS missingTypedDomain;

// 11. Expect no typed nodes missing the same direct domain edge.
MATCH (n)-[:DERIVED_FROM_NOTE]->(v:VaultNote)-[:BELONGS_TO_DOMAIN]->(d:Domain)
WHERE NOT EXISTS { (n)-[:BELONGS_TO_DOMAIN]->(d) }
RETURN labels(n) AS lbls, d.name AS domainName, count(*) AS missingSameDomain
ORDER BY missingSameDomain DESC;
```

Baseline from `UPLOADED_SCHEMA_OUTLINE.md`: `VaultNote=7866`, `DERIVED_FROM_NOTE=7866`, `EvidenceArtifact=7380`, `DataPull=7205`. Query 8 should show inbound `DERIVED_FROM_NOTE=7866` and outbound `BELONGS_TO_DOMAIN=7866`. The outbound domain edges are disposable only because queries 9-11 prove the same domain membership already exists directly on each typed node. If query 8 shows any other relationship type, or queries 10-11 return missing domain rows, STOP and reconcile before purge.

---

## (c) Migration steps (in order)

### Step 1 — Snapshot for rollback

```bash
# From neo4j shell host
neo4j-admin database dump neo4j --to-path=C:\neo4j-backups\pre-step-a-2026-06-01
```

Also export the two affected sets as CSV so we can re-link if rollback is partial:

```cypher
CALL apoc.export.csv.query(
  "MATCH (n)-[:DERIVED_FROM_NOTE]->(v:VaultNote)
   RETURN elementId(n) AS nodeId, labels(n) AS lbls,
          v.relativePath AS relativePath, v.obsidianUrl AS obsidianUrl,
          v.sourcePath AS sourcePath, v.vault AS vault, v.sourceFolder AS sourceFolder",
  "pre-step-a-provenance-snapshot.csv",
  {}
);
```

### Step 2 — Copy provenance onto typed nodes (idempotent, batched)

Uses `CALL { } IN TRANSACTIONS` so it works without APOC. Only writes a property if not already populated (idempotent — re-running is a no-op).

```cypher
MATCH (n)-[:DERIVED_FROM_NOTE]->(v:VaultNote)
CALL (n, v) {
  SET n.source_path     = coalesce(n.source_path,     v.sourcePath,    v.relativePath),
      n.source_url      = coalesce(n.source_url,      v.obsidianUrl),
      n.source_rel_path = coalesce(n.source_rel_path, v.relativePath),
      n.source_vault    = coalesce(n.source_vault,    v.vault),
      n.source_folder   = coalesce(n.source_folder,   v.sourceFolder)
} IN TRANSACTIONS OF 1000 ROWS;
```

Notes:
- `source_path` and `source_url` are the locked names per the refactor decision (decision #1).
- The other three (`source_rel_path`, `source_vault`, `source_folder`) are kept for grep-back to the vault layout; drop if you want a stricter property set.
- If a node has multiple `DERIVED_FROM_NOTE` edges (shouldn't, but possible), `coalesce` keeps whichever lands first. Run query 5 above to detect that case; if non-zero, switch to a `WITH n, collect(v) AS vs` ordering pass before the SET.

### Step 3 — Verify copy succeeded BEFORE deletion

```cypher
// Every node that had a DERIVED_FROM_NOTE edge must now carry source_path.
MATCH (n)-[:DERIVED_FROM_NOTE]->(:VaultNote)
WHERE n.source_path IS NULL
RETURN labels(n) AS lbls, count(*) AS missing;
// Expect 0 rows. If non-zero — STOP, do not proceed to deletion.
```

### Step 4 — Dry-run the orphan classification (read-only)

```cypher
// Orphan candidates: EvidenceArtifact whose ONLY relationship was DERIVED_FROM_NOTE.
MATCH (e:EvidenceArtifact)
WHERE EXISTS { (e)-[:DERIVED_FROM_NOTE]->(:VaultNote) }
  AND NOT EXISTS {
    MATCH (e)-[r]-()
    WHERE type(r) <> 'DERIVED_FROM_NOTE'
  }
RETURN count(e) AS willBeOrphaned;
```

### Step 4b - Verify or repair domain membership BEFORE deletion

`VaultNote -> BELONGS_TO_DOMAIN` edges are redundant mirrors. The typed node that points to the VaultNote must already have the same direct `BELONGS_TO_DOMAIN` edge before the VaultNote is deleted.

```cypher
// DRY-RUN: expect 0 missing rows on the 2026-06-01 baseline.
MATCH (n)-[:DERIVED_FROM_NOTE]->(v:VaultNote)-[:BELONGS_TO_DOMAIN]->(d:Domain)
WHERE NOT EXISTS { (n)-[:BELONGS_TO_DOMAIN]->(d) }
RETURN labels(n) AS lbls, d.name AS domainName, count(*) AS missingSameDomain
ORDER BY missingSameDomain DESC;

// APPLY ONLY if the dry-run returns rows. This is idempotent.
MATCH (n)-[:DERIVED_FROM_NOTE]->(v:VaultNote)-[:BELONGS_TO_DOMAIN]->(d:Domain)
WHERE NOT EXISTS { (n)-[:BELONGS_TO_DOMAIN]->(d) }
MERGE (n)-[:BELONGS_TO_DOMAIN {
  source: 'step_a_domain_edge_repair',
  method: 'copied_from_vaultnote_before_purge'
}]->(d);
```

See section (d) below for the recommended orphan handling.

### Step 5 — Quarantine orphans (recommended: label, don't delete)

```cypher
// DRY-RUN: count
MATCH (e:EvidenceArtifact)
WHERE EXISTS { (e)-[:DERIVED_FROM_NOTE]->(:VaultNote) }
  AND NOT EXISTS {
    MATCH (e)-[r]-()
    WHERE type(r) <> 'DERIVED_FROM_NOTE'
  }
RETURN count(e) AS toQuarantine;

// APPLY: tag, do NOT delete
MATCH (e:EvidenceArtifact)
WHERE EXISTS { (e)-[:DERIVED_FROM_NOTE]->(:VaultNote) }
  AND NOT EXISTS {
    MATCH (e)-[r]-()
    WHERE type(r) <> 'DERIVED_FROM_NOTE'
  }
SET e:Quarantined, e.quarantined_at = datetime(), e.quarantined_reason = 'orphan_after_vaultnote_purge_step_a';
```

### Step 6 — DRY-RUN the purge

```cypher
// What will get deleted (nodes)
MATCH (v:VaultNote) RETURN count(v) AS toDelete;            // expect 7866

// What edges will be removed implicitly by DETACH DELETE
MATCH (:VaultNote)-[r]-() RETURN type(r) AS t, count(*) AS c ORDER BY c DESC;
// expect: DERIVED_FROM_NOTE 7866, BELONGS_TO_DOMAIN 7866.
// BELONGS_TO_DOMAIN is safe to delete only after Step 4b confirms typed-node domain edges.
```

### Step 7 — APPLY the purge (batched)

```cypher
MATCH (v:VaultNote)
CALL (v) {
  DETACH DELETE v
} IN TRANSACTIONS OF 1000 ROWS;
```

Idempotency: re-running this on a clean graph is a no-op (no VaultNode nodes remain).

### Step 8 — Drop now-unused constraints/indexes on `:VaultNote`

```cypher
SHOW CONSTRAINTS YIELD name, labelsOrTypes WHERE 'VaultNote' IN labelsOrTypes;
SHOW INDEXES     YIELD name, labelsOrTypes WHERE 'VaultNote' IN labelsOrTypes;
// Then: DROP CONSTRAINT <name>;  DROP INDEX <name>;  for each.
```

Add new indexes for the new properties (the puller will query by source_path):

```cypher
CREATE INDEX ea_source_path IF NOT EXISTS FOR (e:EvidenceArtifact) ON (e.source_path);
CREATE INDEX ea_source_url  IF NOT EXISTS FOR (e:EvidenceArtifact) ON (e.source_url);
```

---

## (d) Orphan detection — recommendation

An "orphan" here = an `EvidenceArtifact` whose only edge in the graph was `DERIVED_FROM_NOTE → VaultNote`. After deletion it becomes a disconnected node with no `MENTIONS`, no `SOURCED_FROM`, no `LINKS_TO`.

Three options:

1. **Delete** — cleanest, but loses provenance forever. Risky for one-way doors.
2. **Keep silently** — they'll just float in the graph and pollute counts.
3. **Quarantine label** — add `:Quarantined` and `quarantined_at` / `quarantined_reason` properties so they're trivially filterable but recoverable.

**Recommendation: Option 3 (quarantine).** Rationale:
- We already locked decision #1 to move provenance onto properties, so a quarantined node still has `source_path` / `source_url` and can be re-linked from the puller side without re-querying the vault.
- The expected orphan count from query 6 in pre-flight should be low single digits or low tens; not worth the irreversibility of a delete.
- Add a cadence cleanup task: "after 2 import cycles, any node still `:Quarantined` and still un-reattached → delete." That gives the puller two chances to re-link via `source_path` match.

Followup query for the cadence cleanup (week 2+):

```cypher
MATCH (e:EvidenceArtifact:Quarantined)
WHERE e.quarantined_at < datetime() - duration({days: 14})
  AND NOT EXISTS { MATCH (e)-[r]-() WHERE type(r) <> 'DERIVED_FROM_NOTE' }
RETURN count(e) AS staleOrphans;
// then DETACH DELETE in a second pass once reviewed.
```

---

## (e) Forward import-filter rules for the puller

File: `C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\scripts\pullers\neo4j-blind-spot-graph.mjs` (delegates into `lib/neo4j-blind-spot-graph.mjs::buildBlindSpotGraph`). **Do not edit yet — this is the spec for Step C.**

Goal: a vault note should materialize directly as a typed `BlindSpotNode` (Thesis / Sector / Stock / Company / Regime / Signal / MacroIndicator / EvidenceArtifact) and skip the `VaultNote` intermediate label entirely. Provenance becomes properties on that typed node.

### Eligibility decision tree (pseudocode)

```text
for each vault note (markdown + frontmatter fm):
  base = {
    source_path:     fm.sourcePath     || note.absolutePath,
    source_url:      fm.obsidianUrl    || makeObsidianUrl(note),
    source_rel_path: fm.relativePath   || note.relativeToVault,
    source_vault:    fm.vault          || vaultName,
    source_folder:   fm.sourceFolder   || dirname(note.relativeToVault),
    asOfDate:        fm.asOfDate       || note.fileMtimeDate,
  }

  // 1. Hard-skip rules — note does NOT enter the graph at all.
  if (fm.draft === true)                    skip()
  if (fm.status === 'archived')             skip()
  if (note.relativePath startsWith '_inbox/' && !fm.promote) skip()
  if (!fm.nodeType && !fm.domain && !inferLabelFromFolder(note)) skip()

  // 2. Promotion rules — choose the typed label.
  // Frontmatter `nodeType` is authoritative; folder / domain are fallbacks.
  label = pickLabel({
    explicit:  fm.nodeType,                  // 'Thesis' | 'Sector' | 'Stock' | 'Company' |
                                             // 'Regime' | 'Signal' | 'MacroIndicator' | 'EvidenceArtifact'
    domain:    fm.domain,                    // 'macro' -> MacroIndicator|Regime, 'company' -> Company|Stock, etc.
    folder:    inferLabelFromFolder(note),   // '050-theses' -> Thesis, '060-sectors' -> Sector, ...
  })

  // 3. Required-fields check per label (fail → skip with warning).
  switch (label) {
    case 'Thesis':         require(fm.id, fm.name)                         break
    case 'Stock':          require(fm.ticker || fm.symbol)                 break
    case 'Company':        require(fm.canonicalName || fm.name)            break
    case 'Sector':         require(fm.name)                                break
    case 'Regime':         require(fm.id, fm.name)                         break
    case 'Signal':         require(fm.id, fm.signalStatus)                 break
    case 'MacroIndicator': require(fm.symbol || fm.id, fm.frequency)       break
    case 'EvidenceArtifact':
                            require(fm.datePulled || fm.date, fm.source)   break
  }

  // 4. Emit the typed node — NO VaultNote node, NO DERIVED_FROM_NOTE edge.
  graph.addNode({
    labels: ['BlindSpotNode', label, ...(extraLabels(label))],  // e.g. Stock => [BlindSpotNode, Entity, Company, Stock]
    properties: { ...base, ...frontmatterToProps(fm, label) },
    mergeKey: mergeKeyFor(label, fm),         // e.g. ticker for Stock, canonicalName for Company
  })
```

### What changes vs current behaviour

- `buildBlindSpotGraph` (in `lib/neo4j-blind-spot-graph.mjs`) currently emits a `VaultNote` node per scanned note and a `DERIVED_FROM_NOTE` edge from the typed node to it. Both go away.
- Provenance is set as **scalar properties** on the typed node (`source_path`, `source_url`, …) using the same names Step 2 of the migration writes onto existing nodes — so a re-import will MERGE cleanly on `source_path`.
- `collectBlindSpotNotes` keeps its current behaviour (it just enumerates eligible files); the filter happens inside `buildBlindSpotGraph`.

### Merge keys (for idempotent reimport)

| Label | Merge key |
|---|---|
| Thesis | `id` (frontmatter `id`) |
| Stock | `ticker` (uppercased, exchange-normalized) |
| Company | `canonicalName` (slug-normalized) |
| Sector | `id` or normalized `name` |
| Regime | `id` |
| Signal | `id` |
| MacroIndicator | `symbol` (provider-prefixed, e.g. `FRED:UNRATE`) |
| EvidenceArtifact | `source_path` (now that it's a property, this is the natural key) |

---

## (f) Company vs Stock overlap — recommendation

Current state (from schema outline): `Company` = 1,385 and `Stock` = 1,384; the dominant compound label is `BlindSpotNode:Entity:Company:Stock` (1,384 nodes). So 1,384 nodes carry both labels, plus 1 lone `Company` (`BlindSpotNode:Company:Donor`).

Two clean options:

### Option 1 — MERGE into one label `Stock` (simpler)

Treat the issuer and the listing as one node. Drop `Company` as a label. Add a `companyName` property to `Stock` for the issuer name; keep `ticker`, `exchange` for the listing facet. The lone `:Donor:Company` becomes `:Donor:Entity` (no `Stock`).

Pros: matches current reality (1,384/1,385 already coincide). Simpler queries. No new joins.
Cons: cannot model multi-listed issuers (ADR + local), cannot model private companies that aren't tradable. We have 1 such case today (the Donor).

### Option 2 — FORMAL SPLIT (issuer vs listing) — recommended

`Company` = issuer (one per legal entity). `Stock` = listing (one per ticker × exchange). Relationship: `(:Stock)-[:ISSUED_BY]->(:Company)`. Most rows get a 1:1 pairing; the Donor stays a pure `:Company` with no `Stock` peer; future ADRs can attach multiple `Stock` to one `Company`.

Pros: extensible to dual-listings, private companies, M&A (Company merges, Stock retires). Matches how FMP / provider data actually models it.
Cons: requires a one-off split + adds an edge to every existing pairing.

**DECISION: Option 2 (formal split) — LOCKED.** Cheap to do now (1,384 rows), expensive to do later, and it removes the awkward compound `Company:Stock` label everywhere. The split runs as its own phase inside Step A (after the VaultNote purge, before the verification block in section e′).

Donation-tracking note: the user has indicated future use cases for `Company ↔ PoliticalActor ↔ Donor` edges. This split is DESIGNED to accommodate that, but NO donation edges are written in this pass. The lone `:Donor:Company` (1 node) stays a pure `:Company` with `:Donor` label preserved — do NOT mint a `:Stock` peer for it, do NOT relabel it `:Person`. See TODO comment in the Cypher.

```cypher
// DRY-RUN: how many compound nodes (expect 1,384)
MATCH (n:Company:Stock) RETURN count(n) AS compound;

// DRY-RUN: company peer ids must not collide with existing BlindSpotNode ids.
MATCH (n:Company:Stock)
WITH 'world:company:' + coalesce(n.ticker, n.symbol, replace(n.id, 'world:stock:', '')) AS companyId
MATCH (existing:BlindSpotNode {id: companyId})
RETURN count(existing) AS existingCompanyIdCollisions; // expect 0

// IMPORTANT: use the 2026-06-01 live-applied query below, not a canonicalName-only
// MERGE. While source nodes still carry :Company, MERGEing on (:Company
// {canonicalName: ...}) can match the source Stock node itself and create a
// bad self-loop.

// APPLY (APOC batched, live-applied 2026-06-01): split - keep node as Stock,
// mint a distinct Company peer, copy provenance/domain membership, add ISSUED_BY.
CALL apoc.periodic.iterate(
  "MATCH (n:Company:Stock) RETURN n",
  "WITH n, 'world:company:' + coalesce(n.ticker, n.symbol, replace(n.id, 'world:stock:', '')) AS companyId
   MERGE (c:BlindSpotNode {id: companyId})
     ON CREATE SET c.createdBy = 'step_a_company_stock_split'
   SET c:Entity:Company,
       c.canonicalName = coalesce(c.canonicalName, n.canonicalName, n.name, n.ticker, n.symbol),
       c.name = coalesce(c.name, n.name, n.canonicalName, n.ticker, n.symbol),
       c.nodeType = coalesce(c.nodeType, 'Company'),
       c.country = coalesce(c.country, n.country),
       c.sector = coalesce(c.sector, n.sector),
       c.source_path = coalesce(c.source_path, n.source_path),
       c.source_url = coalesce(c.source_url, n.source_url),
       c.source_rel_path = coalesce(c.source_rel_path, n.source_rel_path),
       c.source_vault = coalesce(c.source_vault, n.source_vault),
       c.source_folder = coalesce(c.source_folder, n.source_folder),
       c.asOfDate = coalesce(c.asOfDate, n.asOfDate),
       c.status = coalesce(c.status, n.status),
       c.domain = coalesce(c.domain, n.domain),
       c.subdomain = coalesce(c.subdomain, n.subdomain),
       c.tags = coalesce(c.tags, n.tags)
   MERGE (n)-[:ISSUED_BY {source: 'step_a_company_stock_split', method: 'formal_issuer_listing_split'}]->(c)
   WITH n, c
   OPTIONAL MATCH (n)-[:BELONGS_TO_DOMAIN]->(d:Domain)
   FOREACH (_ IN CASE WHEN d IS NULL THEN [] ELSE [1] END |
     MERGE (c)-[:BELONGS_TO_DOMAIN {source: 'step_a_company_stock_split', method: 'copied_from_stock_listing'}]->(d)
   )
   REMOVE n:Company",
  {batchSize: 500, parallel: false}
);

// Verify no accidental self-loops:
MATCH (s:Stock)-[:ISSUED_BY]->(s) RETURN count(s) AS issuedBySelfLoops; // expect 0

// SUPERSEDED SKETCH BELOW: retained for context only; do not run it.

// APPLY (APOC batched): split — keep node as Stock, mint a Company peer, add ISSUED_BY
CALL apoc.periodic.iterate(
  "MATCH (n:Company:Stock) RETURN n",
  "MERGE (c:Company {canonicalName: coalesce(n.canonicalName, n.name)})
     ON CREATE SET c.name = n.name, c.country = n.country, c.sector = n.sector,
                   c.source_path = n.source_path, c.source_url = n.source_url,
                   c.source_rel_path = n.source_rel_path,
                   c.source_vault = n.source_vault,
                   c.source_folder = n.source_folder
   MERGE (n)-[:ISSUED_BY]->(c)
   REMOVE n:Company",
  {batchSize: 500, parallel: false}
);

// The lone :Donor:Company (no :Stock label) is untouched by the query above —
// it stays as a pure :Company:Donor. Verify:
MATCH (c:Company:Donor) WHERE NOT (c)<-[:ISSUED_BY]-(:Stock) RETURN count(c); // expect 1

// TODO (future, not this pass): wire donation edges
//   (:Company)-[:DONATED_TO {amount, asof}]->(:PoliticalActor)
//   See user note 2026-06-01: design accommodates, but not built now.
```

---

## (e′) Verification queries (post-migration)

```cypher
// 1. Zero VaultNotes remain
MATCH (v:VaultNote) RETURN count(v) AS shouldBeZero;       // expect 0

// 2. Zero DERIVED_FROM_NOTE edges remain
MATCH ()-[r:DERIVED_FROM_NOTE]->() RETURN count(r);        // expect 0

// 3. EvidenceArtifact count preserved (minus quarantined-and-later-deleted, if any)
MATCH (e:EvidenceArtifact) RETURN count(e);                // expect 7380 (or 7380 - deletedOrphans)

// 4. Every EvidenceArtifact that previously had a note now carries source_path
MATCH (e:EvidenceArtifact) WHERE e.source_path IS NOT NULL RETURN count(e);

// 5. Total node count dropped by ~7866
// Run BEFORE migration:  MATCH (n) RETURN count(n) AS before;
// Run AFTER  migration:  MATCH (n) RETURN count(n) AS after;
// Assert: before - after = 7866 (± quarantined-then-deleted).

// 6. Total relationship count dropped by ~15732
// Same before/after pattern on:  MATCH ()-[r]->() RETURN count(r);

// 7. No quarantined node lacks provenance (sanity)
MATCH (e:Quarantined) WHERE e.source_path IS NULL RETURN count(e);  // expect 0

// 8. No constraint/index left dangling on :VaultNote
SHOW CONSTRAINTS YIELD labelsOrTypes WHERE 'VaultNote' IN labelsOrTypes;  // expect empty
SHOW INDEXES     YIELD labelsOrTypes WHERE 'VaultNote' IN labelsOrTypes;  // expect empty
```

---

## Rollback strategy

In order of preference:

1. **Full restore** from the `neo4j-admin database dump` taken in Step 1. Cleanest. Assumes no writes happened between dump and rollback decision; if the puller ran in the interim, prefer option 2.
2. **Partial replay** from `pre-step-a-provenance-snapshot.csv`:
   ```cypher
   LOAD CSV WITH HEADERS FROM 'file:///pre-step-a-provenance-snapshot.csv' AS row
   MERGE (v:VaultNote { relativePath: row.relativePath })
     ON CREATE SET v.obsidianUrl = row.obsidianUrl,
                   v.sourcePath  = row.sourcePath,
                   v.vault       = row.vault,
                   v.sourceFolder = row.sourceFolder
   WITH row, v
   MATCH (n) WHERE elementId(n) = row.nodeId
   MERGE (n)-[:DERIVED_FROM_NOTE]->(v);
   ```
   Caveat: `elementId` is not portable across DB restarts; if the DB was restarted between snapshot and rollback, match by `source_path` instead and accept that some links may not reattach exactly.
3. **Forget rollback, re-run the puller** with the new spec — assuming Step C (puller refit) is in place, a fresh import will rebuild typed nodes with provenance properties from scratch and the only loss is the `:Quarantined` orphans (which had no other edges anyway, i.e. no information loss).

---

## (g) Resolved Decisions

All Step-A open questions are RESOLVED. The spec body above and the Cypher in section (f) reflect these answers. Implementing agents must NOT re-open them.

- **A1 — Provenance property names → RESOLVED.** Copy the FULL optional set (`source_path`, `source_url`, `source_rel_path`, `source_vault`, `source_folder`) onto EvidenceArtifact during the Step 2 provenance copy. Rationale: extras give grep-back to vault layout at near-zero cost.
- **A2 — Orphan policy → RESOLVED.** Use Option 3: apply `:Quarantined` label + `quarantined_at` + `quarantined_reason`; keep the node, do not delete. Surface via the verification query in section (e′) #7. Rationale: irreversibility risk too high vs. tiny disk cost.
- **A3 — Company vs Stock → RESOLVED.** Use Option 2: formal split (`Company` = legal issuer entity, `Stock` = listing; linked by `:ISSUED_BY`). Donation tracking (`Company ↔ PoliticalActor ↔ Donor`) is NOT a priority this pass — design must ACCOMMODATE it later but no donation edges are built now. The Donor row stays a pure `:Company` (no `:Stock` peer); leave its `:Donor` label intact and add a TODO comment in the split Cypher.
- **A4 — Provenance metrics → RESOLVED.** Implementing agent may swap unhelpful provenance metrics without user re-confirmation.
- **A5 — Index trade-off → RESOLVED.** Use the composite key approach already proposed in the spec (composite uniqueness on `(source_path, source_url)` where applicable; the single-column `ea_source_path` index stays for puller lookups).
- **A6 — APOC availability → RESOLVED.** APOC IS INSTALLED. Prefer `apoc.periodic.iterate` for batched mutations (Step 2, Step 7 purge, Step 5 quarantine) over `CALL { } IN TRANSACTIONS` where it produces clearer idempotency.
