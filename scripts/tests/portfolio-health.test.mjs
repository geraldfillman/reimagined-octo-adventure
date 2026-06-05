import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildPortfolioHealthNote,
  buildPortfolioHealthPayload,
  buildRolloverAllocation,
  extractEtfUniverseFromMarkdown,
  parsePortfolioCsv,
} from '../lib/portfolio-health.mjs';
import { pull as pullPortfolioHealth } from '../pullers/portfolio-health.mjs';

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const sampleCsv = `Account Number,Account Name,Symbol,Description,Quantity,Last Price,Last Price Change,Current Value,Today's Gain/Loss Dollar,Today's Gain/Loss Percent,Total Gain/Loss Dollar,Total Gain/Loss Percent,Percent Of Account,Cost Basis Total,Average Cost Basis,Type
1,Individual, -ABC270115C20,ABC JAN 15 2027 $20 CALL,1,$1.00,$0.00,$100.00,$0.00,0.00%,-$50.00,-33.33%,20.00%,$150.00,$1.50,Margin
1,Individual,SPAXX**,HELD IN MONEY MARKET,,,,$400.00,,,,,80.00%,,,Cash
2,Rollover IRA,SPAXX**,HELD IN MONEY MARKET,,,,$1000.00,,,,,100.00%,,,Cash
3,JEFFERSON DEFINED CONTRIBUTION RETIREMENT PLAN,FXAIX,FID 500 INDEX,1,$100.00,$0.00,$100.00,$0.00,0.00%,$0.00,0.00%,100.00%,$100.00,$100.00,
4,BrokerageLink,FSELX,FIDELITY SELECT SEMICONDUCTORS PORT,10,$10.00,$0.00,$100.00,$0.00,0.00%,$0.00,0.00%,50.00%,$100.00,$10.00,Cash
4,BrokerageLink,RYURX,RYDEX INVERSE S&P 500 STRATEGY INV CL,10,$10.00,$0.00,$100.00,$0.00,0.00%,$0.00,0.00%,50.00%,$100.00,$10.00,Cash
`;

await runTest('parsePortfolioCsv normalizes holdings and option symbols', () => {
  const holdings = parsePortfolioCsv(sampleCsv);
  assert.equal(holdings.length, 6);
  assert.equal(holdings[0].symbol, '-ABC270115C20');
  assert.equal(holdings[0].assetType, 'option');
  assert.equal(holdings[1].assetType, 'cash');
});

await runTest('payload ignores Jefferson account and flags idle Rollover cash', () => {
  const holdings = parsePortfolioCsv(sampleCsv);
  const payload = buildPortfolioHealthPayload({
    date: '2026-05-07',
    holdings,
    etfUniverse: new Set(['VTI', 'VXUS', 'AVUV', 'SCHD', 'COWZ', 'PAVE', 'IAU', 'DBMF', 'SGOV']),
    sourceFile: 'sample.csv',
  });

  assert.equal(payload.ignoredHoldings.length, 1);
  assert.equal(payload.includedHoldings.length, 5);
  assert.equal(payload.signal_status, 'alert');
  assert.ok(payload.signals.some(signal => signal.name === 'Rollover IRA idle cash'));
  assert.equal(payload.rolloverAllocation.reduce((sum, row) => sum + row.targetPct, 0), 100);
});

await runTest('ETF markdown extraction drives candidate selection', () => {
  const universe = extractEtfUniverseFromMarkdown(['**VTI, ITOT, SCHB, VXUS, AVUV, SCHD, COWZ, PAVE, IAU, DBMF, SGOV**']);
  const allocation = buildRolloverAllocation({ rolloverValue: 1000, etfUniverse: universe });
  assert.deepEqual(allocation.map(row => row.ticker), ['VTI', 'VXUS', 'AVUV', 'SCHD', 'COWZ', 'PAVE', 'IAU', 'DBMF', 'SGOV']);
  assert.equal(allocation[0].targetDollars, 350);
});

await runTest('health note includes required pull-note frontmatter and allocation section', () => {
  const payload = buildPortfolioHealthPayload({
    date: '2026-05-07',
    holdings: parsePortfolioCsv(sampleCsv),
    etfUniverse: new Set(['VTI', 'VXUS', 'AVUV', 'SCHD', 'COWZ', 'PAVE', 'IAU', 'DBMF', 'SGOV']),
    sourceFile: 'sample.csv',
  });
  const note = buildPortfolioHealthNote(payload);
  assert.match(note, /source: "Fidelity positions CSV"/);
  assert.match(note, /signal_status: "alert"/);
  assert.match(note, /## Rollover IRA ETF Balance Model/);
  assert.match(note, /Investor.gov/);
});

await runTest('optional portfolio-health run skips cleanly when no CSV is configured', async () => {
  const prior = process.env.PORTFOLIO_POSITIONS_CSV;
  delete process.env.PORTFOLIO_POSITIONS_CSV;
  try {
    const result = await pullPortfolioHealth({ optional: true });
    assert.equal(result.ok, true);
    assert.deepEqual(result.skipped, ['Portfolio positions CSV not configured.']);
    assert.equal(result.filePath, null);
    assert.equal(result.sidecarPath, null);
  } finally {
    if (prior === undefined) delete process.env.PORTFOLIO_POSITIONS_CSV;
    else process.env.PORTFOLIO_POSITIONS_CSV = prior;
  }
});

await runTest('daily cadence marks portfolio-health optional', () => {
  const testFile = fileURLToPath(import.meta.url);
  const configPath = resolve(testFile, '..', '..', '..', '99_System', 'config', 'cadences.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const entry = config.cadences.daily.pullers.find(puller => puller.name === 'portfolio-health');
  assert.ok(entry, 'daily cadence is missing portfolio-health entry');
  assert.ok(entry.args.includes('--optional'), 'portfolio-health should be optional in daily cadence');
});
