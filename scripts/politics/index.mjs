/**
 * politics/index.mjs
 *
 * Purpose: Dispatch runner for politics scripts by cadence
 *
 * Usage:
 *   node index.mjs --daily       # Run pull-fec-deltas, pull-opensecrets-recent (if weekly cycle)
 *   node index.mjs --weekly      # Run pull-opensecrets-recent, detect-shell-anomalies
 *   node index.mjs --quarterly   # Run pull-senate-lda-quarterly
 *
 * Returns: Combined results
 */

import { pullFecDeltas } from './pull-fec-deltas.mjs';
import { pullOpenSecretsRecent } from './pull-opensecrets-recent.mjs';
import { pullSenateLdaQuarterly } from './pull-senate-lda-quarterly.mjs';
import { detectShellAnomalies } from './detect-shell-anomalies.mjs';

async function dispatch(cadence) {
  console.log(`[Politics Runner] Executing cadence: ${cadence}`);

  const results = {
    cadence,
    timestamp: new Date().toISOString(),
    tasks: []
  };

  if (cadence === 'daily') {
    console.log('[Politics Runner] Running daily tasks...');
    results.tasks.push(await pullFecDeltas());
  }

  if (cadence === 'weekly') {
    console.log('[Politics Runner] Running weekly tasks...');
    results.tasks.push(await pullOpenSecretsRecent());
    results.tasks.push(await detectShellAnomalies());
  }

  if (cadence === 'quarterly') {
    console.log('[Politics Runner] Running quarterly tasks...');
    results.tasks.push(await pullSenateLdaQuarterly());
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cadence = process.argv[2]?.replace('--', '') || 'daily';
  dispatch(cadence).then(r => console.log(JSON.stringify(r, null, 2)));
}

export { dispatch };
