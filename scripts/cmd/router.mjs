/**
 * router.mjs â€” Grouped command dispatcher
 *
 * Handles the new command grammar:
 *   node run.mjs <group> <subcommand> [options]
 *
 * Groups: system | learn | scan | thesis | pull | playbook | routine | cadence | kb | bridge
 *
 * Each handler delegates to the existing module â€” no logic is duplicated.
 * The router is purely a dispatch layer.
 */

const KNOWN_GROUPS = ['system', 'learn', 'scan', 'thesis', 'pull', 'playbook', 'routine', 'cadence', 'kb', 'bridge'];

/**
 * Returns true if the first argument looks like a group name.
 * Used by run.mjs to decide between new grouped grammar and legacy flat commands.
 */
export function isGroupCommand(command) {
  return KNOWN_GROUPS.includes(command);
}

/**
 * Main grouped dispatcher.
 *
 * @param {string} group       â€” e.g. 'scan'
 * @param {string} subcommand  â€” e.g. 'sectors'
 * @param {string[]} args      â€” raw remaining args
 * @param {Record<string,unknown>} flags â€” parsed flags
 */
export async function routeGrouped(group, subcommand, args, flags) {
  switch (group) {
    case 'system':  return routeSystem(subcommand, args, flags);
    case 'learn':   return routeLearn(subcommand, args, flags);
    case 'scan':    return routeScan(subcommand, args, flags);
    case 'thesis':  return routeThesis(subcommand, args, flags);
    case 'pull':    return routePull(subcommand, args, flags);
    case 'playbook':return routePlaybook(subcommand, args, flags);
    case 'routine': return routeRoutine(subcommand, args, flags);
    case 'cadence': return routeCadence(subcommand, args, flags);
    case 'kb':      return routeKb(subcommand, args, flags);
    case 'bridge':  return routeBridge(subcommand, args, flags);
    default:
      console.error(`Error: Unknown group "${group}". Run "node run.mjs help" for available groups.`);
      process.exit(1);
  }
}

// â”€â”€ system â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function routeSystem(sub, _args, flags) {
  switch (sub) {
    case 'status': {
      const { listSources } = await import('../lib/config.mjs');
      const sources = listSources();
      console.log('\nðŸ“Š API Key Status\n');
      const maxName = Math.max(...sources.map(s => s.name.length));
      for (const s of sources) {
        const status = s.requiresKey
          ? (s.hasKey ? 'âœ… Configured' : 'âŒ Missing')
          : 'âšª No key needed';
        console.log(`  ${s.name.padEnd(maxName + 2)} ${status}`);
      }
      const configured = sources.filter(s => s.hasKey).length;
      console.log(`\n  ${configured}/${sources.length} sources ready\n`);
      return;
    }
    case 'validate': {
      const m = await import('../validate-vault.mjs');
      return m.run();
    }
    case 'readiness': {
      const m = await import('../system/readiness.mjs');
      return m.run(flags);
    }
    case 'dashboard': {
      console.error('The local web dashboard has been retired. Use the Obsidian dashboards in 00_Dashboard/ instead.');
      process.exit(1);
    }
    case 'cleanup': {
      const m = await import('../cleanup.mjs');
      return m.run(flags);
    }
    case 'prune': {
      const m = await import('../system/prune.mjs');
      return m.run(flags);
    }
    case 'infranodus': {
      const m = await import('../infranodus.mjs');
      return m.run(flags);
    }
    case 'month-end': {
      const m = await import('../system/month-end-cleanup.mjs');
      return m.run(flags);
    }
    case 'coverage-audit': {
      const m = await import('../system/coverage-audit.mjs');
      return m.run(flags);
    }
    case 'audit-research-spine': {
      // The script reads process.argv directly for --no-inbox; no flags wrapper needed.
      await import('../system/audit-research-spine.mjs');
      return;
    }
    case 'kb-audit': {
      // kb-audit.mjs runs as a top-level script (no exported run()); just import to execute.
      await import('../system/kb-audit.mjs');
      return;
    }
    case 'dashboard-manifest': {
      const m = await import('../system/dashboard-manifest.mjs');
      return m.run({
        ...flags,
        _subcommand: _args.find(a => !a.startsWith('--')) || 'generate',
      });
    }
    case 'source-gap-register': {
      const { run } = await import('../system/source-gap-register.mjs');
      return run(flags);
    }
    default:
      printGroupHelp('system');
      process.exit(1);
  }
}

// â”€â”€ learn â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Learning scripts now live in Dr_Magnifico vault.
// LEARNING_VAULT_ROOT env var (set in .env) resolves the path at runtime.

import { pathToFileURL } from 'url';
import { join, resolve } from 'path';
import { getLearningVaultRoot } from '../lib/config.mjs';

function learnScript(rel) {
  return pathToFileURL(join(getLearningVaultRoot(), 'scripts', rel)).href;
}

async function routeLearn(sub, _args, flags) {
  switch (sub) {
    case 'session': {
      const m = await import(learnScript('learning-session.mjs'));
      return m.run(flags);
    }
    case 'web': {
      const { startServer } = await import(learnScript('learning-web/server.mjs'));
      const port = parseInt(process.env.LEARN_PORT ?? '4747', 10);
      startServer(port);
      // Block resolution so run.mjs never reaches process.exit().
      // The HTTP server keeps the event loop alive until Ctrl+C.
      await new Promise(() => {});
      return;
    }
    case 'canvas': {
      const m = await import(learnScript('pullers/learning-canvas.mjs'));
      return m.run(flags);
    }
    default:
      printGroupHelp('learn');
      process.exit(1);
  }
}

