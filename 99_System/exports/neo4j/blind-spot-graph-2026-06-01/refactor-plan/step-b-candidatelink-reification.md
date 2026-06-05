# Step B — CandidateLink Reification + Triage Workflow

## (a) Goal

Convert the 450 existing `:CANDIDATE_LINK` edges into first-class `:CandidateLink` nodes carrying full review state, wire them to source/target via `:PROPOSED_BY` / `:PROPOSES`, then drop the raw edges. Add scoring, promotion, rejection, and cadence-review queries so the 450-item backlog can be triaged once and the steady-state can run weekly.

Current baseline (from system snapshot):

| Item                | Count |
|---------------------|-------|
| `:CANDIDATE_LINK` edges | 450 |
| Thesis nodes        | 43    |
| Regime / Sector / Stock | 30 / 34 / 1384 |
| CSV data rows       | 450 (451 lines incl. header) |
| Distinct `method`   | 1 (`regime_data_gap`) |
| Distinct `weight`   | 1 (`0.25`) |
| Distinct `confidence` | 1 (`low`) |

CSV columns confirmed via `ctx_execute_file`:
`id, sourceId, targetId, type, source, method, confidence, weight, status, reason, evidenceCount, missingEvidence, firstSeen, lastSeen, reviewState, reviewRoute, createdBy, asOfDate`.

Every row maps to a property on the new node (see Step 2). Note that all current rows have `targetId = domain:evidence` and `sourceId` starts with `mydata:thesis:...` — i.e. the entire backlog is "Thesis → generic evidence domain". This shapes the scoring heuristic in Step 4.

Live preflight after Step A on 2026-06-01 showed the edge count baseline still held (`450`), but the backlog was broader than the original snapshot:

| Method | Count | Main shape |
|---|---:|---|
| `frontmatter_gap` | 398 | Mostly `Regime -> Stock`, plus policy/politics items to sectors/entities |
| `regime_data_gap` | 43 | `Thesis -> domain:evidence` |
| `source_gap` | 9 | `NewsItem/EvidenceArtifact -> Regime` |

All 450 raw edges had non-null `id`, `status='candidate'`, `reviewState='needs_review'`, and null `confidence` / `reviewRoute`. Do not fabricate those null source values merely to make property-completeness checks look full.

---

## (b) Pre-flight checks

Run all of these before any write. Compare counts against the table above.

```cypher
// 1. CANDIDATE_LINK edge total — expect 450
MATCH ()-[r:CANDIDATE_LINK]->()
RETURN count(r) AS candidate_link_edges;

// 2. Distribution by (sourceLabel, targetLabel, method, weight)
MATCH (s)-[r:CANDIDATE_LINK]->(t)
RETURN labels(s)[0] AS srcLabel,
       labels(t)[0] AS tgtLabel,
       r.method     AS method,
       r.weight     AS weight,
       r.confidence AS confidence,
       count(*)     AS n
ORDER BY n DESC;

// 3. Are there already any :CandidateLink nodes from prior runs? (idempotency check)
MATCH (c:CandidateLink) RETURN count(c) AS existing_candidate_link_nodes;

// 4. Are PROPOSED_BY / PROPOSES rels already present?
MATCH ()-[r:PROPOSED_BY]->() RETURN count(r) AS proposed_by_edges;
MATCH ()-[r:PROPOSES]->()    RETURN count(r) AS proposes_edges;

// 5. Sanity: every CANDIDATE_LINK has both endpoints resolvable
MATCH ()-[r:CANDIDATE_LINK]->()
WHERE startNode(r) IS NULL OR endNode(r) IS NULL
RETURN count(r) AS orphaned_edges;   // expect 0

// 6. Are there CANDIDATE_LINK edges missing an id property (would break MERGE key)?
MATCH ()-[r:CANDIDATE_LINK]->()
WHERE r.id IS NULL
RETURN count(r) AS missing_id;       // expect 0
```

---

## (c) Migration steps

### Step 1 — Constraints (idempotent)

