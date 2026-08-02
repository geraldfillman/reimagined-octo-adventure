/**
 * edgar-health.mjs — Corporate Health, Integrity & Market-Behavior markers.
 *
 * Implements the quantitative layer of the Corporate Health, Integrity &
 * Market-Behavior Framework (04_Reference/Corporate_Health_Integrity_Framework.md):
 * §5 screening bands from XBRL company-facts plus the §9.2 relative-performance
 * prompt from Yahoo daily prices (keyless — no FMP quota).
 *
 * Command (router group `edgar`):
 *   edgar health --ticker PLTR [--benchmark XLK] [--profile general|bank|reit]
 *                [--review] [--force] [--dry-run]
 *
 * Outputs:
 *   05_Data_Pulls/Edgar/YYYY-MM-DD_EDGAR_Health_<TICKER>.md   (always)
 *   13_Company_Intel/Reviews/YYYY-MM-DD - <TICKER> - Health Review.md   (--review)
 *
 * Band classification and signal rollup are pure functions in
 * scripts/lib/health-markers.mjs so they stay unit-testable without network.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fetchSubmissions, fetchCompanyFacts } from '../lib/edgar.mjs';
import {
  resolveCompany,
  fiscalYearValues,
  shouldWriteArtifacts,
} from './edgar-company.mjs';
import { SKELETON_PROFILES, selectSkeletonProfile } from '../lib/skeleton-profiles.mjs';
import { buildNote, buildTable, writeNote, dateStampedFilename, today } from '../lib/markdown.mjs';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { fetchYahooDailyPrices } from '../lib/yahoo-client.mjs';
import {
  BAND,
  HEALTH_SERIES_SPECS,
  computeHealthMarkers,
  computeRelativeReturn,
  detectReportingCurrency,
  relativePerformanceMarker,
  summarizeMarkers,
} from '../lib/health-markers.mjs';

const PULL_FOLDER = 'Edgar';
const REVIEW_FOLDER = join('13_Company_Intel', 'Reviews');
const REVIEW_TEMPLATE = join('03_Templates', 'Health_Review.md');
const DEFAULT_BENCHMARK = 'SPY';
const SERIES_YEARS = 6; // 5-year cumulative markers + one prior year for growth rates

const BAND_ICONS = Object.freeze({
  [BAND.CONSTRUCTIVE]: '🟢',
  [BAND.INVESTIGATE]: '🟡',
  [BAND.CONCERN]: '🔴',
  [BAND.NA]: '⚪',
});

/**
 * Extract every framework series from one company-facts document.
 * Monetary series use the filer's detected reporting currency (TSM → TWD,
 * NVO → DKK) unless one is passed explicitly — every series shares the same
 * unit, so no marker ever mixes currencies. Exported for tests.
 */
export function buildHealthSeries(companyFacts, { currency } = {}) {
  const reportingCurrency = currency ?? detectReportingCurrency(companyFacts) ?? 'USD';
  const series = {};
  for (const [key, spec] of Object.entries(HEALTH_SERIES_SPECS)) {
    series[key] = fiscalYearValues(companyFacts, spec.concepts, {
      unit: spec.unit ?? reportingCurrency,
      kind: spec.kind,
      limit: SERIES_YEARS,
    });
  }
  return series;
}

/** Markdown table rows for the marker set. Exported for tests. */
export function markerTableRows(markers) {
  return markers.map(m => [
    `${BAND_ICONS[m.band] ?? ''} ${m.band}`,
    m.section,
    m.label,
    m.display,
    m.detail,
  ]);
}

function resolveProfileKey(flagValue, sic) {
  if (flagValue) {
    const key = String(flagValue).toLowerCase();
    if (!SKELETON_PROFILES[key]) {
      throw new Error(`Unknown --profile "${flagValue}" — expected one of: ${Object.keys(SKELETON_PROFILES).join(', ')}`);
    }
    return key;
  }
  return selectSkeletonProfile(sic).key;
}

async function fetchRelativePerformance(ticker, benchmark) {
  try {
    const [stock, bench] = [
      await fetchYahooDailyPrices(ticker, { range: '1y' }),
      await fetchYahooDailyPrices(benchmark, { range: '1y' }),
    ];
    return computeRelativeReturn(stock, bench);
  } catch (error) {
    console.warn(`⚠️  Yahoo price history unavailable (${error.message}) — §9 market section left as an explicit gap.`);
    return null;
  }
}

function coverageRows(series) {
  return Object.entries(series).map(([key, entries]) => [
    key,
    String(entries.length),
    entries[0]?.end ?? '—',
    entries[entries.length - 1]?.end ?? '—',
  ]);
}

function reviewFilename(ticker) {
  return `${today()} - ${ticker} - Health Review.md`;
}

/**
 * Scaffold a Health Review note from the template, pre-linked to the marker
 * pull note. Mirrors edgar scaffold's literal `field: ""` replacement pattern.
 */
function scaffoldReview({ ticker, name, periodEnd, pullLink, force }) {
  const templatePath = join(getVaultRoot(), REVIEW_TEMPLATE);
  if (!existsSync(templatePath)) {
    throw new Error(`Review template missing at ${REVIEW_TEMPLATE} — re-create it from the framework §18.`);
  }
  const targetPath = join(getVaultRoot(), REVIEW_FOLDER, reviewFilename(ticker));
  if (existsSync(targetPath) && !force) {
    console.log(`ℹ️  Review already exists (${reviewFilename(ticker)}) — use --force to overwrite.`);
    return targetPath;
  }
  const content = readFileSync(templatePath, 'utf-8')
    .replaceAll('{{company}}', name)
    .replaceAll('{{ticker}}', ticker)
    .replace('date: ""', `date: "${today()}"`)
    .replace('company: ""', `company: "${name}"`)
    .replace('ticker: ""', `ticker: "${ticker}"`)
    .replace('period: ""', periodEnd ? `period: "FY ending ${periodEnd}"` : 'period: ""')
    .replace('markers_pull: ""', `markers_pull: "[[${pullLink}]]"`);
  if (content.includes('{{') || !content.includes(`date: "${today()}"`)) {
    console.warn('⚠️  Review template placeholders did not fully substitute — the template frontmatter literals may have drifted from what scaffoldReview expects.');
  }
  writeNote(targetPath, content);
  return targetPath;
}

