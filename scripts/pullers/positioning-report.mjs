/**
 * positioning-report.mjs - Big Money vs Retail positioning report.
 *
 * Builds a cautious, vault-native positioning synthesis from local notes and
 * optional symbol inputs. It does not place trades and does not require MCP.
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir } from '../lib/config.mjs';
import { readFolder } from '../lib/frontmatter.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { scorePositioningSignal } from '../lib/positioning-scorer.mjs';
import { loadThesisWatchlists, normalizeSymbol } from '../lib/thesis-watchlists.mjs';

export const SIDECAR_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'positioning');

const POSITIONING_RISK_NOTES = Object.freeze([
  '13F data is delayed and incomplete.',
  'Fund holdings do not reveal full hedging.',
  'Retail flow data is often estimated.',
  'Options flow does not always reveal buyer intent.',
  'Sovereign fund reporting is inconsistent.',
  'COT categories are useful but broad.',
  'Crowded trades can continue longer than expected.',
  'Contrarian signals require timing confirmation.',
  'Positioning is not the same thing as valuation.',
  'A good signal is not automatically a good trade.',
]);

const STRATEGY_MATCHERS = Object.freeze([
  { name: 'Commodity Ladder Strategy', terms: ['energy', 'oil', 'gas', 'xom', 'cvx', 'commodity', 'gold', 'wpm'] },
  { name: 'SPY QQQ Entropy Expansion Monitor', terms: ['spy', 'qqq', 'index', 'mega-cap', 'market'] },
  { name: 'Cash-Flow Quality Giants', terms: ['cash-flow', 'quality', 'compounder', 'fcf'] },
  { name: 'PEAD and Market Anomalies', terms: ['earnings', 'pead', 'surprise', 'drift'] },
  { name: 'Crowding and AI Bot Risk', terms: ['crowding', 'entropy', 'retail euphoria', 'call frenzy', 'ai'] },
  { name: 'Macro Regime Framework', terms: ['cot', 'macro', 'rates', 'treasury', 'dollar', 'liquidity'] },
]);

const SYMBOL_STRATEGY_OVERRIDES = Object.freeze({
  SPY: 'SPY QQQ Entropy Expansion Monitor',
  QQQ: 'SPY QQQ Entropy Expansion Monitor',
  XOM: 'Commodity Ladder Strategy',
  CVX: 'Commodity Ladder Strategy',
  WPM: 'Commodity Ladder Strategy',
  GOLD: 'Commodity Ladder Strategy',
  MSFT: 'Cash-Flow Quality Giants',
  NVDA: 'Cash-Flow Quality Giants',
});

export async function pull(flags = {}) {
  const date = today();
  const symbols = await resolveSymbols(flags);
  const sourceNotes = await loadLocalPositioningNotes();
  const signals = buildSignals({ symbols, sourceNotes, limit: Number(flags.limit) || 25 });
  const ranked = signals
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score) || b.confirmation_count - a.confirmation_count)
    .map((signal, index) => ({ ...signal, rank: index + 1 }));

  const sourceGaps = buildSourceGaps(sourceNotes);
  const marketRegime = inferMarketRegime(sourceNotes);
  const overallConfidence = inferOverallConfidence(ranked);
  const reportNote = buildPositioningReportNote({ date, marketRegime, overallConfidence, signals: ranked, sourceGaps });
  const watchlistNote = buildPositioningWatchlistNote({ date, signals: ranked });
  const outDir = join(getPullsDir(), 'Positioning');
  const reportPath = join(outDir, dateStampedFilename('Big_Money_vs_Retail_Positioning_Report'));
  const watchlistPath = join(outDir, dateStampedFilename('Big_Money_vs_Retail_Watchlist'));
  const signalStatus = ranked.some(signal => Math.abs(signal.score) >= 8) ? 'alert' : ranked.length ? 'watch' : 'clear';

  if (flags['dry-run']) {
    console.log(reportNote);
    console.log('\n--- WATCHLIST ---\n');
    console.log(watchlistNote);
  } else {
    writeNote(reportPath, reportNote);
    writeNote(watchlistPath, watchlistNote);
    await emitSidecar({
      schema_version: 1,
      date,
      signal_status: signalStatus,
      market_regime: marketRegime,
      confidence: overallConfidence,
      signal_count: ranked.length,
      source_gaps: sourceGaps,
      report_note: `[[${reportPath.split(/[\\/]/).pop().replace(/\.md$/, '')}]]`,
      watchlist_note: `[[${watchlistPath.split(/[\\/]/).pop().replace(/\.md$/, '')}]]`,
      signals: ranked,
    });
    console.log(`Wrote: ${reportPath}`);
    console.log(`Wrote: ${watchlistPath}`);
  }

  const result = {
    filePath: flags['dry-run'] ? null : reportPath,
    watchlistPath: flags['dry-run'] ? null : watchlistPath,
    signal_status: signalStatus,
    signalCount: ranked.length,
    confidence: overallConfidence,
  };
  if (flags.json) console.log(JSON.stringify(result, null, 2));
  return result;
}

export function buildPositioningReportNote({ date, marketRegime, overallConfidence, signals, sourceGaps = [] }) {
  const frontmatter = {
    title: `Big Money vs Retail Positioning Report ${date}`,
    source: 'Vault Positioning Agent',
    date_pulled: date,
    domain: 'positioning',
    data_type: 'positioning_report',
    frequency: 'weekly',
    signal_status: signals.length ? 'watch' : 'clear',
    signals: signals.slice(0, 8).map(signal => signal.asset),
    agent_owner: 'positioning',
    handoff_to: ['orchestrator'],
    tags: ['positioning', 'big-money-vs-retail', 'institutional-flow', 'retail-sentiment'],
  };

  const topRows = signals.slice(0, 10).map(signal => [
    signal.rank ?? '',
    signal.asset,
    signal.institutional_bias,
    signal.retail_bias,
    String(signal.score),
    signal.confidence,
    signal.strategy_role,
  ]);

  return buildNote({
    frontmatter,
    sections: [
      {
        heading: 'Executive Summary',
        content: buildExecutiveSummary({ marketRegime, overallConfidence, signals, sourceGaps }),
      },
      {
        heading: 'Top Divergence Signals',
        content: topRows.length
          ? buildTable(['Rank', 'Asset / Theme', 'Institutional Bias', 'Retail Bias', 'Score', 'Confidence', 'Strategy Role'], topRows)
          : '_No positioning divergence signals were generated._',
      },
      {
        heading: 'Signal Deep Dives',
        content: signals.length ? signals.map(formatDeepDive).join('\n\n---\n\n') : '_No signal deep dives._',
      },
      {
        heading: 'Vault Strategy Alignment',
        content: signals.length ? signals.map(formatStrategyAlignment).join('\n\n') : '_No strategy alignment needed._',
      },
      {
        heading: 'Source Gaps',
        content: sourceGaps.length ? sourceGaps.map(gap => `- ${gap}`).join('\n') : '_No major source gaps detected._',
      },
      {
        heading: 'Risk Notes',
        content: POSITIONING_RISK_NOTES.map(note => `- ${note}`).join('\n'),
      },
    ],
  });
}

export function buildPositioningWatchlistNote({ date, signals }) {
  const rows = signals.map(signal => [
    signal.asset,
    signal.relationship,
    String(signal.score),
    signal.confidence,
    signal.matched_strategy,
    signal.monitoring_triggers?.[0] ?? 'Confirm with fresh price and source data',
    normalizeWatchlistStatus(signal.action_classification),
  ]);

  return buildNote({
    frontmatter: {
      title: `Big Money vs Retail Watchlist ${date}`,
      source: 'Vault Positioning Agent',
      date_pulled: date,
      domain: 'positioning',
      data_type: 'positioning_watchlist',
      frequency: 'weekly',
      signal_status: signals.length ? 'watch' : 'clear',
      signals: signals.slice(0, 8).map(signal => signal.asset),
      agent_owner: 'positioning',
      handoff_to: ['orchestrator'],
      tags: ['positioning-watchlist', 'big-money-vs-retail', 'watchlist'],
    },
    sections: [{
      heading: 'Watchlist',
      content: rows.length
        ? buildTable(['Asset / Theme', 'Current Signal', 'Score', 'Confidence', 'Strategy Match', 'Next Trigger', 'Status'], rows)
        : '_No active positioning watchlist items._',
    }],
  });
}

export async function loadLatestPositioningSidecar() {
  if (!existsSync(SIDECAR_DIR)) return null;
  const files = (await readdir(SIDECAR_DIR)).filter(file => file.endsWith('.json')).sort().reverse();
  if (!files.length) return null;
  try {
    return JSON.parse(await readFile(join(SIDECAR_DIR, files[0]), 'utf8'));
  } catch {
    return null;
  }
}

async function resolveSymbols(flags) {
  if (flags.symbols) {
    return String(flags.symbols).split(',').map(normalizeSymbol).filter(Boolean);
  }
  if (flags.thesis || flags['all-thesis']) {
    const watchlists = loadThesisWatchlists({ includeBaskets: Boolean(flags['include-baskets']) });
    const filtered = flags.thesis
      ? watchlists.filter(item => String(item.name).toLowerCase().includes(String(flags.thesis).toLowerCase()))
      : watchlists;
    return [...new Set(filtered.flatMap(item => item.symbols).map(normalizeSymbol).filter(Boolean))].slice(0, Number(flags.limit) || 25);
  }
  return ['SPY', 'QQQ', 'XOM', 'NVDA', 'MSFT'];
}

async function loadLocalPositioningNotes() {
  const pullsDir = getPullsDir();
  const domains = ['Market', 'Macro', 'Fundamentals', 'News', 'Positioning', 'Theses', 'Sectors'];
  const notes = [];
  for (const domain of domains) {
    const dir = join(pullsDir, domain);
    const domainNotes = await readFolder(dir, false);
    notes.push(...domainNotes.map(note => ({ ...note, pullDomain: domain })));
  }
  return notes;
}

function buildSignals({ symbols, sourceNotes, limit }) {
  const notesBySymbol = groupNotesBySymbol(sourceNotes);
  return symbols.slice(0, limit).map(symbol => {
    const notes = notesBySymbol.get(symbol) ?? [];
    const strategy = matchVaultStrategy(symbol, notes);
    return {
      ...scorePositioningSignal({
        asset: symbol,
        theme: `${symbol} positioning read`,
        institutional: inferInstitutional(symbol, notes),
        retail: inferRetail(symbol, notes),
        macro: inferMacro(notes, sourceNotes),
        options: inferOptions(notes),
        price: inferPrice(notes),
        strategy,
      }),
      source_notes: notes.slice(0, 5).map(noteWikiLink),
    };
  });
}

function groupNotesBySymbol(notes) {
  const map = new Map();
  for (const note of notes) {
    const candidates = [
      note.data?.symbol,
      note.data?.ticker,
      ...String(note.data?.title || note.filename).match(/\b[A-Z]{2,5}\b/g) ?? [],
    ].map(normalizeSymbol).filter(Boolean);
    for (const symbol of candidates) {
      if (!map.has(symbol)) map.set(symbol, []);
      map.get(symbol).push(note);
    }
  }
  return map;
}

function inferInstitutional(symbol, notes) {
  const insider = notes.find(note => note.data?.data_type === 'insider_trading');
  const buys = Number(insider?.data?.insider_buys ?? 0);
  const sells = Number(insider?.data?.insider_sells ?? 0);
  if (buys > sells && buys > 0) return { direction: 'accumulating', strength: 1, sources: ['FMP insider trades'] };
  if (sells > buys && sells > 0) return { direction: 'selling', strength: 1, sources: ['FMP insider trades'] };
  if (['XOM', 'CVX', 'WPM', 'GOLD'].includes(symbol)) return { direction: 'accumulating', strength: 1, sources: ['sector positioning proxy'] };
  return { direction: 'unknown', strength: 0, sources: [] };
}

function inferRetail(symbol, notes) {
  const social = notes.find(note => ['reddit_sentiment', 'gdelt_news_monitor'].includes(String(note.data?.data_type || '')));
  if (!social) return { direction: ['SPY', 'QQQ', 'NVDA', 'TSLA'].includes(symbol) ? 'buying' : 'neglect', strength: 1, sources: ['retail proxy'] };
  const status = String(social.data?.signal_status ?? 'clear');
  if (status === 'alert' || status === 'critical') return { direction: 'euphoria', strength: 2, sources: [noteWikiLink(social)] };
  return { direction: 'neglect', strength: 1, sources: [noteWikiLink(social)] };
}

function inferMacro(notes, allNotes) {
  const cot = allNotes.find(note => note.data?.data_type === 'cot_report');
  const macro = allNotes.find(note => note.data?.data_type === 'macro_volatility');
  if (cot && String(cot.data?.signal_status || 'clear') !== 'clear') return { direction: 'supportive', strength: 1, sources: [noteWikiLink(cot)] };
  if (macro) return { direction: 'supportive', strength: 1, sources: [noteWikiLink(macro)] };
  return { direction: 'unknown', strength: 0, sources: [] };
}

function inferOptions(notes) {
  const options = notes.find(note => String(note.data?.data_type || '').includes('options'));
  if (!options) return { direction: 'unknown', strength: 0, sources: [] };
  const status = String(options.data?.signal_status || 'clear');
  return { direction: status === 'clear' ? 'unknown' : 'supportive', strength: status === 'clear' ? 0 : 1, sources: [noteWikiLink(options)] };
}

function inferPrice(notes) {
  const technical = notes.find(note => note.data?.data_type === 'technical_snapshot' || note.data?.technical_bias);
  if (!technical) return { direction: 'unknown', strength: 0, sources: [] };
  const bias = String(technical.data?.technical_bias || '').toLowerCase();
  return {
    direction: bias.includes('bull') || bias.includes('constructive') ? 'supportive' : bias.includes('bear') ? 'weakening' : 'unknown',
    strength: bias.includes('bull') || bias.includes('bear') || bias.includes('constructive') ? 1 : 0,
    sources: [noteWikiLink(technical)],
  };
}

function matchVaultStrategy(symbol, notes) {
  const override = SYMBOL_STRATEGY_OVERRIDES[symbol];
  if (override) return strategyMatch(override, 2);

  const text = `${symbol} ${notes.map(note => `${note.data?.title ?? ''} ${note.content ?? ''}`).join(' ')}`.toLowerCase();
  const match = STRATEGY_MATCHERS.find(strategy => strategy.terms.some(term => text.includes(term)));
  return match
    ? strategyMatch(match.name, 2)
    : { matched: false, strength: 0, name: null };
}

function strategyMatch(name, strength) {
  return { matched: true, strength, name };
}

function buildSourceGaps(sourceNotes) {
  const dataTypes = new Set(sourceNotes.map(note => String(note.data?.data_type || '')));
  const gaps = [];
  if (!dataTypes.has('institutional_ownership')) gaps.push('No fresh FMP institutional ownership / 13F pull note found.');
  if (!dataTypes.has('reddit_sentiment')) gaps.push('Retail flow uses social/news proxies; no dedicated retail order-flow feed configured.');
  if (!dataTypes.has('positioning_report')) gaps.push('This is the first positioning report in the local sidecar history.');
  return gaps;
}

function inferMarketRegime(sourceNotes) {
  const macro = sourceNotes.find(note => note.data?.data_type === 'macro_volatility');
  if (macro?.data?.stress_regime) return `Macro ${macro.data.stress_regime}`;
  return 'Unknown / baseline';
}

function inferOverallConfidence(signals) {
  if (signals.some(signal => signal.confidence === 'High')) return 'High';
  if (signals.some(signal => signal.confidence === 'Medium')) return 'Medium';
  return 'Low';
}

function buildExecutiveSummary({ marketRegime, overallConfidence, signals, sourceGaps }) {
  const top = signals[0];
  return [
    `- **Market Regime**: ${marketRegime}`,
    `- **Overall Confidence**: ${overallConfidence}`,
    top ? `- **Top signal**: ${top.asset} scored ${top.score} (${top.confidence}); ${top.action_classification}.` : '- **Top signal**: none.',
    `- **Source gaps**: ${sourceGaps.length ? sourceGaps.slice(0, 2).join('; ') : 'none detected.'}`,
    '- **Operating rule**: positioning is research context only; no broker-write action is generated.',
  ].join('\n');
}

function formatDeepDive(signal) {
  return [
    `### ${signal.rank ?? ''}. ${signal.asset}`.trim(),
    '',
    `**Signal Type:**  ${signal.strategy_role}`,
    '',
    `**What big money appears to be doing:**  ${signal.institutional_bias}`,
    '',
    `**What retail appears to be doing:**  ${signal.retail_bias}`,
    '',
    `**Why this matters:**  ${signal.relationship}`,
    '',
    '**Evidence:**',
    ...(signal.evidence?.length ? signal.evidence.map(item => `- ${item}`) : ['- No direct source evidence; proxy read only.']),
    '',
    `**Score:**  ${signal.score}`,
    '',
    `**Confidence:**  ${signal.confidence}`,
    '',
    '**Risks and counterarguments:**',
    ...(signal.risks ?? []).slice(0, 5).map(item => `- ${item}`),
    '',
    '**Action Classification:**',
    `- ${signal.action_classification}`,
    '',
    '**Monitoring Triggers:**',
    ...(signal.monitoring_triggers ?? []).map(item => `- ${item}`),
    formatFirmMarkers(signal),
  ].filter(Boolean).join('\n');
}

function formatStrategyAlignment(signal) {
  if (signal.matched_strategy && signal.matched_strategy !== 'None found') {
    return [
      `### ${signal.asset}`,
      '',
      `**Matched Strategy:**  ${signal.matched_strategy}`,
      '',
      `**Why this signal belongs here:**  ${signal.relationship}`,
      '',
      `**Strategy role:**  ${signal.strategy_role}`,
      '',
      `**Vault update needed:**  ${signal.vault_update_needed ?? 'No'}`,
      '',
      '**Suggested vault note update:**  Add this positioning read as a confirmation/risk context item if it persists for another scan.',
    ].join('\n');
  }
  return [
    `### ${signal.asset}`,
    '',
    '**Matched Strategy:**  None found.',
    '',
    `**Recommendation:**  Create a new vault note titled: "${signal.asset} Positioning Framework"`,
    '',
    '**Reason:**  The signal does not fit cleanly into existing strategy notes.',
  ].join('\n');
}

function formatFirmMarkers(signal) {
  if (!signal.firm_markers?.length) return '';
  return signal.firm_markers.map(marker => [
    '',
    `### Firm Marker: ${marker.firm}`,
    '',
    `**Archetype Marker:**  ${marker.archetype_marker}`,
    '',
    `**Likely Market Role:**  ${marker.likely_market_role}`,
    '',
    `**Primary Footprint:**  ${marker.primary_footprint}`,
    '',
    `**Signal Strength:**  ${marker.signal_strength}`,
    '',
    `**Do Not Overread:**  ${marker.do_not_overread}`,
  ].join('\n')).join('\n');
}

function normalizeWatchlistStatus(action) {
  if (action === 'Avoid / crowded') return 'Avoid';
  if (action === 'Exit-risk warning') return 'Crowded risk';
  if (action === 'Needs confirmation') return 'Needs confirmation';
  if (action === 'Watchlist only') return 'Watchlist';
  return 'Active research';
}

function noteWikiLink(note) {
  const stem = String(note.filename || '').replace(/\.md$/i, '');
  return stem ? `[[${stem}]]` : 'local note';
}

async function emitSidecar(sidecar) {
  await mkdir(SIDECAR_DIR, { recursive: true });
  await writeFile(join(SIDECAR_DIR, `${sidecar.date}.json`), JSON.stringify(sidecar, null, 2));
}
