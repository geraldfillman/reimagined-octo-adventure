/**
 * sec.mjs — SEC EDGAR 8-K filing tracker for thesis company watchlist
 *
 * Uses two free EDGAR APIs (no key required):
 *   1. EDGAR EFTS full-text search (efts.sec.gov/LATEST/search-index)
 *      → Searches 8-K filings that mention each company name
 *   2. EDGAR company submissions (data.sec.gov/submissions/CIK{cik}.json)
 *      → Direct CIK lookup for precise recent filings
 *
 * 8-K items of highest signal value for thesis investing:
 *   Item 1.01 — Material contracts (DoD awards, licensing deals)
 *   Item 2.02 — Earnings results
 *   Item 5.02 — Executive departures (risk signal)
 *   Item 8.01 — Other material events (FDA decisions, trial results)
 *   Item 9.01 — Financial statements
 *
 * Thesis company watchlist (CIKs pre-resolved for speed):
 *   Drones:      KTOS, AVAV, RCAT, ONDS, ACHR, JOBY
 *   Defense AI:  PLTR, BBAI, LDOS, BAH, NOC, LMT, GD
 *   AMR:         INVA, SPRO
 *   Psychedelics: CMPS, ATAI, ALKS, NBIX, GHRS, DFTX, NRXP
 *
 * Sector watchlist (--sectors):
 *   Technology, Healthcare, Energy, Financials,
 *   Industrials, Consumer, Real Estate, Clean Energy
 *   Each sector: large / mid / small cap mix
 *
 * Usage:
 *   node run.mjs sec --thesis          # All thesis companies (default)
 *   node run.mjs sec --drones          # Drone/eVTOL companies only
 *   node run.mjs sec --defense         # Defense AI companies only
 *   node run.mjs sec --amr             # AMR biotech companies only
 *   node run.mjs sec --psychedelics    # Psychedelic therapeutics
 *   node run.mjs sec --sectors         # Broad sector overview (all 8)
 *   node run.mjs sec --sectors tech    # Single sector by name
 */

import { mkdirSync } from 'fs';
import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { highestSeverity } from '../lib/signals.mjs';

