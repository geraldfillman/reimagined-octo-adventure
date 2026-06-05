/**
 * portfolio-health.mjs - ingest a Fidelity positions CSV and write a portfolio health scan.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { getEngineCacheDir, getEntitiesDir, getPullsDir } from '../lib/config.mjs';
import { dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import {
  DEFAULT_IGNORED_ACCOUNTS,
  buildPortfolioHealthNote,
  buildPortfolioHealthPayload,
  extractEtfUniverseFromMarkdown,
  parsePortfolioCsv,
} from '../lib/portfolio-health.mjs';

export async function pull(flags = {}) {
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);
  const optional = Boolean(flags.optional);
  const sourceFile = String(flags.file || flags.csv || process.env.PORTFOLIO_POSITIONS_CSV || '').trim();
  if (!sourceFile) {
    if (optional) {
      const message = 'Portfolio positions CSV not configured.';
      console.log(`Skipping portfolio health scan: ${message}`);
      return {
        source: 'portfolio-health',
        ok: true,
        dryRun,
        skipped: [message],
        filePath: null,
        sidecarPath: null,
        signalStatus: null,
        accountCount: 0,
        holdingCount: 0,
      };
    }
    throw new Error('Provide a Fidelity positions CSV with --file <path>.');
  }
  if (!existsSync(sourceFile)) {
    throw new Error(`Portfolio CSV not found: ${sourceFile}`);
  }

  const date = String(flags.date || today());
  const ignoredAccounts = parseIgnoredAccounts(flags['ignore-account'] || flags.ignoreAccount);
  const csvText = await readFile(sourceFile, 'utf-8');
  const holdings = parsePortfolioCsv(csvText);
  const etfUniverse = await loadEtfUniverse();
  const payload = buildPortfolioHealthPayload({
    date,
    holdings,
    ignoredAccounts,
    etfUniverse,
    sourceFile,
  });
  const markdown = buildPortfolioHealthNote(payload);
  const outputRoot = flags.outputRoot || join(getPullsDir(), 'Portfolio');
  const cacheRoot = flags.cacheRoot || getEngineCacheDir('portfolio-health');
  const filePath = join(outputRoot, dateStampedFilename('Portfolio_Health_Scan'));
  const sidecarPath = join(cacheRoot, `${date}.json`);

  if (dryRun) {
    console.log(markdown);
    const result = {
      source: 'portfolio-health',
      dryRun: true,
      filePath: null,
      sidecarPath: null,
      signalStatus: payload.signal_status,
      accountCount: payload.accountSummaries.length,
      holdingCount: payload.includedHoldings.length,
      markdown,
      payload,
    };
    if (flags.json) console.log(JSON.stringify(summarizeResult(result), null, 2));
    return result;
  }

  writeNote(filePath, markdown);
  await mkdir(dirname(sidecarPath), { recursive: true });
  await writeFile(sidecarPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`Wrote portfolio health scan: ${filePath}`);
  console.log(`Wrote portfolio health sidecar: ${sidecarPath}`);

  const result = {
    source: 'portfolio-health',
    dryRun: false,
    filePath,
    sidecarPath,
    signalStatus: payload.signal_status,
    accountCount: payload.accountSummaries.length,
    holdingCount: payload.includedHoldings.length,
    markdown,
    payload,
  };
  if (flags.json) console.log(JSON.stringify(summarizeResult(result), null, 2));
  return result;
}

function parseIgnoredAccounts(value) {
  if (!value) return DEFAULT_IGNORED_ACCOUNTS;
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

async function loadEtfUniverse() {
  const root = getEntitiesDir('ETFs');
  if (!existsSync(root)) return new Set();

  const names = ['ETF.md', 'PSIL.md'];
  const files = [];
  for (const name of names) {
    const filePath = join(root, name);
    if (existsSync(filePath)) files.push(await readFile(filePath, 'utf-8'));
  }
  return extractEtfUniverseFromMarkdown(files);
}

function summarizeResult(result) {
  return {
    source: result.source,
    dryRun: result.dryRun,
    filePath: result.filePath,
    sidecarPath: result.sidecarPath,
    signalStatus: result.signalStatus,
    accountCount: result.accountCount,
    holdingCount: result.holdingCount,
  };
}
