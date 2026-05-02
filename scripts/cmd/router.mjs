/**
 * router.mjs — Grouped command dispatcher
 *
 * Handles the new command grammar:
 *   node run.mjs <group> <subcommand> [options]
 *
 * Groups: system | learn | scan | thesis | pull | playbook | routine | kb
 *
 * Each handler delegates to the existing module — no logic is duplicated.
 * The router is purely a dispatch layer.
 */

const KNOWN_GROUPS = ['system', 'learn', 'scan', 'thesis', 'pull', 'playbook', 'quant', 'routine', 'kb'];

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
 * @param {string} group       — e.g. 'scan'
 * @param {string} subcommand  — e.g. 'sectors'
 * @param {string[]} args      — raw remaining args
 * @param {Record<string,unknown>} flags — parsed flags
 */
export async function routeGrouped(group, subcommand, args, flags) {
  switch (group) {
    case 'system':  return routeSystem(subcommand, args, flags);
    case 'learn':   return routeLearn(subcommand, args, flags);
    case 'scan':    return routeScan(subcommand, args, flags);
    case 'thesis':  return routeThesis(subcommand, args, flags);
    case 'pull':    return routePull(subcommand, args, flags);
    case 'playbook':return routePlaybook(subcommand, args, flags);
    case 'quant':   return routeQuant();
    case 'routine': return routeRoutine(subcommand, args, flags);
    case 'kb':      return routeKb(subcommand, args, flags);
    default:
      console.error(`Error: Unknown group "${group}". Run "node run.mjs help" for available groups.`);
      process.exit(1);
  }
}

// ── system ──────────────────────────────────────────────────────────────────

