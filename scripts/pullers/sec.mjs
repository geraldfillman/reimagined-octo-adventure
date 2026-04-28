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
import { sleep } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { highestSeverity } from '../lib/signals.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import {
  THESIS_COMPANIES as COMPANIES,
  SECTOR_COMPANIES,
  SECTOR_ALIASES,
} from '../lib/cik-map.mjs';
import { fetchRecentFilings as edgarFetchRecentFilings } from '../lib/edgar.mjs';




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

  return pullThesisFilings(tickers, flags);
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
  setProperties(filePath, { signal_status: highestSeverity(signals), date_pulled: today() });
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
  setProperties(filePath, { signal_status: highestSeverity(allSignals), date_pulled: today() });
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: allSignals };
}

// ─── Thesis Filings Pull ──────────────────────────────────────────────────────

/** Legacy-signature wrapper over lib/edgar.fetchRecentFilings. */
async function fetchRecentFilings(ticker, company, cutoffStr) {
  const filings = await edgarFetchRecentFilings(company.cik, {
    formTypes: ['8-K', '8-K/A'], since: cutoffStr, limit: 50,
  });
  return filings.map(f => Object.freeze({
    ticker,
    formType:    f.formType,
    filingDate:  f.filingDate,
    description: f.primaryDoc,
    items:       f.items,
    url:         f.url,
  }));
}

/** Parse the items string "1.01,2.02" → ["1.01", "2.02"] */
