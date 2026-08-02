/**
 * edgar-company.mjs — Company Intel: EDGAR deconstruction support.
 *
 * Implements the filing-baseline layer of the EDGAR Company Deconstruction
 * & Intelligence Framework (04_Reference/EDGAR_Company_Deconstruction_Framework.md).
 *
 * Commands (router group `edgar`):
 *   edgar scaffold --ticker NVDA [--force]     → 13_Company_Intel/Companies/NVDA - Dossier.md
 *   edgar baseline --ticker NVDA [--since d]   → 05_Data_Pulls/Edgar/YYYY-MM-DD_EDGAR_Baseline_NVDA.md
 *   edgar facts    --ticker NVDA               → 05_Data_Pulls/Edgar/YYYY-MM-DD_EDGAR_Facts_NVDA.md
 *
 * All endpoints are free and keyless (data.sec.gov); requests are throttled
 * by the shared client in lib/edgar.mjs. No FMP quota is consumed.
 */

import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  fetchSubmissions,
  fetchCompanyFacts,
  fetchTickerMap,
  parseItems,
  FORM_GROUPS,
} from '../lib/edgar.mjs';
import { getByTicker, padCik, stripCik } from '../lib/cik-map.mjs';
import { buildNote, buildTable, writeNote, dateStampedFilename, today, formatNumber } from '../lib/markdown.mjs';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { SKELETON_PROFILES, selectSkeletonProfile, GENERAL_ROWS } from '../lib/skeleton-profiles.mjs';

export { SKELETON_PROFILES, selectSkeletonProfile, GENERAL_ROWS as SKELETON_ROWS };

const PULL_FOLDER = 'Edgar';
const DOSSIER_FOLDER = join('13_Company_Intel', 'Companies');

/** Baseline package groups per framework §5 (annual → quarterly → events → governance → ownership → offerings). */
export const BASELINE_GROUPS = Object.freeze([
  { key: 'annual',      label: 'Annual reports (10-K / 20-F / 40-F)',            forms: ['10-K', '10-K/A', '20-F', '40-F'], limit: 3 },
  { key: 'quarterly',   label: 'Quarterly reports (10-Q / 6-K)',                 forms: ['10-Q', '10-Q/A', '6-K'], limit: 6 },
  { key: 'events',      label: 'Event filings (8-K)',                            forms: ['8-K', '8-K/A'], limit: 20 },
  { key: 'proxy',       label: 'Proxy materials (DEF 14A)',                      forms: ['DEF 14A', 'DEFA14A', 'PRE 14A'], limit: 4 },
  { key: 'insider',     label: 'Insider filings (3 / 4 / 5 / 144)',              forms: ['3', '4', '5', '144'], limit: 12 },
  { key: 'ownership',   label: 'Beneficial ownership (13D / 13G / 13F)',         forms: ['SC 13D', 'SC 13D/A', 'SC 13G', 'SC 13G/A', '13F-HR'], limit: 10 },
  { key: 'offerings',   label: 'Registration & offerings (S-* / F-* / 424B / FWP)', forms: [...FORM_GROUPS.SHELF, ...FORM_GROUPS.PROSPECTUS], limit: 10 },
  { key: 'specialized', label: 'Specialized disclosure (SD)',                    forms: ['SD'], limit: 2 },
]);

/** 8-K items that warrant operator attention when they appear in the baseline window (framework §6.7). */
export const EVENT_ITEM_SEVERITY = Object.freeze({
  '1.03': 'critical', // bankruptcy or receivership
  '3.01': 'alert',    // delisting or listing-standard non-compliance
  '4.02': 'alert',    // non-reliance on previously issued financials
  '2.04': 'watch',    // triggering events on direct financial obligations
  '3.02': 'watch',    // unregistered sales of equity securities
  '4.01': 'watch',    // auditor change
});

const SEVERITY_RANK = Object.freeze({ clear: 0, watch: 1, alert: 2, critical: 3 });

// ─── Shared helpers ──────────────────────────────────────────────────────────

