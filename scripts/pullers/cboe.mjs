/**
 * cboe.mjs — CBOE Market Positioning puller
 *
 * Pulls options market data from CBOE public CSV feeds.
 * Tracks market positioning through put/call ratios, skew,
 * and VIX term structure. No API key required.
 *
 * Usage:
 *   node run.mjs cboe --put-call
 *   node run.mjs cboe --skew
 *   node run.mjs cboe --vix
 *   node run.mjs cboe --all
 */

import { join } from 'path';
import { getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { fetchWithRetry } from '../lib/fetcher.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';
import {
  evaluatePutCallRatio, evaluateSkewIndex, evaluateVIXTermStructure,
  highestSeverity, formatSignalsSection,
} from '../lib/signals.mjs';
import { findLatestPull } from '../lib/history.mjs';

const MARKET_HISTORY_RETENTION = Object.freeze([{ policy: 'market-history' }]);

/** CBOE data groups — each answers an investment question */
const DATA_GROUPS = Object.freeze({
  skew: Object.freeze({
    name: 'SKEW Index',
    domain: 'Market',
    question: 'How much tail risk is the market pricing?',
    url: 'https://cdn.cboe.com/api/global/us_indices/daily_prices/SKEW_History.csv',
  }),
  vix: Object.freeze({
    name: 'VIX Term Structure',
    domain: 'Market',
    question: 'Is volatility in contango or backwardation?',
    urls: Object.freeze({
      vix: 'https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv',
      vix3m: 'https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX3M_History.csv',
    }),
  }),
  'put-call': Object.freeze({
    name: 'Put/Call Ratio',
    domain: 'Market',
    question: 'Is the market positioned for fear or greed?',
    // NOTE: CBOE restricted public CSV access to put/call data.
    // This uses the legacy endpoint which may require auth.
    // If unavailable, the pull will log a warning and write a stub note.
    url: 'https://cdn.cboe.com/api/global/us_indices/daily_prices/PUTCALL_History.csv',
    restricted: true,
    deprecated: true,
  }),
});

/**
 * Parse a CSV text string into headers + rows.
 * @param {string} text
 * @returns {{ headers: string[], rows: readonly object[] }}
 */
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return Object.freeze({ headers: [], rows: Object.freeze([]) });
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim());
    return Object.freeze(headers.reduce((obj, h, i) => ({ ...obj, [h]: cells[i] }), {}));
  });
  return Object.freeze({ headers, rows: Object.freeze(rows) });
}

/**
 * Parse a date string from CBOE CSVs (handles M/D/YYYY and YYYY-MM-DD).
 * Returns a comparable string YYYY-MM-DD for sorting.
 * @param {string} raw
 * @returns {string}
 */
function normalizeDate(raw) {
  if (!raw) return '';
  // Already ISO-like
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  // M/D/YYYY or MM/DD/YYYY
  const parts = raw.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return raw;
}

/**
 * Get the most recent N rows from parsed CSV, sorted newest-first.
 * @param {readonly object[]} rows
 * @param {string} dateKey
 * @param {number} limit
 * @returns {readonly object[]}
 */
function latestRows(rows, dateKey, limit = 30) {
  const sorted = [...rows]
    .filter(r => r[dateKey] && r[dateKey] !== 'N/A')
    .sort((a, b) => normalizeDate(b[dateKey]).localeCompare(normalizeDate(a[dateKey])));
  return Object.freeze(sorted.slice(0, limit));
}

/**
 * Fetch a single CSV URL and return parsed result.
 * @param {string} url
 * @param {string} label — for console logging
 * @returns {Promise<{ headers: string[], rows: readonly object[] }|null>}
 */
