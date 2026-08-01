/**
 * bond-stress.mjs — Composite bond market stress regime.
 *
 * Pulls curve shape, credit spreads, and real yields from FRED, scores them
 * into a single 0–100 stress score, and writes a bond_regime note that
 * downstream consumers (Macro Regime dashboard, confluence-scan, company
 * refinancing checks) can read via frontmatter.
 *
 * Regimes:
 *   calm       (score < 30)  — normal funding conditions
 *   tightening (30–54)       — spreads widening / curve stressed, watch levered names
 *   stress     (>= 55)       — funding markets hostile; levered small caps,
 *                              builders, REITs hit first
 *
 * Usage:
 *   node run.mjs pull bond-stress
 *   node run.mjs pull bond-stress --dry-run
 *
 * Output: 05_Data_Pulls/Macro/YYYY-MM-DD_Bond_Stress.md (+ signal note if not calm)
 */

import { join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';

const SERIES = [
  { id: 'T10Y2Y',       name: '10Y-2Y Spread',              group: 'curve' },
  { id: 'T10Y3M',       name: '10Y-3M Spread',              group: 'curve' },
  { id: 'BAMLH0A0HYM2', name: 'High Yield OAS',             group: 'credit' },
  { id: 'BAMLC0A4CBBB', name: 'BBB Corporate Spread',       group: 'credit' },
  { id: 'BAA10Y',       name: 'Baa vs 10Y Treasury Spread', group: 'credit' },
  { id: 'DFII10',       name: '10Y Real Yield (TIPS)',      group: 'real_rates' },
];

const OBS_LIMIT = 90; // ~60 trading days back for change calcs

export async function pull(flags = {}) {
  const apiKey = getApiKey('fred');
  const baseUrl = getBaseUrl('fred');

  console.log('🏦 Bond Stress: pulling curve, credit, and real-yield series...\n');

  const data = {};
  for (const s of SERIES) {
    const url = `${baseUrl}/series/observations?series_id=${s.id}&api_key=${apiKey}` +
      `&file_type=json&sort_order=desc&limit=${OBS_LIMIT}`;
    try {
      const res = await getJson(url);
      const obs = (res.observations || [])
        .filter(o => o.value !== '.')
        .map(o => ({ date: o.date, value: parseFloat(o.value) }));
      data[s.id] = { ...s, latest: obs[0] ?? null, obs };
      console.log(`  ${s.id}: ${obs[0] ? `${obs[0].value} (${obs[0].date})` : 'no data'}`);
    } catch (err) {
      console.warn(`  ⚠️ ${s.id} failed: ${err.message}`);
      data[s.id] = { ...s, latest: null, obs: [], error: err.message };
    }
  }

  const { score, components } = scoreStress(data);
  const regime = score >= 55 ? 'stress' : score >= 30 ? 'tightening' : 'calm';
  const signalStatus = regime === 'stress' ? 'alert' : regime === 'tightening' ? 'watch' : 'clear';

  console.log(`\n🏦 Bond regime: ${regime.toUpperCase()} (score ${score}/100)`);
  for (const c of components.filter(c => c.points > 0)) {
    console.log(`  +${c.points} ${c.reason}`);
  }

  const note = buildRegimeNote({ data, score, regime, signalStatus, components });
  const filePath = join(getPullsDir(), 'Macro', dateStampedFilename('Bond_Stress'));

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, bond_regime: regime, stress_score: score, signal_status: signalStatus };
  }

  writeNote(filePath, note);
  console.log(`\n📝 Wrote: ${filePath}`);

  if (regime !== 'calm') {
    const signalPath = writeStressSignal({ score, regime, signalStatus, components });
    console.log(`⚡ Signal logged: ${signalPath}`);
  }

  return { filePath, bond_regime: regime, stress_score: score, signal_status: signalStatus };
}

// ─── Scoring ────────────────────────────────────────────────────────────────────