```cypher
CREATE CONSTRAINT candidatelink_id_unique IF NOT EXISTS
FOR (c:CandidateLink) REQUIRE c.id IS UNIQUE;

CREATE INDEX candidatelink_status IF NOT EXISTS
FOR (c:CandidateLink) ON (c.status);

CREATE INDEX candidatelink_reviewState IF NOT EXISTS
FOR (c:CandidateLink) ON (c.reviewState);

CREATE INDEX candidatelink_score IF NOT EXISTS
FOR (c:CandidateLink) ON (c.score);
```

### Step 2 — Reify each `:CANDIDATE_LINK` edge into a `:CandidateLink` node

`MERGE` on `c.id` (= `r.id` from CSV) keeps it idempotent. Re-running just refreshes mutable fields via `ON MATCH`. Edges `:PROPOSED_BY` and `:PROPOSES` are also `MERGE`-d.

```cypher
MATCH (s)-[r:CANDIDATE_LINK]->(t)
WITH s, t, r,
     coalesce(r.id,
              'rel:' + coalesce(s.id, toString(id(s))) +
              ':CANDIDATE_LINK:' +
              coalesce(t.id, toString(id(t)))) AS clId
MERGE (c:CandidateLink {id: clId})
  ON CREATE SET
    c.method        = r.method,
    c.weight        = toFloat(r.weight),
    c.confidence    = r.confidence,
    c.status        = coalesce(r.status, 'candidate'),
    c.reason        = r.reason,
    c.evidenceCount = toInteger(coalesce(r.evidenceCount, 0)),
    c.missingEvidence = r.missingEvidence,
    c.reviewState   = coalesce(r.reviewState, 'needs_review'),
    c.reviewRoute   = r.reviewRoute,
    c.createdBy     = coalesce(r.createdBy, 'neo4j-blind-spot-graph'),
    c.asOfDate      = r.asOfDate,
    c.firstSeen     = coalesce(r.firstSeen, r.asOfDate),
    c.lastSeen      = coalesce(r.lastSeen,  r.asOfDate),
    c.source        = r.source,
    c.type          = coalesce(r.type, 'CANDIDATE_LINK'),
    c.score         = 0.0,             // populated by Step 4
    c.createdAt     = datetime()
  ON MATCH SET
    c.lastSeen      = coalesce(r.lastSeen, c.lastSeen),
    c.evidenceCount = toInteger(coalesce(r.evidenceCount, c.evidenceCount)),
    c.reason        = coalesce(r.reason, c.reason),
    c.updatedAt     = datetime()
MERGE (s)-[:PROPOSED_BY]->(c)
MERGE (c)-[:PROPOSES]->(t);
```

Dry-run preview (read-only count of what step 2 would touch):

```cypher
MATCH (s)-[r:CANDIDATE_LINK]->(t)
RETURN count(*) AS edges_to_reify,
       count(DISTINCT r.id) AS distinct_ids;
// expect: 450, 450
```

### Step 3 — Verify reification then drop raw edges

Verification (must all pass before destructive step):

```cypher
// (i) New node count matches edge count
MATCH (c:CandidateLink) RETURN count(c) AS cl_nodes;          // expect 450

// (ii) Every edge has a matching node by id
MATCH ()-[r:CANDIDATE_LINK]->()
OPTIONAL MATCH (c:CandidateLink {id: r.id})
RETURN count(r) AS edges, count(c) AS matched;                // expect 450, 450

// (iii) Every CandidateLink has exactly one PROPOSED_BY in + one PROPOSES out
MATCH (c:CandidateLink)
RETURN
  count(c)                                              AS total,
  sum(CASE WHEN size([(x)-[:PROPOSED_BY]->(c) | x]) = 1 THEN 1 ELSE 0 END) AS one_in,
  sum(CASE WHEN size([(c)-[:PROPOSES]->(y) | y])    = 1 THEN 1 ELSE 0 END) AS one_out;
// expect: 450, 450, 450
```

