/**
 * cadence.mjs - canonical pull cadences for the vault.
 *
 * This keeps daily/weekly/monthly/quarterly/yearly reporting definitions in one
 * grouped CLI path so PowerShell, dashboard actions, and future agents can call
 * the same command contract.
 */

import { spawnSync } from 'child_process';
import { join } from 'path';

const SCRIPTS_DIR = join(import.meta.dirname, '..');

export const CADENCE_DEFINITIONS = {
  daily: [
    phase('Pre-flight', [
      cmd('System status', ['system', 'status']),
    ]),
    phase('Macro and Market', [
      cmd('FRED rates', ['pull', 'fred', '--group', 'rates']),
      cmd('FRED housing', ['pull', 'fred', '--group', 'housing']),
      cmd('FRED labor', ['pull', 'fred', '--group', 'labor']),
      cmd('FMP SPY quote', ['pull', 'fmp', '--quote', 'SPY']),
      cmd('Entropy monitor', ['pull', 'entropy-monitor']),
      cmd('GDELT news monitor', ['pull', 'gdelt', '--all', '--timespan', '15min', '--limit', '75']),
      cmd('Treasury yields', ['pull', 'treasury', '--yields']),
    ]),
    phase('Government Core', [
      cmd('SEC thesis filings', ['pull', 'sec', '--thesis']),
    ]),
    phase('Thesis Tape', [
      cmd('FMP thesis watchlists', ['pull', 'fmp', '--thesis-watchlists', '--concurrency', '2', '--fundamentals-concurrency', '2']),
      cmd('Opportunity viewpoints', ['pull', 'opportunity-viewpoints', '--window', '14']),
    ]),
    phase('Scans', [
      cmd('Sector scan', ['scan', 'sectors'], { skipFlag: 'skip-sector-scan' }),
      cmd('Company risk watchlist', ['scan', 'company-risk', '--watchlist']),
      cmd('Agent thesis scan', ['pull', 'agent-analyst', '--all-thesis', '--limit', '8', '--skip-llm'], { skipFlag: 'skip-agent-scan' }),
    ]),
    phase('Post-pull', [
      cmd('Streamline report', ['pull', 'streamline-report', '--window', '14', '--limit', '16']),
      cmd('Thesis canvas', ['thesis', 'canvas']),
      cmd('Cleanup retention', ['system', 'cleanup', '--market-history', '--signals']),
      cmd('Validate vault', ['system', 'validate'], { skipFlag: 'skip-validate' }),
    ]),
  ],
  weekly: [
    phase('Pre-flight', [
      cmd('System status', ['system', 'status']),
    ]),
    phase('Government Extended', [
      cmd('OpenFEMA recent', ['pull', 'openfema', '--recent']),
      cmd('USASpending recent', ['pull', 'usaspending', '--recent']),
      cmd('FDA approvals', ['pull', 'fda', '--recent-approvals']),
    ]),
    phase('Clinical and Research', [
      cmd('ClinicalTrials oncology', ['pull', 'clinicaltrials', '--oncology']),
      cmd('ClinicalTrials AMR', ['pull', 'clinicaltrials', '--amr']),
      cmd('USPTO PTAB', ['pull', 'uspto', '--ptab']),
      cmd('arXiv drones', ['pull', 'arxiv', '--drones']),
      cmd('arXiv AMR', ['pull', 'arxiv', '--amr']),
      cmd('PubMed AMR', ['pull', 'pubmed', '--amr']),
      cmd('PubMed psychedelics', ['pull', 'pubmed', '--psychedelics']),
    ]),
    phase('Market Depth', [
      cmd('NewsAPI business', ['pull', 'newsapi', '--topic', 'business']),
      cmd('FMP watchlist deep scan', ['pull', 'fmp', '--watchlist-deep-scan', '--concurrency', '2']),
      cmd('FMP macro calendar', ['pull', 'fmp', '--macro-calendar']),
      cmd('Company risk score update', ['scan', 'company-risk', '--watchlist', '--update-score']),
      cmd('Agent thesis scan', ['pull', 'agent-analyst', '--all-thesis', '--limit', '12', '--skip-llm'], { skipFlag: 'skip-agent-scan' }),
      cmd('Agent strategy scan', ['pull', 'agent-analyst', '--all-strategies', '--limit', '12', '--skip-llm'], { skipFlag: 'skip-agent-scan' }),
      cmd('Disclosure reality scan', ['pull', 'disclosure-reality', '--all', '--limit', '25']),
      cmd('COT report', ['pull', 'cot-report']),
      cmd('Cash-flow quality', ['pull', 'cash-flow-quality']),
    ]),
    phase('Post-pull', [
      cmd('Streamline report', ['pull', 'streamline-report', '--window', '30', '--limit', '24']),
      cmd('Confluence scan', ['pull', 'confluence-scan']),
      cmd('Validate vault', ['system', 'validate'], { skipFlag: 'skip-validate' }),
    ]),
  ],
  monthly: [
    phase('Monthly Synthesis', [
      cmd('System status', ['system', 'status']),
      cmd('Conviction rollup', ['scan', 'conviction', '--window', '30']),
      cmd('Thesis catalysts', ['thesis', 'catalysts', '--all', '--window', '45']),
      cmd('Thesis full picture', ['thesis', 'full-picture', '--include-baskets']),
      cmd('Opportunity viewpoints', ['pull', 'opportunity-viewpoints', '--window', '31', '--limit', '20']),
      cmd('Streamline report', ['pull', 'streamline-report', '--window', '45', '--limit', '28']),
      cmd('Thesis graph session', ['system', 'infranodus', '--path', '10_Theses']),
      cmd('Month-end archive', ['pull', 'month-end-archive', '--month', '$MONTH']),
      cmd('Validate vault', ['system', 'validate'], { skipFlag: 'skip-validate' }),
    ]),
  ],
  quarterly: [
    phase('Quarterly Review', [
      cmd('System status', ['system', 'status']),
      cmd('Disclosure reality scan', ['pull', 'disclosure-reality', '--all', '--limit', '40']),
      cmd('Dilution monitor', ['pull', 'dilution-monitor', '--lookback', '90']),
      cmd('Cash-flow quality', ['pull', 'cash-flow-quality']),
      cmd('Opportunity viewpoints', ['pull', 'opportunity-viewpoints', '--window', '90', '--limit', '30']),
      cmd('Streamline report', ['pull', 'streamline-report', '--window', '100', '--limit', '36']),
      cmd('Thesis graph session', ['system', 'infranodus', '--path', '10_Theses']),
      cmd('Validate vault', ['system', 'validate'], { skipFlag: 'skip-validate' }),
    ]),
  ],
  yearly: [
    phase('Yearly Review', [
      cmd('System status', ['system', 'status']),
      cmd('Annual opportunity viewpoints', ['pull', 'opportunity-viewpoints', '--window', '365', '--limit', '50']),
      cmd('Streamline report', ['pull', 'streamline-report', '--window', '365', '--limit', '50']),
      cmd('Thesis graph session', ['system', 'infranodus', '--path', '10_Theses']),
      cmd('Entity graph session', ['system', 'infranodus', '--path', '08_Entities']),
      cmd('KB health', ['kb', 'health']),
      cmd('Validate vault', ['system', 'validate'], { skipFlag: 'skip-validate' }),
    ]),
  ],
};

