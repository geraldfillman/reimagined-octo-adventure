/**
 * dilution-rules.mjs — pure rule engine for dilution risk scoring.
 *
 * NO I/O, NO fetch, NO filesystem. All functions are pure → input metrics
 * in, signals/classes out. This keeps the math unit-testable and lets
 * callers (pullers, DD report, screener) share the same logic.
 *
 * Thresholds are exported as frozen constants so they can be referenced
 * from dashboards, docs, and tests without magic numbers drifting.
 */

// ─── Threshold constants ─────────────────────────────────────────────────────

/** Months of cash runway below which the company is in distress. */
export const RUNWAY_THRESHOLDS = Object.freeze({
  critical: 3,   // < 3mo → imminent raise or insolvency
  high:     6,   // < 6mo → raise probable within two quarters
  medium:  12,   // < 12mo → manageable but watchable
});

/** ATM capacity as fraction of float; > alert ⇒ significant overhang. */
export const ATM_FLOAT_THRESHOLDS = Object.freeze({
  alert:  0.5,   // > 50% of float can be sold at-the-market
  watch:  0.2,
});

const ORDER = Object.freeze({ low: 0, medium: 1, high: 2, critical: 3 });

// ─── Metric computations ─────────────────────────────────────────────────────

/**
 * Compute months of runway from operating cash flow.
 * Returns `Infinity` if the company generates cash, `null` if inputs are
 * insufficient, otherwise a positive number of months.
 *
 * @param {object} p
 * @param {number} p.cash
 * @param {number|null} [p.shortTermInvestments]
 * @param {number[]} p.quarterlyOperatingCashFlow — most recent first or any order; we avg absolute burn.
 * @returns {number|null}
 */
export function computeCashRunway({ cash, shortTermInvestments, quarterlyOperatingCashFlow }) {
  if (!Array.isArray(quarterlyOperatingCashFlow) || quarterlyOperatingCashFlow.length === 0) {
    return null;
  }
  const liquid = Number(cash || 0) + Number(shortTermInvestments || 0);
  const avgQuarterly = quarterlyOperatingCashFlow.reduce((a, b) => a + b, 0) / quarterlyOperatingCashFlow.length;
  if (avgQuarterly >= 0) return Infinity; // net-positive cash flow
  const monthlyBurn = Math.abs(avgQuarterly) / 3;
  if (monthlyBurn === 0) return Infinity;
  return liquid / monthlyBurn;
}

/**
 * Shelf capacity = registered max − sum of takedowns in the last 24 months.
 * Clamped at zero (a fully-used shelf doesn't go negative).
 *
 * @param {object} p
 * @param {number} p.shelfMaxUsd
 * @param {Array<{proceedsUsd:number, date:string}>} [p.takedowns]
 * @param {string} [p.today] — 'YYYY-MM-DD' override; defaults to new Date().
 */
export function computeShelfCapacity({ shelfMaxUsd, takedowns = [], today }) {
  const nowMs = today ? new Date(today).getTime() : Date.now();
  const cutoffMs = nowMs - 24 * 30 * 24 * 60 * 60 * 1000; // ≈24 months
  const used = takedowns
    .filter(t => new Date(t.date).getTime() >= cutoffMs)
    .reduce((sum, t) => sum + Number(t.proceedsUsd || 0), 0);
  return Math.max(0, Number(shelfMaxUsd || 0) - used);
}

/**
 * ATM capacity as a fraction of float market value.
 * Returns null when float data is missing — tests reject a zero default
 * because "no data" is semantically different from "no overhang".
 */
export function computeAtmToFloat({ atmCapacityUsd, floatShares, price }) {
  if (!floatShares || !price) return null;
  const floatValue = Number(floatShares) * Number(price);
  if (floatValue <= 0) return null;
  return Number(atmCapacityUsd || 0) / floatValue;
}

// ─── Classification + signal emission ────────────────────────────────────────

/**
 * Collapse the metric bundle into one of low/medium/high/critical.
 * Rule priority: critical > high > medium > low. Any single critical input
 * pins the overall class to critical.
 */