// Pre-resolved CIKs (zero-padded to 10 digits) — avoids per-run lookup latency
const COMPANIES = {
  // Drones & eVTOL
  KTOS:  { name: 'Kratos Defense',    cik: '0001069258', thesis: 'drones' },
  AVAV:  { name: 'AeroVironment',     cik: '0001368622', thesis: 'drones' },
  RCAT:  { name: 'Red Cat Holdings',  cik: '0001590418', thesis: 'drones' },
  ONDS:  { name: 'Ondas Holdings',    cik: '0001713539', thesis: 'drones' },
  ACHR:  { name: 'Archer Aviation',   cik: '0001779128', thesis: 'drones' },
  JOBY:  { name: 'Joby Aviation',     cik: '0001819989', thesis: 'drones' },
  // Defense AI
  PLTR:  { name: 'Palantir',          cik: '0001321655', thesis: 'defense' },
  BBAI:  { name: 'BigBear.ai',        cik: '0001836935', thesis: 'defense' },
  LDOS:  { name: 'Leidos',            cik: '0001336920', thesis: 'defense' },
  BAH:   { name: 'Booz Allen Hamilton', cik: '0001443646', thesis: 'defense' },
  NOC:   { name: 'Northrop Grumman', cik: '0001133421', thesis: 'defense' },
  LMT:   { name: 'Lockheed Martin',   cik: '0000936468', thesis: 'defense' },
  GD:    { name: 'General Dynamics',  cik: '0000040533', thesis: 'defense' },
  // AMR (PRTK deregistered 2023 — removed)
  INVA:  { name: 'Innoviva',          cik: '0001080014', thesis: 'amr' },
  SPRO:  { name: 'Spero Therapeutics',cik: '0001701108', thesis: 'amr' },
  // Psychedelics (CIKs verified 2026-03-25)
  CMPS:  { name: 'COMPASS Pathways',  cik: '0001816590', thesis: 'psychedelics' },
  ATAI:  { name: 'ATAI Life Sciences',cik: '0001840904', thesis: 'psychedelics' },
  ALKS:  { name: 'Alkermes',          cik: '0001520262', thesis: 'psychedelics' },
  NBIX:  { name: 'Neurocrine Bio',    cik: '0000914475', thesis: 'psychedelics' },
  GHRS:  { name: 'GH Research',       cik: '0001855129', thesis: 'psychedelics' },
  DFTX:  { name: 'Definium Therapeutics (fka MindMed)', cik: '0001813814', thesis: 'psychedelics' },
  NRXP:  { name: 'NRx Pharmaceuticals',cik: '0001719406', thesis: 'psychedelics' },
  // GLP-1 / Metabolic Disease
  LLY:   { name: 'Eli Lilly',           cik: '0000059478', thesis: 'glp1' },
  VKTX:  { name: 'Viking Therapeutics', cik: '0001607678', thesis: 'glp1' },
  ALVO:  { name: 'Altimmune',           cik: '0001898416', thesis: 'glp1' },
  HIMS:  { name: 'Hims & Hers Health',  cik: '0001773751', thesis: 'glp1' },
  AMGN:  { name: 'Amgen',               cik: '0000318154', thesis: 'glp1' },
  // Gene Editing / CRISPR
  NTLA:  { name: 'Intellia Therapeutics',   cik: '0001652130', thesis: 'geneediting' },
  BEAM:  { name: 'Beam Therapeutics',       cik: '0001745999', thesis: 'geneediting' },
  EDIT:  { name: 'Editas Medicine',         cik: '0001650664', thesis: 'geneediting' },
  CRSP:  { name: 'CRISPR Therapeutics',     cik: '0001674416', thesis: 'geneediting' },
  // Alzheimer's Disease Modification
  BIIB:  { name: 'Biogen',                  cik: '0000875045', thesis: 'alzheimers' },
  PRTA:  { name: 'Prothena',                cik: '0001559053', thesis: 'alzheimers' },
  ACAD:  { name: 'Acadia Pharmaceuticals',  cik: '0001070494', thesis: 'alzheimers' },
  // Longevity / Aging Biology
  UNTY:  { name: 'Unity Biotechnology',     cik: '0000920427', thesis: 'longevity' },
  XOMA:  { name: 'XOMA Royalty',            cik: '0000791908', thesis: 'longevity' },
  // Nuclear Renaissance / SMRs
  NNE:   { name: 'Nano Nuclear Energy',     cik: '0001923891', thesis: 'nuclear' },
  SMR:   { name: 'NuScale Power',           cik: '0001822966', thesis: 'nuclear' },
  OKLO:  { name: 'Oklo',                    cik: '0001849056', thesis: 'nuclear' },
  CEG:   { name: 'Constellation Energy',    cik: '0001868275', thesis: 'nuclear' },
  VST:   { name: 'Vistra Corp',             cik: '0001692819', thesis: 'nuclear' },
  CCJ:   { name: 'Cameco',                  cik: '0001009001', thesis: 'nuclear' },
  // Grid-Scale Battery Storage
  FLNC:  { name: 'Fluence Energy',          cik: '0001868941', thesis: 'storage' },
  STEM:  { name: 'Stem',                    cik: '0001758766', thesis: 'storage' },
  ENVX:  { name: 'Enovix',                  cik: '0001828318', thesis: 'storage' },
  // AI Power Infrastructure
  NRG:   { name: 'NRG Energy',              cik: '0001013871', thesis: 'aipower' },
  GEV:   { name: 'GE Vernova',              cik: '0001996810', thesis: 'aipower' },
  ETN:   { name: 'Eaton Corp',              cik: '0001551182', thesis: 'aipower' },
  STRL:  { name: 'Sterling Infrastructure', cik: '0000874238', thesis: 'aipower' },
  // Humanoid Robotics
  TSLA:  { name: 'Tesla',                   cik: '0001318605', thesis: 'humanoid' },
  GOOGL: { name: 'Alphabet',                cik: '0001652044', thesis: 'humanoid' },
  NVDA:  { name: 'NVIDIA',                  cik: '0001045810', thesis: 'humanoid' },
  // Quantum Computing
  IONQ:  { name: 'IonQ',                    cik: '0001824920', thesis: 'quantum' },
  RGTI:  { name: 'Rigetti Computing',       cik: '0001838359', thesis: 'quantum' },
  QUBT:  { name: 'Quantum Computing Inc.',  cik: '0001758009', thesis: 'quantum' },
  // Semiconductor Sovereignty / CHIPS Act
  AMAT:  { name: 'Applied Materials',       cik: '0000006951', thesis: 'semis' },
  KLAC:  { name: 'KLA Corporation',         cik: '0000319201', thesis: 'semis' },
  LRCX:  { name: 'Lam Research',            cik: '0000707549', thesis: 'semis' },
  ON:    { name: 'ON Semiconductor',        cik: '0001097864', thesis: 'semis' },
  WOLF:  { name: 'Wolfspeed',               cik: '0000895419', thesis: 'semis' },
  ONTO:  { name: 'Onto Innovation',         cik: '0000704532', thesis: 'semis' },
  // Housing Supply Correction
  DHI:   { name: 'D.R. Horton',             cik: '0000882184', thesis: 'housing' },
  LEN:   { name: 'Lennar',                  cik: '0000920760', thesis: 'housing' },
  NVR:   { name: 'NVR',                     cik: '0000906163', thesis: 'housing' },
  TOL:   { name: 'Toll Brothers',           cik: '0000794170', thesis: 'housing' },
  TMHC:  { name: 'Taylor Morrison Home',    cik: '0001562476', thesis: 'housing' },
  SKY:   { name: 'Skyline Champion',        cik: '0000090896', thesis: 'housing' },
  // Dollar Debasement / Hard Money
  GOLD:  { name: 'Barrick Gold',            cik: '0001591588', thesis: 'hardmoney' },
  NEM:   { name: 'Newmont',                 cik: '0001164727', thesis: 'hardmoney' },
  WPM:   { name: 'Wheaton Precious Metals', cik: '0001323404', thesis: 'hardmoney' },
  MSTR:  { name: 'MicroStrategy',           cik: '0001050446', thesis: 'hardmoney' },
  COIN:  { name: 'Coinbase',                cik: '0001679788', thesis: 'hardmoney' },
  // Space Domain Awareness
  RKLB:  { name: 'Rocket Lab',              cik: '0001819994', thesis: 'space' },
  PL:    { name: 'Planet Labs',             cik: '0001836833', thesis: 'space' },
  ASTS:  { name: 'AST SpaceMobile',         cik: '0001780312', thesis: 'space' },
  BKSY:  { name: 'BlackSky Technology',     cik: '0001753539', thesis: 'space' },
  SPIR:  { name: 'Spire Global',            cik: '0001816017', thesis: 'space' },
  MNTS:  { name: 'Momentus Space',          cik: '0001781162', thesis: 'space' },
  // Hypersonic Weapons & Advanced Defense
  RTX:   { name: 'RTX (Raytheon)',          cik: '0000101829', thesis: 'hypersonics' },
  LHX:   { name: 'L3Harris Technologies',   cik: '0000202058', thesis: 'hypersonics' },
};