export function listRoutineDefinitions(flags = {}) {
  return Object.keys(CADENCE_DEFINITIONS).map(cadence => getRoutinePlan(cadence, flags));
}

export function getRoutinePlan(cadence, flags = {}) {
  const definition = CADENCE_DEFINITIONS[cadence];
  if (!definition) {
    throw new Error(`Unknown routine cadence "${cadence}". Use daily, weekly, monthly, quarterly, or yearly.`);
  }

  const phases = definition.map((section, phaseIndex) => ({
    id: slugify(section.name),
    name: section.name,
    tasks: section.tasks.map((task, taskIndex) => {
      const args = resolveArgs(task.args, flags);
      const id = `${cadence}-${phaseIndex + 1}-${taskIndex + 1}-${slugify(task.label)}`;
      return {
        id,
        label: task.label,
        phase: section.name,
        phaseIndex,
        taskIndex,
        args,
        command: ['node', 'run.mjs', ...args].join(' '),
        skipFlag: task.skipFlag || null,
        agent: task.agent || inferAgent(args),
        artifactLinks: task.artifactLinks || inferArtifactLinks(args),
        critical: task.critical ?? true,
      };
    }),
  }));

  const tasks = phases.flatMap(section => section.tasks);
  return {
    id: cadence,
    cadence,
    label: titleCase(cadence),
    phases,
    tasks,
    graph: buildRoutineGraph(tasks),
  };
}

