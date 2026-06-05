/**
 * policy/index.mjs
 *
 * Purpose: Dispatch runner for policy scripts by cadence
 *
 * Usage:
 *   node index.mjs --daily     # Run pull-congress-bills, pull-federal-register, pull-openstates-bills
 *   node index.mjs --weekly    # Run pull-govtrack-prognosis
 *
 * Returns: Combined results
 */

import { pullCongressBills } from './pull-congress-bills.mjs';
import { pullFederalRegister } from './pull-federal-register.mjs';
import { pullOpenStatesBills } from './pull-openstates-bills.mjs';
import { pullGovtrackPrognosis } from './pull-govtrack-prognosis.mjs';

async function dispatch(cadence) {
  console.log(`[Policy Runner] Executing cadence: ${cadence}`);

  const results = {
    cadence,
    timestamp: new Date().toISOString(),
    tasks: []
  };

  if (cadence === 'daily') {
    console.log('[Policy Runner] Running daily tasks...');
    results.tasks.push(await pullCongressBills());
    results.tasks.push(await pullFederalRegister());
    results.tasks.push(await pullOpenStatesBills());
  }

  if (cadence === 'weekly') {
    console.log('[Policy Runner] Running weekly tasks...');
    results.tasks.push(await pullGovtrackPrognosis());
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cadence = process.argv[2]?.replace('--', '') || 'daily';
  dispatch(cadence).then(r => console.log(JSON.stringify(r, null, 2)));
}

export { dispatch };
