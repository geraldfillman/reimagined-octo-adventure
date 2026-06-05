# Neo4j Blind-Spot Graph Refactor — RUNBOOK

Single entry point for an executing agent. Read this top-to-bottom, then execute Step A → Step B → Step C in order, halting on any gate failure.

---

## Agent Brief (copy-paste at session start)

```
You are executing the Neo4j blind-spot-graph refactor.

1. Read this RUNBOOK.md in full before any write.
2. Execute Step A, then Step B, then Step C — IN ORDER. Do not interleave.
3. For each step:
   a. Read the linked spec file in full.
   b. Run the step's pre-flight gate queries — counts must match expected.
   c. Execute the named phases in the spec, in order, DRY-RUN before APPLY.
   d. Run the step's success-gate queries — counts must match expected.
   e. Take a `neo4j-admin database dump` between steps.
4. HALT immediately on any gate failure. Report the gate name, query, actual vs expected, and stop. Do not attempt recovery without user approval.
5. After each step, post a short status: phases run, gate results, snapshot path, anomalies.
6. All decisions A1-A6, B1-B6, C1-C5 are RESOLVED. Do NOT re-open them. See Decision Table below.
7. APOC is available. Prefer `apoc.periodic.iterate` for batched mutations.
8. Never run with `--stale-ok` or `--allow-stale`. Never use `dangerously-skip-permissions`.
```

---

## (a) Goal, Scope, Non-Goals

**Goal.** Take the blind-spot graph snapshot 2026-06-01 and refactor it into a clean, queryable, ML-ready graph: purge vault-note pollution, reify candidate links for triage, and split DataPull into a two-tier (batch metadata + metric snapshot) schema with BOD/EOD cadence.

**Scope.** Three sequential migrations against the Neo4j instance referenced in `.env` (`NEO4J_URI`). All write operations are idempotent via `MERGE` + composite keys. Each step includes pre-flight, dry-run, apply, verification, and rollback.

**Non-Goals.** No new business logic. No dashboard rewrites. No donation-edge construction (designed-for-future per A3). No vault-side coupling changes (B3). No new puller scheduler — only schema + ingestion primitives; user wires cadence orchestration separately (C5).

---

## (b) Run Order & Rationale

| Order | Step | Spec file | Why this order |
|---|---|---|---|
| 1 | **A** — Import filter + VaultNote purge + Company/Stock split | `step-a-import-filter-and-vaultnote-purge.md` | Removes ~7,866 polluting VaultNote nodes and their `DERIVED_FROM_NOTE` edges FIRST so B and C operate on a clean graph. Also splits `Company:Stock` compound labels so C's `OBSERVES` edges land on canonical `:Stock` listings, not issuer entities. |
| 2 | **B** — CandidateLink reification + triage | `step-b-candidatelink-reification.md` | Operates on a graph free of vault pollution. Promotion-edge inference depends on clean source/target labels established by A's Company/Stock split. |
| 3 | **C** — DataPull / MetricSnapshot schema + ingestion | `step-c-datapull-metricsnapshot-ingestion.md` | Time-series observations only meaningful once `:Stock` / `:Sector` / `:MacroIndicator` / `:Commodity` targets are canonical (post-A) and the proposal backlog is triaged (post-B) so `latest_*` denorm writes to the correct nodes. |

---

## (c) Per-Step Execution

### Step A — Import filter + VaultNote purge

- **Spec:** `step-a-import-filter-and-vaultnote-purge.md`
- **Phases (in order):** Step 1 snapshot → Step 2 copy provenance → Step 3 verify → Step 4 dry-run orphans → Step 5 quarantine orphans → Step 6 dry-run purge → Step 7 apply purge → Step 8 drop unused indexes → (f) Company/Stock formal split.
- **Added checkpoint:** Run Step 4b from the spec before Step 5. It verifies that `VaultNote -> BELONGS_TO_DOMAIN` edges are redundant mirrors of typed-node domain edges, and repairs missing direct typed-node domain edges only if the dry-run returns rows.
- **Pre-flight gates (must pass before writing):**
  - `MATCH (v:VaultNote) RETURN count(v)` ≈ 7,866
  - `MATCH (n)-[:DERIVED_FROM_NOTE]->(:VaultNote) RETURN count(*)` ≈ 7,866
  - `MATCH (:VaultNote)-[:BELONGS_TO_DOMAIN]->(:Domain) RETURN count(*)` = 7,866, and every corresponding typed node already has the same direct `BELONGS_TO_DOMAIN` edge.
  - `MATCH (n:Company:Stock) RETURN count(n)` = 1,384
  - APOC available: `RETURN apoc.version()` returns a version string.