export function classifyOverallRisk(metrics) {
  const {
    cashRunwayMonths,
    atmToFloat,
    nasdaqCompliant = true,
  } = metrics;

  const runwayMonths = cashRunwayMonths == null ? Infinity : cashRunwayMonths;

  if (runwayMonths < RUNWAY_THRESHOLDS.critical) return 'critical';
  if (runwayMonths < RUNWAY_THRESHOLDS.high)     return 'high';
  if ((atmToFloat ?? 0) >= ATM_FLOAT_THRESHOLDS.alert) return 'high';
  if (!nasdaqCompliant) return 'high';
  if (runwayMonths < RUNWAY_THRESHOLDS.medium)   return 'medium';
  if ((atmToFloat ?? 0) >= ATM_FLOAT_THRESHOLDS.watch) return 'medium';
  return 'low';
}

/**
 * Emit structured signals consumable by lib/signals.mjs formatter.
 * Shape: { code, severity, message, details? }
 *   severity ∈ 'watch' | 'alert' | 'critical'
 *
 * Only emits signals that cross a threshold — a healthy ticker returns [].
 */
export function evaluateDilutionSignals(metrics) {
  const {
    cashRunwayMonths,
    atmToFloat,
    shelfHeadroomUsd,
    newShelfEffective,
    nasdaqCompliant = true,
    unregisteredSaleInLast30d = false,
  } = metrics;

  const signals = [];

  if (cashRunwayMonths != null && cashRunwayMonths !== Infinity) {
    if (cashRunwayMonths < RUNWAY_THRESHOLDS.critical) {
      signals.push(Object.freeze({
        code: 'cash_runway',
        severity: 'critical',
        message: `Cash runway ${cashRunwayMonths.toFixed(1)} months (<${RUNWAY_THRESHOLDS.critical}mo threshold)`,
      }));
    } else if (cashRunwayMonths < RUNWAY_THRESHOLDS.high) {
      signals.push(Object.freeze({
        code: 'cash_runway',
        severity: 'alert',
        message: `Cash runway ${cashRunwayMonths.toFixed(1)} months (<${RUNWAY_THRESHOLDS.high}mo threshold)`,
      }));
    }
  }

  if (newShelfEffective) {
    signals.push(Object.freeze({
      code: 'shelf_new',
      severity: 'alert',
      message: `New S-3 shelf went effective (capacity ${fmtUsd(shelfHeadroomUsd)})`,
    }));
  }

  if (atmToFloat != null && atmToFloat >= ATM_FLOAT_THRESHOLDS.alert) {
    signals.push(Object.freeze({
      code: 'atm_capacity',
      severity: 'alert',
      message: `ATM capacity is ${(atmToFloat * 100).toFixed(0)}% of float market value (>${ATM_FLOAT_THRESHOLDS.alert * 100}%)`,
    }));
  }

  if (!nasdaqCompliant) {
    signals.push(Object.freeze({
      code: 'nasdaq_compliance',
      severity: 'alert',
      message: 'Nasdaq bid-price or equity non-compliance notice on file',
    }));
  }

  if (unregisteredSaleInLast30d) {
    signals.push(Object.freeze({
      code: 'unregistered_sale',
      severity: 'watch',
      message: '8-K Item 3.02 (unregistered sale) filed within last 30 days',
    }));
  }

  return signals;
}

/**
 * Detect worsening in overall risk class between runs.
 * Returns null for no-change or improvement (improvement is informational,
 * not a trigger).
 */
export function detectStateTransitions({ prior, current }) {
  if (!prior || !current || prior === current) return null;
  const prev = ORDER[prior];
  const next = ORDER[current];
  if (prev == null || next == null) return null;
  if (next <= prev) return null; // downgrade / sideways
  if (current === 'critical') {
    return Object.freeze({
      code: 'risk_upgrade',
      severity: 'critical',
      message: `Overall risk escalated ${prior} → ${current}`,
    });
  }
  if (current === 'high') {
    return Object.freeze({
      code: 'risk_upgrade',
      severity: 'alert',
      message: `Overall risk escalated ${prior} → ${current}`,
    });
  }
  return Object.freeze({
    code: 'risk_upgrade',
    severity: 'watch',
    message: `Overall risk escalated ${prior} → ${current}`,
  });
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function fmtUsd(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