Dry-run delete preview:

```cypher
MATCH ()-[r:CANDIDATE_LINK]->()
RETURN count(r) AS to_delete;   // expect 450
```

Destructive drop (only after the three checks above all return the expected numbers):

```cypher
MATCH ()-[r:CANDIDATE_LINK]->()
DELETE r;
```

Post-drop assertion:

```cypher
MATCH ()-[r:CANDIDATE_LINK]->() RETURN count(r) AS remaining;  // expect 0
```

Idempotency note: re-running Steps 1–3 is safe. Step 2 is `MERGE`-based; Step 3 only deletes edges that still exist. After the first successful pass there are zero `:CANDIDATE_LINK` edges, so subsequent drops are no-ops.

---

## (d) Step 4 — Triage scoring

All 450 share `method = regime_data_gap`, `weight = 0.25`, `confidence = low` — so the CSV `weight` column carries no signal. Score is computed from graph context:

- **`coverage`** — number of confirmed outgoing edges already on the source Thesis (`SUPPORTS_THESIS` reverse, `AFFECTS_STOCK`, `INDICATES_REGIME`, `MENTIONS`, `LINKS_TO`). More existing edges → lower priority (thesis is well-covered).
- **`recency`** — days since most recent `EvidenceArtifact` `SOURCED_FROM` source. Older → higher priority.
- **`targetSpecificity`** — generic domain targets (`domain:evidence`, anything with id starting `domain:`) score 0; `Regime`/`Sector`/`Stock`/`Company` score 1.

Formula (all components scaled 0..1, then weighted; tweakable):

```
score = 0.45 * coverageScore       // (1 - min(coverage / 20, 1))
      + 0.35 * recencyScore        // min(daysStale / 180, 1)
      + 0.20 * targetSpecificity
```

```cypher
// Populate / refresh CandidateLink.score
MATCH (s)-[:PROPOSED_BY]->(c:CandidateLink)-[:PROPOSES]->(t)
WITH c, s, t,
     // (a) coverage: how many real edges does source already have?
     size([(s)-[r]->() WHERE type(r) IN
           ['SUPPORTS_THESIS','AFFECTS_STOCK','INDICATES_REGIME',
            'MENTIONS','LINKS_TO','BELONGS_TO_DOMAIN'] | r])
       + size([(x)-[r2:SUPPORTS_THESIS]->(s) | r2]) AS coverage,
     // (b) recency: days since newest EvidenceArtifact tied to source
     [(s)<-[:MENTIONS|SOURCED_FROM|DERIVED_FROM_NOTE]-(e:EvidenceArtifact)
        WHERE e.asOfDate IS NOT NULL | e.asOfDate] AS evidenceDates,
     // (c) target specificity
     CASE
       WHEN any(l IN labels(t) WHERE l IN ['Regime','Sector','Stock','Company','MacroIndicator']) THEN 1.0
       WHEN t.id STARTS WITH 'domain:' THEN 0.0
       ELSE 0.4
     END AS targetSpecificity
WITH c,
     1.0 - (CASE WHEN coverage > 20 THEN 1.0 ELSE coverage/20.0 END) AS coverageScore,
     CASE
       WHEN size(evidenceDates) = 0 THEN 1.0
       ELSE (CASE WHEN duration.inDays(date(reduce(m=evidenceDates[0], d IN evidenceDates |
                            CASE WHEN d > m THEN d ELSE m END)), date()).days > 180
             THEN 1.0
             ELSE duration.inDays(date(reduce(m=evidenceDates[0], d IN evidenceDates |
                            CASE WHEN d > m THEN d ELSE m END)), date()).days / 180.0
             END)
     END AS recencyScore,
     targetSpecificity
SET c.score              = 0.45 * coverageScore
                         + 0.35 * recencyScore
                         + 0.20 * targetSpecificity,
    c.scoreCoverage      = coverageScore,
    c.scoreRecency       = recencyScore,
    c.scoreTargetSpecif  = targetSpecificity,
    c.scoredAt           = datetime();
```