export async function run(cadence = 'help', flags = {}) {
  if (!cadence || cadence === 'help') {
    printHelp();
    return;
  }

  const definition = CADENCE_DEFINITIONS[cadence];
  if (!definition) {
    throw new Error(`Unknown routine cadence "${cadence}". Use daily, weekly, monthly, quarterly, or yearly.`);
  }

  const dryRun = Boolean(flags['dry-run']);
  const continueOnError = Boolean(flags['continue-on-error']);
  const summary = [];
  const startedAt = Date.now();

  console.log(`\nRoutine cadence: ${cadence}`);
  if (dryRun) console.log('Mode: dry-run (commands are printed only)');

  for (const section of definition) {
    console.log(`\n=== ${section.name} ===`);
    for (const task of section.tasks) {
      if (task.skipFlag && flags[task.skipFlag]) {
        summary.push({ label: task.label, status: 'skipped' });
        console.log(`  [skipped] ${task.label}`);
        continue;
      }

      const taskArgs = resolveArgs(task.args, flags);
      const printable = ['node', 'run.mjs', ...taskArgs].join(' ');
      if (dryRun) {
        summary.push({ label: task.label, status: 'dry-run', command: printable });
        console.log(`  [dry-run] ${printable}`);
        continue;
      }

      console.log(`  -> ${printable}`);
      const result = spawnSync(process.execPath, ['run.mjs', ...taskArgs], {
        cwd: SCRIPTS_DIR,
        stdio: 'inherit',
        env: { ...process.env },
      });

      const status = result.status ?? (result.error ? 1 : 0);
      if (status === 0) {
        summary.push({ label: task.label, status: 'ok' });
        continue;
      }

      const message = result.error ? result.error.message : `exit code ${status}`;
      summary.push({ label: task.label, status: 'failed', message });
      console.error(`  FAILED [${task.label}]: ${message}`);

      if (!continueOnError) {
        process.exitCode = status;
        printSummary(cadence, summary, startedAt);
        return summary;
      }
    }
  }

  printSummary(cadence, summary, startedAt);
  if (flags.json) console.log(JSON.stringify({ cadence, summary }, null, 2));
  return summary;
}

function phase(name, tasks) {
  return { name, tasks };
}

function cmd(label, args, options = {}) {
  return { label, args, ...options };
}

export function resolveArgs(args, flags) {
  return args.map(arg => (arg === '$MONTH' ? String(flags.month || previousMonth()) : arg));
}

function buildRoutineGraph(tasks) {
  return {
    nodes: tasks.map(task => ({
      id: task.id,
      label: task.label,
      phase: task.phase,
      agent: task.agent,
      artifactLinks: task.artifactLinks,
      critical: task.critical,
    })),
    edges: tasks.slice(1).map((task, index) => ({
      from: tasks[index].id,
      to: task.id,
      type: 'sequential',
    })),
  };
}

