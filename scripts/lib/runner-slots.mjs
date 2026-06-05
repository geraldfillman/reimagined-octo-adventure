// Slot → puller map. Mirrors My_Data/AGENT_RUNBOOK.md.
// If a puller key is added here, add the matching row in FRESHNESS_POLICY.md
// and a `sources` entry in _state/run-state.json.

export const SLOTS = Object.freeze({
  S1: {
    label: 'Pre-open',
    timeET: '06:30',
    pullers: [
      { key: 'macro-bridges',         script: 'scripts/pullers/macro-bridges.mjs',         tier: 'critical'  },
      { key: 'macro-volatility',      script: 'scripts/pullers/macro-volatility.mjs',      tier: 'important' },
      { key: 'opportunity-viewpoints',script: 'scripts/pullers/opportunity-viewpoints.mjs',args: ['--scope=premarket'], tier: 'critical'  },
      { key: 'sourcewatch',           script: 'scripts/pullers/sourcewatch.mjs',           args: ['--since=overnight'], tier: 'important', direct: true },
    ],
    synthesisAgents: ['Macro Agent', 'Market Agent'],
    defaultReport: 'Reports/Premarket/<date>.md',
  },
  S2: {
    label: 'Open+30',
    timeET: '10:00',
    pullers: [
      { key: 'bea',              script: 'scripts/pullers/bea.mjs',              tier: 'important' },
      { key: 'orb-entropy',      script: 'scripts/pullers/orb-entropy.mjs',      tier: 'important' },
      { key: 'cboe',             script: 'scripts/pullers/cboe.mjs',             tier: 'important' },
      { key: 'confluence-scan',  script: 'scripts/pullers/confluence-scan.mjs',  tier: 'important' },
      { key: 'auction-features', script: 'scripts/pullers/auction-features.mjs', tier: 'optional'  },
      { key: 'entropy-monitor',  script: 'scripts/pullers/entropy-monitor.mjs',  tier: 'optional'  },
    ],
    defaultReport: null,
  },
  S3: {
    label: 'Midday',
    timeET: '12:30',
    pullers: [
      { key: 'macro-volatility',       script: 'scripts/pullers/macro-volatility.mjs',       tier: 'important' },
      { key: 'opportunity-viewpoints', script: 'scripts/pullers/opportunity-viewpoints.mjs', tier: 'important' },
      { key: 'federalregister',        script: 'scripts/pullers/federalregister.mjs',        tier: 'important' },
    ],
    synthesisAgents: ['Thesis Agent'],
    defaultReport: null,
  },
  S4: {
    label: 'Preclose',
    timeET: '15:30',
    pullers: [
      { key: 'options-review', script: 'scripts/pullers/options-review.mjs', tier: 'critical'  },
      { key: 'cboe',           script: 'scripts/pullers/cboe.mjs',           args: ['--refresh'], tier: 'important' },
      { key: 'entropy-monitor',script: 'scripts/pullers/entropy-monitor.mjs',tier: 'important' },
    ],
    synthesisAgents: ['Positioning Agent'],
    defaultReport: 'Reports/Preclose/<date>.md',
  },
  S5: {
    label: 'Postclose',
    timeET: '16:30',
    pullers: [
      { key: 'filing-digest',      script: 'scripts/pullers/filing-digest.mjs',      args: ['--window=ah'], tier: 'critical'  },
      { key: 'capital-raise',      script: 'scripts/pullers/capital-raise.mjs',      tier: 'important' },
      { key: 'disclosure-reality', script: 'scripts/pullers/disclosure-reality.mjs', tier: 'important' },
      { key: 'company-risk-scan',  script: 'scripts/pullers/company-risk-scan.mjs',  tier: 'optional'  },
      { key: 'fda',                script: 'scripts/pullers/fda.mjs',                tier: 'optional', weekdays: [2, 4] },
      { key: 'clinicaltrials',     script: 'scripts/pullers/clinicaltrials.mjs',     tier: 'optional', weekdays: [2, 4] },
      { key: 'openfema',           script: 'scripts/pullers/openfema.mjs',           tier: 'optional'  },
    ],
    defaultReport: null,
  },
  S6: {
    label: 'EOD',
    timeET: '18:00',
    pullers: [
      { key: 'cash-flow-quality', script: 'scripts/pullers/cash-flow-quality.mjs', tier: 'optional' },
      { key: 'convergence-scan',  script: 'scripts/pullers/convergence-scan.mjs',  tier: 'important' },
    ],
    synthesisAgents: ['Positioning Agent'],
    reconcile: true,
    defaultReport: 'Reports/EOD/<date>.md',
    mayMutateLedger: true,
  },
});

export const SLOT_ORDER = Object.freeze(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);

export function getSlot(slotKey) {
  const slot = SLOTS[slotKey];
  if (!slot) throw new Error(`Unknown slot: ${slotKey}. Valid: ${SLOT_ORDER.join(', ')}`);
  return slot;
}

// Returns pullers for the given slot, filtered by weekday constraint (if any).
export function pullersForSlot(slotKey, now = new Date()) {
  const slot = getSlot(slotKey);
  const dow = now.getDay(); // 0=Sun..6=Sat
  return slot.pullers.filter(p => !p.weekdays || p.weekdays.includes(dow));
}