/** Dry-run predicate — kept exported so scripts/tests can assert on it. */
export function shouldWriteArtifacts(flags = {}) {
  return !Boolean(flags['dry-run'] ?? flags.dryRun);
}

/** Resolve ticker → { ticker, cik, name } via static map first, SEC ticker map second. */
async function resolveCompany(rawTicker, { allowNetwork = true } = {}) {
  const ticker = String(rawTicker ?? '').trim().toUpperCase();
  if (!ticker) {
    throw new Error('Missing --ticker. Example: node run.mjs edgar baseline --ticker NVDA');
  }
  if (!/^[A-Z0-9.\-]{1,10}$/.test(ticker)) {
    throw new Error(`Invalid ticker "${ticker}" — expected 1-10 characters of A-Z, 0-9, dot, or dash.`);
  }
  const staticHit = getByTicker(ticker);
  if (staticHit?.cik) {
    return { ticker, cik: padCik(staticHit.cik), name: staticHit.name ?? ticker };
  }
  if (!allowNetwork) {
    return { ticker, cik: null, name: ticker };
  }
  const map = await fetchTickerMap();
  const hit = map.get(ticker);
  if (!hit) {
    throw new Error(`Ticker "${ticker}" not found in SEC ticker map (sec.gov/files/company_tickers.json).`);
  }
  return { ticker, cik: hit.cik, name: hit.name || ticker };
}

/**
 * Slice one submissions document into a form-group list without re-fetching.
 * Arrays in filings.recent are newest-first.
 */
export function extractFilings(submissions, { forms, since, limit = Infinity } = {}) {
  const recent = submissions?.filings?.recent ?? {};
  const formArr = recent.form ?? [];
  const formSet = new Set(forms ?? []);
  const out = [];
  for (let i = 0; i < formArr.length && out.length < limit; i++) {
    if (formSet.size > 0 && !formSet.has(formArr[i])) continue;
    const filingDate = recent.filingDate?.[i] ?? '';
    if (since && filingDate < since) continue;
    out.push(Object.freeze({
      formType: formArr[i],
      filingDate,
      reportDate: recent.reportDate?.[i] ?? '',
      accessionRaw: recent.accessionNumber?.[i] ?? '',
      primaryDoc: recent.primaryDocument?.[i] ?? '',
      items: parseItems(recent.items?.[i]),
    }));
  }
  return out;
}

/** Direct document URL on sec.gov Archives (falls back to the filing folder). */
export function filingDocUrl(cik, filing) {
  const accession = String(filing?.accessionRaw ?? '').replace(/-/g, '');
  if (!accession) return '';
  const base = `https://www.sec.gov/Archives/edgar/data/${stripCik(cik)}/${accession}`;
  return filing?.primaryDoc ? `${base}/${filing.primaryDoc}` : base;
}

/** SEC fiscalYearEnd "0131" → "01-31" (left as-is when unrecognized). */
export function formatFiscalYearEnd(raw) {
  const s = String(raw ?? '').trim();
  return /^\d{4}$/.test(s) ? `${s.slice(0, 2)}-${s.slice(2)}` : s;
}

/** Derive pull-note signal fields from the 8-K events in the baseline window. */
export function deriveEventSignals(ticker, eventFilings = []) {
  const signals = [];
  let status = 'clear';
  for (const filing of eventFilings) {
    for (const item of filing.items ?? []) {
      const severity = EVENT_ITEM_SEVERITY[item];
      if (!severity) continue;
      signals.push(`edgar:${ticker.toLowerCase()}:8k-${item}:${severity}`);
      if (SEVERITY_RANK[severity] > SEVERITY_RANK[status]) status = severity;
    }
  }
  return { status, signals };
}

/**
 * Last two fiscal-year values for a concept list from XBRL company-facts.
 *
 * Two traps this handles:
 * 1. Facts inside a 10-K carry the *filing's* fy/fp, so comparative prior-year
 *    facts share fy with the current year — dedupe by fact period (start|end),
 *    preferring the latest filed value.
 * 2. Companies retire tags over time (NVDA last used
 *    PaymentsToAcquirePropertyPlantAndEquipment in FY2012) — evaluate every
 *    candidate concept and keep the one with the freshest period end, using
 *    concept-list order only as the tie-break.
 *
 * @returns {Array<{value:number,end:string,form:string}>} newest-first, ≤2 entries.
 */
