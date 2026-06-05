/**
 * signals/utils.mjs — Signal aggregation and formatting utilities
 *
 * Provides helpers consumed by all 13 importers: severity ranking and
 * markdown rendering of signal arrays.
 */

/**
 * Determine the highest severity from an array of signals.
 * @param {import('./base.mjs').Signal[]} signals
 * @returns {string} — 'clear' | 'watch' | 'alert' | 'critical'
 */
export function highestSeverity(signals) {
  if (!signals || signals.length === 0) return 'clear';
  const order = { critical: 3, alert: 2, watch: 1 };
  const max = signals.reduce((highest, s) => {
    return (order[s.severity] || 0) > (order[highest] || 0) ? s.severity : highest;
  }, 'clear');
  return max;
}

/**
 * Format signals for inclusion in a markdown note.
 * @param {import('./base.mjs').Signal[]} signals
 * @returns {string} — markdown content
 */
export function formatSignalsSection(signals) {
  if (!signals || signals.length === 0) {
    return '**Signal Status**: ⚪ Clear — no thresholds crossed.\n';
  }

  const severityIcon = { critical: '🔴', alert: '🟠', watch: '🟡' };
  const lines = [];

  for (const s of signals) {
    const icon = severityIcon[s.severity] || '⚪';
    lines.push(`### ${icon} ${s.name} (${s.severity.toUpperCase()})`);
    lines.push('');
    lines.push(s.message);
    lines.push('');
    lines.push('**Implications:**');
    for (const imp of (s.implications ?? [])) {
      lines.push(`- ${imp}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
