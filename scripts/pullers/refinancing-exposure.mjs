/**
 * refinancing-exposure.mjs — Per-company refinancing risk from SEC XBRL facts.
 *
 * Phase 2, part 2 of the transmission expansion. For each thesis-universe
 * ticker, pulls XBRL company-facts (free, no key) and scores refinancing
 * exposure from interest coverage, near-term debt vs cash, and leverage.
 * Reads the latest bond_regime note — when the regime is tightening or
 * stress, flagged names escalate to a signal note.
 *
 * Caveat: XBRL concepts mix annual and quarterly periods; coverage ratios
 * are directional screens, not audited figures. Verify before acting.
 *
 * Usage:
 *   node run.mjs pull refinancing-exposure
 *   node run.mjs pull refinancing-exposure --thesis housing
 *   node run.mjs pull refinancing-exposure --tickers DHI,LEN --dry-run
 *
 * Output: 05_Data_Pulls/Company_Risk/YYYY-MM-DD_Refinancing_Exposure.md
 *         06_Signals/YYYY-MM-DD_REFINANCING_EXPOSURE.md (regime ≠ calm + high-risk names)
 */

import { join } from 'path';
import { getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { fetchCompanyFacts, latestConceptValue } from '../lib/edgar.mjs';
import { THESIS_COMPANIES } from '../lib/cik-map.mjs';
import { readFolderWhere } from '../lib/frontmatter.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';

const CONCEPTS = {
  operatingIncome: ['OperatingIncomeLoss'],
  interestExpense: ['InterestExpense', 'InterestExpenseDebt', 'InterestIncomeExpenseNet'],
  debtCurrent:     ['LongTermDebtCurrent', 'LongTermDebtAndCapitalLeaseObligationsCurrent', 'DebtCurrent'],
  debtNoncurrent:  ['LongTermDebtNoncurrent', 'LongTermDebt', 'LongTermDebtAndCapitalLeaseObligations'],
  cash:            ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'],
};

export async function pull(flags = {}) {
  const universe = selectUniverse(flags);
  console.log(`🏦 Refinancing Exposure: scoring ${universe.length} companies via SEC XBRL...\n`);

  const regime = await latestBondRegime();
  console.log(`  Bond regime context: ${regime.bond_regime} (score ${regime.stress_score})\n`);

  const scored = [];
  for (const c of universe) {
    const row = await scoreCompany(c);
    scored.push(row);
    const icon = { high: '🔴', medium: '🟡', low: '⚪', unknown: '⚫' }[row.exposure];
    console.log(`  ${icon} ${row.ticker}: ${row.exposure}${row.reasons.length ? ' — ' + row.reasons[0] : ''}`);
  }

  const high = scored.filter(r => r.exposure === 'high');
  const medium = scored.filter(r => r.exposure === 'medium');
  const escalate = regime.bond_regime !== 'calm' && high.length > 0;
  const signalStatus = escalate ? (regime.bond_regime === 'stress' ? 'alert' : 'watch') : 'clear';

  console.log(`\n🏦 ${high.length} high / ${medium.length} medium exposure | regime ${regime.bond_regime} | status: ${signalStatus}`);

  const note = buildExposureNote({ scored, high, medium, regime, signalStatus });
  const filePath = join(getPullsDir(), 'Company_Risk', dateStampedFilename('Refinancing_Exposure'));

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, high: high.length, medium: medium.length, signal_status: signalStatus };
  }

  writeNote(filePath, note);
  console.log(`\n📝 Wrote: ${filePath}`);

  if (escalate) {
    const signalPath = writeExposureSignal({ high, regime, signalStatus });
    console.log(`⚡ Signal logged: ${signalPath}`);
  }

  return { filePath, high: high.length, medium: medium.length, signal_status: signalStatus };
}

// ─── Universe selection ─────────────────────────────────────────────────────────

function selectUniverse(flags) {
  let entries = Object.entries(THESIS_COMPANIES)
    .map(([ticker, meta]) => ({ ticker, ...meta }));

  if (flags.tickers) {
    const wanted = new Set(flags.tickers.split(',').map(t => t.trim().toUpperCase()));
    entries = entries.filter(e => wanted.has(e.ticker));
    if (entries.length === 0) throw new Error(`No universe tickers match: ${flags.tickers}`);
  } else if (flags.thesis) {
    entries = entries.filter(e => e.thesis === flags.thesis);
    if (entries.length === 0) {
      const available = [...new Set(Object.values(THESIS_COMPANIES).map(c => c.thesis))];
      throw new Error(`No companies for thesis "${flags.thesis}". Available: ${available.join(', ')}`);
    }
  }

  const limit = parseInt(flags.limit) || entries.length;
  return entries.slice(0, limit);
}

// ─── Bond regime context ────────────────────────────────────────────────────────

async function latestBondRegime() {
  const fallback = { bond_regime: 'unknown', stress_score: null };
  try {
    const notes = await readFolderWhere(
      join(getPullsDir(), 'Macro'),
      d => d.data_type === 'bond_regime'
    );
    if (!notes.length) return fallback;
    const latest = notes.reduce((a, b) =>
      String(a.data.date_pulled) > String(b.data.date_pulled) ? a : b);
    return {
      bond_regime: latest.data.bond_regime ?? 'unknown',
      stress_score: latest.data.stress_score ?? null,
    };
  } catch {
    return fallback;
  }
}

// ─── Scoring ────────────────────────────────────────────────────────────────────

