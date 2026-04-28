/**
 * macro-context.mjs - Helpers for matching thesis indicators to latest macro pull notes.
 */

import { basename, join } from 'path';
import { getPullsDir, getVaultRoot } from './config.mjs';
import { readFolder } from './frontmatter.mjs';
import { parseFirstMarkdownTable } from './markdown-table.mjs';

const PULLS_DIR = getPullsDir();
const REGIMES_DIR = join(getVaultRoot(), '09_Macro', 'Regimes');
const INDICATORS_DIR = join(getVaultRoot(), '09_Macro', 'Indicators');

const SERIES_ID_ALIASES = Object.freeze({
  CSUSHPISA: ['CSUSHPINSA'],
});

const LOOKUP_ALIASES = Object.freeze({
  '10y treasury': ['10-Year Treasury Yield', 'DGS10'],
  '10-year treasury': ['10-Year Treasury Yield', 'DGS10'],
  'yield curve': ['Yield Curve (10Y-2Y Spread)', '10Y-2Y Spread', 'T10Y2Y'],
  'fed funds rate': ['Federal Funds Rate', 'DFF'],
  'cpi': ['CPI All Items', 'CPIAUCSL'],
  'cpi inflation': ['CPI All Items', 'CPIAUCSL'],
  'home price index csushpisa': ['Case-Shiller Home Price Index', 'CSUSHPINSA'],
  csushpisa: ['CSUSHPINSA', 'Case-Shiller Home Price Index'],
  'builder confidence index': ['NAHB_HMI', 'Builder Confidence Index'],
  'us debt gdp': ['GFDEGDQ188S', 'Federal Debt to GDP'],
  'dxy dollar index': ['DTWEXBGS', 'Trade Weighted U.S. Dollar Index (DXY Proxy)'],
  dxy: ['DTWEXBGS', 'Trade Weighted U.S. Dollar Index (DXY Proxy)'],
  'defense budget': ['FDEFX', 'Federal Defense Spending Proxy'],
  'faa regulatory progress': ['FAA_UAS_REG', 'FAA Regulatory Progress'],
  'gold spot price': ['XAUUSD', 'Gold Spot Price'],
  'bitcoin price': ['BTCUSD', 'Bitcoin Price'],
  vix: ['VIX', 'CBOE Volatility Index (VIX)'],
});

export async function loadMacroContext() {
  const [pullNotes, regimeNotes, indicatorNotes] = await Promise.all([
    readFolder(PULLS_DIR, true),
    readFolder(REGIMES_DIR, false),
    readFolder(INDICATORS_DIR, false),
  ]);

  const { seriesById, seriesByLookup } = buildLatestSeriesMaps(pullNotes);

  return {
    latestNotes: buildLatestMacroNotes(pullNotes),
    seriesById,
    seriesByLookup,
    indicatorByName: buildIndicatorMap(indicatorNotes),
    regimeByName: buildRegimeMap(regimeNotes),
  };
}

export function stripWikiLink(value) {
  return String(value || '')
    .replace(/^\[\[/, '')
    .replace(/\]\]$/, '')
    .trim();
}

export function extractSeriesIdFromLinkValue(value) {
  const label = stripWikiLink(value);
  const match = label.match(/(?:^|\s)([A-Z][A-Z0-9_]{2,})$/);
  return match ? match[1] : null;
}

export function resolveMacroIndicator(value, macroContext) {
  const label = stripWikiLink(value);
  const normalizedLabel = normalizeMacroLookupKey(label);
  const requestedSeriesId = extractSeriesIdFromLinkValue(value);
  const indicatorNote = macroContext?.indicatorByName?.get(normalizedLabel) || null;

  const seriesIdCandidates = uniqueValues([
    requestedSeriesId,
    ...(SERIES_ID_ALIASES[requestedSeriesId] || []),
    ...expandLookupAliases(label),
  ])
    .map(candidate => String(candidate || '').trim().toUpperCase())
    .filter(Boolean);

  for (const seriesId of seriesIdCandidates) {
    const match = macroContext?.seriesById?.get(seriesId) || null;
    if (match) {
      return {
        label,
        requestedSeriesId,
        indicatorNote,
        match,
        resolvedVia: requestedSeriesId === seriesId ? 'series_id' : 'series_alias',
      };
    }
  }

  const lookupCandidates = uniqueValues([
    label,
    removeTrailingSeriesToken(label, requestedSeriesId),
    indicatorNote?.data?.name,
    indicatorNote ? basename(indicatorNote.filename, '.md') : null,
    ...expandLookupAliases(label),
    ...expandLookupAliases(indicatorNote?.data?.name),
  ])
    .map(candidate => normalizeMacroLookupKey(candidate))
    .filter(Boolean);

  for (const lookupKey of lookupCandidates) {
    const match = macroContext?.seriesByLookup?.get(lookupKey) || null;
    if (match) {
      return {
        label,
        requestedSeriesId,
        indicatorNote,
        match,
        resolvedVia: lookupKey === normalizedLabel ? 'label' : 'alias',
      };
    }
  }

  return {
    label,
    requestedSeriesId,
    indicatorNote,
    match: null,
    resolvedVia: null,
  };
}

