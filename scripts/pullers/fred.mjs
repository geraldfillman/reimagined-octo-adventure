/**
 * fred.mjs — FRED API puller
 *
 * Pulls economic time series from the Federal Reserve Economic Data API.
 * Supports grouped pulls (housing, labor, inflation, rates, credit)
 * and individual series. Evaluates signals against thresholds.
 *
 * Usage:
 *   node run.mjs fred --group housing
 *   node run.mjs fred --group rates
 *   node run.mjs fred --series HOUST,UNRATE
 *   node run.mjs fred --limit 24
 */

import { join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import {
  evaluateYieldCurve, evaluateUnemploymentSpike,
  evaluateHousingStarts, evaluateMortgageRate,
  evaluateCPI, evaluateInitialClaims,
  evaluateFedBalanceSheet, evaluateCreditSpreads, evaluateReverseRepo,
  highestSeverity, formatSignalsSection,
} from '../lib/signals.mjs';
import { findLatestPull, extractFirstTableValue, momChange, pointChange } from '../lib/history.mjs';

/** FRED series groups — each answers an investment question */
const SERIES_GROUPS = {
  housing: {
    name: 'Housing',
    domain: 'Housing',
    question: 'Is housing expanding or contracting?',
    series: [
      { id: 'HOUST', name: 'Housing Starts', unit: 'Thousands', frequency: 'Monthly' },
      { id: 'PERMIT', name: 'Building Permits', unit: 'Thousands', frequency: 'Monthly' },
      { id: 'CSUSHPINSA', name: 'Case-Shiller Home Price Index', unit: 'Index', frequency: 'Monthly' },
      { id: 'MORTGAGE30US', name: '30-Year Fixed Mortgage Rate', unit: 'Percent', frequency: 'Weekly' },
    ],
  },
  labor: {
    name: 'Labor Market',
    domain: 'Macro',
    question: 'Is the labor market tight or loosening?',
    series: [
      { id: 'UNRATE', name: 'Unemployment Rate', unit: 'Percent', frequency: 'Monthly' },
      { id: 'PAYEMS', name: 'Total Nonfarm Payrolls', unit: 'Thousands', frequency: 'Monthly' },
      { id: 'AHETPI', name: 'Avg Hourly Earnings', unit: 'Dollars', frequency: 'Monthly' },
      { id: 'ICSA', name: 'Initial Jobless Claims', unit: 'Number', frequency: 'Weekly' },
    ],
  },
  inflation: {
    name: 'Inflation',
    domain: 'Macro',
    question: 'Is inflation hot, cold, or anchored?',
    series: [
      { id: 'CPIAUCSL', name: 'CPI All Items', unit: 'Index', frequency: 'Monthly' },
      { id: 'CPILFESL', name: 'Core CPI (ex Food & Energy)', unit: 'Index', frequency: 'Monthly' },
      { id: 'PCEPI', name: 'PCE Price Index', unit: 'Index', frequency: 'Monthly' },
      { id: 'T10YIE', name: '10-Year Breakeven Inflation', unit: 'Percent', frequency: 'Daily' },
    ],
  },
  rates: {
    name: 'Interest Rates',
    domain: 'Macro',
    question: "What's the rate regime and curve shape?",
    series: [
      { id: 'DFF', name: 'Federal Funds Rate', unit: 'Percent', frequency: 'Daily' },
      { id: 'DGS2', name: '2-Year Treasury Yield', unit: 'Percent', frequency: 'Daily' },
      { id: 'DGS10', name: '10-Year Treasury Yield', unit: 'Percent', frequency: 'Daily' },
      { id: 'DGS30', name: '30-Year Treasury Yield', unit: 'Percent', frequency: 'Daily' },
      { id: 'T10Y2Y', name: '10Y-2Y Spread', unit: 'Percent', frequency: 'Daily' },
    ],
  },
  credit: {
    name: 'Credit Conditions',
    domain: 'Macro',
    question: 'Are lending conditions tightening?',
    series: [
      { id: 'DRTSCILM', name: 'Loan Officer Survey (C&I Tightening)', unit: 'Percent', frequency: 'Quarterly' },
      { id: 'BUSLOANS', name: 'Commercial & Industrial Loans', unit: 'Billions', frequency: 'Weekly' },
      { id: 'TOTCI', name: 'Total Consumer Credit', unit: 'Billions', frequency: 'Monthly' },
    ],
  },
  liquidity: {
    name: 'Liquidity',
    domain: 'Macro',
    question: 'Is the market running on fuel or friction?',
    series: [
      { id: 'WALCL', name: 'Fed Total Assets (Balance Sheet)', unit: 'Millions', frequency: 'Weekly' },
      { id: 'RRPONTSYD', name: 'Overnight Reverse Repo', unit: 'Billions', frequency: 'Daily' },
      { id: 'BAMLH0A0HYM2', name: 'ICE BofA US High Yield Spread', unit: 'Percent', frequency: 'Daily' },
      { id: 'BAMLC0A4CBBB', name: 'ICE BofA BBB Corporate Spread', unit: 'Percent', frequency: 'Daily' },
      { id: 'WRESBAL', name: 'Reserve Balances with Fed Banks', unit: 'Millions', frequency: 'Weekly' },
    ],
  },
};

/**
 * Main pull function.
 * @param {object} flags — CLI flags
 */
export async function pull(flags = {}) {
  const apiKey = getApiKey('fred');
  const baseUrl = getBaseUrl('fred');
  const limit = parseInt(flags.limit) || 12;

  let seriesToPull = [];
  let groupName = null;
  let group = null;

  if (flags.group === 'macro') {
    // 'macro' is an alias that runs all groups sequentially
    console.log(`📊 FRED: Running all groups (macro alias)...\n`);
    const allResults = [];
    for (const key of Object.keys(SERIES_GROUPS)) {
      const result = await pull({ ...flags, group: key });
      allResults.push(result);
    }
    return allResults;
  }

  if (flags.group) {
    group = SERIES_GROUPS[flags.group];
    if (!group) {
      throw new Error(
        `Unknown FRED group: "${flags.group}". Available: macro (all), ${Object.keys(SERIES_GROUPS).join(', ')}`
      );
    }
    groupName = flags.group;
    seriesToPull = group.series;
    console.log(`📊 FRED: Pulling ${group.name} group (${seriesToPull.length} series)`);
    console.log(`   Question: ${group.question}\n`);
  } else if (flags.series) {
    const ids = flags.series.split(',').map(s => s.trim().toUpperCase());
    seriesToPull = ids.map(id => ({ id, name: id, unit: '', frequency: '' }));
    groupName = 'custom';
    console.log(`📊 FRED: Pulling ${ids.length} custom series\n`);
  } else {
    throw new Error('Specify --group <name> or --series <IDS>. Run "node run.mjs help" for options.');
  }

  // Fetch all series
  const results = {};
  for (const series of seriesToPull) {
    console.log(`  Fetching ${series.id} (${series.name})...`);
    const url = `${baseUrl}/series/observations?series_id=${series.id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;

    try {
      const data = await getJson(url);
      const observations = (data.observations || [])
        .filter(o => o.value !== '.')
        .map(o => ({ date: o.date, value: parseFloat(o.value) }));

      results[series.id] = {
        ...series,
        observations,
        latest: observations[0] || null,
        prior: observations[1] || null,
      };

      if (observations[0]) {
        console.log(`    Latest: ${observations[0].date} = ${observations[0].value}`);
      } else {
        console.log(`    No data returned`);
      }
    } catch (err) {
      console.warn(`    ⚠️ Failed: ${err.message}`);
      results[series.id] = { ...series, observations: [], latest: null, prior: null, error: err.message };
    }
  }

  // Evaluate signals
  const signals = evaluateGroupSignals(groupName, results);

  if (signals.length > 0) {
    console.log(`\n⚡ ${signals.length} signal(s) fired:`);
    for (const s of signals) {
      const icon = { critical: '🔴', alert: '🟠', watch: '🟡' }[s.severity];
      console.log(`  ${icon} ${s.name}: ${s.message}`);
    }
  } else {
    console.log(`\n⚪ No signals — all clear.`);
  }

  // Build markdown note
  const domain = group?.domain || 'Macro';
  const noteName = group ? `FRED_${group.name.replace(/\s+/g, '_')}` : `FRED_Custom`;

  const tableHeaders = ['Series', 'Name', 'Latest Date', 'Latest Value', 'Prior Value', 'Change'];
  const tableRows = seriesToPull.map(s => {
    const r = results[s.id];
    if (!r?.latest) return [s.id, s.name, 'N/A', 'N/A', 'N/A', 'N/A'];

    const latestVal = r.latest.value;
    const priorVal = r.prior?.value;
    let change = 'N/A';
    if (priorVal != null) {
      if (s.unit === 'Percent' || s.unit === 'Index') {
        change = `${pointChange(latestVal, priorVal)?.toFixed(2) ?? 'N/A'}`;
      } else {
        const pct = momChange(latestVal, priorVal);
        change = pct != null ? `${pct.toFixed(1)}%` : 'N/A';
      }
    }

    return [
      s.id,
      s.name,
      r.latest.date,
      formatNumber(latestVal, { decimals: 2 }),
      priorVal != null ? formatNumber(priorVal, { decimals: 2 }) : 'N/A',
      change,
    ];
  });

  // Individual series detail tables
  const detailSections = seriesToPull.map(s => {
    const r = results[s.id];
    if (!r?.observations?.length) return null;

    const detailHeaders = ['Date', `Value (${s.unit || 'Value'})`];
    const detailRows = r.observations.map(o => [o.date, formatNumber(o.value, { decimals: 2 })]);

    return {
      heading: `${s.name} (${s.id})`,
      content: buildTable(detailHeaders, detailRows),
    };
  }).filter(Boolean);

  const signalStatus = highestSeverity(signals);
  const signalsForFrontmatter = signals.map(s => ({
    id: s.id,
    severity: s.severity,
    value: s.value,
    threshold: s.threshold,
    message: s.message,
  }));

  const note = buildNote({
    frontmatter: {
      title: `FRED ${group?.name || 'Custom'} Pull`,
      source: 'FRED API',
      date_pulled: today(),
      domain: domain.toLowerCase(),
      data_type: 'time_series',
      frequency: 'varies',
      signal_status: signalStatus,
      signals: signalsForFrontmatter,
      tags: ['fred', groupName || 'custom', domain.toLowerCase()],
      related_pulls: [],
    },
    sections: [
      {
        heading: group?.question || 'FRED Data Pull',
        content: buildTable(tableHeaders, tableRows),
      },
      ...(signals.length > 0 ? [{
        heading: 'Signals',
        content: formatSignalsSection(signals),
      }] : []),
      ...detailSections,
      {
        heading: 'Source',
        content: [
          `- **API**: FRED (Federal Reserve Economic Data)`,
          `- **Series**: ${seriesToPull.map(s => s.id).join(', ')}`,
          `- **Observations**: Last ${limit} per series`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  // Write note
  const filePath = join(getPullsDir(), domain, dateStampedFilename(noteName));
  writeNote(filePath, note);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`\n📝 Wrote: ${filePath}`);

  // Write signal logs if any fired
  if (signals.length > 0) {
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
          source_pull: noteName,
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
      console.log(`⚡ Signal logged: ${signalPath}`);
    }
  }

  return { filePath, signals };
}

/**
 * Evaluate signals based on group data.
 */
function evaluateGroupSignals(groupName, results) {
  const signals = [];

  // Yield curve signals (rates group)
  if (results.DGS10?.latest && results.DGS2?.latest) {
    const signal = evaluateYieldCurve(results.DGS10.latest.value, results.DGS2.latest.value);
    if (signal) signals.push(signal);
  }

  // Also check T10Y2Y directly
  if (results.T10Y2Y?.latest) {
    const spread = results.T10Y2Y.latest.value;
    if (spread < 0 && !signals.find(s => s.id === 'YIELD_CURVE_INVERSION')) {
      const signal = evaluateYieldCurve(spread + results.DGS2?.latest?.value, results.DGS2?.latest?.value);
      if (signal) signals.push(signal);
    }
  }

  // Unemployment signals
  if (results.UNRATE?.latest && results.UNRATE?.prior) {
    const signal = evaluateUnemploymentSpike(results.UNRATE.latest.value, results.UNRATE.prior.value);
    if (signal) signals.push(signal);
  }

  // Housing starts signals
  if (results.HOUST?.latest && results.HOUST?.prior) {
    const signal = evaluateHousingStarts(results.HOUST.latest.value, results.HOUST.prior.value);
    if (signal) signals.push(signal);
  }

  // Mortgage rate signals
  if (results.MORTGAGE30US?.latest && results.MORTGAGE30US?.prior) {
    const signal = evaluateMortgageRate(results.MORTGAGE30US.latest.value, results.MORTGAGE30US.prior.value);
    if (signal) signals.push(signal);
  }

  // CPI signals (need YoY calculation)
  if (results.CPIAUCSL?.observations?.length >= 12) {
    const current = results.CPIAUCSL.observations[0].value;
    const yearAgo = results.CPIAUCSL.observations[11]?.value;
    if (current && yearAgo) {
      const yoy = ((current - yearAgo) / yearAgo) * 100;
      const signal = evaluateCPI(yoy);
      if (signal) signals.push(signal);
    }
  }

  // Initial claims signals (need 4-week avg comparison)
  if (results.ICSA?.observations?.length >= 8) {
    const recent4 = results.ICSA.observations.slice(0, 4).reduce((s, o) => s + o.value, 0) / 4;
    const prior4 = results.ICSA.observations.slice(4, 8).reduce((s, o) => s + o.value, 0) / 4;
    const signal = evaluateInitialClaims(recent4, prior4);
    if (signal) signals.push(signal);
  }

  // Liquidity signals
  if (results.WALCL?.latest && results.WALCL?.prior) {
    const signal = evaluateFedBalanceSheet(results.WALCL.latest.value, results.WALCL.prior.value);
    if (signal) signals.push(signal);
  }

  if (results.BAMLH0A0HYM2?.latest && results.BAMLH0A0HYM2?.prior) {
    const signal = evaluateCreditSpreads(results.BAMLH0A0HYM2.latest.value, results.BAMLH0A0HYM2.prior.value);
    if (signal) signals.push(signal);
  }

  if (results.RRPONTSYD?.latest && results.RRPONTSYD?.prior) {
    const signal = evaluateReverseRepo(results.RRPONTSYD.latest.value, results.RRPONTSYD.prior.value);
    if (signal) signals.push(signal);
  }

  return signals;
}
