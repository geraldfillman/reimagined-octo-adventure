/**
 * edgar.mjs — Shared SEC EDGAR fetch helpers.
 *
 * Consolidates EDGAR access that was previously duplicated across
 * pullers/sec.mjs, pullers/company-risk-scan.mjs, and pullers/fmp.mjs.
 *
 * Covers three free EDGAR surfaces (no API key required):
 *   1. Submissions      — data.sec.gov/submissions/CIK{10-digit}.json
 *   2. XBRL company-facts — data.sec.gov/api/xbrl/companyfacts/CIK{10-digit}.json
 *   3. EFTS full-text   — efts.sec.gov/LATEST/search-index?q=...
 *
 * SEC enforces a 10 req/sec ceiling and requires a contact
 * User-Agent: "<product> <email>". That identity lives in EDGAR_USER_AGENT
 * so any future change is made in exactly one place.
 *
 * All filings / returned objects are frozen — callers must create new
 * objects rather than mutate results.
 */

import { getJson, sleep } from './fetcher.mjs';
import { padCik, stripCik } from './cik-map.mjs';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Required SEC contact identifier — do NOT remove the email or SEC will 403 you. */
export const EDGAR_USER_AGENT = 'MyData-Vault/1.0 research@local.vault';

/** SEC request budget: EDGAR hard-caps at 10 req/sec; we shoot for 7 to leave headroom. */
export const EDGAR_MIN_INTERVAL_MS = 150;

/** Common form-type groupings referenced by multiple pullers. */
export const FORM_GROUPS = Object.freeze({
  SHELF:              Object.freeze(['S-1', 'S-1/A', 'S-3', 'S-3/A', 'S-3ASR', 'F-1', 'F-3']),
  PROSPECTUS:         Object.freeze(['424B1', '424B2', '424B3', '424B4', '424B5', '424B7', '424B8', 'FWP']),
  OFFERING_8K:        Object.freeze(['8-K']), // filter further by item 1.01/3.02
  EARNINGS:           Object.freeze(['10-Q', '10-K', '10-Q/A', '10-K/A']),
  OWNERSHIP:          Object.freeze(['SC 13D', 'SC 13D/A', 'SC 13G', 'SC 13G/A', '13F-HR']),
  INSIDER:            Object.freeze(['3', '4', '5']),
});

/** 8-K Item codes most relevant to offering / dilution tracking. */
export const OFFERING_8K_ITEMS = Object.freeze({
  MATERIAL_AGREEMENT: '1.01',
  UNREGISTERED_SALE:  '3.02',
  NASDAQ_DELISTING:   '3.01',
  REGULATION_FD:      '7.01',
  MATERIAL_EVENT:     '8.01',
});

const SUBMISSIONS_BASE   = 'https://data.sec.gov/submissions';
const COMPANY_FACTS_BASE = 'https://data.sec.gov/api/xbrl/companyfacts';
const EFTS_BASE          = 'https://efts.sec.gov/LATEST/search-index';
const TICKER_MAP_URL     = 'https://www.sec.gov/files/company_tickers.json';

// ─── Internal serializer ──────────────────────────────────────────────────────
// SEC's 10 req/sec limit is enforced per IP, not per endpoint. A module-level
// timestamp ensures all EDGAR callers funnel through the same cadence.

let _lastEdgarAt = 0;

async function throttle() {
  const sinceLast = Date.now() - _lastEdgarAt;
  if (sinceLast < EDGAR_MIN_INTERVAL_MS) {
    await sleep(EDGAR_MIN_INTERVAL_MS - sinceLast);
  }
  _lastEdgarAt = Date.now();
}

function edgarHeaders(extra = {}) {
  return { 'User-Agent': EDGAR_USER_AGENT, Accept: 'application/json', ...extra };
}

// ─── Core fetch wrappers ──────────────────────────────────────────────────────

