# Step C — DataPull / MetricSnapshot Schema + Ingestion

## (a) Goal

Split the current single-tier `DataPull` model into a two-tier layer:

- **`DataPull`** — pull-batch metadata (provider, dataType, asOfDate, frequency, status). Stays put. 7,205 existing nodes are preserved.
- **`MetricSnapshot`** *(new)* — one node per `(target, metric_name, asof)` triple. Holds the actual numeric observation. Connected to its parent `DataPull` via `:PRODUCED` and to its observed entity (Stock/Sector/MacroIndicator/Commodity) via `:OBSERVES`.
- **Convenience denorm** — `latest_<metric>` and `latest_<metric>_asof` written onto the target node (Stock/Sector/MacroIndicator/Commodity) for O(1) dashboard reads.

This unlocks time-series queries, change-over-time alerts, and ML feature extraction without forcing dashboards to scan history.

---

## (b) Pre-flight Checks

Confirm current state before any writes. **Quoted counts (from schema outline 2026-06-01):** DataPull 7,205; Stock 1,384; Sector 34; MacroIndicator 49; Commodity 8.

```cypher
// 1. Verify DataPull count
MATCH (d:DataPull) RETURN count(d) AS dataPullCount;
// expect: 7205

// 2. Inspect property keys actually used on DataPull
MATCH (d:DataPull)
UNWIND keys(d) AS k
RETURN k, count(*) AS occurrences
ORDER BY occurrences DESC;
// expected keys per schema outline: source, signalStatus, frequency, datePulled,
// symbol, conviction, sector, provider, dataType, asOfDate, status

// 3. Find any DataPull nodes already carrying numeric metric values
//    (these need migrating into MetricSnapshot)
MATCH (d:DataPull)
WHERE any(k IN keys(d) WHERE k =~ '(?i)(price|value|yield|change|return|volume|pe|eps|marketcap|level)')
RETURN count(d) AS dataPullsWithMetrics;

// 4. Existing edges from DataPull
MATCH (d:DataPull)-[r]->()
RETURN type(r) AS rel, count(*) AS n ORDER BY n DESC;
// expected: SOURCED_FROM, MENTIONS, DERIVED_FROM_NOTE (removed in Step A)

// 5. Verify target node counts for OBSERVES edges
MATCH (s:Stock) RETURN count(s);         // expect 1384
MATCH (s:Sector) RETURN count(s);        // expect 34
MATCH (m:MacroIndicator) RETURN count(m); // expect 49
MATCH (c:Commodity) RETURN count(c);     // expect 8

// 6. Confirm MetricSnapshot label is unused
MATCH (m:MetricSnapshot) RETURN count(m) AS shouldBeZero;
```

---

## (c) Migration Steps (in order, idempotent)

### Step C.1 — Constraints + Indexes

```cypher
// Composite uniqueness — one snapshot per (target_id, metric_name, asof)
CREATE CONSTRAINT metricsnapshot_unique IF NOT EXISTS
FOR (m:MetricSnapshot)
REQUIRE (m.target_id, m.metric_name, m.asof) IS UNIQUE;

// Range index for timeseries scans
CREATE INDEX metricsnapshot_asof IF NOT EXISTS
FOR (m:MetricSnapshot) ON (m.asof);

CREATE INDEX metricsnapshot_target IF NOT EXISTS
FOR (m:MetricSnapshot) ON (m.target_id);

CREATE INDEX metricsnapshot_metric IF NOT EXISTS
FOR (m:MetricSnapshot) ON (m.metric_name);

// DataPull batch id uniqueness (if not already present)
CREATE CONSTRAINT datapull_id_unique IF NOT EXISTS
FOR (d:DataPull) REQUIRE d.id IS UNIQUE;
```

**Idempotency:** all `IF NOT EXISTS`. Safe to re-run.

### Step C.2 — Backfill DataPull batch metadata (additive only)

