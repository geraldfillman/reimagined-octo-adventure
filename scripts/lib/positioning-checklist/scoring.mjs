const SCORE_MIN = -1;
const SCORE_MAX = 1;

export const WORKBOOK_MODULE_WEIGHTS = Object.freeze({
  'CFTC / positioning': 0.2,
  'Market regime': 0.15,
  'Catalyst timing': 0.15,
  'ETF / vehicle quality': 0.15,
  'Options / volatility quality': 0.15,
  'Breadth / cross-market confirmation': 0.1,
  'Risk-reward / execution': 0.1,
});

export function scoreSourceCoverage(items = []) {
  return items.map(item => {
    const status = coverageStatus(item);
    return {
      id: item.id ?? '',
      label: item.label ?? item.id ?? '',
      source: item.source ?? '',
      status,
      value: item.value ?? null,
      notes: item.notes ?? '',
      scoreContribution: status === 'observed' || status === 'derived' ? 1 : 0,
    };
  });
}

export function scoreOptionsGate({
  bidAskSpreadPct = null,
  strikeOpenInterest = null,
  ivPercentile = null,
  daysToExpiration = null,
  expectedMovePct = null,
  thesisRequiredMovePct = null,
  hasDirection = false,
  hasCatalyst = false,
} = {}) {
  const hardStops = [];
  const evidence = [];
  const gates = [];
  const hasOptionMetrics = [
    bidAskSpreadPct,
    strikeOpenInterest,
    ivPercentile,
    daysToExpiration,
    expectedMovePct,
    thesisRequiredMovePct,
  ].some(isFiniteNumber);

  if (!hasOptionMetrics && !hasDirection && !hasCatalyst) {
    return {
      module: 'Options / volatility quality',
      status: 'unavailable',
      score: 0,
      read: 'Options data unavailable - source refresh/manual check required',
      gatesPassed: 0,
      gates: [],
      hardStops,
      evidence,
    };
  }

  if (isFiniteNumber(bidAskSpreadPct)) {
    evidence.push(`spread ${formatPct(bidAskSpreadPct)}`);
  }
  if (isFiniteNumber(strikeOpenInterest)) {
    evidence.push(`target strike OI ${Number(strikeOpenInterest).toFixed(0)}`);
  }
  if (isFiniteNumber(ivPercentile)) {
    evidence.push(`IV percentile ${Number(ivPercentile).toFixed(0)}`);
  }
  if (isFiniteNumber(daysToExpiration)) {
    evidence.push(`${Number(daysToExpiration).toFixed(0)} DTE`);
  }

  gates.push({ id: 'direction', passed: Boolean(hasDirection) });
  gates.push({ id: 'timing', passed: Boolean(hasCatalyst) });

  const magnitudeOk = !isFiniteNumber(expectedMovePct) || !isFiniteNumber(thesisRequiredMovePct)
    ? false
    : Number(thesisRequiredMovePct) <= Number(expectedMovePct);
  gates.push({ id: 'magnitude', passed: magnitudeOk });

  const liquid = isFiniteNumber(bidAskSpreadPct) && isFiniteNumber(strikeOpenInterest)
    ? Number(bidAskSpreadPct) <= 0.1 && Number(strikeOpenInterest) >= 500
    : false;
  gates.push({ id: 'liquidity', passed: liquid });
  if (!liquid && (isFiniteNumber(bidAskSpreadPct) || isFiniteNumber(strikeOpenInterest))) {
    hardStops.push({
      id: 'options-chain-illiquid',
      label: 'Options chain is illiquid / spread too wide',
    });
  }

  const ivOk = isFiniteNumber(ivPercentile) ? Number(ivPercentile) <= 70 : false;
  gates.push({ id: 'iv', passed: ivOk });
  if (isFiniteNumber(ivPercentile) && Number(ivPercentile) > 70) {
    hardStops.push({
      id: 'iv-rich-naked-premium',
      label: 'IV extremely elevated and naked premium is unattractive',
    });
  }

  const expiryOk = isFiniteNumber(daysToExpiration) ? Number(daysToExpiration) >= 14 : false;
  gates.push({ id: 'expiration', passed: expiryOk });
  if (isFiniteNumber(daysToExpiration) && Number(daysToExpiration) < 14) {
    hardStops.push({
      id: 'expiration-too-short',
      label: 'Expiration does not fit the catalyst window',
    });
  }

  const passed = gates.filter(gate => gate.passed).length;
  const score = hardStops.length ? -1 : passed >= 5 ? 1 : passed >= 3 ? 0 : -1;
  const read = passed === 6 && !hardStops.length
    ? 'Options OK - defined-risk structure that fits IV'
    : passed >= 4 && hardStops.length <= 1
      ? 'Lean shares/ETF; options only as a spread'
      : 'No options - use shares/ETF or wait';

  return {
    module: 'Options / volatility quality',
    status: 'observed',
    score,
    read,
    gatesPassed: passed,
    gates,
    hardStops,
    evidence,
  };
}

