/**
 * skeleton-profiles.mjs — Industry-aware XBRL concept maps for `edgar facts`.
 *
 * Generic software/industrial concepts produce thin skeletons for banks and
 * REITs (JPM and PLD both covered 8/15 on the general profile). Each profile
 * below was built by probing live company-facts tags (2026-08-01): every
 * concept listed was verified present with a fresh fiscal-year value in a
 * representative filer, so rows resolve instead of showing stale/blank.
 *
 * Profile selection is by SIC code from the SEC submissions document, with a
 * `--profile` CLI override. Concept order is preference order only — the
 * freshest-period-end rule in fiscalYearValues() still wins.
 */

/** General profile (framework §13 dossier, §6.4 statements). */
export const GENERAL_ROWS = Object.freeze([
  { label: 'Revenue',                    kind: 'flow',    concepts: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet', 'RevenueFromContractWithCustomerIncludingAssessedTax'] },
  { label: 'Gross profit',               kind: 'flow',    concepts: ['GrossProfit'] },
  { label: 'Operating income',           kind: 'flow',    concepts: ['OperatingIncomeLoss'] },
  { label: 'Net income',                 kind: 'flow',    concepts: ['NetIncomeLoss'] },
  { label: 'Operating cash flow',        kind: 'flow',    concepts: ['NetCashProvidedByUsedInOperatingActivities', 'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'] },
  { label: 'Capital expenditure',        kind: 'flow',    concepts: ['PaymentsToAcquirePropertyPlantAndEquipment', 'PaymentsToAcquireProductiveAssets'] },
  { label: 'Research & development',     kind: 'flow',    concepts: ['ResearchAndDevelopmentExpense'] },
  { label: 'Stock-based compensation',   kind: 'flow',    concepts: ['ShareBasedCompensation'] },
  { label: 'Cash & equivalents',         kind: 'balance', concepts: ['CashAndCashEquivalentsAtCarryingValue'] },
  { label: 'Receivables (current)',      kind: 'balance', concepts: ['AccountsReceivableNetCurrent'] },
  { label: 'Inventory',                  kind: 'balance', concepts: ['InventoryNet'] },
  { label: 'Deferred revenue (current)', kind: 'balance', concepts: ['ContractWithCustomerLiabilityCurrent', 'DeferredRevenueCurrent'] },
  { label: 'Goodwill',                   kind: 'balance', concepts: ['Goodwill'] },
  { label: 'Long-term debt',             kind: 'balance', concepts: ['LongTermDebtNoncurrent', 'LongTermDebt'] },
  { label: 'Diluted shares (wtd avg)',   kind: 'flow',    unit: 'shares', concepts: ['WeightedAverageNumberOfDilutedSharesOutstanding'] },
]);

/**
 * Bank / lender profile (probed against JPM CIK 19617).
 * Operating cash flow is intentionally omitted — bank OCF is dominated by
 * trading-asset swings (JPM FY2025: −$148B) and misleads cash-quality reads.
 */
export const BANK_ROWS = Object.freeze([
  { label: 'Total net revenue',            kind: 'flow',    concepts: ['RevenuesNetOfInterestExpense', 'Revenues'] },
  { label: 'Net interest income',          kind: 'flow',    concepts: ['InterestIncomeExpenseNet'] },
  { label: 'Noninterest income',           kind: 'flow',    concepts: ['NoninterestIncome'] },
  { label: 'Provision for credit losses',  kind: 'flow',    concepts: ['ProvisionForLoanLeaseAndOtherLosses', 'ProvisionForLoanAndLeaseLosses'] },
  { label: 'Noninterest expense',          kind: 'flow',    concepts: ['NoninterestExpense'] },
  { label: 'Net income',                   kind: 'flow',    concepts: ['NetIncomeLoss'] },
  { label: 'Loans (net of allowance)',     kind: 'balance', concepts: ['FinancingReceivableExcludingAccruedInterestAfterAllowanceForCreditLoss', 'NotesReceivableNet', 'LoansAndLeasesReceivableNetReportedAmount'] },
  { label: 'Deposits',                     kind: 'balance', concepts: ['Deposits'] },
  { label: 'Total assets',                 kind: 'balance', concepts: ['Assets'] },
  { label: "Stockholders' equity",         kind: 'balance', concepts: ['StockholdersEquity'] },
  { label: 'Stock-based compensation',     kind: 'flow',    concepts: ['ShareBasedCompensation'] },
  { label: 'Diluted shares (wtd avg)',     kind: 'flow',    unit: 'shares', concepts: ['WeightedAverageNumberOfDilutedSharesOutstanding'] },
]);

/** REIT / real-estate profile (probed against PLD CIK 1045609). */
export const REIT_ROWS = Object.freeze([
  { label: 'Revenue',                       kind: 'flow',    concepts: ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax'] },
  { label: 'Operating income',              kind: 'flow',    concepts: ['OperatingIncomeLoss'] },
  { label: 'Net income',                    kind: 'flow',    concepts: ['NetIncomeLoss'] },
  { label: 'Depreciation & amortization',   kind: 'flow',    concepts: ['DepreciationAndAmortization', 'DepreciationDepletionAndAmortization'] },
  { label: 'Interest expense',              kind: 'flow',    concepts: ['InterestExpense', 'InterestExpenseNonoperating'] },
  { label: 'Operating cash flow',           kind: 'flow',    concepts: ['NetCashProvidedByUsedInOperatingActivities', 'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'] },
  { label: 'Development spend',             kind: 'flow',    concepts: ['PaymentsToDevelopRealEstateAssets'] },
  { label: 'Property acquisitions',         kind: 'flow',    concepts: ['PaymentsToAcquireRealEstate'] },
  { label: 'Disposition proceeds',          kind: 'flow',    concepts: ['ProceedsFromRealEstateAndRealEstateJointVentures'] },
  { label: 'Real estate (net)',             kind: 'balance', concepts: ['RealEstateInvestmentPropertyNet', 'RealEstateGrossAtCarryingValue'] },
  { label: 'Total assets',                  kind: 'balance', concepts: ['Assets'] },
  { label: 'Long-term debt',                kind: 'balance', concepts: ['LongTermDebtNoncurrent', 'LongTermDebt'] },
  { label: 'Cash & equivalents',            kind: 'balance', concepts: ['CashAndCashEquivalentsAtCarryingValue'] },
  { label: 'Stock-based compensation',      kind: 'flow',    concepts: ['ShareBasedCompensation'] },
  { label: 'Diluted shares (wtd avg)',      kind: 'flow',    unit: 'shares', concepts: ['WeightedAverageNumberOfDilutedSharesOutstanding'] },
]);

export const SKELETON_PROFILES = Object.freeze({
  general: Object.freeze({ key: 'general', label: 'General', rows: GENERAL_ROWS }),
  bank:    Object.freeze({ key: 'bank',    label: 'Bank / lender', rows: BANK_ROWS }),
  reit:    Object.freeze({ key: 'reit',    label: 'REIT / real estate', rows: REIT_ROWS }),
});

/**
 * Select a profile from a SIC code (SEC submissions `sic` field).
 * 6798 = REIT; 6000–6199 depositories/lenders and 6712 bank holding = bank.
 */
export function selectSkeletonProfile(sic) {
  const code = Number.parseInt(String(sic ?? '').trim(), 10);
  if (!Number.isFinite(code)) return SKELETON_PROFILES.general;
  if (code === 6798) return SKELETON_PROFILES.reit;
  if ((code >= 6000 && code <= 6199) || code === 6712) return SKELETON_PROFILES.bank;
  return SKELETON_PROFILES.general;
}