- **Success gates (must pass before Step B):**
  - `MATCH (v:VaultNote) RETURN count(v)` = 0
  - `MATCH ()-[r:DERIVED_FROM_NOTE]->() RETURN count(r)` = 0
  - `MATCH (:VaultNote)-[:BELONGS_TO_DOMAIN]->(:Domain) RETURN count(*)` = 0 (because `VaultNote` is gone; typed-node domain edges remain)
  - `MATCH (e:EvidenceArtifact) WHERE e.source_path IS NULL AND NOT e:Quarantined RETURN count(e)` = 0
  - `MATCH (n:Company:Stock) RETURN count(n)` = 0 (post-split)
  - `MATCH (:Stock)-[:ISSUED_BY]->(:Company) RETURN count(*)` = 1,384
  - `MATCH (c:Company:Donor) WHERE NOT (c)<-[:ISSUED_BY]-(:Stock) RETURN count(c)` = 1
- **Abort/rollback triggers:** any pre-flight count differs by >1% from expected; Step 3 verification returns missing `source_path`; Step 4b shows missing typed-node domain edges that cannot be repaired idempotently; APOC unavailable; orphan count >50 (escalate before quarantining).

### Step B — CandidateLink reification + triage

- **Spec:** `step-b-candidatelink-reification.md`
- **Phases (in order):** Step 1 constraints → Step 2 reify edges → Step 3 verify + drop raw edges → Step 4 triage scoring (RUN AUTOMATICALLY per B5) → Step 6 bulk-reject heuristic (RUN AUTOMATICALLY per B5) → Step 7 cadence query (read-only, prove it works) → Step 8 blind-spot surface (read-only, prove it works). Step 5 promotion path is NOT run in the migration — it's the steady-state operator action.
- **Pre-flight gates:**
  - `MATCH ()-[r:CANDIDATE_LINK]->() RETURN count(r)` = 450
  - `MATCH (c:CandidateLink) RETURN count(c)` = 0 (no prior partial run)
  - Every CANDIDATE_LINK has a non-null `r.id`.
- **Success gates:**
  - `MATCH (c:CandidateLink) RETURN count(c)` = 450
  - `MATCH ()-[r:CANDIDATE_LINK]->() RETURN count(r)` = 0
  - Every CandidateLink has exactly 1 `:PROPOSED_BY` in + 1 `:PROPOSES` out (450 OK, 0 bad).
  - `MATCH (c:CandidateLink) WHERE c.score IS NULL RETURN count(c)` = 0
- **Abort/rollback triggers:** Step 3 verification triple returns anything other than (450, 450, 450); any CandidateLink ends up with score outside [0,1]; bulk-reject affects >50% of nodes (sanity-check the heuristic).

### Step C — DataPull / MetricSnapshot schema + ingestion

- **Spec:** `step-c-datapull-metricsnapshot-ingestion.md`
- **Phases (in order):** Step C.1 constraints + indexes → Step C.2 backfill DataPull metadata → **(SKIP C.3 per decision C1)** → Step C.4 latest-value denormalization. The puller code skeleton (`scripts/pullers/neo4j-fmp-metric-snapshots.mjs`) is installed but NOT invoked as part of the migration — it's the steady-state cadence runner.
- **Pre-flight gates:**
  - `MATCH (d:DataPull) RETURN count(d)` = 7,205
  - Pre-flight Check #3 (inline-values detector) returns 0. If non-zero, HALT (contradicts C1).
  - Target counts: Stock 1,384, Sector 34, MacroIndicator 49, Commodity 8.
  - `MATCH (m:MetricSnapshot) RETURN count(m)` = 0 (label unused).
- **Success gates:**
  - All four `MetricSnapshot` constraints/indexes exist (`SHOW CONSTRAINTS` / `SHOW INDEXES`).
  - `MATCH (d:DataPull) WHERE d.provider IS NULL OR d.status IS NULL RETURN count(d)` = 0
  - `MATCH (m:MetricSnapshot) WHERE NOT (m)<-[:PRODUCED]-(:DataPull) OR NOT (m)-[:OBSERVES]->() RETURN count(m)` = 0
  - Composite uniqueness `(target_id, metric_name, asof)` holds (verification query returns empty).
- **Abort/rollback triggers:** Pre-flight Check #3 > 0; any MetricSnapshot orphaned (missing producer or target) after a write; `latest_*` denorm writes property to wrong label.

---

## (d) Global Pre-flight (run ONCE before Step A)

```cypher
// APOC available
RETURN apoc.version() AS apoc_version;

// Total node + edge counts (record these for before/after deltas)
MATCH (n) RETURN count(n) AS total_nodes_before;
MATCH ()-[r]->() RETURN count(r) AS total_edges_before;
```

