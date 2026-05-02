/**
 * confluence-scorer.mjs — Strategy confluence scoring engine.
 *
 * Implements the 10-dimension model from the AI Agent Strategy Monitoring
 * Build Guide. Each dimension scores 0-3, max 30. Pure logic — no I/O.
 *
 * NOTE: Dimension 8 (Options/volatility fit) is always 0 / MISSING until an
 * options chain data source is configured (see build guide § 2.1). Practical
 * ceiling is therefore 27/30.
 */

// ─── Regime-to-strategy fit matrix ───────────────────────────────────────────
// From build guide § 5 (Regime Fit tables) and § 4 (strategy_bias fields).

const REGIME_FIT = {
  'Risk-On Trend':        { trend:3, momentum:3, pead:2, 'value-quality':2, carry:2, 'mean-reversion':1, pairs:2, 'vol-selling':2, 'long-vol':1, 'macro-event':1, 'structural-flow':2, auction:2 },
  'Range / Chop':         { trend:1, momentum:1, pead:2, 'value-quality':2, carry:2, 'mean-reversion':3, pairs:3, 'vol-selling':2, 'long-vol':2, 'macro-event':1, 'structural-flow':2, auction:3 },
  'Earnings-Driven':      { trend:2, momentum:2, pead:3, 'value-quality':2, carry:1, 'mean-reversion':2, pairs:1, 'vol-selling':1, 'long-vol':2, 'macro-event':1, 'structural-flow':1, auction:2 },
  'Inflation / Oil Shock':{ trend:1, momentum:1, pead:1, 'value-quality':2, carry:2, 'mean-reversion':1, pairs:2, 'vol-selling':1, 'long-vol':2, 'macro-event':3, 'structural-flow':1, auction:1 },
  'Growth Scare':         { trend:1, momentum:1, pead:1, 'value-quality':2, carry:1, 'mean-reversion':2, pairs:2, 'vol-selling':1, 'long-vol':3, 'macro-event':3, 'structural-flow':1, auction:2 },
  'Liquidity Stress':     { trend:1, momentum:1, pead:1, 'value-quality':1, carry:0, 'mean-reversion':2, pairs:1, 'vol-selling':0, 'long-vol':3, 'macro-event':3, 'structural-flow':1, auction:1 },
  'Volatility Compression':{ trend:2, momentum:2, pead:2, 'value-quality':2, carry:2, 'mean-reversion':2, pairs:2, 'vol-selling':2, 'long-vol':3, 'macro-event':2, 'structural-flow':2, auction:2 },
  'Volatility Spike':     { trend:1, momentum:1, pead:1, 'value-quality':1, carry:1, 'mean-reversion':2, pairs:1, 'vol-selling':0, 'long-vol':3, 'macro-event':3, 'structural-flow':1, auction:2 },
  'Crowded Factor Unwind':{ trend:1, momentum:1, pead:1, 'value-quality':2, carry:1, 'mean-reversion':3, pairs:2, 'vol-selling':1, 'long-vol':2, 'macro-event':2, 'structural-flow':1, auction:2 },
  'Policy Intervention':  { trend:1, momentum:1, pead:1, 'value-quality':1, carry:1, 'mean-reversion':1, pairs:1, 'vol-selling':1, 'long-vol':2, 'macro-event':3, 'structural-flow':1, auction:1 },
};

// ─── Regime classifier ────────────────────────────────────────────────────────

/**
 * Classify the current market regime from available vault context.
 * @param {{ stressRegime?: string, stressPct?: number, overallSignalStatus?: string, cotSignal?: string }} ctx
 * @returns {{ label: string, confidence: number, basis: string }}
 */
export function classifyRegime({ stressRegime, stressPct, overallSignalStatus, cotSignal } = {}) {
  const stress = stressRegime ?? 'low';
  const pct    = stressPct    ?? 0;

  if (stress === 'extreme' || pct >= 75) {
    return { label: 'Liquidity Stress', confidence: 2, basis: `macro-vol stress ${pct}% (extreme)` };
  }
  if (stress === 'high' || pct >= 50) {
    const label = overallSignalStatus === 'critical' ? 'Liquidity Stress' : 'Growth Scare';
    return { label, confidence: 2, basis: `macro-vol stress ${pct}% (high)` };
  }
  if (stress === 'elevated' || pct >= 25) {
    return { label: 'Range / Chop', confidence: 1, basis: `macro-vol stress ${pct}% (elevated)` };
  }
  if (cotSignal === 'alert') {
    return { label: 'Crowded Factor Unwind', confidence: 1, basis: 'macro-vol low stress but COT positioning extremes detected' };
  }
  return { label: 'Risk-On Trend', confidence: 2, basis: `macro-vol stress ${pct}% (low)` };
}

// ─── Strategy normalizer ──────────────────────────────────────────────────────

/**
 * Map free-text edge_type / strategy_family to a normalized category key
 * used in REGIME_FIT lookups.
 */