```cypher
// DRY-RUN: count DataPulls missing the new required batch fields
MATCH (d:DataPull)
WHERE d.provider IS NULL OR d.asOfDate IS NULL OR d.status IS NULL
RETURN count(d) AS needsBackfill;

// WRITE: set sensible defaults so older records satisfy the new contract
MATCH (d:DataPull)
WHERE d.provider IS NULL
SET d.provider = coalesce(d.source, 'unknown'),
    d.status   = coalesce(d.status, 'legacy'),
    d.asOfDate = coalesce(d.asOfDate, d.datePulled);
```

### Step C.3 — Migrate inline metric values on existing DataPull nodes (SKIPPED per C1)

**STATUS: SKIPPED.** Per resolved decision C1, existing `DataPull` nodes carry only batch metadata, NOT inline metric values. Pre-flight Check #3 must return 0; if non-zero, HALT and escalate. The Cypher below is retained for historical reference only — do NOT execute it as part of the run.

```cypher
// DRY-RUN: project what would be created
MATCH (d:DataPull)-[:MENTIONS]->(t)
WHERE (t:Stock OR t:Sector OR t:MacroIndicator OR t:Commodity)
  AND d.value IS NOT NULL AND d.dataType IS NOT NULL
RETURN d.id AS pull, d.dataType AS metric, t.id AS target,
       coalesce(d.asOfDate, d.datePulled) AS asof, d.value AS value
LIMIT 50;

// WRITE: idempotent MERGE keyed by (target_id, metric_name, asof)
MATCH (d:DataPull)-[:MENTIONS]->(t)
WHERE (t:Stock OR t:Sector OR t:MacroIndicator OR t:Commodity)
  AND d.value IS NOT NULL AND d.dataType IS NOT NULL
WITH d, t, d.dataType AS metric,
     coalesce(d.asOfDate, d.datePulled) AS asof,
     d.value AS value, d.unit AS unit
MERGE (m:MetricSnapshot {target_id: t.id, metric_name: metric, asof: asof})
ON CREATE SET m.value = value, m.unit = unit, m.source = d.provider, m.created_at = datetime()
MERGE (d)-[:PRODUCED]->(m)
MERGE (m)-[:OBSERVES]->(t);
```

### Step C.4 — Latest-value denormalization onto target nodes

After snapshots exist, write convenience properties so dashboards don't traverse history.

```cypher
// DRY-RUN
MATCH (m:MetricSnapshot)-[:OBSERVES]->(t)
WITH t, m.metric_name AS metric, m
ORDER BY m.asof DESC
WITH t, metric, head(collect(m)) AS latest
RETURN labels(t)[0] AS label, metric, count(*) AS targetsTouched LIMIT 50;

// WRITE — use apoc.create.setProperty for dynamic keys
MATCH (m:MetricSnapshot)-[:OBSERVES]->(t)
WITH t, m.metric_name AS metric, m
ORDER BY m.asof DESC
WITH t, metric, head(collect(m)) AS latest
CALL apoc.create.setProperty(t, 'latest_' + metric, latest.value) YIELD node AS n1
CALL apoc.create.setProperty(n1, 'latest_' + metric + '_asof', latest.asof) YIELD node AS n2
RETURN count(n2);
```

**Idempotency:** `setProperty` overwrites — safe to re-run; convergent.

---

## (d) Rollback Strategy

```cypher
// Roll back C.4 (latest_* denorm) — strip dynamic keys
MATCH (t)
WHERE (t:Stock OR t:Sector OR t:MacroIndicator OR t:Commodity)
WITH t, [k IN keys(t) WHERE k STARTS WITH 'latest_'] AS killKeys
UNWIND killKeys AS k
CALL apoc.create.removeProperties(t, [k]) YIELD node
RETURN count(*);

// Roll back C.3 — drop MetricSnapshot nodes (DRY-RUN first)
MATCH (m:MetricSnapshot) RETURN count(m); // verify expected delete count
MATCH (m:MetricSnapshot) DETACH DELETE m;

// Roll back C.1 — drop indexes/constraints
DROP CONSTRAINT metricsnapshot_unique IF EXISTS;
DROP INDEX metricsnapshot_asof IF EXISTS;
DROP INDEX metricsnapshot_target IF EXISTS;
DROP INDEX metricsnapshot_metric IF EXISTS;
```

