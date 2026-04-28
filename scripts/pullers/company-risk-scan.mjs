/**
 * company-risk-scan.mjs — Company Risk Intelligence scanner
 *
 * Queries FMP (local cache), SEC EDGAR, NewsAPI, and FDA to generate
 * structured risk_event notes in 12_Company_Risk/Events/ for use in
 * the Company Risk Board and Company Risk Patterns dashboards.
 *
 * Domains scanned:
 *   fundamental — FMP TTM ratios (margins, revenue growth, FCF, debt)
 *   regulatory  — SEC EDGAR 8-K items (5.02, 4.01, 4.02, 8-K/A) + FDA recalls (biotech only)
 *   sentiment   — NewsAPI negative-keyword article scan (last 7 days)
 *
 * Usage:
 *   node run.mjs company-risk-scan --ticker AAPL --company "Apple Inc"
 *   node run.mjs company-risk-scan --ticker NVDA --company "Nvidia" --domain fundamental
 *   node run.mjs company-risk-scan --watchlist
 *   node run.mjs company-risk-scan --ticker AAPL --company "Apple Inc" --update-score
 *   node run.mjs company-risk-scan --ticker AAPL --company "Apple Inc" --dry-run
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getApiKey, getVaultRoot } from '../lib/config.mjs';
import { getJson, sleep } from '../lib/fetcher.mjs';
import { fetchRecentFilings as edgarFetchRecentFilings } from '../lib/edgar.mjs';
import {
  buildNote,
  buildTable,
  writeNote,
  today,
  dateStampedFilename,
} from '../lib/markdown.mjs';

// ─── Paths ────────────────────────────────────────────────────────────────────

const riskEventsDir  = root => join(root, '12_Company_Risk', 'Events');
const companiesDir   = root => join(root, '12_Company_Risk', 'Companies');
const fmpCacheDir    = root => join(root, 'scripts', '.cache', 'fmp-ratios-ttm');
const secTickerCache = root => join(root, 'scripts', '.cache', 'sec-company-tickers.json');

// ─── Constants ────────────────────────────────────────────────────────────────

const SEC_LOOKBACK_DAYS = 90;
const NEWS_LOOKBACK_DAYS = 7;

/** 8-K items treated as governance risk signals */
const RISK_8K_ITEMS = {
  '5.02': { label: 'Executive departure',               score: 10, severity: 'Medium' },
  '4.01': { label: 'Auditor change',                    score: 15, severity: 'High'   },
  '4.02': { label: 'Non-reliance on prior financials',  score: 15, severity: 'High'   },
};