function buildLatestMacroNotes(notes) {
  const latestByKey = new Map();

  for (const note of notes) {
    if (!isMacroRelevant(note)) continue;

    const key = `${String(note?.data?.domain || '').toLowerCase()}:${String(note?.data?.title || note.filename || '')}`;
    const current = latestByKey.get(key);
    if (!current || compareDatedNotes(note, current) < 0) {
      latestByKey.set(key, note);
    }
  }

  return [...latestByKey.values()].sort(compareDatedNotes);
}

function buildLatestSeriesMaps(notes) {
  const latestBySeries = new Map();
  const latestByLookup = new Map();

  for (const note of notes) {
    const candidates = extractSeriesCandidates(note);
    for (const candidate of candidates) {
      registerSeriesCandidate(candidate, latestBySeries, latestByLookup);
    }
  }

  return {
    seriesById: latestBySeries,
    seriesByLookup: latestByLookup,
  };
}

function extractSeriesCandidates(note) {
  if (isVixBridgeNote(note)) {
    const candidate = extractVixCandidate(note);
    return candidate ? [candidate] : [];
  }

  if (!isMacroRelevant(note) || String(note?.data?.data_type || '') !== 'time_series') {
    return [];
  }

  const table = parseFirstMarkdownTable(note.content);
  if (!table?.headers?.length) return [];

  if (table.headers.includes('Series')) {
    return table.rows
      .map(row => {
        const seriesId = String(row.Series || '').trim().toUpperCase();
        if (!seriesId) return null;
        return {
          seriesId,
          note,
          row,
          lookupTerms: [seriesId, row.Name, note?.data?.title],
        };
      })
      .filter(Boolean);
  }

  const genericCandidate = extractGenericTimeSeriesCandidate(note, table);
  return genericCandidate ? [genericCandidate] : [];
}

function extractGenericTimeSeriesCandidate(note, table) {
  if (!Array.isArray(table?.headers) || table.headers.length < 2 || !Array.isArray(table.rows) || table.rows.length === 0) {
    return null;
  }

  const dateHeader = table.headers[0];
  const valueHeader = table.headers[1];
  const latestRow = table.rows[0] || null;
  if (!latestRow) return null;

  const priorRow = table.rows[1] || null;
  const latestValue = latestRow[valueHeader] || null;
  const priorValue = priorRow?.[valueHeader] || null;
  const noteName = normalizeIndicatorName(note);
  const seriesId = String(note?.data?.series_id || '').trim().toUpperCase() || null;

  return {
    seriesId,
    note,
    row: {
      Series: seriesId || noteName,
      Name: noteName,
      'Latest Date': latestRow[dateHeader] || note?.data?.record_date || note?.data?.date_pulled || null,
      'Latest Value': latestValue,
      Change: formatChangeValue(latestValue, priorValue),
    },
    lookupTerms: [noteName, note?.data?.title, basename(note.filename, '.md')],
  };
}

function extractVixCandidate(note) {
  const table = parseFirstMarkdownTable(note.content);
  if (!table?.headers?.includes('VIX') || !table.rows?.length) return null;

  const latestRow = table.rows[0] || null;
  if (!latestRow) return null;

  return {
    seriesId: 'VIX',
    note,
    row: {
      Series: 'VIX',
      Name: 'VIX',
      'Latest Date': latestRow.Date || note?.data?.date_pulled || null,
      'Latest Value': latestRow.VIX || null,
      Change: latestRow['Slope (VIX3M - VIX)'] || null,
    },
    lookupTerms: ['VIX', 'CBOE Volatility Index (VIX)', note?.data?.title],
  };
}