async function fetchCSV(url, label) {
  console.log(`  Fetching ${label}...`);
  try {
    const result = await fetchWithRetry(url);
    if (!result.data || typeof result.data !== 'string') {
      console.warn(`  Warning: ${label} returned non-text data (status ${result.status})`);
      return null;
    }
    // Detect XML error responses (CBOE returns 200 + XML for restricted endpoints)
    if (result.data.trimStart().startsWith('<')) {
      console.warn(`  Warning: ${label} returned XML/HTML instead of CSV (likely access denied)`);
      return null;
    }
    const parsed = parseCSV(result.data);
    console.log(`    OK — ${parsed.rows.length} rows`);
    return parsed;
  } catch (err) {
    console.warn(`  Warning: ${label} fetch failed — ${err.message}`);
    return null;
  }
}

// --- Group pull handlers ---

/**
 * Pull and process SKEW Index data.
 * @returns {Promise<{ data: readonly object[], latest: object|null, signals: object[] }>}
 */
async function pullSKEW() {
  const group = DATA_GROUPS.skew;
  const csv = await fetchCSV(group.url, 'SKEW Index');
  if (!csv) return Object.freeze({ data: Object.freeze([]), latest: null, signals: [] });

  // SKEW CSV columns: Date, SKEW (sometimes Open/High/Low/Close)
  const dateKey = csv.headers.find(h => /^date$/i.test(h)) || csv.headers[0];
  const skewKey = csv.headers.find(h => /^skew$/i.test(h) || /^close$/i.test(h)) || csv.headers[1];

  const recent = latestRows(csv.rows, dateKey, 30);
  const latest = recent[0] || null;
  const latestVal = latest ? parseFloat(latest[skewKey]) : null;

  const signal = evaluateSkewIndex(latestVal);
  const signals = signal ? [signal] : [];

  if (latest) {
    console.log(`    SKEW Latest: ${latest[dateKey]} = ${latestVal}`);
  }

  return Object.freeze({
    data: recent,
    latest,
    latestVal,
    dateKey,
    skewKey,
    signals,
  });
}

/**
 * Pull and process VIX + VIX3M for term structure.
 * @returns {Promise<{ vixData: readonly object[], vix3mData: readonly object[], signals: object[] }>}
 */
async function pullVIXTermStructure() {
  const group = DATA_GROUPS.vix;
  const [vixCSV, vix3mCSV] = await Promise.all([
    fetchCSV(group.urls.vix, 'VIX History'),
    fetchCSV(group.urls.vix3m, 'VIX3M History'),
  ]);

  const extractClose = (csv, label) => {
    if (!csv) return Object.freeze({ data: Object.freeze([]), latest: null, latestVal: null });
    const dateKey = csv.headers.find(h => /^date$/i.test(h)) || csv.headers[0];
    const closeKey = csv.headers.find(h => /^close$/i.test(h)) || csv.headers[4] || csv.headers[1];
    const recent = latestRows(csv.rows, dateKey, 30);
    const latest = recent[0] || null;
    const latestVal = latest ? parseFloat(latest[closeKey]) : null;
    if (latest) console.log(`    ${label} Latest: ${latest[dateKey]} = ${latestVal}`);
    return Object.freeze({ data: recent, latest, latestVal, dateKey, closeKey });
  };

  const vix = extractClose(vixCSV, 'VIX');
  const vix3m = extractClose(vix3mCSV, 'VIX3M');

  const signal = evaluateVIXTermStructure(vix.latestVal, vix3m.latestVal);
  const signals = signal ? [signal] : [];

  return Object.freeze({ vix, vix3m, signals });
}

/**
 * Pull and process equity Put/Call ratio.
 * @returns {Promise<{ data: readonly object[], latest: object|null, signals: object[] }>}
 */