Dry-run / sanity:

```cypher
MATCH (c:CandidateLink)
RETURN min(c.score), max(c.score), avg(c.score), count(c);
// expect 450 nodes, score in [0,1]
```

---

## (e) Step 5 — Promotion path

Reviewer sets `c.status = 'promoted'`. A single Cypher block then infers the real edge type from the labels of `s` and `t` and creates it, plus an audit link `:RESULTED_IN` from the CandidateLink to the new edge's reified record (we don't reify *all* promoted edges — we just stamp `c.resultedInType` and `c.promotedOn` and let the new edge live as a normal relationship).

Inference rules (extend as needed):

| Source label | Target label    | New edge type      |
|--------------|-----------------|--------------------|
| Thesis       | Stock / Company | `AFFECTS_STOCK`    |
| Thesis       | Regime          | `INDICATES_REGIME` |
| Thesis       | Sector          | `AFFECTS_SECTOR`   |
| Thesis       | MacroIndicator  | `INDICATES_REGIME` |
| Signal       | Thesis          | `SUPPORTS_THESIS`  |
| *any other*  | *any other*     | `LINKS_TO`         |

```cypher
// Promote all CandidateLinks marked promoted-but-not-yet-applied
MATCH (s)-[:PROPOSED_BY]->(c:CandidateLink {status:'promoted'})-[:PROPOSES]->(t)
WHERE c.appliedOn IS NULL
WITH s, t, c,
     CASE
       WHEN 'Thesis' IN labels(s) AND any(l IN labels(t) WHERE l IN ['Stock','Company']) THEN 'AFFECTS_STOCK'
       WHEN 'Thesis' IN labels(s) AND 'Regime'         IN labels(t)                      THEN 'INDICATES_REGIME'
       WHEN 'Thesis' IN labels(s) AND 'Sector'         IN labels(t)                      THEN 'AFFECTS_SECTOR'
       WHEN 'Thesis' IN labels(s) AND 'MacroIndicator' IN labels(t)                      THEN 'INDICATES_REGIME'
       WHEN 'Signal' IN labels(s) AND 'Thesis'         IN labels(t)                      THEN 'SUPPORTS_THESIS'
       ELSE 'LINKS_TO'
     END AS edgeType
CALL apoc.merge.relationship(
    s, edgeType,
    {fromCandidateLink: c.id},
    {promotedOn: datetime(), method: c.method, weight: c.weight, confidence: c.confidence},
    t, {}
) YIELD rel
SET c.appliedOn       = datetime(),
    c.resultedInType  = edgeType,
    c.promotedOn      = coalesce(c.promotedOn, datetime())
MERGE (c)-[:RESULTED_IN {edgeType: edgeType, createdAt: datetime()}]->(t);
```

APOC dependency note: `apoc.merge.relationship` is required because Cypher doesn't allow dynamic relationship types. If APOC isn't available, replace with one `MERGE` per edge-type branch wrapped in `FOREACH`/`CASE`. Idempotent because of `fromCandidateLink: c.id` key on the new edge and the `c.appliedOn IS NULL` guard.

CandidateLink is **kept** after promotion as an audit artifact; never deleted.

---

## (f) Step 6 — Rejection path

```cypher
// Single CandidateLink
MATCH (c:CandidateLink {id: $id})
SET c.status      = 'rejected',
    c.rejectedOn  = datetime(),
    c.rejectReason = $reason,
    c.reviewState = 'reviewed';
```

Bulk reject (e.g. all generic `domain:evidence` proposals on already-well-covered theses):

```cypher
MATCH (s:Thesis)-[:PROPOSED_BY]->(c:CandidateLink)-[:PROPOSES]->(t)
WHERE t.id = 'domain:evidence'
  AND c.scoreCoverage <= 0.2     // thesis already has >=16 real edges
  AND c.status = 'candidate'
SET c.status       = 'rejected',
    c.rejectedOn   = datetime(),
    c.rejectReason = 'thesis already well-covered; generic evidence target',
    c.reviewState  = 'reviewed';
```

