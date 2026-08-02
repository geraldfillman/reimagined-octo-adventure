/**
 * health-markers.mjs — Corporate Health, Integrity & Market-Behavior Framework.
 *
 * Pure computation layer for `edgar health` (scripts/pullers/edgar-health.mjs).
 * Classifies the framework's §5 quantitative screening markers and the §9.2
 * relative-performance prompt into investigation bands:
 *
 *   constructive | investigate | concern | n/a
 *
 * Bands are prompts, not verdicts — every non-constructive marker routes the
 * researcher to a filing (§15), never to an automatic conclusion. When the
 * XBRL data cannot support a ratio the marker is `n/a` with an explicit
 * reason — gaps are surfaced, never estimated (vault data policy).
 *
 * Framework: 04_Reference/Corporate_Health_Integrity_Framework.md
 * No I/O in this module — series extraction and note writing live in the puller.
 */

export const BAND = Object.freeze({
  CONSTRUCTIVE: 'constructive',
  INVESTIGATE: 'investigate',
  CONCERN: 'concern',
  NA: 'n/a',
});

/** Profiles whose ordinary leverage bands are suppressed per §5.5 / §14. */
const LEVERAGE_EXEMPT_PROFILES = Object.freeze(new Set(['bank', 'reit']));

/**
 * XBRL concept preference lists per series, consumed by the puller via
 * `fiscalYearValues(facts, spec.concepts, { unit, kind, limit: 6 })`.
 * Order matters: first fresh concept wins (companies retire tags over time).
 */
