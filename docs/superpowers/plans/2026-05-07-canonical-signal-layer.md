# Canonical Signal Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a canonical signal-intelligence puller and wire its cards into monitoring, briefing, and thesis reports.

**Architecture:** Put scoring, evidence matching, deeper-dive selection, gap auditing, markdown rendering, and sidecar loading in `scripts/lib/signal-intelligence.mjs`. Keep `scripts/pullers/signal-intelligence.mjs` as a thin I/O wrapper that reads vault notes and writes the markdown report plus JSON sidecar. Existing report builders consume helper renderers from the lib so they tolerate a missing sidecar and do not duplicate parsing logic.

**Tech Stack:** Node.js ESM, built-in `node:test` style assertions, existing vault helpers from `scripts/lib/config.mjs`, `scripts/lib/frontmatter.mjs`, `scripts/lib/markdown.mjs`, and existing JSON catalogs in `scripts/config/`.

---

## File Structure

- Create `scripts/lib/signal-intelligence.mjs`: pure and reusable signal card engine, sidecar loader, markdown renderers for reports.
- Create `scripts/pullers/signal-intelligence.mjs`: CLI puller that loads local vault context and writes artifacts.
- Create `scripts/tests/signal-intelligence.test.mjs`: unit tests for status rollups, deep dives, gap audit, markdown rendering, and missing-sidecar fallback.
- Modify `scripts/cmd/router.mjs`: add help text for `pull signal-intelligence`.
- Modify `scripts/routines/cadence.mjs`: run `pull signal-intelligence` before reports that consume it.
- Modify `scripts/pullers/streamline-report.mjs`: add `Canonical Signal Intelligence` and compact deeper-dive blocks.
- Modify `scripts/pullers/research-spine-flow.mjs`: add compact signal and deeper-dive blocks to monitoring snapshots and briefings.
- Modify `scripts/thesis-full-picture.mjs`: add the current thesis canonical signal and deeper-dive queue.
- Modify `docs/superpowers/specs/2026-05-07-canonical-signal-layer-design.md`: already updated with the gap-audit requirement.

## Implementation Tasks

### Task 1: Write Engine Tests

**Files:**
- Create: `scripts/tests/signal-intelligence.test.mjs`

- [ ] **Step 1: Add failing tests for status rollup, deep dives, gap audit, markdown rendering, and missing sidecar fallback**