// â”€â”€ scan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Table-driven OSINT dispatch. Note: snscrape.mjs has no "osint-" filename prefix.
const OSINT_PULLERS = {
  'osint-spiderfoot': '../pullers/osint-spiderfoot.mjs',
  'osint-harvester':  '../pullers/osint-harvester.mjs',
  'osint-amass':      '../pullers/osint-amass.mjs',
  'osint-recon':      '../pullers/osint-recon.mjs',
  'osint-telegram':   '../pullers/osint-telegram.mjs',
  'osint-leaker':     '../pullers/osint-leaker.mjs',
  'osint-octosuite':  '../pullers/osint-octosuite.mjs',
  'osint-merklemap':  '../pullers/osint-merklemap.mjs',
  'osint-columbus':   '../pullers/osint-columbus.mjs',
  'osint-snscrape':   '../pullers/snscrape.mjs',
  'osint-umbra':      '../pullers/osint-umbra.mjs',
  'osint-osmsearch':  '../pullers/osint-osmsearch.mjs',
};

async function routeScan(sub, _args, flags) {
  switch (sub) {
    case 'sectors': {
      const m = await import('../pullers/sector-scan.mjs');
      return m.pull(flags);
    }
    case 'company-risk': {
      const m = await import('../pullers/company-risk-scan.mjs');
      return m.pull(flags);
    }
    case 'conviction': {
      const m = await import('../lib/conviction-tracker.mjs');
      const result = await m.run(flags);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      return result;
    }
    default: {
      const osintPath = OSINT_PULLERS[sub];
      if (osintPath) {
        const m = await import(osintPath);
        return m.pull(flags);
      }
      printGroupHelp('scan');
      process.exit(1);
    }
  }
}

// â”€â”€ thesis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function routeThesis(sub, _args, flags) {
  switch (sub) {
    case 'sync': {
      const m = await import('../sync-thesis-fmp.mjs');
      return m.run(flags);
    }
    case 'catalysts': {
      const m = await import('../thesis-catalysts.mjs');
      return m.run(flags);
    }
    case 'full-picture': {
      const m = await import('../thesis-full-picture.mjs');
      return m.run(flags);
    }
    case 'canvas': {
      const m = await import('../pullers/thesis-canvas.mjs');
      return m.run(flags);
    }
    default:
      printGroupHelp('thesis');
      process.exit(1);
  }
}

// â”€â”€ pull â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function routePull(sub, _args, flags) {
  if (!sub) {
    printGroupHelp('pull');
    process.exit(1);
  }
  let puller;
  try {
    puller = await import(`../pullers/${sub}.mjs`);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      console.error(`Error: Unknown puller "${sub}". Run "node run.mjs pull --help" for available pullers.`);
      process.exit(1);
    }
    throw err;
  }
  return puller.pull(flags);
}

// â”€â”€ playbook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function routePlaybook(sub, args, flags) {
  const name = sub || flags.name || args.find(a => !a.startsWith('--'));
  if (!name) {
    printGroupHelp('playbook');
    process.exit(1);
  }
  let playbook;
  try {
    playbook = await import(`../playbooks/${name}.mjs`);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      console.error(`Error: Unknown playbook "${name}".`);
      process.exit(1);
    }
    throw err;
  }
  return playbook.run(flags);
}

async function routeRoutine(sub, _args, flags) {
  const m = await import('../routines/cadence.mjs');
  return m.run(sub || 'help', flags);
}

async function routeCadence(sub, args, flags) {
  const m = await import('../system/cadence-runner.mjs');
  const cadenceName = args.find(a => !a.startsWith('--'));
  return m.run(sub || 'help', cadenceName, flags);
}

// â”€â”€ kb â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function routeKb(sub, _args, flags) {
  const ACTION_MAP = {
    ingest:     '../kb/kb-ingest.mjs',
    normalize:  '../kb/kb-normalize.mjs',
    classify:   '../kb/kb-classify.mjs',
    compile:    '../kb/kb-compile.mjs',
    query:      '../kb/kb-query.mjs',
    librarian:  '../kb/kb-librarian.mjs',
    health:     '../kb/kb-health.mjs',
    transcribe: '../kb/kb-transcribe.mjs',
    suggest:    '../kb/kb-suggest.mjs',
    dispatch:   '../kb/kb-dispatch.mjs',
  };

  if (!sub || sub === 'help') {
    printGroupHelp('kb');
    return;
  }

  const { join } = await import('path');
  const { pathToFileURL } = await import('url');
  const relPath = ACTION_MAP[sub];
  if (!relPath) {
    console.error(`Error: Unknown kb subcommand "${sub}".`);
    console.error(`Valid subcommands: ${Object.keys(ACTION_MAP).join(', ')}`);
    process.exit(1);
  }

  const modulePath = join(import.meta.dirname, relPath);
  const m = await import(pathToFileURL(modulePath).href);
  return m.run(flags);
}

// â”€â”€ bridge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function routeBridge(sub, _args, flags) {
  switch (sub) {
    case 'approve-queue': {
      const { join } = await import('path');
      const { pathToFileURL } = await import('url');
      const modulePath = join(import.meta.dirname, '../bridge/approve-queue.mjs');
      const m = await import(pathToFileURL(modulePath).href);
      return m.run(flags);
    }
    case 'world-machine-pull': {
      const { run } = await import('../bridge/world-machine-pull.mjs');
      return run(flags);
    }
    case 'my-data-report-pull': {
      const { run } = await import('../bridge/my-data-report-pull.mjs');
      return run(flags);
    }
    case 'daily': {
      const { run } = await import('../bridge/daily.mjs');
      return run(flags);
    }
    case 'ingest-world-inbox': {
      const { run } = await import('../bridge/ingest-world-inbox.mjs');
      return run(flags);
    }
    case 'eod-digest': {
      const { run } = await import('../bridge/eod-digest.mjs');
      return run(flags);
    }
    case 'market-positioning-ledger': {
      const { run } = await import('../bridge/market-positioning-ledger.mjs');
      return run(flags);
    }
    case 'consolidate-world-machine': {
      const { run } = await import('../bridge/consolidate-world-machine.mjs');
      return run(flags);
    }
    default:
      if (!sub || sub === 'help') { printGroupHelp('bridge'); return; }
      console.error(`Error: Unknown bridge subcommand "${sub}". Valid: approve-queue, my-data-report-pull, world-machine-pull, daily, ingest-world-inbox, eod-digest, market-positioning-ledger, consolidate-world-machine`);
      process.exit(1);
  }
}