async function routeSystem(sub, _args, flags) {
  switch (sub) {
    case 'status': {
      const { listSources } = await import('../lib/config.mjs');
      const sources = listSources();
      console.log('\n📊 API Key Status\n');
      const maxName = Math.max(...sources.map(s => s.name.length));
      for (const s of sources) {
        const status = s.requiresKey
          ? (s.hasKey ? '✅ Configured' : '❌ Missing')
          : '⚪ No key needed';
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
    case 'dashboard': {
      const { startServer } = await import('../dashboard/server.mjs');
      const port = parseInt(process.env.DASHBOARD_PORT ?? '3737', 10);
      startServer(port);
      // Block resolution so run.mjs never reaches process.exit().
      // The HTTP server keeps the event loop alive until Ctrl+C.
      await new Promise(() => {});
      return;
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
    default:
      printGroupHelp('system');
      process.exit(1);
  }
}

// ── learn ────────────────────────────────────────────────────────────────────
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

// ── scan ─────────────────────────────────────────────────────────────────────

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
    case 'osint-spiderfoot': {
      const m = await import('../pullers/osint-spiderfoot.mjs');
      return m.pull(flags);
    }
    case 'osint-harvester': {
      const m = await import('../pullers/osint-harvester.mjs');
      return m.pull(flags);
    }
    case 'osint-amass': {
      const m = await import('../pullers/osint-amass.mjs');
      return m.pull(flags);
    }
    case 'osint-recon': {
      const m = await import('../pullers/osint-recon.mjs');
      return m.pull(flags);
    }
    case 'osint-telegram': {
      const m = await import('../pullers/osint-telegram.mjs');
      return m.pull(flags);
    }
    case 'osint-leaker': {
      const m = await import('../pullers/osint-leaker.mjs');
      return m.pull(flags);
    }
    case 'osint-octosuite': {
      const m = await import('../pullers/osint-octosuite.mjs');
      return m.pull(flags);
    }
    case 'osint-merklemap': {
      const m = await import('../pullers/osint-merklemap.mjs');
      return m.pull(flags);
    }
    case 'osint-columbus': {
      const m = await import('../pullers/osint-columbus.mjs');
      return m.pull(flags);
    }
    case 'osint-snscrape': {
      const m = await import('../pullers/snscrape.mjs');
      return m.pull(flags);
    }
    case 'osint-umbra': {
      const m = await import('../pullers/osint-umbra.mjs');
      return m.pull(flags);
    }
    case 'osint-osmsearch': {
      const m = await import('../pullers/osint-osmsearch.mjs');
      return m.pull(flags);
    }
    default:
      printGroupHelp('scan');
      process.exit(1);
  }
}

// ── thesis ───────────────────────────────────────────────────────────────────

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

// ── pull ─────────────────────────────────────────────────────────────────────

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

// ── playbook ─────────────────────────────────────────────────────────────────

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

// ── retired quant ─────────────────────────────────────────────────────────────

async function routeQuant() {
  console.error('Qlib/quant has been retired from My_Data. Reinstall it later only if a concrete use case comes back.');
  process.exit(1);
}

async function routeRoutine(sub, _args, flags) {
  const m = await import('../routines/cadence.mjs');
  return m.run(sub || 'help', flags);
}

// ── kb ────────────────────────────────────────────────────────────────────────

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

// ── group help ────────────────────────────────────────────────────────────────

export function printGroupHelp(group) {
  const help = {
    system: `
system — System utilities

Commands:
  status       Show API key configuration status
  validate     Check vault note schemas and pull-note layout
  dashboard    Start local operator dashboard at http://localhost:3737
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

Examples:
  node run.mjs system status
  node run.mjs system validate
  node run.mjs system cleanup --market-history --dry-run
  node run.mjs system dashboard
  node run.mjs system month-end --dry-run
  node run.mjs system month-end --month 2026-04
`,
    learn: `
learn — Learning system

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
scan — Analysis scans

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

OSINT Scans (passive mode — no active probing):
  osint-spiderfoot  Passive SpiderFoot scan (200+ modules) → 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --dry-run
  osint-harvester   theHarvester email/subdomain/IP harvest → 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --sources <list>     Comma-separated sources (default: google,bing,duckduckgo,crtsh)
                  --dry-run
  osint-amass       Amass passive DNS intel (cert transparency) → 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --dry-run
  osint-recon       Recon-ng passive corporate contact/host scan → 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --dry-run
  osint-telegram    Telegram public channel monitor (Telethon/MTProto) → 05_Data_Pulls/osint/
                  --channel <username>  Channel @username without @ (required)
                  --limit <n>          Messages to fetch (default: 100)
                  --query <keyword>    Filter messages containing keyword
                  --dry-run
  osint-leaker      Multi-database breach/credential enumeration → 05_Data_Pulls/osint/
                  --domain <domain>    Target domain
                  --email <email>      Target email address
                  --dry-run
  osint-octosuite   GitHub org/user OSINT (Bellingcat) → 05_Data_Pulls/osint/
                  --org <org>          GitHub organization name
                  --user <username>    GitHub username
                  --dry-run
  osint-merklemap   Certificate transparency subdomain discovery → 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --pages <n>         Pages to fetch (default: 2, max: 10)
                  --dry-run
  osint-columbus    Fast passive subdomain discovery (Columbus API) → 05_Data_Pulls/osint/
                  --domain <domain>    Target domain (required)
                  --dry-run
  osint-snscrape    Multi-platform social scraper (Bellingcat) → 05_Data_Pulls/social/
                  --platform <name>    twitter|instagram|reddit|mastodon (default: twitter)
                  --query <terms>      Search query
                  --user <username>    User timeline
                  --limit <n>         Max posts (default: 50)
                  --dry-run
  osint-umbra       Umbra SAR satellite open data tracker (Bellingcat) → 05_Data_Pulls/osint/
                  --region <coords>    lat_min,lon_min,lat_max,lon_max or named: hormuz|black-sea|persian-gulf
                  --dry-run
  osint-osmsearch   OpenStreetMap proximity feature search (Bellingcat) → 05_Data_Pulls/osint/
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
thesis — Thesis intelligence

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
pull — External data pullers

Pullers (no API key required):
  treasury      --yields
  cboe          --skew | --vix | --all
  sec           --thesis | --drones | --defense | --amr | ... | --sectors [name]
  arxiv         --drones | --defense | --amr | --glp1 | ... | --all
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
  signal-quality-scan Score module reliability from run ledgers
                --window <days>           Default: 30
                --dry-run
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
                --macro-calendar         Economic event calendar (Fed, CPI, jobs, etc.)
                                         Optional: --from YYYY-MM-DD --to YYYY-MM-DD --all
                --watchlist-deep-scan    Run insider, balance-sheet, cash-flow, estimates,
                                         short-interest, ratings, and news for all watchlist symbols
                                         Optional: --thesis <name> --dry-run --concurrency <n>
  bea           --gdp | --income
  eia           --electricity-demand | --generation-mix | --regional-load | --all
  newsapi       --topic <topic> | --limit <n>
  sam           --entities <naics> | --opportunities <kw> | --all
  socrata       --permits | --311 | --chi-permits | --custom <url>
  uspto         --ptab | --filings | --all
  gdelt         Near-real-time GDELT DOC API news monitor (no key)
                --topic <name>           markets, macro, credit, energy, housing, defense, biotech, aipower, dilution
                --topics <CSV>           Multiple named topics
                --query <query>          Custom GDELT DOC query
                --all                    Run all default watch topics
                --timespan <span>        Default: 15min (GDELT minimum)
                --limit <n>              Default: 75, max 250
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

Global option: --skip-retention  (disable automatic retention after supported pulls)

Examples:
  node run.mjs pull fred --group housing
  node run.mjs pull fmp --quote AAPL,MSFT
  node run.mjs pull fmp --thesis-watchlists --dry-run
  node run.mjs pull fmp --sector-baskets
  node run.mjs pull fmp --sector-baskets --sector tech
  node run.mjs pull sec --thesis
  node run.mjs pull arxiv --drones
  node run.mjs pull clinicaltrials --amr
  node run.mjs pull biofood --lookback 120
  node run.mjs pull dilution-monitor --tickers SAVA,IMNN,PRTG
  node run.mjs pull filing-digest --lookback 1
  node run.mjs pull disclosure-reality --tickers LDOS,ONTO,RGTI,FLNC,NBIX
  node run.mjs pull opportunity-viewpoints --window 21
  node run.mjs pull agent-analyst --strategy "Simons Style Quant Momentum Breadth" --limit 5 --skip-llm
  node run.mjs pull entropy-monitor
  node run.mjs pull entropy-monitor --backtest
  node run.mjs pull positioning-report --symbols SPY,QQQ,XOM
  node run.mjs pull capital-raise --lookback 1
  node run.mjs pull dd-report --ticker NVDA
  node run.mjs pull smallcap-screen --float-max 30M --short-min 15 --no-offerings
`,
    playbook: `
playbook — Multi-step workflows

Available playbooks:
  housing-cycle   Housing market regime assessment

Examples:
  node run.mjs playbook housing-cycle
`,
    quant: `
quant — retired

Qlib/quant has been removed from My_Data. Restore or reinstall it only when a concrete quant use case returns.
`,

    routine: `
routine - Canonical pull cadences

Commands:
  daily       Daily macro, market, thesis, scan, cleanup, and validation set
  weekly      Extended government, clinical, research, deep FMP, risk, and agent set
  monthly     Conviction, catalysts, full-picture, graph, and archive set
  quarterly   Disclosure, dilution, viewpoints, and graph set
  yearly      Annual viewpoints, graph sessions, KB health, and validation set

Options:
  --dry-run             Print commands without running them
  --continue-on-error   Keep running after a failed task
  --skip-sector-scan    Daily only
  --skip-agent-scan     Daily/weekly
  --skip-validate       Skip final validation
  --json                Print summary JSON

Examples:
  node run.mjs routine daily --dry-run
  node run.mjs routine weekly
  node run.mjs routine monthly
`,

  kb: `
KB — Knowledge Base subsystem (intake → wiki pipeline)

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
  };

  const text = help[group];
  if (text) {
    console.log(text);
  } else {
    console.error(`Unknown group: ${group}`);
  }
}