// Sector watchlist — broad market overview, mixed large/mid/small cap
// CIKs verified 2026-03-25 via data.sec.gov/files/company_tickers.json
const SECTOR_COMPANIES = {
  Technology: [
    { ticker: 'MSFT', cik: '0000789019', name: 'Microsoft',        cap: 'large' },
    { ticker: 'NVDA', cik: '0001045810', name: 'NVIDIA',           cap: 'large' },
    { ticker: 'DDOG', cik: '0001561550', name: 'Datadog',          cap: 'mid'   },
    { ticker: 'CRWD', cik: '0001535527', name: 'CrowdStrike',      cap: 'mid'   },
    { ticker: 'IONQ', cik: '0001824920', name: 'IonQ',             cap: 'small' },
    { ticker: 'SOUN', cik: '0001840856', name: 'SoundHound AI',    cap: 'small' },
  ],
  Healthcare: [
    { ticker: 'JNJ',  cik: '0000200406', name: 'Johnson & Johnson', cap: 'large' },
    { ticker: 'LLY',  cik: '0000059478', name: 'Eli Lilly',         cap: 'large' },
    { ticker: 'VRTX', cik: '0000875320', name: 'Vertex Pharma',     cap: 'large' },
    { ticker: 'MDGL', cik: '0001157601', name: 'Madrigal Pharma',   cap: 'mid'   },
    { ticker: 'ROIV', cik: '0001635088', name: 'Roivant Sciences',  cap: 'mid'   },
  ],
  Energy: [
    { ticker: 'XOM',  cik: '0000034088', name: 'ExxonMobil',       cap: 'large' },
    { ticker: 'COP',  cik: '0001163165', name: 'ConocoPhillips',   cap: 'large' },
    { ticker: 'DVN',  cik: '0001090012', name: 'Devon Energy',     cap: 'mid'   },
    { ticker: 'CTRA', cik: '0000858470', name: 'Coterra Energy',   cap: 'mid'   },
    { ticker: 'AR',   cik: '0001433270', name: 'Antero Resources', cap: 'small' },
  ],
  Financials: [
    { ticker: 'JPM',  cik: '0000019617', name: 'JPMorgan Chase',   cap: 'large' },
    { ticker: 'GS',   cik: '0000886982', name: 'Goldman Sachs',    cap: 'large' },
    { ticker: 'COF',  cik: '0000927628', name: 'Capital One',      cap: 'large' },
    { ticker: 'WAL',  cik: '0001212545', name: 'Western Alliance', cap: 'mid'   },
    { ticker: 'MBIN', cik: '0001629019', name: 'Merchants Bancorp',cap: 'small' },
  ],
  Industrials: [
    { ticker: 'CAT',  cik: '0000018230', name: 'Caterpillar',      cap: 'large' },
    { ticker: 'HON',  cik: '0000773840', name: 'Honeywell',        cap: 'large' },
    { ticker: 'GNRC', cik: '0001474735', name: 'Generac',          cap: 'mid'   },
    { ticker: 'ASTE', cik: '0000792987', name: 'Astec Industries', cap: 'mid'   },
    { ticker: 'POWL', cik: '0000080420', name: 'Powell Industries', cap: 'small' },
  ],
  Consumer: [
    { ticker: 'AMZN', cik: '0001018724', name: 'Amazon',           cap: 'large' },
    { ticker: 'TSLA', cik: '0001318605', name: 'Tesla',            cap: 'large' },
    { ticker: 'FIVE', cik: '0001177609', name: 'Five Below',       cap: 'mid'   },
    { ticker: 'BOOT', cik: '0001610250', name: 'Boot Barn',        cap: 'mid'   },
    { ticker: 'PRPL', cik: '0001643953', name: 'Purple Innovation',cap: 'small' },
  ],
  'Real Estate': [
    { ticker: 'PLD',  cik: '0001045609', name: 'Prologis',         cap: 'large' },
    { ticker: 'AMT',  cik: '0001053507', name: 'American Tower',   cap: 'large' },
    { ticker: 'IIPR', cik: '0001677576', name: 'Innov. Industrial', cap: 'mid'  },
    { ticker: 'ADC',  cik: '0000917251', name: 'Agree Realty',     cap: 'mid'   },
    { ticker: 'GOOD', cik: '0001234006', name: 'Gladstone Comm.',  cap: 'small' },
  ],
  'Clean Energy': [
    { ticker: 'NEE',  cik: '0000753308', name: 'NextEra Energy',   cap: 'large' },
    { ticker: 'ENPH', cik: '0001463101', name: 'Enphase Energy',   cap: 'mid'   },
    { ticker: 'ARRY', cik: '0001820721', name: 'Array Technologies',cap: 'mid'  },
    { ticker: 'HASI', cik: '0001561894', name: 'HA Sustainable Infra',cap: 'mid'},
    { ticker: 'CLNE', cik: '0001368265', name: 'Clean Energy Fuels',cap: 'small'},
  ],
};

