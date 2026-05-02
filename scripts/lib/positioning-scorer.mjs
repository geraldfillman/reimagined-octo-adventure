const FIRM_MARKERS = Object.freeze({
  'jane street': {
    firm: 'Jane Street',
    markers: ['MARKET_MAKER_PROP'],
    role: 'Liquidity provider and ETF arbitrageur',
    footprint: 'ETF flow, creation/redemption, options volume, market structure data',
    signal_strength: 'Medium for liquidity conditions; low for long-term direction',
    confidence_adjustment: -2,
    do_not_overread: 'Do not treat market-making or arbitrage activity as directional conviction.',
  },
  'blackrock': {
    firm: 'BlackRock / iShares',
    markers: ['PASSIVE_INDEX_GIANT'],
    role: 'ETF sponsor, index allocator, institutional asset manager',
    footprint: 'ETF flows, fund holdings, creations/redemptions, sector ETF flows',
    signal_strength: 'High for flow gravity; low for stock-picking intent',
    confidence_adjustment: 0,
    do_not_overread: 'ETF flows do not prove discretionary conviction on every underlying holding.',
  },
  'ishares': {
    firm: 'BlackRock / iShares',
    markers: ['PASSIVE_INDEX_GIANT'],
    role: 'ETF sponsor, index allocator, institutional asset manager',
    footprint: 'ETF flows, fund holdings, creations/redemptions, sector ETF flows',
    signal_strength: 'High for flow gravity; low for stock-picking intent',
    confidence_adjustment: 0,
    do_not_overread: 'ETF flows do not prove discretionary conviction on every underlying holding.',
  },
  'elliott management': {
    firm: 'Elliott Management',
    markers: ['ACTIVIST_EVENT_DRIVEN', 'DEEP_VALUE_DISTRESSED'],
    role: 'Activist investor and event-driven catalyst seeker',
    footprint: '13D filings, 13G filings, public letters, proxy campaigns, restructuring news',
    signal_strength: 'High when confirmed by 13D or public campaign',
    confidence_adjustment: 2,
    do_not_overread: 'Activist involvement does not guarantee success, timing, or positive returns.',
  },
  'citadel': {
    firm: 'Citadel',
    markers: ['MULTI_STRATEGY_PLATFORM'],
    role: 'Multi-strategy platform with pod-level books',
    footprint: '13F, sector exposure, fund commentary, hiring, crowded trade reports',
    signal_strength: 'Medium when repeated across sources',
    confidence_adjustment: 0,
    do_not_overread: 'Treat as multi-engine capital allocation, not one simple house view.',
  },
});

const STRATEGY_ROLE_BY_SCORE = Object.freeze({
  positive: 'Accumulation Setup',
  negative: 'Distribution Warning',
  neutral: 'Watchlist Only',
});

export function firmMarkerFor(name) {
  const key = String(name || '').trim().toLowerCase();
  const marker = FIRM_MARKERS[key] ?? {
    firm: String(name || 'Unknown firm'),
    markers: ['UNKNOWN_INSTITUTION'],
    role: 'Unknown or unclassified market participant',
    footprint: 'Unclassified source footprint',
    signal_strength: 'Low until source role is verified',
    confidence_adjustment: -1,
    do_not_overread: 'Do not infer intent until the firm archetype and source footprint are verified.',
  };

  return {
    ...marker,
    primary_marker: marker.markers[0],
    archetype_marker: marker.markers.join(' / '),
    likely_market_role: marker.role,
    primary_footprint: marker.footprint,
  };
}

export function scorePositioningSignal(input = {}) {
  const firmMarkers = (input.institutional?.firms ?? []).map(firmMarkerFor);
  const components = {
    institutional: normalizeComponent(input.institutional, 2),
    retail: normalizeRetailComponent(input.retail),
    macro: normalizeComponent(input.macro, 2),
    options: normalizeComponent(input.options, 1),
    price: normalizeComponent(input.price, 1),
    strategy: normalizeStrategyComponent(input.strategy),
  };

  const score = clamp(
    components.institutional.score +
    components.retail.score +
    components.macro.score +
    components.options.score +
    components.price.score +
    components.strategy.score,
    -10,
    10
  );

  const confirmationCount = Object.values(components).filter(component => component.confirms).length;
  const sourceCount = Object.values(components).reduce((sum, component) => sum + component.sources.length, 0);
  const markerPenalty = firmMarkers.reduce((sum, marker) => sum + Math.min(0, marker.confidence_adjustment ?? 0), 0);
  const confidenceScore = sourceCount + confirmationCount + markerPenalty;
  const confidence = confidenceScore >= 9 ? 'High' : confidenceScore >= 5 ? 'Medium' : 'Low';
  const risks = buildRisks(input, confirmationCount, firmMarkers);
  const actionClassification = classifyAction({ score, confidence, confirmationCount });

  return {
    asset: input.asset ?? input.theme ?? 'Unknown',
    theme: input.theme ?? input.asset ?? 'Unknown',
    relationship: classifyRelationship(input.institutional?.direction, input.retail?.direction),
    institutional_bias: input.institutional?.direction ?? 'unknown',
    retail_bias: input.retail?.direction ?? 'unknown',
    macro_bias: input.macro?.direction ?? 'unknown',
    options_bias: input.options?.direction ?? 'unknown',
    score,
    confidence,
    confirmation_count: confirmationCount,
    action_classification: actionClassification,
    strategy_role: strategyRole(score, input),
    matched_strategy: input.strategy?.name ?? (input.strategy?.matched ? 'Matched strategy' : 'None found'),
    vault_update_needed: input.strategy?.matched ? 'No' : 'Yes',
    evidence: collectEvidence(components),
    monitoring_triggers: buildMonitoringTriggers(input, score),
    risks,
    firm_markers: firmMarkers,
    components,
  };
}

