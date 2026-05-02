/**
 * month-end-cleanup.mjs - compatibility wrapper for monthly reporting.
 *
 * The old system command moved notes into 05_Data_Pulls/_archive, which made
 * active validation and dashboards fight archived history. Keep the public
 * `system month-end` command, but delegate to the non-destructive monthly
 * archive report that copies records into the KB raw archive and leaves source
 * pull notes in place.
 */

import { pull as runMonthEndArchive } from '../pullers/month-end-archive.mjs';

export async function run(flags = {}) {
  const month = flags.month || previousMonth();

  if (flags['skip-archive'] || flags['skip-summary']) {
    console.warn('system month-end is now non-destructive and delegates to pull month-end-archive.');
    console.warn('The legacy --skip-archive and --skip-summary flags are ignored.');
  }

  return runMonthEndArchive({
    ...flags,
    month,
  });
}

function previousMonth() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}