---

## Step 7 — Cadence (weekly review batch)

```cypher
// Top-N CandidateLinks needing review, highest score first
:param batchSize => 25;
:param maxAgeDays => 30;

MATCH (s)-[:PROPOSED_BY]->(c:CandidateLink)-[:PROPOSES]->(t)
WHERE c.status = 'candidate'
  AND c.reviewState = 'needs_review'
  AND duration.inDays(date(c.firstSeen), date()).days <= $maxAgeDays
RETURN c.id           AS candidateId,
       labels(s)[0]   AS srcLabel,  s.id AS srcId,  s.name AS srcName,
       labels(t)[0]   AS tgtLabel,  t.id AS tgtId,
       c.score        AS score,
       c.scoreCoverage AS coverage,
       c.scoreRecency  AS recency,
       c.reviewRoute   AS reviewRoute,
       c.reason        AS reason
ORDER BY c.score DESC, c.lastSeen DESC
LIMIT $batchSize;
```

---

## Step 8 — Blind-spot surface

"Theses whose ONLY outgoing structure is unresolved proposals" — i.e. anything that would lose all its links if we rejected every CandidateLink today.

```cypher
MATCH (s:Thesis)
WITH s,
     size([(s)-[r]->()
           WHERE type(r) IN ['SUPPORTS_THESIS','AFFECTS_STOCK','INDICATES_REGIME',
                             'AFFECTS_SECTOR','MENTIONS','LINKS_TO'] | r])
       AS confirmedOut,
     [(s)-[:PROPOSED_BY]->(c:CandidateLink) WHERE c.status='candidate' | c] AS openCandidates
WHERE confirmedOut <= 1 AND size(openCandidates) >= 1
RETURN s.id AS thesisId, s.name AS thesisName,
       confirmedOut,
       size(openCandidates) AS openProposals,
       reduce(m = 0.0, c IN openCandidates |
              CASE WHEN c.score > m THEN c.score ELSE m END) AS topProposalScore
ORDER BY topProposalScore DESC, confirmedOut ASC
LIMIT 50;
```

---

## (d) Rollback strategy

If something is off after Step 2/3:

```cypher
// 1. Rebuild :CANDIDATE_LINK edges from :CandidateLink nodes (only if Step 3 already ran)
MATCH (s)-[:PROPOSED_BY]->(c:CandidateLink)-[:PROPOSES]->(t)
MERGE (s)-[r:CANDIDATE_LINK {id: c.id}]->(t)
  ON CREATE SET r.method=c.method, r.weight=c.weight, r.confidence=c.confidence,
                r.status=c.status, r.reason=c.reason, r.evidenceCount=c.evidenceCount,
                r.missingEvidence=c.missingEvidence, r.firstSeen=c.firstSeen,
                r.lastSeen=c.lastSeen, r.reviewState=c.reviewState,
                r.reviewRoute=c.reviewRoute, r.createdBy=c.createdBy,
                r.asOfDate=c.asOfDate;

// 2. Then drop reified form
MATCH (c:CandidateLink) DETACH DELETE c;
```

Recommended belt-and-braces: take a `neo4j-admin database dump` before Step 3.

---

## (e) Verification (final acceptance)

