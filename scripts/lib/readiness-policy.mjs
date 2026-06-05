import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { resolveEnginePath } from './config.mjs';

export function getDefaultPolicyPath() {
  return resolveEnginePath('99_System', 'config', 'freshness-policies.json');
}

export async function loadReadinessPolicy(policyPath = getDefaultPolicyPath()) {
  const text = await readFile(resolve(policyPath), 'utf-8');
  const policy = JSON.parse(text);
  if (!policy || typeof policy !== 'object' || !policy.cadences) {
    throw new Error('Readiness policy must define cadences');
  }
  return policy;
}

export function getCadencePolicy(policy, cadence) {
  const cadencePolicy = policy?.cadences?.[cadence];
  if (!cadencePolicy) {
    throw new Error(`Unknown readiness cadence: ${cadence}`);
  }
  return {
    name: cadence,
    stale_required: cadencePolicy.stale_required || 'blocked',
    inputs: Array.isArray(cadencePolicy.inputs) ? cadencePolicy.inputs : [],
  };
}