```javascript
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  buildDeepDiveQueue,
  buildGapAudit,
  buildSignalIntelligenceNote,
  buildStrategyCards,
  loadLatestSignalIntelligence,
  maxSignalStatus,
  renderCanonicalSignalBlock,
} from '../lib/signal-intelligence.mjs';

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

await runTest('maxSignalStatus returns the highest operator attention status', () => {
  assert.equal(maxSignalStatus(['clear', 'watch', 'alert']), 'alert');
  assert.equal(maxSignalStatus(['clear', 'critical', 'watch']), 'critical');
  assert.equal(maxSignalStatus(['unknown', '', null]), 'clear');
});

await runTest('buildDeepDiveQueue selects research and news artifacts with study questions', () => {
  const queue = buildDeepDiveQueue({
    name: 'Rates Funding',
    terms: ['rates', 'funding', 'basis'],
    artifacts: [
      artifact('Research', 'Semantic Scholar Rates Funding Basis', 'semantic_scholar_papers', 'watch'),
      artifact('News', 'Funding stress news cluster', 'gdelt_news_monitor', 'alert'),
      artifact('Market', 'Unrelated technical snapshot', 'technical_snapshot', 'clear'),
    ],
    references: ['[[Repo Funding Stress]]'],
    maxItems: 3,
  });

  assert.equal(queue.length, 3);
  assert.equal(queue[0].source_type, 'research');
  assert.ok(queue[0].questions.length >= 2);
  assert.match(queue[0].why_it_matters, /Rates Funding/i);
});

await runTest('buildStrategyCards flags stale or missing strategy evidence', () => {
  const cards = buildStrategyCards({
    strategies: [{
      id: 'quality_compounders',
      name: 'Quality Compounders',
      status: 'live-candidate',
      signal_set: ['ROIC trend', 'FCF conversion'],
      data_requirements: ['fmp.fundamentals', 'sec.filings'],
      regime_fit: ['risk-on'],
      regime_unfit: ['credit-stress'],
      mechanisms: ['post_earnings_drift'],
      references: ['Curriculum'],
    }],
    artifacts: [artifact('Research', 'Quality compounders research note', 'semantic_scholar_papers', 'clear')],
    cycleCards: [{ name: 'Credit Stress', signal_status: 'alert', direction: 'risk' }],
    date: '2026-05-07',
  });

  assert.equal(cards.length, 1);
  assert.equal(cards[0].scope, 'strategy');
  assert.equal(cards[0].signal_status, 'watch');
  assert.ok(cards[0].risks.some(item => /coverage|regime|missing/i.test(item)));
});

await runTest('buildGapAudit reports missing related strategies and data gaps', () => {
  const gaps = buildGapAudit({
    strategies: [{ id: 'quality_compounders', name: 'Quality Compounders' }],
    theses: [{ name: 'Housing Supply Correction', note: { data: { status: 'Active' } }, symbols: ['DHI'] }],
    mechanisms: [{
      id: 'repo_stress',
      name: 'Repo Funding Stress',
      related_strategies: ['funding_stress_monitor'],
      signals_to_watch: [{ signal: 'SOFR rate', data_source: 'fred' }],
    }],
    cards: [{
      scope: 'thesis',
      name: 'Housing Supply Correction',
      signal_status: 'watch',
      evidence_links: [],
    }],
    artifacts: [],
    cycleStatusNotes: [],
  });

  assert.ok(gaps.some(gap => gap.scope === 'strategy' && gap.name === 'funding_stress_monitor'));
  assert.ok(gaps.some(gap => gap.scope === 'thesis' && gap.name === 'Housing Supply Correction'));
  assert.ok(gaps.some(gap => gap.scope === 'market-cycle' && gap.name === 'Repo Funding Stress'));
});

await runTest('buildSignalIntelligenceNote renders canonical sections', () => {
  const note = buildSignalIntelligenceNote({
    date: '2026-05-07',
    signal_status: 'watch',
    cards: [{
      id: 'strategy:quality-compounders:2026-05-07',
      scope: 'strategy',
      name: 'Quality Compounders',
      signal_status: 'watch',
      direction: 'mixed',
      confidence: 'Medium',
      summary: 'Quality evidence exists but coverage is incomplete.',
      drivers: ['Research support exists.'],
      risks: ['Fundamental data is missing.'],
      evidence_links: [],
      deep_dive_queue: [],
      recommended_next_action: 'Refresh FMP fundamentals.',
    }],
    deep_dive_queue: [],
    gap_audit: [{
      scope: 'strategy',
      name: 'funding_stress_monitor',
      gap_type: 'missing_strategy_candidate',
      severity: 'watch',
      evidence: ['Referenced by Repo Funding Stress.'],
      recommended_next_action: 'Review whether this belongs in strategy-catalog.json.',
    }],
    source_counts: { artifacts: 3, strategies: 1, theses: 1, mechanisms: 1 },
  });

  assert.match(note, /## Signal Summary/);
  assert.match(note, /## Missing Signals And Data Gaps/);
  assert.match(note, /Quality Compounders/);
});

await runTest('renderCanonicalSignalBlock tolerates missing sidecar', async () => {
  const root = await makeTempDir('signal-intelligence-empty-');
  try {
    const loaded = await loadLatestSignalIntelligence(root);
    assert.equal(loaded, null);
    assert.match(renderCanonicalSignalBlock(null), /No canonical signal intelligence artifact found/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function artifact(domain, title, dataType, signalStatus) {
  return {
    path: `C:/vault/05_Data_Pulls/${domain}/2026-05-07_${title.replace(/[^A-Za-z0-9]+/g, '_')}.md`,
    filename: `2026-05-07_${title.replace(/[^A-Za-z0-9]+/g, '_')}.md`,
    pullDomain: domain,
    date: '2026-05-07',
    data: {
      title,
      domain: domain.toLowerCase(),
      data_type: dataType,
      signal_status: signalStatus,
      date_pulled: '2026-05-07',
    },
    content: title,
  };
}

async function makeTempDir(prefix) {
  const dir = join(tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
node --test scripts/tests/signal-intelligence.test.mjs
```

