import assert from 'node:assert/strict';

import {
  classifyForensicSeverity,
  computeAltmanZScore,
  computeBeneishMScore,
  computePiotroskiFScore,
  computeSloanAccrualsRatio,
  scoreForensicDataset,
} from '../lib/forensics/scoring.mjs';

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

const stressedDataset = {
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
    sourcePath: 'fixture://forensic-risk/stressed',
  },
};

const cleanDataset = {
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
};

await runTest('computes Beneish M-Score and flags manipulation watch above -2.22', () => {
  const metric = computeBeneishMScore(stressedDataset.annual);
  assert.equal(metric.id, 'beneish-watch');
  assert.equal(metric.flagged, true);
  assert.ok(metric.value > -2.22);
  assert.ok(metric.components.dsri > 1.5);
  assert.ok(metric.components.tata > 0.25);
});

await runTest('computes Altman Z-Score and flags distress below 1.81', () => {
  const metric = computeAltmanZScore(stressedDataset.annual);
  assert.equal(metric.id, 'altman-distress');
  assert.equal(metric.flagged, true);
  assert.ok(metric.value < 1.81);
  assert.ok(metric.components.workingCapitalToAssets < 0.05);
});

await runTest('computes Sloan accruals ratio and flags non-cash earnings above threshold', () => {
  const metric = computeSloanAccrualsRatio(stressedDataset.annual);
  assert.equal(metric.id, 'sloan-accruals');
  assert.equal(metric.flagged, true);
  assert.ok(metric.value > 0.25);
});

await runTest('computes Piotroski F-Score with weakness flag below 6', () => {
  const metric = computePiotroskiFScore(stressedDataset.annual);
  assert.equal(metric.id, 'piotroski-weak');
  assert.equal(metric.flagged, true);
  assert.ok(metric.value < 6);
  assert.equal(metric.components.positiveNetIncome, true);
  assert.equal(metric.components.positiveOperatingCashFlow, false);
});

await runTest('classifies combined forensic severity from metric flags', () => {
  const scored = scoreForensicDataset(stressedDataset);
  assert.equal(scored.signalStatus, 'critical');
  assert.deepEqual(scored.signals, ['beneish-watch', 'altman-distress', 'sloan-accruals', 'piotroski-weak']);
  assert.equal(classifyForensicSeverity(scored.metrics), 'critical');
});

await runTest('keeps clean datasets clear while preserving provenance', () => {
  const scored = scoreForensicDataset(cleanDataset);
  assert.equal(scored.signalStatus, 'clear');
  assert.deepEqual(scored.signals, []);
  assert.equal(scored.provenance.provider, 'fixture');
});
