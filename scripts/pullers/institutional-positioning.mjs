import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getEngineCacheDir, getPullsDir, resolveWorldMachinePath, toEngineRelative } from '../lib/config.mjs';
import { buildNote, buildTable, formatNumber, today, writeNote } from '../lib/markdown.mjs';
import { estimateDealerGamma } from '../lib/dealer-gamma-model.mjs';
import { scoreShortStress } from '../lib/short-stress-model.mjs';
import { calculateInstitutionalCrowding } from '../lib/institutional-crowding-model.mjs';
import { manualRequired } from '../lib/positioning-provenance.mjs';

const SIDECAR_DIR = getEngineCacheDir('institutional-positioning');
const DEFAULT_SYMBOLS = Object.freeze(['SPY', 'QQQ', 'NVDA', 'TSLA']);

export async function pull(flags = {}) {
  const date = String(flags.date || today()).slice(0, 10);
  const symbols = parseSymbols(flags.symbols || (flags.all ? DEFAULT_SYMBOLS.join(',') : DEFAULT_SYMBOLS.join(',')));
  const quarter = flags.quarter || inferQuarter(date);

  const data = buildPositioningSnapshot({ date, symbols, quarter });
  const note = buildInstitutionalPositioningReportNote(data);
  const filePath = join(getPullsDir(), 'Positioning', datedFilename(date, 'Institutional_Positioning_Market_Structure'));

  let worldMachineInboxPath = null;
  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    emitSidecar(date, { ...data, filePath });
    if (flags['bridge-world-machine'] || flags.bridgeWorldMachine) {
      worldMachineInboxPath = writeWorldMachineInboxCandidate({ date, data, filePath });
    }
    console.log(`Wrote: ${filePath}`);
  }

  const result = {
    filePath: flags['dry-run'] ? null : filePath,
    sidecarPath: flags['dry-run'] ? null : join(SIDECAR_DIR, `${date}.json`),
    worldMachineInboxPath,
    symbols,
    signal_status: data.shortStress.some(row => row.label === 'alert') ? 'alert' : 'watch',
    warnings: data.warnings,
  };
  if (flags.json) console.log(JSON.stringify(result, null, 2));
  return result;
}

export function buildInstitutionalPositioningReportNote({
  date,
  symbols = [],
  freshness = [],
  dealerGamma = [],
  shortStress = [],
  crowding = [],
  cot = [],
  otc = [],
  warnings = [],
} = {}) {
  const signalStatus = shortStress.some(row => row.label === 'alert') ? 'alert' : symbols.length ? 'watch' : 'clear';
  return buildNote({
    frontmatter: {
      title: `Institutional Positioning and Market Structure ${date}`,
      source: 'My_Data Institutional Positioning Agent',
      date_pulled: date,
      domain: 'positioning',
      data_type: 'institutional_positioning_report',
      frequency: 'daily',
      signal_status: signalStatus,
      signals: symbols,
      agent_owner: 'positioning',
      handoff_to: ['world_machine', 'orchestrator'],
      tags: ['positioning', 'institutional-positioning', 'dealer-gamma', 'short-stress', 'market-structure'],
    },
    sections: [
      { heading: 'Data Freshness', content: formatFreshness(freshness) },
      { heading: 'Dealer Gamma', content: formatDealerGamma(dealerGamma) },
      { heading: 'Short Stress', content: formatShortStress(shortStress) },
      { heading: '13F Crowding', content: formatCrowding(crowding) },
      { heading: 'CFTC Positioning', content: formatCot(cot) },
      { heading: 'Dark/OTC Availability', content: formatOtc(otc) },
      {
        heading: 'Prime-Broker Proxy Limitations',
        content: [
          '- Public data cannot reveal true prime-broker client books.',
          '- Form ADV relationships can support a later proxy graph, but they do not reveal balances, margin, shorts, swaps, or actual financing exposure.',
          '- Any prime-broker exposure row from this agent must remain labeled as proxy/model/manual_or_paid_required.',
        ].join('\n'),
      },
      {
        heading: 'World_Machine Watchpoint Candidates',
        content: symbols.length
          ? symbols.map(symbol => `- **${symbol}** - Action Label: Observe. Required data check: confirm price/volume, source freshness, and an independent options or filing update before any strategy promotion. Stand-aside condition: source stack stale or gamma/short-stress evidence contradicts price action.`).join('\n')
          : '- No watchpoint candidates generated.',
      },
      {
        heading: 'Warnings',
        content: warnings.length ? warnings.map(warning => `- ${warning}`).join('\n') : '- No warnings.',
      },
    ],
  });
}

