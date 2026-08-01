/**
 * narrative-heat.mjs — Media attention vs price reality, per commodity.
 *
 * Phase 4 of the transmission expansion. Measures narrative volume from the
 * GDELT global news index (free, no key, ~1 req/5s) and compares it to actual
 * price moves from the latest commodity-transmission scan.
 *
 * The divergence detector is the point:
 *   - heat spike + flat price  → "noise" (narrative running ahead of reality; fade candidate)
 *   - big price move + no heat → "quiet move" (under-owned; market hasn't noticed yet)
 *   - heat + move together     → "confirmed" (crowd is on it; expect momentum + crowding risk)
 *
 * Usage:
 *   node run.mjs pull narrative-heat
 *   node run.mjs pull narrative-heat --commodity copper
 *   node run.mjs pull narrative-heat --dry-run
 *
 * Runtime: ~6.5s per subject (GDELT rate limit). Full run ≈ 1 minute.
 *
 * Output: 05_Data_Pulls/Sentiment/YYYY-MM-DD_Narrative_Heat.md
 *         06_Signals/YYYY-MM-DD_NARRATIVE_DIVERGENCE.md (when divergences found)
 */

import { join } from 'path';
import { getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { sleep } from '../lib/fetcher.mjs';
import { readFolderWhere } from '../lib/frontmatter.mjs';
import {
  buildNote, buildTable, writeNote,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';

const GDELT_DOC = 'https://api.gdeltproject.org/api/v2/doc/doc';
const GDELT_INTERVAL_MS = 12_000;
const HEAT_SPIKE_RATIO = 2.0;   // recent 7d volume ≥ 2x prior baseline
const QUIET_RATIO = 1.2;        // below this, the narrative hasn't picked the move up
const QUIET_MOVE_PCT = 8;       // price move that "deserves" coverage

// Keys match transmission-map.json so heat joins moves.
// GDELT requires OR'd terms to be wrapped in parentheses.
const SUBJECTS = {
  crude_oil:   '("oil prices" OR "crude oil" OR OPEC)',
  natural_gas: '("natural gas prices" OR "LNG prices" OR "gas supply")',
  copper:      '("copper prices" OR "copper shortage" OR "copper supply")',
  wheat:       '("wheat prices" OR "grain prices" OR "wheat harvest")',
  corn:        '("corn prices" OR "corn harvest" OR "feed costs")',
  soybeans:    '("soybean prices" OR "soybean harvest" OR "crush margins")',
  fertilizer:  '("fertilizer prices" OR "fertilizer costs" OR ammonia OR potash)',
  lumber:      '("lumber prices" OR "timber prices" OR "framing costs")',
  aluminum:    '("aluminum prices" OR "aluminium prices" OR smelter)',
};

export async function pull(flags = {}) {
  let subjects = Object.entries(SUBJECTS);
  if (flags.commodity) {
    subjects = subjects.filter(([key]) => key === flags.commodity);
    if (!subjects.length) throw new Error(`Unknown commodity "${flags.commodity}". Available: ${Object.keys(SUBJECTS).join(', ')}`);
  }

  console.log(`📣 Narrative Heat: ${subjects.length} subjects via GDELT (~${Math.ceil(subjects.length * GDELT_INTERVAL_MS / 1000)}s)...\n`);

  const { moves, thresholds } = await latestTransmissionContext();

  const results = [];
  for (const [key, query] of subjects) {
    const heat = await measureHeat(query);
    const movePct = moves[key] ?? null;
    const row = classify({ key, query, ...heat, movePct, thresholdPct: thresholds[key] ?? QUIET_MOVE_PCT });
    results.push(row);
    logRow(row);
    await sleep(GDELT_INTERVAL_MS);
  }

  const divergences = results.filter(r => !r.error && (r.verdict === 'noise' || r.verdict === 'quiet_move'));
  const signalStatus = divergences.length > 0 ? 'watch' : 'clear';

  console.log(`\n📣 ${divergences.length} divergence(s) | status: ${signalStatus}`);

  const note = buildHeatNote({ results, divergences, signalStatus });
  const filePath = join(getPullsDir(), 'Sentiment', dateStampedFilename('Narrative_Heat'));

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, divergences: divergences.length, signal_status: signalStatus };
  }

  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);

  if (divergences.length > 0) {
    const signalPath = writeDivergenceSignal(divergences);
    console.log(`⚡ Signal logged: ${signalPath}`);
  }

  return { filePath, divergences: divergences.length, signal_status: signalStatus };
}