export function fiscalYearValues(facts, concepts, { unit = 'USD', kind = 'flow' } = {}) {
  const namespaces = ['us-gaap', 'ifrs-full', 'dei'];
  let best = null;
  let bestOrder = Infinity;
  for (const ns of namespaces) {
    const bucket = facts?.facts?.[ns];
    if (!bucket) continue;
    for (let order = 0; order < concepts.length; order++) {
      const entries = bucket[concepts[order]]?.units?.[unit];
      const values = annualPeriodValues(entries, kind);
      if (values.length === 0) continue;
      const fresher = !best
        || values[0].end > best[0].end
        || (values[0].end === best[0].end && order < bestOrder);
      if (fresher) {
        best = values;
        bestOrder = order;
      }
    }
  }
  return best ?? [];
}

const ANNUAL_FORMS = new Set(['10-K', '10-K/A', '20-F', '40-F']);

function annualPeriodValues(entries, kind) {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const annual = entries.filter(e =>
    ANNUAL_FORMS.has(e.form) &&
    e.fp === 'FY' &&
    (kind === 'balance' || isFullYearDuration(e)));
  if (annual.length === 0) return [];

  const byPeriod = new Map();
  for (const e of annual) {
    const key = `${e.start ?? ''}|${e.end}`;
    const prev = byPeriod.get(key);
    if (!prev || (e.filed ?? '') > (prev.filed ?? '')) byPeriod.set(key, e);
  }
  return [...byPeriod.values()]
    .sort((a, b) => (a.end < b.end ? 1 : -1))
    .slice(0, 2)
    .map(e => Object.freeze({ value: Number(e.val), end: e.end, form: e.form }));
}

function isFullYearDuration(entry) {
  if (!entry?.start || !entry?.end) return false;
  const days = (new Date(entry.end) - new Date(entry.start)) / 86_400_000;
  return days > 300;
}

function directionArrow(current, prior) {
  if (current == null || prior == null) return '';
  if (current > prior) return '↑';
  if (current < prior) return '↓';
  return '→';
}

function pctChange(current, prior) {
  if (current == null || prior == null || prior === 0) return null;
  return ((current - prior) / Math.abs(prior)) * 100;
}

function printPlan(plan) {
  console.log('🔎 Dry run — no network calls, no writes. Plan:');
  console.log(JSON.stringify(plan, null, 2));
}

// ─── edgar baseline ──────────────────────────────────────────────────────────

