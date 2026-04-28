/**
 * dilution-monitor.mjs — Tool #1: Dilution Risk Monitor.
 *
 * Reads a watchlist of tickers, pulls fresh SEC filings + FMP fundamentals,
 * computes runway / shelf-capacity / ATM-to-float metrics via the
 * lib/dilution-rules.mjs rule engine, and writes:
 *
 *   - 05_Data_Pulls/Fundamentals/YYYY-MM-DD_Dilution_Monitor.md  (batch table)
 *   - 06_Signals/YYYY-MM-DD_DILUTION_{TICKER}.md                 (per alert)
 *
 * Only tickers that cross a threshold OR transition upward in risk class
 * get a dedicated signal note. State is kept in scripts/.cache/dilution-state.json
 * so follow-up runs are incremental.
 *
 * Usage:
 *   node run.mjs pull dilution-monitor
 *   node run.mjs pull dilution-monitor --tickers KTOS,AVAV,RCAT
 *   node run.mjs pull dilution-monitor --thesis drones
 *   node run.mjs pull dilution-monitor --dry-run
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getVaultRoot, getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename, formatNumber } from '../lib/markdown.mjs';
import { parseFrontmatter } from '../lib/frontmatter.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { highestSeverity } from '../lib/signals.mjs';
import {
  getByTicker, getThesisTickers, getAllTickers,
} from '../lib/cik-map.mjs';
import {
  fetchRecentFilings, fetchCompanyFacts, latestConceptValue,
  FORM_GROUPS, OFFERING_8K_ITEMS, isShelfRegistration, isProspectusSupplement,
} from '../lib/edgar.mjs';
import {
  fetchBalanceSheetQuarterly, fetchCashFlowQuarterly, fetchSharesFloat, fetchQuote,
} from '../lib/fmp-client.mjs';
import {
  computeCashRunway, computeShelfCapacity, computeAtmToFloat,
  classifyOverallRisk, evaluateDilutionSignals, detectStateTransitions,
} from '../lib/dilution-rules.mjs';
import {
  loadState, saveState, upsertTicker, isNewAccession, priorRiskClass,
} from '../lib/dilution-state.mjs';

const LOOKBACK_DAYS = 90;

export async function pull(flags = {}) {
  const tickers = resolveWatchlist(flags);
  if (tickers.length === 0) {
    console.log('⚠️  No tickers resolved — check --tickers or --thesis flag');
    return { filePath: null, signals: [] };
  }

  console.log(`🔍 Dilution Monitor: scoring ${tickers.length} ticker(s)...`);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const state = loadState();
  const rows = [];
  const signalNotes = [];
  let newState = state;

  for (const ticker of tickers) {
    try {
      const r = await scoreTicker(ticker, cutoffStr);
      rows.push(r);
      if (flags['dry-run']) continue;

      const transition = detectStateTransitions({
        prior: priorRiskClass(state, ticker),
        current: r.metrics.overallRisk,
      });
      const allSignals = transition ? [...r.signals, transition] : r.signals;
      const batchSev = highestSeverity(allSignals);
      const newestAccession = r.latestFilings[0]?.accession ?? null;
      const hasNewFiling = newestAccession && isNewAccession(state, ticker, newestAccession);

      if (batchSev === 'critical' || batchSev === 'alert' || (transition && hasNewFiling)) {
        const signalPath = writeSignalNote(ticker, r, allSignals, batchSev);
        signalNotes.push(signalPath);
        newState = upsertTicker(newState, ticker, {
          lastAccession: newestAccession,
          lastRiskClass: r.metrics.overallRisk,
          lastRunAt: new Date().toISOString(),
          lastSignalPath: signalPath,
        });
      } else {
        newState = upsertTicker(newState, ticker, {
          lastAccession: newestAccession ?? state[ticker]?.lastAccession,
          lastRiskClass: r.metrics.overallRisk,
          lastRunAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`  ⚠️  ${ticker}: ${err.message}`);
      rows.push({ ticker, error: err.message, metrics: {}, signals: [], latestFilings: [] });
    }
  }

  const batchPath = writeBatchNote(rows);
  if (!flags['dry-run']) saveState(newState);

  console.log(`📝 Wrote batch: ${batchPath}`);
  for (const p of signalNotes) console.log(`🚨 Signal:   ${p}`);
  return { filePath: batchPath, signals: signalNotes };
}

// ─── Scoring a single ticker ─────────────────────────────────────────────────

async function scoreTicker(ticker, cutoffStr) {
  const meta = getByTicker(ticker);
  if (!meta?.cik) throw new Error(`no CIK mapping for ${ticker} — add to lib/cik-map.mjs`);

  // 1. EDGAR: recent filings of interest.
  const interesting = [
    ...FORM_GROUPS.SHELF, ...FORM_GROUPS.PROSPECTUS,
    '8-K', '8-K/A', '10-Q', '10-Q/A',
  ];
  const filings = await fetchRecentFilings(meta.cik, {
    formTypes: interesting, since: cutoffStr, limit: 100,
  });

  const newShelfEffective = filings.some(f => isShelfRegistration(f.formType));
  const takedownProceeds = filings
    .filter(f => isProspectusSupplement(f.formType))
    .map(f => ({ proceedsUsd: 0, date: f.filingDate })); // proceeds not in EDGAR submissions feed; see comment below
  const unregisteredSaleInLast30d = filings.some(f =>
    f.formType.startsWith('8-K') &&
    f.items?.includes(OFFERING_8K_ITEMS.UNREGISTERED_SALE) &&
    daysBetween(f.filingDate, todayStr()) <= 30
  );
  const nasdaqCompliant = !filings.some(f =>
    f.formType.startsWith('8-K') && f.items?.includes(OFFERING_8K_ITEMS.NASDAQ_DELISTING)
  );

  // 2. XBRL: shelf max, cash position fallback.
  const facts = await fetchCompanyFacts(meta.cik);
  const shelfMaxUsd = latestConceptValue(facts, [
    'MaximumAggregateOfferingPrice',
    'ShelfRegistrationMaximumOfferingAmount',
  ])?.value ?? 0;

  // 3. FMP: balance sheet + cash flow.
  const [balance, cashflow, floatData, quote] = await Promise.all([
    fetchBalanceSheetQuarterly(ticker, { limit: 4 }),
    fetchCashFlowQuarterly(ticker, { limit: 4 }),
    fetchSharesFloat(ticker).catch(() => null),
    fetchQuote(ticker).catch(() => null),
  ]);

  const cash = Number(balance[0]?.cashAndCashEquivalents ?? balance[0]?.cashAndShortTermInvestments ?? 0);
  const shortTermInvestments = Number(balance[0]?.shortTermInvestments ?? 0);
  const quarterlyOperatingCashFlow = cashflow
    .map(q => Number(q.operatingCashFlow ?? q.netCashProvidedByOperatingActivities ?? 0))
    .filter(Number.isFinite);

  const price = Number(quote?.price ?? 0);
  const floatShares = Number(floatData?.floatShares ?? floatData?.freeFloat ?? 0);
  const atmCapacityUsd = shelfMaxUsd; // conservative: full shelf could flow through ATM

  // 4. Rule engine — fully pure.
  const cashRunwayMonths  = computeCashRunway({ cash, shortTermInvestments, quarterlyOperatingCashFlow });
  const shelfHeadroomUsd  = computeShelfCapacity({ shelfMaxUsd, takedowns: takedownProceeds, today: todayStr() });
  const atmToFloat        = computeAtmToFloat({ atmCapacityUsd, floatShares, price });
  const overallRisk       = classifyOverallRisk({ cashRunwayMonths, atmToFloat, nasdaqCompliant });

  const signals = evaluateDilutionSignals({
    cashRunwayMonths, atmToFloat, shelfHeadroomUsd,
    newShelfEffective, nasdaqCompliant, unregisteredSaleInLast30d,
  });

  return {
    ticker,
    company: meta.name,
    thesis: meta.thesis,
    metrics: {
      cash, shortTermInvestments, price, floatShares,
      cashRunwayMonths, shelfMaxUsd, shelfHeadroomUsd, atmToFloat,
      nasdaqCompliant, overallRisk,
    },
    signals,
    latestFilings: filings.slice(0, 5),
  };
}

// ─── Note writers ────────────────────────────────────────────────────────────

function writeBatchNote(rows) {
  const outDir = join(getPullsDir(), 'Fundamentals');
  const filePath = join(outDir, dateStampedFilename('Dilution_Monitor'));

  const tableRows = rows.map(r => {
    if (r.error) return [r.ticker, '—', '—', '—', '—', '⚠️', `error: ${r.error}`];
    const m = r.metrics;
    return [
      r.ticker,
      r.thesis ?? '—',
      fmtMonths(m.cashRunwayMonths),
      fmtUsd(m.shelfHeadroomUsd),
      m.atmToFloat == null ? '—' : `${(m.atmToFloat * 100).toFixed(0)}%`,
      severityIcon(m.overallRisk),
      r.signals.length ? r.signals.map(s => s.code).join(', ') : '—',
    ];
  });

  const allSignals = rows.flatMap(r => r.signals);
  const batchSev = highestSeverity(allSignals);

  const content = buildNote({
    frontmatter: {
      title:         'Dilution Monitor',
      source:        'SEC EDGAR + FMP Premium',
      date_pulled:   today(),
      domain:        'fundamentals',
      data_type:     'batch_scan',
      frequency:     'on_demand',
      signal_status: batchSev,
      signals:       allSignals.map(s => s.code),
      tags:          ['dilution', 'sec', 'fmp', 'company-risk', 'fundamentals'],
    },
    sections: [
      { heading: 'Dilution Risk Scorecard',
        content: buildTable(
          ['Ticker','Thesis','Runway','Shelf Room','ATM/Float','Risk','Triggers'],
          tableRows,
        ),
      },
      { heading: 'Methodology',
        content: [
          '- **Cash runway** = (cash + short-term investments) / avg quarterly operating burn, expressed in months.',
          '- **Shelf room** = MaximumAggregateOfferingPrice (EDGAR XBRL) − 424B takedowns in the last 24 months.',
          '- **ATM/Float** = currently-effective shelf capacity ÷ float market value.',
          `- **Risk**: 🟢 low · 🟡 medium · 🟠 high · 🔴 critical (thresholds in \`scripts/lib/dilution-rules.mjs\`).`,
          `- **Lookback**: ${LOOKBACK_DAYS} days of EDGAR filings per ticker.`,
        ].join('\n'),
      },
      { heading: 'Sources',
        content: [
          '- **SEC EDGAR** submissions + XBRL company-facts (free, no key).',
          '- **FMP Premium** balance-sheet-statement, cash-flow-statement, shares-float, quote.',
        ].join('\n'),
      },
    ],
  });

  writeNote(filePath, content);
  setProperties(filePath, { signal_status: batchSev, date_pulled: today() });
  return filePath;
}

function writeSignalNote(ticker, r, allSignals, severity) {
  const outDir = getSignalsDir();
  const fileName = `${today()}_DILUTION_${ticker}.md`;
  const filePath = join(outDir, fileName);
  const m = r.metrics;

  const filingsTable = buildTable(
    ['Date', 'Form', 'Items', 'Accession'],
    r.latestFilings.map(f => [f.filingDate, f.formType, (f.items ?? []).join(',') || '—', f.accessionRaw]),
  );

  const content = buildNote({
    frontmatter: {
      title:         `Dilution Alert — ${ticker}`,
      node_type:     'signal',
      source:        'SEC EDGAR + FMP Premium',
      date_pulled:   today(),
      ticker,
      company:       r.company,
      thesis:        r.thesis ?? null,
      domain:        'fundamentals',
      data_type:     'signal',
      signal_status: severity,
      signals:       allSignals.map(s => s.code),
      overall_risk:  m.overallRisk,
      cash_runway_months: m.cashRunwayMonths === Infinity ? null : roundOrNull(m.cashRunwayMonths, 1),
      shelf_headroom_usd: roundOrNull(m.shelfHeadroomUsd, 0),
      atm_to_float:  roundOrNull(m.atmToFloat, 2),
      nasdaq_compliant: m.nasdaqCompliant,
      tags: ['signal', 'dilution', ticker.toLowerCase()],
    },
    sections: [
      { heading: 'Triggers',
        content: allSignals.map(s => `- **[${s.severity.toUpperCase()}] ${s.code}** — ${s.message}`).join('\n') || '_(no active triggers)_',
      },
      { heading: 'Key Metrics',
        content: buildTable(
          ['Metric','Value'],
          [
            ['Overall Risk', `${severityIcon(m.overallRisk)} ${m.overallRisk}`],
            ['Cash Runway (months)', fmtMonths(m.cashRunwayMonths)],
            ['Shelf Max (USD)', fmtUsd(m.shelfMaxUsd)],
            ['Shelf Headroom (USD)', fmtUsd(m.shelfHeadroomUsd)],
            ['ATM / Float (market value)', m.atmToFloat == null ? '—' : `${(m.atmToFloat * 100).toFixed(0)}%`],
            ['Float Shares', formatNumber(m.floatShares, { style: 'compact' })],
            ['Price', m.price ? `$${m.price.toFixed(2)}` : '—'],
            ['Nasdaq Compliant', m.nasdaqCompliant ? '✅' : '⚠️ No'],
          ],
        ),
      },
      { heading: 'Recent Filings', content: filingsTable },
      { heading: 'Next Steps',
        content: [
          '- Verify shelf effective status on [EDGAR company page](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany).',
          '- Check for any 8-K Item 8.01 press releases announcing an imminent raise.',
          '- If long: review position sizing against worst-case offering discount.',
        ].join('\n'),
      },
    ],
  });

  writeNote(filePath, content);
  setProperties(filePath, { signal_status: severity, date_pulled: today() });
  return filePath;
}

// ─── Watchlist resolution ───────────────────────────────────────────────────

function resolveWatchlist(flags) {
  if (flags.tickers) {
    return String(flags.tickers).split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  }
  if (flags.thesis) {
    const tickers = getThesisTickers(String(flags.thesis).toLowerCase());
    if (tickers.length > 0) return tickers;
  }

  const stocksDir = join(getVaultRoot(), '08_Entities', 'Stocks');
  try {
    const files = readdirSync(stocksDir).filter(f => f.endsWith('.md'));
    const active = [];
    for (const f of files) {
      const ticker = f.replace(/\.md$/, '').replace(/_/g, '-');
      const meta = getByTicker(ticker);
      if (!meta?.cik) continue;
      try {
        const content = readFileSync(join(stocksDir, f), 'utf-8');
        const fm = parseFrontmatter(content).data ?? {};
        const status = String(fm.status ?? '').toLowerCase();
        if (status === '' || status === 'active') active.push(ticker);
      } catch {
        active.push(ticker);
      }
    }
    if (active.length > 0) return active;
  } catch {
    // fall through
  }

  return getAllTickers();
}

// ─── Formatting helpers ─────────────────────────────────────────────────────

function fmtMonths(m) {
  if (m == null) return '—';
  if (!Number.isFinite(m)) return '∞';
  return `${m.toFixed(1)}mo`;
}

function fmtUsd(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function severityIcon(risk) {
  return { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }[risk] ?? '⚪';
}

function roundOrNull(n, decimals) {
  if (n == null || !Number.isFinite(n)) return null;
  const p = Math.pow(10, decimals);
  return Math.round(n * p) / p;
}

function todayStr() { return today(); }

function daysBetween(a, b) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (24 * 3600 * 1000));
}