function registerSeriesCandidate(candidate, latestBySeries, latestByLookup) {
  const seriesId = String(candidate?.seriesId || '').trim().toUpperCase();
  if (seriesId) {
    const current = latestBySeries.get(seriesId);
    if (!current || compareDatedNotes(candidate.note, current.note) < 0) {
      latestBySeries.set(seriesId, candidate);
    }
  }

  for (const lookupKey of buildLookupKeys(candidate)) {
    const current = latestByLookup.get(lookupKey);
    if (!current || compareDatedNotes(candidate.note, current.note) < 0) {
      latestByLookup.set(lookupKey, candidate);
    }
  }
}

function buildLookupKeys(candidate) {
  return uniqueValues([
    candidate?.seriesId,
    candidate?.row?.Series,
    candidate?.row?.Name,
    ...(candidate?.lookupTerms || []),
  ])
    .flatMap(term => [term, stripParenthetical(term)])
    .map(term => normalizeMacroLookupKey(term))
    .filter(Boolean);
}

function buildIndicatorMap(notes) {
  const byName = new Map();

  for (const note of notes) {
    if (note?.data?.node_type !== 'indicator') continue;

    const names = uniqueValues([
      note?.data?.name,
      basename(note.filename, '.md'),
    ]);

    for (const name of names) {
      const key = normalizeMacroLookupKey(name);
      if (key) byName.set(key, note);
    }
  }

  return byName;
}

function buildRegimeMap(notes) {
  const byName = new Map();

  for (const note of notes) {
    if (note?.data?.node_type !== 'regime') continue;

    const name = stripWikiLink(note?.data?.name || note.filename.replace(/\.md$/i, ''));
    if (!name) continue;
    byName.set(name, note);
  }

  return byName;
}

function normalizeIndicatorName(note) {
  const raw = String(note?.data?.title || basename(note?.filename || '', '.md') || '').trim();
  return raw
    .replace(/\s+[—-]\s+[^—-]+$/u, '')
    .replace(/\s+Pull$/i, '')
    .trim();
}

function normalizeMacroLookupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\[\[|\]\]/g, '')
    .replace(/\|/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/(\d+)\s*-\s*year\b/g, '$1y')
    .replace(/(\d+)\s+year\b/g, '$1y')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeTrailingSeriesToken(label, seriesId) {
  if (!label || !seriesId) return label;
  return String(label)
    .replace(new RegExp(`\\s+${seriesId}$`), '')
    .trim();
}

function expandLookupAliases(value) {
  const lookupKey = normalizeMacroLookupKey(value);
  return LOOKUP_ALIASES[lookupKey] || [];
}

function stripParenthetical(value) {
  return String(value || '')
    .replace(/\s*\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatChangeValue(latestValue, priorValue) {
  const latest = parseNumericValue(latestValue);
  const prior = parseNumericValue(priorValue);
  if (latest == null || prior == null) return null;
  return (latest - prior).toFixed(2);
}

function parseNumericValue(value) {
  const normalized = String(value ?? '')
    .replace(/,/g, '')
    .replace(/%/g, '')
    .trim();
  if (!normalized || normalized.toUpperCase() === 'N/A') return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function isMacroRelevant(note) {
  const domain = String(note?.data?.domain || '').toLowerCase();
  const dataType = String(note?.data?.data_type || '').toLowerCase();
  const source = String(note?.data?.source || '').toLowerCase();
  const title = String(note?.data?.title || '');

  if (title.startsWith('News ')) return false;
  if (isVixBridgeNote(note)) return true;
  if (!['macro', 'housing', 'energy', 'government'].includes(domain)) return false;

  if (['time_series', 'snapshot'].includes(dataType)) return true;
  return source.includes('fred')
    || source.includes('bea')
    || source.includes('treasury')
    || source.includes('eia')
    || source.includes('nahb')
    || source.includes('federal register')
    || source.includes('faa');
}

function isVixBridgeNote(note) {
  const source = String(note?.data?.source || '').toLowerCase();
  const title = String(note?.data?.title || '').toLowerCase();
  return source.includes('cboe') && title.includes('vix');
}

function compareDatedNotes(left, right) {
  const leftDate = String(left?.data?.date_pulled || left?.note?.data?.date_pulled || '');
  const rightDate = String(right?.data?.date_pulled || right?.note?.data?.date_pulled || '');
  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }

  const leftName = String(left?.filename || left?.note?.filename || '');
  const rightName = String(right?.filename || right?.note?.filename || '');
  return rightName.localeCompare(leftName);
}