export async function baseline(flags = {}) {
  if (!shouldWriteArtifacts(flags)) {
    const { ticker, cik } = await resolveCompany(flags.ticker, { allowNetwork: false });
    printPlan({
      command: 'edgar baseline',
      ticker,
      cik: cik ?? '(resolved via SEC ticker map at run time)',
      endpoints: ['data.sec.gov/submissions'],
      wouldWrite: join(getPullsDir(), PULL_FOLDER, dateStampedFilename(`EDGAR_Baseline_${ticker}`)),
      groups: BASELINE_GROUPS.map(g => g.key),
    });
    return { filePath: null, dryRun: true };
  }

  const { ticker, cik, name } = await resolveCompany(flags.ticker);
  const submissions = await fetchSubmissions(cik);
  const companyName = submissions?.name ?? name;

  const annual = extractFilings(submissions, { forms: BASELINE_GROUPS[0].forms, limit: BASELINE_GROUPS[0].limit });
  const eventsSince = typeof flags.since === 'string' ? flags.since : annual[0]?.filingDate ?? undefined;

  const groupFilings = new Map();
  for (const group of BASELINE_GROUPS) {
    const filings = group.key === 'annual'
      ? annual
      : extractFilings(submissions, {
          forms: group.forms,
          since: group.key === 'events' ? eventsSince : undefined,
          limit: group.limit,
        });
    groupFilings.set(group.key, filings);
  }

  const { status, signals } = deriveEventSignals(ticker, groupFilings.get('events'));
  const sections = [
    buildCompanySection({ companyName, ticker, cik, submissions }),
    ...BASELINE_GROUPS.map(g => buildGroupSection(g, groupFilings.get(g.key), cik, eventsSince)),
    READ_ORDER_SECTION,
  ];

  const note = buildNote({
    frontmatter: {
      title: `EDGAR Filing Baseline — ${ticker}`,
      source: 'SEC EDGAR (data.sec.gov)',
      date_pulled: today(),
      domain: 'edgar',
      data_type: 'filing_baseline',
      frequency: 'on-demand',
      signal_status: status,
      signals,
      symbol: ticker,
      cik,
      company: companyName,
      tags: ['edgar', 'company-intel', ticker.toLowerCase()],
    },
    sections,
  });

  const filePath = join(getPullsDir(), PULL_FOLDER, dateStampedFilename(`EDGAR_Baseline_${ticker}`));
  writeNote(filePath, note);
  const total = [...groupFilings.values()].reduce((sum, list) => sum + list.length, 0);
  const signalSuffix = status === 'clear' ? '' : `, signal: ${status}`;
  console.log(`📄 Filing baseline (${total} filings${signalSuffix}) → ${filePath}`);
  return {
    filePath,
    status,
    counts: Object.fromEntries([...groupFilings.entries()].map(([key, list]) => [key, list.length])),
  };
}

function buildCompanySection({ companyName, ticker, cik, submissions }) {
  return {
    heading: 'Company',
    content: [
      `- **Name:** ${companyName}`,
      `- **Ticker:** ${ticker}`,
      `- **CIK:** ${cik}`,
      `- **SIC:** ${submissions?.sicDescription ?? ''}`,
      `- **Fiscal year end:** ${formatFiscalYearEnd(submissions?.fiscalYearEnd)}`,
      `- **EDGAR profile:** https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${stripCik(cik)}&type=&dateb=&owner=include&count=40`,
      `- **Dossier:** [[${DOSSIER_FOLDER.replace(/\\/g, '/')}/${ticker} - Dossier]]`,
    ].join('\n'),
  };
}

function buildGroupSection(group, filings, cik, eventsSince) {
  const withItems = group.key === 'events';
  const headers = withItems
    ? ['Form', 'Filed', 'Period', 'Items', 'Document']
    : ['Form', 'Filed', 'Period', 'Document'];
  const rows = filings.map(f => {
    const link = filingDocUrl(cik, f);
    const doc = link ? `[open](${link})` : '';
    return withItems
      ? [f.formType, f.filingDate, f.reportDate, f.items.join(', '), doc]
      : [f.formType, f.filingDate, f.reportDate, doc];
  });
  const heading = withItems && eventsSince ? `${group.label} — since ${eventsSince}` : group.label;
  return {
    heading,
    content: rows.length > 0 ? buildTable(headers, rows) : '_None found in the recent submissions window._',
  };
}

const READ_ORDER_SECTION = Object.freeze({
  heading: 'Read Order (framework §7.3)',
  content: [
    '1. 10-K business section → segment footnote → revenue-recognition footnote → MD&A',
    '2. Cash-flow statement → balance sheet → debt and commitments footnotes → risk factors',
    '3. Proxy → recent 8-Ks → recent 10-Qs → insider and ownership filings → material exhibits',
    '',
    'Compare, do not merely read: current vs. prior 10-K, risk-factor wording, deleted metrics, segment definitions (§7.4).',
    'Log every meaningful change as an Intel Finding (`03_Templates/Intel_Finding`) and route it with the §8 tables.',
  ].join('\n'),
});

// ─── edgar facts ─────────────────────────────────────────────────────────────