async function pullPutCall() {
  const group = DATA_GROUPS['put-call'];
  const csv = await fetchCSV(group.url, 'Put/Call Ratio');
  if (!csv) {
    console.warn('    Note: CBOE restricted public access to put/call CSV data.');
    console.warn('    Stub note will be created. Consider FMP options data for a richer chain snapshot.');
    return Object.freeze({ data: Object.freeze([]), latest: null, signals: [] });
  }

  const dateKey = csv.headers.find(h => /trade.?date/i.test(h)) || csv.headers[0];
  const ratioKey = csv.headers.find(h => /p.?c.?ratio/i.test(h) || /ratio/i.test(h)) || csv.headers[4];

  const recent = latestRows(csv.rows, dateKey, 30);
  const latest = recent[0] || null;
  const latestVal = latest ? parseFloat(latest[ratioKey]) : null;

  const signal = evaluatePutCallRatio(latestVal);
  const signals = signal ? [signal] : [];

  if (latest) {
    console.log(`    P/C Ratio Latest: ${latest[dateKey]} = ${latestVal}`);
  }

  return Object.freeze({
    data: recent,
    latest,
    latestVal,
    dateKey,
    ratioKey,
    signals,
  });
}

// --- Markdown builders ---

/**
 * Build markdown note for SKEW pull.
 */