export function normalizeStrategy(edgeType, strategyFamily) {
  const s = `${edgeType ?? ''} ${strategyFamily ?? ''}`.toLowerCase();
  if (s.includes('pead') || s.includes('earnings drift') || s.includes('anomaly'))       return 'pead';
  if (s.includes('pair') || s.includes('relative value') || s.includes('spread'))        return 'pairs';
  if (s.includes('mean reversion') || s.includes('reversion'))                           return 'mean-reversion';
  if (s.includes('cash-flow') || s.includes('quality') || s.includes('fundamental'))     return 'value-quality';
  if (s.includes('long vol') || s.includes('tail risk'))                                 return 'long-vol';
  if (s.includes('vol') && (s.includes('sell') || s.includes('income')))                 return 'vol-selling';
  if (s.includes('carry') || s.includes('dividend'))                                     return 'carry';
  if (s.includes('structural') || (s.includes('flow') && !s.includes('cash')))           return 'structural-flow';
  if (s.includes('auction') || s.includes('opening range') || s.includes('orb'))         return 'auction';
  if (s.includes('macro') || s.includes('crowding') || s.includes('entropy'))            return 'macro-event';
  if (s.includes('momentum') || s.includes('relative strength'))                         return 'momentum';
  return 'trend';
}

// ─── Setup scorer ─────────────────────────────────────────────────────────────

/**
 * Score one review item across 10 dimensions.
 * @param {object} item — review item from sidecar (title, signal_status, severity,
 *                        edge_type, strategy_family, confidence, freshness,
 *                        coverage, disposition, invalidation, domain, note_path)
 * @param {{ regimeLabel?: string, stressRegime?: string, stressPct?: number,
 *           moduleStatuses?: object, crowdingSignal?: string }} ctx
 * @returns {object} scored setup with markers and disposition
 */
export function scoreSetup(item, ctx = {}) {
  const {
    regimeLabel    = 'Risk-On Trend',
    stressRegime   = 'low',
    stressPct      = 0,
    moduleStatuses = {},
    crowdingSignal = null,
  } = ctx;

  const strategy = normalizeStrategy(item.edge_type, item.strategy_family);
  const fitTable = REGIME_FIT[regimeLabel] ?? REGIME_FIT['Risk-On Trend'];
  const coverage = parseCoverage(item.coverage);
  const vetoes   = [];
  const markers  = {};

  // 1 — Regime alignment
  const regScore = clamp(fitTable[strategy] ?? 1, 0, 3);
  markers.regime = { score: regScore, status: grade(regScore), note: `${regimeLabel} × ${strategy}` };

  // 2 — Macro alignment (inverse of stress; long-vol gets direct stress benefit)
  let macroScore;
  if (strategy === 'long-vol') {
    macroScore = stressRegime === 'extreme' ? 3 : stressRegime === 'high' ? 3 : stressRegime === 'elevated' ? 2 : 1;
  } else {
    macroScore = stressPct <= 25 ? 3 : stressPct <= 50 ? 2 : stressPct <= 75 ? 1 : 0;
  }
  markers.macro = { score: macroScore, status: grade(macroScore), note: `${stressRegime} stress (${stressPct}%)` };

  // 3 — Strategy-specific signal strength
  const sigScore = signalScore(item.signal_status, item.severity);
  markers.strategy = { score: sigScore, status: grade(sigScore), note: `${item.signal_status ?? 'clear'} / ${item.severity ?? '—'}` };

  // 4 — Catalyst / fundamental support
  let catScore = domainBase(item.domain);
  if (item.freshness === 'Stale') catScore = Math.max(0, catScore - 1);
  if (coverage >= 2) catScore = Math.min(3, catScore + 1);
  markers.fundamental = { score: catScore, status: grade(catScore), note: `domain: ${item.domain ?? '—'}, freshness: ${item.freshness ?? '—'}` };

  // 5 — Auction confirmation
  const aucMod = pickModuleStatus(moduleStatuses, ['auction feature engine', 'auction']);
  let aucScore = 0;
  if (strategy === 'auction') {
    aucScore = aucMod === 'active' ? 3 : aucMod === 'partial' ? 1 : 0;
  } else if (['mean-reversion', 'pairs'].includes(strategy)) {
    aucScore = aucMod === 'active' ? 1 : aucMod === 'partial' ? 1 : 0;
  }
  markers.auction = aucMod === 'gap' || !aucMod
    ? { score: 0, status: 'MISSING', note: 'Auction features module not active this window' }
    : { score: aucScore, status: grade(aucScore), note: `module: ${aucMod}` };

  // 6 — Volume / participation (proxied by confidence)
  const conf = parseConfidence(item.confidence);
  const volScore = conf >= 0.75 ? 3 : conf >= 0.6 ? 2 : conf >= 0.4 ? 1 : 0;
  markers.volume = { score: volScore, status: grade(volScore), note: `confidence ${Math.round(conf * 100)}%` };

  // 7 — Liquidity / execution quality (proxy; manual Fidelity check always required)
  let liqScore = 1;
  if (item.domain === 'biotech') liqScore = 1;
  if (coverage >= 2) liqScore = 2;
  if (item.freshness === 'Stale') liqScore = Math.max(0, liqScore - 1);
  markers.liquidity = { score: liqScore, status: grade(liqScore), note: 'Manual Fidelity review required for execution' };

  // 8 — Options / volatility fit — always TBD until data source configured
  markers.options = { score: 0, status: 'MISSING', note: 'TBD — no options chain data source. Manual Fidelity review required.' };

  // 9 — Crowding risk (inverse: high crowding = low score)
  let crowdScore;
  if (crowdingSignal === 'clear')  crowdScore = 3;
  else if (crowdingSignal === 'watch') crowdScore = 2;
  else if (crowdingSignal === 'alert') {
    crowdScore = 1;
    vetoes.push('Crowding signal active — tighten invalidation and cap size');
  } else {
    crowdScore = 2; // unknown → moderate assumption
  }
  markers.crowding = { score: crowdScore, status: crowdingSignal === 'alert' ? 'WATCH' : grade(crowdScore), note: `crowding: ${crowdingSignal ?? 'unknown'}` };

  // 10 — Risk / reward and invalidation
  const hasInval = Boolean(item.invalidation && item.invalidation !== '—' && String(item.invalidation).length > 5);
  if (!hasInval) vetoes.push('No invalidation level defined — required before any expression');
  let riskScore = hasInval ? 1 : 0;
  if (hasInval && coverage >= 1) riskScore = Math.min(3, riskScore + 1);
  if (hasInval && coverage >= 2) riskScore = Math.min(3, riskScore + 1);
  markers.risk = {
    score: riskScore,
    status: hasInval ? grade(riskScore) : 'WATCH',
    note: hasInval ? 'Invalidation defined' : 'MISSING: invalidation level required',
  };

  if (coverage === 0) {
    vetoes.push('No corroborating module coverage - watchlist only until another marker confirms');
  }

  const raw = Object.values(markers).reduce((s, m) => s + (m.score ?? 0), 0);
  const isShock = stressRegime === 'extreme' || stressRegime === 'high';
  const regimeCapped = isShock ? Math.min(raw, 18) : raw;
  const capNote   = isShock && raw > 18 ? `Capped at 18 — regime shock (${stressRegime} stress)` : null;

  const coverageCap = coverage === 0 ? 18 : coverage === 1 ? 21 : Infinity;
  const effective = Math.min(regimeCapped, coverageCap);
  const coverageCapNote = coverageCap !== Infinity && regimeCapped > coverageCap
    ? `Capped at ${coverageCap} - coverage ${item.coverage ?? '0/4'}`
    : null;
  const combinedCapNote = [capNote, coverageCapNote].filter(Boolean).join('; ') || null;

  return {
    title:           item.title ?? '—',
    note_path:       item.note_path ?? null,
    domain:          item.domain ?? '—',
    strategy,
    edge_type:       item.edge_type ?? '—',
    strategy_family: item.strategy_family ?? '—',
    signal_status:   item.signal_status ?? 'clear',
    severity:        item.severity ?? '—',
    setup_score:     effective,
    raw_score:       raw,
    regime_cap:      combinedCapNote,
    score_tier:      scoreTier(effective),
    disposition:     classifyDisposition(effective, vetoes),
    vetoes,
    markers,
  };
}

