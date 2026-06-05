import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  DEFAULT_ARCHIVE_RELATIVE_ROOT,
  buildEndpointCatalog,
  buildHarvestPlan,
  auditArchive,
  classifyFailureStatus,
  computeDateRangeDescending,
  redactUrl,
  resolveStageSequence,
  selectPendingWorkUnits,
  validateRawPayload,
  writeRawArchiveFile,
} from '../pullers/fmp-harvest.mjs';

const SCRATCH_WRITE = resolve('99_System', 'data_archives', '.test_fmp_harvest_write');
const SCRATCH_AUDIT = resolve('99_System', 'data_archives', '.test_fmp_harvest_audit');
const SCRATCH_DRIFT = resolve('99_System', 'data_archives', '.test_fmp_harvest_drift');

function runTest(name, fn) {
  Promise.resolve()
    .then(fn)
    .then(() => console.log(`ok - ${name}`))
    .catch(error => {
      console.error(`not ok - ${name}`);
      console.error(error);
      process.exitCode = 1;
    });
}

function cleanScratch(path) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

runTest('expands all into the deterministic harvest stage sequence', () => {
  assert.deepEqual(resolveStageSequence('all'), [
    'foundation',
    'current-bulk',
    'statements-bulk',
    'prices-bulk',
    'deep-backfill',
    'ownership',
    'final-refresh',
    'audit',
  ]);
  assert.deepEqual(resolveStageSequence('prices-bulk'), ['prices-bulk']);
  assert.throws(() => resolveStageSequence('nonsense'), /Invalid FMP harvest stage/);
});

runTest('builds bulk-first endpoint catalog and descending price date windows', () => {
  const catalog = buildEndpointCatalog({
    from: '2026-05-29',
    to: '2026-06-01',
    annualStartYear: 2024,
    annualEndYear: 2025,
    quarterlyStart: '2025-Q4',
    quarterlyEnd: '2026-Q1',
  });

  assert.ok(catalog.some(unit => unit.stage === 'prices-bulk' && unit.endpoint === 'eod-bulk'));
  assert.ok(catalog.some(unit => unit.stage === 'statements-bulk' && unit.endpoint === 'income-statement-bulk' && unit.params.year === 2025 && unit.params.period === 'FY'));
  assert.ok(catalog.some(unit => unit.stage === 'statements-bulk' && unit.endpoint === 'cash-flow-statement-growth-bulk' && unit.params.year === 2026 && unit.params.period === 'Q1'));
  assert.deepEqual(computeDateRangeDescending('2026-05-29', '2026-06-01'), [
    '2026-06-01',
    '2026-05-31',
    '2026-05-30',
    '2026-05-29',
  ]);
});

runTest('dry-run plan is local-only and does not require API key fields', () => {
  const plan = buildHarvestPlan({
    stage: 'all',
    scope: 'hybrid',
    dryRun: true,
    universe: {
      T0: ['SPY'],
      T1: ['MSFT', 'AAPL'],
      T2: ['QQQ'],
      T3: ['XYZ'],
    },
    from: '2026-06-01',
    to: '2026-06-01',
    annualStartYear: 2025,
    annualEndYear: 2025,
    quarterlyStart: '2026-Q1',
    quarterlyEnd: '2026-Q1',
  });

  assert.equal(plan.source, 'fmp-harvest');
  assert.equal(plan.dryRun, true);
  assert.equal(plan.archiveRoot, DEFAULT_ARCHIVE_RELATIVE_ROOT);
  assert.equal(plan.stages.includes('audit'), true);
  assert.ok(plan.workUnits.some(unit => unit.stage === 'current-bulk' && unit.endpoint === 'profile-bulk'));
  assert.ok(plan.workUnits.some(unit => unit.stage === 'deep-backfill' && unit.symbol === 'SPY'));
  assert.equal(plan.workUnits.some(unit => unit.stage === 'deep-backfill' && unit.symbol === 'XYZ'), false);
  assert.equal(JSON.stringify(plan).includes('apikey'), false);
});

runTest('redacts API key style query parameters from URLs', () => {
  const url = redactUrl('https://financialmodelingprep.com/stable/profile?symbol=AAPL&apikey=secret&token=also-secret&foo=bar');
  assert.equal(url.includes('secret'), false);
  assert.match(url, /apikey=REDACTED/);
  assert.match(url, /token=REDACTED/);
  assert.match(url, /foo=bar/);
});

runTest('resume selection skips committed units only when resume is enabled', () => {
  const units = [
    { workId: 'a', endpoint: 'stock-list' },
    { workId: 'b', endpoint: 'etf-list' },
  ];
  const state = { committed: { a: { status: 'committed' } } };

  assert.deepEqual(selectPendingWorkUnits(units, state, { resume: true }).map(unit => unit.workId), ['b']);
  assert.deepEqual(selectPendingWorkUnits(units, state, { resume: false }).map(unit => unit.workId), ['a', 'b']);
});

runTest('classifies retryable, entitlement, and terminal failures', () => {
  assert.equal(classifyFailureStatus({ httpStatus: 429 }), 'failed_retryable');
  assert.equal(classifyFailureStatus({ httpStatus: 503 }), 'failed_retryable');
  assert.equal(classifyFailureStatus({ httpStatus: 403 }), 'failed_terminal');
  assert.equal(classifyFailureStatus({ errorCode: 'checksum_drift' }), 'quarantined');
});