/**
 * Fetch raw submissions document for a CIK.
 * Returns the full SEC JSON body — callers typically read .filings.recent.*.
 * @param {string|number} cik — any CIK form; padding handled internally.
 * @returns {Promise<object>}
 */
export async function fetchSubmissions(cik) {
  await throttle();
  const padded = padCik(cik);
  return getJson(`${SUBMISSIONS_BASE}/CIK${padded}.json`, { headers: edgarHeaders() });
}

/**
 * Fetch filings filtered to a set of form types on or after a cutoff date.
 *
 * @param {string|number} cik
 * @param {object} [opts]
 * @param {string[]} [opts.formTypes] — e.g. FORM_GROUPS.SHELF. Omit for all forms.
 * @param {string} [opts.since] — ISO date 'YYYY-MM-DD'. Omit for no floor.
 * @param {number} [opts.limit] — cap results. Default unlimited.
 * @returns {Promise<Array<Readonly<object>>>} filings newest-first.
 */
export async function fetchRecentFilings(cik, opts = {}) {
  const { formTypes, since, limit } = opts;
  const formSet = formTypes ? new Set(formTypes) : null;
  const cikNum  = stripCik(cik);

  const data = await fetchSubmissions(cik);
  const recent = data?.filings?.recent ?? {};
  const forms        = recent.form             ?? [];
  const dates        = recent.filingDate       ?? [];
  const accessions   = recent.accessionNumber  ?? [];
  const primaryDocs  = recent.primaryDocument  ?? [];
  const items        = recent.items            ?? [];
  const reports      = recent.reportDate       ?? [];

  const out = [];
  for (let i = 0; i < forms.length; i++) {
    if (formSet && !formSet.has(forms[i])) continue;
    if (since && dates[i] < since) break; // newest-first → safe early exit
    out.push(Object.freeze({
      formType:    forms[i],
      filingDate:  dates[i],
      reportDate:  reports[i]   ?? '',
      accession:   accessions[i]?.replace(/-/g, '') ?? '',
      accessionRaw: accessions[i] ?? '',
      primaryDoc:  primaryDocs[i] ?? '',
      items:       parseItems(items[i]),
      url:         `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cikNum}&type=${encodeURIComponent(forms[i])}&dateb=&owner=include&count=10`,
    }));
    if (limit && out.length >= limit) break;
  }
  return out;
}

/**
 * Fetch XBRL company-facts for a CIK. Returns null on 404/malformed JSON so
 * callers can gracefully skip tickers without facts (common for small caps).
 * @param {string|number} cik
 * @returns {Promise<object|null>}
 */
export async function fetchCompanyFacts(cik) {
  await throttle();
  const padded = padCik(cik);
  try {
    const data = await getJson(`${COMPANY_FACTS_BASE}/CIK${padded}.json`, { headers: edgarHeaders() });
    return data?.facts ? data : null;
  } catch {
    return null;
  }
}

/**
 * Thin EFTS full-text search wrapper. Use for market-wide form sweeps
 * (e.g. all 424B5 since Monday) without needing a CIK list.
 *
 * @param {object} params
 * @param {string} [params.q] — search phrase; omit for broad date/form sweep.
 * @param {string[]} [params.forms] — e.g. ['424B5','8-K']; comma-joined per EDGAR spec.
 * @param {string} [params.dateRange] — 'custom' when dateFrom/dateTo are supplied.
 * @param {string} [params.dateFrom] — 'YYYY-MM-DD' inclusive.
 * @param {string} [params.dateTo] — 'YYYY-MM-DD' inclusive.
 * @param {number} [params.from=0] — offset for pagination.
 * @returns {Promise<object>} raw EFTS response ({ hits: { total, hits: [] } }).
 */
