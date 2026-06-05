import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { run } from '../bridge/ingest-world-inbox.mjs';

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

// ---------------------------------------------------------------------------
// collectInboxItems â€” inboxRoot does not exist
// ---------------------------------------------------------------------------

await runTest('run returns processed:0 when inboxRoot does not exist', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-missing-'));
  try {
    // _Inbox directory is intentionally NOT created
    const summary = await run({ worldRoot, dryRun: true, date: '2026-01-01' });
    assert.equal(summary.processed, 0);
    assert.deepEqual(summary.archived, []);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// INFRA_FILES exclusion
// ---------------------------------------------------------------------------

await runTest('INFRA_FILES are excluded and only real inbox items are counted', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-infra-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });

    // Infrastructure files that must be excluded
    writeFixture(inboxRoot, '_Inbox README.md', '# Inbox README\nThis is infrastructure.');
    writeFixture(inboxRoot, 'Inbox Ingestion Runbook.md', '# Runbook\nInfra content.');
    writeFixture(inboxRoot, 'Inbox Topic Map.md', '# Topic Map\nInfra content.');
    writeFixture(inboxRoot, 'Market Positioning Ledger.md', '# Market Positioning Ledger\nInfra content.');
    writeFixture(inboxRoot, 'Market Positioning Ledger - Positions.md', '# Positions\nInfra content.');
    writeFixture(inboxRoot, 'Market Positioning Ledger - Discard Log.md', '# Discard Log\nInfra content.');
    writeFixture(inboxRoot, 'INGESTION_CONTRACT.md', '# Ingestion Contract\nInfra content.');
    writeFixture(inboxRoot, 'readme.md', '# readme\nAlso excluded.');

    // One real processable file
    writeFixture(inboxRoot, 'Real Note.md', '# Real Note\nThis is a real inbox item about macro and GDP data.');

    const summary = await run({ worldRoot, dryRun: true, date: '2026-01-15' });

    assert.equal(summary.processed, 1, 'only the real note should be counted, not infra files');
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// dryRun:true does not write files or move anything
// ---------------------------------------------------------------------------

await runTest('run with dryRun:true does not write the observation file', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-dryrun-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(inboxRoot, 'Market Update.md', '# Market Update\nFed raised rates by 25bps. Inflation cpi data is out.');

    const summary = await run({ worldRoot, dryRun: true, date: '2026-02-10' });

    assert.equal(summary.dryRun, true);
    assert.equal(summary.processed, 1);
    // Observation file must NOT have been written
    assert.equal(existsSync(summary.observationPath), false, 'observation file must not exist after dry run');
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('run with dryRun:true does not move (archive) any inbox files', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-dryrun-archive-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(inboxRoot, 'CPI Report.md', '# CPI Report\nInflation cpi numbers came in hot this month.');

    const summary = await run({ worldRoot, dryRun: true, date: '2026-03-01' });

    // archived array must be empty in dry-run mode
    assert.deepEqual(summary.archived, [], 'archived must be empty after dry run');
    // The original file must still be in the inbox
    assert.equal(existsSync(join(inboxRoot, 'CPI Report.md')), true, 'original file must remain in inbox after dry run');
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// buildObservation output â€” valid YAML frontmatter with type: observation
// ---------------------------------------------------------------------------

await runTest('observation file contains valid YAML frontmatter block with type: observation', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-observation-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(inboxRoot, 'GDP Release.md', '# GDP Release\nGDP came in below expectations impacting macro outlook.');

    const summary = await run({ worldRoot, dryRun: false, date: '2026-04-05' });

    assert.equal(existsSync(summary.observationPath), true, 'observation file must be written');

    const { readFileSync } = await import('node:fs');
    const content = readFileSync(summary.observationPath, 'utf-8');

    // Must open and close YAML frontmatter
    assert.match(content, /^---\n/, 'must start with YAML frontmatter delimiter');
    assert.match(content, /\ntype: observation\n/, 'must contain type: observation in frontmatter');
    assert.match(content, /\ncreated: 2026-04-05\n/, 'must contain the correct created date');
    assert.match(content, /\ntags: \[inbox, ingestion, macro\]\n/, 'must contain required tags');
    assert.match(content, /\nsignal_status: watch\n/, 'must contain signal_status: watch');
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('observation file body contains routing summary table and follow-up section', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-body-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(inboxRoot, 'Fed Minutes.md', '# Fed Minutes\nFed rates decision and yield curve implications for the macro regime.');

    const summary = await run({ worldRoot, dryRun: false, date: '2026-04-20' });

    const { readFileSync } = await import('node:fs');
    const content = readFileSync(summary.observationPath, 'utf-8');

    assert.match(content, /## Routing Summary/, 'must include Routing Summary heading');
    assert.match(content, /\| Source \| Suggested route \| Archive \| Extract \|/, 'must include table header row');
    assert.match(content, /## Event Trend Synthesis/, 'must include event trend synthesis heading');
    assert.match(content, /Rates, Bonds, And Inflation Expectations/, 'must connect Fed/rates inbox items to larger trend clusters');
    assert.match(content, /## Themed Words Report/, 'must include themed words report heading');
    assert.match(content, /\| Rates, Bonds, And Inflation Expectations \| `fed` \| 1 \| Fed Minutes \|/, 'must count themed word hits by source item');
    assert.match(content, /## Event Network Handoffs/, 'must include event network handoffs heading');
    assert.match(content, /node run\.mjs pull event-research --scenario fertilizer-shortage --dry-run/, 'must include event-research dry-run handoff');
    assert.match(content, /## Follow-Up/, 'must include Follow-Up section');
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('observation file includes Neo4j transfer metadata and machine-readable CandidateLink proposals', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-neo4j-transfer-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(
      inboxRoot,
      'Fed Oil Fragility.md',
      '# Fed Oil Fragility\nFed rates, yields, bonds, CPI inflation, Iran oil sanctions, and duration pressure are converging.\n\nhttps://example.com/fed-oil',
    );

    const summary = await run({ worldRoot, dryRun: false, date: '2026-06-02' });

    const { readFileSync } = await import('node:fs');
    const content = readFileSync(summary.observationPath, 'utf-8');
    assert.match(content, /\ngraph_export_version: 1\n/);
    assert.match(content, /\ngraph_node_id: "world:inbox-ingestion-batch:2026-06-02"\n/);
    assert.match(content, /\nneo4j_import_ready: true\n/);
    assert.match(content, /\nprocessed_item_count: 1\n/);
    assert.match(content, /\ncandidate_link_count: \d+\n/);
    assert.match(content, /## Neo4j Transfer Block/);

    const payload = parseNeo4jTransferPayload(content);
    assert.equal(payload.schema, 'neo4j_inbox_ingestion_v1');
    assert.equal(payload.batch.id, 'world:inbox-ingestion-batch:2026-06-02');
    assert.equal(payload.batch.source_rel_path, 'Reports/Inbox Reports/2026-06-02 - Inbox Ingestion Batch.md');
    assert.equal(payload.items.length, 1);
    assert.match(payload.items[0].id, /^world:inbox-item:2026-06-02:/);
    assert.equal(payload.items[0].archive_rel_path, '500-archive/Inbox/2026-06-02/Fed Oil Fragility.md');
    assert.equal(payload.items[0].source_url, 'https://example.com/fed-oil');
    assert.equal(payload.items[0].raw_body, undefined, 'transfer payload must not include raw clipping bodies');
    assert.equal(payload.trends.length > 0, true, 'Fed/oil fixture should produce graph-ready trend nodes');
    assert.equal(payload.candidate_links.length > 0, true, 'event candidates should become reviewable CandidateLink payload rows');
    for (const link of payload.candidate_links) {
      assert.equal(link.status, 'candidate');
      assert.equal(link.reviewState, 'needs_review');
      assert.equal(link.method, 'world_machine_inbox_ingestion');
      assert.equal(link.source, 'ingest-world-inbox');
      assert.equal(link.type, 'inbox_event_connection');
    }
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('run can rebuild trend synthesis from archived inbox items', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-archive-rebuild-'));
  try {
    const archiveRoot = join(worldRoot, '500-archive', 'Inbox', '2026-05-25');
    mkdirSync(archiveRoot, { recursive: true });
    writeFixture(archiveRoot, 'SpotGamma.md', '# SpotGamma\nSpotGamma FlowPatrol showed gamma and market mechanics behind the rally.');
    writeFixture(archiveRoot, 'Hospital Prices.md', '# Hospital Prices\nHealthcare and hospital prices are adding pressure to consumer prices and CPI.');

    const summary = await run({ worldRoot, 'from-archive': true, 'update-existing': true, date: '2026-05-25' });

    assert.equal(summary.fromArchive, true);
    assert.equal(summary.processed, 2);
    assert.equal(summary.archived.length, 0);
    assert.ok(summary.relatedScenarios.includes('glp1-supply-chain-shortage'));
    assert.equal(existsSync(summary.observationPath), true);

    const { readFileSync } = await import('node:fs');
    const content = readFileSync(summary.observationPath, 'utf-8');
    assert.match(content, /Market Structure Vs Fundamentals/);
    assert.match(content, /Healthcare Pricing And Policy Pressure/);
    assert.match(content, /node run\.mjs pull event-research --scenario glp1-supply-chain-shortage --dry-run/);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('run writes event connection candidates and plotly artifact without a review queue', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-event-connections-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(inboxRoot, 'Fed Rates.md', '# Fed Rates\nFed rates, yields, duration, bonds, and CPI inflation expectations are moving.');

    const summary = await run({ worldRoot, dryRun: false, date: '2026-05-25' });

    assert.equal(summary.eventConnectionCount > 0, true, 'must report event connection count');
    assert.equal(existsSync(summary.visualArtifactPath), true, 'plotly visual artifact must be written');
    assert.equal(existsSync(join(worldRoot, '_Inbox', 'Review Queue.md')), false, 'review queue must not be written');

    const { readFileSync } = await import('node:fs');
    const observation = readFileSync(summary.observationPath, 'utf-8');
    const html = readFileSync(summary.visualArtifactPath, 'utf-8');

    assert.match(observation, /event_connection_status: review/);
    assert.match(observation, /## Current Event Connection Candidates/);
    assert.match(observation, /## Event Connection Map/);
    assert.match(observation, /```mermaid\nflowchart LR/);
    assert.match(observation, /## Visual Review Artifact/);
    assert.match(html, /window\.INBOX_EVENT_CONNECTIONS/);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('inbox ingestion routes neocloud and photonics clips to AI infrastructure handoffs', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-ai-infra-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(
      inboxRoot,
      'Neocloud Photonics.md',
      '# Neocloud Photonics\nNeocloud GPU cluster operators are using photonics, optical interconnects, and AI compute capacity to reduce data center power bottlenecks.',
    );

    const summary = await run({ worldRoot, dryRun: false, date: '2026-06-03', 'no-plotly': true });

    const observation = readFileSync(summary.observationPath, 'utf-8');
    assert.match(observation, /AI Infrastructure Vocabulary And Compute Bottlenecks/);
    assert.match(observation, /neocloud|photonics|optical interconnects/i);
    assert.match(observation, /node run\.mjs pull event-research --scenario ai-data-center-power-bottleneck --dry-run/);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('--no-plotly skips html artifact and visual artifact link', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-no-plotly-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(inboxRoot, 'Grid Demand.md', '# Grid Demand\nData center power demand and grid transformer capacity are constrained.');

    const summary = await run({ worldRoot, dryRun: false, date: '2026-05-26', 'no-plotly': true });

    assert.equal(summary.visualArtifactPath, null);
    const { readFileSync } = await import('node:fs');
    const observation = readFileSync(summary.observationPath, 'utf-8');
    assert.doesNotMatch(observation, /## Visual Review Artifact/);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('--no-event-connections preserves observation-only output shape', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-no-connections-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });
    writeFixture(inboxRoot, 'Rates.md', '# Rates\nFed yields and inflation expectations.');

    const summary = await run({ worldRoot, dryRun: false, date: '2026-05-27', 'no-event-connections': true });

    assert.equal(summary.eventConnectionCount, 0);
    assert.equal(summary.visualArtifactPath, null);
    assert.equal(existsSync(join(worldRoot, '_Inbox', 'Review Queue.md')), false);
    const { readFileSync } = await import('node:fs');
    const observation = readFileSync(summary.observationPath, 'utf-8');
    assert.doesNotMatch(observation, /## Current Event Connection Candidates/);
    assert.doesNotMatch(observation, /event_connection_status/);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// uniqueObservationPath appends counter on collision
// ---------------------------------------------------------------------------

await runTest('uniqueObservationPath appends counter when base observation path already exists', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'ingest-inbox-unique-'));
  try {
    const inboxRoot = join(worldRoot, '_Inbox');
    mkdirSync(inboxRoot, { recursive: true });

    // First run â€” writes the base observation file
    writeFixture(inboxRoot, 'First Item.md', '# First Item\nMacro GDP data for the first run.');
    const first = await run({ worldRoot, dryRun: false, date: '2026-05-01' });
    assert.equal(existsSync(first.observationPath), true, 'first observation must be written');

    // Restore the inbox item so a second run has something to process
    writeFixture(inboxRoot, 'Second Item.md', '# Second Item\nMore cpi macro data for the second run.');

    // Second run on the same date â€” base path already exists, must use counter suffix
    const second = await run({ worldRoot, dryRun: false, date: '2026-05-01' });
    assert.equal(existsSync(second.observationPath), true, 'second observation must be written');

    // Paths must be different
    assert.notEqual(first.observationPath, second.observationPath, 'second run must use a different path');

    // Second path must end with a counter (e.g., "... 2.md")
    assert.match(second.observationPath, /\s2\.md$/, 'counter-suffixed path must end with " 2.md"');

    const firstPayload = parseNeo4jTransferPayload(readFileSync(first.observationPath, 'utf-8'));
    const secondPayload = parseNeo4jTransferPayload(readFileSync(second.observationPath, 'utf-8'));
    assert.equal(firstPayload.batch.id, 'world:inbox-ingestion-batch:2026-05-01');
    assert.notEqual(secondPayload.batch.id, firstPayload.batch.id, 'same-date second run must use a unique graph batch id');
    assert.match(secondPayload.batch.id, /^world:inbox-ingestion-batch:2026-05-01:/);
    assert.equal(secondPayload.batch.title, '2026-05-01 - Inbox Ingestion Batch 2');
    assert.equal(secondPayload.batch.source_rel_path, 'Reports/Inbox Reports/2026-05-01 - Inbox Ingestion Batch 2.md');
    assert.notEqual(secondPayload.trends[0]?.id, firstPayload.trends[0]?.id, 'same-date second run must not reuse trend ids');
    assert.notEqual(secondPayload.candidate_links[0]?.id, firstPayload.candidate_links[0]?.id, 'same-date second run must not reuse candidate ids');
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function writeFixture(dir, filename, content) {
  writeFileSync(join(dir, filename), content, 'utf-8');
}

function parseNeo4jTransferPayload(content) {
  const match = content.match(/## Neo4j Transfer Block[\s\S]*?```json\n([\s\S]*?)\n```/);
  assert.ok(match, 'expected a fenced JSON transfer payload');
  return JSON.parse(match[1]);
}

