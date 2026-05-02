/**
 * bsm.mjs — Black-Scholes-Merton option pricing.
 * Used by signal-tracker to reprice options positions at reconcile time.
 */

function normCDF(x) {
  const a  = 0.2316419;
  const b  = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429];
  const t  = 1 / (1 + a * Math.abs(x));
  const poly = t * (b[0] + t * (b[1] + t * (b[2] + t * (b[3] + t * b[4]))));
  const n  = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x) * poly;
  return x >= 0 ? n : 1 - n;
}

/**
 * Price a European call or put using BSM.
 * @param {{ S: number, K: number, T: number, sigma: number, r?: number, type?: 'call'|'put' }} params
 *   S     — current stock price
 *   K     — strike price
 *   T     — time to expiry in years (e.g. 7/365)
 *   sigma — annualised implied volatility (e.g. 0.37 for 37%)
 *   r     — risk-free rate (default 0.05)
 *   type  — 'call' (default) or 'put'
 * @returns {number} theoretical option price
 */
export function bsmPrice({ S, K, T, sigma, r = 0.05, type = 'call' }) {
  if (T <= 0 || sigma <= 0 || S <= 0 || K <= 0) return 0;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  if (type === 'call') return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
  return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
}

/** Days between two YYYY-MM-DD date strings (toDate − fromDate). */
export function daysBetween(fromDate, toDate) {
  return Math.round((new Date(toDate) - new Date(fromDate)) / 86_400_000);
}
