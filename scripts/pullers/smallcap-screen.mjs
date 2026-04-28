/**
 * smallcap-screen.mjs — Tool #5: Small-Cap Edge Screener.
 *
 * FMP company-screener with sensible small-cap defaults, then enriches each
 * hit with float + short-interest + recent SEC filing flags. Good for
 * finding setups that look like:
 *   - low float (< 30M)
 *   - high short interest (> 15%)
 *   - recent S-1 / 424B (pending offering risk) or absence (clean tape)
 *   - price > $1 (Nasdaq bid-test)
 *
 * Usage:
 *   node run.mjs pull smallcap-screen
 *   node run.mjs pull smallcap-screen --float-max 30M --short-min 15 --no-offerings
 *   node run.mjs pull smallcap-screen --market-cap-max 500M --limit 40
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename, formatNumber } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import {
  screenStocks, fetchSharesFloat, fetchShortInterest,
} from '../lib/fmp-client.mjs';
import {
  fetchRecentFilings, fetchTickerMap, FORM_GROUPS,
} from '../lib/edgar.mjs';

const DEFAULTS = Object.freeze({
  marketCapMin:    50_000_000,
  marketCapMax:    2_000_000_000,
  priceMin:        1,
  volumeMin:       100_000,
  limit:           40,
  floatMax:        Infinity,
  shortMin:        0,
});

export async function pull(flags = {}) {
  const params = {
    marketCapMoreThan: Number(parseSize(flags['market-cap-min'])) || DEFAULTS.marketCapMin,
    marketCapLowerThan: Number(parseSize(flags['market-cap-max'])) || DEFAULTS.marketCapMax,
    priceMoreThan:     Number(flags['price-min']) || DEFAULTS.priceMin,
    volumeMoreThan:    Number(parseSize(flags['volume-min'])) || DEFAULTS.volumeMin,
    country:           flags.country ?? 'US',
    isActivelyTrading: 'true',
    limit:             Number(flags.limit) || DEFAULTS.limit,
  };

  const floatMax = Number(parseSize(flags['float-max'])) || DEFAULTS.floatMax;
  const shortMin = Number(flags['short-min']) || DEFAULTS.shortMin;
  const noOfferings = Boolean(flags['no-offerings']);

  console.log(`🔍 Small-Cap Screener: cap $${fmtCompact(params.marketCapMoreThan)}–${fmtCompact(params.marketCapLowerThan)}, limit ${params.limit}...`);

  const base = await screenStocks(params);
  console.log(`  ${base.length} tickers from FMP screener — enriching...`);

  const tickerMap = await fetchTickerMap().catch(() => new Map());
  const enriched = [];
  const cutoff = daysAgo(30);

  for (const row of base.slice(0, params.limit)) {
    const ticker = String(row.symbol ?? '').toUpperCase();
    if (!ticker) continue;

    const [floatData, shortData] = await Promise.all([
      fetchSharesFloat(ticker).catch(() => null),
      fetchShortInterest(ticker).catch(() => null),
    ]);

    const floatShares = Number(floatData?.floatShares ?? floatData?.freeFloat ?? 0);
    const shortPct    = Number(shortData?.shortPercentOfFloat ?? 0);

    if (floatShares && floatShares > floatMax) continue;
    if (shortPct < shortMin) continue;

    let hasOfferingLast30d = null;
    const cik = tickerMap.get(ticker)?.cik;
    if (cik) {
      try {
        const filings = await fetchRecentFilings(cik, {
          formTypes: [...FORM_GROUPS.SHELF, ...FORM_GROUPS.PROSPECTUS],
          since: cutoff, limit: 10,
        });
        hasOfferingLast30d = filings.length > 0;
      } catch {
        hasOfferingLast30d = null;
      }
    }

    if (noOfferings && hasOfferingLast30d === true) continue;

    enriched.push({
      ticker,
      name: row.companyName ?? '—',
      sector: row.sector ?? '—',
      price: Number(row.price ?? 0),
      marketCap: Number(row.marketCap ?? 0),
      volume: Number(row.volume ?? 0),
      floatShares,
      shortPct,
      hasOfferingLast30d,
    });
  }

  // Rank: lower float + higher short% = more squeeze potential
  enriched.sort((a, b) => {
    const scoreA = (a.shortPct || 0) - (a.floatShares || 0) / 1e9;
    const scoreB = (b.shortPct || 0) - (b.floatShares || 0) / 1e9;
    return scoreB - scoreA;
  });

  const tableRows = enriched.map(e => [
    e.ticker,
    e.name,
    e.sector,
    `$${e.price.toFixed(2)}`,
    fmtCompact(e.marketCap),
    formatNumber(e.volume, { style: 'compact' }),
    formatNumber(e.floatShares, { style: 'compact' }) || '—',
    e.shortPct ? `${e.shortPct.toFixed(1)}%` : '—',
    e.hasOfferingLast30d === null ? '?' : e.hasOfferingLast30d ? '⚠️ yes' : '✅ clean',
  ]);

  const signalStatus = enriched.length > 0 ? 'watch' : 'clear';

  const filePath = join(getPullsDir(), 'Fundamentals', dateStampedFilename('SmallCap_Screen'));
  const content = buildNote({
    frontmatter: {
      title:         'Small-Cap Edge Screener',
      source:        'FMP Premium + SEC EDGAR',
      date_pulled:   today(),
      domain:        'fundamentals',
      data_type:     'screener',
      frequency:     'on_demand',
      signal_status: signalStatus,
      signals:       enriched.length ? ['smallcap_setups'] : [],
      total_hits:    enriched.length,
      filters: {
        marketCapMin: params.marketCapMoreThan,
        marketCapMax: params.marketCapLowerThan,
        priceMin:     params.priceMoreThan,
        volumeMin:    params.volumeMoreThan,
        floatMax:     floatMax === Infinity ? null : floatMax,
        shortMin,
        noOfferings,
      },
      tags: ['screener', 'smallcap', 'fmp', 'sec'],
    },
    sections: [
      {
        heading: `Matches — ${enriched.length}`,
        content: tableRows.length
          ? buildTable(['Ticker', 'Name', 'Sector', 'Price', 'Mkt Cap', 'Volume', 'Float', 'Short %', 'Offering 30d'], tableRows)
          : '_No tickers matched the filter combination. Loosen float/short thresholds or widen the market-cap band._',
      },
      {
        heading: 'How to Read',
        content: [
          '- **Offering 30d = ⚠️ yes** means a shelf/prospectus filing hit EDGAR in the last 30 days — **expect dilution pressure**, not clean setup.',
          '- **✅ clean** means no S-1/S-3/F-*/424B* on file in the window — safer for squeeze setups.',
          '- **?** means we couldn\'t resolve a CIK via the SEC ticker map; usually foreign or recently-listed.',
          '- Rank = short % minus a float-size penalty. Tune via source ordering when finer control needed.',
        ].join('\n'),
      },
      {
        heading: 'Source',
        content: [
          '- **FMP Premium** `/stable/company-screener` — market-cap / price / volume filters.',
          '- **FMP Premium** `/stable/shares-float` and `/stable/short-interest` — float + short.',
          '- **SEC EDGAR** `/submissions/` — recent offering-related filings.',
        ].join('\n'),
      },
    ],
  });

  writeNote(filePath, content);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`📝 Wrote: ${filePath} (${enriched.length} matches)`);
  return { filePath, signals: enriched.length ? ['smallcap_setups'] : [] };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse size strings like '500M', '2B', '30m' → integer. */
function parseSize(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim().toUpperCase();
  const m = s.match(/^([\d.]+)\s*([KMB]?)$/);
  if (!m) return Number(s);
  const n = parseFloat(m[1]);
  switch (m[2]) {
    case 'B': return n * 1e9;
    case 'M': return n * 1e6;
    case 'K': return n * 1e3;
    default: return n;
  }
}

function fmtCompact(n) {
  const x = Number(n || 0);
  if (!Number.isFinite(x)) return '∞';
  if (x >= 1e9) return `$${(x / 1e9).toFixed(1)}B`;
  if (x >= 1e6) return `$${(x / 1e6).toFixed(0)}M`;
  if (x >= 1e3) return `$${(x / 1e3).toFixed(0)}K`;
  return `$${x.toFixed(0)}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
