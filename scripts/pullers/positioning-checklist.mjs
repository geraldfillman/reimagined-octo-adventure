import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getEngineCacheDir, getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, today, writeNote } from '../lib/markdown.mjs';
import {
  WORKBOOK_MODULE_WEIGHTS,
  calculateMasterScore,
  scoreOptionsGate,
  scoreSourceCoverage,
} from '../lib/positioning-checklist/scoring.mjs';

const SIDECAR_DIR = getEngineCacheDir('positioning-checklist');
const CFTC_CACHE_PATH = getEngineCacheDir('institutional-positioning', 'cftc-cot', 'latest.json');

export async function pull(flags = {}) {
  const date = String(flags.date || today()).slice(0, 10);
  const payload = buildDefaultPayload({ date, flags });

  if (flags['dry-run']) {
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log(buildPositioningChecklistNote(payload));
    }
    return { ...payload, filePath: null, sidecarPath: null };
  }

  const note = buildPositioningChecklistNote(payload);
  const outDir = join(getPullsDir(), 'Positioning');
  const filePath = join(outDir, `${date}_Positioning_Checklist.md`);
  const sidecarPath = join(SIDECAR_DIR, `${date}.json`);
  writeNote(filePath, note);
  mkdirSync(SIDECAR_DIR, { recursive: true });
  writeFileSync(sidecarPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote: ${filePath}`);
  console.log(`Wrote: ${sidecarPath}`);

  if (flags.json) {
    console.log(JSON.stringify({ date, filePath, sidecarPath, signal_status: payload.signal_status }, null, 2));
  }

  return { ...payload, filePath, sidecarPath };
}

export function buildPositioningChecklistPayload({
  date = today(),
  modules = [],
  coverage = [],
  hardStops = [],
  sourceGaps = [],
  warnings = [],
  preset = 'workbook-core',
} = {}) {
  const normalizedModules = modules.map(module => ({
    module: module.module,
    weight: Number(module.weight ?? WORKBOOK_MODULE_WEIGHTS[module.module] ?? 0),
    score: Number(module.score ?? 0),
    read: module.read ?? '',
    status: module.status ?? 'unavailable',
    evidence: Array.isArray(module.evidence) ? module.evidence : [],
  }));
  const score = calculateMasterScore(normalizedModules, hardStops);
  const signalStatus = hardStops.length >= 2
    ? 'alert'
    : hardStops.length > 0 || normalizedModules.some(module => Math.abs(module.score) > 0)
      ? 'watch'
      : 'clear';

  return {
    schema_version: 1,
    date,
    preset,
    source: 'My_Data Positioning Checklist Puller',
    signal_status: signalStatus,
    modules: normalizedModules,
    score,
    hardStops,
    coverage,
    sourceGaps,
    warnings,
    limitations: [
      'No trade recommendations or broker execution are provided.',
      'Unusual Whales-only fields are manual_required in this v1 implementation.',
      'Derived fields must be confirmed with fresh market data before use.',
    ],
  };
}

export function buildPositioningChecklistNote(payload = {}) {
  const frontmatter = {
    title: `Positioning Checklist ${payload.date}`,
    source: payload.source || 'My_Data Positioning Checklist Puller',
    date_pulled: payload.date,
    domain: 'positioning',
    data_type: 'positioning_checklist',
    frequency: 'on-demand',
    signal_status: payload.signal_status || 'clear',
    signals: (payload.modules || []).filter(module => Math.abs(Number(module.score || 0)) > 0).map(module => module.module),
    tags: ['positioning', 'positioning-checklist', 'cftc', 'options', 'market-structure'],
  };

  return buildNote({
    frontmatter,
    sections: [
      {
        heading: 'Executive Summary',
        content: [
          `- **Final verdict**: ${payload.score?.finalVerdict ?? 'Unavailable'}`,
          `- **Directional bias**: ${payload.score?.directionalBias ?? 'Unavailable'}`,
          `- **Conviction**: ${payload.score?.conviction ?? 'N/A'}/100`,
          `- **Raw weighted read**: ${payload.score?.rawWeightedRead ?? 'N/A'}`,
          '- **No trade recommendations**: this is research evidence only; define trigger, invalidation, and max loss outside the puller.',
        ].join('\n'),
      },
      {
        heading: 'Module Scorecard',
        content: formatModules(payload.modules || []),
      },
      {
        heading: 'Hard Stop-Signs',
        content: formatHardStops(payload.hardStops || []),
      },
      {
        heading: 'Source Coverage',
        content: formatCoverage(payload.coverage || []),
      },
      {
        heading: 'Source Gaps',
        content: (payload.sourceGaps || []).length
          ? payload.sourceGaps.map(gap => `- ${gap}`).join('\n')
          : '- No source gaps recorded.',
      },
      {
        heading: 'Warnings',
        content: (payload.warnings || []).length
          ? payload.warnings.map(warning => `- ${warning}`).join('\n')
          : '- No warnings.',
      },
      {
        heading: 'Limitations',
        content: (payload.limitations || []).map(item => `- ${item}`).join('\n'),
      },
    ],
  });
}

function buildDefaultPayload({ date, flags = {} }) {
  const cotCache = readJsonSafe(CFTC_CACHE_PATH);
  const cotModule = buildCotModule(cotCache);
  const optionsModule = scoreOptionsGate({});
  const modules = normalizeWorkbookModules([
    cotModule,
    { module: 'Market regime', score: 0, read: 'Use latest FRED, Treasury, Cboe/yfinance, and FMP tape context.', status: 'derived', evidence: [] },
    { module: 'Catalyst timing', score: 0, read: 'Macro, EIA, earnings, and FOMC calendars are pullable; exact trade catalyst remains user-selected.', status: 'derived', evidence: [] },
    { module: 'ETF / vehicle quality', score: 0, read: 'ETF structure and liquidity are partly pullable; exact sponsor flow data remains a source gap.', status: 'derived', evidence: [] },
    optionsModule,
    { module: 'Breadth / cross-market confirmation', score: 0, read: 'Breadth and correlation can be derived from price history and vol/credit notes.', status: 'derived', evidence: [] },
    { module: 'Risk-reward / execution', score: 0, read: 'Trigger, invalidation, and max loss are manual user inputs.', status: 'manual_required', evidence: [] },
  ]);

  const hardStops = [
    { id: 'missing-invalidation', label: 'No invalidation level defined' },
    ...optionsModule.hardStops,
  ];
  const coverage = scoreSourceCoverage([
    { id: 'cftc-cot', label: 'CFTC COT positioning', value: cotCache?.signals?.length ? cotCache.signals.length : null, source: 'CFTC' },
    { id: 'fmp-options', label: 'FMP option chain summary', value: null, source: 'Financial Modeling Prep', derived: true },
    { id: 'fred-credit', label: 'FRED macro and credit series', value: null, source: 'FRED', derived: true },
    { id: 'treasury', label: 'Treasury rates and auctions', value: null, source: 'Treasury', derived: true },
    { id: 'cboe-yfinance-vol', label: 'Cboe/yfinance volatility surface', value: null, source: 'Cboe/yfinance', derived: true },
    { id: 'eia-energy', label: 'EIA energy confirmations', value: null, source: 'EIA', derived: true },
    { id: 'finra-short', label: 'FINRA short/OTC positioning', value: null, source: 'FINRA', manualRequired: true },
    { id: 'uw-gex-flow', label: 'Unusual Whales GEX, NOPE, flow alerts, ETF flow', source: 'Unusual Whales', manualRequired: true },
    { id: 'aaii-survey', label: 'AAII / fund manager sentiment surveys', source: 'AAII / survey providers' },
  ]);

  return buildPositioningChecklistPayload({
    date,
    preset: flags.preset || 'workbook-core',
    modules,
    coverage,
    hardStops,
    sourceGaps: [
      'Unusual Whales GEX, NOPE, flow alerts, market tide, and ETF flow endpoints require paid API/manual input.',
      'Exact ETF creations/redemptions, holdings, bid/ask, and premium-discount checks remain sponsor/broker/manual inputs.',
      'AAII/fund-manager surveys, USDA grains, NOAA/weather, and LME/SHFE inventory are not wired into current pullers.',
      'Trigger, invalidation, and max loss are intentionally manual execution-plan fields.',
    ],
    warnings: [
      cotCache?.status && cotCache.status !== 'OK'
        ? `CFTC cache status: ${cotCache.status}.`
        : 'COT freshness must be verified against the latest CFTC report before trade use.',
      'This puller aggregates research evidence only and does not recommend trades.',
    ],
  });
}

function normalizeWorkbookModules(modules) {
  return Object.entries(WORKBOOK_MODULE_WEIGHTS).map(([module, weight]) => {
    const found = modules.find(item => item.module === module) || {};
    return {
      module,
      weight,
      score: Number(found.score ?? 0),
      read: found.read ?? 'No read available.',
      status: found.status ?? 'unavailable',
      evidence: Array.isArray(found.evidence) ? found.evidence : [],
    };
  });
}

function buildCotModule(cotCache) {
  const signals = Array.isArray(cotCache?.signals) ? cotCache.signals : [];
  if (!signals.length) {
    return {
      module: 'CFTC / positioning',
      score: 0,
      read: 'No CFTC positioning cache available; run cftc-cot first.',
      status: 'unavailable',
      evidence: [],
    };
  }

  const extremes = signals.filter(signal => signal.crowding_extreme_flag);
  const score = extremes.length ? 1 : 0;
  return {
    module: 'CFTC / positioning',
    score,
    read: extremes.length ? 'CFTC positioning includes crowding extremes.' : 'CFTC positioning cache available; no crowding extreme flagged.',
    status: 'observed',
    evidence: signals.slice(0, 5).map(signal => {
      const pct = signal.latest?.net_pct_oi == null ? 'N/A' : `${(Number(signal.latest.net_pct_oi) * 100).toFixed(1)}%`;
      return `${signal.market}: net % OI ${pct}`;
    }),
  };
}

function formatModules(modules) {
  return modules.length
    ? buildTable(
      ['Module', 'Weight', 'Score', 'Status', 'Read', 'Evidence'],
      modules.map(module => [
        module.module,
        Number(module.weight ?? 0).toFixed(2),
        String(module.score ?? 0),
        module.status ?? '',
        module.read ?? '',
        (module.evidence || []).slice(0, 3).join('; '),
      ])
    )
    : '_No modules scored._';
}

function formatHardStops(hardStops) {
  return hardStops.length
    ? buildTable(['Stop-sign', 'Reason'], hardStops.map(stop => [stop.id, stop.label]))
    : '- No hard stop-signs tripped.';
}

function formatCoverage(coverage) {
  return coverage.length
    ? buildTable(
      ['Input', 'Status', 'Source', 'Notes'],
      coverage.map(item => [item.label || item.id, item.status, item.source || '', item.notes || ''])
    )
    : '_No source coverage rows._';
}

function readJsonSafe(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}