runTest('validates raw payload shape and flags suspicious empties', () => {
  assert.equal(validateRawPayload('[{"symbol":"AAPL"}]', { required: true }).ok, true);
  assert.equal(validateRawPayload('[]', { required: true }).status, 'empty_unexpected');
  assert.equal(validateRawPayload('[]', { required: false }).status, 'empty_allowed');
  assert.equal(validateRawPayload('<html>nope</html>', { required: true }).status, 'schema_drift');
});

runTest('writes raw archive files with request, file, and checksum manifests', async () => {
  cleanScratch(SCRATCH_WRITE);
  const result = await writeRawArchiveFile({
    archiveRoot: SCRATCH_WRITE,
    workUnit: {
      workId: 'test_profile_AAPL',
      stage: 'current-bulk',
      endpoint: 'profile',
      symbol: 'AAPL',
      params: { symbol: 'AAPL' },
      required: true,
    },
    rawText: '[{"symbol":"AAPL"}]',
    request: {
      redactedUrl: 'https://financialmodelingprep.com/stable/profile?symbol=AAPL&apikey=REDACTED',
      httpStatus: 200,
      durationMs: 4,
      attempt: 1,
    },
  });

  assert.equal(result.validationStatus, 'ok');
  assert.ok(existsSync(result.outputPath));
  const requestLog = await readFile(join(SCRATCH_WRITE, 'manifests', 'request_log.jsonl'), 'utf8');
  const fileManifest = await readFile(join(SCRATCH_WRITE, 'manifests', 'file_manifest.jsonl'), 'utf8');
  const checksumManifest = await readFile(join(SCRATCH_WRITE, 'manifests', 'checksum_manifest.jsonl'), 'utf8');
  assert.match(requestLog, /test_profile_AAPL/);
  assert.match(fileManifest, /sha256/);
  assert.match(checksumManifest, /current-bulk/);
  assert.equal(requestLog.includes('secret'), false);
  cleanScratch(SCRATCH_WRITE);
});

runTest('quarantines checksum drift without overwriting a final raw file', async () => {
  cleanScratch(SCRATCH_DRIFT);
  const workUnit = {
    workId: 'test_profile_AAPL',
    stage: 'current-bulk',
    endpoint: 'profile',
    symbol: 'AAPL',
    params: { symbol: 'AAPL' },
    required: true,
  };
  const first = await writeRawArchiveFile({
    archiveRoot: SCRATCH_DRIFT,
    workUnit,
    rawText: '[{"symbol":"AAPL","price":1}]',
    request: { redactedUrl: 'https://financialmodelingprep.com/stable/profile?symbol=AAPL&apikey=REDACTED', httpStatus: 200 },
  });
  const drift = await writeRawArchiveFile({
    archiveRoot: SCRATCH_DRIFT,
    workUnit,
    rawText: '[{"symbol":"AAPL","price":2}]',
    request: { redactedUrl: 'https://financialmodelingprep.com/stable/profile?symbol=AAPL&apikey=REDACTED', httpStatus: 200 },
  });

  assert.equal(drift.validationStatus, 'checksum_drift');
  assert.equal(await readFile(first.outputPath, 'utf8'), '[{"symbol":"AAPL","price":1}]');
  assert.ok(existsSync(drift.quarantinePath));
  const failureQueue = await readFile(join(SCRATCH_DRIFT, 'manifests', 'failure_queue.jsonl'), 'utf8');
  assert.match(failureQueue, /checksum_drift/);
  assert.equal(auditArchive({ archiveRoot: SCRATCH_DRIFT, dryRun: true }).acceptanceStatus, 'blocked');
  cleanScratch(SCRATCH_DRIFT);
});

runTest('audit blocks empty archives and checksum-manifest disagreement', async () => {
  cleanScratch(SCRATCH_AUDIT);
  mkdirSync(SCRATCH_AUDIT, { recursive: true });
  const emptyAudit = auditArchive({ archiveRoot: SCRATCH_AUDIT, dryRun: true });
  assert.equal(emptyAudit.acceptanceStatus, 'blocked');

  await writeRawArchiveFile({
    archiveRoot: SCRATCH_AUDIT,
    workUnit: {
      workId: 'test_profile_MSFT',
      stage: 'current-bulk',
      endpoint: 'profile',
      symbol: 'MSFT',
      params: { symbol: 'MSFT' },
      required: true,
    },
    rawText: '[{"symbol":"MSFT"}]',
    request: {
      redactedUrl: 'https://financialmodelingprep.com/stable/profile?symbol=MSFT&apikey=REDACTED',
      httpStatus: 200,
      durationMs: 4,
      attempt: 1,
    },
  });
  writeFileSync(join(SCRATCH_AUDIT, 'manifests', 'checksum_manifest.jsonl'), '', 'utf8');
  const mismatchAudit = auditArchive({ archiveRoot: SCRATCH_AUDIT, dryRun: true });
  assert.equal(mismatchAudit.acceptanceStatus, 'blocked');
  assert.equal(mismatchAudit.totals.checksumManifestDisagreements > 0, true);
  cleanScratch(SCRATCH_AUDIT);
});