function scoreStress(data) {
  const components = [];
  const add = (points, reason) => components.push({ points, reason });

  const latest = id => data[id]?.latest?.value ?? null;
  const change60 = id => {
    const obs = data[id]?.obs ?? [];
    if (!obs.length) return null;
    const past = obs[Math.min(59, obs.length - 1)];
    return obs[0].value - past.value;
  };

  // Curve shape
  const c2s10s = latest('T10Y2Y');
  if (c2s10s != null && c2s10s < 0) add(20, `2s10s inverted at ${c2s10s.toFixed(2)}%`);
  const c3m10y = latest('T10Y3M');
  if (c3m10y != null && c3m10y < 0) add(10, `3m10y inverted at ${c3m10y.toFixed(2)}%`);

  // High yield spreads — level
  const hy = latest('BAMLH0A0HYM2');
  if (hy != null) {
    if (hy >= 5) add(25, `HY OAS at ${hy.toFixed(2)}% — distressed territory`);
    else if (hy >= 4) add(15, `HY OAS at ${hy.toFixed(2)}% — elevated`);
    else if (hy >= 3.5) add(8, `HY OAS at ${hy.toFixed(2)}% — above comfort zone`);
  }

  // High yield spreads — 60-day widening
  const hyChange = change60('BAMLH0A0HYM2');
  if (hyChange != null) {
    if (hyChange >= 1.0) add(20, `HY OAS widened ${(hyChange * 100).toFixed(0)}bps in ~60 sessions`);
    else if (hyChange >= 0.5) add(10, `HY OAS widened ${(hyChange * 100).toFixed(0)}bps in ~60 sessions`);
  }

  // BBB widening — investment grade catching stress is a late, serious sign
  const bbbChange = change60('BAMLC0A4CBBB');
  if (bbbChange != null && bbbChange >= 0.3) {
    add(10, `BBB spread widened ${(bbbChange * 100).toFixed(0)}bps in ~60 sessions`);
  }

  // Baa vs 10Y level
  const baa = latest('BAA10Y');
  if (baa != null && baa >= 3) add(5, `Baa-10Y spread at ${baa.toFixed(2)}%`);

  // Real yields — restrictive territory pressures valuations and refinancing
  const real10 = latest('DFII10');
  if (real10 != null) {
    if (real10 >= 2.5) add(10, `10Y real yield at ${real10.toFixed(2)}% — restrictive`);
    else if (real10 >= 2.0) add(5, `10Y real yield at ${real10.toFixed(2)}% — firm`);
  }

  const score = Math.min(100, components.reduce((s, c) => s + c.points, 0));
  return { score, components };
}

// ─── Note builders ──────────────────────────────────────────────────────────────

function buildRegimeNote({ data, score, regime, signalStatus, components }) {
  const rows = SERIES.map(s => {
    const d = data[s.id];
    return [
      s.id,
      s.name,
      d.latest ? d.latest.date : 'N/A',
      d.latest ? formatNumber(d.latest.value, { decimals: 2 }) : (d.error ?? 'N/A'),
      s.group,
    ];
  });

  return buildNote({
    frontmatter: {
      title: 'Bond Market Stress Regime',
      source: 'FRED API',
      date_pulled: today(),
      domain: 'macro',
      data_type: 'bond_regime',
      frequency: 'daily',
      bond_regime: regime,
      stress_score: score,
      signal_status: signalStatus,
      signals: signalStatus === 'clear' ? [] : [`Bond regime: ${regime}`],
      tags: ['bond', 'rates', 'credit', 'macro', 'regime'],
      related_pulls: [],
    },
    sections: [
      {
        heading: `Bond regime: ${regime} (${score}/100)`,
        content: buildTable(['Series', 'Name', 'Date', 'Latest', 'Group'], rows),
      },
      {
        heading: 'Score Components',
        content: components.filter(c => c.points > 0).map(c => `- **+${c.points}** ${c.reason}`).join('\n')
          || '- No stress components tripped — funding conditions normal.',
      },
      {
        heading: 'Reading the regime',
        content: [
          '- **calm** — normal funding; no action from this layer.',
          '- **tightening** — spreads widening or curve inverted: review levered watchlist names, builders, REITs.',
          '- **stress** — funding hostile: refinancing risk is live for high-debt small caps; expect equity de-rating in rate-sensitive theses.',
          '- Consumed via frontmatter (`data_type: bond_regime`, `bond_regime`, `stress_score`).',
        ].join('\n'),
      },
    ],
  });
}

function writeStressSignal({ score, regime, signalStatus, components }) {
  const signalId = 'BOND_STRESS_REGIME';
  const note = buildNote({
    frontmatter: {
      signal_id: signalId,
      signal_name: `Bond market regime: ${regime}`,
      domain: 'macro',
      severity: signalStatus,
      value: score,
      threshold: regime === 'stress' ? 55 : 30,
      date: today(),
      source_pull: 'Bond_Stress',
      tags: ['signal', 'macro', 'bond', signalStatus],
    },
    sections: [
      {
        heading: `Bond regime ${regime} — stress score ${score}/100`,
        content: components.filter(c => c.points > 0).map(c => `- ${c.reason}`).join('\n'),
      },
      {
        heading: 'Implications',
        content: [
          '- Levered small caps, homebuilders, and REITs face the earliest refinancing pressure.',
          '- Credit-sensitive theses: review debt maturity walls on watchlist names.',
          '- Pair with `commodity-transmission` output — input-cost inflation plus tight funding is the margin-kill combination.',
        ].join('\n'),
      },
      {
        heading: 'Related Domains',
        content: ['- housing', '- smallcap', '- reits', '- credit'].join('\n'),
      },
    ],
  });

  const signalPath = join(getSignalsDir(), dateStampedFilename(signalId));
  writeNote(signalPath, note);
  return signalPath;
}