DataPull nodes are never deleted by this migration, so no rollback is needed for them beyond `REMOVE d.provider, d.status` if the backfill is unwanted.

---

## (e) Verification Queries

```cypher
// Counts
MATCH (d:DataPull) RETURN count(d);
MATCH (m:MetricSnapshot) RETURN count(m);
MATCH (:DataPull)-[r:PRODUCED]->(:MetricSnapshot) RETURN count(r);
MATCH (:MetricSnapshot)-[r:OBSERVES]->() RETURN count(r);

// Every MetricSnapshot has both a producer and a target
MATCH (m:MetricSnapshot)
WHERE NOT (m)<-[:PRODUCED]-(:DataPull) OR NOT (m)-[:OBSERVES]->()
RETURN count(m) AS orphans; // expect 0

// Composite uniqueness holds
MATCH (m:MetricSnapshot)
WITH m.target_id AS t, m.metric_name AS k, m.asof AS a, count(*) AS c
WHERE c > 1 RETURN t,k,a,c LIMIT 10; // expect empty

// latest_* propagated
MATCH (s:Stock) WHERE s.latest_price IS NOT NULL
RETURN count(s) AS stocksWithLatestPrice;
```

---

## (f) Resolved Decisions

All Step-C open questions are RESOLVED. Implementing agents must NOT re-open them.

