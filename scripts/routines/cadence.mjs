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
  premarket: [
    phase('Pre-flight', [
      cmd('System status', ['system', 'status']),
    ]),
    phase('Overnight Macro', [
      cmd('FRED rates', ['pull', 'fred', '--group', 'rates']),
      cmd('FRED inflation', ['pull', 'fred', '--group', 'inflation']),
      cmd('FRED liquidity', ['pull', 'fred', '--group', 'liquidity']),
      cmd('FRED credit', ['pull', 'fred', '--group', 'credit']),
      cmd('Treasury yields', ['pull', 'treasury', '--yields']),
      cmd('FMP macro calendar', ['pull', 'fmp', '--macro-calendar']),
      cmd('FMP earnings calendar', ['pull', 'fmp', '--earnings-calendar']),
    ]),
    phase('Overnight Tape', [
      cmd('FMP futures + index quotes', ['pull', 'fmp', '--quote', 'SPY,QQQ,IWM,DIA,TLT,HYG,LQD,GLD,SLV,USO,UUP,VXX']),
      cmd('FMP general news', ['pull', 'fmp', '--general-news', '--limit', '40']),
      cmd('Yahoo vol indices', ['pull', 'yfinance-vol', '--indices', 'vix,vvix,move,skew,gvz,ovx,vxn,rvx,vix9d,vix3m', '--interval', '1d', '--period', '5d']),
      cmd('Yahoo IV term structure', ['pull', 'yfinance-vol', '--indices', 'vix', '--term-structure', 'SPY,QQQ', '--expirations', '0,1,2,4,8']),
    ]),
    phase('My_Data Reports', [
      cmd('Market cycle status', ['pull', 'market-cycle-monitor']),
      cmd('Signal intelligence', ['pull', 'signal-intelligence']),
      cmd('My_Data premarket reports', ['pull', 'my-data-report-flow', '--documents', 'premarket-monitoring,daily-briefing,source-register,strategy-register']),
    ]),
  ],
  daily: [
    phase('Pre-flight', [
      cmd('System status', ['system', 'status']),
    ]),
    phase('Macro and Market', [
      cmd('FRED rates', ['pull', 'fred', '--group', 'rates']),
      cmd('FRED housing', ['pull', 'fred', '--group', 'housing']),
      cmd('FRED labor', ['pull', 'fred', '--group', 'labor']),
      cmd('FRED inflation', ['pull', 'fred', '--group', 'inflation']),
      cmd('FRED liquidity', ['pull', 'fred', '--group', 'liquidity']),
      cmd('FMP SPY quote', ['pull', 'fmp', '--quote', 'SPY,QQQ,IWM,TLT,HYG,GLD,USO']),
      cmd('FMP market performance', ['pull', 'fmp', '--market-performance', '--limit', '20']),
      cmd('FMP general news', ['pull', 'fmp', '--general-news', '--limit', '50']),
      cmd('Entropy monitor', ['pull', 'entropy-monitor']),
      cmd('Yahoo vol indices', ['pull', 'yfinance-vol', '--indices', 'vix,vvix,move,skew,gvz,ovx,vxn,rvx,vix9d,vix3m', '--interval', '1d', '--period', '5d']),
      cmd('Treasury yields', ['pull', 'treasury', '--yields']),
    ]),
    phase('Government Core', [
      cmd('SEC thesis filings', ['pull', 'sec', '--thesis']),
    ]),
    phase('Thesis Tape', [
      cmd('FMP thesis watchlists', ['pull', 'fmp', '--thesis-watchlists', '--concurrency', '2', '--fundamentals-concurrency', '2', '--skip-technical']),
      cmd('Opportunity viewpoints', ['pull', 'opportunity-viewpoints', '--window', '14']),
    ]),
    phase('Scans', [
      cmd('Sector scan', ['scan', 'sectors'], { skipFlag: 'skip-sector-scan' }),
      cmd('Agent thesis scan', ['pull', 'agent-analyst', '--all-thesis', '--limit', '8', '--skip-llm'], { skipFlag: 'skip-agent-scan' }),
    ]),
    phase('Post-pull', [
      cmd('Source watch updated posts', ['pull', 'source-watch', '--limit', '35', '--lookback-days', '90']),
      cmd('Market cycle status', ['pull', 'market-cycle-monitor']),
      cmd('Signal intelligence', ['pull', 'signal-intelligence']),
      cmd('Streamline report', ['pull', 'streamline-report', '--window', '14', '--limit', '16']),
      cmd('My_Data daily reports', ['pull', 'my-data-report-flow', '--documents', 'daily-monitoring,daily-briefing,source-register,strategy-register']),
      cmd('Knowledge-gap tasks (Inbox)', ['pull', 'knowledge-gap-tasks'], { nonFatal: true, skipFlag: 'skip-knowledge-gap-tasks' }),
      cmd('Thesis canvas', ['thesis', 'canvas']),
      cmd('Cleanup retention', ['system', 'cleanup', '--market-history', '--signals']),
      cmd('Validate vault', ['system', 'validate'], { skipFlag: 'skip-validate' }),
    ]),
  ],
  midday: [
    phase('Midday Tape', [
      cmd('System status', ['system', 'status']),
      cmd('FMP index quote basket', ['pull', 'fmp', '--quote', 'SPY,QQQ,IWM,TLT,HYG,GLD,USO,VXX']),
      cmd('FMP market performance', ['pull', 'fmp', '--market-performance', '--limit', '20']),
      cmd('FMP general news', ['pull', 'fmp', '--general-news', '--limit', '25']),
      cmd('Yahoo vol intraday', ['pull', 'yfinance-vol', '--indices', 'vix,vvix,move,skew,vix9d,vix3m', '--interval', '5m', '--period', '1d']),
      cmd('Yahoo P/C ratio', ['pull', 'yfinance-vol', '--indices', 'vix', '--pcr', 'SPY,QQQ', '--expirations', '0,1,2']),
      cmd('Entropy monitor', ['pull', 'entropy-monitor']),
    ]),
    phase('My_Data Reports', [
      cmd('Market cycle status', ['pull', 'market-cycle-monitor']),
      cmd('Signal intelligence', ['pull', 'signal-intelligence']),
      cmd('My_Data midday report', ['pull', 'my-data-report-flow', '--documents', 'midday-monitoring']),
    ]),
  ],
  preclose: [
    phase('Pre-close Tape', [
      cmd('System status', ['system', 'status']),
      cmd('FMP index quote basket', ['pull', 'fmp', '--quote', 'SPY,QQQ,IWM,DIA,TLT,HYG,LQD,GLD,SLV,USO,VXX']),
      cmd('FMP market performance', ['pull', 'fmp', '--market-performance', '--limit', '25']),
      cmd('FMP general news', ['pull', 'fmp', '--general-news', '--limit', '25']),
      cmd('Yahoo vol last hour', ['pull', 'yfinance-vol', '--indices', 'vix,vvix,move,skew,vix9d,vix3m', '--interval', '5m', '--period', '1d']),
      cmd('Yahoo end-of-day P/C', ['pull', 'yfinance-vol', '--indices', 'vix', '--pcr', 'SPY,QQQ,IWM', '--expirations', '0,1,2,4']),
    ]),
    phase('My_Data Reports', [
      cmd('Market cycle status', ['pull', 'market-cycle-monitor']),
      cmd('Signal intelligence', ['pull', 'signal-intelligence']),
      cmd('My_Data preclose report', ['pull', 'my-data-report-flow', '--documents', 'preclose-monitoring']),
    ]),
  ],
  endofday: [
    phase('End-of-Day Tape', [
      cmd('System status', ['system', 'status']),
      cmd('FMP index quote basket', ['pull', 'fmp', '--quote', 'SPY,QQQ,IWM,TLT,HYG,GLD,USO,VXX']),
      cmd('FMP market performance', ['pull', 'fmp', '--market-performance', '--limit', '25']),
      cmd('FMP general news', ['pull', 'fmp', '--general-news', '--limit', '40']),
      cmd('FMP macro calendar', ['pull', 'fmp', '--macro-calendar']),
      cmd('FMP earnings calendar', ['pull', 'fmp', '--earnings-calendar']),
      cmd('Yahoo vol close', ['pull', 'yfinance-vol', '--indices', 'vix,vvix,move,skew,gvz,ovx,vxn,rvx,vix9d,vix3m,vix6m', '--interval', '1d', '--period', '5d']),
      cmd('Yahoo full P/C + term structure', ['pull', 'yfinance-vol', '--pcr', 'SPY,QQQ,IWM', '--term-structure', 'SPY,QQQ', '--expirations', '0,1,2,4,8,12']),
      cmd('FMP insider activity', ['pull', 'fmp', '--insider', '--lookback', '1'], { dow: ['mon', 'tue', 'wed', 'thu', 'fri'] }),
      cmd('Opportunity viewpoints', ['pull', 'opportunity-viewpoints', '--window', '14']),
    ]),
    phase('My_Data Reports', [
      cmd('Market cycle status', ['pull', 'market-cycle-monitor']),
      cmd('Signal intelligence', ['pull', 'signal-intelligence']),
      cmd('My_Data EOD reports', ['pull', 'my-data-report-flow', '--documents', 'eod-monitoring,eod-briefing,source-register,strategy-register']),
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
      cmd('Semantic Scholar market-cycle queue', ['pull', 'semantic-scholar', '--queue', 'market-cycle', '--max-topics', '6', '--limit', '5']),
      cmd('Semantic Scholar strategy queue', ['pull', 'semantic-scholar', '--queue', 'strategies', '--max-topics', '5', '--limit', '5']),
      cmd('Source watch broad sweep', ['pull', 'source-watch', '--limit', '120', '--lookback-days', '90']),
      cmd('Agent thesis scan', ['pull', 'agent-analyst', '--all-thesis', '--limit', '12', '--skip-llm'], { skipFlag: 'skip-agent-scan' }),
      cmd('Agent strategy scan', ['pull', 'agent-analyst', '--all-strategies', '--limit', '12', '--skip-llm'], { skipFlag: 'skip-agent-scan' }),
      cmd('Disclosure reality scan', ['pull', 'disclosure-reality', '--all', '--limit', '25']),
      cmd('Cash-flow quality', ['pull', 'cash-flow-quality']),
    ]),
    phase('Post-pull', [
      cmd('Signal intelligence', ['pull', 'signal-intelligence']),
      cmd('Weekly research scout', ['pull', 'weekly-research-scout', '--window', '14']),
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
      cmd('Signal intelligence', ['pull', 'signal-intelligence']),
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
    throw new Error(`Unknown routine cadence "${cadence}". Use premarket, daily, midday, preclose, endofday, weekly, monthly, quarterly, or yearly.`);
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
        dow: task.dow || null,
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
    throw new Error(`Unknown routine cadence "${cadence}". Use premarket, daily, midday, preclose, endofday, weekly, monthly, quarterly, or yearly.`);
  }

  const dryRun = Boolean(flags['dry-run']);
  const continueOnError = Boolean(flags['continue-on-error']);
  const summary = [];
  const startedAt = Date.now();

  console.log(`\nRoutine cadence: ${cadence}`);
  if (dryRun) console.log('Mode: dry-run (commands are printed only)');

  const todayDow = currentDow(flagValue(flags, 'as-dow'));
  const ignoreDow = Boolean(flags['ignore-dow']);

  for (const section of definition) {
    console.log(`\n=== ${section.name} ===`);
    for (const task of section.tasks) {
      if (task.skipFlag && flags[task.skipFlag]) {
        summary.push({ label: task.label, status: 'skipped' });
        console.log(`  [skipped] ${task.label}`);
        continue;
      }
      if (!ignoreDow && task.dow && Array.isArray(task.dow) && !task.dow.includes(todayDow)) {
        summary.push({ label: task.label, status: 'skipped-dow', dow: task.dow });
        console.log(`  [skip-dow ${todayDow}] ${task.label} (runs on ${task.dow.join(',')})`);
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
      summary.push({ label: task.label, status: task.nonFatal ? 'failed-nonfatal' : 'failed', message });
      console.error(`  ${task.nonFatal ? 'WARN' : 'FAILED'} [${task.label}]: ${message}`);

      if (task.nonFatal) {
        continue;
      }

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
  if (joined.includes('market-cycle-monitor') || joined.includes('my-data-report-flow') || joined.includes('research-spine-flow') || joined.includes('signal-intelligence')) return 'Report Agent';
  if (joined.includes('weekly-research-scout')) return 'Research Agent';
  if (joined.includes('streamline-report')) return 'Orchestrator';
  if (joined.includes('source-watch')) return 'Research Agent';
  if (joined.includes('disclosure-reality') || joined.includes('dilution-monitor')) return 'VC Agent';
  if (joined.includes('newsapi') || joined.includes('gdelt') || joined.includes('alpha-vantage')) return 'News Agent';
  if (joined.includes('fmp') || joined.includes('cboe') || joined.includes('entropy-monitor') || joined.includes('yfinance-vol')) return 'Market Agent';
  if (joined.includes('fred') || joined.includes('bea') || joined.includes('treasury') || joined.includes('eia')) return 'Macro Agent';
  if (joined.includes('clinicaltrials') || joined.includes('pubmed') || joined.includes('arxiv') || joined.includes('fda') || joined.includes('semantic-scholar')) return 'Research Agent';
  if (joined.includes('sec') || joined.includes('openfema') || joined.includes('usaspending') || joined.includes('uspto')) return 'Government Agent';
  return 'Orchestrator';
}

function inferArtifactLinks(args) {
  const joined = args.join(' ');
  if (joined.includes('month-end-archive')) return [artifact('Monthly summary', '05_Data_Pulls/Monthly/')];
  if (joined.includes('market-cycle-monitor')) return [artifact('Market cycle status', 'Reports/Freshness/Market_Cycles/')];
  if (joined.includes('signal-intelligence')) return [artifact('Signal intelligence', '05_Data_Pulls/Signals/')];
  if (joined.includes('weekly-research-scout')) return [artifact('Weekly research scout', '05_Data_Pulls/Theses/')];
  if (joined.includes('my-data-report-flow') || joined.includes('research-spine-flow')) return [artifact('My_Data reports', 'Reports/')];
  if (joined.includes('streamline-report')) return [artifact('Streamline report', '05_Data_Pulls/Orchestrator/')];
  if (joined.includes('source-watch')) return [artifact('Source watch pulls', '05_Data_Pulls/SourceWatch/')];
  if (joined.includes('agent-analyst')) return [artifact('Agent pulls', '05_Data_Pulls/Agents/')];
  if (joined.includes('company-risk')) return [artifact('Company risk', '12_Company_Risk/')];
  if (joined.includes('gdelt') || joined.includes('newsapi')) return [artifact('News pulls', '05_Data_Pulls/News/')];
  if (joined.includes('fmp') || joined.includes('cboe') || joined.includes('entropy-monitor') || joined.includes('yfinance-vol')) return [artifact('Market pulls', '05_Data_Pulls/Market/')];
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
  premarket   Overnight macro/news + Yahoo vol context, premarket My_Data reports (run ~07:00 ET)
  daily       Open-bell macro/market, SEC, thesis watchlists, sector scan, daily My_Data reports (run ~09:45 ET)
  midday      Intraday tape, FMP news, Yahoo vol intraday + P/C, midday My_Data reports (run ~12:30 ET)
  preclose    Pre-close index basket, Yahoo vol last hour, EOD P/C term structure (run ~15:30 ET)
  endofday    Closing tape, macro/earnings calendar, full P/C + COT (Fri), EOD My_Data reports (run ~16:30 ET)
  weekly      Extended government, clinical, research, news, deep FMP, Semantic Scholar, agent strategy scan
  monthly     Conviction rollup, catalysts, full-picture reports, graph session, month-end archive
  quarterly   Disclosure reality, dilution, 90-day viewpoints, graph session
  yearly      Annual viewpoints, graph sessions, KB health, validation

Options:
  --dry-run             Print commands without running them
  --continue-on-error   Keep running after a failed task
  --skip-sector-scan    Daily only
  --skip-agent-scan     Daily/weekly
  --skip-validate       Skip final vault validation
  --ignore-dow          Run all tasks regardless of day-of-week filter
  --as-dow=mon|tue|...  Override "today" for day-of-week task filtering (testing)
  --json                Print machine-readable summary

Day-of-week tasks:
  Some endofday tasks gate on weekday: COT report runs Fridays only; insider activity Mon-Fri.
  Use --ignore-dow to force-run all, or --as-dow=fri to test Friday behavior on any day.

Examples:
  node run.mjs routine premarket --dry-run
  node run.mjs routine daily --dry-run
  node run.mjs routine midday --dry-run
  node run.mjs routine preclose --dry-run
  node run.mjs routine endofday --dry-run
  node run.mjs routine endofday --as-dow=fri --dry-run
  node run.mjs routine weekly --continue-on-error
  node run.mjs routine monthly --month 2026-04
`);
}

function previousMonth() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}

const DOW_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function flagValue(flags, name) {
  if (Object.prototype.hasOwnProperty.call(flags, name)) return flags[name];
  const prefix = `${name}=`;
  const matched = Object.keys(flags).find(key => key.startsWith(prefix));
  return matched ? matched.slice(prefix.length) : undefined;
}

function currentDow(override) {
  if (typeof override === 'string' && override.trim()) {
    const norm = override.trim().toLowerCase().slice(0, 3);
    if (DOW_NAMES.includes(norm)) return norm;
  }
  return DOW_NAMES[new Date().getDay()];
}