// Sector name aliases for --sectors <name> flag
const SECTOR_ALIASES = {
  tech: 'Technology', technology: 'Technology',
  health: 'Healthcare', healthcare: 'Healthcare',
  energy: 'Energy',
  finance: 'Financials', financials: 'Financials', financial: 'Financials',
  industrial: 'Industrials', industrials: 'Industrials',
  consumer: 'Consumer',
  realestate: 'Real Estate', 're': 'Real Estate', 'real-estate': 'Real Estate',
  clean: 'Clean Energy', cleanenergy: 'Clean Energy', renewable: 'Clean Energy',
};

// Actionable implications per 8-K item type
const ITEM_IMPLICATIONS = {
  '1.01': [
    'Review contract value and scope — may appear on USASpending.gov within 1-5 business days',
    'Check if contract is sole-source (stronger signal) vs competitive',
    'Identify subcontractor exposure for secondary equity plays',
  ],
  '1.02': [
    '⚠️ Contract terminated — assess revenue impact vs guidance',
    'Check if competitor won the recompete or contract was cancelled',
    'Review remaining backlog for concentration risk',
  ],
  '2.02': [
    'Compare revenue/EPS vs consensus estimates for sentiment shift',
    'Check guidance revision — forward guidance matters more than beat/miss for small caps',
    'Review cash burn rate vs cash position for biotech/pre-revenue names',
  ],
  '5.02': [
    '⚠️ Executive departure — assess whether key technical/BD talent is leaving',
    'Check insider selling history for context',
    'For small-cap defense/biotech, single executive departures can be material',
  ],
  '2.06': [
    '🔴 Material impairment — assess size vs total assets and equity book value',
    'For banks: check loan category (CRE, C&I, consumer) for sector contagion read',
    'Compare to prior quarter provisions — one-time vs trend matters most',
  ],
  '4.01': [
    '⚠️ Auditor change — read carefully: voluntary switch vs dismissal',
    'Dismissal of auditor is a significant governance red flag',
  ],
  '5.03': [
    'Articles amendment — check if dilution-related (authorized shares increase) or governance change',
  ],
  '7.01': [
    'Reg FD disclosure — company communicating selectively to institutions; read the filing',
    'Often precedes or follows a major catalyst announcement',
  ],
  '8.01': [
    'Other material event — read the actual filing, category is broad',
    'For biotech: may be trial data, FDA communication, or partnership',
    'For defense: may be program win, loss, or regulatory approval',
  ],
};

// 8-K items worth calling out in signals
const SIGNAL_ITEMS = {
  '1.01': 'Material contract',
  '1.02': 'Contract termination ⚠️',
  '2.02': 'Earnings results',
  '2.06': 'Material impairment 🔴',
  '4.01': 'Auditor change ⚠️',
  '5.02': 'Executive departure ⚠️',
  '5.03': 'Amendment to articles ⚠️',
  '7.01': 'Regulation FD disclosure',
  '8.01': 'Other material event',
};

const LOOKBACK_DAYS = 30;

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function sortCountsDesc(counts) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function formatItemLabel(item) {
  return SIGNAL_ITEMS[item] ?? `Item ${item}`;
}

function summarizeItems(items) {
  if (!items || items.length === 0) return 'None';
  return items.map(item => formatItemLabel(item)).join(', ');
}

function unique(values) {
  return [...new Set(values)];
}

function formatCountPreview(entries, formatter = value => String(value), limit = 5) {
  const preview = entries
    .slice(0, limit)
    .map(([value, count]) => `${formatter(value)} (${count})`);
  return preview.length > 0 ? preview.join(', ') : 'none';
}

function buildItemMixRows(filings) {
  return sortCountsDesc(
    countBy(
      filings.flatMap(filing => filing.items ?? []),
      item => item,
    ),
  ).map(([item, count]) => [item, formatItemLabel(item), String(count)]);
}

function buildTickerActivityRows(filings) {
  const grouped = new Map();
  for (const filing of filings) {
    const current = grouped.get(filing.ticker) ?? {
      ticker: filing.ticker,
      thesis: COMPANIES[filing.ticker]?.thesis ?? '-',
      filings: 0,
      items: [],
    };
    current.filings += 1;
    current.items.push(...(filing.items ?? []));
    grouped.set(filing.ticker, current);
  }

  return [...grouped.values()]
    .sort((a, b) => b.filings - a.filings || a.ticker.localeCompare(b.ticker))
    .map(entry => [
      entry.ticker,
      entry.thesis,
      String(entry.filings),
      summarizeItems(unique(entry.items)),
    ]);
}

