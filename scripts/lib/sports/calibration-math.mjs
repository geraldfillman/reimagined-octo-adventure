/**
 * calibration-math.mjs — re-export of computeCalibration() so both
 * sports-backtest.mjs and sports-calibration.mjs can share the math
 * without one puller importing from another puller.
 *
 * The actual implementation still lives in sports-backtest.mjs (where
 * Phase 0 introduced it). This module is a tiny shim, not a fork — do
 * not duplicate the math here.
 */

export { computeCalibration } from '../../pullers/sports-backtest.mjs';