```cypher
// 1. Exactly 450 CandidateLink nodes
MATCH (c:CandidateLink) RETURN count(c) AS expected_450;

// 2. Zero raw CANDIDATE_LINK edges
MATCH ()-[r:CANDIDATE_LINK]->() RETURN count(r) AS expected_0;

// 3. Every CandidateLink has 1 in PROPOSED_BY + 1 out PROPOSES
MATCH (c:CandidateLink)
WITH c,
     size([(x)-[:PROPOSED_BY]->(c) | x]) AS inDeg,
     size([(c)-[:PROPOSES]->(y) | y])    AS outDeg
RETURN sum(CASE WHEN inDeg=1 AND outDeg=1 THEN 1 ELSE 0 END) AS ok,
       sum(CASE WHEN inDeg<>1 OR outDeg<>1 THEN 1 ELSE 0 END) AS bad;
// expect ok=450, bad=0

// 4. All CSV columns present as properties on at least one node
MATCH (c:CandidateLink)
RETURN
  sum(CASE WHEN c.method        IS NOT NULL THEN 1 ELSE 0 END) AS has_method,
  sum(CASE WHEN c.weight        IS NOT NULL THEN 1 ELSE 0 END) AS has_weight,
  sum(CASE WHEN c.confidence    IS NOT NULL THEN 1 ELSE 0 END) AS has_confidence,
  sum(CASE WHEN c.status        IS NOT NULL THEN 1 ELSE 0 END) AS has_status,
  sum(CASE WHEN c.reason        IS NOT NULL THEN 1 ELSE 0 END) AS has_reason,
  sum(CASE WHEN c.evidenceCount IS NOT NULL THEN 1 ELSE 0 END) AS has_evidenceCount,
  sum(CASE WHEN c.reviewState   IS NOT NULL THEN 1 ELSE 0 END) AS has_reviewState,
  sum(CASE WHEN c.reviewRoute   IS NOT NULL THEN 1 ELSE 0 END) AS has_reviewRoute,
  sum(CASE WHEN c.createdBy     IS NOT NULL THEN 1 ELSE 0 END) AS has_createdBy,
  sum(CASE WHEN c.asOfDate      IS NOT NULL THEN 1 ELSE 0 END) AS has_asOfDate,
  sum(CASE WHEN c.firstSeen     IS NOT NULL THEN 1 ELSE 0 END) AS has_firstSeen,
  sum(CASE WHEN c.lastSeen      IS NOT NULL THEN 1 ELSE 0 END) AS has_lastSeen,
  sum(CASE WHEN c.score         IS NOT NULL THEN 1 ELSE 0 END) AS has_score;

// 5. Score populated for all (after Step 4)
MATCH (c:CandidateLink) WHERE c.score IS NULL RETURN count(c) AS unscored;  // expect 0
```

---

## (f) Resolved Decisions

All Step-B open questions are RESOLVED. The spec body above and the Cypher in sections (c)–(e) reflect these answers. Implementing agents must NOT re-open them.

- **B1 — APOC availability → RESOLVED.** APOC IS INSTALLED. Use `apoc.merge.relationship` for dynamic-edge promotion (Step 5) and `apoc.periodic.iterate` for any large batched mutations where it improves idempotency.
- **B2 — Promotion audit shape → RESOLVED.** YES: keep CandidateLink post-promotion with `appliedOn` + `resultedInType` + `:RESULTED_IN` audit edge to target, AND stamp the new real edge with `fromCandidateLink: c.id`. Full backward traceability from any confirmed edge to its proposer.
- **B3 — `reviewRoute` defaults → RESOLVED, NOT RELEVANT.** This question concerned a vault feature unrelated to Neo4j and is dropped. Reify `reviewRoute` from the CSV value as-is (may be blank); do NOT auto-populate based on target label. Any prior references in this spec to vault-side `reviewRoute` coupling have been removed.
- **B4 — Scoring path → RESOLVED.** Implementing agent picks the clearest label-pair → relationship-type mapping for the promotion edge (the table in Step 5 stands). For recency scoring, continue using `EvidenceArtifact.asOfDate` against the source Thesis as currently coded; no change needed.
- **B5 — Bulk-reject heuristic → RESOLVED.** Run the graph-context scoring AND the bulk-reject heuristic AUTOMATICALLY as part of the one-time triage migration. Bake it into the migration script — not a separate manual pass. The bulk-reject block in Step 6 is executed in-line after scoring.
- **B6 — Blind-spot / cadence queries → RESOLVED.** YES to the cadence weekly-review batch (Step 7) and the blind-spot surface (Step 8) as proposed. No changes.
