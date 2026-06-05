/**
 * daily.mjs — Full daily pipeline chain for the bridge group.
 *
 * Runs six sequential steps:
 *   1. System readiness preflight (daily cadence)
 *   2. Daily routine cadence (cadence.mjs)
 *   3. My_Data report output (my-data-report-flow command)
 *   4. World_Machine inbox bridge (approved-only, optional)
 *   5. Source gap register refresh
 *   6. EOD digest (stubbed until Phase 6)
 *
 * Usage:
 *   node run.mjs bridge daily
 *   node run.mjs bridge daily --dry-run
 *   node run.mjs bridge daily --allow-stale --continue-on-error
 */

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// ── Step runner ───────────────────────────────────────────────────────────────

async function runStep(name, fn, flags) {
  const t0 = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - t0;
    console.log(`[bridge daily] step "${name}" ok (${durationMs}ms)`);
    return { name, status: 'ok', durationMs };
  } catch (err) {
    const durationMs = Date.now() - t0;
    console.error(`[bridge daily] step "${name}" FAILED: ${err.message}`);
    if (flags.continueOnError) {
      return { name, status: 'failed', durationMs, error: err.message };
    }
    throw err;
  }
}

function normalizeFlags(flags = {}) {
  return {
    ...flags,
    dryRun: Boolean(flags.dryRun || flags['dry-run']),
    allowStale: Boolean(flags.allowStale || flags['allow-stale'] || flags.staleOk || flags['stale-ok']),
    continueOnError: Boolean(flags.continueOnError || flags['continue-on-error']),
    skipValidate: Boolean(flags.skipValidate || flags['skip-validate']),
    skipGapRegister: Boolean(flags.skipGapRegister || flags['skip-gap-register']),
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * @param {object} flags
 * @param {boolean} [flags.dryRun]
 * @param {boolean} [flags.allowStale]
 * @param {boolean} [flags.continueOnError]
 * @param {boolean} [flags.skipValidate]
 * @param {boolean} [flags.skipGapRegister]
 * @returns {Promise<{ steps: Array<{name: string, status: string, durationMs: number}>, totalMs: number }>}
 */
export async function run(flags = {}) {
  flags = normalizeFlags(flags);
  const totalStart = Date.now();
  const steps = [];

  // ── Step 1: System readiness preflight ──────────────────────────────────────
  steps.push(await runStep('readiness-preflight', async () => {
    const { evaluateReadiness, formatReadinessText } = await import('../system/readiness.mjs');
    const result = await evaluateReadiness({ cadence: 'daily' });
    console.log(`[bridge daily] readiness: ${result.status}`);
    console.log(formatReadinessText(result));
    if (result.status === 'WARN') {
      console.warn('[bridge daily] Data readiness WARN — continuing with stale data.');
    }
    if (result.status === 'BLOCKED' && !flags.allowStale) {
      throw new Error(
        `Data readiness is BLOCKED for daily cadence. Run refresh commands or pass --allow-stale to override.\n${formatReadinessText(result)}`
      );
    }
    if (result.status === 'BLOCKED') {
      console.warn('[bridge daily] Data readiness BLOCKED but --allow-stale supplied — continuing anyway.');
    }
  }, flags));

  // ── Step 2: Daily cadence ────────────────────────────────────────────────────
  steps.push(await runStep('daily-cadence', async () => {
    const { run: runCadence } = await import('../routines/cadence.mjs');
    await runCadence('daily', {
      'dry-run': flags.dryRun ?? false,
      'skip-validate': flags.skipValidate ?? false,
      'continue-on-error': flags.continueOnError ?? false,
    });
  }, flags));

  // Step 3: My_Data report output.
  steps.push(await runStep('my-data-report-flow', async () => {
    const { pull } = await import('../pullers/my-data-report-flow.mjs');
    const result = await pull({
      documents: 'daily-monitoring,daily-briefing,source-register,strategy-register',
      'dry-run': flags.dryRun ?? false,
      'allow-stale': flags.allowStale ?? false,
    });
    if (result?.runId) {
      flags._runId = result.runId;
    }
  }, flags));

  // Step 3b: My_Data indicator updates.
  steps.push(await runStep('update-my-data-indicators', async () => {
    const indicatorPath = join(HERE, '..', 'pullers', 'update-my-data-indicators.mjs');
    const { run: runIndicators } = await import(pathToFileURL(indicatorPath).href);
    const result = await runIndicators({ dryRun: flags.dryRun ?? false });
    console.log(`[bridge daily] indicators updated=${result.updated.length} skipped=${result.skipped.length} errors=${result.errors.length}`);
  }, flags));

  // Step 4: World_Machine inbox bridge (approved-only, optional).
  steps.push(await runStep('world-machine-bridge', async () => {
    const wmPath = join(HERE, '..', 'pullers', 'world-machine-flow.mjs');
    if (!existsSync(wmPath)) {
      console.log('[bridge daily] world-machine-flow.mjs not found — skipping.');
      return;
    }
    const { pull: wmPull } = await import(pathToFileURL(wmPath).href);
    await wmPull({
      'approved-only': true,
      'dry-run': flags.dryRun ?? false,
    });
  }, flags));

  // ── Step 5: Source gap register refresh ─────────────────────────────────────
  if (flags.skipGapRegister) {
    console.log('[bridge daily] --skip-gap-register set — skipping step 5.');
    steps.push({ name: 'source-gap-register', status: 'skipped', durationMs: 0 });
  } else {
    steps.push(await runStep('source-gap-register', async () => {
      const { run: runGap } = await import('../system/source-gap-register.mjs');
      await runGap({ dryRun: flags.dryRun ?? false });
    }, flags));
  }

  // ── Step 6: EOD digest (stubbed) ─────────────────────────────────────────────
  steps.push(await runStep('eod-digest', async () => {
    const digestPath = join(HERE, 'eod-digest.mjs');
    if (!existsSync(digestPath)) {
      console.log('[bridge daily] EOD digest not yet implemented, skipping.');
      return;
    }
    const { run: runDigest } = await import(pathToFileURL(digestPath).href);
    await runDigest({ dryRun: flags.dryRun ?? false });
  }, flags));

  const totalMs = Date.now() - totalStart;
  const ok = steps.filter(s => s.status === 'ok').length;
  const failed = steps.filter(s => s.status === 'failed').length;
  const skipped = steps.filter(s => s.status === 'skipped').length;
  console.log(`\n[bridge daily] done — ok=${ok} failed=${failed} skipped=${skipped} total=${totalMs}ms`);

  return { steps, totalMs };
}
