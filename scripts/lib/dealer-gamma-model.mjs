import { CONFIDENCE, withProvenance } from './positioning-provenance.mjs';

const CONTRACT_MULTIPLIER = 100;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function blackScholesGamma({
  spot,
  strike,
  timeToExpiryYears,
  volatility,
  riskFreeRate = 0,
}) {
  const s = Number(spot);
  const k = Number(strike);
  const t = Number(timeToExpiryYears);
  const v = Number(volatility);
  const r = Number(riskFreeRate);

  if (!(s > 0) || !(k > 0) || !(t > 0) || !(v > 0)) return 0;

  const d1 = (Math.log(s / k) + (r + 0.5 * v * v) * t) / (v * Math.sqrt(t));
  return normalPdf(d1) / (s * v * Math.sqrt(t));
}

export function estimateDealerGamma({
  symbol,
  spot,
  contracts = [],
  asOfDate = isoToday(),
  riskFreeRate = 0.05,
}) {
  const normalized = contracts
    .map(contract => normalizeContract(contract, spot, asOfDate, riskFreeRate))
    .filter(contract => contract.openInterest > 0 && contract.gamma > 0);

  const byStrike = aggregate(normalized, contract => String(contract.strike), 'strike')
    .map(row => ({ ...row, strike: Number(row.strike) }))
    .sort((a, b) => a.strike - b.strike);

  const byExpiry = aggregate(normalized, contract => contract.expiration || 'unknown', 'expiration')
    .sort((a, b) => String(a.expiration).localeCompare(String(b.expiration)));

  const callWall = maxBy(
    normalized.filter(contract => contract.type === 'call'),
    contract => contract.openInterest,
  );
  const putWall = maxBy(
    normalized.filter(contract => contract.type === 'put'),
    contract => contract.openInterest,
  );

  const totalGammaExposure = normalized.reduce((sum, contract) => sum + contract.gammaExposure, 0);
  const callGamma = normalized.filter(contract => contract.type === 'call').reduce((sum, contract) => sum + Math.abs(contract.gammaExposure), 0);
  const totalAbsGamma = normalized.reduce((sum, contract) => sum + Math.abs(contract.gammaExposure), 0);

  return withProvenance({
    symbol: String(symbol || '').toUpperCase(),
    spot: Number(spot) || null,
    as_of_date: asOfDate,
    totalGammaExposure,
    gammaFlip: findGammaFlip(byStrike),
    callWall: callWall ? pickWall(callWall) : { strike: null, openInterest: 0 },
    putWall: putWall ? pickWall(putWall) : { strike: null, openInterest: 0 },
    callGammaConcentration: totalAbsGamma > 0 ? callGamma / totalAbsGamma : 0,
    byStrike,
    byExpiry,
    contractCount: normalized.length,
  }, {
    sourceName: 'Options open interest model',
    asOfDate,
    signalConfidence: CONFIDENCE.low,
    knownLimitations: [
      'Dealer gamma is modeled from open interest and assumes dealers are short customer calls and long customer puts.',
      'Open interest is usually prior-day data and does not identify customer/dealer sign.',
    ],
  });
}

export function findGammaFlip(byStrike = []) {
  const rows = [...byStrike]
    .map(row => ({ strike: Number(row.strike), gammaExposure: Number(row.gammaExposure) || 0 }))
    .filter(row => Number.isFinite(row.strike))
    .sort((a, b) => a.strike - b.strike);

  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const next = rows[i];
    if (prev.gammaExposure === 0) return prev.strike;
    if (Math.sign(prev.gammaExposure) !== Math.sign(next.gammaExposure)) {
      const span = next.strike - prev.strike;
      const gammaSpan = next.gammaExposure - prev.gammaExposure;
      if (gammaSpan === 0) return prev.strike;
      return prev.strike - (prev.gammaExposure * span / gammaSpan);
    }
  }
  return null;
}

function normalizeContract(contract, spot, asOfDate, riskFreeRate) {
  const type = String(contract.type || contract.optionType || contract.putCall || '').toLowerCase().includes('put') ? 'put' : 'call';
  const strike = Number(contract.strike);
  const openInterest = Number(contract.openInterest ?? contract.open_interest ?? contract.oi) || 0;
  const expiration = contract.expiration || contract.expirationDate || contract.expiry || '';
  const ivRaw = Number(contract.impliedVolatility ?? contract.iv ?? contract.implied_volatility);
  const impliedVolatility = ivRaw > 3 ? ivRaw / 100 : ivRaw;
  const timeToExpiryYears = contract.timeToExpiryYears != null
    ? Number(contract.timeToExpiryYears)
    : yearsToExpiry(asOfDate, expiration);
  const gamma = contract.gamma != null && Number(contract.gamma) > 0
    ? Number(contract.gamma)
    : blackScholesGamma({ spot, strike, timeToExpiryYears, volatility: impliedVolatility || 0.25, riskFreeRate });

  const sign = type === 'put' ? 1 : -1;
  const gammaExposure = sign * gamma * openInterest * CONTRACT_MULTIPLIER * Number(spot || 0);

  return {
    type,
    strike,
    expiration,
    openInterest,
    impliedVolatility,
    timeToExpiryYears,
    gamma,
    gammaExposure,
  };
}

function aggregate(rows, keyFn, keyName) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const current = grouped.get(key) ?? {
      [keyName]: key,
      gammaExposure: 0,
      absGammaExposure: 0,
      openInterest: 0,
      contractCount: 0,
    };
    current.gammaExposure += row.gammaExposure;
    current.absGammaExposure += Math.abs(row.gammaExposure);
    current.openInterest += row.openInterest;
    current.contractCount += 1;
    grouped.set(key, current);
  }
  return [...grouped.values()];
}

function pickWall(contract) {
  return {
    strike: contract.strike,
    expiration: contract.expiration,
    openInterest: contract.openInterest,
  };
}

function yearsToExpiry(asOfDate, expiration) {
  const start = new Date(`${asOfDate}T00:00:00Z`);
  const end = new Date(`${expiration}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, (end - start) / MS_PER_DAY / 365);
}

function maxBy(rows, fn) {
  let best = null;
  let bestValue = -Infinity;
  for (const row of rows) {
    const value = fn(row);
    if (value > bestValue) {
      best = row;
      bestValue = value;
    }
  }
  return best;
}

function normalPdf(value) {
  return Math.exp(-0.5 * value * value) / Math.sqrt(2 * Math.PI);
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}