Expected: fail with `Cannot find module ... scripts/lib/signal-intelligence.mjs`.

### Task 2: Implement Signal Intelligence Engine

**Files:**
- Create: `scripts/lib/signal-intelligence.mjs`
- Test: `scripts/tests/signal-intelligence.test.mjs`

- [ ] **Step 1: Add the engine implementation**

Implement these exports in `scripts/lib/signal-intelligence.mjs`:

```javascript
export function maxSignalStatus(statuses = []) {}
export function buildDeepDiveQueue({ name, terms, artifacts, references = [], maxItems = 3 }) {}
export function buildStrategyCards({ strategies, artifacts, cycleCards = [], date }) {}
export function buildThesisCards({ theses, artifacts, date }) {}
export function buildMarketCycleCards({ mechanisms, cycleStatusNotes = [], artifacts, date }) {}
export function buildGapAudit({ strategies, theses, mechanisms, cards, artifacts, cycleStatusNotes = [] }) {}
export function buildPayload({ date, scope, strategies, theses, mechanisms, artifacts, cycleStatusNotes }) {}
export function buildSignalIntelligenceNote(payload) {}
export async function loadLatestSignalIntelligence(cacheRoot) {}
export function renderCanonicalSignalBlock(payload, options = {}) {}
export function renderCanonicalDeepDiveBlock(payload, options = {}) {}
export function findCardForName(payload, scope, name) {}
```

The implementation must:

- Normalize `signal_status` to `clear`, `watch`, `alert`, or `critical`.
- Match artifacts by normalized tokens from names, signals, mechanisms, symbols, and references.
- Prefer evidence from `Research`, `News`, `SourceWatch`, `Theses`, `Market`, `Macro`, `Government`, and `Sectors`.
- Generate deeper-dive questions from topic terms.
- Generate gap-audit rows for missing strategies, missing thesis inputs, market-cycle data gaps, and active cards with thin evidence.
- Render markdown using `buildNote` and `buildTable`.
- Load the newest JSON sidecar by date-sorted filename.
- Render fallback text when no payload exists.

- [ ] **Step 2: Run the engine test and verify GREEN**

Run:

```powershell
node --test scripts/tests/signal-intelligence.test.mjs
```

Expected: all tests in `signal-intelligence.test.mjs` pass.

### Task 3: Write Puller Tests

**Files:**
- Modify: `scripts/tests/signal-intelligence.test.mjs`
- Create: `scripts/pullers/signal-intelligence.mjs`

- [ ] **Step 1: Add failing puller tests for dry-run and sidecar writing**

Append tests that import `pull` from `../pullers/signal-intelligence.mjs`, set temporary `SIGNAL_INTELLIGENCE_CACHE_ROOT`, run `pull({ 'dry-run': true })`, and assert:

```javascript
assert.equal(result.dryRun, true);
assert.equal(result.filePath, null);
assert.ok(Array.isArray(result.cards));
assert.ok(result.markdown.includes('Signal Intelligence'));
```

Then run a write-mode test with temporary cache and assert the JSON sidecar exists at the returned `sidecarPath`.

- [ ] **Step 2: Run the tests and verify RED**

Run:

```powershell
node --test scripts/tests/signal-intelligence.test.mjs
```

Expected: fail because `scripts/pullers/signal-intelligence.mjs` does not exist.

### Task 4: Implement Signal Intelligence Puller

**Files:**
- Create: `scripts/pullers/signal-intelligence.mjs`
- Modify: `scripts/cmd/router.mjs`
- Test: `scripts/tests/signal-intelligence.test.mjs`