function normalizeComponent(component = {}, maxAbs = 2) {
  const direction = String(component.direction ?? 'unknown').toLowerCase();
  const magnitude = clamp(Math.abs(Number(component.strength ?? 0)), 0, maxAbs);
  const sign = ['accumulating', 'supportive', 'buying', 'improving', 'bullish'].includes(direction)
    ? 1
    : ['selling', 'distribution', 'euphoric', 'weakening', 'bearish', 'crowded'].includes(direction)
      ? -1
      : 0;
  return {
    score: sign * magnitude,
    confirms: sign !== 0 && magnitude > 0,
    sources: Array.isArray(component.sources) ? component.sources.filter(Boolean).map(String) : [],
  };
}

function normalizeRetailComponent(component = {}) {
  const direction = String(component.direction ?? 'unknown').toLowerCase();
  if (['neglect', 'panic', 'abandonment', 'selling'].includes(direction)) {
    return {
      score: clamp(Number(component.strength ?? 0), 0, 2),
      confirms: Number(component.strength ?? 0) > 0,
      sources: Array.isArray(component.sources) ? component.sources.filter(Boolean).map(String) : [],
    };
  }
  if (['euphoria', 'buying', 'call-frenzy', 'mania'].includes(direction)) {
    return {
      score: -clamp(Number(component.strength ?? 0), 0, 2),
      confirms: Number(component.strength ?? 0) > 0,
      sources: Array.isArray(component.sources) ? component.sources.filter(Boolean).map(String) : [],
    };
  }
  return normalizeComponent(component, 2);
}

function normalizeStrategyComponent(component = {}) {
  const strength = clamp(Number(component.strength ?? 0), 0, 2);
  return {
    score: component.matched ? strength : 0,
    confirms: Boolean(component.matched && strength > 0),
    sources: component.matched ? [component.name ?? 'Vault strategy match'] : [],
  };
}

function classifyRelationship(institutional, retail) {
  const inst = String(institutional ?? 'unknown').toLowerCase();
  const ret = String(retail ?? 'unknown').toLowerCase();
  if (['accumulating', 'buying', 'supportive'].includes(inst) && ['neglect', 'abandonment'].includes(ret)) {
    return 'Institutions buying / retail ignoring';
  }
  if (['selling', 'distribution'].includes(inst) && ['buying', 'euphoria', 'mania'].includes(ret)) {
    return 'Institutions selling / retail buying';
  }
  if (['accumulating', 'buying', 'supportive'].includes(inst) && ['panic', 'selling'].includes(ret)) {
    return 'Institutions buying / retail selling';
  }
  if (['accumulating', 'buying', 'supportive'].includes(inst) && ['buying', 'euphoria'].includes(ret)) {
    return 'Institutions buying / retail buying';
  }
  if (inst === 'unknown' && ['euphoria', 'panic'].includes(ret)) {
    return `Institutions neutral / retail ${ret}`;
  }
  return 'No clear signal';
}

function classifyAction({ score, confidence, confirmationCount }) {
  if (confirmationCount < 3) return 'Watchlist only';
  if (score <= -5) return 'Avoid / crowded';
  if (score >= 8 && confidence === 'High') return 'Needs confirmation';
  if (score >= 5) return 'Needs confirmation';
  if (score <= -2) return 'Exit-risk warning';
  return 'Watchlist only';
}

function strategyRole(score, input) {
  if (input.strategy_role) return input.strategy_role;
  if (score >= 5) return STRATEGY_ROLE_BY_SCORE.positive;
  if (score <= -5) return STRATEGY_ROLE_BY_SCORE.negative;
  if (String(input.retail?.direction ?? '').toLowerCase().includes('euphoria')) return 'Retail Mania Signal';
  return STRATEGY_ROLE_BY_SCORE.neutral;
}

function collectEvidence(components) {
  return [...new Set(Object.values(components).flatMap(component => component.sources))];
}

function buildRisks(input, confirmationCount, firmMarkers) {
  const risks = [
    '13F data is delayed and incomplete.',
    'Fund holdings do not reveal full hedging.',
    'Retail flow data is often estimated.',
    'Options flow does not always reveal buyer intent.',
    'Positioning is not the same thing as valuation.',
  ];
  if (confirmationCount < 3) risks.unshift('Fewer than three confirming components are present; positioning is watchlist-only.');
  if (!input.strategy?.matched) risks.push('No clear vault strategy fit was found.');
  for (const marker of firmMarkers) risks.push(marker.do_not_overread);
  return [...new Set(risks)];
}

function buildMonitoringTriggers(input, score) {
  const asset = input.asset ?? input.theme ?? 'asset';
  const triggers = [
    `${asset} price/volume confirms the positioning read`,
    'Retail sentiment changes from the current extreme',
    'Macro and options layers confirm rather than contradict',
  ];
  if (score <= -5) triggers.unshift('Distribution or crowding risk clears before new exposure');
  return triggers;
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(min, Math.min(max, number));
}