export async function facts(flags = {}) {
  const requestedProfile = resolveProfileFlag(flags);
  if (!shouldWriteArtifacts(flags)) {
    const { ticker, cik } = await resolveCompany(flags.ticker, { allowNetwork: false });
    const planProfile = requestedProfile ?? SKELETON_PROFILES.general;
    printPlan({
      command: 'edgar facts',
      ticker,
      cik: cik ?? '(resolved via SEC ticker map at run time)',
      endpoints: ['data.sec.gov/api/xbrl/companyfacts', 'data.sec.gov/submissions'],
      wouldWrite: join(getPullsDir(), PULL_FOLDER, dateStampedFilename(`EDGAR_Facts_${ticker}`)),
      profile: requestedProfile?.key ?? '(auto-selected from SIC at run time; override with --profile general|bank|reit)',
      metrics: planProfile.rows.map(r => r.label),
    });
    return { filePath: null, dryRun: true };
  }

  const { ticker, cik, name } = await resolveCompany(flags.ticker);
  const companyFacts = await fetchCompanyFacts(cik);
  if (!companyFacts) {
    throw new Error(`No XBRL company facts available for ${ticker} (CIK ${cik}). Small caps and recent IPOs sometimes lack facts.`);
  }
  const submissions = requestedProfile ? null : await fetchSubmissions(cik);
  const profile = requestedProfile ?? selectSkeletonProfile(submissions?.sic);

  const { rows, covered, series } = buildSkeletonData(companyFacts, profile.rows);
  const derived = buildDerivedRows(series, profile.key);

  const sections = [
    {
      heading: `Financial Skeleton — ${profile.label} profile (last two fiscal years, XBRL annual facts)`,
      content: buildTable(['Metric', 'Current FY', 'Prior FY', 'Δ'], rows),
    },
    {
      heading: 'Derived',
      content: derived.length > 0
        ? buildTable(['Metric', 'Current FY', 'Prior FY'], derived)
        : '_Not enough coverage to derive margins or free cash flow._',
    },
    {
      heading: 'Reconciliation Prompts (framework §7 pass 3)',
      content: [
        '- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?',
        '- Are receivables or inventory growing faster than revenue?',
        '- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?',
        '- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?',
        '- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.',
      ].join('\n'),
    },
  ];

  const note = buildNote({
    frontmatter: {
      title: `EDGAR Financial Skeleton — ${ticker}`,
      source: 'SEC EDGAR XBRL company facts (data.sec.gov)',
      date_pulled: today(),
      domain: 'edgar',
      data_type: 'financial_skeleton',
      skeleton_profile: profile.key,
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      symbol: ticker,
      cik,
      company: companyFacts?.entityName ?? name,
      tags: ['edgar', 'company-intel', ticker.toLowerCase()],
    },
    sections,
  });

  const filePath = join(getPullsDir(), PULL_FOLDER, dateStampedFilename(`EDGAR_Facts_${ticker}`));
  writeNote(filePath, note);
  console.log(`📊 Financial skeleton [${profile.key}] (${covered}/${profile.rows.length} metrics covered) → ${filePath}`);
  return { filePath, covered, total: profile.rows.length, profile: profile.key };
}

function resolveProfileFlag(flags) {
  if (!flags.profile) return null;
  const profile = SKELETON_PROFILES[String(flags.profile).toLowerCase()];
  if (!profile) {
    throw new Error(`Unknown --profile "${flags.profile}". Valid profiles: ${Object.keys(SKELETON_PROFILES).join(', ')}.`);
  }
  return profile;
}

function buildSkeletonData(companyFacts, specs) {
  const rows = [];
  const series = new Map();
  let covered = 0;
  for (const spec of specs) {
    const values = fiscalYearValues(companyFacts, spec.concepts, { unit: spec.unit ?? 'USD', kind: spec.kind });
    series.set(spec.label, values);
    const [current, prior] = values;
    if (current) covered++;
    const style = spec.unit === 'shares' ? 'compact' : 'currency';
    const delta = pctChange(current?.value, prior?.value);
    rows.push([
      spec.label,
      current ? `${formatNumber(current.value, { style })} (${current.end})` : '—',
      prior ? `${formatNumber(prior.value, { style })} (${prior.end})` : '—',
      `${directionArrow(current?.value, prior?.value)}${delta == null ? '' : ` ${formatNumber(delta, { style: 'percent' })}`}`.trim(),
    ]);
  }
  return { rows, covered, series };
}