function buildRecentFilingRows(filings, options = {}) {
  const { includeThesis = false, includeSector = false, includeCap = false } = options;
  return filings.map(filing => {
    const row = [filing.ticker];
    if (includeThesis) {
      row.push(COMPANIES[filing.ticker]?.thesis ?? '-');
    }
    if (includeSector) {
      row.push(filing.sector ?? '-');
    }
    if (includeCap) {
      row.push(filing.cap ?? '-');
    }
    row.push(
      filing.filingDate,
      filing.formType,
      filing.items.join(', ') || '-',
      filing.description?.slice(0, 60) || '-',
      `[EDGAR](${filing.url})`,
    );
    return row;
  });
}

function buildSectorSnapshotRows(sectorResults) {
  return Object.entries(sectorResults).map(([sectorName, result]) => {
    const filings = result.filings ?? [];
    const activeTickers = unique(filings.map(filing => filing.ticker));
    const itemPreview = formatCountPreview(
      buildItemMixRows(filings).map(([item, label, count]) => [`${item} ${label}`, Number(count)]),
      value => value,
      3,
    );
    return [
      sectorName,
      String(result.companies.length),
      String(activeTickers.length),
      String(filings.length),
      itemPreview,
    ];
  });
}

function buildThesisSummary(tickers, filings) {
  const activeTickers = unique(filings.map(filing => filing.ticker));
  const mostActive = formatCountPreview(sortCountsDesc(countBy(filings, filing => filing.ticker)));
  const topItems = formatCountPreview(
    sortCountsDesc(countBy(filings.flatMap(filing => filing.items ?? []), item => item)),
    item => formatItemLabel(item),
  );
  return `${filings.length} filings across ${activeTickers.length} of ${tickers.length} tracked companies in the last ${LOOKBACK_DAYS} days. Most active tickers: ${mostActive}. Top item mix: ${topItems}.`;
}

function buildSectorSummary(sectorResults, totalCompanies, totalFilings) {
  const activeTickers = unique(
    Object.values(sectorResults).flatMap(result => result.filings.map(filing => filing.ticker)),
  );
  const topSectors = formatCountPreview(
    sortCountsDesc(
      countBy(
        Object.entries(sectorResults).flatMap(([sectorName, result]) => result.filings.map(() => sectorName)),
        value => value,
      ),
    ),
  );
  const topItems = formatCountPreview(
    sortCountsDesc(
      countBy(
        Object.values(sectorResults).flatMap(result => result.filings.flatMap(filing => filing.items ?? [])),
        item => item,
      ),
    ),
    item => formatItemLabel(item),
  );
  return `${totalFilings} filings across ${activeTickers.length} of ${totalCompanies} tracked companies in the last ${LOOKBACK_DAYS} days. Most active sectors: ${topSectors}. Top item mix: ${topItems}.`;
}

function buildCompactSignalSection(signals) {
  const itemPreview = formatCountPreview(
    sortCountsDesc(
      countBy(
        signals.map(signal => {
          const item = signal.message.match(/Item\s+(\d+\.\d+)/)?.[1];
          return item ? formatItemLabel(item) : signal.name;
        }),
        value => value,
      ),
    ),
  );
  return `${signals.length} tracked signal events in the last ${LOOKBACK_DAYS} days. Most common triggers: ${itemPreview}. Review the filing tables above for company-level detail.`;
}

function buildSignalFrontmatter(signals) {
  return sortCountsDesc(
    countBy(
      signals.map(signal => {
        const item = signal.message.match(/Item\s+(\d+\.\d+)/)?.[1];
        return item ? `Item ${item} - ${formatItemLabel(item)}` : signal.name;
      }),
      value => value,
    ),
  )
    .slice(0, 10)
    .map(([label, count]) => ({ label, count }));
}

export async function pull(flags = {}) {
  const outDir = join(getPullsDir(), 'Government');
  mkdirSync(outDir, { recursive: true });

  // Sector overview mode
  if (flags.sectors !== undefined) {
    const sectorArg = typeof flags.sectors === 'string' ? flags.sectors.toLowerCase() : null;
    const sectorName = sectorArg ? (SECTOR_ALIASES[sectorArg] ?? null) : null;
    if (sectorArg && !sectorName) {
      throw new Error(`Unknown sector "${sectorArg}". Options: ${Object.keys(SECTOR_ALIASES).join(', ')}`);
    }
    const sectorsToRun = sectorName
      ? { [sectorName]: SECTOR_COMPANIES[sectorName] }
      : SECTOR_COMPANIES;
    return pullSectorOverview(sectorsToRun, outDir);
  }

  // Thesis mode (default)
  let tickers = Object.keys(COMPANIES);
  if      (flags.drones)       tickers = tickers.filter(t => COMPANIES[t].thesis === 'drones');
  else if (flags.defense)      tickers = tickers.filter(t => COMPANIES[t].thesis === 'defense');
  else if (flags.amr)          tickers = tickers.filter(t => COMPANIES[t].thesis === 'amr');
  else if (flags.psychedelics) tickers = tickers.filter(t => COMPANIES[t].thesis === 'psychedelics');
  else if (flags.glp1)         tickers = tickers.filter(t => COMPANIES[t].thesis === 'glp1');
  else if (flags.geneediting)  tickers = tickers.filter(t => COMPANIES[t].thesis === 'geneediting');
  else if (flags.alzheimers)   tickers = tickers.filter(t => COMPANIES[t].thesis === 'alzheimers');
  else if (flags.longevity)    tickers = tickers.filter(t => COMPANIES[t].thesis === 'longevity');
  else if (flags.nuclear)      tickers = tickers.filter(t => COMPANIES[t].thesis === 'nuclear');
  else if (flags.storage)      tickers = tickers.filter(t => COMPANIES[t].thesis === 'storage');
  else if (flags.aipower)      tickers = tickers.filter(t => COMPANIES[t].thesis === 'aipower');
  else if (flags.humanoid)     tickers = tickers.filter(t => COMPANIES[t].thesis === 'humanoid');
  else if (flags.quantum)      tickers = tickers.filter(t => COMPANIES[t].thesis === 'quantum');
  else if (flags.semis)        tickers = tickers.filter(t => COMPANIES[t].thesis === 'semis');
  else if (flags.housing)      tickers = tickers.filter(t => COMPANIES[t].thesis === 'housing');
  else if (flags.hardmoney)    tickers = tickers.filter(t => COMPANIES[t].thesis === 'hardmoney');
  else if (flags.space)        tickers = tickers.filter(t => COMPANIES[t].thesis === 'space');
  else if (flags.hypersonics)  tickers = tickers.filter(t => COMPANIES[t].thesis === 'hypersonics');

  await pullThesisFilings(tickers, flags);
}

