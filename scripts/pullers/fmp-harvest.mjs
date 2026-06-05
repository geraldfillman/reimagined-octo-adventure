import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';

import { getApiKey, getBaseUrl, resolveEnginePath } from '../lib/config.mjs';
import { fetchWithRetry, mapConcurrent, sleep } from '../lib/fetcher.mjs';
import { loadThesisWatchlists, normalizeSymbol } from '../lib/thesis-watchlists.mjs';

export const HARVEST_ID = 'fmp_cancel_2026-05-30';
export const DEFAULT_ARCHIVE_RELATIVE_ROOT = '99_System/data_archives/fmp_cancel_2026-05-30';
export const STAGE_SEQUENCE = Object.freeze([
  'foundation',
  'current-bulk',
  'statements-bulk',
  'prices-bulk',
  'deep-backfill',
  'ownership',
  'final-refresh',
  'audit',
]);

const DEFAULT_FROM = '2020-06-01';
const DEFAULT_TO = '2026-06-01';
const DEFAULT_ANNUAL_START_YEAR = 2010;
const DEFAULT_ANNUAL_END_YEAR = 2025;
const DEFAULT_QUARTERLY_START = '2020-Q1';
const DEFAULT_QUARTERLY_END = '2026-Q1';
const DEFAULT_PROFILE_PARTS = 20;
const DEFAULT_ETF_HOLDER_PARTS = 20;
const DEFAULT_CIK_PAGES = 50;
const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_CONCURRENCY = 2;
const DEFAULT_BULK_DELAY_MS = 10_000;
const DEFAULT_BULK_ENDPOINTS = new Set([
  'profile-bulk',
  'key-metrics-ttm-bulk',
  'ratios-ttm-bulk',
  'scores-bulk',
  'rating-bulk',
  'price-target-summary-bulk',
  'upgrades-downgrades-consensus-bulk',
  'peers-bulk',
  'income-statement-bulk',
  'balance-sheet-statement-bulk',
  'cash-flow-statement-bulk',
  'income-statement-growth-bulk',
  'balance-sheet-statement-growth-bulk',
  'cash-flow-statement-growth-bulk',
  'eod-bulk',
  'etf-holder-bulk',
]);

export async function pull(flags = {}) {
  const archiveRoot = resolveArchiveRoot(flags.out);
  const stage = flags.stage || (flags['audit-only'] ? 'audit' : 'all');
  const stages = resolveStageSequence(stage);

  if (flags['audit-only'] || (stages.length === 1 && stages[0] === 'audit')) {
    const audit = auditArchive({ archiveRoot, flags, dryRun: Boolean(flags['dry-run']) });
    if (flags.json) console.log(JSON.stringify(audit, null, 2));
    else printAuditSummary(audit);
    return audit;
  }

  const universe = flags.universe
    ? parseUniverseFlag(flags.universe)
    : await buildTieredUniverse({ includeBaskets: flags['include-baskets'] !== false });
  const plan = buildHarvestPlan({ ...flags, archiveRoot: flags.out || DEFAULT_ARCHIVE_RELATIVE_ROOT, universe });

  if (flags['dry-run']) {
    if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else printDryRunPlan(plan);
    return plan;
  }

  const result = await executeHarvestPlan(plan, { archiveRoot, flags });
  if (flags.json) console.log(JSON.stringify(summarizeExecutionResult(result), null, 2));
  return result;
}

export function shouldWriteArtifacts(flags = {}) {
  return !Boolean(flags['dry-run']);
}

export function resolveStageSequence(stage = 'all') {
  const requested = String(stage || 'all')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  const stages = requested.includes('all') ? [...STAGE_SEQUENCE] : requested;
  const invalid = stages.filter(item => !STAGE_SEQUENCE.includes(item));
  if (invalid.length) {
    throw new Error(`Invalid FMP harvest stage "${invalid[0]}". Valid: all, ${STAGE_SEQUENCE.join(', ')}`);
  }
  return [...new Set(stages)];
}

