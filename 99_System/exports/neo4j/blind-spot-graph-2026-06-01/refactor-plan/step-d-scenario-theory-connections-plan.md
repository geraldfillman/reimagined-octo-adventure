# Step D Scenario Theory Connections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scenario/theory layer that connects broad macro theories to stocks, sectors, commodities, regimes, evidence gaps, and reviewable CandidateLinks without collapsing hypotheses into permanent facts.

**Architecture:** The graph gains `Scenario`, `ShockVector`, and `RiskTheme` nodes. Scenario tags and shock-vector metadata discover candidate stocks/sectors by existing labels, tags, domains, relationships, and `MetricSnapshot` coverage. Uncertain conclusions are stored as `CandidateLink` nodes first; only reviewed conclusions become durable semantic edges.

**Tech Stack:** Neo4j Cypher 25, APOC, Node.js ESM puller pattern, built-in `node:test`, existing `run.mjs pull` command surface, existing CandidateLink and MetricSnapshot model.

---

## File Structure

- Create `99_System/config/neo4j-scenarios/2026-leverage-oil-fed-policy-fragility.json`
  - Stores the first scenario definition, shock vectors, risk themes, metadata tags, and explicit seed anchors.
- Create `scripts/lib/neo4j-scenario-theories.mjs`
  - Pure helpers that normalize scenario config, build deterministic IDs, validate exposure rules, and generate dry-run plans.
- Create `scripts/pullers/neo4j-scenario-theory.mjs`
  - Manual-only puller that writes scenario graph nodes and CandidateLink proposals into Neo4j.
- Modify `scripts/lib/puller-catalog.mjs`
  - Registers `neo4j-scenario-theory` as manual-only and not scheduled.
- Modify command routing in `scripts/run.mjs` or the existing puller registry module used by `run.mjs`
  - Adds `node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --dry-run --json`.
- Create `scripts/tests/neo4j-scenario-theories.test.mjs`
  - Unit tests for config parsing, ID generation, and candidate exposure rule shape.
- Create `scripts/tests/neo4j-scenario-theory-puller.test.mjs`
  - CLI/puller tests for dry-run behavior and manual-only safety.
- Modify `04_Reference/Pull_System_Guide.md`
  - Documents how to run the scenario theory layer and how to review proposed links.
- Modify `99_System/exports/neo4j/blind-spot-graph-2026-06-01/refactor-plan/RUNBOOK.md`
  - Adds Step D as post-refactor extension, not part of the already-completed destructive migration sequence.

---

## Model

### Nodes

```text
(:Scenario {
  id,
  name,
  status,
  asOfDate,
  createdBy,
  method,
  tags,
  domains,
  riskThemes
})

(:ShockVector {
  id,
  name,
  scenarioId,
  vectorType,
  status,
  direction,
  confidence,
  tags,
  domains
})

(:RiskTheme {
  id,
  name,
  themeType,
  status,
  tags,
  domains
})
```

### Relationships

```text
(:Scenario)-[:HAS_SHOCK_VECTOR]->(:ShockVector)
(:Scenario)-[:HAS_RISK_THEME]->(:RiskTheme)
(:ShockVector)-[:MAPS_TO_THEME]->(:RiskTheme)
(:ShockVector)-[:SUPPORTED_BY]->(:DataPull|:EvidenceArtifact|:MetricSnapshot|:SourceItem|:NewsItem)
(:RiskTheme)-[:FAVORS_SECTOR]->(:Sector)
(:RiskTheme)-[:PRESSURES_SECTOR]->(:Sector)
(:CandidateLink)<-[:PROPOSED_BY]-(:Scenario|:ShockVector|:RiskTheme)
(:CandidateLink)-[:PROPOSES]->(:Stock|:Sector|:Regime|:Commodity|:MacroIndicator)
```

### CandidateLink Rule

Scenario-generated inferred exposure never writes permanent `FAVORS_*`, `PRESSURES_*`, `INDICATES_*`, or `AFFECTS_*` edges directly. The puller writes `CandidateLink` nodes with:

```text
status: 'candidate'
reviewState: 'needs_review'
method: 'scenario_theory_metadata_match'
source: 'neo4j-scenario-theory'
type: 'scenario_exposure'
```

---

## Scenario Seed

Create `99_System/config/neo4j-scenarios/2026-leverage-oil-fed-policy-fragility.json` with this exact content:

```json
{
  "id": "scenario:2026-leverage-oil-fed-policy-fragility",
  "slug": "2026-leverage-oil-fed-policy-fragility",
  "name": "2026 Leverage / Oil / Fed Policy Fragility",
  "status": "active_watch",
  "asOfDate": "2026-06-01",
  "createdBy": "codex",
  "method": "scenario_theory_seed_v1",
  "tags": [
    "margin-debt",
    "bond-volatility",
    "yield-curve",
    "fed-independence",
    "fed-funds-rate",
    "oil-shock",
    "iran",
    "hormuz",
    "commodities",
    "inflation",
    "policy-error",
    "deleveraging"
  ],
  "domains": ["market", "macro", "energy", "geopolitics", "policy"],
  "shockVectors": [
    {
      "id": "shock-vector:margin-debt-stress",
      "name": "Margin Debt Stress",
      "vectorType": "leverage",
      "direction": "risk_up",
      "confidence": 0.7,
      "tags": ["margin-debt", "deleveraging", "bull-market", "equity-leverage"],
      "anchors": ["finra-margin-debt"]
    },
    {
      "id": "shock-vector:bond-market-uncertainty",
      "name": "Bond Market Uncertainty",
      "vectorType": "rates",
      "direction": "risk_up",
      "confidence": 0.65,
      "tags": ["yield-curve", "bond-volatility", "term-premium", "rate-volatility"],
      "anchors": ["world:macroindicator:yield-curve"]
    },
    {
      "id": "shock-vector:iran-hormuz-oil-shock",
      "name": "Iran / Hormuz Oil Shock",
      "vectorType": "geopolitical_commodity",
      "direction": "risk_up",
      "confidence": 0.8,
      "tags": ["iran", "hormuz", "oil-shock", "crude-oil", "commodities", "inflation"],
      "anchors": [
        "world:geopoliticalevent:iran",
        "world:regime:iran-hormuz-oil-shock",
        "world:commodity:oil",
        "world:commodity:crude-oil",
        "mydata:pull:2026-05-24-event-research-hormuz-oil-shock",
        "mydata:pull:2026-05-25-event-research-hormuz-oil-shock"
      ]
    },
    {
      "id": "shock-vector:fed-reaction-function-risk",
      "name": "Fed Independence / Reaction Function Risk",
      "vectorType": "policy",
      "direction": "risk_up",
      "confidence": 0.65,
      "tags": ["fed-independence", "fed-funds-rate", "policy-error", "rate-cuts", "inflation"],
      "anchors": ["world:macroindicator:fed-funds-rate", "world:sourceitem:federal-reserve"]
    }
  ],
  "riskThemes": [
    {
      "id": "risk-theme:leverage-fragility",
      "name": "Leverage Fragility",
      "themeType": "market_structure",
      "tags": ["margin-debt", "deleveraging", "high-beta", "momentum"]
    },
    {
      "id": "risk-theme:commodity-inflation",
      "name": "Commodity Inflation",
      "themeType": "macro_commodity",
      "tags": ["oil-shock", "commodities", "inflation", "hormuz"]
    },
    {
      "id": "risk-theme:rate-volatility",
      "name": "Rate Volatility",
      "themeType": "rates",
      "tags": ["yield-curve", "bond-volatility", "term-premium", "duration"]
    },
    {
      "id": "risk-theme:policy-credibility",
      "name": "Policy Credibility",
      "themeType": "policy",
      "tags": ["fed-independence", "policy-error", "fed-funds-rate"]
    }
  ],
  "themeMappings": [
    ["shock-vector:margin-debt-stress", "risk-theme:leverage-fragility"],
    ["shock-vector:bond-market-uncertainty", "risk-theme:rate-volatility"],
    ["shock-vector:iran-hormuz-oil-shock", "risk-theme:commodity-inflation"],
    ["shock-vector:fed-reaction-function-risk", "risk-theme:policy-credibility"],
    ["shock-vector:fed-reaction-function-risk", "risk-theme:rate-volatility"]
  ],
  "sectorRules": [
    {
      "themeId": "risk-theme:commodity-inflation",
      "relation": "FAVORS_SECTOR",
      "sectorNames": ["Energy", "Materials"]
    },
    {
      "themeId": "risk-theme:commodity-inflation",
      "relation": "PRESSURES_SECTOR",
      "sectorNames": ["Consumer Discretionary", "Industrials"]
    },
    {
      "themeId": "risk-theme:rate-volatility",
      "relation": "PRESSURES_SECTOR",
      "sectorNames": ["Real Estate", "Consumer Discretionary", "Technology"]
    },
    {
      "themeId": "risk-theme:leverage-fragility",
      "relation": "PRESSURES_SECTOR",
      "sectorNames": ["Technology", "Consumer Discretionary", "Communication Services"]
    }
  ],
  "candidateExposure": {
    "maxCandidates": 100,
    "minTagScore": 1,
    "targetLabels": ["Stock", "Sector", "Regime", "Commodity", "MacroIndicator"]
  }
}
```