- **C1 — Migrate inline values from existing DataPull → RESOLVED.** NO migration required. The existing 7,205 `DataPull` nodes are batch-metadata only; they do NOT carry numeric metric values. Step C.3 is **SKIPPED** entirely. (Pre-flight Check #3 is now a safety verifier expected to return 0; if non-zero, halt and escalate.)
- **C2 — Canonical `target_id` → RESOLVED.** Use `t.id` (the target node's own `id` property) as the foreign key for `MetricSnapshot.OBSERVES`. Label-agnostic across Stock / Sector / MacroIndicator / Commodity.
- **C3 — Property naming → RESOLVED.** snake_case for ALL new property names: `metric_name`, `asof`, `target_id`, `source_path`, `source_url`, `latest_<metric>`, `latest_<metric>_asof`, `created_at`, `quarantined_at`, etc. Already reflected in the Cypher above.
- **C4 — Unit normalization → RESOLVED.** Store metric values in their NATIVE unit (USD, pct, bps, x, sh) plus a `unit` string property on `MetricSnapshot`. Normalize at QUERY time, NEVER at write time. Already reflected in the schema and the ingestion code skeleton.
- **C5 — Cadence → RESOLVED.** Two cadences: beginning-of-day (BOD) and end-of-day (EOD). See new "Cadence: BOD / EOD" subsection below. The user will wire actual scheduling separately; this spec only defines what each cadence pulls.

---

## (f′) Cadence: BOD / EOD

The MetricSnapshot ingestion runs on a TWO-CADENCE schedule. Both cadences reuse the same `writeDataPull` + `writeMetricSnapshots` primitives in the puller skeleton below; the difference is only WHICH metrics are fetched and WHAT `frequency` / `dataType` is stamped on the `DataPull` batch. The user has live puller software that demonstrates the API call patterns — reference those when wiring the actual scheduler.

| Cadence | Time (ET) | DataPull.frequency | DataPull.dataType examples | What it pulls |
|---|---|---|---|---|
| **BOD** | ~08:30 (pre-market open) | `bod` | `quote_premarket`, `news_overnight`, `earnings_calendar`, `macro_release_morning` | Pre-market quote (`price_premarket`, `premarket_volume`, `premarket_change_pct`), overnight news counts, scheduled earnings/macro releases for the day. Establishes the day's opening context. |
| **EOD** | ~17:30 (post-close settled) | `eod` | `quote_close`, `daily_aggregate`, `fundamentals_daily`, `commodity_close`, `index_close` | Close prices (`price_close`, `volume`, `day_change_pct`), daily aggregates (`market_cap`, `pe_ratio`, `eps`), commodity & index closes, end-of-day macro indicator settles. Establishes the canonical daily snapshot. |

**Schema implications:**
- `MetricSnapshot.asof` is a `date` for EOD and `datetime` for BOD intraday quotes — the constraint `(target_id, metric_name, asof)` already handles both because temporal types compare equal only when identical.
- `DataPull.frequency ∈ {bod, eod, intraday, weekly, monthly}` — `bod` and `eod` are the two new canonical values introduced by this cadence design.
- BOD pre-market metric names are PREFIXED `premarket_` (e.g. `price_premarket`, `premarket_volume`) so they don't collide with EOD `price_close`, `volume` on the same target/asof date.
- `latest_*` denorm on the target node: the EOD `price_close` overwrites whatever BOD wrote earlier the same day. The "newer asof wins" guard in `writeMetricSnapshots` enforces this naturally.

**Operational gates:**
- BOD must complete BEFORE 09:25 ET (5 minutes before US market open) or the cadence is marked `late` and dashboards downgrade freshness badges.
- EOD must complete BEFORE 18:30 ET (1 hour after close settles) or alerts fire.
- Both write `DataPull.status ∈ {ok, partial, late, failed}` for downstream readiness checks (see `node run.mjs system readiness` in the project's AGENTS.md).

The user will wire BOD/EOD scheduling via the existing cadence orchestrator separately — this spec defines only the schema and what-pulls-what.

---

## ML / Alerts Readiness

**Last N snapshots for one (Stock, metric) pair:**

```cypher
MATCH (s:Stock {ticker: $ticker})<-[:OBSERVES]-(m:MetricSnapshot {metric_name: $metric})
RETURN m.asof AS asof, m.value AS value
ORDER BY m.asof DESC
LIMIT $n;
```

**Threshold-crossing alert (e.g., latest price drops below 200d MA):**

```cypher
MATCH (s:Stock)<-[:OBSERVES]-(m:MetricSnapshot {metric_name: 'price_close'})
WITH s, m ORDER BY m.asof DESC
WITH s, collect(m.value)[..200] AS window
WHERE size(window) = 200 AND window[0] < (reduce(x=0.0, v IN window | x+v) / 200.0)
RETURN s.ticker, window[0] AS latest;
```

**Change-over-time delta (today vs N days ago):**

```cypher
MATCH (s:Stock {ticker: $ticker})<-[:OBSERVES]-(m:MetricSnapshot {metric_name: $metric})
WITH s, m ORDER BY m.asof DESC
WITH s, collect(m)[0] AS now, collect(m)[$n] AS then
RETURN (now.value - then.value) / then.value AS pct_change;
```

ML feature extraction can `MATCH (m:MetricSnapshot)-[:OBSERVES]->(t)` and pivot in Python — the `metricsnapshot_asof` range index keeps timeseries scans cheap.

---

## Volume Management

**Projection.** Daily pulls × representative coverage:

- Stocks: 1,384 × ~6 metrics (price, volume, pe, eps, marketcap, change) = ~8,300/day
- Sectors: 34 × 3 metrics = ~100/day
- Macro: 49 × 1 metric = ~50/day
- Commodities: 8 × 2 metrics = ~16/day
- **Total: ~8,500 MetricSnapshot/day → ~3.1M/year → ~9.3M after 3 years**

That's well within Neo4j's comfortable range, but query latency on timeseries scans starts to matter past ~5M.

**Recommended retention policy:**

| Age | Resolution | Action |
|-----|-----------|--------|
| 0–90d | Daily (all snapshots) | Keep in graph |
| 90d–2y | Weekly (Friday close only) | Downsample: delete non-Friday snapshots |
| 2y+ | Monthly (month-end) | Downsample further |
| 5y+ | Cold storage | Export to Parquet on disk, delete from graph |

**Downsample cron (runs weekly):**

```cypher
// DRY-RUN: count what would be deleted
MATCH (m:MetricSnapshot)
WHERE m.asof < date() - duration('P90D')
  AND m.asof > date() - duration('P2Y')
  AND date(m.asof).dayOfWeek <> 5
RETURN count(m) AS toDelete;

// DELETE
MATCH (m:MetricSnapshot)
WHERE m.asof < date() - duration('P90D')
  AND m.asof > date() - duration('P2Y')
  AND date(m.asof).dayOfWeek <> 5
DETACH DELETE m;
```

---

## Ingestion Code Skeleton (FMP)

Slots alongside the existing thin wrapper at `scripts/pullers/neo4j-blind-spot-graph.mjs` (currently only re-exports `runNeo4jBlindSpotGraphPull`). This skeleton lives at the same level — e.g. `scripts/pullers/neo4j-fmp-metric-snapshots.mjs` — and is invoked separately by the cadence orchestrator. It does NOT duplicate the blind-spot graph builder; it ingests fresh metric observations into the two-tier model defined above.

```javascript
// scripts/pullers/neo4j-fmp-metric-snapshots.mjs
//
// Two-tier metric ingestion against FINANCIAL_MODELING_PREP.
// Slots beside scripts/pullers/neo4j-blind-spot-graph.mjs (which builds
// graph topology). This module only writes (:DataPull)-[:PRODUCED]->
// (:MetricSnapshot)-[:OBSERVES]->(:Stock|:Sector|:MacroIndicator|:Commodity)
// and updates latest_* denorm properties on the target.

import neo4j from 'neo4j-driver';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';

const FMP_KEY  = process.env.FINANCIAL_MODELING_PREP_API_KEY;
const FMP_BASE = 'https://financialmodelingprep.com/api/v3';
const NEO4J_URI  = process.env.NEO4J_URI  || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASS = process.env.NEO4J_PASSWORD;

if (!FMP_KEY) throw new Error('FINANCIAL_MODELING_PREP_API_KEY missing in .env');

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

/**
 * MERGE a DataPull batch node. One per (provider, dataType, asOfDate).
 * Returns the deterministic id used to link snapshots.
 */
export async function writeDataPull(session, batchMeta) {
  const id = batchMeta.id
    ?? `${batchMeta.provider}:${batchMeta.dataType}:${batchMeta.asOfDate}:${randomUUID().slice(0,8)}`;
  await session.run(
    `MERGE (d:DataPull {id: $id})
     ON CREATE SET d.created_at = datetime()
     SET d.provider   = $provider,
         d.source     = $source,
         d.dataType   = $dataType,
         d.frequency  = $frequency,
         d.asOfDate   = date($asOfDate),
         d.datePulled = datetime($datePulled),
         d.status     = $status`,
    { id, ...batchMeta }
  );
  return id;
}

/**
 * Write a batch of metric observations for one target.
 *  metrics = [{ metric_name, value, unit, asof }, ...]
 * Atomically: MERGE snapshots, link to DataPull + target, update latest_*.
 */
export async function writeMetricSnapshots(session, dataPullId, target, metrics) {
  // target = { label: 'Stock'|'Sector'|'MacroIndicator'|'Commodity', id, key, keyValue }
  // key/keyValue let us find the existing node (e.g. ticker='AAPL').
  if (!metrics?.length) return 0;

  const cypher = `
    UNWIND $metrics AS row
    MATCH (t:\`${target.label}\` { ${target.key}: $keyValue })
    MERGE (m:MetricSnapshot {
      target_id:   coalesce(t.id, $keyValue),
      metric_name: row.metric_name,
      asof:        date(row.asof)
    })
    ON CREATE SET m.created_at = datetime()
    SET m.value  = row.value,
        m.unit   = row.unit,
        m.source = $source
    WITH t, m, row
    MATCH (d:DataPull {id: $dataPullId})
    MERGE (d)-[:PRODUCED]->(m)
    MERGE (m)-[:OBSERVES]->(t)
    WITH t, row
    // latest_* denorm — only overwrite if this snapshot is newer
    WITH t, row,
         coalesce(t['latest_' + row.metric_name + '_asof'], date('1900-01-01')) AS prev
    WHERE date(row.asof) >= prev
    CALL apoc.create.setProperty(t, 'latest_' + row.metric_name, row.value) YIELD node AS n1
    CALL apoc.create.setProperty(n1, 'latest_' + row.metric_name + '_asof', date(row.asof)) YIELD node AS n2
    RETURN count(n2) AS updated`;

  const res = await session.run(cypher, {
    metrics, dataPullId,
    keyValue: target.keyValue,
    source: 'financial_modeling_prep',
  });
  return res.records[0]?.get('updated').toNumber() ?? 0;
}

// -------------------------------------------------------------------------
// Provider call — FMP /quote/{ticker}
// -------------------------------------------------------------------------
async function fetchFmpQuote(ticker) {
  const url = `${FMP_BASE}/quote/${ticker}?apikey=${FMP_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`FMP ${ticker} ${r.status}`);
  const [q] = await r.json();
  if (!q) throw new Error(`FMP empty payload ${ticker}`);
  return q;
}

// Map raw FMP payload to canonical (snake_case) metrics.
function fmpQuoteToMetrics(q, asof) {
  return [
    { metric_name: 'price_close',  value: q.price,        unit: 'USD', asof },
    { metric_name: 'volume',       value: q.volume,       unit: 'sh',  asof },
    { metric_name: 'market_cap',   value: q.marketCap,    unit: 'USD', asof },
    { metric_name: 'pe_ratio',     value: q.pe,           unit: 'x',   asof },
    { metric_name: 'eps',          value: q.eps,          unit: 'USD', asof },
    { metric_name: 'day_change_pct', value: q.changesPercentage, unit: 'pct', asof },
  ].filter(m => m.value !== null && m.value !== undefined);
}

// -------------------------------------------------------------------------
// End-to-end example — one quote for one ticker
// -------------------------------------------------------------------------
export async function pullStockQuote(driver, ticker) {
  const session = driver.session();
  try {
    const asof = new Date().toISOString().slice(0,10); // YYYY-MM-DD
    const q = await fetchFmpQuote(ticker);

    const dataPullId = await writeDataPull(session, {
      provider:   'financial_modeling_prep',
      source:     'fmp_quote_v3',
      dataType:   'quote',
      frequency:  'intraday',
      asOfDate:   asof,
      datePulled: new Date().toISOString(),
      status:     'ok',
    });

    const metrics = fmpQuoteToMetrics(q, asof);
    const updated = await writeMetricSnapshots(
      session, dataPullId,
      { label: 'Stock', key: 'ticker', keyValue: ticker },
      metrics
    );
    return { dataPullId, snapshots: metrics.length, updated };
  } finally {
    await session.close();
  }
}

// CLI: `node scripts/pullers/neo4j-fmp-metric-snapshots.mjs AAPL MSFT NVDA`
if (import.meta.url === `file://${process.argv[1]}`) {
  const tickers = process.argv.slice(2);
  if (!tickers.length) { console.error('usage: ... <TICKER>...'); process.exit(1); }
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
  try {
    for (const t of tickers) {
      const r = await pullStockQuote(driver, t);
      console.log(JSON.stringify({ ticker: t, ...r }));
    }
  } finally {
    await driver.close();
  }
}
```

**How it slots in.** The existing `neo4j-blind-spot-graph.mjs` is a thin re-exporter (73 lines, only `pull` + `runNeo4jBlindSpotGraphPull`) — it builds the topological graph (Entity / Stock / Sector / MacroIndicator / DataPull-batch). This new module is invoked **after** that one in the cadence orchestrator: topology first, observations second. Both share the same Neo4j driver and `.env` loader pattern. The blind-spot puller continues to MERGE entity nodes; this puller assumes targets already exist and only writes time-series observations against them.