// ─── Transmission context (price moves + thresholds) ────────────────────────────

async function latestTransmissionContext() {
  const empty = { moves: {}, thresholds: {} };
  try {
    const notes = await readFolderWhere(
      join(getPullsDir(), 'Commodities'),
      d => d.data_type === 'transmission_scan'
    );
    if (!notes.length) {
      console.log('  (no transmission scan found — run commodity-transmission first for divergence detection)\n');
      return empty;
    }
    const latest = notes.reduce((a, b) =>
      String(a.data.date_pulled) > String(b.data.date_pulled) ? a : b);
    const moves = (latest.data.moves && typeof latest.data.moves === 'object')
      ? latest.data.moves
      : parseJsonField(latest.data.moves_json);
    return { moves, thresholds: {} };
  } catch {
    return empty;
  }
}

/** Frontmatter JSON strings keep escaped quotes (\") through the vault parser. */
function parseJsonField(raw) {
  if (!raw || typeof raw !== 'string') return {};
  for (const candidate of [raw, raw.replace(/\\"/g, '"')]) {
    try { return JSON.parse(candidate); } catch { /* try next */ }
  }
  return {};
}

// ─── GDELT heat measurement ─────────────────────────────────────────────────────

async function measureHeat(query, attempt = 1) {
  const url = `${GDELT_DOC}?query=${encodeURIComponent(query)}&mode=timelinevolraw&format=json&timespan=8weeks`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MyData-Vault/1.0 research@local.vault' },
      signal: AbortSignal.timeout(25_000),
    });
    const text = await res.text();
    if (res.status === 429 && attempt === 1) {
      await sleep(35_000);
      return measureHeat(query, 2);
    }
    if (!res.ok) return { error: `GDELT HTTP ${res.status}` };

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { error: `GDELT: ${text.trim().slice(0, 80)}` };
    }
    const data = parsed?.timeline?.[0]?.data ?? [];
    if (data.length < 14) return { error: `only ${data.length} timeline points` };

    const values = data.map(d => Number(d.value) || 0);
    const recent = avg(values.slice(-7));
    const baseline = avg(values.slice(0, -7));
    const heatRatio = baseline > 0 ? Math.round((recent / baseline) * 100) / 100 : null;
    return { recentVol: Math.round(recent), baselineVol: Math.round(baseline), heatRatio };
  } catch (err) {
    // Transient connection resets are common on GDELT — one spaced retry.
    if (attempt === 1) {
      await sleep(15_000);
      return measureHeat(query, 2);
    }
    return { error: err.message };
  }
}