export function buildEndpointCatalog(options = {}) {
  const from = normalizeDate(options.from || DEFAULT_FROM);
  const to = normalizeDate(options.to || DEFAULT_TO);
  const annualStartYear = parseIntFlag(options.annualStartYear ?? options['annual-start-year'], DEFAULT_ANNUAL_START_YEAR);
  const annualEndYear = parseIntFlag(options.annualEndYear ?? options['annual-end-year'], DEFAULT_ANNUAL_END_YEAR);
  const quarterlyStart = String(options.quarterlyStart || options['quarterly-start'] || DEFAULT_QUARTERLY_START).toUpperCase();
  const quarterlyEnd = String(options.quarterlyEnd || options['quarterly-end'] || DEFAULT_QUARTERLY_END).toUpperCase();
  const profileParts = parseIntFlag(options.profileParts ?? options['profile-parts'], DEFAULT_PROFILE_PARTS);
  const etfHolderParts = parseIntFlag(options.etfHolderParts ?? options['etf-holder-parts'], DEFAULT_ETF_HOLDER_PARTS);
  const cikPages = parseIntFlag(options.cikPages ?? options['cik-pages'], DEFAULT_CIK_PAGES);
  const units = [];

  for (const endpoint of [
    'stock-list',
    'actively-trading-list',
    'etf-list',
    'symbol-change',
    'delisted-companies',
    'available-exchanges',
    'available-sectors',
    'available-industries',
    'available-countries',
    'sp500-constituent',
    'nasdaq-constituent',
    'dowjones-constituent',
    'historical-sp500-constituent',
  ]) {
    units.push(makeUnit({ stage: 'foundation', endpoint, required: true, tier: 'foundation' }));
  }

  for (let page = 0; page < cikPages; page += 1) {
    units.push(makeUnit({
      stage: 'foundation',
      endpoint: 'cik-list',
      params: { page, limit: 1000 },
      required: page === 0,
      tier: 'foundation',
    }));
  }

  for (let part = 0; part < profileParts; part += 1) {
    units.push(makeUnit({
      stage: 'current-bulk',
      endpoint: 'profile-bulk',
      params: { part },
      required: part === 0,
      tier: 'T2',
      bulk: true,
    }));
  }

  for (const endpoint of [
    'key-metrics-ttm-bulk',
    'ratios-ttm-bulk',
    'scores-bulk',
    'rating-bulk',
    'price-target-summary-bulk',
    'upgrades-downgrades-consensus-bulk',
    'peers-bulk',
  ]) {
    units.push(makeUnit({ stage: 'current-bulk', endpoint, required: true, tier: 'T2', bulk: true }));
  }

  for (const year of numberRange(annualStartYear, annualEndYear)) {
    for (const endpoint of [
      'income-statement-bulk',
      'balance-sheet-statement-bulk',
      'cash-flow-statement-bulk',
      'income-statement-growth-bulk',
      'balance-sheet-statement-growth-bulk',
      'cash-flow-statement-growth-bulk',
    ]) {
      units.push(makeUnit({
        stage: 'statements-bulk',
        endpoint,
        params: { year, period: 'FY' },
        required: year >= annualEndYear - 2,
        tier: 'T2',
        bulk: true,
      }));
    }
  }

  for (const quarter of computeQuarterRange(quarterlyStart, quarterlyEnd)) {
    for (const endpoint of [
      'income-statement-bulk',
      'balance-sheet-statement-bulk',
      'cash-flow-statement-bulk',
      'income-statement-growth-bulk',
      'balance-sheet-statement-growth-bulk',
      'cash-flow-statement-growth-bulk',
    ]) {
      units.push(makeUnit({
        stage: 'statements-bulk',
        endpoint,
        params: { year: quarter.year, period: quarter.period },
        required: quarter.year >= 2025,
        tier: 'T2',
        bulk: true,
      }));
    }
  }

  for (const date of computeDateRangeDescending(from, to)) {
    units.push(makeUnit({
      stage: 'prices-bulk',
      endpoint: 'eod-bulk',
      params: { date },
      required: isWeekday(date),
      tier: 'T2',
      bulk: true,
    }));
  }

  for (let part = 0; part < etfHolderParts; part += 1) {
    units.push(makeUnit({
      stage: 'ownership',
      endpoint: 'etf-holder-bulk',
      params: { part },
      required: false,
      tier: 'T2',
      bulk: true,
    }));
  }

  for (const endpoint of ['senate-trading-latest', 'house-trading-latest']) {
    units.push(makeUnit({ stage: 'ownership', endpoint, required: false, tier: 'T1' }));
  }

  return units;
}

export function buildHarvestPlan(options = {}) {
  const stages = resolveStageSequence(options.stage || 'all');
  const tiers = parseTiers(options.tiers);
  const universe = normalizeUniverse(options.universe);
  const endpointCatalog = buildEndpointCatalog(options);
  const workUnits = endpointCatalog.filter(unit => stages.includes(unit.stage) && tiers.has(unit.tier || 'T2'));

  if (stages.includes('current-bulk')) {
    for (const chunk of chunkArray(symbolsForTiers(universe, ['T0', 'T1', 'T2']), DEFAULT_BATCH_SIZE)) {
      workUnits.push(makeUnit({
        stage: 'current-bulk',
        endpoint: 'batch-quote-short',
        params: { symbols: chunk.join(',') },
        symbols: chunk,
        required: chunk.some(symbol => universe.T0.includes(symbol) || universe.T1.includes(symbol)),
        tier: chunk.some(symbol => universe.T0.includes(symbol)) ? 'T0' : 'T1',
      }));
    }
  }

  if (stages.includes('deep-backfill')) {
    for (const symbol of symbolsForTiers(universe, resolveDeepBackfillTiers(options))) {
      const tier = resolveSymbolTier(symbol, universe);
      for (const endpoint of perSymbolBackfillEndpoints(symbol)) {
        workUnits.push(makeUnit({ ...endpoint, tier, required: tier === 'T0' || tier === 'T1' }));
      }
    }
  }

  if (stages.includes('ownership')) {
    for (const symbol of symbolsForTiers(universe, ['T0', 'T1'])) {
      const tier = resolveSymbolTier(symbol, universe);
      for (const endpoint of perSymbolOwnershipEndpoints(symbol)) {
        workUnits.push(makeUnit({ ...endpoint, tier, required: false }));
      }
    }
  }

  if (stages.includes('final-refresh')) {
    for (const chunk of chunkArray(symbolsForTiers(universe, ['T0', 'T1']), DEFAULT_BATCH_SIZE)) {
      workUnits.push(makeUnit({
        stage: 'final-refresh',
        endpoint: 'batch-quote-short',
        params: { symbols: chunk.join(',') },
        symbols: chunk,
        required: true,
        tier: chunk.some(symbol => universe.T0.includes(symbol)) ? 'T0' : 'T1',
      }));
    }
    workUnits.push(makeUnit({
      stage: 'final-refresh',
      endpoint: 'earnings-calendar',
      params: {
        from: normalizeDate(options.calendarFrom || options['calendar-from'] || '2026-05-30'),
        to: normalizeDate(options.calendarTo || options['calendar-to'] || '2026-08-31'),
      },
      required: false,
      tier: 'T1',
    }));
  }

  if (stages.includes('audit')) {
    workUnits.push({
      workId: 'audit_archive_integrity',
      stage: 'audit',
      endpoint: 'local-audit',
      params: {},
      required: true,
      tier: 'T0',
      mode: 'local',
    });
  }

  const dedupedWorkUnits = dedupeWorkUnits(workUnits).filter(unit => tiers.has(unit.tier || 'T2') || unit.stage === 'audit');

  return {
    source: 'fmp-harvest',
    harvestId: HARVEST_ID,
    dryRun: Boolean(options.dryRun || options['dry-run']),
    scope: String(options.scope || 'hybrid'),
    archiveRoot: normalizeArchiveRootForPlan(options.archiveRoot || options.out || DEFAULT_ARCHIVE_RELATIVE_ROOT),
    stages,
    tiers: [...tiers],
    universe,
    workUnits: dedupedWorkUnits,
    planned: dedupedWorkUnits.map(unit => workUnitCommand(unit)),
    wrote: [],
    filePaths: [],
  };
}