- [ ] **Step 1: Add the puller wrapper**

The puller must:

- Read strategies via `loadStrategyCatalog()`.
- Read mechanisms via `loadMechanismMap()`.
- Read pull notes recursively under `getPullsDir()` using `readFolder`.
- Skip `_archive` paths.
- Read thesis notes through `loadThesisWatchlists({ includeBaskets: true })`.
- Read Research Spine cycle status notes from `getResearchVaultRoot()/01_Freshness/Market_Cycles` when present.
- Call `buildPayload()`.
- Call `buildSignalIntelligenceNote()`.
- On `--dry-run`, print markdown and return `{ dryRun: true, filePath: null, sidecarPath: null, cards, markdown }`.
- In write mode, write markdown to `05_Data_Pulls/Signals/YYYY-MM-DD_Signal_Intelligence.md`.
- Write JSON to `scripts/.cache/signal-intelligence/YYYY-MM-DD.json`, or `process.env.SIGNAL_INTELLIGENCE_CACHE_ROOT` in tests.
- Print JSON summary when `--json` is set.

- [ ] **Step 2: Add router help text**

Add this puller entry under `pull` help in `scripts/cmd/router.mjs`:

```text
  signal-intelligence Canonical strategy, thesis, market-cycle signal layer
                --scope <all|strategy|thesis|market-cycle>
                --dry-run | --json
```

- [ ] **Step 3: Run puller tests and verify GREEN**

Run:

```powershell
node --test scripts/tests/signal-intelligence.test.mjs
```

Expected: all tests in `signal-intelligence.test.mjs` pass.

### Task 5: Integrate Reports

**Files:**
- Modify: `scripts/pullers/streamline-report.mjs`
- Modify: `scripts/pullers/research-spine-flow.mjs`
- Modify: `scripts/thesis-full-picture.mjs`
- Test: `scripts/tests/signal-intelligence.test.mjs`

- [ ] **Step 1: Add report integration tests**

Append tests that call:

```javascript
renderCanonicalSignalBlock(payload, { limit: 2 })
renderCanonicalDeepDiveBlock(payload, { limit: 2 })
findCardForName(payload, 'thesis', 'Housing Supply Correction')
```

Assert the rendered blocks include the card name, status, next action, deeper-dive topic, and fallback text for null payload.

- [ ] **Step 2: Run tests and verify RED or confirm existing helper gap**

Run:

```powershell
node --test scripts/tests/signal-intelligence.test.mjs
```

Expected: fail if the helper behavior is incomplete.

- [ ] **Step 3: Wire `streamline-report.mjs`**

Import:

```javascript
import {
  loadLatestSignalIntelligence,
  renderCanonicalDeepDiveBlock,
  renderCanonicalSignalBlock,
} from '../lib/signal-intelligence.mjs';
```

Load the payload near the start of `pull()` after report data is loaded:

```javascript
const signalIntelligence = await loadLatestSignalIntelligence().catch(() => null);
```

Pass it into `buildStreamlineNote()` and add sections:

```javascript
{
  heading: 'Canonical Signal Intelligence',
  content: renderCanonicalSignalBlock(signalIntelligence, { limit: 10 }),
},
{
  heading: 'Canonical Deeper Dive Queue',
  content: renderCanonicalDeepDiveBlock(signalIntelligence, { limit: 5 }),
},
```

- [ ] **Step 4: Wire `research-spine-flow.mjs`**

Import:

```javascript
import {
  loadLatestSignalIntelligence,
  renderCanonicalDeepDiveBlock,
  renderCanonicalSignalBlock,
} from '../lib/signal-intelligence.mjs';
```

Make `buildContext()` async, load the latest payload, and add it to context:

```javascript
signalIntelligence: await loadLatestSignalIntelligence().catch(() => null)
```

Add compact blocks to monitoring snapshots and briefings:

```javascript
'## Canonical Signal Intelligence',
'',
renderCanonicalSignalBlock(context.signalIntelligence, { limit: 8 }),
'',
'## Deeper Dive Queue',
'',
renderCanonicalDeepDiveBlock(context.signalIntelligence, { limit: 5 }),
```

- [ ] **Step 5: Wire `thesis-full-picture.mjs`**

Import:

```javascript
import {
  findCardForName,
  loadLatestSignalIntelligence,
  renderCanonicalDeepDiveBlock,
  renderCanonicalSignalBlock,
} from './lib/signal-intelligence.mjs';
```

Load the latest payload once in `run()` and pass it into `buildReportContext()`. Add `canonicalSignalCard` and `canonicalSignalPayload` to the context. Add sections after `Snapshot`:

```javascript
{
  heading: 'Canonical Thesis Signal',
  content: context.canonicalSignalCard
    ? renderCanonicalSignalBlock({ cards: [context.canonicalSignalCard] }, { limit: 1 })
    : 'No canonical thesis signal found for this thesis. Run `node run.mjs pull signal-intelligence`.',
},
{
  heading: 'Thesis Deeper Dive Queue',
  content: context.canonicalSignalCard
    ? renderCanonicalDeepDiveBlock({ deep_dive_queue: context.canonicalSignalCard.deep_dive_queue }, { limit: 3 })
    : 'No canonical deeper-dive queue found for this thesis.',
},
```

- [ ] **Step 6: Run tests and verify GREEN**

Run:

```powershell
node --test scripts/tests/signal-intelligence.test.mjs
```

Expected: all tests in `signal-intelligence.test.mjs` pass.

### Task 6: Add Routine Placement

**Files:**
- Modify: `scripts/routines/cadence.mjs`

- [ ] **Step 1: Insert signal-intelligence into routines**

Add `cmd('Signal intelligence', ['pull', 'signal-intelligence'])`:

- Premarket: after `Market cycle status`, before Research Spine premarket snapshot.
- Daily post-pull: after Source Watch and Market Cycle Status, before Streamline Report and Research Spine daily docs.
- Midday: after Market Cycle Status, before Research Spine midday snapshot.
- Preclose: after Market Cycle Status, before Research Spine preclose snapshot.
- Endofday: after Market Cycle Status, before Research Spine EOD docs.
- Weekly post-pull: before Streamline Report and Confluence Scan.
- Monthly: before Thesis full picture.

- [ ] **Step 2: Run a dry-run routine check**

Run:

```powershell
node run.mjs routine daily --dry-run --skip-validate
```

Expected: output includes `node run.mjs pull signal-intelligence` before `node run.mjs pull streamline-report`.

### Task 7: Run End-to-End Verification

**Files:**
- No new files.

- [ ] **Step 1: Run targeted unit tests**

Run:

```powershell
node --test scripts/tests/signal-intelligence.test.mjs
```

Expected: all targeted tests pass.

- [ ] **Step 2: Run related existing tests**

Run:

```powershell
node --test scripts/tests/report-context.test.mjs scripts/tests/market-cycle-monitor.test.mjs scripts/tests/confluence-scan.test.mjs
```

Expected: existing related tests pass.

- [ ] **Step 3: Run puller dry-run**

Run:

```powershell
node run.mjs pull signal-intelligence --dry-run
```

Expected: prints a markdown report with `Signal Summary`, `Deeper Dive Queue`, and `Missing Signals And Data Gaps`.

- [ ] **Step 4: Run report dry-runs**

Run:

```powershell
node run.mjs pull streamline-report --dry-run --window 14 --limit 8
node run.mjs pull research-spine-flow --documents daily-monitoring,daily-briefing --dry-run
node run.mjs thesis full-picture --dry-run --thesis "Housing Supply Correction"
```

Expected: no command throws; each report includes canonical signal fallback text or canonical signal sections.

- [ ] **Step 5: Run vault validation if generated file writes happened**

Run:

```powershell
node run.mjs system validate
```

Expected: no new validation errors attributable to `05_Data_Pulls/Signals/YYYY-MM-DD_Signal_Intelligence.md`.