function avg(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

// ─── Divergence classification ──────────────────────────────────────────────────

function classify(row) {
  if (row.error) return { ...row, verdict: 'error' };
  const { heatRatio, movePct, thresholdPct } = row;
  const bigMove = movePct != null && Math.abs(movePct) >= thresholdPct;
  const flatPrice = movePct != null && Math.abs(movePct) < thresholdPct / 2;

  let verdict = 'normal';
  if (heatRatio != null && heatRatio >= HEAT_SPIKE_RATIO && flatPrice) verdict = 'noise';
  else if (bigMove && heatRatio != null && heatRatio < QUIET_RATIO) verdict = 'quiet_move';
  else if (bigMove && heatRatio != null && heatRatio >= HEAT_SPIKE_RATIO) verdict = 'confirmed';
  else if (movePct == null) verdict = 'no_price_context';
  return { ...row, verdict };
}

function logRow(r) {
  if (r.error) { console.log(`  ⚠️ ${r.key}: ${r.error}`); return; }
  const icon = { noise: '🔇', quiet_move: '🤫', confirmed: '📢', normal: '⚪', no_price_context: '⚫' }[r.verdict];
  console.log(`  ${icon} ${r.key}: heat ${r.heatRatio ?? '?'}x (${r.recentVol}/day vs ${r.baselineVol}) | move ${r.movePct ?? '?'}% → ${r.verdict}`);
}

// ─── Note builders ──────────────────────────────────────────────────────────────

const VERDICT_LABELS = {
  noise: 'NOISE — narrative ahead of price (fade candidate)',
  quiet_move: 'QUIET MOVE — price moved, crowd absent (under-owned)',
  confirmed: 'CONFIRMED — heat and price aligned (crowding builds)',
  normal: 'normal',
  no_price_context: 'no price context',
  error: 'error',
};

function buildHeatNote({ results, divergences, signalStatus }) {
  const rows = results.map(r => r.error
    ? [r.key, 'ERROR', r.error, '—', '—']
    : [
        r.key,
        `${r.heatRatio ?? '?'}x`,
        `${r.recentVol}/day (base ${r.baselineVol})`,
        r.movePct != null ? `${r.movePct > 0 ? '+' : ''}${r.movePct}%` : 'n/a',
        VERDICT_LABELS[r.verdict],
      ]);

  return buildNote({
    frontmatter: {
      title: 'Narrative Heat',
      source: 'GDELT DOC API + commodity-transmission scan',
      date_pulled: today(),
      domain: 'sentiment',
      data_type: 'narrative_heat',
      heat: Object.fromEntries(results.filter(r => !r.error).map(r => [r.key, r.heatRatio])),
      divergences: divergences.map(r => ({ key: r.key, verdict: r.verdict })),
      signal_status: signalStatus,
      tags: ['sentiment', 'narrative', 'commodities', 'noise'],
      related_pulls: [],
    },
    sections: [
      {
        heading: 'Is the crowd looking where the prices are moving?',
        content: buildTable(['Subject', 'Heat (7d vs 7wk base)', 'Article Volume', 'Price Move', 'Verdict'], rows),
      },
      {
        heading: 'Reading the verdicts',
        content: [
          '- **NOISE**: media volume ≥2x baseline while price sits still — narrative-driven; expect mean reversion of attention. Check reddit/snscrape pulls for the retail side.',
          '- **QUIET MOVE**: price tripped a transmission threshold but coverage is flat — the market hasn\'t noticed; strongest research candidates.',
          '- **CONFIRMED**: both moving — momentum real but crowding risk rising; check COT positioning.',
          '- Heat = GDELT global article volume, last 7 days vs prior 7 weeks. Price moves join from the latest `commodity-transmission` scan.',
        ].join('\n'),
      },
    ],
  });
}

function writeDivergenceSignal(divergences) {
  const signalId = 'NARRATIVE_DIVERGENCE';
  const note = buildNote({
    frontmatter: {
      signal_id: signalId,
      signal_name: `Narrative divergence: ${divergences.map(r => `${r.key} (${r.verdict})`).join(', ')}`,
      domain: 'sentiment',
      severity: 'watch',
      value: divergences.length,
      threshold: 1,
      date: today(),
      source_pull: 'Narrative_Heat',
      commodities: divergences.map(r => r.key),
      tags: ['signal', 'sentiment', 'narrative', 'watch'],
    },
    sections: [
      {
        heading: 'Attention and price are disagreeing',
        content: divergences.map(r =>
          `- **${r.key}** — ${VERDICT_LABELS[r.verdict]}: heat ${r.heatRatio}x, price ${r.movePct > 0 ? '+' : ''}${r.movePct}%`
        ).join('\n'),
      },
      {
        heading: 'Implications',
        content: [
          '- QUIET MOVE names: research before the crowd arrives — check the matching transmission signal for affected tickers/theses.',
          '- NOISE names: fade the narrative or wait; confirm with positioning (`cot-report`) and price before acting.',
        ].join('\n'),
      },
    ],
  });

  const signalPath = join(getSignalsDir(), dateStampedFilename(signalId));
  writeNote(signalPath, note);
  return signalPath;
}