export function computeDateRangeDescending(from, to) {
  const start = parseDateStrict(from);
  const end = parseDateStrict(to);
  if (start.getTime() > end.getTime()) {
    throw new Error(`Invalid date range: from ${from} is after to ${to}`);
  }
  const dates = [];
  for (let d = end; d.getTime() >= start.getTime(); d.setUTCDate(d.getUTCDate() - 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function redactUrl(url) {
  return String(url || '').replace(/([?&])(apikey|api_key|apiKey|key|token|access_token|secret)=([^&]*)/gi, '$1$2=REDACTED');
}

function redactSensitiveText(value) {
  return redactUrl(value)
    .replace(/(--(?:apikey|api-key|api_key|key|token|access-token|access_token|secret)\s+)([^\s]+)/gi, '$1REDACTED')
    .replace(/((?:apikey|api_key|apiKey|key|token|access_token|secret)["']?\s*[:=]\s*["']?)([^"',\s}]+)/gi, '$1REDACTED');
}

export function classifyFailureStatus({ httpStatus, errorCode } = {}) {
  if (errorCode === 'checksum_drift' || errorCode === 'manifest_mismatch') return 'quarantined';
  if (['timeout', 'network_reset', 'fetch_error'].includes(errorCode)) return 'failed_retryable';
  const status = Number(httpStatus);
  if ([408, 429].includes(status) || status >= 500) return 'failed_retryable';
  if ([400, 401, 402, 403, 404].includes(status)) return 'failed_terminal';
  return 'failed_terminal';
}

function isBlockingFailure(row = {}) {
  const status = String(row.status || '');
  const errorCode = String(row.error_code || '');
  const httpStatus = Number(row.http_status || 0);
  if (status === 'quarantined') return true;
  if (['checksum_drift', 'manifest_mismatch', 'schema_drift', 'truncation_suspect', 'empty_unexpected'].includes(errorCode)) return true;
  if ([401, 403].includes(httpStatus) && row.required !== false) return true;
  return status === 'failed_terminal' && row.required === true;
}

export function validateRawPayload(rawText, { required = true, expectedFormat = 'json' } = {}) {
  const text = String(rawText ?? '');
  if (text.length === 0) {
    return { ok: !required, status: required ? 'empty_unexpected' : 'empty_allowed', recordCount: 0, warnings: ['zero-byte response'] };
  }
  if (/^\s*</.test(text)) {
    return { ok: false, status: 'schema_drift', recordCount: 0, warnings: ['response looks like HTML/XML, not archive data'] };
  }
  if (expectedFormat === 'csv' || looksLikeCsv(text)) {
    return validateCsvPayload(text, { required });
  }
  try {
    const parsed = JSON.parse(text);
    const apiError = detectApiError(parsed);
    if (apiError) {
      return { ok: false, status: 'schema_drift', recordCount: 0, warnings: [apiError] };
    }
    const recordCount = countJsonRecords(parsed);
    if (recordCount === 0) {
      return { ok: !required, status: required ? 'empty_unexpected' : 'empty_allowed', recordCount, warnings: [] };
    }
    return {
      ok: true,
      status: 'ok',
      recordCount,
      minDate: findDateBoundary(parsed, 'min'),
      maxDate: findDateBoundary(parsed, 'max'),
      warnings: [],
    };
  } catch (error) {
    return { ok: false, status: 'schema_drift', recordCount: 0, warnings: [error.message] };
  }
}

export async function writeRawArchiveFile({
  archiveRoot,
  workUnit,
  rawText,
  request = {},
}) {
  const root = archiveRoot || resolveArchiveRoot();
  const safeStage = sanitizePathSegment(workUnit.stage || 'unknown-stage');
  const safeEndpoint = sanitizePathSegment(workUnit.endpoint || 'unknown-endpoint');
  const fileStem = sanitizePathSegment(workUnit.workId || `${safeStage}_${safeEndpoint}`);
  const format = looksLikeCsv(rawText) ? 'csv' : 'json';
  const rawDir = join(root, 'raw', safeStage, safeEndpoint);
  const outputPath = join(rawDir, `${fileStem}.${format}`);
  const partPath = `${outputPath}.part`;
  const manifestsDir = join(root, 'manifests');
  const validation = validateRawPayload(rawText, {
    required: Boolean(workUnit.required),
    expectedFormat: workUnit.expectedFormat || format,
  });
  const sha256 = hashText(rawText);
  const bytes = Buffer.byteLength(rawText, 'utf8');
  const relativePath = relative(root, outputPath).replace(/\\/g, '/');
  const paramsHash = hashText(JSON.stringify(workUnit.params || {}));
  const now = new Date().toISOString();

  mkdirSync(rawDir, { recursive: true });
  mkdirSync(manifestsDir, { recursive: true });

  const requestRow = {
    request_id: `${workUnit.workId || fileStem}:${request.attempt || 1}`,
    work_id: workUnit.workId || fileStem,
    timestamp: now,
    endpoint: workUnit.endpoint,
    redacted_url: redactUrl(request.redactedUrl || request.url || ''),
    params_hash: paramsHash,
    attempt: Number(request.attempt || 1),
    http_status: Number(request.httpStatus || 0),
    duration_ms: Number(request.durationMs || 0),
    bytes_received: bytes,
    record_count: validation.recordCount || 0,
    retry_after_ms: Number(request.retryAfterMs || 0),
    error_code: validation.ok ? '' : validation.status,
    output_file: relativePath,
    sha256,
  };
  const fileRow = {
    file_id: `${workUnit.workId || fileStem}:${sha256.slice(0, 12)}`,
    work_id: workUnit.workId || fileStem,
    relative_path: relativePath,
    format,
    endpoint: workUnit.endpoint,
    symbol: workUnit.symbol || '',
    params_hash: paramsHash,
    bytes,
    sha256,
    line_count: format === 'csv' ? countLines(rawText) : validation.recordCount || 0,
    record_count: validation.recordCount || 0,
    min_date: validation.minDate || '',
    max_date: validation.maxDate || '',
    schema_fingerprint: schemaFingerprint(rawText, format),
    validation_status: validation.status,
    warnings: validation.warnings || [],
  };
  const checksumRow = {
    relative_path: relativePath,
    sha256,
    bytes,
    validated_at: now,
    manifest_file_id: fileRow.file_id,
    stage: workUnit.stage,
  };
  const requestLogPath = join(manifestsDir, 'request_log.jsonl');
  const fileManifestPath = join(manifestsDir, 'file_manifest.jsonl');
  const checksumManifestPath = join(manifestsDir, 'checksum_manifest.jsonl');

  if (existsSync(outputPath)) {
    const existingSha256 = hashText(readFileSync(outputPath, 'utf8'));
    if (existingSha256 !== sha256) {
      const quarantineDir = join(root, 'quarantine', safeStage, safeEndpoint);
      const quarantinePath = join(quarantineDir, `${fileStem}_${sha256.slice(0, 12)}.${format}`);
      const quarantineRelativePath = relative(root, quarantinePath).replace(/\\/g, '/');
      mkdirSync(quarantineDir, { recursive: true });
      writeFileSync(`${quarantinePath}.part`, rawText, 'utf8');
      renameSync(`${quarantinePath}.part`, quarantinePath);
      appendJsonLine(requestLogPath, {
        ...requestRow,
        error_code: 'checksum_drift',
        existing_sha256: existingSha256,
        quarantine_file: quarantineRelativePath,
      });
      appendJsonLine(join(manifestsDir, 'failure_queue.jsonl'), {
        work_id: workUnit.workId || fileStem,
        stage: workUnit.stage,
        endpoint: workUnit.endpoint,
        symbol: workUnit.symbol || '',
        required: Boolean(workUnit.required),
        status: classifyFailureStatus({ errorCode: 'checksum_drift' }),
        http_status: Number(request.httpStatus || 0),
        error_code: 'checksum_drift',
        message: 'Existing raw file checksum differs; new payload quarantined without overwriting final archive file.',
        output_file: relativePath,
        quarantine_file: quarantineRelativePath,
        timestamp: now,
      });
      return {
        outputPath,
        quarantinePath,
        relativePath,
        sha256,
        bytes,
        recordCount: validation.recordCount || 0,
        validationStatus: 'checksum_drift',
      };
    }

    appendJsonLine(requestLogPath, { ...requestRow, idempotent_replay: true });
    appendManifestRowsIfMissing({ fileManifestPath, checksumManifestPath, fileRow, checksumRow });
    return {
      outputPath,
      relativePath,
      sha256,
      bytes,
      recordCount: validation.recordCount || 0,
      validationStatus: validation.status,
      idempotentReplay: true,
    };
  }

  writeFileSync(partPath, rawText, 'utf8');
  renameSync(partPath, outputPath);
  appendJsonLine(requestLogPath, requestRow);
  appendJsonLine(fileManifestPath, fileRow);
  appendJsonLine(checksumManifestPath, checksumRow);

  return {
    outputPath,
    relativePath,
    sha256,
    bytes,
    recordCount: validation.recordCount || 0,
    validationStatus: validation.status,
  };
}

async function executeHarvestPlan(plan, { archiveRoot, flags }) {
  mkdirSync(archiveRoot, { recursive: true });
  mkdirSync(join(archiveRoot, 'state'), { recursive: true });
  mkdirSync(join(archiveRoot, 'manifests'), { recursive: true });
  writeRunManifest(archiveRoot, plan, 'running');
  writeUniverseManifest(archiveRoot, plan.universe);

  const apiKey = getApiKey('fmp');
  const stableBaseUrl = getBaseUrl('fmp').replace(/\/api\/v\d+$/, '/stable');
  const bulkDelayMs = parseIntFlag(flags['bulk-delay-ms'], DEFAULT_BULK_DELAY_MS);
  const concurrency = parseIntFlag(flags.concurrency, DEFAULT_CONCURRENCY);
  const maxBytes = flags['max-bytes-gb'] ? Number(flags['max-bytes-gb']) * 1024 * 1024 * 1024 : Infinity;
  const state = readCheckpoint(archiveRoot);
  const results = [];
  let bytesWritten = sumCommittedBytes(archiveRoot);

  const pending = selectPendingWorkUnits(plan.workUnits.filter(unit => unit.mode !== 'local'), state, {
    resume: Boolean(flags.resume),
  });
  const localUnits = plan.workUnits.filter(unit => unit.mode === 'local');

  await mapConcurrent(pending, concurrency, async unit => {
    if (bytesWritten >= maxBytes) {
      appendJsonLine(join(archiveRoot, 'manifests', 'failure_queue.jsonl'), {
        work_id: unit.workId,
        endpoint: unit.endpoint,
        status: 'failed_terminal',
        error_code: 'max_bytes_reached',
      });
      return;
    }
    if (DEFAULT_BULK_ENDPOINTS.has(unit.endpoint)) await sleep(bulkDelayMs);
    const result = await fetchAndArchiveWorkUnit({ unit, archiveRoot, stableBaseUrl, apiKey });
    results.push(result);
    if (result.bytes) bytesWritten += result.bytes;
    markCheckpoint(archiveRoot, state, unit, result);
  });

  let audit = null;
  if (localUnits.length || plan.stages.includes('audit')) {
    audit = auditArchive({ archiveRoot, flags, dryRun: false });
  }

  writeRunManifest(archiveRoot, plan, 'complete', { results, audit });
  return {
    source: 'fmp-harvest',
    harvestId: HARVEST_ID,
    archiveRoot,
    filePaths: results.map(result => result.outputPath).filter(Boolean),
    wrote: results.map(result => result.outputPath).filter(Boolean),
    results,
    audit,
  };
}

async function fetchAndArchiveWorkUnit({ unit, archiveRoot, stableBaseUrl, apiKey }) {
  const url = buildFmpUrl(stableBaseUrl, unit.endpoint, unit.params || {}, apiKey);
  const start = Date.now();
  try {
    const response = await fetchWithRetry(url, { retries: 3, timeout: 60_000 });
    const rawText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    if (!response.ok) {
      const status = classifyFailureStatus({ httpStatus: response.status });
      appendFailure(archiveRoot, unit, {
        status,
        httpStatus: response.status,
        errorCode: status,
        message: redactSensitiveText(rawText.slice(0, 300)),
      });
      return { workId: unit.workId, ok: false, status, httpStatus: response.status };
    }
    const archived = await writeRawArchiveFile({
      archiveRoot,
      workUnit: unit,
      rawText,
      request: {
        redactedUrl: redactUrl(url),
        httpStatus: response.status,
        durationMs: Date.now() - start,
        attempt: 1,
      },
    });
    if (archived.validationStatus !== 'ok' && archived.validationStatus !== 'empty_allowed' && archived.validationStatus !== 'checksum_drift') {
      const status = classifyFailureStatus({ errorCode: archived.validationStatus, httpStatus: response.status });
      appendFailure(archiveRoot, unit, {
        status,
        httpStatus: response.status,
        errorCode: archived.validationStatus,
        message: `Validation status: ${archived.validationStatus}`,
      });
    }
    return { workId: unit.workId, ok: archived.validationStatus === 'ok' || archived.validationStatus === 'empty_allowed', ...archived };
  } catch (error) {
    const status = classifyFailureStatus({ errorCode: 'fetch_error' });
    appendFailure(archiveRoot, unit, {
      status,
      httpStatus: 0,
      errorCode: 'fetch_error',
      message: redactSensitiveText(error.message),
    });
    return { workId: unit.workId, ok: false, status, error: error.message };
  }
}

export function auditArchive({ archiveRoot, flags = {}, dryRun = false }) {
  const root = archiveRoot || resolveArchiveRoot(flags.out);
  const fileManifestPath = join(root, 'manifests', 'file_manifest.jsonl');
  const requestLogPath = join(root, 'manifests', 'request_log.jsonl');
  const failuresPath = join(root, 'manifests', 'failure_queue.jsonl');
  const checksumManifestPath = join(root, 'manifests', 'checksum_manifest.jsonl');
  const fileRows = readJsonl(fileManifestPath);
  const requestRows = readJsonl(requestLogPath);
  const failureRows = readJsonl(failuresPath);
  const checksumRows = readJsonl(checksumManifestPath);
  const checksumFailures = [];
  const orphanRows = [];
  const checksumManifestDisagreements = [];
  const checksumKeys = new Set(checksumRows.map(row => `${row.relative_path}:${row.sha256}`));
  const blockingFailures = failureRows.filter(isBlockingFailure);

  for (const row of fileRows) {
    const path = join(root, row.relative_path || '');
    if (!existsSync(path)) {
      orphanRows.push({ relative_path: row.relative_path, reason: 'file missing' });
      continue;
    }
    const actual = hashText(readFileSync(path, 'utf8'));
    if (actual !== row.sha256) {
      checksumFailures.push({ relative_path: row.relative_path, expected: row.sha256, actual });
    }
    if (!checksumKeys.has(`${row.relative_path}:${row.sha256}`)) {
      checksumManifestDisagreements.push({ relative_path: row.relative_path, sha256: row.sha256 });
    }
  }

  const totals = {
    files: fileRows.length,
    requests: requestRows.length,
    failures: failureRows.length,
    checksumFailures: checksumFailures.length,
    orphanRows: orphanRows.length,
    checksumManifestRows: checksumRows.length,
    checksumManifestDisagreements: checksumManifestDisagreements.length,
    blockingFailures: blockingFailures.length,
    bytes: fileRows.reduce((sum, row) => sum + Number(row.bytes || 0), 0),
  };
  const isEmptyArchive = fileRows.length === 0 && requestRows.length === 0;
  const acceptanceStatus = isEmptyArchive || checksumFailures.length || orphanRows.length || checksumManifestDisagreements.length || blockingFailures.length
    ? 'blocked'
    : failureRows.length ? 'accepted_with_warnings' : 'accepted';
  const audit = {
    source: 'fmp-harvest',
    harvestId: HARVEST_ID,
    archiveRoot: root,
    acceptanceStatus,
    totals,
    checksumFailures,
    orphanRows,
    checksumManifestDisagreements,
    blockingFailures,
    failureRows,
  };

  if (!dryRun) {
    const auditDir = join(root, 'audit');
    mkdirSync(auditDir, { recursive: true });
    const auditPath = join(auditDir, 'fmp-harvest-audit.md');
    writeFileSync(auditPath, buildAuditMarkdown(audit), 'utf8');
    audit.filePath = auditPath;
  }

  return audit;
}

async function buildTieredUniverse({ includeBaskets = true } = {}) {
  const t0 = new Set(['SPY', 'QQQ', 'IWM', 'DIA', 'TLT', 'IEF', 'HYG', 'LQD', 'GLD', 'SLV', 'USO', 'UUP']);
  const t1 = new Set();
  const t2 = new Set();

  try {
    const watchlists = await loadThesisWatchlists({ includeBaskets });
    for (const watchlist of watchlists) {
      for (const symbol of watchlist.symbols || []) {
        const normalized = normalizeSymbol(symbol);
        if (normalized) t1.add(normalized);
      }
    }
  } catch {
    // Local notes can be mid-migration; fall back to cache-derived universe.
  }

  for (const symbol of listCachedFmpSymbols()) {
    t2.add(symbol);
  }

  for (const symbol of t0) {
    t1.delete(symbol);
    t2.delete(symbol);
  }
  for (const symbol of t1) {
    t2.delete(symbol);
  }

  return {
    T0: [...t0].sort(),
    T1: [...t1].sort(),
    T2: [...t2].sort(),
    T3: [],
  };
}

function listCachedFmpSymbols() {
  const cacheRoot = resolveEnginePath('scripts', '.cache');
  const dirs = ['fmp-profile', 'fmp-ratios-ttm', 'fmp-key-metrics-ttm', 'fmp-price-target-summary'];
  const symbols = new Set();
  for (const dir of dirs) {
    const path = join(cacheRoot, dir);
    if (!existsSync(path)) continue;
    for (const file of readdirSync(path)) {
      if (!file.endsWith('.json')) continue;
      const symbol = normalizeSymbol(file.replace(/\.json$/i, ''));
      if (symbol) symbols.add(symbol);
    }
  }
  return [...symbols].sort();
}

function perSymbolBackfillEndpoints(symbol) {
  return [
    ['income-statement', { period: 'annual', limit: 120 }],
    ['balance-sheet-statement', { period: 'annual', limit: 120 }],
    ['cash-flow-statement', { period: 'annual', limit: 120 }],
    ['income-statement', { period: 'quarter', limit: 120 }],
    ['balance-sheet-statement', { period: 'quarter', limit: 120 }],
    ['cash-flow-statement', { period: 'quarter', limit: 120 }],
    ['ratios', { period: 'annual', limit: 120 }],
    ['key-metrics', { period: 'annual', limit: 120 }],
    ['enterprise-values', { period: 'annual', limit: 120 }],
    ['financial-growth', { period: 'annual', limit: 120 }],
    ['analyst-estimates', { limit: 120 }],
    ['analyst-stock-recommendations', { limit: 120 }],
    ['short-interest', { limit: 120 }],
    ['insider-trading/search', { limit: 500 }],
    ['insider-trading/statistics', {}],
    ['earnings-surprises', { limit: 120 }],
    ['dividends', {}],
    ['splits', {}],
    ['historical-market-capitalization', { limit: 5000 }],
    ['historical-price-eod/full', {}],
    ['historical-price-eod/dividend-adjusted', {}],
    ['historical-price-eod/non-split-adjusted', {}],
  ].map(([endpoint, params]) => ({
    stage: 'deep-backfill',
    endpoint,
    symbol,
    params: { symbol, ...params },
  }));
}

function perSymbolOwnershipEndpoints(symbol) {
  return [
    ['senate-trading', { symbol }],
    ['house-trading', { symbol }],
    ['institutional-ownership/symbol-ownership', { symbol }],
    ['institutional-ownership/institutional-holders/symbol-ownership-percent', { symbol }],
  ].map(([endpoint, params]) => ({
    stage: 'ownership',
    endpoint,
    symbol,
    params,
  }));
}

function makeUnit({ stage, endpoint, params = {}, symbol = '', symbols = [], required = false, tier = 'T2', bulk = false, expectedFormat = 'json', mode = 'remote' }) {
  const normalizedSymbol = normalizeSymbol(symbol) || '';
  const normalizedSymbols = symbols.map(normalizeSymbol).filter(Boolean);
  const unit = {
    workId: buildWorkId({ stage, endpoint, params, symbol: normalizedSymbol, symbols: normalizedSymbols }),
    stage,
    endpoint,
    params,
    symbol: normalizedSymbol,
    symbols: normalizedSymbols,
    required: Boolean(required),
    tier,
    bulk: Boolean(bulk),
    expectedFormat,
    mode,
  };
  return unit;
}

function buildWorkId({ stage, endpoint, params = {}, symbol = '', symbols = [] }) {
  const paramText = Object.entries(params)
    .filter(([key]) => key !== 'apikey')
    .map(([key, value]) => `${key}-${String(value).slice(0, 40)}`)
    .join('_');
  const symbolText = symbol || (symbols.length ? symbols.slice(0, 4).join('_') : '');
  return sanitizePathSegment([stage, endpoint.replace(/\//g, '-'), symbolText, paramText].filter(Boolean).join('_'));
}

function dedupeWorkUnits(units) {
  const seen = new Set();
  const out = [];
  for (const unit of units) {
    if (seen.has(unit.workId)) continue;
    seen.add(unit.workId);
    out.push(unit);
  }
  return out;
}

function workUnitCommand(unit) {
  if (unit.mode === 'local') return `local:${unit.endpoint}`;
  const params = new URLSearchParams(unit.params || {});
  return `${unit.stage}:${unit.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
}

function buildFmpUrl(stableBaseUrl, endpoint, params, apiKey) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue;
    qs.set(key, String(value));
  }
  qs.set('apikey', apiKey);
  return `${stableBaseUrl}/${endpoint}?${qs.toString()}`;
}

function resolveArchiveRoot(out) {
  if (!out) return resolveEnginePath('99_System', 'data_archives', HARVEST_ID);
  const text = String(out);
  return /^[A-Za-z]:[\\/]/.test(text) ? text : resolveEnginePath(...text.split(/[\\/]+/));
}

function normalizeArchiveRootForPlan(value) {
  const text = String(value || DEFAULT_ARCHIVE_RELATIVE_ROOT).replace(/\\/g, '/');
  return text.includes(':') ? text : text.replace(/^\.?\//, '');
}

function parseUniverseFlag(value) {
  const symbols = parseSymbolCsv(value);
  return { T0: symbols, T1: [], T2: [], T3: [] };
}

function normalizeUniverse(universe = {}) {
  return {
    T0: parseSymbolList(universe.T0),
    T1: parseSymbolList(universe.T1),
    T2: parseSymbolList(universe.T2),
    T3: parseSymbolList(universe.T3),
  };
}

function parseSymbolList(value) {
  if (Array.isArray(value)) return [...new Set(value.map(normalizeSymbol).filter(Boolean))].sort();
  return parseSymbolCsv(value);
}

function parseSymbolCsv(value) {
  return [...new Set(String(value || '').split(',').map(normalizeSymbol).filter(Boolean))].sort();
}

function symbolsForTiers(universe, tiers) {
  const out = [];
  const seen = new Set();
  for (const tier of tiers) {
    for (const symbol of universe[tier] || []) {
      if (seen.has(symbol)) continue;
      seen.add(symbol);
      out.push(symbol);
    }
  }
  return out;
}

function resolveSymbolTier(symbol, universe) {
  for (const tier of ['T0', 'T1', 'T2', 'T3']) {
    if ((universe[tier] || []).includes(symbol)) return tier;
  }
  return 'T3';
}

function resolveDeepBackfillTiers(options = {}) {
  const explicit = options.deepTiers || options['deep-tiers'];
  if (explicit) return [...parseTiers(explicit)].filter(tier => /^T[0-3]$/.test(tier));
  const scope = String(options.scope || 'hybrid').toLowerCase();
  if (scope === 'bulk-only') return [];
  if (scope === 'all-symbols' || scope === 'all') return ['T0', 'T1', 'T2', 'T3'];
  return ['T0', 'T1'];
}

function parseTiers(value) {
  const raw = String(value || 'T0,T1,T2,T3').split(',').map(item => item.trim().toUpperCase()).filter(Boolean);
  const valid = new Set(['T0', 'T1', 'T2', 'T3', 'FOUNDATION']);
  const invalid = raw.filter(item => !valid.has(item));
  if (invalid.length) throw new Error(`Invalid FMP harvest tier "${invalid[0]}". Valid: T0,T1,T2,T3`);
  const tiers = new Set(raw);
  tiers.add('foundation');
  return tiers;
}

function computeQuarterRange(start, end) {
  const startQ = parseQuarter(start);
  const endQ = parseQuarter(end);
  const quarters = [];
  for (let year = startQ.year, quarter = startQ.quarter; year < endQ.year || (year === endQ.year && quarter <= endQ.quarter);) {
    quarters.push({ year, quarter, period: `Q${quarter}` });
    quarter += 1;
    if (quarter > 4) {
      quarter = 1;
      year += 1;
    }
  }
  return quarters;
}

function parseQuarter(value) {
  const match = String(value || '').toUpperCase().match(/^(\d{4})-?Q([1-4])$/);
  if (!match) throw new Error(`Invalid quarter "${value}". Use YYYY-Qn, e.g. 2026-Q1.`);
  return { year: Number(match[1]), quarter: Number(match[2]) };
}

function numberRange(start, end) {
  const out = [];
  for (let value = start; value <= end; value += 1) out.push(value);
  return out;
}

function parseIntFlag(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDate(value) {
  return parseDateStrict(value).toISOString().slice(0, 10);
}

function parseDateStrict(value) {
  const text = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error(`Invalid date "${value}". Use YYYY-MM-DD.`);
  const date = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date "${value}". Use YYYY-MM-DD.`);
  return date;
}

function isWeekday(date) {
  const day = parseDateStrict(date).getUTCDay();
  return day !== 0 && day !== 6;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function hashText(text) {
  return createHash('sha256').update(String(text ?? ''), 'utf8').digest('hex');
}

function appendJsonLine(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(value)}\n`, 'utf8');
}

function appendManifestRowsIfMissing({ fileManifestPath, checksumManifestPath, fileRow, checksumRow }) {
  const hasFileRow = readJsonl(fileManifestPath)
    .some(row => row.relative_path === fileRow.relative_path && row.sha256 === fileRow.sha256);
  const hasChecksumRow = readJsonl(checksumManifestPath)
    .some(row => row.relative_path === checksumRow.relative_path && row.sha256 === checksumRow.sha256);
  if (!hasFileRow) appendJsonLine(fileManifestPath, fileRow);
  if (!hasChecksumRow) appendJsonLine(checksumManifestPath, checksumRow);
}

function sanitizePathSegment(value) {
  return String(value || '')
    .replace(/[<>:"/\\|?*&=,\s]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 180) || 'item';
}

function looksLikeCsv(text) {
  const trimmed = String(text || '').trimStart();
  return !trimmed.startsWith('{') && !trimmed.startsWith('[') && trimmed.includes(',') && trimmed.includes('\n');
}

function validateCsvPayload(text, { required }) {
  const lines = String(text || '').split(/\r?\n/).filter(line => line.length > 0);
  if (lines.length <= 1) {
    return { ok: !required, status: required ? 'empty_unexpected' : 'empty_allowed', recordCount: 0, warnings: [] };
  }
  const headerCount = splitCsvLine(lines[0]).length;
  const broken = lines.slice(1).some(line => splitCsvLine(line).length !== headerCount);
  if (broken) return { ok: false, status: 'truncation_suspect', recordCount: lines.length - 1, warnings: ['CSV row column count mismatch'] };
  return { ok: true, status: 'ok', recordCount: lines.length - 1, warnings: [] };
}

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;
  for (const char of String(line)) {
    if (char === '"') {
      quoted = !quoted;
      current += char;
    } else if (char === ',' && !quoted) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function detectApiError(parsed) {
  if (!parsed || typeof parsed !== 'object') return '';
  const message = parsed['Error Message'] || parsed.error || parsed.message;
  if (!message) return '';
  return String(message);
}

function countJsonRecords(parsed) {
  if (Array.isArray(parsed)) return parsed.length;
  if (Array.isArray(parsed?.historical)) return parsed.historical.length;
  if (Array.isArray(parsed?.data)) return parsed.data.length;
  if (parsed && typeof parsed === 'object' && Object.keys(parsed).length) return 1;
  return 0;
}

function findDateBoundary(parsed, mode) {
  const values = [];
  collectDates(parsed, values);
  if (!values.length) return '';
  values.sort();
  return mode === 'min' ? values[0] : values.at(-1);
}

function collectDates(value, out) {
  if (Array.isArray(value)) {
    for (const item of value) collectDates(item, out);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const key of ['date', 'filingDate', 'publishedDate', 'calendarYear']) {
    const candidate = String(value[key] || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) out.push(candidate);
  }
  for (const item of Object.values(value)) {
    if (Array.isArray(item)) collectDates(item, out);
  }
}

function schemaFingerprint(rawText, format) {
  if (format === 'csv') {
    const header = String(rawText || '').split(/\r?\n/)[0] || '';
    return hashText(header).slice(0, 16);
  }
  try {
    const parsed = JSON.parse(rawText);
    const first = Array.isArray(parsed) ? parsed[0] : Array.isArray(parsed?.historical) ? parsed.historical[0] : parsed;
    if (!first || typeof first !== 'object') return '';
    return hashText(Object.keys(first).sort().join(',')).slice(0, 16);
  } catch {
    return '';
  }
}

function countLines(text) {
  return String(text || '').split(/\r?\n/).filter(Boolean).length;
}

function writeRunManifest(archiveRoot, plan, status, extra = {}) {
  const path = join(archiveRoot, 'manifests', 'run_manifest.json');
  mkdirSync(dirname(path), { recursive: true });
  const fileRows = readJsonl(join(archiveRoot, 'manifests', 'file_manifest.jsonl'));
  const manifest = {
    schema_version: 1,
    harvest_id: HARVEST_ID,
    source: 'Financial Modeling Prep',
    started_at: new Date().toISOString(),
    completed_at: status === 'complete' ? new Date().toISOString() : '',
    status,
    archive_root: archiveRoot,
    command_redacted: redactSensitiveText(process.argv.join(' ')),
    endpoint_catalog_version: 1,
    rate_limit_policy: 'FMP token bucket plus bulk-delay-ms',
    planned_units: plan.workUnits.length,
    completed_units: fileRows.length,
    failed_units: readJsonl(join(archiveRoot, 'manifests', 'failure_queue.jsonl')).length,
    bytes_written: fileRows.reduce((sum, row) => sum + Number(row.bytes || 0), 0),
    files_written: fileRows.length,
    acceptance_status: extra.audit?.acceptanceStatus || '',
  };
  writeFileSync(path, JSON.stringify(manifest, null, 2), 'utf8');
}

function writeUniverseManifest(archiveRoot, universe) {
  const path = join(archiveRoot, 'manifests', 'universe_manifest.jsonl');
  const rows = [];
  for (const [tier, symbols] of Object.entries(universe || {})) {
    for (const symbol of symbols || []) {
      rows.push({
        work_id: `universe_${tier}_${symbol}`,
        tier,
        symbol,
        instrument_type: '',
        exchange: '',
        cik: '',
        universe_source: tier === 'T0' ? 'market-anchor-defaults' : tier === 'T1' ? 'thesis-watchlists' : 'fmp-cache',
        required_endpoints: tier === 'T0' ? ['quotes', 'statements', 'prices'] : ['best-effort'],
        optional_endpoints: ['ownership', 'analyst', 'insider'],
        expected_windows: ['bulk-current', 'bulk-history'],
        skip_reason: '',
      });
    }
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, rows.map(row => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''), 'utf8');
}

function readCheckpoint(archiveRoot) {
  const path = join(archiveRoot, 'state', 'checkpoint.json');
  if (!existsSync(path)) return { committed: {} };
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    return { committed: parsed.committed || {} };
  } catch {
    return { committed: {} };
  }
}

export function selectPendingWorkUnits(units = [], state = {}, { resume = false } = {}) {
  if (!resume) return [...units];
  return units.filter(unit => !isCommitted(state, unit));
}

function isCommitted(state, unit) {
  return Boolean(state?.committed?.[unit.workId]);
}

function markCheckpoint(archiveRoot, state, unit, result) {
  if (result.ok) {
    state.committed[unit.workId] = {
      status: 'committed',
      outputPath: result.outputPath || '',
      sha256: result.sha256 || '',
      committedAt: new Date().toISOString(),
    };
  }
  const path = join(archiveRoot, 'state', 'checkpoint.json');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2), 'utf8');
}

function sumCommittedBytes(archiveRoot) {
  return readJsonl(join(archiveRoot, 'manifests', 'file_manifest.jsonl'))
    .reduce((sum, row) => sum + Number(row.bytes || 0), 0);
}

function appendFailure(archiveRoot, unit, failure) {
  appendJsonLine(join(archiveRoot, 'manifests', 'failure_queue.jsonl'), {
    work_id: unit.workId,
    stage: unit.stage,
    endpoint: unit.endpoint,
    symbol: unit.symbol || '',
    required: Boolean(unit.required),
    status: failure.status,
    http_status: failure.httpStatus,
    error_code: failure.errorCode,
    message: redactSensitiveText(failure.message),
    timestamp: new Date().toISOString(),
  });
}

function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function buildAuditMarkdown(audit) {
  const date = new Date().toISOString().slice(0, 10);
  return [
    '---',
    'title: "FMP Harvest Audit"',
    'source: "Financial Modeling Prep"',
    `date_pulled: ${date}`,
    'domain: system',
    'data_type: raw_archive_index',
    'frequency: one-time',
    `signal_status: ${audit.acceptanceStatus === 'blocked' ? 'alert' : audit.acceptanceStatus === 'accepted_with_warnings' ? 'watch' : 'clear'}`,
    'signals: []',
    'tags: [fmp, raw-archive, audit]',
    `harvest_id: ${audit.harvestId}`,
    `archive_root: "${audit.archiveRoot.replace(/\\/g, '/')}"`,
    `acceptance_status: ${audit.acceptanceStatus}`,
    '---',
    '',
    '# FMP Harvest Audit',
    '',
    `**Status:** ${audit.acceptanceStatus}`,
    '',
    '## Totals',
    '',
    `- Files: ${audit.totals.files}`,
    `- Requests: ${audit.totals.requests}`,
    `- Failures: ${audit.totals.failures}`,
    `- Bytes: ${audit.totals.bytes}`,
    `- Checksum failures: ${audit.totals.checksumFailures}`,
    `- Orphan manifest rows: ${audit.totals.orphanRows}`,
    `- Blocking failures: ${audit.totals.blockingFailures}`,
    '',
    '## Failure Queues',
    '',
    audit.failureRows.length
      ? audit.failureRows.slice(0, 100).map(row => `- ${row.status}: ${row.endpoint} ${row.symbol || ''} (${row.message || row.error_code || 'no message'})`).join('\n')
      : '- No failures recorded.',
    '',
  ].join('\n');
}

function printDryRunPlan(plan) {
  console.log(`FMP harvest dry-run: ${plan.workUnits.length} planned work unit(s).`);
  console.log(`Archive root: ${plan.archiveRoot}`);
  for (const stage of plan.stages) {
    const count = plan.workUnits.filter(unit => unit.stage === stage).length;
    console.log(`  ${stage}: ${count}`);
  }
}

function printAuditSummary(audit) {
  console.log(`FMP harvest audit: ${audit.acceptanceStatus}`);
  console.log(`  files=${audit.totals.files} requests=${audit.totals.requests} failures=${audit.totals.failures}`);
  if (audit.filePath) console.log(`  wrote=${audit.filePath}`);
}

function summarizeExecutionResult(result) {
  return {
    source: result.source,
    harvestId: result.harvestId,
    archiveRoot: result.archiveRoot,
    wrote: result.wrote?.length || 0,
    failures: result.results?.filter(row => !row.ok).length || 0,
    audit: result.audit ? {
      acceptanceStatus: result.audit.acceptanceStatus,
      totals: result.audit.totals,
      filePath: result.audit.filePath,
    } : null,
  };
}