function buildSKEWNote(result, priorNote) {
  const { data, latestVal, dateKey, skewKey, signals } = result;

  const tableHeaders = ['Date', 'SKEW'];
  const tableRows = data.map(r => [
    normalizeDate(r[dateKey]),
    formatNumber(parseFloat(r[skewKey]), { decimals: 2 }),
  ]);

  const signalStatus = highestSeverity(signals);

  return buildNote({
    frontmatter: {
      title: 'CBOE SKEW Index',
      source: 'CBOE Public CSV',
      date_pulled: today(),
      domain: 'market',
      data_type: 'daily_index',
      frequency: 'daily',
      signal_status: signalStatus,
      signals: signals.map(s => ({ id: s.id, severity: s.severity, value: s.value, message: s.message })),
      tags: ['cboe', 'skew', 'market', 'positioning', 'options'],
      related_pulls: [],
    },
    sections: [
      {
        heading: DATA_GROUPS.skew.question,
        content: latestVal != null
          ? `**Latest SKEW**: ${formatNumber(latestVal, { decimals: 2 })} (as of ${normalizeDate(data[0]?.[dateKey] || '')})\n\n> SKEW > 150 = extreme tail risk; SKEW 100–130 = normal; SKEW < 110 = complacency`
          : '_No data available_',
      },
      ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'Recent SKEW Values (Last 30 Days)',
        content: buildTable(tableHeaders, tableRows),
      },
      {
        heading: 'Source',
        content: [
          `- **Provider**: CBOE`,
          `- **Feed**: SKEW_History.csv (public, no API key)`,
          `- **URL**: ${DATA_GROUPS.skew.url}`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });
}

/**
 * Build markdown note for VIX term structure pull.
 */
function buildVIXNote(result) {
  const { vix, vix3m, signals } = result;

  const slope = (vix.latestVal != null && vix3m.latestVal != null)
    ? (vix3m.latestVal - vix.latestVal).toFixed(2)
    : null;

  const structureLabel = slope == null
    ? 'N/A'
    : parseFloat(slope) >= 0 ? 'Contango (normal)' : 'Backwardation (stress)';

  // Merge VIX + VIX3M rows by date for comparison table
  const vixByDate = Object.fromEntries(
    vix.data.map(r => [normalizeDate(r[vix.dateKey]), parseFloat(r[vix.closeKey])])
  );
  const vix3mByDate = Object.fromEntries(
    vix3m.data.map(r => [normalizeDate(r[vix3m.dateKey]), parseFloat(r[vix3m.closeKey])])
  );
  const allDates = [...new Set([...Object.keys(vixByDate), ...Object.keys(vix3mByDate)])]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 30);

  const tableHeaders = ['Date', 'VIX', 'VIX3M', 'Slope (VIX3M - VIX)'];
  const tableRows = allDates.map(d => {
    const v = vixByDate[d];
    const v3 = vix3mByDate[d];
    const s = (v != null && v3 != null) ? (v3 - v).toFixed(2) : 'N/A';
    return [
      d,
      v != null ? formatNumber(v, { decimals: 2 }) : 'N/A',
      v3 != null ? formatNumber(v3, { decimals: 2 }) : 'N/A',
      s,
    ];
  });

  const signalStatus = highestSeverity(signals);

  return buildNote({
    frontmatter: {
      title: 'CBOE VIX Term Structure',
      source: 'CBOE Public CSV',
      date_pulled: today(),
      domain: 'market',
      data_type: 'daily_index',
      frequency: 'daily',
      signal_status: signalStatus,
      signals: signals.map(s => ({ id: s.id, severity: s.severity, value: s.value, message: s.message })),
      tags: ['cboe', 'vix', 'vix3m', 'term-structure', 'volatility', 'market'],
      related_pulls: [],
    },
    sections: [
      {
        heading: DATA_GROUPS.vix.question,
        content: [
          `**VIX (spot)**: ${vix.latestVal != null ? formatNumber(vix.latestVal, { decimals: 2 }) : 'N/A'}`,
          `**VIX3M**: ${vix3m.latestVal != null ? formatNumber(vix3m.latestVal, { decimals: 2 }) : 'N/A'}`,
          `**Slope (VIX3M - VIX)**: ${slope ?? 'N/A'}`,
          `**Structure**: ${structureLabel}`,
          '',
          '> Positive slope = contango (normal, calm). Negative slope = backwardation (stress, event risk).',
        ].join('\n'),
      },
      ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'Term Structure History (Last 30 Days)',
        content: buildTable(tableHeaders, tableRows),
      },
      {
        heading: 'Source',
        content: [
          `- **Provider**: CBOE`,
          `- **VIX Feed**: VIX_History.csv (public, no API key)`,
          `- **VIX3M Feed**: VIX3M_History.csv (public, no API key)`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });
}

/**
 * Build markdown note for Put/Call ratio pull.
 */
function buildPutCallNote(result) {
  const { data, latestVal, dateKey, ratioKey, signals } = result;

  const tableHeaders = ['Date', 'P/C Ratio'];
  const tableRows = data.map(r => [
    normalizeDate(r[dateKey]),
    formatNumber(parseFloat(r[ratioKey]), { decimals: 2 }),
  ]);

  const signalStatus = highestSeverity(signals);

  const positioningLabel = latestVal == null ? 'N/A'
    : latestVal > 1.0 ? 'Fear / Heavy put buying'
    : latestVal < 0.6 ? 'Greed / Heavy call buying'
    : 'Neutral';

  return buildNote({
    frontmatter: {
      title: 'CBOE Equity Put/Call Ratio',
      source: 'CBOE Public CSV',
      date_pulled: today(),
      domain: 'market',
      data_type: 'daily_ratio',
      frequency: 'daily',
      signal_status: signalStatus,
      signals: signals.map(s => ({ id: s.id, severity: s.severity, value: s.value, message: s.message })),
      tags: ['cboe', 'put-call', 'options', 'positioning', 'sentiment', 'market'],
      related_pulls: [],
    },
    sections: [
      {
        heading: DATA_GROUPS['put-call'].question,
        content: [
          `**Latest P/C Ratio**: ${latestVal != null ? formatNumber(latestVal, { decimals: 2 }) : 'N/A'} (as of ${normalizeDate(data[0]?.[dateKey] || '')})`,
          `**Positioning**: ${positioningLabel}`,
          '',
          '> P/C > 1.2 = extreme fear (contrarian bullish). P/C < 0.5 = extreme greed (contrarian bearish). Normal range: 0.6–0.9.',
        ].join('\n'),
      },
      ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'Recent Put/Call Ratios (Last 30 Days)',
        content: buildTable(tableHeaders, tableRows),
      },
      {
        heading: 'Source',
        content: [
          `- **Provider**: CBOE`,
          `- **Feed**: CBOE put/call CSV (currently restricted — data unavailable)`,
          `- **Fallback**: Use FMP options chain for put/call data`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });
}

/**
 * Write signal log notes for any fired signals.
 * @param {object[]} signals
 * @param {string} sourceName — used in signal note frontmatter
 */
function writeSignalNotes(signals, sourceName) {
  for (const s of signals) {
    const signalNote = buildNote({
      frontmatter: {
        signal_id: s.id,
        signal_name: s.name,
        domain: s.domain,
        severity: s.severity,
        value: s.value,
        threshold: s.threshold,
        date: today(),
        source_pull: sourceName,
        tags: ['signal', s.domain, s.severity],
      },
      sections: [
        { heading: s.name, content: s.message },
        { heading: 'Implications', content: s.implications.map(i => `- ${i}`).join('\n') },
        { heading: 'Related Domains', content: s.related_domains.map(d => `- ${d}`).join('\n') },
      ],
    });

    const signalPath = join(getSignalsDir(), dateStampedFilename(s.id));
    writeNote(signalPath, signalNote);
    console.log(`  Signal logged: ${signalPath}`);
  }
}

/**
 * Determine which groups to pull based on CLI flags.
 * @param {object} flags
 * @returns {string[]}
 */
function resolveGroups(flags) {
  const isActive = key => !DATA_GROUPS[key]?.deprecated;
  if (flags.all) return Object.keys(DATA_GROUPS).filter(isActive);
  const requested = Object.keys(DATA_GROUPS).filter(key => flags[key] && isActive(key));
  // No flags → default to all active groups (put-call is deprecated and excluded by isActive)
  if (requested.length === 0) return Object.keys(DATA_GROUPS).filter(isActive);
  return requested;
}

/**
 * Main pull function.
 * @param {object} flags — CLI flags
 * @returns {Promise<{ filePath: string, signals: object[], retention: readonly object[] }>}
 */
export async function pull(flags = {}) {
  const groups = resolveGroups(flags);
  console.log(`CBOE: Pulling ${groups.join(', ')}\n`);

  // Get prior pull for reference
  const priorNote = findLatestPull('Market', 'CBOE');

  const allSignals = [];
  let lastFilePath = null;

  for (const groupKey of groups) {
    const group = DATA_GROUPS[groupKey];

    if (DATA_GROUPS[groupKey]?.deprecated) {
      console.warn(`  ⚠️  ${group.name} is deprecated — CBOE restricted public CSV access.`);
      console.warn('  → Use: node run.mjs fmp --options <SYMBOL> for options positioning data.\n');
      continue;
    }

    console.log(`--- ${group.name} ---`);
    console.log(`    Question: ${group.question}`);

    let note = null;
    let signals = [];
    const noteName = `CBOE_${group.name.replace(/\s+/g, '_')}`;

    try {
      if (groupKey === 'skew') {
        const result = await pullSKEW();
        signals = result.signals;
        note = buildSKEWNote(result, priorNote);
      } else if (groupKey === 'vix') {
        const result = await pullVIXTermStructure();
        signals = result.signals;
        note = buildVIXNote(result);
      } else if (groupKey === 'put-call') {
        const result = await pullPutCall();
        signals = result.signals;
        note = buildPutCallNote(result);
      }
    } catch (err) {
      console.warn(`  Error processing ${group.name}: ${err.message}`);
      continue;
    }

    if (!note) {
      console.warn(`  Skipping ${group.name} — no note built`);
      continue;
    }

    // Log signals to console
    if (signals.length > 0) {
      const icon = { critical: '[CRITICAL]', alert: '[ALERT]', watch: '[WATCH]' };
      for (const s of signals) {
        console.log(`  ${icon[s.severity] || '[?]'} ${s.name}: ${s.message}`);
      }
    } else {
      console.log(`  No signals — all clear.`);
    }

    // Write pull note
    const filePath = join(getPullsDir(), group.domain, dateStampedFilename(noteName));
    writeNote(filePath, note);
    console.log(`  Wrote: ${filePath}\n`);
    lastFilePath = filePath;

    // Write signal logs
    if (signals.length > 0) {
      writeSignalNotes(signals, noteName);
    }

    allSignals.push(...signals);
  }

  return Object.freeze({
    filePath: lastFilePath,
    signals: Object.freeze(allSignals),
    retention: lastFilePath ? MARKET_HISTORY_RETENTION : Object.freeze([]),
  });
}