function buildPositioningSnapshot({ date, symbols, quarter }) {
  const optionsCache = readJsonSafe(join(SIDECAR_DIR, 'manual-options.json')) ?? {};
  const shortCache = readJsonSafe(join(SIDECAR_DIR, 'manual-short-interest.json')) ?? {};
  const ftdCache = readJsonSafe(join(SIDECAR_DIR, 'sec-ftd', `${date}.json`)) ?? {};
  const thirteenF = readJsonSafe(join(SIDECAR_DIR, 'sec-13f', `${quarter}.json`)) ?? {};
  const cotCache = readJsonSafe(join(SIDECAR_DIR, 'cftc-cot', 'latest.json')) ?? {};

  const dealerGamma = symbols.map(symbol => {
    const optionRecord = optionsCache[symbol] ?? {};
    return estimateDealerGamma({
      symbol,
      spot: optionRecord.spot ?? 100,
      contracts: optionRecord.contracts ?? sampleContracts(symbol, date),
      asOfDate: date,
    });
  });

  const shortStress = symbols.map(symbol => scoreShortStress({
    symbol,
    shortInterest: shortCache[symbol]?.shortInterest ?? {},
    shortSaleVolume: shortCache[symbol]?.shortSaleVolume ?? {},
    ftd: ftdCache[symbol] ?? {},
    thresholdDays: shortCache[symbol]?.thresholdDays ?? 0,
    gamma: dealerGamma.find(row => row.symbol === symbol) ?? {},
  }));

  const crowding = symbols.map(symbol => calculateInstitutionalCrowding({
    symbol,
    cusip: thirteenF.symbolToCusip?.[symbol],
    currentRows: thirteenF.currentRows ?? [],
    priorRows: thirteenF.priorRows ?? [],
    averageDailyVolumeShares: shortCache[symbol]?.shortInterest?.averageDailyVolume,
  }));

  const cot = Array.isArray(cotCache.signals) ? cotCache.signals : [];
  const otc = [manualRequired('FINRA OTC Transparency', 'FINRA public Query API credentials and dataset names must be configured before dark/off-exchange metrics are observed.')];

  return {
    date,
    symbols,
    quarter,
    freshness: [
      { source: 'SEC 13F', latestAsOf: quarter, status: thirteenF.currentRows ? 'OK' : 'Missing/manual', notes: 'Delayed long-only filing data.' },
      { source: 'SEC FTD', latestAsOf: date, status: Object.keys(ftdCache).length ? 'OK' : 'Missing/manual', notes: 'Aggregate settlement-fail proxy.' },
      { source: 'FINRA', latestAsOf: date, status: 'Manual/API setup required', notes: 'Short/OTC public API access is optional and may require credentials.' },
      { source: 'Options OI', latestAsOf: date, status: 'Modeled', notes: 'Uses manual/cache or fallback sample contracts until a live chain is available.' },
    ],
    dealerGamma,
    shortStress,
    crowding,
    cot,
    otc,
    warnings: [
      'Dealer gamma is an OI-only model unless paid open/close participant data is connected.',
      '13F data is delayed and long-only.',
      'Daily short-sale volume is a flow proxy, not a position measure.',
      'Prime-broker exposure is not public and is not observed by this report.',
    ],
  };
}

function formatFreshness(rows) {
  return rows.length ? buildTable(['Source', 'Latest As-Of', 'Status', 'Notes'], rows.map(row => [
    row.source,
    row.latestAsOf ?? '',
    row.status ?? '',
    row.notes ?? '',
  ])) : '_No freshness rows._';
}

function formatDealerGamma(rows) {
  return rows.length ? buildTable(['Symbol', 'Total GEX', 'Gamma Flip', 'Call Wall', 'Put Wall', 'Confidence'], rows.map(row => [
    row.symbol,
    formatNumber(row.totalGammaExposure ?? 0, { style: 'compact', decimals: 1 }),
    row.gammaFlip == null ? 'N/A' : Number(row.gammaFlip).toFixed(2),
    row.callWall?.strike ?? 'N/A',
    row.putWall?.strike ?? 'N/A',
    row.signal_confidence,
  ])) : '_No dealer gamma rows._';
}

function formatShortStress(rows) {
  return rows.length ? buildTable(['Symbol', 'Score', 'Label', 'SI/Float', 'Short Vol Share', 'Confidence'], rows.map(row => [
    row.symbol,
    row.score,
    row.label,
    pct(row.metrics?.short_interest_float_pct),
    pct(row.metrics?.short_volume_share),
    row.signal_confidence,
  ])) : '_No short stress rows._';
}