// ─── Disposition and tier helpers ─────────────────────────────────────────────

export function classifyDisposition(score, vetoes = []) {
  const hardVeto = vetoes.some(v => /no.trade|hard.veto/i.test(v));
  if (hardVeto) return 'vetoed';
  if (score >= 24) return 'approved';
  if (score >= 13) return 'watchlist';
  return 'rejected';
}

export function scoreTier(score) {
  if (score >= 28) return 'strong';
  if (score >= 24) return 'valid';
  if (score >= 19) return 'limited-risk';
  if (score >= 13) return 'watchlist';
  return 'no-trade';
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function grade(score) {
  if (score >= 3) return 'PASS';
  if (score >= 2) return 'WATCH';
  if (score >= 1) return 'WATCH';
  return 'FAIL';
}

function signalScore(status, severity) {
  if (status === 'critical') return 3;
  if (status === 'alert' && severity === 'HIGH') return 3;
  if (status === 'alert')  return 2;
  if (status === 'watch' && severity === 'MED') return 2;
  if (status === 'watch')  return 1;
  return 0;
}

function domainBase(domain) {
  const d = String(domain ?? '').toLowerCase();
  if (['fundamentals', 'signals'].includes(d)) return 2;
  if (['government', 'biotech', 'macro'].includes(d)) return 2;
  return 1;
}

function parseCoverage(coverage) {
  const m = String(coverage ?? '').match(/(\d+)\/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function parseConfidence(confidence) {
  if (confidence == null) return 0.5;
  const n = Number(String(confidence).replace('%', '')) / 100;
  return Number.isFinite(n) ? clamp(n, 0, 1) : 0.5;
}

function pickModuleStatus(statuses, keys) {
  for (const k of keys) {
    const v = statuses[k.toLowerCase()];
    if (v) return v;
  }
  return null;
}