---

## Task 1: Add Scenario Config Tests

**Files:**
- Create: `scripts/tests/neo4j-scenario-theories.test.mjs`
- Create later in Task 2: `scripts/lib/neo4j-scenario-theories.mjs`
- Create later in Task 3: `99_System/config/neo4j-scenarios/2026-leverage-oil-fed-policy-fragility.json`

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildCandidateLinkId,
  buildDryRunPlan,
  normalizeScenarioConfig,
  scoreTagOverlap,
} from '../lib/neo4j-scenario-theories.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const scenarioPath = path.join(
  repoRoot,
  '99_System',
  'config',
  'neo4j-scenarios',
  '2026-leverage-oil-fed-policy-fragility.json',
);

function loadScenario() {
  return JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
}

test('normalizes the leverage oil fed fragility scenario', () => {
  const scenario = normalizeScenarioConfig(loadScenario());
  assert.equal(scenario.id, 'scenario:2026-leverage-oil-fed-policy-fragility');
  assert.equal(scenario.shockVectors.length, 4);
  assert.equal(scenario.riskThemes.length, 4);
  assert.ok(scenario.tags.includes('margin-debt'));
  assert.ok(scenario.tags.includes('hormuz'));
});

test('builds deterministic CandidateLink ids', () => {
  const id = buildCandidateLinkId({
    scenarioId: 'scenario:2026-leverage-oil-fed-policy-fragility',
    sourceId: 'risk-theme:commodity-inflation',
    targetId: 'world:sector:energy',
    type: 'scenario_exposure',
  });
  assert.equal(
    id,
    'candidate:scenario-exposure:scenario-2026-leverage-oil-fed-policy-fragility:risk-theme-commodity-inflation:world-sector-energy',
  );
});

test('scores tag overlap with case-insensitive tags and names', () => {
  const score = scoreTagOverlap({
    tags: ['oil-shock', 'commodities'],
    target: {
      name: 'Energy Commodity Producers',
      tags: ['Energy', 'Inflation'],
      domain: 'market',
      sector: 'Energy',
    },
  });
  assert.equal(score, 1);
});

