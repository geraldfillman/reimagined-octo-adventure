import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { getEngineCacheDir } from '../lib/config.mjs';
import { calculateCotPositioning } from '../lib/cot-positioning-model.mjs';
import { fetchWithRetry } from '../lib/fetcher.mjs';

const CACHE_DIR = getEngineCacheDir('institutional-positioning', 'cftc-cot');

export async function pull(flags = {}) {
  const report = String(flags.report || flags.type || 'legacy').toLowerCase();
  const combined = Boolean(flags.combined || flags['futures-options'] || flags['futures-and-options']);
  const category = flags.category || defaultCategoryForReport(report);
  const rows = flags.file
    ? loadRows(flags.file, { category })
    : await fetchCotRows({ report, combined, category });
  const markets = String(flags.markets || 'S&P 500,Nasdaq,Treasury,VIX')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  const signals = rows.length
    ? markets.map(market => calculateCotPositioning(rows, { market, category }))
    : [];
  const payload = {
    schema_version: 1,
    source: 'CFTC Commitments of Traders',
    source_file: flags.file ? basename(flags.file) : '',
    report,
    report_url: flags.file ? '' : resolveCotReportUrl({ report, combined }),
    category,
    status: rows.length ? 'OK' : 'manual/API setup required',
    signals,
    limitations: [
      'COT is weekly and aggregated by trader category.',
      'Use --file <json-or-csv> to override the direct CFTC current-week fetch.',
    ],
  };

  if (flags['dry-run']) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    mkdirSync(CACHE_DIR, { recursive: true });
    const outPath = join(CACHE_DIR, 'latest.json');
    writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`Wrote: ${outPath}`);
  }

  if (flags.json) console.log(JSON.stringify({ signals: signals.length }, null, 2));
  return payload;
}

export function resolveCotReportUrl({ report = 'legacy', combined = false } = {}) {
  const normalized = String(report || 'legacy').toLowerCase();
  if (normalized === 'legacy') {
    return combined
      ? 'https://www.cftc.gov/dea/newcot/deacom.txt'
      : 'https://www.cftc.gov/dea/newcot/deacot.txt';
  }
  if (normalized === 'disaggregated' || normalized === 'disagg') {
    return combined
      ? 'https://www.cftc.gov/dea/newcot/c_disagg.txt'
      : 'https://www.cftc.gov/dea/newcot/f_disagg.txt';
  }
  if (normalized === 'tff' || normalized === 'financial') {
    return combined
      ? 'https://www.cftc.gov/dea/newcot/FinComWk.txt'
      : 'https://www.cftc.gov/dea/newcot/FinFutWk.txt';
  }
  throw new Error(`Unknown CFTC report "${report}". Valid: legacy, disaggregated, tff.`);
}

export async function fetchCotRows({ report = 'legacy', combined = false, category = defaultCategoryForReport(report) } = {}) {
  const url = resolveCotReportUrl({ report, combined });
  const response = await fetchWithRetry(url, {
    headers: { Accept: 'text/plain,text/csv,*/*' },
    timeout: 30_000,
  });
  if (!response.ok) {
    throw new Error(`CFTC report fetch failed: HTTP ${response.status}`);
  }
  return normalizeCotRowsForModel(parseCotCsvText(String(response.data || '')), { category });
}

export function parseCotCsvText(text) {
  const lines = String(text || '').trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, normalizeCell(cells[index] ?? '')]));
  });
}

