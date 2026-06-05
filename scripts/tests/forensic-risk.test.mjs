import assert from 'node:assert/strict';

import {
  buildForensicInvestigationMemo,
  buildForensicRiskNote,
  runForensicRisk,
} from '../pullers/forensic-risk.mjs';

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

const fixtureDatasets = new Map([
  ['TEST', {
    symbol: 'TEST',
    companyName: 'Test Manufacturing Co.',
    annual: [
      {
        fiscalYear: '2025',
        revenue: 1500,
        costOfRevenue: 900,
        grossProfit: 600,
        sellingGeneralAndAdministrativeExpenses: 260,
        netIncome: 90,
        incomeBeforeTax: 110,
        operatingIncome: 130,
        totalAssets: 1600,
        totalCurrentAssets: 520,
        cashAndShortTermInvestments: 80,
        netReceivables: 310,
        propertyPlantEquipmentNet: 330,
        totalLiabilities: 1180,
        totalCurrentLiabilities: 500,
        totalDebt: 820,
        retainedEarnings: 120,
        depreciationAndAmortization: 35,
        operatingCashFlow: -360,
        commonStockIssued: 80,
        weightedAverageShsOut: 140,
        marketCap: 480,
      },
      {
        fiscalYear: '2024',
        revenue: 1000,
        costOfRevenue: 520,
        grossProfit: 480,
        sellingGeneralAndAdministrativeExpenses: 120,
        netIncome: 100,
        incomeBeforeTax: 120,
        operatingIncome: 140,
        totalAssets: 1450,
        totalCurrentAssets: 570,
        cashAndShortTermInvestments: 140,
        netReceivables: 130,
        propertyPlantEquipmentNet: 420,
        totalLiabilities: 720,
        totalCurrentLiabilities: 330,
        totalDebt: 430,
        retainedEarnings: 220,
        depreciationAndAmortization: 70,
        operatingCashFlow: 160,
        commonStockIssued: 0,
        weightedAverageShsOut: 110,
        marketCap: 720,
      },
    ],
    provenance: {
      provider: 'fixture',
      periods: ['2025', '2024'],
      concepts: ['revenue', 'netIncome', 'operatingCashFlow'],
      sourcePath: 'fixture://forensic-risk/test',
    },
  }],
  ['CLEAN', {
    symbol: 'CLEAN',
    companyName: 'Clean Compounder Inc.',
    annual: [
      {
        fiscalYear: '2025',
        revenue: 1400,
        costOfRevenue: 620,
        grossProfit: 780,
        sellingGeneralAndAdministrativeExpenses: 190,
        netIncome: 230,
        incomeBeforeTax: 280,
        operatingIncome: 310,
        totalAssets: 1500,
        totalCurrentAssets: 650,
        cashAndShortTermInvestments: 260,
        netReceivables: 150,
        propertyPlantEquipmentNet: 300,
        totalLiabilities: 420,
        totalCurrentLiabilities: 180,
        totalDebt: 150,
        retainedEarnings: 620,
        depreciationAndAmortization: 48,
        operatingCashFlow: 290,
        commonStockIssued: 0,
        weightedAverageShsOut: 95,
        marketCap: 4200,
      },
      {
        fiscalYear: '2024',
        revenue: 1200,
        costOfRevenue: 560,
        grossProfit: 640,
        sellingGeneralAndAdministrativeExpenses: 180,
        netIncome: 180,
        incomeBeforeTax: 225,
        operatingIncome: 250,
        totalAssets: 1320,
        totalCurrentAssets: 520,
        cashAndShortTermInvestments: 190,
        netReceivables: 140,
        propertyPlantEquipmentNet: 310,
        totalLiabilities: 460,
        totalCurrentLiabilities: 210,
        totalDebt: 180,
        retainedEarnings: 470,
        depreciationAndAmortization: 45,
        operatingCashFlow: 230,
        commonStockIssued: 0,
        weightedAverageShsOut: 98,
        marketCap: 3500,
      },
    ],
    provenance: {
      provider: 'fixture',
      periods: ['2025', '2024'],
      concepts: ['revenue', 'netIncome', 'operatingCashFlow'],
      sourcePath: 'fixture://forensic-risk/clean',
    },
  }],
]);

const loadDataset = async symbol => fixtureDatasets.get(symbol);

await runTest('runForensicRisk scores symbols and gates investigation memos by threshold', async () => {
  const result = await runForensicRisk({
    flags: { symbols: 'TEST,CLEAN', threshold: 'alert', 'dry-run': true },
    loadDataset,
    date: '2026-05-30',
  });

  assert.equal(result.source, 'forensic-risk');
  assert.equal(result.dryRun, true);
  assert.equal(result.results.length, 2);
  assert.equal(result.signalStatus, 'critical');
  assert.deepEqual(result.signals, ['beneish-watch', 'altman-distress', 'sloan-accruals', 'piotroski-weak']);
  assert.equal(result.memos.length, 1);
  assert.equal(result.memos[0].symbol, 'TEST');
  assert.equal(result.filePath, null);
});

await runTest('forensic risk note includes required pull-note frontmatter and provenance', async () => {
  const result = await runForensicRisk({
    flags: { symbols: 'TEST,CLEAN', threshold: 'alert', 'dry-run': true },
    loadDataset,
    date: '2026-05-30',
  });
  const note = buildForensicRiskNote(result);

  assert.match(note, /title: "Forensic Risk Screen"/);
  assert.match(note, /domain: "fundamentals"/);
  assert.match(note, /data_type: "forensic_risk"/);
  assert.match(note, /signal_status: "critical"/);
  assert.match(note, /## Metric Flags/);
  assert.match(note, /fixture:\/\/forensic-risk\/test/);
});

await runTest('investigation memo states flags are research triage and not proof', async () => {
  const result = await runForensicRisk({
    flags: { symbols: 'TEST', threshold: 'alert', 'dry-run': true },
    loadDataset,
    date: '2026-05-30',
  });
  const memo = buildForensicInvestigationMemo(result.memos[0]);

  assert.match(memo, /probability flags, not proof/i);
  assert.match(memo, /Human Review Checklist/);
  assert.match(memo, /Beneish M-Score/);
});
