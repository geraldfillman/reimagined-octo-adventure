/**
 * dd-report.mjs — Tool #4: One-Click Due Diligence Report.
 *
 * Pulls everything we know about a ticker into one note: dilution risk,
 * IPO + ownership, float evolution, insider/short/news, recent filings.
 * Composes existing helpers — does NOT re-implement fetches.
 *
 * Usage:
 *   node run.mjs pull dd-report --ticker NVDA
 *   node run.mjs pull dd-report --ticker SAVA --lookback 180
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename, formatNumber } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { highestSeverity } from '../lib/signals.mjs';
import { getByTicker } from '../lib/cik-map.mjs';
import {
  fetchRecentFilings, fetchCompanyFacts, latestConceptValue,
  FORM_GROUPS,
} from '../lib/edgar.mjs';
import {
  fetchBalanceSheetQuarterly, fetchCashFlowQuarterly, fetchSharesFloat,
  fetchQuote, fetchProfile, fetchInsiderTrades, fetchShortInterest, fetchStockNews,
} from '../lib/fmp-client.mjs';
import {
  computeCashRunway, computeShelfCapacity, computeAtmToFloat,
  classifyOverallRisk, evaluateDilutionSignals,
} from '../lib/dilution-rules.mjs';

export async function pull(flags = {}) {
  const ticker = String(flags.ticker || '').toUpperCase();
  if (!ticker) throw new Error('--ticker is required. Example: --ticker NVDA');

  const meta = getByTicker(ticker);
  if (!meta?.cik) throw new Error(`No CIK found for ${ticker} in lib/cik-map.mjs`);

  const lookbackDays = Math.max(30, Number(flags.lookback) || 180);
  const since = daysAgo(lookbackDays);

  console.log(`🔎 DD Report: building for ${ticker} (lookback ${lookbackDays}d)...`);

  const [profile, quote, balance, cashflow, floatData, insiders, short, news, filings, facts] = await Promise.all([
    fetchProfile(ticker).catch(() => null),
    fetchQuote(ticker).catch(() => null),
    fetchBalanceSheetQuarterly(ticker, { limit: 8 }).catch(() => []),
    fetchCashFlowQuarterly(ticker, { limit: 8 }).catch(() => []),
    fetchSharesFloat(ticker).catch(() => null),
    fetchInsiderTrades(ticker, { limit: 15 }).catch(() => []),
    fetchShortInterest(ticker).catch(() => null),
    fetchStockNews(ticker, { limit: 10 }).catch(() => []),
    fetchRecentFilings(meta.cik, { since, limit: 50 }).catch(() => []),
    fetchCompanyFacts(meta.cik).catch(() => null),
  ]);

  // ── Dilution metrics ──────────────────────────────────────────────────────
  const cash = Number(balance[0]?.cashAndCashEquivalents ?? 0);
  const sti  = Number(balance[0]?.shortTermInvestments ?? 0);
  const qOps = cashflow.map(q => Number(q.operatingCashFlow ?? q.netCashProvidedByOperatingActivities ?? 0)).filter(Number.isFinite);
  const cashRunwayMonths = computeCashRunway({ cash, shortTermInvestments: sti, quarterlyOperatingCashFlow: qOps.slice(0, 4) });
  const shelfMaxUsd = latestConceptValue(facts, ['MaximumAggregateOfferingPrice', 'ShelfRegistrationMaximumOfferingAmount'])?.value ?? 0;
  const shelfHeadroomUsd = computeShelfCapacity({ shelfMaxUsd, takedowns: [], today: today() });
  const atmToFloat = computeAtmToFloat({
    atmCapacityUsd: shelfMaxUsd,
    floatShares: Number(floatData?.floatShares ?? floatData?.freeFloat ?? 0),
    price: Number(quote?.price ?? 0),
  });
  const nasdaqCompliant = !filings.some(f => f.formType.startsWith('8-K') && f.items?.includes('3.01'));
  const overallRisk = classifyOverallRisk({ cashRunwayMonths, atmToFloat, nasdaqCompliant });
  const dilutionSignals = evaluateDilutionSignals({
    cashRunwayMonths, atmToFloat, shelfHeadroomUsd,
    newShelfEffective: filings.some(f => FORM_GROUPS.SHELF.includes(f.formType)),
    nasdaqCompliant,
    unregisteredSaleInLast30d: filings.some(f => f.formType.startsWith('8-K') && f.items?.includes('3.02') && daysBetween(f.filingDate, today()) <= 30),
  });

  // ── Float evolution (from XBRL EntityCommonStockSharesOutstanding) ───────
  const sharesHistory = extractSharesHistory(facts);

  // ── Build sections ────────────────────────────────────────────────────────
  const sections = [
    {
      heading: 'Snapshot',
      content: buildTable(
        ['Field', 'Value'],
        [
          ['Company',            profile?.companyName ?? meta.name ?? ticker],
          ['Exchange',           profile?.exchangeShortName ?? profile?.exchange ?? '—'],
          ['Sector / Industry',  `${profile?.sector ?? '—'} / ${profile?.industry ?? '—'}`],
          ['Country',            profile?.country ?? '—'],
          ['IPO Date',           profile?.ipoDate ?? '—'],
          ['Price',              quote?.price ? `$${Number(quote.price).toFixed(2)}` : '—'],
          ['Market Cap',         fmtUsd(Number(quote?.marketCap ?? profile?.mktCap ?? 0))],
          ['Float',              formatNumber(Number(floatData?.floatShares ?? floatData?.freeFloat ?? 0), { style: 'compact' })],
          ['Shares Outstanding', formatNumber(Number(floatData?.outstandingShares ?? 0), { style: 'compact' })],
          ['Short % of Float',   short?.shortPercentOfFloat ? `${Number(short.shortPercentOfFloat).toFixed(1)}%` : '—'],
          ['CIK',                meta.cik],
        ],
      ),
    },
    {
      heading: 'Dilution Risk',
      content: [
        buildTable(
          ['Metric', 'Value'],
          [
            ['Overall Risk',          `${severityIcon(overallRisk)} ${overallRisk}`],
            ['Cash Runway (months)',  fmtMonths(cashRunwayMonths)],
            ['Shelf Max (USD)',       fmtUsd(shelfMaxUsd)],
            ['Shelf Headroom (USD)',  fmtUsd(shelfHeadroomUsd)],
            ['ATM / Float (MV)',      atmToFloat == null ? '—' : `${(atmToFloat * 100).toFixed(0)}%`],
            ['Nasdaq Compliant',      nasdaqCompliant ? '✅' : '⚠️ No'],
          ],
        ),
        '',
        dilutionSignals.length
          ? '**Active triggers:**\n' + dilutionSignals.map(s => `- **[${s.severity.toUpperCase()}] ${s.code}** — ${s.message}`).join('\n')
          : '_No active dilution triggers._',
      ].join('\n'),
    },
    {
      heading: 'Float Evolution',
      content: sharesHistory.length
        ? buildTable(['Period End', 'Shares Outstanding'], sharesHistory.slice(0, 8).map(r => [r.end, formatNumber(r.value, { style: 'compact' })]))
        : '_No XBRL shares-outstanding history available (common for micro caps)._',
    },
    {
      heading: 'Recent Filings',
      content: buildTable(
        ['Date', 'Form', 'Items', 'Primary Doc'],
        filings.slice(0, 15).map(f => [
          f.filingDate, f.formType, (f.items ?? []).join(',') || '—', f.primaryDoc || '—',
        ]),
      ),
    },
    {
      heading: 'Insider Transactions (last 15)',
      content: insiders.length
        ? buildTable(
            ['Date', 'Insider', 'Type', 'Shares', 'Price'],
            insiders.slice(0, 15).map(t => [
              t.transactionDate ?? t.filingDate ?? '—',
              t.reportingName ?? t.insiderName ?? '—',
              t.transactionType ?? '—',
              formatNumber(Number(t.securitiesTransacted ?? 0), { style: 'compact' }),
              t.price ? `$${Number(t.price).toFixed(2)}` : '—',
            ]),
          )
        : '_No recent insider transactions on file._',
    },
    {
      heading: 'Short Interest',
      content: short
        ? buildTable(
            ['Field', 'Value'],
            [
              ['Settlement Date',         short.settlementDate ?? '—'],
              ['Short Interest',          formatNumber(Number(short.shortInterest ?? 0), { style: 'compact' })],
              ['Avg Daily Volume',        formatNumber(Number(short.avgDailyVolume ?? 0), { style: 'compact' })],
              ['Days to Cover',           short.daysToCover ?? '—'],
              ['Short % of Float',        short.shortPercentOfFloat ? `${Number(short.shortPercentOfFloat).toFixed(1)}%` : '—'],
            ],
          )
        : '_No FMP short-interest data available._',
    },
    {
      heading: 'News (last 10)',
      content: news.length
        ? news.slice(0, 10).map(n => `- **${(n.publishedDate ?? '').slice(0, 10)}** — [${n.title}](${n.url ?? '#'}) _(${n.site ?? n.source ?? 'unknown'})_`).join('\n')
        : '_No recent news in FMP feed._',
    },
  ];

  const signalStatus = highestSeverity(dilutionSignals);
  const filePath = join(getPullsDir(), 'Fundamentals', dateStampedFilename(`DD_${ticker}`));
  const content = buildNote({
    frontmatter: {
      title:         `DD Report — ${ticker}`,
      source:        'SEC EDGAR + FMP Premium',
      date_pulled:   today(),
      ticker,
      company:       profile?.companyName ?? meta.name ?? ticker,
      domain:        'fundamentals',
      data_type:     'dd_report',
      signal_status: signalStatus,
      signals:       dilutionSignals.map(s => s.code),
      overall_risk:  overallRisk,
      tags: ['dd', 'fundamentals', 'dilution', ticker.toLowerCase()],
    },
    sections,
  });

  writeNote(filePath, content);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: dilutionSignals.map(s => s.code) };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractSharesHistory(facts) {
  if (!facts?.facts) return [];
  const concept = facts.facts?.['dei']?.['EntityCommonStockSharesOutstanding']?.units?.['shares']
              ?? facts.facts?.['us-gaap']?.['CommonStockSharesOutstanding']?.units?.['shares'];
  if (!Array.isArray(concept)) return [];
  const byEnd = new Map();
  for (const u of concept) byEnd.set(u.end, { end: u.end, value: Number(u.val) });
  return [...byEnd.values()].sort((a, b) => (b.end > a.end ? 1 : -1));
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (24 * 3600 * 1000));
}

function fmtUsd(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtMonths(m) {
  if (m == null) return '—';
  if (!Number.isFinite(m)) return '∞';
  return `${m.toFixed(1)}mo`;
}

function severityIcon(risk) {
  return { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }[risk] ?? '⚪';
}