function inferAgent(args) {
  const [group, sub] = args;
  const joined = args.join(' ');
  if (group === 'system') return 'Orchestrator';
  if (group === 'kb') return 'KB Agent';
  if (group === 'thesis') return 'Research Agent';
  if (group === 'scan' && sub === 'company-risk') return 'Risk Agent';
  if (group === 'scan') return 'Research Agent';
  if (joined.includes('agent-analyst')) return 'MarketMind Agent';
  if (joined.includes('streamline-report')) return 'Orchestrator';
  if (joined.includes('disclosure-reality') || joined.includes('dilution-monitor')) return 'VC Agent';
  if (joined.includes('newsapi') || joined.includes('gdelt')) return 'News Agent';
  if (joined.includes('fmp') || joined.includes('cboe') || joined.includes('entropy-monitor')) return 'Market Agent';
  if (joined.includes('fred') || joined.includes('bea') || joined.includes('treasury') || joined.includes('eia')) return 'Macro Agent';
  if (joined.includes('clinicaltrials') || joined.includes('pubmed') || joined.includes('arxiv') || joined.includes('fda')) return 'Research Agent';
  if (joined.includes('sec') || joined.includes('openfema') || joined.includes('usaspending') || joined.includes('uspto')) return 'Government Agent';
  return 'Orchestrator';
}

function inferArtifactLinks(args) {
  const joined = args.join(' ');
  if (joined.includes('month-end-archive')) return [artifact('Monthly summary', '05_Data_Pulls/Monthly/')];
  if (joined.includes('streamline-report')) return [artifact('Streamline report', '05_Data_Pulls/Orchestrator/')];
  if (joined.includes('agent-analyst')) return [artifact('Agent pulls', '05_Data_Pulls/Agents/')];
  if (joined.includes('company-risk')) return [artifact('Company risk', '12_Company_Risk/')];
  if (joined.includes('gdelt') || joined.includes('newsapi')) return [artifact('News pulls', '05_Data_Pulls/News/')];
  if (joined.includes('fmp') || joined.includes('cboe') || joined.includes('entropy-monitor')) return [artifact('Market pulls', '05_Data_Pulls/Market/')];
  if (joined.includes('fred') || joined.includes('bea') || joined.includes('treasury') || joined.includes('eia')) return [artifact('Macro pulls', '05_Data_Pulls/Macro/')];
  if (joined.includes('sec') || joined.includes('openfema') || joined.includes('usaspending')) return [artifact('Government pulls', '05_Data_Pulls/Government/')];
  if (joined.includes('clinicaltrials') || joined.includes('pubmed') || joined.includes('arxiv') || joined.includes('fda')) return [artifact('Science pulls', '05_Data_Pulls/Science/')];
  if (joined.includes('scan sectors') || joined.includes('scan conviction')) return [artifact('Sector pulls', '05_Data_Pulls/Sectors/')];
  if (joined.includes('thesis')) return [artifact('Thesis notes', '10_Theses/')];
  if (joined.includes('kb')) return [artifact('Knowledge base', '12_Knowledge_Bases/')];
  return [];
}

function artifact(label, path) {
  return { label, path };
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'task';
}

function titleCase(value) {
  return String(value).replace(/\b\w/g, char => char.toUpperCase());
}

function printSummary(cadence, summary, startedAt) {
  const ok = summary.filter(row => row.status === 'ok').length;
  const skipped = summary.filter(row => row.status === 'skipped').length;
  const failed = summary.filter(row => row.status === 'failed').length;
  const dry = summary.filter(row => row.status === 'dry-run').length;
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\nRoutine summary: ${cadence} | ok=${ok} dry-run=${dry} skipped=${skipped} failed=${failed} | ${elapsed}s`);
}

function printHelp() {
  console.log(`
routine - Canonical pull cadences

Commands:
  daily       Macro, market, SEC, thesis watchlists, sector scan, company risk, agent thesis scan, cleanup, validate
  weekly      Extended government, clinical, research, news, deep FMP, score updates, agent strategy scan
  monthly     Conviction rollup, catalysts, full-picture reports, graph session, month-end archive
  quarterly   Disclosure reality, dilution, 90-day viewpoints, graph session
  yearly      Annual viewpoints, graph sessions, KB health, validation

Options:
  --dry-run             Print commands without running them
  --continue-on-error   Keep running after a failed task
  --skip-sector-scan    Daily only
  --skip-agent-scan     Daily/weekly
  --skip-validate       Skip final vault validation
  --json                Print machine-readable summary

Examples:
  node run.mjs routine daily --dry-run
  node run.mjs routine weekly --continue-on-error
  node run.mjs routine monthly --month 2026-04
`);
}

function previousMonth() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}
