/**
 * macro-volatility.mjs — Macro volatility / stress regime synthesis.
 *
 * Synthesis puller: reads existing FRED and CBOE pull notes from the last
 * 30 days rather than making fresh API calls. Classifies each note into a
 * stress category (credit, rates, vol, macro_broad), scores by signal_status,
 * and computes a weighted composite stress score and regime.
 *
 * Stress categories:
 *   credit_stress  (weight 3): HY/IG spread notes, TEDRATE
 *   rates_stress   (weight 2): yield curve, treasury notes
 *   vol_stress     (weight 3): VIX, CBOE notes
 *   macro_broad    (weight 1): all other macro notes
 *
 * Regime thresholds (stress_pct of max possible score):
 *   < 25%  → low
 *   25–50% → elevated
 *   50–75% → high
 *   > 75%  → extreme
 *
 * Usage:
 *   node run.mjs pull macro-volatility
 *   node run.mjs pull macro-volatility --window 30
 *   node run.mjs pull macro-volatility --dry-run
 */

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { readFolderWhere } from '../lib/frontmatter.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const STRESS_CATEGORIES = {
  credit_stress: {
    weight: 3,
    keywords: ['BAMLH0A0HYM2', 'BAMLC0A0CM', 'TEDRATE', 'HYG', 'LQD', 'credit', 'spread', 'high.yield', 'HY_spread', 'IG_spread'],
  },
  rates_stress: {
    weight: 2,
    keywords: ['T10Y2Y', 'T10Y3M', 'DGS10', 'DGS2', 'DFII10', 'FEDFUNDS', 'yield.curve', 'treasury', 'rates', 'TLT', 'IEF'],
  },
  vol_stress: {
    weight: 3,
    keywords: ['VIX', 'SKEW', 'CBOE', 'cboe', 'volatility', 'vol_'],
  },
  macro_broad: {
    weight: 1,
    keywords: [], // catch-all for remaining macro notes
  },
};

const SIGNAL_SCORES = { critical: 3, alert: 2, watch: 1, clear: 0 };
const LOOKBACK_DAYS = 30;

export async function pull(flags = {}) {
  const window = Number(flags.window) > 0 ? Number(flags.window) : LOOKBACK_DAYS;
  const vaultRoot = getVaultRoot();
  const pullsDir  = getPullsDir();

  const macroDirs  = [join(pullsDir, 'Macro'), join(pullsDir, 'Market')];
  const cutoffDate = daysAgo(window);

  console.log(`Macro Volatility: reading pull notes from last ${window} days (since ${cutoffDate})...`);

  const allNotes = [];
  for (const dir of macroDirs) {
    const notes = await readFolderWhere(
      dir,
      d => isMacroNote(d) && isRecent(d, cutoffDate)
    );
    allNotes.push(...notes);
    console.log(`  ${dir.replace(vaultRoot, '').replace(/\\/g, '/')}: ${notes.length} note(s)`);
  }

  if (!allNotes.length) {
    console.log('Macro Volatility: no macro pull notes found. Run FRED and CBOE pullers to populate.');
  }

  const classified = allNotes.map(note => classifyNote(note));
  const stressData = computeStress(classified);
  const note = buildMacroVolNote({ classified, stressData, window });
  const filePath = join(pullsDir, 'Macro', dateStampedFilename('Macro_Volatility'));

  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    console.log(`Wrote: ${filePath}`);
  }

  return {
    filePath: flags['dry-run'] ? null : filePath,
    noteCount: allNotes.length,
    regime: stressData.regime,
    stress_pct: stressData.stress_pct,
  };
}

function buildMacroVolNote({ classified, stressData, window }) {
  const { stress_pct, regime, category_scores, total_score, max_score, by_category } = stressData;

  const summaryRows = Object.entries(STRESS_CATEGORIES).map(([cat, cfg]) => {
    const cs = category_scores[cat] ?? { score: 0, max: 0, notes: [] };
    const pct = cs.max > 0 ? Math.round((cs.score / cs.max) * 100) : 0;
    const worstNote = cs.notes
      .sort((a, b) => (SIGNAL_SCORES[b.signal_status] ?? 0) - (SIGNAL_SCORES[a.signal_status] ?? 0))[0];
    return [
      cat.replace(/_/g, ' '),
      String(cfg.weight),
      cs.notes.length > 0 ? String(cs.notes.length) : '—',
      `${pct}%`,
      worstNote ? worstNote.signal_status : '—',
      worstNote ? worstNote.title : '—',
    ];
  });

  const noteRows = classified
    .sort((a, b) => (SIGNAL_SCORES[b.signal_status] ?? 0) - (SIGNAL_SCORES[a.signal_status] ?? 0))
    .map(c => [
      c.title,
      c.category.replace(/_/g, ' '),
      c.signal_status ?? 'clear',
      c.date_pulled ?? '—',
      c.source ?? '—',
    ]);

  const overallStatus = regime === 'extreme' ? 'critical' : regime === 'high' ? 'alert' : regime === 'elevated' ? 'watch' : 'clear';

  return buildNote({
    frontmatter: {
      title:          'Macro Volatility',
      source:         'Vault Orchestrator (synthesis)',
      date_pulled:    today(),
      domain:         'macro',
      agent_owner:    'macro',
      agent_scope:    'macro',
      data_type:      'macro_volatility',
      frequency:      'daily',
      lookback_days:  window,
      notes_scanned:  classified.length,
      total_score:    total_score,
      max_score:      max_score,
      stress_pct:     Math.round(stress_pct),
      stress_regime:  regime,
      signal_status:  overallStatus,
      signals:        overallStatus === 'clear' ? [] : ['macro-volatility-stress'],
      tags:           ['macro-volatility', 'stress', 'credit', 'rates', 'vol', 'regime'],
    },
    sections: [
      {
        heading: 'Stress Regime Summary',
        content: [
          `**Composite Stress Score**: ${total_score} / ${max_score} (${Math.round(stress_pct)}%)`,
          `**Regime**: **${regime.toUpperCase()}** — ${regimeDescription(regime)}`,
          '',
          buildTable(
            ['Category', 'Weight', 'Notes', 'Stress%', 'Worst Status', 'Driving Note'],
            summaryRows
          ),
        ].join('\n'),
      },
      {
        heading: 'Source Notes',
        content: noteRows.length
          ? buildTable(
              ['Title', 'Category', 'Status', 'Date', 'Source'],
              noteRows
            )
          : `_No macro pull notes found in the last ${window} days. Run FRED and CBOE pullers to populate._`,
      },
      {
        heading: 'Regime Guide',
        content: [
          '- **low** (<25%): Credit spreads tight, yield curve normal, VIX low. Risk-on environment.',
          '- **elevated** (25–50%): At least one stress category showing watch/alert. Monitor, don\'t oversize.',
          '- **high** (50–75%): Multiple categories at alert. Reduce gross exposure; prioritize cash and hedges.',
          '- **extreme** (>75%): Systemic stress across credit, rates, and vol simultaneously. Defensive posture.',
          '',
          '> Stress score is computed as the weighted sum of signal scores (clear=0, watch=1, alert=2, critical=3)',
          '> across all macro pull notes, divided by the maximum possible weighted score.',
          '> Only notes pulled within the last ' + window + ' days are included.',
        ].join('\n'),
      },
    ],
  });
}

