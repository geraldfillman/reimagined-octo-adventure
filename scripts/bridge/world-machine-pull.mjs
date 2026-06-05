import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_REVIEW_TARGETS = [
  'My_Data/Reports/Source Gap Register.md',
  'My_Data/Reports/',
  'World_Machine/_Inbox/World Machine Candidate Packets/',
];

const VALID_CADENCES = new Set(['premarket', 'daily', 'midday', 'preclose', 'eod']);

function flagValue(flags, camelName, kebabName, fallback = false) {
  return flags[camelName] ?? flags[kebabName] ?? fallback;
}

function normalizeOptions(flags = {}) {
  const cadence = String(flags.cadence || 'daily').trim().toLowerCase();
  if (!VALID_CADENCES.has(cadence)) {
    throw new Error(`Unknown cadence "${cadence}". Valid cadences: ${Array.from(VALID_CADENCES).join(', ')}`);
  }

  return {
    cadence,
    dryRun: Boolean(flagValue(flags, 'dryRun', 'dry-run')),
    allowStale: Boolean(flagValue(flags, 'allowStale', 'allow-stale') || flags.staleOk || flags['stale-ok']),
    continueOnError: Boolean(flagValue(flags, 'continueOnError', 'continue-on-error')),
    fullSourceRefresh: Boolean(flagValue(flags, 'fullSourceRefresh', 'full-source-refresh')),
    skipValidate: Boolean(flagValue(flags, 'skipValidate', 'skip-validate')),
    skipGapRegister: Boolean(flagValue(flags, 'skipGapRegister', 'skip-gap-register')),
    json: Boolean(flags.json),
  };
}

async function defaultReadiness({ cadence }) {
  const { evaluateReadiness, formatReadinessText } = await import('../system/readiness.mjs');
  const result = await evaluateReadiness({ cadence });
  return { ...result, text: formatReadinessText(result) };
}

async function defaultSourceRefresh({ dryRun, continueOnError, skipValidate }) {
  const { run: runDailyBridge } = await import('./daily.mjs');
  return runDailyBridge({
    dryRun,
    continueOnError,
    skipValidate,
    skipGapRegister: true,
  });
}

async function defaultReviewCadence({ cadence, dryRun }) {
  const { run: runCadence } = await import('../system/cadence-runner.mjs');
  return runCadence('run', cadence, {
    'dry-run': dryRun,
  });
}

async function defaultIndicators({ dryRun }) {
  const indicatorPath = join(HERE, '..', 'pullers', 'update-my-data-indicators.mjs');
  const { run: runIndicators } = await import(pathToFileURL(indicatorPath).href);
  return runIndicators({ dryRun, 'dry-run': dryRun });
}

async function defaultPackets({ dryRun }) {
  const wmPath = join(HERE, '..', 'pullers', 'world-machine-flow.mjs');
  if (!existsSync(wmPath)) {
    return { skipped: ['world-machine-flow.mjs not found'] };
  }
  const { pull: wmPull } = await import(pathToFileURL(wmPath).href);
  return wmPull({
    'approved-only': true,
    'dry-run': dryRun,
  });
}

async function defaultSourceGap({ dryRun }) {
  const { run: runGap } = await import('../system/source-gap-register.mjs');
  return runGap({ dryRun });
}

async function defaultValidate() {
  const validator = await import('../validate-vault.mjs');
  return validator.run();
}

function defaultSteps() {
  return {
    readiness: defaultReadiness,
    sourceRefresh: defaultSourceRefresh,
    reviewCadence: defaultReviewCadence,
    indicators: defaultIndicators,
    packets: defaultPackets,
    sourceGap: defaultSourceGap,
    validate: defaultValidate,
  };
}

function extractArtifacts(value) {
  if (!value || typeof value !== 'object') return [];
  const artifacts = [];
  for (const key of ['path', 'summaryPath', 'filePath']) {
    if (typeof value[key] === 'string') artifacts.push(value[key]);
  }
  for (const key of ['artifacts', 'written', 'wrote']) {
    if (Array.isArray(value[key])) artifacts.push(...value[key].filter(item => typeof item === 'string'));
  }
  return artifacts;
}

async function runStep(name, required, fn, context, state) {
  const start = Date.now();
  try {
    const result = await fn(context);
    const step = {
      name,
      status: 'ok',
      durationMs: Date.now() - start,
      summary: `${name} completed`,
      artifacts: extractArtifacts(result),
    };
    state.steps.push(step);
    return result;
  } catch (error) {
    const step = {
      name,
      status: 'failed',
      durationMs: Date.now() - start,
      summary: error.message,
      artifacts: [],
    };
    state.steps.push(step);
    if (required || !context.continueOnError) throw error;
    state.warnings.push(`${name} failed: ${error.message}`);
    return null;
  }
}

function printSummary(result, write) {
  write('');
  write(`[my-data-report-pull] mode=${result.mode} cadence=${result.cadence}`);
  for (const step of result.steps) {
    write(`  ${step.status.padEnd(7)} ${step.name} (${step.durationMs}ms)`);
    for (const artifact of step.artifacts) {
      write(`    artifact: ${artifact}`);
    }
  }
  if (result.warnings.length) {
    write('Warnings:');
    for (const warning of result.warnings) write(`  - ${warning}`);
  }
  write('Review targets:');
  for (const target of result.reviewTargets) write(`  - ${target}`);
}

export async function run(flags = {}, dependencies = {}) {
  const options = normalizeOptions(flags);
  const steps = dependencies.steps || defaultSteps();
  const write = dependencies.write || (line => console.log(line));
  const state = {
    mode: options.fullSourceRefresh ? 'full-source-refresh' : 'review-only',
    cadence: options.cadence,
    dryRun: options.dryRun,
    steps: [],
    warnings: [],
    reviewTargets: DEFAULT_REVIEW_TARGETS,
    readiness: null,
  };

  const readiness = await runStep('readiness', true, steps.readiness, options, state);
  state.readiness = readiness;

  if (readiness?.status === 'WARN') {
    state.warnings.push(`Data readiness is WARN for ${options.cadence}.`);
  }
  if (readiness?.status === 'BLOCKED' && !options.allowStale) {
    throw new Error(`Data readiness is BLOCKED for ${options.cadence}. Use --allow-stale to override.`);
  }
  if (readiness?.status === 'BLOCKED' && options.allowStale) {
    state.warnings.push(`Data readiness is BLOCKED for ${options.cadence}; continuing because --allow-stale was supplied.`);
  }

  if (options.fullSourceRefresh) {
    await runStep('full-source-refresh', true, steps.sourceRefresh, options, state);
  }

  await runStep('review-cadence', true, steps.reviewCadence, options, state);
  await runStep('update-my-data-indicators', false, steps.indicators, options, state);
  await runStep('world-machine-packets', false, steps.packets, options, state);

  if (options.skipGapRegister) {
    state.steps.push({
      name: 'source-gap-register',
      status: 'skipped',
      durationMs: 0,
      summary: '--skip-gap-register supplied',
      artifacts: [],
    });
  } else {
    await runStep('source-gap-register', false, steps.sourceGap, options, state);
  }

  if (options.skipValidate) {
    state.steps.push({
      name: 'validate',
      status: 'skipped',
      durationMs: 0,
      summary: '--skip-validate supplied',
      artifacts: [],
    });
  } else {
    await runStep('validate', false, steps.validate, options, state);
  }

  if (options.json) {
    write(JSON.stringify(state, null, 2));
  } else {
    printSummary(state, write);
  }

  return state;
}
