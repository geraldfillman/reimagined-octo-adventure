/**
 * Options Strategy Mapper — read-only, no trade execution, no broker writes.
 * Maps auction state + underlying view → Tier I strategy checklist.
 * All outputs are for manual Fidelity review only.
 *
 * @param {object} state
 * @param {Array}  agentSignals - from runAgentsInParallel
 * @param {object} scoreResult  - from scoreAndAlert
 * @returns {object} optionsMapping
 */
export function mapOptionsStrategy(state, agentSignals, scoreResult) {
  const byAgent = new Map(
    agentSignals.map(s => [String(s.agent || '').toLowerCase().replace(/[-\s]+/g, '_'), s])
  );

  const auction      = byAgent.get('auction')?.raw_data ?? {};
  const micro        = byAgent.get('microstructure')?.raw_data ?? {};
  const pead         = byAgent.get('pead')?.raw_data ?? {};
  const fund         = byAgent.get('fundamentals')?.raw_data ?? {};

  const auctionState  = String(auction.auction_state ?? 'unknown');
  const finalVerdict  = String(scoreResult?.signal_status ?? 'clear');
  const stratFamily   = String(scoreResult?.strategy_family ?? 'general_research');
  const cfqScore      = Number(fund.cfq_score ?? NaN);
  const crowdingScore = Number(scoreResult?.crowding_score ?? 2.5);
  const owns          = Boolean(state.owns_shares);

  const tier1Strategy = selectTier1Strategy({
    auctionState,
    finalVerdict,
    stratFamily,
    owns,
    crowdingScore,
  });

  const safetyFlags = buildSafetyFlags({
    crowdingScore,
    auctionState,
    cfqScore,
  });

  const checklist = buildFidelityChecklist(tier1Strategy);

  return {
    symbol:           String(state.symbol || '').toUpperCase(),
    tier1_strategy:   tier1Strategy,
    strategy_rationale: buildRationale(tier1Strategy, auctionState, stratFamily),
    safety_flags:     safetyFlags,
    fidelity_checklist: checklist,
    hard_restrictions: [
      'No automated trade. Manual execution only via Fidelity.',
      'Do not size without user-defined portfolio risk parameters.',
      'Verify options liquidity, spread, OI, and assignment risk before any order.',
      'Volatility-linked ETPs are complex products — not default holdings.',
    ],
  };
}

function selectTier1Strategy({ auctionState, finalVerdict, stratFamily, owns, crowdingScore }) {
  const tooRisky = crowdingScore >= 4;

  if (tooRisky) {
    return { name: 'avoid_or_watch', label: 'Avoid / Watch only', reason: 'Crowding too high for new exposure.' };
  }

  if (owns && ['bullish_acceptance', 'failed_downside'].includes(auctionState)) {
    return { name: 'covered_call', label: 'Covered Call (if near resistance)', reason: 'Own shares, price near VAH/HVN — consider covered call if willing to sell.' };
  }

  if (!owns && ['bullish_acceptance', 'balance'].includes(auctionState) && finalVerdict !== 'clear') {
    if (stratFamily === 'quality_earnings_drift' || stratFamily === 'earnings_drift') {
      return { name: 'csp_or_shares', label: 'Cash-Secured Put or Shares', reason: 'Positive drift candidate — CSP to own lower or shares for breakout confirmation.' };
    }
    return { name: 'long_shares_or_call', label: 'Shares or Long Call', reason: 'Bullish breakout accepted above value with positive regime.' };
  }

  if (!owns && ['balance', 'failed_downside'].includes(auctionState)) {
    return { name: 'csp_near_val', label: 'Cash-Secured Put near VAL', reason: 'Price near VAL support — CSP if willing to own at that level.' };
  }

  if (['failed_upside', 'bearish_acceptance'].includes(auctionState)) {
    return { name: 'long_put_or_wait', label: 'Long Put or Wait', reason: 'Bearish auction — long put on confirmation or wait for re-entry.' };
  }

  return { name: 'research_only', label: 'Research only', reason: 'No clear Tier I options setup. Monitor and journal.' };
}

function buildSafetyFlags({ crowdingScore, auctionState, cfqScore }) {
  const flags = [];
  if (crowdingScore >= 4)                           flags.push('HIGH CROWDING — entry requires strong confirmation');
  if (auctionState === 'failed_upside')             flags.push('Failed upside auction — do not chase breakout');
  if (auctionState === 'bearish_acceptance')        flags.push('Price in bearish acceptance — avoid long exposure without reversal signal');
  if (Number.isFinite(cfqScore) && cfqScore < 2)   flags.push('Low cash-flow quality — fundamental risk present');
  flags.push('Check earnings/dividend dates before entering any options position');
  flags.push('Verify IV percentile — avoid buying options when IV is historically elevated');
  return flags;
}

function buildFidelityChecklist(tier1) {
  const base = [
    { item: 'Bid/ask spread acceptable (< 5% of mid)?',    checked: false },
    { item: 'Open interest > 500 contracts?',               checked: false },
    { item: 'Daily volume > 100 contracts?',                checked: false },
    { item: 'Strike near logical auction level (POC/VAH/VAL)?', checked: false },
    { item: 'Expiration matches thesis timeframe?',          checked: false },
    { item: 'Max loss acceptable within portfolio rules?',   checked: false },
    { item: 'Earnings/dividend dates checked?',              checked: false },
    { item: 'IV not historically extreme?',                  checked: false },
  ];

  if (tier1.name === 'covered_call') {
    base.push({ item: 'Strike above current resistance / VAH?', checked: false });
    base.push({ item: 'Willing to have shares called away at that price?', checked: false });
  }

  if (tier1.name === 'csp_or_shares' || tier1.name === 'csp_near_val') {
    base.push({ item: 'Strike at or below VAL / meaningful support?', checked: false });
    base.push({ item: 'Cash available to cover full assignment?',      checked: false });
    base.push({ item: 'Willing to own shares at strike price?',        checked: false });
  }

  if (tier1.name === 'long_put_or_wait') {
    base.push({ item: 'Defined max loss = premium paid only?',         checked: false });
    base.push({ item: 'Breakeven price realistic within thesis window?', checked: false });
  }

  return base;
}

function buildRationale(tier1, auctionState, stratFamily) {
  return [
    `Strategy: ${tier1.label}.`,
    `Reason: ${tier1.reason}`,
    `Auction context: ${auctionState}.`,
    `Strategy family: ${stratFamily}.`,
    'All options expressions require manual Fidelity review before any order is placed.',
  ].join(' ');
}