// Different metrics can resolve from tags retired in different years —
// helpers only combine two metrics when their period ends actually match.
function seriesHelpers(series) {
  const value = (label, index) => series.get(label)?.[index]?.value ?? null;
  const end = (label, index) => series.get(label)?.[index]?.end ?? null;
  const samePeriod = (a, b, index) => end(a, index) != null && end(a, index) === end(b, index);
  const pct = (numLabel, denLabel, index) => {
    const num = value(numLabel, index);
    const den = value(denLabel, index);
    if (num == null || !den || !samePeriod(numLabel, denLabel, index)) return '—';
    return formatNumber((num / den) * 100, { style: 'percent' });
  };
  return { value, samePeriod, pct };
}

function buildDerivedRows(series, profileKey = 'general') {
  const helpers = seriesHelpers(series);
  if (profileKey === 'bank') return bankDerivedRows(helpers);
  if (profileKey === 'reit') return reitDerivedRows(helpers);
  return generalDerivedRows(helpers);
}

function generalDerivedRows({ value, samePeriod, pct }) {
  const rows = [];

  if (value('Revenue', 0) != null) {
    rows.push(['Gross margin', pct('Gross profit', 'Revenue', 0), pct('Gross profit', 'Revenue', 1)]);
    rows.push(['Operating margin', pct('Operating income', 'Revenue', 0), pct('Operating income', 'Revenue', 1)]);
  }

  const fcf = (index) => {
    const ocf = value('Operating cash flow', index);
    const capex = value('Capital expenditure', index);
    if (ocf == null || capex == null || !samePeriod('Operating cash flow', 'Capital expenditure', index)) return null;
    return ocf - capex;
  };
  const fcfCur = fcf(0);
  const fcfPri = fcf(1);
  if (fcfCur != null || fcfPri != null) {
    rows.push([
      'Free cash flow (OCF − capex)',
      fcfCur != null ? formatNumber(fcfCur, { style: 'currency' }) : '—',
      fcfPri != null ? formatNumber(fcfPri, { style: 'currency' }) : '—',
    ]);
  }

  if (value('Net income', 0) != null) {
    rows.push(['OCF / net income', pct('Operating cash flow', 'Net income', 0), pct('Operating cash flow', 'Net income', 1)]);
  }

  return rows;
}

function bankDerivedRows({ value, pct }) {
  const rows = [];
  if (value('Total net revenue', 0) != null) {
    rows.push(['Efficiency ratio (noninterest expense / revenue)', pct('Noninterest expense', 'Total net revenue', 0), pct('Noninterest expense', 'Total net revenue', 1)]);
  }
  if (value("Stockholders' equity", 0) != null) {
    rows.push(['Return on equity (NI / period-end equity)', pct('Net income', "Stockholders' equity", 0), pct('Net income', "Stockholders' equity", 1)]);
  }
  if (value('Loans (net of allowance)', 0) != null) {
    rows.push(['Provision / net loans', pct('Provision for credit losses', 'Loans (net of allowance)', 0), pct('Provision for credit losses', 'Loans (net of allowance)', 1)]);
    rows.push(['Loans / deposits', pct('Loans (net of allowance)', 'Deposits', 0), pct('Loans (net of allowance)', 'Deposits', 1)]);
  }
  return rows;
}