// â”€â”€ group help â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function printGroupHelp(group) {
  const help = {
    system: `
system â€” System utilities

Commands:
  status       Show API key configuration status
  validate     Check vault note schemas and pull-note layout
  readiness    Check data freshness before report generation
                 --cadence <daily|premarket|midday|preclose|eod>
                 --json
                 --stale-ok | --allow-stale
  cleanup      Prune generated pull-note history
                 --market-history   Prune market history notes
                 --keep-daily <n>   (default: 1)
                 --keep-quotes <n>  (default: 2)
                 --dry-run
  infranodus   Run an InfraNodus graph measurement session
                 --path <scope>     Folder or note, e.g. 10_Theses
                 --question <text>  Optional framing question
  month-end    Build monthly summary + copy pull notes into KB raw archive
                 --month YYYY-MM    Target month (default: previous month)
                 --dry-run          Preview without copying or writing files
  coverage-audit Verify triple-link integrity: sourcesâ†”pullersâ†”dashboards
                 Writes 99_System/inventory/coverage-audit-YYYYMMDD.md
  kb-audit       Parity audit between raw/ mirrors and canonical KB (KB_VAULT_ROOT).
                 When KB_VAULT_ROOT is unset, only internal raw/ consistency is checked.
                 Writes 99_System/inventory/kb-audit-YYYYMMDD.md
  audit-research-spine
                 Audit The Research Spine and optionally append findings to Inbox.md
                 --no-inbox         Skip Inbox.md task writes
                 --dry-run          Scan and print summary without writing report or Inbox
  dashboard-manifest
                 Generate 00_Dashboard/.manifest.json from Dataview FROM clauses
                 --dry-run          Scan only, do not write the manifest

Examples:
  node run.mjs system status
  node run.mjs system validate
  node run.mjs system readiness --cadence eod
  node run.mjs system cleanup --market-history --dry-run
  node run.mjs system month-end --dry-run
  node run.mjs system month-end --month 2026-04
  node run.mjs system coverage-audit
  node run.mjs system kb-audit
  node run.mjs system audit-research-spine --dry-run --no-inbox
  node run.mjs system dashboard-manifest generate --dry-run
  KB_VAULT_ROOT=/path/to/Oy node run.mjs system kb-audit
`,
    learn: `
learn â€” Learning system

Commands:
  session      Scaffold the daily learning workflow notes
  web          Start the learning web app at http://localhost:4747

session options:
  --date YYYY-MM-DD   Session date (default: today)
  --candidate <n>     Pick one discovery topic by number
  --topic <text>      Explicit wildcard topic override
  --topic-id <id>     Link the wildcard to one mastery area
  --project <name>    Queue a named depth project
  --weekly-review     Also scaffold a weekly review note
  --force             Overwrite existing session notes

web options:
  LEARN_PORT=<port>   Override port (default: 4747)

Examples:
  node run.mjs learn session --candidate 5 --topic-id macro-rate-transmission
  node run.mjs learn session --weekly-review
  node run.mjs learn web
`,
    scan: `
scan â€” Analysis scans

Commands:
  sectors       Scan all 11 sector baskets and route findings to theses
                  --sector <name>      Only scan this sector
                  --dry-run            Print routing table; no writes
                  --new-thesis-only    Only write new thesis stubs
                  --no-fmp             Skip FMP equity screening calls
  company-risk  Scan companies for risk signals across 4 domains
                  --ticker <TICKER>    Single company (required unless --watchlist)
                  --company <name>     Company name for NewsAPI search
                  --watchlist          Scan all active companies
                  --domain <name>      fundamental|regulatory|sentiment|all
                  --update-score       Rewrite risk_score in company note
                  --dry-run
  conviction    Build rolling thesis conviction summary from sector-scan signals
                  --window <days>      Rolling window (default: 7)
                  --dry-run
                  --json

OSINT Scans (passive mode â€” no active probing):
  osint-spiderfoot  Passive SpiderFoot scan (200+ modules) â†’ 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --dry-run
  osint-harvester   theHarvester email/subdomain/IP harvest â†’ 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --sources <list>     Comma-separated sources (default: google,bing,duckduckgo,crtsh)
                  --dry-run
  osint-amass       Amass passive DNS intel (cert transparency) â†’ 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --dry-run
  osint-recon       Recon-ng passive corporate contact/host scan â†’ 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --dry-run
  osint-telegram    Telegram public channel monitor (Telethon/MTProto) â†’ 05_Data_Pulls/osint/
                  --channel <username>  Channel @username without @ (required)
                  --limit <n>          Messages to fetch (default: 100)
                  --query <keyword>    Filter messages containing keyword
                  --dry-run
  osint-leaker      Multi-database breach/credential enumeration â†’ 05_Data_Pulls/osint/
                  --domain <domain>    Target domain
                  --email <email>      Target email address
                  --dry-run
  osint-octosuite   GitHub org/user OSINT (Bellingcat) â†’ 05_Data_Pulls/osint/
                  --org <org>          GitHub organization name
                  --user <username>    GitHub username
                  --dry-run
  osint-merklemap   Certificate transparency subdomain discovery â†’ 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --pages <n>         Pages to fetch (default: 2, max: 10)
                  --dry-run
  osint-columbus    Fast passive subdomain discovery (Columbus API) â†’ 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --dry-run
  osint-snscrape    Multi-platform social scraper (Bellingcat) â†’ 05_Data_Pulls/social/
                  --platform <name>    twitter|instagram|reddit|mastodon (default: twitter)
                  --query <terms>      Search query
                  --user <username>    User timeline
                  --limit <n>         Max posts (default: 50)
                  --dry-run
  osint-umbra       Umbra SAR satellite open data tracker (Bellingcat) â†’ 05_Data_Pulls/osint/
                  --region <coords>    lat_min,lon_min,lat_max,lon_max or named: hormuz|black-sea|persian-gulf
                  --dry-run
  osint-osmsearch   OpenStreetMap proximity feature search (Bellingcat) â†’ 05_Data_Pulls/osint/
                  --lat <number>       Latitude (required)
                  --lon <number>       Longitude (required)
                  --radius <meters>    Search radius (default: 5000)
                  --location <name>    Named shortcut: hormuz|suez|malacca
                  --dry-run

Examples:
  node run.mjs scan sectors --dry-run
  node run.mjs scan sectors --sector industrials
  node run.mjs scan company-risk --ticker AAPL --company "Apple Inc"
  node run.mjs scan company-risk --watchlist --update-score
  node run.mjs scan conviction --window 14
  node run.mjs scan osint-spiderfoot --domain example.com
  node run.mjs scan osint-harvester --domain example.com --sources google,bing,shodan
  node run.mjs scan osint-amass --domain example.com
  node run.mjs scan osint-recon --domain example.com
  node run.mjs scan osint-telegram --channel marketnews --query "supply chain"
  node run.mjs scan osint-leaker --domain example.com
  node run.mjs scan osint-octosuite --org openai
  node run.mjs scan osint-merklemap --domain example.com
  node run.mjs scan osint-columbus --domain example.com
  node run.mjs scan osint-snscrape --platform twitter --query "NVDA earnings"
  node run.mjs scan osint-umbra --region hormuz
  node run.mjs scan osint-osmsearch --location hormuz --radius 15000
`,
    thesis: `
thesis â€” Thesis intelligence

Commands:
  sync          Sync latest FMP technical and earnings data into thesis notes
                  --dry-run            Preview note updates without writing
                  --thesis <name>      Limit to one thesis name/path match
                  --include-baskets    Also sync thesis basket files
  catalysts     Generate company-level catalyst notes from thesis + FMP context
                  --dry-run
                  --thesis <name>
                  --symbol <CSV>       Limit to specific ticker(s)
                  --window <days>      Earnings look-ahead window (default: 21)
                  --all                Write notes for every selected symbol
  full-picture  Generate thesis synthesis reports (structural + tactical layers)
                  --dry-run
                  --thesis <name>
                  --include-baskets

Examples:
  node run.mjs thesis sync --dry-run
  node run.mjs thesis catalysts --thesis "Housing Supply Correction"
  node run.mjs thesis full-picture
`,
    pull: `
pull â€” External data pullers

Pullers (no API key required):
  treasury      --yields
  cboe          --skew | --vix | --all
  sec           --thesis | --drones | --defense | --amr | ... | --sectors [name]
  arxiv         --drones | --defense | --amr | --glp1 | ... | --all
  semantic-scholar
                --query "<terms>" | --amr | --ai | --robotics | --defense
                Optional: --top-cited --limit <n> --candidate-limit <n> --year <range> --dry-run
  pubmed        --amr | --psychedelics | --glp1 | --geneediting | --alzheimers | --longevity | --all
  clinicaltrials --oncology | --cardio | --neuro | --amr | --glp1 | --geneediting | --alzheimers | --longevity | --query <term>
  openfema      --recent
  usaspending   --recent
  fda           --recent-approvals
  nahb          --builder-confidence | --dry-run
  federalregister --faa-uas | --dry-run
  macro-bridges (no flags required)
  agent-run     Orchestrated multi-agent vault run
                --agents <CSV>            Optional agent id filter
                --cadence <name>          Default: daily
                --interactions            Emit agent interaction threads before final report
                --skip-llm | --skip-report | --dry-run
  streamline-report Orchestrator daily decision brief from local pull notes
                --window <days>           Default: 14
                --limit <n>               Default: 12
                --include-interactions    Include latest agent interaction threads
                --dry-run | --json
  positioning-report Big money vs retail positioning divergence report
                --symbols <CSV>           Explicit symbol list
                --thesis <name>           Score one thesis watchlist
                --all-thesis              Score all thesis watchlists
                --include-baskets         Include thesis basket symbols
                --limit <n>               Default: 25
                --dry-run | --json
  positioning-checklist Workbook-core positioning checklist synthesis
                --preset workbook-core    Use workbook module and weight defaults
                --date YYYY-MM-DD         Report/as-of date
                --dry-run | --json
  market-positioning-outcomes Agent-neutral Market Positioning Ledger outcome packet/apply
                --date YYYY-MM-DD         Packet/apply date
                --apply <path>            Apply approved outcome JSON to ledger + calibration
                --dry-run | --json
  institutional-positioning Institutional positioning and market-structure report
                --symbols <CSV>           Symbols to model (default: SPY,QQQ,NVDA,TSLA)
                --date YYYY-MM-DD         Report/as-of date
                --quarter YYYYQn          13F quarter cache key
                --all                     Use default broad symbol set
                --bridge-world-machine    Write concise candidate into World_Machine/_Inbox
                --dry-run | --json
  sec-13f       Normalize SEC 13F data set cache
                --quarter YYYYQn          Quarter cache key
                --file <path>             Optional downloaded SEC data set CSV/JSON
                --dry-run | --json
  sec-ftd       Normalize SEC fails-to-deliver cache
                --date YYYY-MM-DD         Cache date
                --file <path>             Optional SEC pipe-delimited FTD file
                --dry-run | --json
  cftc-cot      Normalize CFTC COT positioning cache
                --file <path>             Optional normalized COT CSV/JSON rows
                --markets <CSV>           Market filters
                --dry-run | --json
  finra-positioning FINRA Query API positioning pull
                --datasets <all|short-interest|short-sale-volume|threshold-list|otc-weekly>
                --symbols <CSV>           Symbol filter where supported
                --limit <n>               Default: 25
                --date YYYY-MM-DD         Query/as-of date filter where supported
                --dry-run | --json
  signal-quality-scan Score module reliability from run ledgers
                --window <days>           Default: 30
                --dry-run
  signal-intelligence Canonical strategy, thesis, market-cycle signal layer
                --scope <all|strategy|thesis|market-cycle>
                --dry-run | --json
  weekly-research-scout Weekly NewsAPI/FMP/Semantic Scholar/SourceWatch thesis scout
                --window <days>           Local evidence window (default: 14)
                --date YYYY-MM-DD         Report/as-of date (default: today)
                --no-world-machine        Skip World_Machine triage packet
                --dry-run | --json
  my-data-report-flow My_Data monitoring snapshots, briefings, and registers
                --all | --documents=<CSV>
                --dry-run | --no-inbox | --allow-stale
  research-spine-flow Compatibility alias for my-data-report-flow
  world-machine-flow Link-only bridge packets for World_Machine promotion review
                --approved-only       Write only approved packets into World_Machine/_Inbox
                --ticker <TICKER>      Single-ticker pilot (default: GEV)
                --date YYYY-MM-DD      Packet date (default: today)
                --dry-run | --packet-file <path>
  update-my-data-indicators
                Update My_Data indicator frontmatter from latest FRED/Vol pulls
                --dry-run             Preview changes without writing files
  update-world-machine-indicators
                Compatibility alias for update-my-data-indicators
                --dry-run             Preview changes without writing files
  portfolio-health Fidelity positions CSV portfolio health scan
                --file <path>           Fidelity positions CSV export
                --ignore-account <CSV>  Accounts to exclude (default: Jefferson plan)
                --dry-run | --json
  forensic-risk Manual forensic accounting risk screen
                --symbols <CSV>         Explicit public-equity ticker list
                --watchlist <name>      Read symbols from scripts/config/watchlists.json
                --diff-risk-factors     Diff latest/prior 10-K sections only after numeric flags
                --threshold <watch|alert|critical>
                                       Minimum severity for investigation memos (default: alert)
                --dry-run | --json      Manual-only; never part of scheduled cadences
  neo4j-blind-spot-graph Typed World_Machine/My_Data graph export for blind-spot review
                --date YYYY-MM-DD        Export/as-of date (default: today)
                --out-dir <path>         Override export directory
                --include-archives       Include archived notes in scan
                --dry-run | --json       Writes CSV package only when not dry-run; no DB writes
  neo4j-scenario-theory Manual Scenario/ShockVector/RiskTheme graph synthesis
                --scenario <slug>        Default: 2026-leverage-oil-fed-policy-fragility
                --dry-run | --json       Dry-run performs no Neo4j connection or writes
  neo4j-inbox-ingestion Manual World_Machine inbox batch graph import
                --file <path>             Observation note with Neo4j Transfer Block
                --date YYYY-MM-DD         Use dated World_Machine inbox batch observation
                --dry-run | --json        Dry-run parses only; live mode writes reviewable nodes/CandidateLinks
  event-research Multi-layer event scenario research from local evidence
                --scenario <id>          Default: fertilizer-shortage
                --window <days>          Local evidence window (default: 30)
                --limit <n>              Max evidence links per layer (default: 20)
                --handoff-limit <n>      Research handoff queue cap (default: 12)
                --dry-run | --json
  month-end-archive Create monthly summary and copy month files into KB raw archive
                --month <YYYY-MM>         Default: current month
                --scope <CSV>             Default: 05_Data_Pulls
                --dry-run | --json
  biofood       Bioengineered Food Systems thesis pull
                --tickers <CSV>       Public watchlist override
                --lookback <days>     Research/regulatory/filing window (default: 120)
                --limit <n>           Rows per evidence layer (default: 15)
                --research-only       Skip market, SEC, and FDA layers
                --markets-only        Skip research and FDA layers
                --regulatory-only     Skip research, market, and SEC layers

Pullers (API key required):
  agent-analyst Parallel no-LangChain market agent analysis
                --symbol <TICKER>        Single symbol analysis
                --thesis <name>          Analyze symbols from a thesis watchlist
                --all-thesis             Batch across thesis watchlists
                --strategy <name>        Analyze one strategy basket from 10_Theses/Baskets
                --all-strategies         Batch across strategy-tagged baskets
                --agents <CSV>           price,risk,sentiment,microstructure,macro,fundamentals,prediction-market
                --skip-llm               Force deterministic synthesis
                --live-prediction-markets Enable read-only Kalshi/Polymarket live lookup
                --dry-run | --json
  entropy-monitor SPY/QQQ entropy shadow ledger
                --symbols <CSV>          Default: SPY,QQQ
                --lookback <bars>        1-minute bars for entropy window (default: 120)
                --backtest               Backtest all returned intraday history
                --step <n>               Backtest sample step in minutes (default: 5)
                --near-threshold <n>     Relative watch threshold (default: 0.60)
                --low-threshold <n>      Stronger watch threshold (default: 0.50)
                --dry-run | --json
  fred          --group <name> | --series <ids> | --limit <n>
  fmp           --quote <SYMBOLS> | --profile <SYMBOL> | --technical <SYMBOL>
                --earnings-calendar | --thesis-watchlists | --sector-baskets | --micro-small | --options <SYMBOL>
                --insider <SYMBOL>       Insider Form 4 trades (buys/sells by executives)
                --balance-sheet <SYMBOL> Annual balance sheet (debt, cash, equity)
                --cash-flow <SYMBOL>     Annual cash flow (FCF, operating CF, CapEx)
                --estimates <SYMBOL>     Forward analyst EPS and revenue estimates
                --short-interest <SYMBOL> Short interest % of float history
                --ratings <SYMBOL>       Analyst rating changes and upgrades/downgrades
                --news <SYMBOL>          Company-specific news headlines with sentiment
                --general-news           Broad financial news feed for briefings
                --market-performance     Biggest gainers, losers, and most-active stocks
                --biggest-gainers | --biggest-losers | --most-actives
                --macro-calendar         Economic event calendar (Fed, CPI, jobs, etc.)
                                         Optional: --from YYYY-MM-DD --to YYYY-MM-DD --all
                --watchlist-deep-scan    Run insider, balance-sheet, cash-flow, estimates,
                                         short-interest, ratings, and news for all watchlist symbols
                                         Optional: --thesis <name> --dry-run --concurrency <n>
  fmp-harvest   One-time FMP subscription-exit raw archive harvest
                --stage <foundation|current-bulk|statements-bulk|prices-bulk|deep-backfill|ownership|final-refresh|audit|all>
                --scope <hybrid>          Hybrid max scope: deep priority names + broad bulk archive
                --from YYYY-MM-DD --to YYYY-MM-DD  Price bulk date window
                --tiers <T0,T1,T2,T3>     Restrict universe tiers
                --deep-tiers <T0,T1>      Per-symbol deep-backfill tiers (default for hybrid: T0,T1)
                --out <path>              Archive root (default: 99_System/data_archives/fmp_cancel_2026-05-30)
                --resume                  Skip committed work units in checkpoint
                --max-bytes-gb <n>        Stop before exceeding a local archive byte cap
                --bulk-delay-ms <n>       Delay before bulk endpoint calls (default: 10000)
                --concurrency <n>         Remote work-unit concurrency (default: 2)
                --dry-run | --json        Dry-run never requires the FMP key or API calls
  alpha-vantage --news-sentiment <TICKERS> | --top-gainers-losers
                --technical <SYMBOL> --indicator <RSI|MACD|BBANDS|ATR|SMA|EMA>
                Optional: --topic <topic> --limit <n> --dry-run
  bea           --gdp | --income
  eia           --electricity-demand | --generation-mix | --regional-load | --all
  api-data-gov  Shared api.data.gov agency starter pulls
                --agency <slug|all>      Default: all starter-ready agencies
                --endpoint <slug>        Run one endpoint for one agency
                --all-endpoints          Run every starter-ready endpoint for the agency
                --list-agencies          Show agency use cases and starter status
                --dry-run | --json
  newsapi       --topic <topic> | --limit <n>
  sam           --entities <naics> | --opportunities <kw> | --all
  socrata       --permits | --311 | --chi-permits | --custom <url>
  uspto         --ptab | --filings | --all
  source-watch  Pull updated posts from the Research Spine source registry
                --source <id-or-name> --category <name> --limit <n>
                --lookback-days <n> --include-disabled --rescan --dry-run --json
  gdelt         Near-real-time GDELT DOC API news monitor (no key)
                --topic <name>           markets, macro, credit, energy, housing, defense, biotech, aipower, dilution
                --topics <CSV>           Multiple named topics
                --query <query>          Custom GDELT DOC query
                --all                    Run all default watch topics
                --timespan <span>        Default: 15min (GDELT minimum)
                --limit <n>              Default: 75, max 250
                --max-attempts <n>       Use 1 for best-effort no-retry fallback
                --all-languages          Disable the default English-only source-language filter
                --dry-run | --json

Dilution & screening pullers (SEC EDGAR free + FMP Premium):
  dilution-monitor  Batch dilution risk across a watchlist (runway, shelf, ATM, compliance)
                    --watchlist <name>    Thesis / sector keyword (default: active entities)
                    --tickers <CSV>       Explicit ticker list (overrides watchlist)
                    --lookback <days>     Days to scan for new filings (default: 14)
  filing-digest     Morning digest of SEC filings grouped + summarized by category
                    --tickers <CSV>       Tickers to scan (default: active watchlist)
                    --lookback <days>     Days to pull filings for (default: 1)
  disclosure-reality Counterparty-confirmation starter report for promising 8-Ks
                    --tickers <CSV>       Explicit ticker list
                    --thesis <name>       Thesis keyword, e.g. defense
                    --sector <name>       Sector keyword, e.g. technology
                    --all                 Scan all known thesis + sector tickers
                    --lookback <days>     Filing lookback window (default: 45)
                    --include-risk        Include risk-first disclosures too
  opportunity-viewpoints Cross-source opportunity and risk viewpoint composer
                    --window <days>       Local note window (default: 14)
                    --limit <n>           Max viewpoint cards (default: 12)
                    --thesis <name>       Filter to a thesis keyword
                    --sector <name>       Filter to a sector keyword
                    --long-only           Hide risk-first viewpoints
  capital-raise     Market-wide capital raise sweep (424B, S-/F-*, 8-K 3.02, FWP)
                    --lookback <days>     Days to scan EFTS full-text search (default: 1)
  dd-report         One-click due-diligence report for a single ticker
                    --ticker <TICKER>     Required
                    --lookback <days>     Filing lookback window (default: 180)
  smallcap-screen   Small-cap edge screener: low float + high short + no offerings
                    --market-cap-min <v>  Min cap (default: 50M)
                    --market-cap-max <v>  Max cap (default: 2B)
                    --float-max <v>       Max float (e.g. 30M)
                    --short-min <pct>     Min short % of float
                    --no-offerings        Exclude tickers with recent shelf/prospectus
                    --limit <n>           (default: 40)
  spinoff-screen   Spin-off/separation/Form 10 screen with leverage, growth, and insider evidence
                    --lookback <days>      SEC/news lookback (default: 730)
                    --candidate-limit <n>  SEC event candidates to enrich (default: 80)
                    --limit <n>            Max matches in note (default: 30)
                    --dry-run              Print JSON without writing note
  fmp-screener-batch  Registry-driven FMP screeners from TradingView/FMP docs.
                    Preserves the original 19 presets and adds staged
                    automation-first strategies for value, quality, events,
                    healthcare, financials, REITs, ETFs, and commodities.
                    --preset <id|all>      Default: all
                    --group <deep-value|quality|momentum|distress|events|financials|reit|etf|healthcare|commodities>
                                           Run a registry group instead of all presets
                    --sector <name>        Override initial FMP sector where supported
                    --industry <name>      Override initial FMP industry where supported
                    --universe-limit <n>   Initial FMP rows per preset (default: 80)
                    --limit <n>            Max matches per note (default: 20)
                    --dry-run              Print JSON without writing notes

Global option: --skip-retention  (disable automatic retention after supported pulls)

Examples:
  node run.mjs pull fred --group housing
  node run.mjs pull fmp --quote AAPL,MSFT
  node run.mjs pull fmp --thesis-watchlists --dry-run
  node run.mjs pull fmp --market-performance --limit 20
  node run.mjs pull fmp --general-news --limit 25
  node run.mjs pull fmp-harvest --stage all --scope hybrid --resume --json
  node run.mjs pull fmp-harvest --stage prices-bulk --from 2020-06-01 --to 2026-06-01 --dry-run
  node run.mjs pull alpha-vantage --news-sentiment SPY --limit 10
  node run.mjs pull api-data-gov --list-agencies
  node run.mjs pull api-data-gov --agency all --dry-run
  node run.mjs pull api-data-gov --agency nasa --endpoint apod --limit 10
  node run.mjs pull fmp --sector-baskets
  node run.mjs pull fmp --sector-baskets --sector tech
  node run.mjs pull sec --thesis
  node run.mjs pull arxiv --drones
  node run.mjs pull semantic-scholar --query "antimicrobial resistance" --limit 10
  node run.mjs pull semantic-scholar --query "market liquidity funding" --top-cited
  node run.mjs pull semantic-scholar --queue market-cycle --max-topics 6 --limit 5
  node run.mjs pull my-data-report-flow --documents daily-monitoring,daily-briefing
  node run.mjs pull research-spine-flow --documents daily-monitoring,daily-briefing
  node run.mjs pull clinicaltrials --amr
  node run.mjs pull biofood --lookback 120
  node run.mjs pull dilution-monitor --tickers SAVA,IMNN,PRTG
  node run.mjs pull filing-digest --lookback 1
  node run.mjs pull disclosure-reality --tickers LDOS,ONTO,RGTI,FLNC,NBIX
  node run.mjs pull opportunity-viewpoints --window 21
  node run.mjs pull event-research --scenario fertilizer-shortage --dry-run
  node run.mjs pull event-research --scenario hormuz-oil-shock --dry-run --handoff-limit 8
  node run.mjs pull agent-analyst --strategy "Simons Style Quant Momentum Breadth" --limit 5 --skip-llm
  node run.mjs pull entropy-monitor
  node run.mjs pull entropy-monitor --backtest
  node run.mjs pull positioning-report --symbols SPY,QQQ,XOM
  node run.mjs pull forensic-risk --symbols AAPL,MSFT --dry-run
  node run.mjs pull forensic-risk --watchlist cash_flow_quality --diff-risk-factors --dry-run
  node run.mjs pull neo4j-blind-spot-graph --dry-run --json
  node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --dry-run --json
  node run.mjs pull neo4j-inbox-ingestion --date YYYY-MM-DD --dry-run --json
  node run.mjs pull world-machine-flow --approved-only --dry-run
  node run.mjs pull update-my-data-indicators --dry-run
  node run.mjs pull update-world-machine-indicators --dry-run
  node run.mjs pull capital-raise --lookback 1
  node run.mjs pull dd-report --ticker NVDA
  node run.mjs pull smallcap-screen --float-max 30M --short-min 15 --no-offerings
  node run.mjs pull spinoff-screen --candidate-limit 80 --limit 30
  node run.mjs pull fmp-screener-batch --preset cash-box-with-a-pulse
  node run.mjs pull fmp-screener-batch --group deep-value --sector Finance --dry-run
  node run.mjs pull fmp-screener-batch --preset all --universe-limit 120 --limit 20
`,
    playbook: `
playbook â€” Multi-step workflows

No production playbooks are currently advertised. Use 07_Playbooks/ for
operator notes and run concrete automation through the routine, pull,
scan, and thesis command groups.
`,
    routine: `
routine - Manual broad source-refresh cadences

Commands:
  premarket   Overnight macro/news + Yahoo vol context, premarket Spine snapshot (run ~07:00 ET)
  daily       Open-bell macro/market, SEC, thesis watchlists, sector scan, daily Spine docs (run ~09:45 ET)
  midday      Intraday tape, FMP news, Yahoo vol intraday + P/C, midday Spine snapshot (run ~12:30 ET)
  preclose    Pre-close index basket, Yahoo vol last hour, EOD P/C term structure (run ~15:30 ET)
  endofday    Closing tape, macro/earnings calendar, full P/C + COT (Fri), EOD Spine docs (run ~16:30 ET)
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
  node run.mjs routine weekly
  node run.mjs routine monthly --month 2026-04
`,
    cadence: `
cadence - Scheduled review/analysis runner

Commands:
  list              Print all cadences from 99_System/config/cadences.json
  show <name>       Print the puller list for a cadence
  run <name>        Execute review/analysis pullers in a cadence with per-puller envelopes

Options:
  --dry-run         Print what would run without importing or calling pullers
  --json            Emit machine-readable JSON summary
  --skip-summary    Skip writing the run_summaries file

Examples:
  node run.mjs cadence list
  node run.mjs cadence show daily
  node run.mjs cadence run premarket --dry-run
`,

  kb: `
KB â€” Knowledge Base subsystem (intake â†’ wiki pipeline)

Subcommands:
  ingest         Register a source into the KB pipeline
                   --file <path> | --url <url> | --title <title> | --kind <article|paper|transcript|repo|dataset>
  normalize      Normalize inbox files into index manifests
                   --dry-run | --file <specific file>
  classify       Apply extraction rules to a manifest
                   --file <manifest> | --kind <override> | --dry-run
  compile        Extract a classified source into wiki pages
                   --file <manifest> | --dest <wiki subdir> | --dry-run
  query          Answer a question using the wiki
                   --query "<question>" | --save | --dry-run
  librarian      Wiki maintenance and lint pass
                   --fix | --dry-run
  health         Broader integrity and scale checks
                   --dry-run
  transcribe     Extract structured content from a transcript
                   --file <path> | --speakers "<name1,name2>" | --dest <subdir> | --dry-run
  suggest        Surface structural gaps and suggest missing pages
                   --save | --dry-run
  dispatch       Front-door alias dispatcher (same as above)
                   --action <subcommand>

Examples:
  node run.mjs kb ingest --file ./article.md --kind article --title "Q1 Energy Outlook"
  node run.mjs kb normalize --dry-run
  node run.mjs kb query --query "What is the current energy regime?" --save
  node run.mjs kb librarian --fix
  node run.mjs kb health
  node run.mjs kb transcribe --file raw/transcripts/call.md --speakers "Alice,Bob"
  node run.mjs kb suggest --save
`,
    bridge: `
bridge â€” Vault-to-vault promotion utilities

Subcommands:
  approve-queue  Promote notes with review_status: approved â†’ promoted
                   --dry-run    Log what would be promoted without writing
  my-data-report-pull
                 Preferred on-demand My_Data report/update system. Safe default
                 refreshes review, freshness, indicator, packet, source-gap,
                 and validation surfaces from existing My_Data evidence.
                   --dry-run              Preview without writing
                   --cadence <name>       daily|premarket|midday|preclose|eod
                   --full-source-refresh  Explicitly run raw My_Data source refresh first
                   --allow-stale          Continue even if readiness is BLOCKED
                   --continue-on-error    Keep optional review steps moving after failure
                   --skip-validate        Skip final vault validation
                   --skip-gap-register    Skip source gap register refresh
  world-machine-pull
                 Compatibility alias for my-data-report-pull
  daily          Run the full daily pipeline end-to-end (6 steps)
                   --dry-run              Preview without writing
                   --allow-stale          Continue even if readiness is BLOCKED
                   --continue-on-error    Log step failures and keep going
                   --skip-validate        Skip vault validation in cadence step
                   --skip-gap-register    Skip source gap register refresh
  ingest-world-inbox
                 Convert World_Machine/_Inbox files into a dated batch observation
                 with event trend synthesis, review-first event connection candidates,
                 Mermaid map, and optional archived Plotly artifact, then archive processed originals under 500-archive/Inbox/YYYY-MM-DD
                   --dry-run              Preview without writing or moving files
                   --date YYYY-MM-DD      Override archive/observation date
                   --from-archive         Rebuild the batch observation from an existing archive date
                   --update-existing      Rewrite the base dated batch observation instead of making a numbered copy
                   --connection-limit <n> Cap event connection candidates (default: 12)
                   --no-event-connections Preserve observation-only output shape
                   --no-plotly            Skip HTML Plotly visual artifact
  eod-digest     Write today's World_Machine EOD digest
                   --dry-run              Preview without writing
  market-positioning-ledger
                 Write _Inbox/Market Positioning Ledger.md and stale archive
                 indexes under 500-archive/Stale
                   --dry-run              Preview without writing
                   --date YYYY-MM-DD      Override ledger/index date
                   --print                Print the ledger markdown during preview
  consolidate-world-machine
                 Copy World_Machine reports/research into My_Data, then archive
                 disallowed World_Machine originals after checksum verification
                 under 500-archive/Consolidated_To_My_Data/YYYY-MM-DD
                   --dry-run              Inventory only; do not write or archive
                   --date YYYY-MM-DD      Override archive/manifest date
                   --print-files          Print every planned keep/migrate item

Related World_Machine commands:
  node run.mjs pull world-machine-flow --approved-only
      Writes approved candidate packets to World_Machine/_Inbox/World Machine Candidate Packets
      and records the packet manifest in scripts/.cache/world-machine-bridge/YYYY-MM-DD.json
  node run.mjs pull update-world-machine-indicators
      Updates World_Machine/Macro/Indicators from latest FRED/Vol pulls
  powershell -ExecutionPolicy Bypass -File .\\invoke-inbox-ingest.ps1 -DryRun
      Runs the scheduled World_Machine inbox ingest wrapper; remove -DryRun to write

Examples:
  node run.mjs bridge approve-queue --dry-run
  node run.mjs bridge approve-queue
  node run.mjs bridge my-data-report-pull --dry-run
  node run.mjs bridge world-machine-pull --dry-run
  node run.mjs bridge world-machine-pull
  node run.mjs bridge world-machine-pull --full-source-refresh --dry-run
  node run.mjs bridge daily --dry-run
  node run.mjs bridge daily --allow-stale --continue-on-error
  node run.mjs bridge ingest-world-inbox --dry-run
  node run.mjs bridge ingest-world-inbox
  node run.mjs bridge ingest-world-inbox --from-archive --date YYYY-MM-DD --update-existing
  node run.mjs bridge eod-digest --dry-run
  node run.mjs bridge market-positioning-ledger --dry-run
  node run.mjs bridge consolidate-world-machine --dry-run
`,
  };

  const text = help[group];
  if (text) {
    console.log(text);
  } else {
    console.error(`Unknown group: ${group}`);
  }
}

