/**
 * osint-notes.mjs — Shared utility for OSINT pullers
 *
 * Writes a companion Obsidian markdown note alongside each OSINT JSON output.
 * Required for Dataview queries to surface OSINT results in dashboards.
 *
 * Signal logic:
 *   alertCount > 0  → 'alert'   (breach, dark-web, high-severity finds)
 *   resultCount > 0 → 'watch'   (any findings present)
 *   else            → 'clear'
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, basename } from 'path';

/**
 * Write a companion .md note for an OSINT scan result.
 *
 * @param {object} opts
 * @param {string} opts.tool         - Tool name (e.g. 'amass', 'spiderfoot')
 * @param {string} opts.target       - Scanned target (domain, ticker, lat/lon)
 * @param {string} opts.targetType   - 'domain' | 'ticker' | 'coordinates' | 'user'
 * @param {number} opts.resultCount  - Total findings count
 * @param {number} opts.alertCount   - High-severity finding count (0 if not applicable)
 * @param {string} opts.outputFile   - Path to the JSON file (sibling .md will be written)
 * @param {string} opts.today        - ISO date string YYYY-MM-DD
 * @param {string[]} opts.tags       - Additional tags (e.g. ['dns', 'subdomain'])
 * @param {string}  [opts.summary]   - Optional one-line summary for the note body
 */
export function writeOsintNote({ tool, target, targetType = 'domain', resultCount, alertCount = 0, outputFile, today, tags = [], summary }) {
  const signalStatus = alertCount > 0 ? 'alert' : resultCount > 0 ? 'watch' : 'clear';
  const signals = signalStatus !== 'clear'
    ? [{ id: `OSINT_${tool.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`, severity: signalStatus, value: resultCount, message: `${resultCount} finding(s) for ${target}${alertCount > 0 ? ` — ${alertCount} high-severity` : ''}` }]
    : [];

  const mdPath = outputFile.replace(/\.json$/, '.md');
  const jsonRef = basename(outputFile);

  const allTags = ['osint', tool.replace(/[^a-z0-9]/g, '-'), targetType, signalStatus, ...tags].filter(Boolean);

  const frontmatter = [
    '---',
    `title: "OSINT ${tool}: ${target}"`,
    `source: osint-${tool}`,
    `date_pulled: "${today}"`,
    `domain: osint`,
    `data_type: osint_scan`,
    `frequency: on-demand`,
    `target: "${target}"`,
    `target_type: ${targetType}`,
    `tool: ${tool}`,
    `result_count: ${resultCount}`,
    `alert_count: ${alertCount}`,
    `signal_status: ${signalStatus}`,
    `signals:`,
    ...signals.map(s => `  - id: ${s.id}\n    severity: ${s.severity}\n    value: ${s.value}\n    message: "${s.message}"`),
    ...(signals.length === 0 ? ['  []'] : []),
    `tags: [${allTags.map(t => `"${t}"`).join(', ')}]`,
    `json_ref: "${jsonRef}"`,
    '---',
  ].join('\n');

  const body = [
    `# OSINT: ${tool} — ${target}`,
    '',
    summary ?? `Passive ${tool} scan of \`${target}\`. ${resultCount} finding(s)${alertCount > 0 ? `, ${alertCount} high-severity` : ''}.`,
    '',
    `| Field | Value |`,
    `|---|---|`,
    `| Tool | ${tool} |`,
    `| Target | ${target} |`,
    `| Scan date | ${today} |`,
    `| Results | ${resultCount} |`,
    ...(alertCount > 0 ? [`| High-severity | ${alertCount} |`] : []),
    `| JSON output | \`${jsonRef}\` |`,
  ].join('\n');

  const dir = dirname(mdPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(mdPath, `${frontmatter}\n\n${body}\n`, 'utf8');
}
