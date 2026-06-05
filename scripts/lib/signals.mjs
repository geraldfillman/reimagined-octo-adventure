/**
 * signals.mjs — backwards-compatibility shim
 *
 * The signal evaluation engine has been split into domain modules under lib/signals/.
 * This file exists only so the 13 existing importers continue to work without changes.
 *
 * New code should import directly from the domain modules:
 *   import { evaluateYieldCurve } from './signals/macro.mjs';
 *   import { highestSeverity } from './signals/utils.mjs';
 */
export * from './signals/index.mjs';