test('builds dry-run plan without Neo4j writes', () => {
  const plan = buildDryRunPlan(normalizeScenarioConfig(loadScenario()));
  assert.equal(plan.dryRun, true);
  assert.equal(plan.scenario.id, 'scenario:2026-leverage-oil-fed-policy-fragility');
  assert.equal(plan.nodes.scenarios, 1);
  assert.equal(plan.nodes.shockVectors, 4);
  assert.equal(plan.nodes.riskThemes, 4);
  assert.equal(plan.relationships.themeMappings, 5);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run from `C:\Users\CaveUser\Documents\Obsidian Vault\My_Data`:

```powershell
node --test scripts\tests\neo4j-scenario-theories.test.mjs
```

Expected: FAIL because `scripts/lib/neo4j-scenario-theories.mjs` and the scenario JSON do not exist yet.

---

## Task 2: Add Pure Scenario Helpers

**Files:**
- Create: `scripts/lib/neo4j-scenario-theories.mjs`
- Test: `scripts/tests/neo4j-scenario-theories.test.mjs`

- [ ] **Step 1: Create helper module**

```js
const REQUIRED_SCENARIO_FIELDS = ['id', 'slug', 'name', 'status', 'asOfDate'];

export function normalizeScenarioConfig(raw = {}) {
  for (const field of REQUIRED_SCENARIO_FIELDS) {
    if (!raw[field]) throw new Error(`Scenario config missing required field: ${field}`);
  }
  const shockVectors = arrayOfObjects(raw.shockVectors, 'shockVectors');
  const riskThemes = arrayOfObjects(raw.riskThemes, 'riskThemes');
  return {
    ...raw,
    tags: normalizeList(raw.tags),
    domains: normalizeList(raw.domains),
    shockVectors: shockVectors.map(vector => ({
      ...vector,
      tags: normalizeList(vector.tags),
      anchors: normalizeList(vector.anchors),
    })),
    riskThemes: riskThemes.map(theme => ({
      ...theme,
      tags: normalizeList(theme.tags),
      domains: normalizeList(theme.domains),
    })),
    themeMappings: Array.isArray(raw.themeMappings) ? raw.themeMappings : [],
    sectorRules: Array.isArray(raw.sectorRules) ? raw.sectorRules : [],
    candidateExposure: {
      maxCandidates: Number(raw.candidateExposure?.maxCandidates ?? 100),
      minTagScore: Number(raw.candidateExposure?.minTagScore ?? 1),
      targetLabels: normalizeList(raw.candidateExposure?.targetLabels),
    },
  };
}

export function buildDryRunPlan(scenario) {
  return {
    dryRun: true,
    scenario: {
      id: scenario.id,
      name: scenario.name,
      status: scenario.status,
      asOfDate: scenario.asOfDate,
    },
    nodes: {
      scenarios: 1,
      shockVectors: scenario.shockVectors.length,
      riskThemes: scenario.riskThemes.length,
    },
    relationships: {
      shockVectors: scenario.shockVectors.length,
      riskThemes: scenario.riskThemes.length,
      themeMappings: scenario.themeMappings.length,
      sectorRules: scenario.sectorRules.length,
    },
  };
}

export function buildCandidateLinkId({ scenarioId, sourceId, targetId, type }) {
  return [
    'candidate',
    slug(type),
    slug(scenarioId),
    slug(sourceId),
    slug(targetId),
  ].join(':');
}

export function scoreTagOverlap({ tags = [], target = {} }) {
  const normalizedTags = normalizeList(tags);
  const searchable = normalizeList([
    ...(target.tags || []),
    target.name,
    target.canonicalName,
    target.domain,
    target.sector,
    target.subdomain,
  ]).join(' ');
  return normalizedTags.reduce((count, tag) => (
    searchable.includes(tag) ? count + 1 : count
  ), 0);
}

export function scenarioConfigToCypherParams(scenario) {
  return {
    scenario: {
      id: scenario.id,
      name: scenario.name,
      status: scenario.status,
      asOfDate: scenario.asOfDate,
      createdBy: scenario.createdBy || 'codex',
      method: scenario.method || 'scenario_theory_seed_v1',
      tags: scenario.tags,
      domains: scenario.domains,
      riskThemes: scenario.riskThemes.map(theme => theme.id),
    },
    shockVectors: scenario.shockVectors,
    riskThemes: scenario.riskThemes,
    themeMappings: scenario.themeMappings.map(([from, to]) => ({ from, to })),
    sectorRules: scenario.sectorRules,
  };
}

function normalizeList(value) {
  const list = Array.isArray(value) ? value : [value];
  return [...new Set(
    list
      .map(item => String(item || '').trim().toLowerCase())
      .filter(Boolean),
  )];
}

function arrayOfObjects(value, field) {
  if (!Array.isArray(value) || value.some(item => !item || typeof item !== 'object')) {
    throw new Error(`Scenario config field ${field} must be an array of objects`);
  }
  return value;
}

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 2: Run helper test**

```powershell
node --test scripts\tests\neo4j-scenario-theories.test.mjs
```

Expected: still FAIL because the scenario JSON does not exist yet.

---

## Task 3: Add Scenario Seed Config

**Files:**
- Create: `99_System/config/neo4j-scenarios/2026-leverage-oil-fed-policy-fragility.json`
- Test: `scripts/tests/neo4j-scenario-theories.test.mjs`

- [ ] **Step 1: Create scenario config directory**

```powershell
New-Item -ItemType Directory -Force -Path "99_System\config\neo4j-scenarios"
```

- [ ] **Step 2: Add the JSON from the Scenario Seed section**

Use the exact JSON in this plan's `Scenario Seed` section.

- [ ] **Step 3: Run helper tests**

```powershell
node --test scripts\tests\neo4j-scenario-theories.test.mjs
```

Expected: PASS.

---

## Task 4: Add Neo4j Write Cypher Builders

**Files:**
- Modify: `scripts/lib/neo4j-scenario-theories.mjs`
- Test: `scripts/tests/neo4j-scenario-theories.test.mjs`

- [ ] **Step 1: Extend tests with Cypher expectations**

Append this test:

```js
import {
  buildWriteScenarioCypher,
  buildWriteThemeMappingsCypher,
} from '../lib/neo4j-scenario-theories.mjs';

test('builds scenario write cypher with scenario shock vector and theme merges', () => {
  const cypher = buildWriteScenarioCypher();
  assert.match(cypher, /MERGE \(sc:Scenario \{id: \$scenario\.id\}\)/);
  assert.match(cypher, /MERGE \(sv:ShockVector \{id: row\.id\}\)/);
  assert.match(cypher, /MERGE \(rt:RiskTheme \{id: row\.id\}\)/);
  assert.match(cypher, /HAS_SHOCK_VECTOR/);
  assert.match(cypher, /HAS_RISK_THEME/);
});

test('builds theme mapping cypher with bound endpoint rel merge', () => {
  const cypher = buildWriteThemeMappingsCypher();
  assert.match(cypher, /MATCH \(sv:ShockVector \{id: row\.from\}\)/);
  assert.match(cypher, /MATCH \(rt:RiskTheme \{id: row\.to\}\)/);
  assert.match(cypher, /MERGE \(sv\)-\[:MAPS_TO_THEME\]->\(rt\)/);
});
```

- [ ] **Step 2: Add builder functions**

Append to `scripts/lib/neo4j-scenario-theories.mjs`:

```js
export function buildWriteScenarioCypher() {
  return `CYPHER 25
MERGE (sc:Scenario {id: $scenario.id})
SET sc.name = $scenario.name,
    sc.status = $scenario.status,
    sc.asOfDate = date($scenario.asOfDate),
    sc.createdBy = $scenario.createdBy,
    sc.method = $scenario.method,
    sc.tags = $scenario.tags,
    sc.domains = $scenario.domains,
    sc.riskThemes = $scenario.riskThemes,
    sc.updatedAt = datetime()
WITH sc
UNWIND $shockVectors AS row
MERGE (sv:ShockVector {id: row.id})
SET sv.name = row.name,
    sv.scenarioId = sc.id,
    sv.vectorType = row.vectorType,
    sv.status = coalesce(row.status, 'active_watch'),
    sv.direction = row.direction,
    sv.confidence = toFloat(row.confidence),
    sv.tags = row.tags,
    sv.domains = coalesce(row.domains, []),
    sv.updatedAt = datetime()
MERGE (sc)-[:HAS_SHOCK_VECTOR]->(sv)
WITH sc
UNWIND $riskThemes AS row
MERGE (rt:RiskTheme {id: row.id})
SET rt.name = row.name,
    rt.themeType = row.themeType,
    rt.status = coalesce(row.status, 'active_watch'),
    rt.tags = row.tags,
    rt.domains = coalesce(row.domains, []),
    rt.updatedAt = datetime()
MERGE (sc)-[:HAS_RISK_THEME]->(rt)
RETURN sc.id AS scenarioId`;
}

export function buildWriteThemeMappingsCypher() {
  return `CYPHER 25
UNWIND $themeMappings AS row
MATCH (sv:ShockVector {id: row.from})
MATCH (rt:RiskTheme {id: row.to})
MERGE (sv)-[:MAPS_TO_THEME]->(rt)
RETURN count(*) AS mappings`;
}
```

- [ ] **Step 3: Run helper tests**

```powershell
node --test scripts\tests\neo4j-scenario-theories.test.mjs
```

Expected: PASS.

---

## Task 5: Add Manual Puller Skeleton With Dry-Run

**Files:**
- Create: `scripts/pullers/neo4j-scenario-theory.mjs`
- Test: `scripts/tests/neo4j-scenario-theory-puller.test.mjs`

- [ ] **Step 1: Write puller test**

```js
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const scriptsDir = path.resolve(import.meta.dirname, '..');

test('neo4j scenario theory puller supports dry-run json without network or Neo4j writes', () => {
  const result = spawnSync(
    process.execPath,
    [
      'run.mjs',
      'pull',
      'neo4j-scenario-theory',
      '--scenario',
      '2026-leverage-oil-fed-policy-fragility',
      '--dry-run',
      '--json',
    ],
    {
      cwd: scriptsDir,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.dryRun, true);
  assert.equal(payload.scenario.id, 'scenario:2026-leverage-oil-fed-policy-fragility');
  assert.equal(payload.nodes.shockVectors, 4);
  assert.equal(payload.nodes.riskThemes, 4);
});
```

- [ ] **Step 2: Create puller**

```js
import fs from 'node:fs';
import path from 'node:path';

import neo4j from 'neo4j-driver';

import {
  buildDryRunPlan,
  buildWriteScenarioCypher,
  buildWriteThemeMappingsCypher,
  normalizeScenarioConfig,
  scenarioConfigToCypherParams,
} from '../lib/neo4j-scenario-theories.mjs';

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
const SCENARIO_DIR = path.join(REPO_ROOT, '99_System', 'config', 'neo4j-scenarios');

export async function run(options = {}) {
  const scenarioSlug = options.scenario || '2026-leverage-oil-fed-policy-fragility';
  const scenario = normalizeScenarioConfig(loadScenarioConfig(scenarioSlug));
  if (options.dryRun) return buildDryRunPlan(scenario);

  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const user = process.env.NEO4J_USER || 'neo4j';
  const password = process.env.NEO4J_PASSWORD;
  if (!password) throw new Error('NEO4J_PASSWORD is required for live scenario theory writes');

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });
  try {
    const params = scenarioConfigToCypherParams(scenario);
    await session.run(buildWriteScenarioCypher(), params);
    await session.run(buildWriteThemeMappingsCypher(), params);
    return {
      dryRun: false,
      scenario: { id: scenario.id, name: scenario.name },
      nodes: {
        scenarios: 1,
        shockVectors: scenario.shockVectors.length,
        riskThemes: scenario.riskThemes.length,
      },
      relationships: {
        shockVectors: scenario.shockVectors.length,
        riskThemes: scenario.riskThemes.length,
        themeMappings: scenario.themeMappings.length,
      },
    };
  } finally {
    await session.close();
    await driver.close();
  }
}

function loadScenarioConfig(slug) {
  const filePath = path.join(SCENARIO_DIR, `${slug}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
```

- [ ] **Step 3: Register command surface**

Follow the existing puller registration pattern used by `neo4j-fmp-metric-snapshots`. The command must accept:

```text
--scenario <slug>
--dry-run
--json
```

- [ ] **Step 4: Run puller test**

```powershell
node --test scripts\tests\neo4j-scenario-theory-puller.test.mjs
```

Expected: PASS.

---

## Task 6: Add Constraints And Live Write Gate

**Files:**
- Modify: `scripts/pullers/neo4j-scenario-theory.mjs`
- Modify: `scripts/lib/neo4j-scenario-theories.mjs`
- Test: `scripts/tests/neo4j-scenario-theories.test.mjs`

- [ ] **Step 1: Add schema Cypher builders**

Append to `scripts/lib/neo4j-scenario-theories.mjs`:

```js
export function buildScenarioSchemaStatements() {
  return [
    'CYPHER 25 CREATE CONSTRAINT scenario_id_unique IF NOT EXISTS FOR (s:Scenario) REQUIRE s.id IS UNIQUE',
    'CYPHER 25 CREATE CONSTRAINT shockvector_id_unique IF NOT EXISTS FOR (s:ShockVector) REQUIRE s.id IS UNIQUE',
    'CYPHER 25 CREATE CONSTRAINT risktheme_id_unique IF NOT EXISTS FOR (r:RiskTheme) REQUIRE r.id IS UNIQUE',
    'CYPHER 25 CREATE INDEX scenario_status IF NOT EXISTS FOR (s:Scenario) ON (s.status)',
    'CYPHER 25 CREATE INDEX shockvector_type IF NOT EXISTS FOR (s:ShockVector) ON (s.vectorType)',
    'CYPHER 25 CREATE INDEX risktheme_type IF NOT EXISTS FOR (r:RiskTheme) ON (r.themeType)',
  ];
}
```

- [ ] **Step 2: Run schema statements before live writes**

In `scripts/pullers/neo4j-scenario-theory.mjs`, import `buildScenarioSchemaStatements` and run:

```js
for (const statement of buildScenarioSchemaStatements()) {
  await session.run(statement);
}
```

immediately before:

```js
await session.run(buildWriteScenarioCypher(), params);
```

- [ ] **Step 3: Run tests and dry-run**

```powershell
node --test scripts\tests\neo4j-scenario-theories.test.mjs scripts\tests\neo4j-scenario-theory-puller.test.mjs
node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --dry-run --json
```

Expected: PASS and JSON dry-run summary.

---

## Task 7: Add Candidate Exposure Discovery

**Files:**
- Modify: `scripts/lib/neo4j-scenario-theories.mjs`
- Modify: `scripts/pullers/neo4j-scenario-theory.mjs`
- Test: `scripts/tests/neo4j-scenario-theories.test.mjs`

- [ ] **Step 1: Add read query builder**

Append to `scripts/lib/neo4j-scenario-theories.mjs`:

```js
export function buildCandidateExposureReadCypher() {
  return `CYPHER 25
MATCH (sc:Scenario {id: $scenarioId})-[:HAS_RISK_THEME]->(theme:RiskTheme)
MATCH (target)
WHERE any(label IN labels(target) WHERE label IN $targetLabels)
  AND any(tag IN theme.tags WHERE
    tag IN coalesce(target.tags, [])
    OR toLower(coalesce(target.name, '')) CONTAINS tag
    OR toLower(coalesce(target.canonicalName, '')) CONTAINS tag
    OR toLower(coalesce(target.domain, '')) CONTAINS tag
    OR toLower(coalesce(target.sector, '')) CONTAINS tag
    OR toLower(coalesce(target.subdomain, '')) CONTAINS tag
  )
RETURN
  sc.id AS scenarioId,
  theme.id AS sourceId,
  theme.name AS sourceName,
  labels(target) AS targetLabels,
  target.id AS targetId,
  coalesce(target.name, target.ticker, target.canonicalName) AS targetName
LIMIT $maxCandidates`;
}
```

- [ ] **Step 2: Add CandidateLink write builder**

Append:

```js
export function buildWriteCandidateExposureCypher() {
  return `CYPHER 25
UNWIND $candidates AS row
MATCH (theme:RiskTheme {id: row.sourceId})
MATCH (target {id: row.targetId})
MERGE (c:CandidateLink {id: row.candidateId})
SET c.type = 'scenario_exposure',
    c.status = 'candidate',
    c.reviewState = 'needs_review',
    c.method = 'scenario_theory_metadata_match',
    c.source = 'neo4j-scenario-theory',
    c.reason = row.reason,
    c.score = row.score,
    c.createdBy = 'codex',
    c.asOfDate = row.asOfDate,
    c.lastSeen = row.asOfDate
MERGE (theme)-[:PROPOSED_BY]->(c)
MERGE (c)-[:PROPOSES]->(target)
RETURN count(DISTINCT c) AS candidateLinks`;
}
```

- [ ] **Step 3: In the puller, read candidates then write CandidateLinks**

After writing scenario nodes and theme mappings:

```js
const candidateRows = await session.run(buildCandidateExposureReadCypher(), {
  scenarioId: scenario.id,
  targetLabels: scenario.candidateExposure.targetLabels,
  maxCandidates: neo4j.int(scenario.candidateExposure.maxCandidates),
});

const candidates = candidateRows.records
  .map(record => ({
    scenarioId: record.get('scenarioId'),
    sourceId: record.get('sourceId'),
    sourceName: record.get('sourceName'),
    targetId: record.get('targetId'),
    targetName: record.get('targetName'),
    asOfDate: scenario.asOfDate,
    score: 0.5,
    reason: `Scenario metadata overlap between ${record.get('sourceName')} and ${record.get('targetName')}`,
  }))
  .map(candidate => ({
    ...candidate,
    candidateId: buildCandidateLinkId({
      scenarioId: candidate.scenarioId,
      sourceId: candidate.sourceId,
      targetId: candidate.targetId,
      type: 'scenario_exposure',
    }),
  }));

let candidateLinks = 0;
if (candidates.length) {
  const writeResult = await session.run(buildWriteCandidateExposureCypher(), { candidates });
  const value = writeResult.records[0]?.get('candidateLinks');
  candidateLinks = typeof value?.toNumber === 'function' ? value.toNumber() : Number(value ?? 0);
}
```

Include `candidateLinks` in the live return payload.

- [ ] **Step 4: Run tests and live dry-run**

```powershell
node --test scripts\tests\neo4j-scenario-theories.test.mjs scripts\tests\neo4j-scenario-theory-puller.test.mjs
node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --dry-run --json
```

Expected: PASS.

---

## Task 8: Live Execution Procedure

**Files:**
- No file edits in this task.
- Uses the local Neo4j Desktop DBMS at `C:\Users\CaveUser\.Neo4jDesktop2\Data\dbmss\dbms-b321449f-35f4-4c46-9d91-1cbb6814798e`.

- [ ] **Step 1: Take pre-Step-D backup**

Use the same online backup method already proven in Steps A-C. Save to:

```text
C:\Users\CaveUser\.Neo4jDesktop2\Data\dbmss\dbms-b321449f-35f4-4c46-9d91-1cbb6814798e\data\dumps\pre-step-d-scenario-theory-2026-06-01
```

- [ ] **Step 2: Run dry-run**

```powershell
node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --dry-run --json
```

Expected:

```json
{
  "dryRun": true,
  "nodes": {
    "scenarios": 1,
    "shockVectors": 4,
    "riskThemes": 4
  }
}
```

- [ ] **Step 3: Run live write**

```powershell
node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --json
```

Expected:

```json
{
  "dryRun": false,
  "scenario": {
    "id": "scenario:2026-leverage-oil-fed-policy-fragility"
  }
}
```

- [ ] **Step 4: Verify graph shape**

```cypher
CYPHER 25
MATCH (sc:Scenario {id: 'scenario:2026-leverage-oil-fed-policy-fragility'})
OPTIONAL MATCH (sc)-[:HAS_SHOCK_VECTOR]->(sv:ShockVector)
OPTIONAL MATCH (sc)-[:HAS_RISK_THEME]->(rt:RiskTheme)
OPTIONAL MATCH (:RiskTheme)-[:PROPOSED_BY]->(cl:CandidateLink)-[:PROPOSES]->(target)
WHERE cl.type = 'scenario_exposure'
RETURN
  count(DISTINCT sc) AS scenarios,
  count(DISTINCT sv) AS shockVectors,
  count(DISTINCT rt) AS riskThemes,
  count(DISTINCT cl) AS candidateLinks,
  count(DISTINCT target) AS proposedTargets;
```

Expected:

```text
scenarios = 1
shockVectors = 4
riskThemes = 4
candidateLinks <= 100
proposedTargets <= candidateLinks
```

- [ ] **Step 5: Check no promoted edges were created**

```cypher
CYPHER 25
MATCH ()-[r]->()
WHERE r.fromScenario = 'scenario:2026-leverage-oil-fed-policy-fragility'
RETURN type(r) AS relType, count(*) AS rels
ORDER BY rels DESC;
```

Expected: no rows.

---

## Task 9: Dashboard Queries

**Files:**
- Modify: `04_Reference/Pull_System_Guide.md`

- [ ] **Step 1: Add scenario dashboard query**

```cypher
CYPHER 25
MATCH (sc:Scenario {id: 'scenario:2026-leverage-oil-fed-policy-fragility'})
MATCH (sc)-[:HAS_SHOCK_VECTOR]->(sv:ShockVector)-[:MAPS_TO_THEME]->(rt:RiskTheme)
OPTIONAL MATCH (rt)-[:PROPOSED_BY]->(cl:CandidateLink)-[:PROPOSES]->(target)
RETURN
  sc.name AS scenario,
  sv.name AS shockVector,
  rt.name AS riskTheme,
  count(DISTINCT cl) AS candidateLinks,
  collect(DISTINCT coalesce(target.ticker, target.name, target.canonicalName))[0..10] AS sampleTargets
ORDER BY candidateLinks DESC, shockVector;
```

- [ ] **Step 2: Add gap query**

```cypher
CYPHER 25
MATCH (rt:RiskTheme)-[:PROPOSED_BY]->(cl:CandidateLink)-[:PROPOSES]->(target)
WHERE cl.type = 'scenario_exposure'
OPTIONAL MATCH (target)<-[:OBSERVES]-(ms:MetricSnapshot)
OPTIONAL MATCH (target)<-[:MENTIONS]-(e:EvidenceArtifact)
RETURN
  rt.name AS riskTheme,
  labels(target) AS targetLabels,
  target.id AS targetId,
  coalesce(target.ticker, target.name, target.canonicalName) AS targetName,
  count(DISTINCT ms) AS metricSnapshots,
  count(DISTINCT e) AS evidenceMentions,
  cl.score AS scenarioScore,
  cl.reviewState AS reviewState
ORDER BY metricSnapshots ASC, evidenceMentions ASC, scenarioScore DESC
LIMIT 50;
```

---

## Task 10: Final Validation

**Files:**
- All files touched above.

- [ ] **Step 1: Run focused tests**

```powershell
node --test scripts\tests\neo4j-scenario-theories.test.mjs scripts\tests\neo4j-scenario-theory-puller.test.mjs scripts\tests\puller-catalog.test.mjs scripts\tests\command-surface.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run dry-run command**

```powershell
node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --dry-run --json
```

Expected: JSON dry-run payload.

- [ ] **Step 3: Run vault validation**

```powershell
node run.mjs system validate
```

Expected:

```text
Vault validation passed: no schema issues found.
```

---

## Self-Review

Spec coverage:
- Broad theory modeled as `Scenario`: covered by Tasks 3, 5, and 8.
- Pulls in stocks/sectors/gaps through metadata/properties: covered by Task 7 and Task 9.
- Keeps uncertain claims reviewable: covered by CandidateLink rule and Task 7.
- Integrates with current Step A-C graph: covered by File Structure, Model, and Task 8.
- Cadence/manual-only safety: covered by Task 5 and Task 10.

Placeholder scan:
- No `TBD`, `TODO`, or vague "add appropriate handling" instructions remain.

Type consistency:
- Node labels and relationship types match the model section.
- Scenario ID is consistent across JSON, tests, puller, and Cypher.
- CandidateLink properties match Step B conventions: `status`, `reviewState`, `score`, `method`, `source`, `type`.