export async function health(flags = {}) {
  const benchmark = String(flags.benchmark ?? DEFAULT_BENCHMARK).toUpperCase();

  if (!shouldWriteArtifacts(flags)) {
    const { ticker } = await resolveCompany(flags.ticker, { allowNetwork: false });
    console.log('🔎 Dry run — no network calls, no writes. Plan:');
    console.log(JSON.stringify({
      command: 'edgar health',
      ticker,
      benchmark,
      profile: flags.profile ?? '(auto from SIC)',
      wouldFetch: [
        `data.sec.gov companyfacts + submissions for ${ticker}`,
        `Yahoo 1y daily prices for ${ticker} and ${benchmark}`,
      ],
      wouldWrite: [
        join('05_Data_Pulls', PULL_FOLDER, dateStampedFilename(`EDGAR_Health_${ticker}`)),
        ...(flags.review ? [join(REVIEW_FOLDER, reviewFilename(ticker))] : []),
      ],
    }, null, 2));
    return { dryRun: true };
  }

  const { ticker, cik, name } = await resolveCompany(flags.ticker);
  console.log(`🩺 Health markers for ${name} (${ticker}, CIK ${cik})...`);

  const companyFacts = await fetchCompanyFacts(cik);
  if (!companyFacts) {
    throw new Error(`No XBRL company-facts available for ${ticker} (CIK ${cik}) — cannot compute §5 markers.`);
  }
  let submissions = null;
  if (!flags.profile) {
    try {
      submissions = await fetchSubmissions(cik);
    } catch (error) {
      console.warn(`⚠️  Submissions fetch failed (${error.message}) — defaulting to the general profile; rerun with --profile bank|reit if this filer needs §14 suppression.`);
    }
  }
  const profileKey = resolveProfileKey(flags.profile, submissions?.sic);

  const reportingCurrency = detectReportingCurrency(companyFacts) ?? 'USD';
  if (reportingCurrency !== 'USD') {
    console.log(`💱 Foreign filer detected — computing §5 markers in ${reportingCurrency} (ratios are currency-agnostic).`);
  }
  const series = buildHealthSeries(companyFacts, { currency: reportingCurrency });
  const filingMarkers = computeHealthMarkers(series, { profileKey });

  const relative = await fetchRelativePerformance(ticker, benchmark);
  const markers = [...filingMarkers, relativePerformanceMarker(relative, benchmark)];
  const summary = summarizeMarkers(markers, ticker);

  const filename = dateStampedFilename(`EDGAR_Health_${ticker}`);
  const pullLink = `05_Data_Pulls/${PULL_FOLDER}/${filename.replace(/\.md$/, '')}`;
  const latestEnd = series.revenue?.[0]?.end ?? series.netIncome?.[0]?.end ?? null;

  const note = buildNote({
    frontmatter: {
      title: `EDGAR Health Markers — ${name}`,
      source: 'sec-edgar',
      date_pulled: today(),
      domain: 'edgar',
      data_type: 'health_markers',
      skeleton_profile: profileKey,
      frequency: 'on-demand',
      signal_status: summary.status,
      signals: summary.signals,
      symbol: ticker,
      cik,
      company: name,
      benchmark,
      reporting_currency: reportingCurrency,
      tags: ['edgar', 'company-intel', 'health-review'],
    },
    sections: [
      {
        heading: 'How to read this',
        content: [
          `Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **${profileKey}**, reporting currency: **${reportingCurrency}**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.`,
          '',
          '> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.',
          '',
          `Rollup: 🟢 ${summary.counts.constructive} constructive · 🟡 ${summary.counts.investigate} investigate · 🔴 ${summary.counts.concern} concern · ⚪ ${summary.counts['n/a']} n/a → \`signal_status: ${summary.status}\``,
        ].join('\n'),
      },
      {
        heading: 'Markers',
        content: buildTable(
          ['Band', '§', 'Marker', 'Value', 'Next step / context'],
          markerTableRows(markers),
        ),
      },
      {
        heading: 'Fiscal-year coverage',
        content: [
          'Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.',
          '',
          buildTable(['Series', 'Years', 'Latest FY end', 'Oldest FY end'], coverageRows(series)),
        ].join('\n'),
      },
      {
        heading: 'Next steps',
        content: [
          '1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.',
          '2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.',
          `3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with \`node run.mjs edgar health --ticker ${ticker} --review\`.`,
          '4. Check §7.3 hard-stop events before trusting any score.',
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), PULL_FOLDER, filename);
  writeNote(filePath, note);
  console.log(`✅ Marker pull note → ${filePath}`);
  console.log(`   ${summary.counts.concern} concern · ${summary.counts.investigate} investigate · signal_status: ${summary.status}`);

  let reviewPath = null;
  if (flags.review) {
    reviewPath = scaffoldReview({
      ticker,
      name,
      periodEnd: latestEnd,
      pullLink,
      force: Boolean(flags.force),
    });
    console.log(`✅ Health Review scaffold → ${reviewPath}`);
  }

  return { filePath, reviewPath, markers, status: summary.status };
}