function formatCrowding(rows) {
  return rows.length ? buildTable(['Symbol', 'Managers', 'Total Shares', 'QoQ Delta', 'Unwind Days @20% ADV', 'Confidence'], rows.map(row => [
    row.symbol,
    row.manager_count ?? 0,
    formatNumber(row.total_shares ?? 0, { style: 'compact', decimals: 1 }),
    row.delta_shares_qoq == null ? 'N/A' : formatNumber(row.delta_shares_qoq, { style: 'compact', decimals: 1 }),
    row.unwind_days_at_20pct_adv == null ? 'N/A' : Number(row.unwind_days_at_20pct_adv).toFixed(1),
    row.signal_confidence,
  ])) : '_No 13F crowding rows._';
}

function formatCot(rows) {
  return rows.length ? buildTable(['Market', 'Net', 'Net % OI', 'Z-Score', 'Confidence'], rows.map(row => [
    row.market,
    row.latest?.net ?? 'N/A',
    pct(row.latest?.net_pct_oi),
    row.latest?.positioning_z == null ? 'N/A' : Number(row.latest.positioning_z).toFixed(2),
    row.signal_confidence,
  ])) : '_No CFTC rows available in cache._';
}

function formatOtc(rows) {
  return rows.length ? buildTable(['Source', 'Status', 'Notes'], rows.map(row => [
    row.source,
    row.status,
    row.notes,
  ])) : '_No OTC rows._';
}

function parseSymbols(value) {
  return [...new Set(String(value || '').split(',').map(item => item.trim().toUpperCase()).filter(Boolean))];
}

function pct(value) {
  return value == null || !Number.isFinite(Number(value)) ? 'N/A' : `${(Number(value) * 100).toFixed(1)}%`;
}

function inferQuarter(date) {
  const lagged = new Date(`${date}T00:00:00Z`);
  lagged.setUTCDate(lagged.getUTCDate() - 45);
  const year = lagged.getUTCFullYear();
  const month = lagged.getUTCMonth() + 1;
  const quarter = Math.max(1, Math.ceil(month / 3));
  return `${year}Q${quarter}`;
}

function sampleContracts(symbol, date) {
  const spot = 100;
  return [
    { type: 'call', strike: spot * 1.02, expiration: addDays(date, 7), openInterest: 500, impliedVolatility: 0.22 },
    { type: 'put', strike: spot * 0.98, expiration: addDays(date, 7), openInterest: 450, impliedVolatility: 0.24 },
  ];
}

function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function readJsonSafe(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function emitSidecar(date, payload) {
  mkdirSync(SIDECAR_DIR, { recursive: true });
  writeFileSync(join(SIDECAR_DIR, `${date}.json`), JSON.stringify(payload, null, 2), 'utf8');
}

function datedFilename(date, name) {
  return `${date}_${sanitizeFilenameSegment(name)}.md`;
}

function sanitizeFilenameSegment(value) {
  return String(value)
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function writeWorldMachineInboxCandidate({ date, data, filePath }) {
  const inboxDir = resolveWorldMachinePath('_Inbox');
  mkdirSync(inboxDir, { recursive: true });
  const outPath = join(inboxDir, `${date} - Institutional Positioning Market Structure Bridge.md`);
  const relativeSource = toEngineRelative(filePath);
  const content = [
    '---',
    `type: inbox-candidate`,
    `source: My_Data Institutional Positioning Agent`,
    `date: ${date}`,
    `status: review`,
    `tags: [world-machine-inbox, positioning, dealer-gamma, short-stress]`,
    '---',
    '',
    `# ${date} - Institutional Positioning Market Structure Bridge`,
    '',
    '## Source',
    '',
    `- My_Data pull note: \`${relativeSource}\``,
    `- Symbols: ${data.symbols.join(', ')}`,
    '',
    '## Review Summary',
    '',
    '- Action Label: `Observe` only.',
    '- Dealer gamma is modeled from option open interest and remains `derived_low_confidence` until stronger options data is connected.',
    '- 13F crowding is delayed, long-only, and currently missing/manual unless a 13F cache has been populated.',
    '- FINRA short/OTC data requires credentials or manual source setup before it can be treated as observed.',
    '- Prime-broker exposure is not public and is not observed by this report.',
    '',
    '## Candidate Routing',
    '',
    '- Consider linking this to `[[10_Tools_and_Tech/Hedge Fund Positioning and Dealer Gamma Data Sources]]`.',
    '- If promoted into a watchpoint, keep strategy language flat-book only: `stand aside`, `avoid new entry`, or `prepare a fresh entry` after independent confirmation.',
    '- Required confirmation before promotion: fresh price/volume, source freshness, and at least one independent options, filing, COT, or FINRA update.',
    '',
    '## Warnings',
    '',
    ...data.warnings.map(warning => `- ${warning}`),
    '',
  ].join('\n');
  writeFileSync(outPath, content, 'utf8');
  console.log(`Wrote World_Machine inbox candidate: ${outPath}`);
  return outPath;
}