export const HEALTH_SERIES_SPECS = Object.freeze({
  revenue: Object.freeze({ concepts: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet', 'SalesRevenueGoodsNet'], kind: 'flow' }),
  netIncome: Object.freeze({ concepts: ['NetIncomeLoss', 'ProfitLoss'], kind: 'flow' }),
  operatingCashFlow: Object.freeze({ concepts: ['NetCashProvidedByUsedInOperatingActivities', 'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'], kind: 'flow' }),
  capex: Object.freeze({ concepts: ['PaymentsToAcquirePropertyPlantAndEquipment', 'PaymentsToAcquireProductiveAssets'], kind: 'flow' }),
  receivables: Object.freeze({ concepts: ['AccountsReceivableNetCurrent', 'ReceivablesNetCurrent'], kind: 'balance' }),
  inventory: Object.freeze({ concepts: ['InventoryNet'], kind: 'balance' }),
  costOfRevenue: Object.freeze({ concepts: ['CostOfRevenue', 'CostOfGoodsAndServicesSold', 'CostOfGoodsSold'], kind: 'flow' }),
  operatingIncome: Object.freeze({ concepts: ['OperatingIncomeLoss'], kind: 'flow' }),
  depreciationAmortization: Object.freeze({ concepts: ['DepreciationDepletionAndAmortization', 'DepreciationAmortizationAndAccretionNet', 'DepreciationAndAmortization'], kind: 'flow' }),
  interestExpense: Object.freeze({ concepts: ['InterestExpense', 'InterestExpenseDebt'], kind: 'flow' }),
  cash: Object.freeze({ concepts: ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'], kind: 'balance' }),
  shortTermInvestments: Object.freeze({ concepts: ['ShortTermInvestments', 'MarketableSecuritiesCurrent'], kind: 'balance' }),
  debtLongTerm: Object.freeze({ concepts: ['LongTermDebtNoncurrent', 'LongTermDebt'], kind: 'balance' }),
  debtCurrent: Object.freeze({ concepts: ['LongTermDebtCurrent', 'DebtCurrent'], kind: 'balance' }),
  dilutedShares: Object.freeze({ concepts: ['WeightedAverageNumberOfDilutedSharesOutstanding', 'WeightedAverageNumberOfSharesOutstandingBasic'], kind: 'flow', unit: 'shares' }),
  sbc: Object.freeze({ concepts: ['ShareBasedCompensation'], kind: 'flow' }),
  dividendsPaid: Object.freeze({ concepts: ['PaymentsOfDividends', 'PaymentsOfDividendsCommonStock'], kind: 'flow' }),
  buybacks: Object.freeze({ concepts: ['PaymentsForRepurchaseOfCommonStock'], kind: 'flow' }),
});

// ─── Series accessors ────────────────────────────────────────────────────────
// A series object maps each HEALTH_SERIES_SPECS key to a newest-first array of
// { value, end, form } fiscal-year entries (possibly empty).

function val(series, key, i = 0) {
  const entry = series?.[key]?.[i];
  if (entry == null) return null;
  const n = Number(entry.value);
  return Number.isFinite(n) ? n : null;
}

function periodEnd(series, key, i = 0) {
  return series?.[key]?.[i]?.end ?? null;
}

/** True when two series report the same fiscal period at index i (exact end, or same end-year). */
function samePeriod(series, keyA, keyB, i = 0) {
  const a = periodEnd(series, keyA, i);
  const b = periodEnd(series, keyB, i);
  if (!a || !b) return false;
  return a === b || a.slice(0, 4) === b.slice(0, 4);
}

function latestEndYear(series, key) {
  const end = periodEnd(series, key, 0);
  return end ? Number(end.slice(0, 4)) : null;
}

/** Freshest annual period across the core flow series — the staleness reference. */
function referenceYear(series) {
  let best = null;
  for (const key of ['netIncome', 'revenue', 'operatingCashFlow', 'operatingIncome']) {
    const year = latestEndYear(series, key);
    if (year != null && (best == null || year > best)) best = year;
  }
  return best;
}

/**
 * True when a concept's latest annual value predates the company's freshest
 * fiscal year — companies retire XBRL tags (repaid debt, stopped dividends),
 * so a "latest" value can be years old. Mixing periods fabricates ratios.
 */
function isStale(series, key) {
  const ref = referenceYear(series);
  const year = latestEndYear(series, key);
  return ref != null && year != null && year < ref;
}

/**
 * Leading indices where every key has an entry and all end-years match.
 * Guards multi-series sums against tag retirements that shift one series
 * out of step with the others.
 */
function alignedYears(series, keys, max) {
  let aligned = 0;
  for (let i = 0; i < max; i++) {
    const years = keys.map(k => {
      const end = periodEnd(series, k, i);
      return end ? Number(end.slice(0, 4)) : null;
    });
    if (years.some(y => y == null) || new Set(years).size > 1) break;
    aligned++;
  }
  return aligned;
}

/**
 * Latest-vs-prior growth in percent, null when not computable.
 * Requires consecutive fiscal years — a filing gap would silently turn a
 * one-year growth rate into a multi-year one and inflate divergence bands.
 */
function growthPct(series, key) {
  const current = val(series, key, 0);
  const prior = val(series, key, 1);
  if (current == null || prior == null || prior === 0) return null;
  const currentEnd = periodEnd(series, key, 0);
  const priorEnd = periodEnd(series, key, 1);
  if (!currentEnd || !priorEnd) return null;
  if (Number(currentEnd.slice(0, 4)) - Number(priorEnd.slice(0, 4)) !== 1) return null;
  return ((current - prior) / Math.abs(prior)) * 100;
}

function sumRecent(series, key, count) {
  const entries = (series?.[key] ?? []).slice(0, count);
  if (entries.length === 0) return null;
  return entries.reduce((sum, e) => sum + Number(e.value), 0);
}

// ─── Formatting (kept local so the module stays dependency-free) ─────────────

function fmtPct(n, decimals = 1) {
  return n == null ? '—' : `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}

function fmtRatio(n, suffix = 'x') {
  return n == null ? '—' : `${n.toFixed(2)}${suffix}`;
}

function marker(key, section, label, value, display, band, detail) {
  return Object.freeze({ key, section, label, value, display, band, detail });
}

function gap(key, section, label, detail) {
  return marker(key, section, label, null, '—', BAND.NA, detail);
}

// ─── §5.3 Cash conversion and earnings quality ───────────────────────────────

function fcfConversionMarker(series) {
  const key = 'fcf_conversion';
  const label = 'FCF conversion (cumulative FCF / net income, ≤5 FY)';
  if ((series?.capex ?? []).length === 0) {
    return gap(key, '§5.3', label, 'Capex concept not tagged — cannot compute FCF; verify in the cash-flow statement.');
  }
  const years = alignedYears(series, ['netIncome', 'operatingCashFlow', 'capex'], 5);
  if (years < 2) {
    return gap(key, '§5.3', label, 'Fewer than 2 period-aligned fiscal years across NI/OCF/capex — one series is sparse or a tag was retired mid-window.');
  }
  const cumNi = sumRecent(series, 'netIncome', years);
  const cumFcf = sumRecent(series, 'operatingCashFlow', years) - sumRecent(series, 'capex', years);
  if (cumNi == null || cumNi <= 0) {
    return gap(key, '§5.3', label, `Cumulative net income ≤ 0 over ${years} FY — ratio not meaningful; judge cash burn against milestones instead.`);
  }
  const ratio = cumFcf / cumNi;
  const band = ratio > 0.8 ? BAND.CONSTRUCTIVE : ratio >= 0.5 ? BAND.INVESTIGATE : BAND.CONCERN;
  const detail = band === BAND.CONSTRUCTIVE
    ? `${years} FY window — earnings are converting to cash.`
    : band === BAND.INVESTIGATE
      ? `${years} FY window — check working capital and growth-capex explanation (10-K cash-flow statement).`
      : `${years} FY window — below 50% without explanation is an earnings-quality red flag (§5.3).`;
  return marker(key, '§5.3', label, ratio, fmtRatio(ratio, ''), band, detail);
}

function ocfTrendMarker(series) {
  const key = 'ocf_vs_earnings';
  const label = 'Operating cash flow vs earnings trend';
  const pairs = Math.min(
    (series?.netIncome ?? []).length,
    (series?.operatingCashFlow ?? []).length) - 1;
  if (pairs < 1) {
    return gap(key, '§5.3', label, 'Fewer than 2 fiscal years of NI/OCF available.');
  }
  let divergentYears = 0;
  for (let i = 0; i < Math.min(pairs, 2); i++) {
    const niUp = val(series, 'netIncome', i) > val(series, 'netIncome', i + 1);
    const ocfDown = val(series, 'operatingCashFlow', i) <= val(series, 'operatingCashFlow', i + 1);
    if (niUp && ocfDown) divergentYears++;
  }
  if (divergentYears >= 2) {
    return marker(key, '§5.3', label, divergentYears, `${divergentYears} yr divergent`, BAND.CONCERN,
      'Earnings rose while operating cash fell in consecutive years — route to receivable note and allowance roll-forward (§8).');
  }
  if (divergentYears === 1) {
    return marker(key, '§5.3', label, divergentYears, '1 yr divergent', BAND.INVESTIGATE,
      'Earnings rose while operating cash fell in the latest year — check for a temporary working-capital build (10-Q cash-flow statement).');
  }
  return marker(key, '§5.3', label, 0, 'aligned', BAND.CONSTRUCTIVE, 'Operating cash tracks earnings direction.');
}

function receivableDivergenceMarker(series) {
  const key = 'receivable_divergence';
  const label = 'Receivables growth − revenue growth';
  if ((series?.receivables ?? []).length === 0) {
    return gap(key, '§5.3', label, 'No current-receivables concept tagged.');
  }
  if (!samePeriod(series, 'receivables', 'revenue')) {
    return gap(key, '§5.3', label, 'Receivables and revenue periods do not align — compute manually from the 10-K.');
  }
  const divergence = growthPct(series, 'receivables') != null && growthPct(series, 'revenue') != null
    ? growthPct(series, 'receivables') - growthPct(series, 'revenue')
    : null;
  if (divergence == null) {
    return gap(key, '§5.3', label, 'Prior-year receivables or revenue unavailable.');
  }
  const band = divergence <= 5 ? BAND.CONSTRUCTIVE : divergence <= 10 ? BAND.INVESTIGATE : BAND.CONCERN;
  const detail = band === BAND.CONSTRUCTIVE
    ? 'Collections keeping pace with reported revenue.'
    : band === BAND.INVESTIGATE
      ? 'Receivables outpacing revenue by 5–10pp — check payment terms and contract assets (revenue note).'
      : 'Receivables outpacing revenue by >10pp — route to receivable note, allowance roll-forward, customer concentration (§15).';
  return marker(key, '§5.3', label, divergence, fmtPct(divergence) + 'pp', band, detail);
}

function inventoryDivergenceMarker(series) {
  const key = 'inventory_divergence';
  const label = 'Inventory growth − cost-of-sales growth';
  if ((series?.inventory ?? []).length === 0) {
    return gap(key, '§5.3', label, 'No inventory tagged (asset-light or service model) — marker not applicable.');
  }
  if (!samePeriod(series, 'inventory', 'costOfRevenue')) {
    return gap(key, '§5.3', label, 'Inventory and cost-of-sales periods do not align — compute manually.');
  }
  const divergence = growthPct(series, 'inventory') != null && growthPct(series, 'costOfRevenue') != null
    ? growthPct(series, 'inventory') - growthPct(series, 'costOfRevenue')
    : null;
  if (divergence == null) {
    return gap(key, '§5.3', label, 'Prior-year inventory or cost-of-sales unavailable.');
  }
  const band = divergence <= 5 ? BAND.CONSTRUCTIVE : divergence <= 10 ? BAND.INVESTIGATE : BAND.CONCERN;
  const detail = band === BAND.CONSTRUCTIVE
    ? 'Inventory tracking cost of sales.'
    : band === BAND.INVESTIGATE
      ? 'Inventory building ahead of sales — check backlog/launch explanation (MD&A).'
      : 'Persistent inventory excess risk — check turns, obsolescence reserves, discounting (§5.3).';
  return marker(key, '§5.3', label, divergence, fmtPct(divergence) + 'pp', band, detail);
}

// ─── §5.5 Balance-sheet resilience (suppressed for banks/REITs per §14) ──────

function netDebtEbitdaMarker(series, profileKey) {
  const key = 'net_debt_ebitda';
  const label = 'Net debt / EBITDA';
  if (LEVERAGE_EXEMPT_PROFILES.has(profileKey)) {
    return gap(key, '§5.5', label, `§14: ordinary leverage bands do not apply to ${profileKey} filers — use the sector emphasis list instead.`);
  }
  const debtKeys = ['debtLongTerm', 'debtCurrent'].filter(k => (series?.[k] ?? []).length > 0);
  if (debtKeys.length === 0) {
    return gap(key, '§5.5', label, 'No debt concepts tagged — verify debt-free status in the 10-K debt note before treating as constructive.');
  }
  if (debtKeys.every(k => isStale(series, k))) {
    const lastYear = Math.max(...debtKeys.map(k => latestEndYear(series, k)));
    return gap(key, '§5.5', label, `Debt concepts last reported FY${lastYear} — tag likely retired (repaid or restructured); verify in the latest 10-K debt note.`);
  }
  const opInc = val(series, 'operatingIncome');
  const da = val(series, 'depreciationAmortization');
  if (opInc == null || da == null) {
    return gap(key, '§5.5', label, 'Operating income or D&A not tagged — cannot approximate EBITDA.');
  }
  if (!samePeriod(series, 'operatingIncome', 'depreciationAmortization')) {
    return gap(key, '§5.5', label, 'Operating income and D&A report different periods — cannot approximate EBITDA without mixing years.');
  }
  const ebitda = opInc + da;
  if (ebitda <= 0) {
    return gap(key, '§5.5', label, 'EBITDA ≤ 0 — leverage ratio not meaningful; check §4 Level 1 survival markers instead.');
  }
  const fresh = k => (isStale(series, k) ? 0 : (val(series, k) ?? 0));
  const netDebt = fresh('debtLongTerm')
    + fresh('debtCurrent')
    - fresh('cash')
    - fresh('shortTermInvestments');
  if (netDebt <= 0) {
    return marker(key, '§5.5', label, netDebt / ebitda, 'net cash', BAND.CONSTRUCTIVE, 'Net cash position.');
  }
  const ratio = netDebt / ebitda;
  const band = ratio < 2 ? BAND.CONSTRUCTIVE : ratio <= 4 ? BAND.INVESTIGATE : BAND.CONCERN;
  const detail = band === BAND.CONSTRUCTIVE
    ? 'Leverage comfortable for a non-financial filer.'
    : band === BAND.INVESTIGATE
      ? 'Watch zone — check maturity schedule and covenant headroom (debt note).'
      : 'Above 4x — high risk, especially if cyclical or shrinking; route to debt note and maturity table (§15).';
  return marker(key, '§5.5', label, ratio, fmtRatio(ratio), band, detail);
}

function interestCoverageMarker(series, profileKey) {
  const key = 'interest_coverage';
  const label = 'EBIT / interest expense';
  if (LEVERAGE_EXEMPT_PROFILES.has(profileKey)) {
    return gap(key, '§5.5', label, `§14: interest expense is a core operating cost for ${profileKey} filers — coverage bands do not apply.`);
  }
  const opInc = val(series, 'operatingIncome');
  const interest = val(series, 'interestExpense');
  if (opInc == null) {
    return gap(key, '§5.5', label, 'Operating income not tagged.');
  }
  if (interest == null || interest <= 0) {
    return gap(key, '§5.5', label, 'No material interest expense tagged — likely unlevered; verify in the debt note.');
  }
  if (isStale(series, 'interestExpense')) {
    return gap(key, '§5.5', label, `Interest expense last tagged FY${latestEndYear(series, 'interestExpense')} — likely immaterial or retired; verify in the latest debt note.`);
  }
  if (!samePeriod(series, 'operatingIncome', 'interestExpense')) {
    return gap(key, '§5.5', label, 'Operating income and interest expense report different periods — cannot compute coverage without mixing years.');
  }
  const ratio = opInc / interest;
  const band = ratio > 5 ? BAND.CONSTRUCTIVE : ratio >= 2 ? BAND.INVESTIGATE : BAND.CONCERN;
  const detail = band === BAND.CONSTRUCTIVE
    ? 'Interest burden well covered by operating earnings.'
    : band === BAND.INVESTIGATE
      ? '2–5x coverage — check fixed/floating mix and refinancing needs.'
      : 'Below 2x — survival-level marker (§4 Level 1); check maturities, covenants, going-concern language.';
  return marker(key, '§5.5', label, ratio, fmtRatio(ratio), band, detail);
}

// ─── §5.6 Share-based compensation and dilution ──────────────────────────────

function dilutedShareGrowthMarker(series) {
  const key = 'diluted_share_growth';
  const label = 'Diluted share growth (YoY)';
  const growth = growthPct(series, 'dilutedShares');
  if (growth == null) {
    return gap(key, '§5.6', label, 'Diluted share count unavailable for two fiscal years.');
  }
  const band = growth < 1 ? BAND.CONSTRUCTIVE : growth <= 3 ? BAND.INVESTIGATE : BAND.CONCERN;
  const detail = growth < 0
    ? 'Net share count declining.'
    : band === BAND.CONSTRUCTIVE
      ? 'Dilution below 1% per year.'
      : band === BAND.INVESTIGATE
        ? '1–3% annual dilution — net buybacks against grants (statement of equity).'
        : 'Above 3% dilution — route to statement of equity and proxy compensation tables (§15).';
  return marker(key, '§5.6', label, growth, fmtPct(growth), band, detail);
}

function sbcToRevenueMarker(series) {
  const key = 'sbc_to_revenue';
  const label = 'Stock compensation / revenue';
  const sbc = val(series, 'sbc');
  const revenue = val(series, 'revenue');
  if (sbc == null) {
    return gap(key, '§5.6', label, 'ShareBasedCompensation not tagged — check the cash-flow statement.');
  }
  if (revenue == null || revenue <= 0 || !samePeriod(series, 'sbc', 'revenue')) {
    return gap(key, '§5.6', label, 'Revenue unavailable or period-misaligned with SBC.');
  }
  const pct = (sbc / revenue) * 100;
  const band = pct < 5 ? BAND.CONSTRUCTIVE : pct <= 10 ? BAND.INVESTIGATE : BAND.CONCERN;
  const detail = band === BAND.CONSTRUCTIVE
    ? 'SBC modest relative to revenue.'
    : band === BAND.INVESTIGATE
      ? '5–10% of revenue — net against buybacks and check vesting structure (proxy).'
      : 'Above 10% of revenue — real cost to owners; especially serious without strong cash economics (§5.6).';
  return marker(key, '§5.6', label, pct, fmtPct(pct, 1), band, detail);
}

function buybackOffsetMarker(series) {
  const key = 'buyback_offset';
  const label = 'Gross buybacks vs net share count';
  const buybacks = val(series, 'buybacks');
  if (buybacks == null || buybacks <= 0) {
    return gap(key, '§5.6', label, 'No share repurchases in the latest fiscal year.');
  }
  if (isStale(series, 'buybacks')) {
    return gap(key, '§5.6', label, `No repurchases in the latest FY (last reported FY${latestEndYear(series, 'buybacks')}).`);
  }
  const shareGrowth = growthPct(series, 'dilutedShares');
  if (shareGrowth == null) {
    return gap(key, '§5.6', label, 'Buybacks present but share-count trend unavailable.');
  }
  if (shareGrowth > 0.5) {
    return marker(key, '§5.6', label, shareGrowth, fmtPct(shareGrowth), BAND.CONCERN,
      'Buybacks while the diluted share count still rose — repurchases are absorbing grants, not returning capital (§5.6).');
  }
  if (shareGrowth >= -0.5) {
    return marker(key, '§5.6', label, shareGrowth, fmtPct(shareGrowth), BAND.INVESTIGATE,
      'Buybacks roughly offset grants — net shareholder benefit near zero.');
  }
  return marker(key, '§5.6', label, shareGrowth, fmtPct(shareGrowth), BAND.CONSTRUCTIVE,
    'Net share count declining — buybacks exceed issuance.');
}

// ─── §5.7 Distributions to shareholders ──────────────────────────────────────

function dividendToFcfMarker(series, profileKey) {
  const key = 'dividend_to_fcf';
  const label = 'Dividend / free cash flow';
  const dividends = val(series, 'dividendsPaid');
  if (dividends == null || dividends <= 0) {
    return gap(key, '§5.7', label, 'No dividend paid — retention/reinvestment model.');
  }
  if (isStale(series, 'dividendsPaid')) {
    return gap(key, '§5.7', label, `No dividend in the latest FY (last paid FY${latestEndYear(series, 'dividendsPaid')}) — check whether the dividend was cut or suspended.`);
  }
  const ocf = val(series, 'operatingCashFlow');
  const capex = val(series, 'capex');
  if (ocf == null || capex == null) {
    return gap(key, '§5.7', label, 'OCF or capex unavailable — cannot compute FCF payout.');
  }
  if (!samePeriod(series, 'operatingCashFlow', 'capex') || !samePeriod(series, 'dividendsPaid', 'operatingCashFlow')) {
    return gap(key, '§5.7', label, 'Dividends, OCF, and capex report different periods — compute the payout manually from one cash-flow statement.');
  }
  const fcf = ocf - capex;
  if (fcf <= 0) {
    return marker(key, '§5.7', label, null, 'FCF ≤ 0', BAND.CONCERN,
      'Dividend paid while free cash flow is non-positive — funded by debt, asset sales, or underinvestment (§5.7).');
  }
  const ratio = dividends / fcf;
  const band = ratio <= 0.6 ? BAND.CONSTRUCTIVE : ratio <= 1 ? BAND.INVESTIGATE : BAND.CONCERN;
  const reitNote = profileKey === 'reit' ? ' REIT: judge payout against AFFO, not FCF (§14).' : '';
  const detail = (band === BAND.CONSTRUCTIVE
    ? 'Payout within the comfortable range for a mature company.'
    : band === BAND.INVESTIGATE
      ? 'Payout above 60% of FCF — check reinvestment needs and maintenance capex.'
      : 'Payout above 100% of FCF — unsustainable without balance-sheet support (§5.7).') + reitNote;
  return marker(key, '§5.7', label, ratio, fmtPct(ratio * 100, 0) + ' of FCF', band, detail);
}

// ─── §9.2 Market behavior ────────────────────────────────────────────────────

/**
 * 12-month simple returns from two oldest→newest daily price arrays
 * (shape per yahoo-client fetchYahooDailyPrices). Null when either is unusable.
 */
export function computeRelativeReturn(stockPrices, benchmarkPrices) {
  const simpleReturn = (prices) => {
    if (!Array.isArray(prices) || prices.length < 2) return null;
    const first = Number(prices[0]?.close);
    const last = Number(prices[prices.length - 1]?.close);
    if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return null;
    return ((last - first) / first) * 100;
  };
  const stockPct = simpleReturn(stockPrices);
  const benchmarkPct = simpleReturn(benchmarkPrices);
  if (stockPct == null || benchmarkPct == null) return null;
  return Object.freeze({ stockPct, benchmarkPct, relativePp: stockPct - benchmarkPct });
}

/** §9.2: ~20pp+ 12-month underperformance vs the benchmark deserves a specific explanation. */
export function relativePerformanceMarker(relative, benchmark) {
  const key = 'relative_performance_12m';
  const label = `12-month return vs ${benchmark || 'benchmark'}`;
  if (!relative) {
    return gap(key, '§9.2', label, 'Price history unavailable — fill the §9 market-behavior section manually.');
  }
  const { stockPct, benchmarkPct, relativePp } = relative;
  const display = `${fmtPct(stockPct)} vs ${fmtPct(benchmarkPct)} (${fmtPct(relativePp)}pp)`;
  if (relativePp <= -20) {
    return marker(key, '§9.2', label, relativePp, display, BAND.INVESTIGATE,
      'Underperformance ≥20pp over 12 months deserves a specific explanation — estimate revisions, forced selling, or a changed thesis (§9.2).');
  }
  return marker(key, '§9.2', label, relativePp, display, BAND.CONSTRUCTIVE,
    'Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass.');
}

// ─── Assembly ────────────────────────────────────────────────────────────────

/**
 * Compute all filing-derived markers from a fiscal-year series object.
 * @param {object} series  key → newest-first [{value,end,form}] arrays
 * @param {object} opts    { profileKey: 'general'|'bank'|'reit' }
 */
export function computeHealthMarkers(series, { profileKey = 'general' } = {}) {
  return Object.freeze([
    fcfConversionMarker(series),
    ocfTrendMarker(series),
    receivableDivergenceMarker(series),
    inventoryDivergenceMarker(series),
    netDebtEbitdaMarker(series, profileKey),
    interestCoverageMarker(series, profileKey),
    dilutedShareGrowthMarker(series),
    sbcToRevenueMarker(series),
    buybackOffsetMarker(series),
    dividendToFcfMarker(series, profileKey),
  ]);
}

/**
 * Roll markers up into pull-note signal fields.
 * Any concern → `watch`; 3+ concerns → `alert`. Bands never fire `critical` —
 * that severity is reserved for §7.3 hard-stop events, which need human review.
 */
export function summarizeMarkers(markers, ticker) {
  const counts = { constructive: 0, investigate: 0, concern: 0, 'n/a': 0 };
  const signals = [];
  for (const m of markers) {
    counts[m.band] = (counts[m.band] ?? 0) + 1;
    if (m.band === BAND.CONCERN) {
      signals.push(`health:${String(ticker).toLowerCase()}:${m.key}:concern`);
    }
  }
  const status = counts.concern >= 3 ? 'alert' : counts.concern >= 1 ? 'watch' : 'clear';
  return Object.freeze({ counts: Object.freeze(counts), signals: Object.freeze(signals), status });
}