/** Keywords that flag an article as negative-sentiment */
const NEGATIVE_KEYWORDS = [
  'investigation', 'fraud', 'warning', 'recall', 'lawsuit', 'fine',
  'penalty', ' SEC ', ' DOJ ', 'probe', 'restatement', 'class action',
  'subpoena', 'indictment', 'settlement', 'violation', 'allegation',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
// `sleep` is imported from lib/fetcher.mjs — do not re-declare here.

/**
 * Parse YAML frontmatter from a vault note.
 * Handles simple scalar fields only — sufficient for risk note schemas.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^"(.*)"$/, '$1');
    if (key) result[key] = val;
  }
  return result;
}

/**
 * Rewrite a single frontmatter scalar field in a note file.
 * Leaves all other content untouched.
 */
function updateFrontmatterField(filePath, field, value) {
  const content = readFileSync(filePath, 'utf-8');
  const updated = content.replace(
    new RegExp(`^(${field}:\\s*).*$`, 'm'),
    `$1${value}`,
  );
  writeFileSync(filePath, updated, 'utf-8');
}

/** Resolve CIK (zero-padded, 10 digits) for a ticker from the local EDGAR cache. */
function resolveCIK(ticker, vaultRoot) {
  const cachePath = secTickerCache(vaultRoot);
  if (!existsSync(cachePath)) return null;
  try {
    const data = JSON.parse(readFileSync(cachePath, 'utf-8'));
    for (const entry of Object.values(data)) {
      if (entry.ticker?.toUpperCase() === ticker.toUpperCase()) {
        return String(entry.cik_str).padStart(10, '0');
      }
    }
  } catch {
    // Cache unreadable — skip
  }
  return null;
}

/** Load FMP TTM ratios from local cache. Returns null if not cached. */
function loadFMPCache(ticker, vaultRoot) {
  const cachePath = join(fmpCacheDir(vaultRoot), `${ticker.toLowerCase()}.json`);
  if (!existsSync(cachePath)) return null;
  try {
    const data = JSON.parse(readFileSync(cachePath, 'utf-8'));
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
}

// ─── Domain Scanners ──────────────────────────────────────────────────────────

/**
 * Fundamental risk scan — reads FMP TTM ratios from local cache only.
 * No live API call to avoid quota usage on non-thesis tickers.
 */
function scanFundamentals(ticker, vaultRoot) {
  const ratios = loadFMPCache(ticker, vaultRoot);
  if (!ratios) {
    console.log(`    ⚠️  FMP cache miss for ${ticker} — run fmp --thesis-watchlists first`);
    return { findings: [], riskDelta: 0, skipped: true };
  }

  const findings = [];
  let score = 0;

  const checks = [
    {
      label: 'Low gross margin',
      value: ratios.grossProfitMarginTTM,
      threshold: '<15%',
      test: v => v < 0.15,
      format: v => `${(v * 100).toFixed(1)}%`,
      score: 10,
    },
    {
      label: 'Revenue contraction',
      value: ratios.revenueGrowthTTM ?? ratios.revenuePerShareTTMGrowth,
      threshold: '<0%',
      test: v => v < 0,
      format: v => `${(v * 100).toFixed(1)}%`,
      score: 10,
    },
    {
      label: 'Negative free cash flow',
      value: ratios.freeCashFlowPerShareTTM,
      threshold: '<0',
      test: v => v < 0,
      format: v => v.toFixed(2),
      score: 10,
    },
    {
      label: 'High debt/equity ratio',
      value: ratios.debtEquityRatioTTM,
      threshold: '>2.5×',
      test: v => v > 2.5,
      format: v => `${v.toFixed(2)}×`,
      score: 10,
    },
  ];

  for (const check of checks) {
    if (check.value !== null && check.value !== undefined && !isNaN(check.value) && check.test(check.value)) {
      findings.push({
        label: check.label,
        value: check.format(check.value),
        threshold: check.threshold,
        score: check.score,
      });
      score += check.score;
    }
  }

  const severity = findings.length >= 3 ? 'High' : findings.length >= 1 ? 'Medium' : 'Low';
  return { findings, riskDelta: Math.min(score, 35), severity };
}

/**
 * SEC governance scan — fetches recent 8-K filings and flags risk items.
 * Requires CIK in the local EDGAR ticker cache.
 */
async function scanSEC(ticker, vaultRoot) {
  const cik = resolveCIK(ticker, vaultRoot);
  if (!cik) {
    console.log(`    ⚠️  No CIK found for ${ticker} in EDGAR cache — skipping`);
    return { findings: [], riskDelta: 0, skipped: true };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - SEC_LOOKBACK_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  let filings;
  try {
    filings = await edgarFetchRecentFilings(cik, {
      formTypes: ['8-K', '8-K/A'], since: cutoffStr, limit: 100,
    });
  } catch (err) {
    console.log(`    ⚠️  SEC fetch failed: ${err.message}`);
    return { findings: [], riskDelta: 0, skipped: true };
  }

  const findings = [];
  let score = 0;

  for (const f of filings) {
    if (f.formType === '8-K/A') {
      findings.push({ date: f.filingDate, form: f.formType, label: 'Amended 8-K (possible restatement)', items: f.items, score: 10 });
      score += 10;
    } else if (f.formType === '8-K') {
      for (const item of f.items) {
        if (RISK_8K_ITEMS[item]) {
          findings.push({
            date:  f.filingDate,
            form:  f.formType,
            label: RISK_8K_ITEMS[item].label,
            items: f.items,
            score: RISK_8K_ITEMS[item].score,
          });
          score += RISK_8K_ITEMS[item].score;
        }
      }
    }
  }

  const severity = score >= 25 ? 'High' : score >= 10 ? 'Medium' : 'Low';
  return { findings, riskDelta: Math.min(score, 40), severity };
}

/**
 * Sentiment scan — queries NewsAPI everything endpoint for negative-keyword hits.
 * Gracefully skips if key is not configured.
 */
async function scanSentiment(companyName) {
  let apiKey;
  try {
    apiKey = getApiKey('newsapi');
  } catch {
    console.log(`    ⚠️  NEWSAPI_API_KEY not set — skipping sentiment`);
    return { findings: [], riskDelta: 0, skipped: true };
  }

  const from = new Date();
  from.setDate(from.getDate() - NEWS_LOOKBACK_DAYS);
  const fromStr = from.toISOString().slice(0, 10);

  const q = encodeURIComponent(`"${companyName}"`);
  let data;
  try {
    data = await getJson(
      `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&pageSize=20&from=${fromStr}&language=en&apiKey=${apiKey}`,
    );
  } catch (err) {
    console.log(`    ⚠️  NewsAPI fetch failed: ${err.message}`);
    return { findings: [], riskDelta: 0, skipped: true };
  }

  const articles = data?.articles ?? [];
  const negHits = articles.filter(a => {
    const text = `${a.title ?? ''} ${a.description ?? ''}`.toLowerCase();
    return NEGATIVE_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
  });

  const count = negHits.length;
  const score = count >= 6 ? 20 : count >= 3 ? 10 : count >= 1 ? 5 : 0;
  const severity = count >= 6 ? 'High' : count >= 3 ? 'Medium' : 'Low';

  return {
    findings: negHits.map(a => ({
      date:   a.publishedAt?.slice(0, 10) ?? '',
      source: a.source?.name ?? 'Unknown',
      title:  (a.title ?? '').slice(0, 90),
    })),
    riskDelta: score,
    severity,
    total: articles.length,
  };
}

/**
 * FDA enforcement scan — queries openFDA drug enforcement/recall records.
 * Returns empty findings (not an error) when no records exist (404 response).
 */
async function scanFDA(companyName) {
  const q = encodeURIComponent(`"${companyName}"`);
  let data;
  try {
    data = await getJson(`https://api.fda.gov/drug/enforcement.json?search=recalling_firm:${q}&limit=10`);
  } catch (err) {
    // 404 = no records found — treat as clean
    if (err.message?.includes('404') || err.message?.toLowerCase().includes('no matches')) {
      return { findings: [], riskDelta: 0, severity: 'Low' };
    }
    console.log(`    ⚠️  FDA fetch failed: ${err.message}`);
    return { findings: [], riskDelta: 0, skipped: true };
  }

  const recalls = data?.results ?? [];
  let score = 0;
  for (const r of recalls) {
    if (r.classification === 'Class I')      score += 15;
    else if (r.classification === 'Class II') score += 10;
    else                                       score += 5;
  }

  const severity = score >= 20 ? 'High' : score >= 10 ? 'Medium' : 'Low';
  return {
    findings: recalls.map(r => ({
      date:           r.report_date ?? '',
      classification: r.classification ?? '',
      product:        (r.product_description ?? '').slice(0, 70),
      reason:         (r.reason_for_recall ?? '').slice(0, 80),
    })),
    riskDelta: Math.min(score, 40),
    severity,
  };
}

// ─── Note writer ──────────────────────────────────────────────────────────────

const SEVERITY_TO_SIGNAL_STATUS = { High: 'alert', Medium: 'watch', Low: 'clear' };

function writeEventNote({ ticker, companyName, eventType, severity, source, link, confidence, tags, sections, dryRun, eventsDir }) {
  const signalStatus = SEVERITY_TO_SIGNAL_STATUS[severity] ?? 'clear';
  const content = buildNote({
    frontmatter: {
      node_type:      'risk_event',
      date:           today(),
      date_pulled:    today(),
      event_type:     eventType,
      company:        companyName,
      ticker,
      severity,
      signal_status:  signalStatus,
      signals:        [{ id: `RISK_${eventType.toUpperCase()}`, severity: signalStatus, message: `${severity} risk: ${eventType} event for ${ticker}` }],
      source,
      link:           link ?? '',
      confidence,
      pattern_matches: [],
      domain:         'company_risk',
      data_type:      'risk_event',
      frequency:      'on-demand',
      tags:           ['risk-event', signalStatus, ...tags],
    },
    sections,
  });

  const filePath = join(eventsDir, dateStampedFilename(`${ticker}_${eventType}`));
  if (dryRun) {
    console.log(`    [dry-run] Would write: ${filePath}`);
  } else {
    writeNote(filePath, content);
    console.log(`    ✓ ${filePath}`);
  }
  return filePath;
}

// ─── Main scanner ─────────────────────────────────────────────────────────────

async function scanCompany({ ticker, companyName, domain, dryRun, updateScore, vaultRoot }) {
  console.log(`\n🔍 ${ticker} — ${companyName}`);
  const eventsDir = riskEventsDir(vaultRoot);
  const written = [];
  let totalRiskDelta = 0;

  // ── Fundamentals (FMP cache) ───────────────────────────────────────────────
  if (domain === 'all' || domain === 'fundamental') {
    console.log(`  📊 Fundamentals (FMP cache)...`);
    const { findings, riskDelta, severity, skipped } = scanFundamentals(ticker, vaultRoot);
    if (!skipped && findings.length > 0) {
      totalRiskDelta += riskDelta;
      const rows = findings.map(f => [f.label, f.value, f.threshold, `+${f.score} pts`]);
      const fp = writeEventNote({
        ticker, companyName, eventType: 'Financial', severity,
        source: 'FMP TTM Ratios (cached)', confidence: 'Medium',
        link: '', tags: ['fundamental'],
        sections: [
          { heading: 'Summary', content: `${findings.length} fundamental risk signal(s) for ${ticker}.` },
          { heading: 'Signals', content: buildTable(['Signal', 'Value', 'Threshold', 'Score'], rows) },
          { heading: 'Risk Delta', content: `+${riskDelta} pts toward fundamental component (max 35)` },
          { heading: 'Source', content: `FMP TTM ratios · local cache · auto-pulled ${today()}` },
        ],
        dryRun, eventsDir,
      });
      if (!dryRun) written.push(fp);
    } else if (!skipped) {
      console.log(`    ✓ No fundamental risk signals`);
    }
  }

  // ── SEC 8-K Governance ─────────────────────────────────────────────────────
  if (domain === 'all' || domain === 'regulatory') {
    console.log(`  📋 SEC 8-K governance (last ${SEC_LOOKBACK_DAYS}d)...`);
    const { findings, riskDelta, severity, skipped } = await scanSEC(ticker, vaultRoot);
    await sleep(150); // respect EDGAR 10 req/sec limit

    if (!skipped && findings.length > 0) {
      totalRiskDelta += riskDelta;
      const rows = findings.map(f => [f.date, f.form, f.label, f.items.join(', ')]);
      const fp = writeEventNote({
        ticker, companyName, eventType: 'Governance', severity,
        source: 'SEC EDGAR',
        link: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=8-K`,
        confidence: 'High', tags: ['governance', 'sec'],
        sections: [
          { heading: 'Summary', content: `${findings.length} governance signal(s) from 8-K filings in the last ${SEC_LOOKBACK_DAYS} days.` },
          { heading: 'Filings', content: buildTable(['Date', 'Form', 'Signal', 'Items'], rows) },
          { heading: 'Risk Delta', content: `+${riskDelta} pts toward regulatory component (max 40)` },
          { heading: 'Source', content: `SEC EDGAR submissions API · auto-pulled ${today()}` },
        ],
        dryRun, eventsDir,
      });
      if (!dryRun) written.push(fp);
    } else if (!skipped) {
      console.log(`    ✓ No governance signals in last ${SEC_LOOKBACK_DAYS}d`);
    }
  }

  // ── FDA Recalls (biotech/healthcare only) ──────────────────────────────────
  if (domain === 'all' || domain === 'regulatory') {
    const companyNotePath = join(companiesDir(vaultRoot), `${ticker}.md`);
    const sector = existsSync(companyNotePath)
      ? (parseFrontmatter(readFileSync(companyNotePath, 'utf-8')).sector ?? '').toLowerCase()
      : '';

    if (sector.includes('biotech') || sector.includes('healthcare') || sector.includes('pharma')) {
      console.log(`  💊 FDA enforcement records...`);
      const { findings, riskDelta, severity, skipped } = await scanFDA(companyName);
      if (!skipped && findings.length > 0) {
        totalRiskDelta += riskDelta;
        const rows = findings.map(f => [f.date, f.classification, f.product, f.reason]);
        const fp = writeEventNote({
          ticker, companyName, eventType: 'Regulatory', severity,
          source: 'FDA Enforcement (openFDA)',
          link: 'https://open.fda.gov/apis/drug/enforcement/',
          confidence: 'High', tags: ['regulatory', 'fda'],
          sections: [
            { heading: 'Summary', content: `${findings.length} FDA enforcement/recall record(s) found for ${companyName}.` },
            { heading: 'Recalls', content: buildTable(['Date', 'Class', 'Product', 'Reason'], rows) },
            { heading: 'Risk Delta', content: `+${riskDelta} pts toward regulatory component (max 40)` },
            { heading: 'Source', content: `openFDA enforcement API · auto-pulled ${today()}` },
          ],
          dryRun, eventsDir,
        });
        if (!dryRun) written.push(fp);
      } else if (!skipped) {
        console.log(`    ✓ No FDA enforcement records`);
      }
    }
  }

  // ── Sentiment (NewsAPI) ────────────────────────────────────────────────────
  if (domain === 'all' || domain === 'sentiment') {
    console.log(`  📰 Sentiment (NewsAPI, last ${NEWS_LOOKBACK_DAYS}d)...`);
    const { findings, riskDelta, severity, total, skipped } = await scanSentiment(companyName);
    if (!skipped && findings.length > 0) {
      totalRiskDelta += riskDelta;
      const rows = findings.slice(0, 15).map(f => [f.date, f.source, f.title]);
      const fp = writeEventNote({
        ticker, companyName, eventType: 'Sentiment', severity,
        source: 'NewsAPI', link: '', confidence: 'Low',
        tags: ['sentiment', 'news'],
        sections: [
          { heading: 'Summary', content: `${findings.length} negative-keyword article(s) out of ${total ?? '?'} total in the last ${NEWS_LOOKBACK_DAYS} days.` },
          { heading: 'Negative Articles', content: buildTable(['Date', 'Source', 'Headline'], rows) },
          { heading: 'Risk Delta', content: `+${riskDelta} pts toward sentiment component (max 25)` },
          { heading: 'Source', content: `NewsAPI everything endpoint · auto-pulled ${today()}` },
        ],
        dryRun, eventsDir,
      });
      if (!dryRun) written.push(fp);
    } else if (!skipped) {
      console.log(`    ✓ No negative sentiment signals`);
    }
  }

  // ── Risk score update ──────────────────────────────────────────────────────
  const cappedScore = Math.min(totalRiskDelta, 100);
  const band = cappedScore >= 60 ? 'High Priority'
    : cappedScore >= 40 ? 'Elevated Risk'
    : cappedScore >= 20 ? 'Watchlist'
    : 'Normal';

  console.log(`  📊 Risk delta this scan: +${cappedScore} pts → ${band}`);

  if (updateScore) {
    const companyNotePath = join(companiesDir(vaultRoot), `${ticker}.md`);
    if (!existsSync(companyNotePath)) {
      console.log(`  ⚠️  No company note at ${companyNotePath} — skipping score update`);
    } else if (dryRun) {
      console.log(`  [dry-run] Would set risk_score: ${cappedScore}, last_updated: ${today()}`);
    } else {
      updateFrontmatterField(companyNotePath, 'risk_score', cappedScore);
      updateFrontmatterField(companyNotePath, 'last_updated', today());
      console.log(`  ✓ Updated risk_score=${cappedScore} in ${companyNotePath}`);
    }
  }

  return { ticker, written, riskDelta: cappedScore };
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function pull(flags = {}) {
  const vaultRoot   = getVaultRoot();
  const domain      = flags.domain || 'all';
  const dryRun      = !!(flags['dry-run'] || flags.dryRun);
  const updateScore = !!(flags['update-score'] || flags.updateScore);

  if (dryRun) console.log('🔎 Dry-run mode — no files will be written\n');

  // ── Watchlist mode ─────────────────────────────────────────────────────────
  if (flags.watchlist) {
    const dir = companiesDir(vaultRoot);
    if (!existsSync(dir)) {
      throw new Error(`Companies directory not found: ${dir}\nAdd at least one company note using 03_Templates/Company_Risk.md first.`);
    }
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
      console.log('No company notes found in 12_Company_Risk/Companies/');
      return;
    }
    console.log(`📋 Watchlist scan: ${files.length} company note(s)\n`);
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8');
      const fm = parseFrontmatter(content);
      if (fm.status === 'Archived') {
        console.log(`⏭  Skipping archived: ${file}`);
        continue;
      }
      const ticker = (fm.ticker || '').toUpperCase() || file.replace('.md', '').toUpperCase();
      const companyName = file.replace('.md', '');
      await scanCompany({ ticker, companyName, domain, dryRun, updateScore, vaultRoot });
    }
    return;
  }

  // ── Single company mode ────────────────────────────────────────────────────
  const ticker = flags.ticker?.toUpperCase();
  if (!ticker) {
    throw new Error('--ticker TICKER is required (or use --watchlist to scan all company notes)');
  }
  const companyName = flags.company || ticker;

  await scanCompany({ ticker, companyName, domain, dryRun, updateScore, vaultRoot });
}