export async function searchFullText(params = {}) {
  await throttle();
  const qs = new URLSearchParams();
  if (params.q)        qs.set('q', params.q);
  if (params.forms)    qs.set('forms', params.forms.join(','));
  if (params.dateFrom) qs.set('startdt', params.dateFrom);
  if (params.dateTo)   qs.set('enddt',   params.dateTo);
  if (params.dateFrom || params.dateTo) qs.set('dateRange', 'custom');
  if (params.from)     qs.set('from', String(params.from));
  return getJson(`${EFTS_BASE}?${qs.toString()}`, { headers: edgarHeaders() });
}

/**
 * Fetch the SEC's master ticker → CIK table (updated nightly by SEC).
 * Useful when a ticker isn't in our static cik-map.mjs.
 * @returns {Promise<Map<string, {cik: string, name: string}>>}
 */
export async function fetchTickerMap() {
  await throttle();
  const data = await getJson(TICKER_MAP_URL, { headers: edgarHeaders() });
  const map = new Map();
  for (const entry of Object.values(data ?? {})) {
    if (!entry?.ticker) continue;
    map.set(entry.ticker.toUpperCase(), Object.freeze({
      cik: padCik(entry.cik_str ?? entry.cik),
      name: entry.title ?? entry.name ?? '',
    }));
  }
  return map;
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

/** Split comma-separated item string "1.01,2.02" → ["1.01","2.02"]. */
export function parseItems(str) {
  if (!str) return [];
  return String(str).split(',').map(s => s.trim()).filter(Boolean);
}

// ─── Form-type predicates ────────────────────────────────────────────────────
// Kept as named predicates (not regex literals) so call-sites read as English
// and can be grep'd by intent.

export function isShelfRegistration(formType) {
  return FORM_GROUPS.SHELF.includes(formType);
}

export function isProspectusSupplement(formType) {
  return FORM_GROUPS.PROSPECTUS.includes(formType);
}

export function isOfferingAnnouncement(filing) {
  if (!filing) return false;
  if (filing.formType === '8-K' || filing.formType === '8-K/A') {
    return filing.items?.includes(OFFERING_8K_ITEMS.UNREGISTERED_SALE)
        || filing.items?.includes(OFFERING_8K_ITEMS.MATERIAL_AGREEMENT);
  }
  return isShelfRegistration(filing.formType) || isProspectusSupplement(filing.formType);
}

export function isNasdaqComplianceFiling(filing) {
  return filing?.formType === '8-K' && filing.items?.includes(OFFERING_8K_ITEMS.NASDAQ_DELISTING);
}

// ─── XBRL concept extraction ─────────────────────────────────────────────────

/**
 * Extract most recent USD value for a named XBRL concept from company-facts.
 * Handles the common us-gaap namespace plus an optional concept list.
 *
 * @param {object} facts — result from fetchCompanyFacts()
 * @param {string|string[]} concept — e.g. 'CashAndCashEquivalentsAtCarryingValue'
 * @param {object} [opts]
 * @param {string} [opts.unit='USD']
 * @param {string} [opts.form] — restrict to filings of this form (e.g. '10-Q')
 * @returns {{value:number,end:string,accn:string,form:string}|null}
 */
export function latestConceptValue(facts, concept, opts = {}) {
  if (!facts?.facts) return null;
  const { unit = 'USD', form } = opts;
  const concepts = Array.isArray(concept) ? concept : [concept];
  const namespaces = ['us-gaap', 'ifrs-full', 'dei'];

  for (const ns of namespaces) {
    const bucket = facts.facts[ns];
    if (!bucket) continue;
    for (const name of concepts) {
      const units = bucket[name]?.units?.[unit];
      if (!Array.isArray(units) || units.length === 0) continue;
      const filtered = form ? units.filter(u => u.form === form) : units;
      if (filtered.length === 0) continue;
      const latest = filtered.reduce((a, b) => (a.end > b.end ? a : b));
      return Object.freeze({
        value: Number(latest.val),
        end:   latest.end,
        accn:  latest.accn,
        form:  latest.form,
      });
    }
  }
  return null;
}
