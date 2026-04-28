/**
 * disclosure-reality.mjs - Counterparty confirmation starter report.
 *
 * Builds a first-pass research queue from recent EDGAR disclosures. The report
 * does not call a filing "bullish"; it ranks filings that deserve a read and
 * tells the analyst what outside evidence would confirm or weaken the claim.
 *
 * Usage:
 *   node run.mjs pull disclosure-reality
 *   node run.mjs pull disclosure-reality --tickers LDOS,ONTO,RGTI
 *   node run.mjs pull disclosure-reality --thesis defense --lookback 45
 *   node run.mjs pull disclosure-reality --sector technology --include-risk
 *   node run.mjs pull disclosure-reality --all --limit 25
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import {
  getAllTickers,
  getByTicker,
  getSectorTickers,
  getThesisTickers,
  stripCik,
} from '../lib/cik-map.mjs';
import {
  fetchRecentFilings,
  fetchTickerMap,
  OFFERING_8K_ITEMS,
} from '../lib/edgar.mjs';

const DEFAULT_LOOKBACK_DAYS = 45;
const DEFAULT_LIMIT = 20;

const STARTER_TICKERS = Object.freeze([
  'LDOS', 'ONTO', 'RGTI', 'FLNC', 'NBIX',
  'STRL', 'SMR', 'ASTS', 'JOBY', 'RCAT',
  'SPIR', 'SOUN', 'GEV', 'NOC', 'LMT', 'RTX',
]);

const POSITIVE_ITEMS = Object.freeze({
  '1.01': {
    label: 'Material agreement',
    points: 3,
    question: 'Is this a real economic contract or a loose strategic agreement?',
  },
  '2.01': {
    label: 'Acquisition / disposition',
    points: 2,
    question: 'Does the transaction improve strategic position, backlog, or capital efficiency?',
  },
  '2.02': {
    label: 'Earnings release',
    points: 1,
    question: 'Did guidance, margins, or cash conversion improve enough to change the thesis?',
  },
  '7.01': {
    label: 'Reg FD disclosure',
    points: 1,
    question: 'What is management choosing to emphasize to investors now?',
  },
  '8.01': {
    label: 'Other material event',
    points: 1,
    question: 'Is the event operationally measurable or mostly narrative?',
  },
});

const RISK_ITEMS = Object.freeze({
  '1.02': { label: 'Contract termination', points: -3 },
  '2.03': { label: 'Debt obligation', points: -1 },
  '3.01': { label: 'Listing notice', points: -4 },
  '3.02': { label: 'Unregistered securities', points: -2 },
  '4.01': { label: 'Auditor change', points: -3 },
  '5.02': { label: 'Executive / board change', points: -1 },
  '5.03': { label: 'Articles amendment', points: -1 },
});

export async function pull(flags = {}) {
  const lookbackDays = Math.max(1, Number(flags.lookback ?? flags['lookback-days']) || DEFAULT_LOOKBACK_DAYS);
  const since = flags.since ? String(flags.since) : daysAgo(lookbackDays);
  const limit = Math.max(1, Number(flags.limit) || DEFAULT_LIMIT);
  const minScore = flags['min-score'] === undefined ? 1 : Number(flags['min-score']);
  const includeRisk = Boolean(flags['include-risk']);

  const tickers = await resolveTickers(flags);
  console.log(`Disclosure Reality: scanning ${tickers.length} ticker(s) since ${since}...`);

  const rows = [];
  const errors = [];
  const tickerMap = new Map();

  for (const ticker of tickers) {
    let meta;
    try {
      meta = await resolveTickerMeta(ticker, tickerMap);
      if (!meta?.cik) {
        errors.push({ ticker, error: 'No CIK mapping found' });
        continue;
      }

      const filings = await fetchRecentFilings(meta.cik, {
        formTypes: ['8-K', '8-K/A'],
        since,
        limit: 40,
      });

      for (const filing of filings) {
        const candidate = scoreDisclosure({ ticker, meta, filing });
        if (!candidate.hasPositiveItem && !includeRisk) continue;
        if (candidate.score < minScore && !includeRisk) continue;
        rows.push(candidate);
      }
    } catch (err) {
      errors.push({ ticker, error: err.message });
    }
  }

  rows.sort((a, b) =>
    b.score - a.score
    || b.rawScore - a.rawScore
    || b.filing.filingDate.localeCompare(a.filing.filingDate)
    || a.ticker.localeCompare(b.ticker)
  );

  const selected = rows.slice(0, limit);
  const signalStatus = classifySignalStatus(selected);
  const signals = selected.length ? ['disclosure_reality_queue'] : [];
  const filePath = join(getPullsDir(), 'Fundamentals', dateStampedFilename('Disclosure_Reality_Check'));

  const note = buildNote({
    frontmatter: {
      title: 'Disclosure Reality Check',
      source: 'SEC EDGAR',
      date_pulled: today(),
      domain: 'fundamentals',
      data_type: 'disclosure_reality_check',
      frequency: 'on_demand',
      signal_status: signalStatus,
      signals,
      lookback_since: since,
      tickers_scanned: tickers.length,
      candidates_found: rows.length,
      tags: ['sec', 'edgar', 'disclosures', 'counterparty-confirmation', 'fundamentals'],
    },
    sections: [
      {
        heading: 'Executive Queue',
        content: selected.length
          ? buildTable(
              ['Score', 'Tier', 'Ticker', 'Theme', 'Filed', 'Items', 'Why Read', 'EDGAR'],
              selected.map(row => [
                String(row.score),
                row.tier,
                `[[${row.ticker}]]`,
                row.theme,
                row.filing.filingDate,
                row.filing.items.join(', ') || '-',
                row.whyRead,
                `[filing](${filingDocumentUrl(row)})`,
              ]),
            )
          : '_No candidate disclosures met the current filters._',
      },
      {
        heading: 'Disclosure Cards',
        content: selected.length
          ? selected.map(formatDisclosureCard).join('\n\n')
          : '_No disclosure cards generated._',
      },
      {
        heading: 'Counterparty Confirmation Paths',
        content: buildTable(
          ['Theme', 'Best Confirmation Sources'],
          confirmationPathRows(),
        ),
      },
      {
        heading: 'Rubric',
        content: [
          'This is a pre-read priority score, not a bullishness score.',
          '',
          buildTable(
            ['Item / Evidence', 'Points', 'Interpretation'],
            [
              ['8-K Item 1.01', '+3', 'Material agreement; verify counterparty, economics, duration, and termination rights.'],
              ['8-K Item 2.01', '+2', 'Acquisition or disposition; verify strategic fit and financing.'],
              ['8-K Item 2.02 / 7.01 / 8.01', '+1 each', 'Earnings, investor disclosure, or other material event. Useful only if externally confirmable.'],
              ['8-K Item 9.01', '+1', 'Exhibits attached; read EX-10 and EX-99 before scoring conviction.'],
              ['8-K Item 3.02', '-2', 'Unregistered securities; may dilute or finance the disclosure.'],
              ['8-K Item 1.02 / 4.01 / 3.01', '-3 to -4', 'Termination, auditor change, or listing notice. Treat as risk-first.'],
            ],
          ),
        ].join('\n'),
      },
      {
        heading: 'Coverage Notes',
        content: [
          `- Ticker universe: ${describeUniverse(flags)}.`,
          `- Lookback: ${since} through ${today()}.`,
          `- Minimum score: ${minScore}. Use \`--include-risk\` to show risk-first disclosures too.`,
          errors.length
            ? '\n' + buildTable(['Ticker', 'Issue'], errors.map(e => [e.ticker, e.error]))
            : '- No ticker-level fetch errors.',
        ].join('\n'),
      },
    ],
  });

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, candidates: selected.length, signals };
  }

  writeNote(filePath, note);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`Wrote: ${filePath}`);
  return { filePath, candidates: selected.length, signals };
}

async function resolveTickers(flags) {
  if (flags.tickers) return parseCsv(flags.tickers);

  if (flags.thesis) {
    return getThesisTickers(String(flags.thesis).toLowerCase())
      .map(entry => typeof entry === 'string' ? entry : entry.ticker)
      .filter(Boolean)
      .map(t => t.toUpperCase());
  }

  if (flags.sector) {
    return getSectorTickers(String(flags.sector))
      .map(entry => entry.ticker)
      .filter(Boolean)
      .map(t => t.toUpperCase());
  }

  if (flags.all) return getAllTickers();
  return [...STARTER_TICKERS];
}

function parseCsv(value) {
  return String(value)
    .split(',')
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);
}

async function resolveTickerMeta(ticker, tickerMap) {
  const local = getByTicker(ticker);
  if (local?.cik) return local;

  if (tickerMap.size === 0) {
    const secMap = await fetchTickerMap();
    for (const [key, value] of secMap.entries()) tickerMap.set(key, value);
  }

  const sec = tickerMap.get(ticker);
  return sec ? { ticker, ...sec, thesis: 'unmapped' } : { ticker };
}

function scoreDisclosure({ ticker, meta, filing }) {
  const items = filing.items ?? [];
  let rawScore = 0;
  const positives = [];
  const risks = [];

  for (const item of items) {
    if (POSITIVE_ITEMS[item]) {
      rawScore += POSITIVE_ITEMS[item].points;
      positives.push(`${item} ${POSITIVE_ITEMS[item].label}`);
    }
    if (RISK_ITEMS[item]) {
      rawScore += RISK_ITEMS[item].points;
      risks.push(`${item} ${RISK_ITEMS[item].label}`);
    }
  }

  if (items.includes('9.01') && positives.length > 0) rawScore += 1;
  if (items.includes(OFFERING_8K_ITEMS.MATERIAL_AGREEMENT) && (items.includes('7.01') || items.includes('8.01'))) {
    rawScore += 1;
  }

  const score = Math.max(0, Math.min(10, rawScore));
  const tier = score >= 6 ? 'high-priority'
    : score >= 4 ? 'promising'
    : score >= 1 ? 'mixed'
    : 'risk-first';

  return {
    ticker,
    meta,
    filing,
    rawScore,
    score,
    tier,
    positives,
    risks,
    hasPositiveItem: positives.length > 0,
    theme: meta.thesis ?? meta.sector ?? 'unmapped',
    whyRead: buildWhyRead(positives, risks),
    confirmationPath: confirmationPathFor(meta),
  };
}

function buildWhyRead(positives, risks) {
  const p = positives.length ? positives.join('; ') : 'No positive disclosure item';
  const r = risks.length ? ` Risk overlay: ${risks.join('; ')}.` : '';
  return `${p}.${r}`;
}

function formatDisclosureCard(row) {
  const positiveQuestions = row.filing.items
    .filter(item => POSITIVE_ITEMS[item])
    .map(item => `- [ ] ${POSITIVE_ITEMS[item].question}`);

  const riskChecks = row.risks.length
    ? row.risks.map(risk => `- [ ] Risk check: ${risk}. Does it fund, dilute, or weaken the disclosure?`)
    : ['- [ ] Risk check: no obvious negative 8-K item paired with the disclosure.'];

  return [
    `### ${row.ticker} - ${row.tier} (${row.score}/10)`,
    '',
    `- Filed: ${row.filing.filingDate} ${row.filing.formType}`,
    `- Items: ${row.filing.items.join(', ') || '-'}`,
    `- Theme: ${row.theme}`,
    `- Primary document: [${row.filing.primaryDoc || 'EDGAR'}](${filingDocumentUrl(row)})`,
    `- First external confirmation path: ${row.confirmationPath}`,
    '',
    '**Read checklist**',
    '- [ ] Identify named counterparty or customer.',
    '- [ ] Capture disclosed dollar value, minimum purchase, volume, or milestone terms.',
    '- [ ] Capture duration, exclusivity, renewal, and termination rights.',
    '- [ ] Check whether revenue is current-period, backlog, reimbursed R&D, or non-binding optionality.',
    ...positiveQuestions,
    ...riskChecks,
    '- [ ] Find one independent confirmation outside the issuer filing.',
    '- [ ] Decide whether the market is pricing this as real economics, future optionality, or promotional noise.',
  ].join('\n');
}

function confirmationPathFor(meta) {
  const key = String(meta.thesis ?? meta.sector ?? '').toLowerCase();

  if (/(defense|drones|hypersonics|space|aerospace)/.test(key)) {
    return 'USASpending, SAM.gov, DoD contract announcements, prime/subcontractor filings, and budget-line documents.';
  }
  if (/(semis|technology|quantum|humanoid)/.test(key)) {
    return 'Customer/partner filings, CHIPS or export-control records, capex plans, patent assignments, and supplier job postings.';
  }
  if (/(aipower|storage|nuclear|energy|clean)/.test(key)) {
    return 'FERC/EIA records, utility IRPs, interconnection queues, power-purchase agreements, and data-center load announcements.';
  }
  if (/(amr|psychedelics|glp1|geneediting|alzheimers|longevity|health)/.test(key)) {
    return 'ClinicalTrials.gov, FDA documents, partner filings, trial registries, and licensing-counterparty disclosures.';
  }
  if (/(housing|real estate|consumer)/.test(key)) {
    return 'Permits, lender/tenant/customer disclosures, regional demand data, and counterparty press releases.';
  }
  if (/(financial|hardmoney)/.test(key)) {
    return 'Regulatory filings, rating-agency actions, capital markets terms, custody/issuer disclosures, and balance-sheet notes.';
  }
  return 'Counterparty filings, press releases, procurement databases, industry records, and exhibit-level contract terms.';
}

function confirmationPathRows() {
  return [
    ['Defense / drones / space', 'USASpending, SAM.gov, DoD daily contracts, prime/subcontractor filings, budget exhibits.'],
    ['Semis / quantum / tech', 'Customer filings, CHIPS records, export-control notices, capex plans, patents, supplier hiring.'],
    ['Power / storage / nuclear', 'FERC, EIA, utility IRPs, interconnection queues, PPAs, data-center power announcements.'],
    ['Biotech / healthcare', 'ClinicalTrials.gov, FDA, partner filings, licensing exhibits, trial-registry changes.'],
    ['Consumer / housing / real estate', 'Permits, lender/customer/tenant disclosures, regional demand data, counterparty releases.'],
    ['Financials / hard assets', 'Regulatory filings, ratings actions, capital markets terms, custody/issuer disclosures.'],
  ];
}

function classifySignalStatus(rows) {
  if (rows.some(row => row.score >= 7)) return 'alert';
  if (rows.some(row => row.score >= 4)) return 'watch';
  return rows.length ? 'watch' : 'clear';
}

function filingDocumentUrl(row) {
  const cik = stripCik(row.meta.cik);
  const acc = row.filing.accession || String(row.filing.accessionRaw || '').replace(/-/g, '');
  if (!cik || !acc || !row.filing.primaryDoc) return row.filing.url;
  return `https://www.sec.gov/Archives/edgar/data/${cik}/${acc}/${row.filing.primaryDoc}`;
}

function describeUniverse(flags) {
  if (flags.tickers) return `explicit tickers (${parseCsv(flags.tickers).join(', ')})`;
  if (flags.thesis) return `thesis "${flags.thesis}"`;
  if (flags.sector) return `sector "${flags.sector}"`;
  if (flags.all) return 'all known thesis and sector tickers';
  return `starter disclosure list (${STARTER_TICKERS.join(', ')})`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