export function scoreShortInterestRow({
  symbol = '',
  shortPercentFloat = null,
  daysToCover = null,
  borrowFeePct = null,
  reportDate = '',
  asOfDate = todayIso(),
  priceConfirming = false,
} = {}) {
  const shortPct = Number(shortPercentFloat);
  const coverDays = Number(daysToCover);
  const ageDays = daysBetween(reportDate, asOfDate);
  const highFuel = shortPct >= 0.2 && coverDays >= 5;
  const elevated = shortPct >= 0.1;
  const score = priceConfirming && (highFuel || elevated) ? 1 : elevated ? 0 : 0;
  const read = highFuel && priceConfirming
    ? 'High squeeze fuel - price confirming'
    : elevated && priceConfirming
      ? 'Elevated short fuel - price confirming'
      : elevated
        ? 'Crowded short, no price confirm - wait'
        : 'Low short interest';

  return {
    symbol,
    status: isFiniteNumber(shortPercentFloat) ? 'observed' : 'unavailable',
    score,
    read,
    ageDays,
    evidence: [
      isFiniteNumber(shortPercentFloat) ? `short float ${formatPct(shortPct)}` : '',
      isFiniteNumber(daysToCover) ? `days to cover ${coverDays.toFixed(1)}` : '',
      isFiniteNumber(borrowFeePct) ? `borrow fee ${formatPct(borrowFeePct)}` : '',
      reportDate ? `reported ${reportDate}` : '',
    ].filter(Boolean),
  };
}

export function calculateMasterScore(modules = [], hardStops = []) {
  const normalized = modules.map(module => ({
    ...module,
    score: clamp(module.score, SCORE_MIN, SCORE_MAX),
    weight: Number(module.weight ?? WORKBOOK_MODULE_WEIGHTS[module.module] ?? 0),
  }));
  const weightCheck = round(normalized.reduce((sum, module) => sum + module.weight, 0), 4);
  const rawWeightedRead = round(normalized.reduce((sum, module) => sum + module.score * module.weight, 0), 4);
  const conviction = Math.round(((rawWeightedRead + 1) / 2) * 100);
  const directionalBias = classifyDirectionalBias(rawWeightedRead);
  const finalVerdict = hardStops.length >= 2
    ? 'No-trade / research only'
    : hardStops.length === 1
      ? 'Lean shares/ETF or wait'
      : verdictFromBias(rawWeightedRead);

  return {
    weightCheck,
    rawWeightedRead,
    conviction,
    directionalBias,
    hardStopCount: hardStops.length,
    finalVerdict,
  };
}

export function classifyDirectionalBias(score) {
  if (score >= 0.55) return 'Strong long / confirmation bias';
  if (score >= 0.25) return 'Conditional long / watch';
  if (score > -0.25) return 'Neutral / wait for trigger';
  if (score > -0.55) return 'Conditional short / avoid long';
  return 'Strong bear / liquidation risk';
}

function coverageStatus(item = {}) {
  if (item.manualRequired) return 'manual_required';
  if (item.derived) return 'derived';
  if (item.value !== null && item.value !== undefined && item.value !== '') return 'observed';
  return 'unavailable';
}

function verdictFromBias(score) {
  if (score >= 0.55) return 'Watchlist candidate - require trigger/invalidation';
  if (score >= 0.25) return 'Conditional watch - require confirmation';
  if (score > -0.25) return 'Wait for trigger';
  return 'Avoid or hedge until evidence improves';
}

function formatPct(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function isFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return false;
  return Number.isFinite(Number(value));
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(min, Math.min(max, number));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function daysBetween(start, end) {
  if (!start || !end) return null;
  const startDate = new Date(`${String(start).slice(0, 10)}T00:00:00Z`);
  const endDate = new Date(`${String(end).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  return Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
