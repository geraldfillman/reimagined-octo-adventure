/**
 * signals/index.mjs — Barrel re-export
 *
 * Re-exports all signal evaluation functions from domain modules.
 * Import from this file or from lib/signals.mjs (thin redirect) — both work.
 */

export { highestSeverity, formatSignalsSection } from './utils.mjs';

export {
  evaluateYieldCurve,
  evaluateUnemploymentSpike,
  evaluateInitialClaims,
  evaluateCPI,
  evaluateFedBalanceSheet,
  evaluateCreditSpreads,
  evaluateReverseRepo,
} from './macro.mjs';

export {
  evaluateHousingStarts,
  evaluateMortgageRate,
  evaluateCaseShiller,
} from './housing.mjs';

export {
  evaluateOilPrice,
  evaluateElectricityDemandGrowth,
  evaluateGenerationGap,
  evaluateRegionalLoadSpike,
} from './energy.mjs';

export {
  evaluatePutCallRatio,
  evaluateSkewIndex,
  evaluateVIXTermStructure,
  evaluateUnusualOptionsActivity,
} from './market.mjs';

export {
  evaluateFDAApprovals,
  evaluatePhase3Trials,
} from './biotech.mjs';

export {
  evaluateLargeContract,
  evaluateLargeOpportunity,
  evaluateOpportunityCluster,
} from './government.mjs';

export {
  evaluateFEMASpike,
  evaluateCPIHousingDivergence,
  evaluatePatentVelocity,
} from './cross-domain.mjs';
