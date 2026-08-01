/**
 * cot-report.mjs — CFTC Commitment of Traders weekly positioning report.
 *
 * Fetches the latest COT legacy futures-only report from the CFTC public data
 * portal, parses key financial markets, and surfaces speculative positioning
 * extremes as macro signals.
 *
 * Released every Friday by CFTC (~3:30 PM ET). Runs as part of the weekly
 * agent cadence: node run.mjs pull agent-run --cadence weekly
 *
 * Standalone:
 *   node run.mjs pull cot-report
 *   node run.mjs pull cot-report --dry-run
 *
 * Output: 05_Data_Pulls/Macro/YYYY-MM-DD_COT_Report.md
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

// CFTC Public Reporting API (Socrata) — Legacy COT, Futures Only, all exchanges.
// The old flat-file endpoint (cftc.gov/files/dea/newcot/*.txt) now sits behind a
// WAF that 403s non-browser clients; the Socrata dataset is the stable surface.
const COT_API = 'https://publicreporting.cftc.gov/resource/6dca-aqww.json';

// Markets to track. `matches` are ordered case-insensitive name PREFIXES —
// first hit wins. Prefix matching avoids grabbing cross-rates ("EURO FX/...")
// or nano/micro variants. Later entries are legacy-name fallbacks.
const TRACKED_MARKETS = [
  { key: 'ES',  matches: ['E-MINI S&P 500 -'],                                          label: 'E-Mini S&P 500',    category: 'equities'    },
  { key: 'NQ',  matches: ['NASDAQ MINI -', 'E-MINI NASDAQ-100'],                        label: 'E-Mini Nasdaq-100', category: 'equities'    },
  { key: 'ZN',  matches: ['UST 10Y NOTE', '10-YEAR T-NOTES'],                           label: '10-Year T-Notes',   category: 'rates'       },
  { key: 'ZB',  matches: ['UST BOND', 'U.S. TREASURY BONDS'],                           label: 'T-Bonds',           category: 'rates'       },
  { key: 'GC',  matches: ['GOLD - COMMODITY'],                                          label: 'Gold',              category: 'commodities' },
  { key: 'CL',  matches: ['WTI-PHYSICAL', 'CRUDE OIL, LIGHT SWEET', 'WTI FINANCIAL'],   label: 'Crude Oil (WTI)',   category: 'commodities' },
  { key: 'NG',  matches: ['NAT GAS NYME', 'NATURAL GAS -', 'HENRY HUB -'],              label: 'Natural Gas',       category: 'commodities' },
  { key: 'HG',  matches: ['COPPER- #1', 'COPPER -'],                                    label: 'Copper',            category: 'commodities' },
  { key: 'ZW',  matches: ['WHEAT-SRW'],                                                 label: 'Wheat (SRW)',       category: 'commodities' },
  { key: 'ZC',  matches: ['CORN -'],                                                    label: 'Corn',              category: 'commodities' },
  { key: 'ZS',  matches: ['SOYBEANS -'],                                                label: 'Soybeans',          category: 'commodities' },
  { key: '6E',  matches: ['EURO FX -'],                                                 label: 'Euro FX',           category: 'currencies'  },
  { key: '6J',  matches: ['JAPANESE YEN -'],                                            label: 'Japanese Yen',      category: 'currencies'  },
  { key: 'BTC', matches: ['BITCOIN -', 'MICRO BITCOIN -'],                              label: 'Bitcoin',           category: 'crypto'      },
];

// Positioning extremes that generate signals.
// NET spec share = (spec long % of OI) − (spec short % of OI). Gross long%
// alone misreads commodity markets, where commercial hedgers dominate OI and
// spec longs rarely exceed ~35% even in manias.
// Net > +30% of OI → crowded long (reversal risk); net < −30% → crowded short.
// |week-over-week net spec change| > 8% of OI → rapid shift.
const EXTREME_NET_LONG_PCT  = 30;
const EXTREME_NET_SHORT_PCT = -30;
const SHIFT_THRESHOLD       = 8;

export async function pull(flags = {}) {
  console.log('COT Report: fetching CFTC Commitment of Traders data...');

  let parsed;
  try {
    parsed = await fetchCotData();
  } catch (err) {
    console.error(`COT Report: fetch failed — ${err.message}`);
    return writeFallbackNote(err.message, flags);
  }

  const tracked      = extractTrackedMarkets(parsed);
  const analyzed     = analyzePositioning(tracked);
  const reportDate   = tracked[0]?.report_date ?? today();
  const alertCount   = analyzed.filter(m => m.signal !== 'clear').length;
  const overallStatus = alertCount >= 3 ? 'alert' : alertCount >= 1 ? 'watch' : 'clear';

  console.log(`COT Report: ${tracked.length} markets | report date: ${reportDate} | status: ${overallStatus}`);

  const note     = buildCotNote({ analyzed, reportDate, overallStatus });
  const filePath = join(getPullsDir(), 'Macro', dateStampedFilename('COT_Report'));

  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    console.log(`Wrote: ${filePath}`);
  }

  return {
    filePath:      flags['dry-run'] ? null : filePath,
    marketCount:   tracked.length,
    reportDate,
    signal_status: overallStatus,
  };
}

// ─── Data fetch (CFTC Socrata API) ────────────────────────────────────────────

async function fetchCotData() {
  const headers = { Accept: 'application/json' };
  const appToken = process.env.SOCRATA_APP_TOKEN?.trim();
  if (appToken) headers['X-App-Token'] = appToken;
  const opts = { headers, signal: AbortSignal.timeout(30_000) };

  const maxRes = await fetch(`${COT_API}?$select=max(report_date_as_yyyy_mm_dd)`, opts);
  if (!maxRes.ok) throw new Error(`HTTP ${maxRes.status} from CFTC Socrata (max date)`);
  const reportDate = (await maxRes.json())[0]?.max_report_date_as_yyyy_mm_dd;
  if (!reportDate) throw new Error('CFTC Socrata returned no report dates');

  const fields = [
    'market_and_exchange_names', 'report_date_as_yyyy_mm_dd', 'open_interest_all',
    'noncomm_positions_long_all', 'noncomm_positions_short_all',
    'change_in_noncomm_long_all', 'change_in_noncomm_short_all',
    'pct_of_oi_noncomm_long_all', 'pct_of_oi_noncomm_short_all',
  ].join(',');
  const url = `${COT_API}?$select=${fields}&$where=report_date_as_yyyy_mm_dd='${reportDate}'&$limit=5000`;
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} from CFTC Socrata (report rows)`);
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('CFTC Socrata report is empty');

  // Adapt Socrata snake_case fields to the legacy column names the rest of
  // this module was built around.
  return rows.map(r => ({
    'Market_and_Exchange_Names':   r.market_and_exchange_names ?? '',
    'Report_Date_as_MM_DD_YYYY':   r.report_date_as_yyyy_mm_dd ?? '',
    'Open_Interest_All':           r.open_interest_all,
    'NonComm_Positions_Long_All':  r.noncomm_positions_long_all,
    'NonComm_Positions_Short_All': r.noncomm_positions_short_all,
    'Change_in_NonComm_Long_All':  r.change_in_noncomm_long_all,
    'Change_in_NonComm_Short_All': r.change_in_noncomm_short_all,
    'Pct_of_OI_NonComm_Long_All':  r.pct_of_oi_noncomm_long_all,
    'Pct_of_OI_NonComm_Short_All': r.pct_of_oi_noncomm_short_all,
  }));
}

// ─── Market extraction ────────────────────────────────────────────────────────

function extractTrackedMarkets(rows) {
  const results = [];
  for (const tmpl of TRACKED_MARKETS) {
    let row = null;
    for (const candidate of tmpl.matches) {
      row = rows.find(r =>
        (r['Market_and_Exchange_Names'] ?? '').toUpperCase().startsWith(candidate.toUpperCase())
      );
      if (row) break;
    }
    if (!row) {
      console.log(`  COT: ${tmpl.label} not found in data`);
      continue;
    }

    const oi        = num(row['Open_Interest_All']);
    const ncLong    = num(row['NonComm_Positions_Long_All']);
    const ncShort   = num(row['NonComm_Positions_Short_All']);
    const chNcLong  = num(row['Change_in_NonComm_Long_All']);
    const chNcShort = num(row['Change_in_NonComm_Short_All']);
    const pctLong   = num(row['Pct_of_OI_NonComm_Long_All']);
    const pctShort  = num(row['Pct_of_OI_NonComm_Short_All']);
    const netSpec   = ncLong - ncShort;
    const chNet     = chNcLong - chNcShort;
    const shiftPct  = oi > 0 ? Math.abs(chNet) / oi * 100 : 0;

    results.push({
      key:         tmpl.key,
      label:       tmpl.label,
      category:    tmpl.category,
      report_date: parseCftcDate(row['Report_Date_as_MM_DD_YYYY'] ?? row['As_of_Date_In_Form_YYMMDD'] ?? ''),
      oi,
      nc_long:     ncLong,
      nc_short:    ncShort,
      net_spec:    netSpec,
      ch_net:      chNet,
      pct_long:    pctLong,
      pct_short:   pctShort,
      shift_pct:   Math.round(shiftPct * 10) / 10,
    });
  }
  return results;
}

// ─── Positioning analysis ─────────────────────────────────────────────────────

function analyzePositioning(markets) {
  return markets.map(m => {
    const reasons = [];
    let signal = 'clear';

    const netPct = Math.round((m.pct_long - m.pct_short) * 10) / 10;
    if (netPct > EXTREME_NET_LONG_PCT) {
      reasons.push(`net spec +${netPct}% of OI — crowded long`);
      signal = 'watch';
    } else if (netPct < EXTREME_NET_SHORT_PCT) {
      reasons.push(`net spec ${netPct}% of OI — crowded short`);
      signal = 'watch';
    }

    if (m.shift_pct >= SHIFT_THRESHOLD) {
      const dir = m.ch_net > 0 ? 'adding longs' : 'adding shorts';
      reasons.push(`rapid positioning shift ${m.shift_pct}% of OI (${dir})`);
      signal = signal === 'watch' ? 'alert' : 'watch';
    }

    return { ...m, signal, reasons };
  });
}

// ─── Note builder ─────────────────────────────────────────────────────────────

function buildCotNote({ analyzed, reportDate, overallStatus }) {
  const posRows = analyzed.map(m => [
    m.label,
    m.category,
    fmtNum(m.oi),
    fmtNet(m.net_spec),
    fmtNet(m.ch_net),
    `${m.pct_long}%`,
    `${m.pct_short}%`,
    m.signal,
    m.reasons.length ? m.reasons.join('; ') : '—',
  ]);

  const sigRows = analyzed
    .filter(m => m.signal !== 'clear')
    .map(m => [m.label, m.signal, m.reasons.join('; ')]);

  return buildNote({
    frontmatter: {
      title:           'COT Report',
      source:          'CFTC Commitment of Traders',
      date_pulled:     today(),
      report_date:     reportDate,
      domain:          'macro',
      data_type:       'cot_report',
      frequency:       'weekly',
      markets_tracked: analyzed.length,
      signal_count:    analyzed.filter(m => m.signal !== 'clear').length,
      signal_status:   overallStatus,
      signals:         analyzed.filter(m => m.signal !== 'clear').map(m => m.label),
      agent_owner:     'macro',
      handoff_to:      ['orchestrator'],
      tags:            ['cot', 'positioning', 'commitment-of-traders', 'macro', 'futures'],
    },
    sections: [
      {
        heading: 'Operating Rule',
        content: [
          '> COT data shows net positioning of speculative (non-commercial) and commercial (hedger) traders.',
          '> Crowded positions (net spec beyond ±30% of OI) flag potential reversal risk, not entry signals.',
          '> Rapid week-over-week net spec shifts (>8% of OI) signal changing conviction.',
          '> All signals require confirmation from price, macro context, and liquidity checks.',
        ].join('\n'),
      },
      {
        heading: 'Positioning Summary',
        content: posRows.length
          ? buildTable(
              ['Market', 'Category', 'Open Int.', 'Net Spec', 'Wk Change', 'Spec Long%', 'Spec Short%', 'Signal', 'Notes'],
              posRows
            )
          : '_No tracked markets found in current COT data._',
      },
      {
        heading: 'Active Positioning Signals',
        content: sigRows.length
          ? buildTable(['Market', 'Signal', 'Reason'], sigRows)
          : '_No extreme or rapidly shifting positions detected this week._',
      },
      {
        heading: 'Data Source',
        content: [
          `- **Report date**: ${reportDate}`,
          '- **Source**: CFTC COT — Legacy Futures-Only Report (CME/CBOT/NYMEX/COMEX)',
          '- **URL**: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm',
          '- **Release schedule**: Every Friday ~3:30 PM ET',
          '',
          '> Net Spec = NonCommercial Long − Short. Positive = net long speculative bias.',
          '> Wk Change = week-over-week change in net spec. Rapid shifts (>8% of OI) are flagged.',
        ].join('\n'),
      },
    ],
  });
}

function writeFallbackNote(errorMsg, flags) {
  const note = buildNote({
    frontmatter: {
      title:         'COT Report',
      source:        'CFTC Commitment of Traders',
      date_pulled:   today(),
      domain:        'macro',
      data_type:     'cot_report',
      frequency:     'weekly',
      signal_status: 'clear',
      signals:       [],
      agent_owner:   'macro',
      handoff_to:    ['orchestrator'],
      tags:          ['cot', 'positioning', 'commitment-of-traders', 'macro'],
      fetch_error:   errorMsg,
    },
    sections: [
      {
        heading: 'Fetch Error',
        content: [
          `> COT data unavailable: ${errorMsg}`,
          '> The CFTC releases the report every Friday ~3:30 PM ET.',
          '> Retry with `node run.mjs pull cot-report` after Friday release.',
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Macro', dateStampedFilename('COT_Report'));
  if (!flags['dry-run']) {
    writeNote(filePath, note);
    console.log(`Wrote fallback note: ${filePath}`);
  }
  return { filePath: flags['dry-run'] ? null : filePath, signal_status: 'clear', error: errorMsg };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function num(val) {
  const n = Number(String(val ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function fmtNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function fmtNet(n) {
  if (!n) return '0';
  const abs = fmtNum(Math.abs(n));
  return n > 0 ? `+${abs}` : `-${abs}`;
}

function parseCftcDate(raw) {
  if (!raw) return today();
  // ISO from Socrata: YYYY-MM-DDT00:00:00.000
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  // MM/DD/YYYY
  const m1 = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m1) return `${m1[3]}-${m1[1].padStart(2, '0')}-${m1[2].padStart(2, '0')}`;
  // YYMMDD
  const m2 = raw.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (m2) {
    const yr = parseInt(m2[1]) >= 50 ? `19${m2[1]}` : `20${m2[1]}`;
    return `${yr}-${m2[2]}-${m2[3]}`;
  }
  return today();
}