function reitDerivedRows({ value, samePeriod, pct }) {
  const rows = [];

  const ffoProxy = (index) => {
    const ni = value('Net income', index);
    const da = value('Depreciation & amortization', index);
    if (ni == null || da == null || !samePeriod('Net income', 'Depreciation & amortization', index)) return null;
    return ni + da;
  };
  const cur = ffoProxy(0);
  const pri = ffoProxy(1);
  if (cur != null || pri != null) {
    rows.push([
      'FFO proxy (NI + D&A; sale gains not adjusted — check 10-K)',
      cur != null ? formatNumber(cur, { style: 'currency' }) : '—',
      pri != null ? formatNumber(pri, { style: 'currency' }) : '—',
    ]);
  }

  if (value('Total assets', 0) != null) {
    rows.push(['Long-term debt / total assets', pct('Long-term debt', 'Total assets', 0), pct('Long-term debt', 'Total assets', 1)]);
  }
  if (value('Net income', 0) != null) {
    rows.push(['OCF / net income', pct('Operating cash flow', 'Net income', 0), pct('Operating cash flow', 'Net income', 1)]);
  }

  return rows;
}

// ─── edgar scaffold ──────────────────────────────────────────────────────────

export async function scaffold(flags = {}) {
  const vaultRoot = getVaultRoot();
  const templatePath = join(vaultRoot, '03_Templates', 'Company_Dossier.md');
  if (!existsSync(templatePath)) {
    throw new Error(`Dossier template not found: ${templatePath}`);
  }

  if (!shouldWriteArtifacts(flags)) {
    const { ticker, cik } = await resolveCompany(flags.ticker, { allowNetwork: false });
    printPlan({
      command: 'edgar scaffold',
      ticker,
      cik: cik ?? '(resolved via SEC ticker map at run time)',
      endpoints: ['data.sec.gov/submissions'],
      wouldWrite: join(vaultRoot, DOSSIER_FOLDER, `${ticker} - Dossier.md`),
    });
    return { filePath: null, dryRun: true };
  }

  const { ticker, cik, name } = await resolveCompany(flags.ticker);
  const filePath = join(vaultRoot, DOSSIER_FOLDER, `${ticker} - Dossier.md`);
  if (existsSync(filePath) && !flags.force) {
    console.log(`⏭️  Dossier already exists: ${filePath}`);
    console.log('   Dossiers are living notes — edit in place, or rerun with --force to overwrite.');
    return { filePath, created: false };
  }

  const submissions = await fetchSubmissions(cik);
  const companyName = submissions?.name ?? name;
  // Escape backslashes before quotes — a trailing '\' would otherwise
  // swallow the closing quote and corrupt the whole frontmatter block.
  const yaml = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  const entityNote = join(vaultRoot, '08_Entities', 'Stocks', `${ticker}.md`);
  const coreEntities = existsSync(entityNote) ? `core_entities: ["[[${ticker}]]"]` : 'core_entities: []';

  let body = readFileSync(templatePath, 'utf-8');
  const replacements = [
    ['company: ""', `company: "${yaml(companyName)}"`],
    ['ticker: ""', `ticker: "${ticker}"`],
    ['cik: ""', `cik: "${cik}"`],
    ['sector: ""', `sector: "${yaml(submissions?.sicDescription ?? '')}"`],
    ['fiscal_year_end: ""', `fiscal_year_end: "${formatFiscalYearEnd(submissions?.fiscalYearEnd)}"`],
    ['last_updated: ""', `last_updated: "${today()}"`],
    ['core_entities: []', coreEntities],
    ['{{company}}', companyName],
    ['{{ticker}}', ticker],
  ];
  for (const [from, to] of replacements) {
    // Function replacer disables `$&`/`$1` special tokens in external names.
    body = body.replaceAll(from, () => to);
  }

  // Dossiers are hand-edited living notes — never clobber one without a backup.
  if (existsSync(filePath)) {
    const backupPath = `${filePath}.bak-${today()}`;
    copyFileSync(filePath, backupPath);
    console.log(`🛟 Existing dossier backed up → ${backupPath}`);
  }

  writeNote(filePath, body);
  console.log(`🏗️  Dossier scaffolded → ${filePath}`);
  console.log('   Next: write Part A (the Company Card) before reading analyst opinions, then:');
  console.log(`   node run.mjs edgar baseline --ticker ${ticker}`);
  console.log(`   node run.mjs edgar facts --ticker ${ticker}`);
  return { filePath, created: true };
}