Operational:
- `neo4j-admin database dump --database=<db> --to-path=<backup-dir>` — REQUIRED before Step A and between every step.
- **Dry-run toggle:** every APPLY block in A/B/C has a preceding DRY-RUN. Set a session variable `:param applyMode => false` to short-circuit APPLY blocks during a rehearsal pass; flip to `true` only after the DRY-RUN counts match expected.
- Never run with `--stale-ok` / `--allow-stale`. Never set `--no-verify` on git hooks.

---

## (e) Decision Reference Table

Each user decision baked into the specs as of 2026-06-01:

| ID | Spec file | Section in spec | One-line answer |
|---|---|---|---|
| A1 | step-a | (c) Step 2; (g) Resolved | Copy FULL optional provenance set (5 props) onto EvidenceArtifact. |
| A2 | step-a | (c) Step 5; (d); (g) Resolved | Orphans get `:Quarantined` label, keep node, do not delete. |
| A3 | step-a | (f); (g) Resolved | Formal Company/Stock split via `:ISSUED_BY`; donation tracking is TODO-only. |
| A4 | step-a | (g) Resolved | Implementing agent may swap unhelpful provenance metrics freely. |
| A5 | step-a | (g) Resolved | Composite-key index approach (already in spec). |
| A6 | step-a | (c) all; (g) Resolved | APOC available — prefer `apoc.periodic.iterate` for batching. |
| B1 | step-b | (e) Step 5; (f) Resolved | APOC available — use `apoc.merge.relationship` for dynamic edges. |
| B2 | step-b | (e) Step 5; (f) Resolved | Keep CandidateLink post-promotion; stamp `fromCandidateLink: c.id` on new edge. |
| B3 | step-b | (f) Resolved | Vault-side `reviewRoute` coupling NOT RELEVANT — dropped. |
| B4 | step-b | (d) Step 4; (f) Resolved | Implementing agent picks clearest label-pair → rel-type mapping (table in Step 5). |
| B5 | step-b | (d) Step 4 + (f) Step 6; (f) Resolved | Run scoring AND bulk-reject AUTOMATICALLY in one-time triage. |
| B6 | step-b | Step 7 + Step 8; (f) Resolved | Cadence weekly-review + blind-spot surface queries adopted as-is. |
| C1 | step-c | Step C.3 (SKIPPED); (f) Resolved | No inline-value migration — existing DataPulls are batch-metadata only. |
| C2 | step-c | Step C.1; (f) Resolved | `target_id = t.id` as foreign key for `OBSERVES`. |
| C3 | step-c | all Cypher; (f) Resolved | snake_case throughout (`metric_name`, `latest_<m>`, `latest_<m>_asof`, `asof`, etc). |
| C4 | step-c | Step C.1; (f) Resolved | Native unit + `unit` string property; normalize at query time. |
| C5 | step-c | (f′) Cadence: BOD / EOD; (f) Resolved | Two cadences (BOD pre-market + EOD close); user wires scheduling separately. |

---

## (f) After the Run

- Take a final `neo4j-admin database dump` tagged `post-refactor-2026-06-01`.
- Update the dashboard freshness checks to use the new `latest_*` denorm properties.
- Hand off the puller skeleton (`scripts/pullers/neo4j-fmp-metric-snapshots.mjs`) to the cadence orchestrator for BOD/EOD wiring.
- Schedule the weekly CandidateLink review batch (Step B Step 7) and the orphan cadence cleanup (Step A section d, 14-day grace).

---

## (g) Post-Refactor Roadmap

### Step D — Scenario theory connections

- **Plan:** `step-d-scenario-theory-connections-plan.md`
- **Status:** Post-refactor extension surface. Do not run as part of the destructive A → B → C migration sequence.
- **Purpose:** Add a `Scenario` / `ShockVector` / `RiskTheme` layer so broad theories can pull in stocks, sectors, commodities, regimes, and evidence gaps through metadata/property overlap while keeping uncertain conclusions as reviewable `CandidateLink` nodes.
- **First scenario:** `scenario:2026-leverage-oil-fed-policy-fragility`, covering margin debt stress, bond-market uncertainty, Iran/Hormuz oil shock, and Fed reaction-function risk.
- **Execution gate:** Take a fresh Neo4j backup before live Step D writes, then run the new puller in `--dry-run --json` mode before applying.
- **Manual command:** `node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --dry-run --json`
- **Safety rule:** Scenario exposure stays as `CandidateLink` review work first; do not create permanent `FAVORS_*`, `PRESSURES_*`, `INDICATES_*`, or `AFFECTS_*` edges from Step D inference.