async function scoreCompany({ ticker, name, cik, thesis }) {
  const base = { ticker, name, thesis, reasons: [] };

  const facts = await fetchCompanyFacts(cik);
  if (!facts) return { ...base, exposure: 'unknown', reasons: ['no XBRL facts (common for foreign/small filers)'] };

  const oi       = latestConceptValue(facts, CONCEPTS.operatingIncome)?.value ?? null;
  const interest = latestConceptValue(facts, CONCEPTS.interestExpense)?.value ?? null;
  const debtCur  = latestConceptValue(facts, CONCEPTS.debtCurrent)?.value ?? 0;
  const debtLong = latestConceptValue(facts, CONCEPTS.debtNoncurrent)?.value ?? 0;
  const cash     = latestConceptValue(facts, CONCEPTS.cash)?.value ?? null;

  const totalDebt = debtCur + debtLong;
  const coverage = interest && interest !== 0 && oi != null ? oi / Math.abs(interest) : null;

  const reasons = [];
  let points = 0;

  if (oi != null && oi < 0) { points += 2; reasons.push('negative operating income'); }
  if (coverage != null && coverage < 1) { points += 4; reasons.push(`interest coverage ${coverage.toFixed(1)}x — below 1x`); }
  else if (coverage != null && coverage < 2) { points += 2; reasons.push(`interest coverage ${coverage.toFixed(1)}x — thin`); }
  if (cash != null && debtCur > 0 && debtCur > cash) {
    points += 2;
    reasons.push(`near-term debt ${fmtB(debtCur)} exceeds cash ${fmtB(cash)} — maturity wall`);
  }
  if (oi != null && oi > 0 && totalDebt > 0 && totalDebt / oi > 6) {
    points += 1;
    reasons.push(`total debt ${fmtB(totalDebt)} is ${(totalDebt / oi).toFixed(1)}x operating income`);
  }
  if (totalDebt === 0 && cash != null) reasons.push('no reported long-term debt');

  const exposure = points >= 4 ? 'high' : points >= 2 ? 'medium' : 'low';
  return { ...base, exposure, points, coverage, totalDebt, debtCur, cash, oi, reasons };
}

function fmtB(v) {
  if (v == null) return 'N/A';
  const abs = Math.abs(v);
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${formatNumber(v, { decimals: 0 })}`;
}

// ─── Note builders ──────────────────────────────────────────────────────────────

function buildExposureNote({ scored, high, medium, regime, signalStatus }) {
  const rows = [...scored]
    .sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
    .map(r => [
      r.ticker,
      r.thesis ?? '',
      r.exposure,
      r.coverage != null ? `${r.coverage.toFixed(1)}x` : 'N/A',
      fmtB(r.debtCur),
      fmtB(r.cash),
      fmtB(r.totalDebt),
      r.reasons.join('; ') || '—',
    ]);

  return buildNote({
    frontmatter: {
      title: 'Refinancing Exposure Scan',
      source: 'SEC EDGAR XBRL company-facts',
      date_pulled: today(),
      domain: 'company_risk',
      data_type: 'refinancing_exposure',
      bond_regime: regime.bond_regime,
      high_exposure: high.map(r => r.ticker),
      medium_exposure: medium.map(r => r.ticker),
      signal_status: signalStatus,
      tags: ['company-risk', 'refinancing', 'bond', 'credit'],
      related_pulls: [],
    },
    sections: [
      {
        heading: `Who can't refinance if funding tightens? (regime: ${regime.bond_regime})`,
        content: buildTable(
          ['Ticker', 'Thesis', 'Exposure', 'Int. Coverage', 'Debt <1y', 'Cash', 'Total Debt', 'Flags'],
          rows
        ),
      },
      {
        heading: 'Method & caveats',
        content: [
          '- Source: XBRL company-facts (latest reported values; annual/quarterly periods can mix — treat ratios as screens).',
          '- **high** ≥4 pts, **medium** ≥2: negative OI (+2), coverage <1x (+4) / <2x (+2), near-term debt > cash (+2), debt >6x OI (+1).',
          '- Escalates to a signal only when the bond regime is tightening/stress — calm regimes make weak balance sheets survivable.',
          '- Pair with `bond-stress` and `commodity-transmission`: input-cost squeeze + maturity wall + tight funding is the kill combination.',
        ].join('\n'),
      },
    ],
  });
}

function writeExposureSignal({ high, regime, signalStatus }) {
  const signalId = 'REFINANCING_EXPOSURE';
  const note = buildNote({
    frontmatter: {
      signal_id: signalId,
      signal_name: `${high.length} high-refinancing-risk names in ${regime.bond_regime} bond regime`,
      domain: 'company_risk',
      severity: signalStatus,
      value: high.length,
      threshold: 1,
      date: today(),
      source_pull: 'Refinancing_Exposure',
      tickers: high.map(r => r.ticker),
      tags: ['signal', 'company-risk', 'refinancing', signalStatus],
    },
    sections: [
      {
        heading: `Bond regime ${regime.bond_regime} + ${high.length} exposed names`,
        content: high.map(r => `- **${r.ticker}** (${r.thesis ?? 'no thesis'}): ${r.reasons.join('; ')}`).join('\n'),
      },
      {
        heading: 'Implications',
        content: [
          '- These names must refinance into a hostile market — expect dilutive raises, asset sales, or covenant stress.',
          '- Check `dilution-monitor` and `capital-raise` output for the same tickers.',
          '- Position sizing: treat as elevated-risk until coverage or the regime improves.',
        ].join('\n'),
      },
    ],
  });

  const signalPath = join(getSignalsDir(), dateStampedFilename(signalId));
  writeNote(signalPath, note);
  return signalPath;
}
