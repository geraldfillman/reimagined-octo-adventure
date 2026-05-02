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

// CFTC public data: CME Group futures-only, legacy format, current year.
// Covers CME/CBOT/NYMEX/COMEX markets in a single file.
const COT_URL = 'https://www.cftc.gov/files/dea/newcot/deacmesf.txt';

// Markets to track. `match` is a partial, case-insensitive name prefix.
const TRACKED_MARKETS = [
  { key: 'ES',  match: 'E-MINI S&P 500',        label: 'E-Mini S&P 500',    category: 'equities'    },
  { key: 'NQ',  match: 'E-MINI NASDAQ-100',      label: 'E-Mini Nasdaq-100', category: 'equities'    },
  { key: 'ZN',  match: '10-YEAR T-NOTES',        label: '10-Year T-Notes',   category: 'rates'       },
  { key: 'ZB',  match: 'U.S. TREASURY BONDS',    label: 'T-Bonds',           category: 'rates'       },
  { key: 'GC',  match: 'GOLD - COMMODITY',       label: 'Gold',              category: 'commodities' },
  { key: 'CL',  match: 'CRUDE OIL, LIGHT SWEET', label: 'Crude Oil',         category: 'commodities' },
  { key: '6E',  match: 'EURO FX',                label: 'Euro FX',           category: 'currencies'  },
  { key: '6J',  match: 'JAPANESE YEN',           label: 'Japanese Yen',      category: 'currencies'  },
  { key: 'BTC', match: 'BITCOIN',                label: 'Bitcoin',           category: 'crypto'      },
];

// Positioning extremes that generate signals.
// Spec longs > 65% of OI → crowded long (potential reversal risk).
// Spec longs < 35% of OI → crowded short.
// |week-over-week net spec change| > 8% of OI → rapid shift.
const EXTREME_LONG_PCT  = 65;
const EXTREME_SHORT_PCT = 35;
const SHIFT_THRESHOLD   = 8;

export async function pull(flags = {}) {
  console.log('COT Report: fetching CFTC Commitment of Traders data...');

  let parsed;
  try {
    const csv = await fetchCotData();
    parsed = parseCotCsv(csv);
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

// ─── Data fetch ───────────────────────────────────────────────────────────────

async function fetchCotData() {
  const res = await fetch(COT_URL, {
    signal:  AbortSignal.timeout(30_000),
    headers: { 'User-Agent': 'vault-orchestrator-cot/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from CFTC`);
  return res.text();
}

// ─── CSV parser (handles quoted fields containing commas) ─────────────────────

function parseCotCsv(csv) {
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('CFTC CSV appears empty');

  const header = parseCsvLine(lines[0]).map(h => h.trim());
  const rows   = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    if (vals.length < Math.floor(header.length / 2)) continue;
    const row = {};
    header.forEach((h, idx) => { row[h] = (vals[idx] ?? '').trim(); });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line) {
  const vals = [];
  let cur     = '';
  let inQuote = false;
  for (const ch of line) {
    if (ch === '"')               { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { vals.push(cur); cur = ''; }
    else                             { cur += ch; }
  }
  vals.push(cur);
  return vals;
}

// ─── Market extraction ────────────────────────────────────────────────────────

function extractTrackedMarkets(rows) {
  const results = [];
  for (const tmpl of TRACKED_MARKETS) {
    const row = rows.find(r => {
      const name = (r['Market_and_Exchange_Names'] ?? '').toUpperCase();
      return name.includes(tmpl.match.toUpperCase());
    });
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

    if (m.pct_long > EXTREME_LONG_PCT) {
      reasons.push(`spec longs at ${m.pct_long}% of OI — crowded long`);
      signal = 'watch';
    } else if (m.pct_long < EXTREME_SHORT_PCT) {
      reasons.push(`spec longs at ${m.pct_long}% of OI — crowded short`);
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
          '> Crowded positions (>65% or <35% of OI spec long) flag potential reversal risk, not entry signals.',
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