function classifyNote(note) {
  const candidate = [
    note.filename,
    note.data.title ?? '',
    note.data.source ?? '',
    note.data.data_type ?? '',
    note.data.series_id ?? '',
  ].join(' ').toUpperCase();

  let assignedCategory = 'macro_broad';
  for (const [cat, cfg] of Object.entries(STRESS_CATEGORIES)) {
    if (cat === 'macro_broad') continue;
    if (cfg.keywords.some(kw => candidate.includes(kw.toUpperCase()))) {
      assignedCategory = cat;
      break;
    }
  }

  return {
    filename:     note.filename,
    title:        note.data.title ?? note.filename.replace(/\.md$/, ''),
    source:       note.data.source ?? '—',
    date_pulled:  note.data.date_pulled ?? note.data.date ?? null,
    signal_status: note.data.signal_status ?? 'clear',
    category:     assignedCategory,
  };
}

function computeStress(classified) {
  const category_scores = {};
  for (const cat of Object.keys(STRESS_CATEGORIES)) {
    category_scores[cat] = { score: 0, max: 0, notes: [] };
  }

  for (const c of classified) {
    const cat    = c.category;
    const weight = STRESS_CATEGORIES[cat].weight;
    const score  = SIGNAL_SCORES[c.signal_status] ?? 0;
    category_scores[cat].score += score * weight;
    category_scores[cat].max   += 3 * weight; // 3 = max score per note
    category_scores[cat].notes.push(c);
  }

  // At least one note per category must exist for that category's max to count
  let total_score = 0;
  let max_score   = 0;
  for (const [cat, cs] of Object.entries(category_scores)) {
    if (cs.notes.length > 0) {
      // Normalize to single-note equivalent per category for comparability
      const catScore = cs.notes.length > 0
        ? Math.max(...cs.notes.map(n => SIGNAL_SCORES[n.signal_status] ?? 0)) * STRESS_CATEGORIES[cat].weight
        : 0;
      total_score += catScore;
      max_score   += 3 * STRESS_CATEGORIES[cat].weight;
    }
  }

  const stress_pct = max_score > 0 ? (total_score / max_score) * 100 : 0;
  const regime = stress_pct >= 75 ? 'extreme' : stress_pct >= 50 ? 'high' : stress_pct >= 25 ? 'elevated' : 'low';

  return { stress_pct, regime, category_scores, total_score, max_score };
}

function isMacroNote(data) {
  const domain    = String(data.domain ?? '').toLowerCase();
  const dataType  = String(data.data_type ?? '').toLowerCase();
  const source    = String(data.source ?? '').toLowerCase();
  return (
    domain === 'macro' ||
    dataType.includes('fred') ||
    dataType.includes('cboe') ||
    dataType.includes('time_series') ||
    source.includes('fred') ||
    source.includes('cboe')
  );
}

function isRecent(data, cutoffDate) {
  const datePulled = data.date_pulled ?? data.date;
  if (!datePulled) return true; // include if no date
  return String(datePulled).slice(0, 10) >= cutoffDate;
}

function regimeDescription(regime) {
  const descriptions = {
    low:      'Risk-on. Credit and rates markets calm.',
    elevated: 'At least one stress indicator elevated. Monitor closely.',
    high:     'Multiple stress categories at alert. Reduce exposure.',
    extreme:  'Systemic stress. Defensive posture required.',
  };
  return descriptions[regime] ?? regime;
}

function daysAgo(days) {
  const date = new Date(`${today()}T00:00:00`);
  date.setDate(date.getDate() - Number(days));
  return date.toISOString().slice(0, 10);
}
