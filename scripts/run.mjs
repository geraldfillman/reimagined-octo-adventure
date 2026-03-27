#!/usr/bin/env node
/**
 * run.mjs — CLI entry point for data pull scripts
 *
 * Usage:
 *   node run.mjs <puller> [options]
 *   node run.mjs fred --group housing
 *   node run.mjs fred --series HOUST,MORTGAGE30US
 *   node run.mjs fda --recent-approvals
 *   node run.mjs treasury --yields
 *   node run.mjs openfema --recent
 *   node run.mjs usaspending --recent
 *   node run.mjs playbook housing-cycle
 *   node run.mjs status                    # show configured sources
 */

import { listSources } from './lib/config.mjs';

const [, , command, ...args] = process.argv;

if (!command || command === 'help') {
  printHelp();
  process.exit(0);
}

if (command === 'status') {
  printStatus();
  process.exit(0);
}

if (command === 'validate') {
  const validator = await import('./validate-vault.mjs');
  await validator.run();
  process.exit(process.exitCode ?? 0);
}

if (command === 'infranodus') {
  const measurement = await import('./infranodus.mjs');
  const flags = parseArgs(args);
  await measurement.run(flags);
  process.exit(process.exitCode ?? 0);
}

// Parse flags from args
function parseArgs(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

const flags = parseArgs(args);

// Dynamic puller/playbook loading
async function run() {
  const startTime = Date.now();

  try {
    if (command === 'playbook') {
      const playbookName = flags.name || args[0]?.replace('--', '') || args.find(a => !a.startsWith('--'));
      if (!playbookName) {
        console.error('Error: Specify a playbook name. Example: node run.mjs playbook housing-cycle');
        process.exit(1);
      }
      const playbook = await import(`./playbooks/${playbookName}.mjs`);
      await playbook.run(flags);
    } else {
      // Load puller module
      let puller;
      try {
        puller = await import(`./pullers/${command}.mjs`);
      } catch (err) {
        if (err.code === 'ERR_MODULE_NOT_FOUND') {
          console.error(`Error: Unknown puller "${command}". Run "node run.mjs help" for available commands.`);
          process.exit(1);
        }
        throw err;
      }
      await puller.pull(flags);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Done in ${elapsed}s`);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
My_Data Pull Scripts
====================

Usage: node run.mjs <command> [options]

Utilities:
  help              Show this help message
  status            Show API key configuration status
  validate          Check vault note schemas and pull-note layout
  infranodus        Run an InfraNodus graph measurement session
                    --path <scope>        Folder or note, e.g. 10_Theses
                    --question <text>     Optional framing question
                    --output <dir>        Optional output dir

Playbooks:
  playbook <name>   Run a multi-puller playbook
    housing-cycle   Housing market regime assessment

Pullers:
  alphavantage      Pull Alpha Vantage market data (ALPHA_VANTAGE_API_KEY)
                    --quote <SYMBOL>       Market quote snapshot
                    --overview <SYMBOL>    Company overview

  arxiv             Pull arXiv preprints - no API key required
                    --drones
                    --defense
                    --amr
                    --psychedelics
                    --glp1
                    --geneediting
                    --alzheimers
                    --longevity
                    --nuclear
                    --quantum
                    --humanoid
                    --space
                    --all

  bea               Pull BEA macro data (BEA_API_KEY)
                    --gdp                  GDP growth snapshot
                    --income               Personal income snapshot

  cboe              Pull CBOE market positioning data - no API key required
                    --skew                 CBOE SKEW index
                    --vix                  VIX term structure
                    --all                  All active groups

  clinicaltrials    Pull ClinicalTrials.gov recruiting studies - no API key required
                    --oncology
                    --cardio
                    --neuro
                    --amr
                    --glp1
                    --geneediting
                    --alzheimers
                    --longevity
                    --query <term>

  eia               Pull EIA energy data (EIA_API_KEY)
                    --electricity-demand
                    --generation-mix
                    --regional-load
                    --all

  fda               Pull FDA drug data
                    --recent-approvals    Pull recent original drug approvals

  fmp               Pull Financial Modeling Prep data (FINANCIAL_MODELING_PREP_API_KEY)
                    --profile <SYMBOL>    Company profile snapshot
                    --income <SYMBOL>     Annual income statement
                    --options <SYMBOL>    Options chain + unusual activity

  fred              Pull FRED economic data (FRED_API_KEY)
                    --group <name>        housing, labor, inflation, rates, credit, liquidity
                    --series <ids>        Specific series list, e.g. HOUST,UNRATE,DGS10
                    --limit <n>           Number of observations (default: 12)

  newsapi           Pull NewsAPI headlines (NEWSAPI_API_KEY)
                    --topic <topic>       Topic or category
                    --limit <n>           Number of articles

  openfema          Pull FEMA disaster data - no API key required
                    --recent              Recent disaster declarations

  pubmed            Pull PubMed research - no API key required
                    --amr
                    --psychedelics
                    --glp1
                    --geneediting
                    --alzheimers
                    --longevity
                    --all

  sam               Pull SAM.gov entity and opportunity data (SAM_GOV_API_KEY)
                    --entities <naics>    Search entities by NAICS code
                    --opportunities <kw>  Search active solicitations by keyword
                    --all                  Both entities and opportunities

  sec               Pull SEC EDGAR 8-K filings - no API key required
                    --thesis
                    --drones
                    --defense
                    --amr
                    --psychedelics
                    --glp1
                    --geneediting
                    --alzheimers
                    --longevity
                    --nuclear
                    --storage
                    --aipower
                    --humanoid
                    --quantum
                    --semis
                    --housing
                    --hardmoney
                    --space
                    --hypersonics
                    --sectors [name]      tech, health, energy, finance,
                                          industrial, consumer, realestate, clean

  socrata           Pull Socrata open data (SOCRATA_APP_TOKEN optional)
                    --permits             NYC DOB job applications
                    --311                 NYC 311 service requests
                    --chi-permits         Chicago building permits
                    --custom <url>        Custom Socrata dataset URL

  treasury          Pull Treasury fiscal data - no API key required
                    --yields              Pull daily yield curve rates

  usaspending       Pull federal contract awards - no API key required
                    --recent              Recent new contract awards

  uspto             Pull USPTO patent data (PATENTSVIEW_API_KEY)
                    --ptab                PTAB proceedings
                    --filings             Recent filing scan with thesis keyword filter
                    --all                 Both PTAB and filings

Environment:
  DEBUG=1           Show full error stack traces
`);
}

function printStatus() {
  console.log('\n📊 API Key Status\n');
  const sources = listSources();
  const maxName = Math.max(...sources.map(s => s.name.length));

  for (const s of sources) {
    const status = s.requiresKey
      ? (s.hasKey ? '✅ Configured' : '❌ Missing')
      : '⚪ No key needed';
    console.log(`  ${s.name.padEnd(maxName + 2)} ${status}`);
  }

  const configured = sources.filter(s => s.hasKey).length;
  console.log(`\n  ${configured}/${sources.length} sources ready\n`);
}

run();