async function pullThesisFilings(tickers, flags) {
  const label = flags.drones ? 'Drones'
    : flags.defense ? 'Defense AI'
    : flags.amr ? 'AMR'
    : flags.psychedelics ? 'Psychedelics'
    : flags.glp1 ? 'GLP-1 Metabolic'
    : flags.geneediting ? 'Gene Editing'
    : flags.alzheimers ? 'Alzheimers'
    : flags.longevity ? 'Longevity'
    : flags.nuclear ? 'Nuclear / SMR'
    : flags.storage ? 'Grid Battery Storage'
    : flags.aipower ? 'AI Power Infrastructure'
    : flags.humanoid ? 'Humanoid Robotics'
    : flags.quantum ? 'Quantum Computing'
    : flags.semis ? 'Semiconductors'
    : flags.housing ? 'Housing'
    : flags.hardmoney ? 'Hard Money'
    : flags.space ? 'Space Domain'
    : flags.hypersonics ? 'Hypersonics'
    : 'All Theses';

  console.log(`\n📋 SEC EDGAR: Fetching 8-K filings for ${tickers.length} thesis companies (${label}, last ${LOOKBACK_DAYS}d)...`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - LOOKBACK_DAYS);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const allFilings = [];
  const signals = [];

  for (const ticker of tickers) {
    const company = COMPANIES[ticker];
    try {
      const filings = await fetchRecentFilings(ticker, company, cutoffStr);
      allFilings.push(...filings);

      if (filings.length > 0) {
        console.log(`  ✓ ${ticker} (${company.name}): ${filings.length} 8-K(s)`);
        filings.forEach(f => {
          const itemsNote = f.items.length > 0 ? ` [Items: ${f.items.join(', ')}]` : '';
          console.log(`    - ${f.filingDate}${itemsNote}: ${f.description || '8-K filing'}`);

          // Signal on key items — build full Signal shape with implications
          for (const item of f.items) {
            if (SIGNAL_ITEMS[item]) {
              const isWarning = item === '1.02' || item === '5.02';
              signals.push(Object.freeze({
                id:          `sec_${ticker}_${item}_${f.filingDate}`,
                name:        `${SIGNAL_ITEMS[item]} — ${ticker}`,
                domain:      'equities',
                severity:    isWarning ? 'watch' : 'watch',
                value:       null,
                threshold:   null,
                message:     `${ticker} 8-K Item ${item} — ${SIGNAL_ITEMS[item]} (${f.filingDate})`,
                implications: ITEM_IMPLICATIONS[item] ?? [`Review ${ticker} 8-K Item ${item} filing for materiality`],
                related_domains: ['government', 'equities'],
                source:      'SEC EDGAR',
              }));
            }
          }
        });
      } else {
        console.log(`  · ${ticker}: no 8-Ks in last ${LOOKBACK_DAYS}d`);
      }

      // EDGAR asks for 10 req/sec max — stay safe
      await sleep(120);
    } catch (err) {
      console.warn(`  ⚠️  ${ticker}: ${err.message}`);
    }
  }

  console.log(`\n  Total: ${allFilings.length} 8-K filing(s) across ${tickers.length} companies`);

  if (signals.length > 0) {
    console.log(`⚡ ${signals.length} signal(s):`);
    signals.forEach(s => console.log(`  ${s.severity === 'watch' ? '🟡' : 'ℹ️'} ${s.message}`));
  } else {
    console.log(`⚪ No signals — all clear.`);
  }

  // Sort by filing date desc
  allFilings.sort((a, b) => b.filingDate.localeCompare(a.filingDate));
  const tickerRows = buildTickerActivityRows(allFilings);
  const itemRows = buildItemMixRows(allFilings);

  const rows = allFilings.map(f => [
    f.ticker,
    COMPANIES[f.ticker]?.thesis ?? '—',
    f.filingDate,
    f.formType,
    f.items.join(', ') || '—',
    f.description?.slice(0, 50) || '—',
    `[EDGAR](${f.url})`,
  ]);

  const note = buildNote({
    frontmatter: {
      title:         `SEC EDGAR 8-K Filings — ${label}`,
      source:        'SEC EDGAR (data.sec.gov)',
      date_pulled:   today(),
      lookback_days: LOOKBACK_DAYS,
      total_filings: allFilings.length,
      companies:     tickers.length,
      domain:        'government',
      data_type:     '8k_filings',
      frequency:     'daily',
      signal_status: highestSeverity(signals),
      signal_count:  signals.length,
      signals:       buildSignalFrontmatter(signals),
      tags:          ['sec', 'edgar', '8k', 'filings', 'government'],
    },
    sections: [
      {
        heading: 'TL;DR',
        content: buildThesisSummary(tickers, allFilings),
      },
      ...(tickerRows.length > 0 ? [{
        heading: 'Most Active Tickers',
        content: buildTable(['Ticker', 'Thesis', 'Filings', 'Tracked Items'], tickerRows),
      }] : []),
      ...(itemRows.length > 0 ? [{
        heading: '8-K Item Mix',
        content: buildTable(['Item', 'Meaning', 'Count'], itemRows),
      }] : []),
      {
        heading: `8-K Filings — Last ${LOOKBACK_DAYS} Days (${allFilings.length} total)`,
        content: rows.length > 0
          ? buildTable(['Ticker', 'Thesis', 'Filed', 'Form', 'Items', 'Description', 'Link'], rows)
          : `No 8-K filings in the last ${LOOKBACK_DAYS} days for tracked companies.`,
      },
      ...(signals.length > 0 ? [{ heading: 'Signals', content: buildCompactSignalSection(signals) }] : []),
      {
        heading: '8-K Item Reference',
        content: Object.entries(SIGNAL_ITEMS).map(([k, v]) => `- **Item ${k}**: ${v}`).join('\n'),
      },
      {
        heading: 'About This Feed',
        content: [
          `- **Watchlist**: ${tickers.join(', ')}`,
          `- **API**: data.sec.gov/submissions (free, no key, 10 req/sec)`,
          `- **Auto-pulled**: ${today()}`,
          '',
          '> 8-K Item 1.01 (material contract) for defense companies often signals a DoD award',
          '> before USASpending.gov data is available — typically 1-5 business days earlier.',
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Government', dateStampedFilename('SEC_8K_Thesis'));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
}

// ─── Sector Overview Pull ─────────────────────────────────────────────────────

async function pullSectorOverview(sectors, outDir) {
  const sectorNames = Object.keys(sectors);
  const totalCompanies = Object.values(sectors).reduce((n, arr) => n + arr.length, 0);
  console.log(`\n🏢 SEC EDGAR Sector Overview: ${sectorNames.length} sectors, ${totalCompanies} companies (last ${LOOKBACK_DAYS}d)...`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - LOOKBACK_DAYS);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const allSignals = [];
  const sectorResults = {};

  for (const [sectorName, companies] of Object.entries(sectors)) {
    console.log(`\n  📂 ${sectorName}`);
    sectorResults[sectorName] = { companies: [], filings: [] };

    for (const co of companies) {
      const capIcon = co.cap === 'large' ? '🔵' : co.cap === 'mid' ? '🟡' : '🟢';
      try {
        const filings = await fetchRecentFilings(co.ticker, co, cutoffStr);
        sectorResults[sectorName].companies.push({ ...co, filings });

        if (filings.length > 0) {
          console.log(`    ${capIcon} ${co.ticker} (${co.cap}): ${filings.length} 8-K(s)`);
          filings.forEach(f => {
            console.log(`       ${f.filingDate} Items:${f.items.join(',') || '—'}`);
            sectorResults[sectorName].filings.push({ ...f, ticker: co.ticker, cap: co.cap, sector: sectorName });
            for (const item of f.items) {
              if (SIGNAL_ITEMS[item]) {
                const isWarning = item === '1.02' || item === '5.02';
                allSignals.push(Object.freeze({
                  id:           `sec_${co.ticker}_${item}_${f.filingDate}`,
                  name:         `${SIGNAL_ITEMS[item]} — ${co.ticker}`,
                  domain:       'equities',
                  severity:     isWarning ? 'watch' : 'watch',
                  value:        null, threshold: null,
                  message:      `[${sectorName}] ${co.ticker} (${co.cap}) — Item ${item}: ${SIGNAL_ITEMS[item]} (${f.filingDate})`,
                  implications: ITEM_IMPLICATIONS[item] ?? [],
                  related_domains: ['equities'],
                }));
              }
            }
          });
        } else {
          console.log(`    ${capIcon} ${co.ticker} (${co.cap}): quiet`);
        }
        await sleep(120);
      } catch (err) {
        console.warn(`    ⚠️  ${co.ticker}: ${err.message}`);
        sectorResults[sectorName].companies.push({ ...co, filings: [] });
      }
    }
  }

  // Build per-sector table sections
  const sections = [];
  for (const [sectorName, result] of Object.entries(sectorResults)) {
    const filings = result.filings.sort((a, b) => b.filingDate.localeCompare(a.filingDate));
    const rows = filings.map(f => [
      f.ticker,
      f.cap,
      f.filingDate,
      f.formType,
      f.items.join(', ') || '—',
      f.description?.slice(0, 45) || '—',
      `[EDGAR](${f.url})`,
    ]);

    // Coverage row — show quiet companies too
    const quietTickers = result.companies
      .filter(c => c.filings.length === 0)
      .map(c => `${c.ticker}(${c.cap[0].toUpperCase()})`)
      .join(', ');

    sections.push({
      heading: `${sectorName} (${filings.length} events)`,
      content: rows.length > 0
        ? buildTable(['Ticker', 'Cap', 'Filed', 'Form', 'Items', 'Description', 'Link'], rows)
          + (quietTickers ? `\n\n*Quiet (no 8-Ks): ${quietTickers}*` : '')
        : `*No 8-K filings in last ${LOOKBACK_DAYS} days.*\n*Monitored: ${result.companies.map(c => c.ticker).join(', ')}*`,
    });
  }

  const totalFilings = Object.values(sectorResults).reduce((n, r) => n + r.filings.length, 0);
  const combinedFilings = Object.values(sectorResults)
    .flatMap(result => result.filings)
    .sort((a, b) => b.filingDate.localeCompare(a.filingDate));
  const sectorRows = buildSectorSnapshotRows(sectorResults);
  const itemRows = buildItemMixRows(combinedFilings);
  const recentRows = buildRecentFilingRows(combinedFilings, { includeSector: true, includeCap: true });
  console.log(`\n  Total: ${totalFilings} 8-K(s) across ${sectorNames.length} sectors`);

  if (allSignals.length > 0) {
    console.log(`⚡ ${allSignals.length} signal(s):`);
    allSignals.forEach(s => console.log(`  🟡 ${s.message}`));
  } else {
    console.log(`⚪ No signals — all clear.`);
  }

  const label = sectorNames.length === Object.keys(SECTOR_COMPANIES).length
    ? 'All Sectors'
    : sectorNames.join(', ');

  const note = buildNote({
    frontmatter: {
      title:         `SEC EDGAR Sector Overview — ${label}`,
      source:        'SEC EDGAR (data.sec.gov)',
      date_pulled:   today(),
      lookback_days: LOOKBACK_DAYS,
      sectors:       sectorNames.length,
      companies:     totalCompanies,
      total_filings: totalFilings,
      domain:        'government',
      data_type:     '8k_sector_overview',
      frequency:     'daily',
      signal_status: highestSeverity(allSignals),
      signal_count:  allSignals.length,
      signals:       buildSignalFrontmatter(allSignals),
      tags:          ['sec', 'edgar', '8k', 'sectors', 'market-overview'],
    },
    sections: [
      {
        heading: 'TL;DR',
        content: buildSectorSummary(sectorResults, totalCompanies, totalFilings),
      },
      {
        heading: 'Sector Snapshot',
        content: buildTable(['Sector', 'Companies', 'Active Tickers', 'Filings', 'Top Items'], sectorRows),
      },
      ...(itemRows.length > 0 ? [{
        heading: '8-K Item Mix',
        content: buildTable(['Item', 'Meaning', 'Count'], itemRows),
      }] : []),
      {
        heading: `Recent Filings (${totalFilings})`,
        content: recentRows.length > 0
          ? buildTable(['Ticker', 'Sector', 'Cap', 'Filed', 'Form', 'Items', 'Description', 'Link'], recentRows)
          : `No 8-K filings in the last ${LOOKBACK_DAYS} days for the selected sector set.`,
      },
      ...sections,
      ...(allSignals.length > 0 ? [{ heading: 'All Signals', content: buildCompactSignalSection(allSignals) }] : []),
      {
        heading: 'Cap Legend',
        content: '- 🔵 **Large cap** (>$10B)  · 🟡 **Mid cap** ($2–10B)  · 🟢 **Small cap** (<$2B)',
      },
    ],
  });

  const filePath = join(outDir, dateStampedFilename('SEC_Sectors'));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
}

// ─── Thesis Filings Pull ──────────────────────────────────────────────────────

async function fetchRecentFilings(ticker, company, cutoffStr) {
  const url = `https://data.sec.gov/submissions/CIK${company.cik}.json`;
  const data = await getJson(url, {
    headers: { 'User-Agent': 'MyData-Vault/1.0 research@local.vault' },
  });

  const recent = data?.filings?.recent ?? {};
  const forms       = recent.form       ?? [];
  const dates       = recent.filingDate ?? [];
  const accessions  = recent.accessionNumber ?? [];
  const descriptions = recent.primaryDocument ?? [];
  const items       = recent.items ?? [];

  const filings = [];

  for (let i = 0; i < forms.length; i++) {
    if (forms[i] !== '8-K' && forms[i] !== '8-K/A') continue;
    if (dates[i] < cutoffStr) break; // sorted newest-first, so safe to break
    const accNum = accessions[i]?.replace(/-/g, '') ?? '';
    const cikNum = company.cik.replace(/^0+/, '');
    filings.push(Object.freeze({
      ticker,
      formType:    forms[i],
      filingDate:  dates[i],
      description: descriptions[i] ?? '',
      items:       parseItems(items[i] ?? ''),
      url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cikNum}&type=8-K&dateb=&owner=include&count=5`,
    }));
  }

  return filings;
}

/** Parse the items string "1.01,2.02" → ["1.01", "2.02"] */
function parseItems(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