export function normalizeCotRowsForModel(rows = [], { category = 'noncommercial' } = {}) {
  const normalizedCategory = normalizeCategory(category);
  return rows.map(row => {
    const market = firstValue(row, [
      'market',
      'market_and_exchange_name',
      'market_and_exchange_names',
      'asset_class_contract_name',
      'contract_market_name',
    ]);
    const reportDate = firstValue(row, [
      'report_date',
      'report_date_as_yyyy_mm_dd',
      'as_of_date',
    ]);
    const openInterest = numberValue(row, [
      'open_interest',
      'open_interest_all',
      'open_interest_old',
    ]);
    const long = numberValue(row, longKeys(normalizedCategory));
    const short = numberValue(row, shortKeys(normalizedCategory));
    const chgLong = numberValue(row, changeLongKeys(normalizedCategory));
    const chgShort = numberValue(row, changeShortKeys(normalizedCategory));
    const out = {
      ...row,
      market,
      report_date: normalizeDate(reportDate),
      open_interest: openInterest,
      [`${normalizedCategory}_long`]: long,
      [`${normalizedCategory}_short`]: short,
      weekly_net_flow: Number.isFinite(chgLong) && Number.isFinite(chgShort) ? chgLong - chgShort : null,
    };
    if (normalizedCategory !== 'long') {
      out.long = long;
      out.short = short;
    }
    return out;
  }).filter(row => row.market && row.report_date && row.open_interest > 0);
}

function loadRows(path, { category = 'noncommercial' } = {}) {
  const text = readFileSync(path, 'utf8');
  const rows = path.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseCotCsvText(text);
  return normalizeCotRowsForModel(Array.isArray(rows) ? rows : [], { category });
}

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells.map(cell => cell.replace(/^"|"$/g, '').trim());
}

function defaultCategoryForReport(report) {
  const normalized = String(report || 'legacy').toLowerCase();
  if (normalized === 'tff' || normalized === 'financial') return 'leveraged_funds';
  if (normalized === 'disaggregated' || normalized === 'disagg') return 'managed_money';
  return 'noncommercial';
}

function normalizeCategory(category) {
  const normalized = normalizeHeader(category);
  if (normalized === 'noncomm' || normalized === 'non_commercial') return 'noncommercial';
  if (normalized === 'managed_money' || normalized === 'm_money') return 'managed_money';
  if (normalized === 'leveraged_funds' || normalized === 'leveraged_fund' || normalized === 'lev_money') return 'leveraged_funds';
  return normalized || 'noncommercial';
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/%/g, 'pct')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeCell(value) {
  const trimmed = String(value ?? '').trim();
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed.replace(/,/g, ''))) return Number(trimmed.replace(/,/g, ''));
  return trimmed;
}

function firstValue(row, keys) {
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    const value = row[normalized] ?? row[key];
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return '';
}

function numberValue(row, keys) {
  const value = firstValue(row, keys);
  const number = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(number) ? number : 0;
}

function longKeys(category) {
  const base = categoryBaseKeys(category);
  return base.flatMap(key => [
    `${key}_long`,
    `${key}_long_all`,
    `${key}_positions_long_all`,
  ]);
}

function shortKeys(category) {
  const base = categoryBaseKeys(category);
  return base.flatMap(key => [
    `${key}_short`,
    `${key}_short_all`,
    `${key}_positions_short_all`,
  ]);
}

function changeLongKeys(category) {
  const base = categoryBaseKeys(category);
  return base.flatMap(key => [
    `chg_${key}_long`,
    `chg_${key}_long_all`,
    `change_${key}_long`,
    `change_in_${key}_long`,
    `chg_${key}_positions_long_all`,
  ]);
}

function changeShortKeys(category) {
  const base = categoryBaseKeys(category);
  return base.flatMap(key => [
    `chg_${key}_short`,
    `chg_${key}_short_all`,
    `change_${key}_short`,
    `change_in_${key}_short`,
    `chg_${key}_positions_short_all`,
  ]);
}

function categoryBaseKeys(category) {
  if (category === 'noncommercial') return ['noncommercial', 'noncomm', 'non_comm'];
  if (category === 'managed_money') return ['managed_money', 'm_money'];
  if (category === 'leveraged_funds') return ['leveraged_funds', 'leveraged_fund', 'lev_money'];
  if (category === 'commercial') return ['commercial', 'comm', 'prod_merc'];
  return [category];
}

function normalizeDate(value) {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{6}$/.test(text)) {
    const yy = Number(text.slice(0, 2));
    const yyyy = yy >= 70 ? 1900 + yy : 2000 + yy;
    return `${yyyy}-${text.slice(2, 4)}-${text.slice(4, 6)}`;
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toISOString().slice(0, 10);
}
