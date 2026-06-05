import assert from 'node:assert/strict';

import {
  buildDeterministicSectionDiff,
  extractSection,
} from '../lib/forensics/filing-diff.mjs';

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

await runTest('extractSection pulls a bounded 10-K item section from filing HTML', () => {
  const html = `
    <html><body>
      <h2>Item 1A. Risk Factors</h2>
      <p>Our suppliers may fail to perform under constrained credit markets, which could materially affect operations and liquidity for more than one reporting period.</p>
      <h2>Item 1B. Unresolved Staff Comments</h2>
    </body></html>
  `;
  const section = extractSection(html, {
    start: /item\s+1a\.?\s+risk\s+factors/i,
    end: /item\s+1b\.?/i,
  });

  assert.match(section, /Risk Factors/);
  assert.match(section, /constrained credit markets/);
  assert.doesNotMatch(section, /Unresolved Staff Comments/);
});

await runTest('buildDeterministicSectionDiff reports new and removed long-form sentences', () => {
  const priorText = 'The company depends on one legacy supplier, and disruption could harm revenue visibility across future periods. This sentence is shared and should not appear in the diff output because both periods contain it.';
  const currentText = 'The company depends on a new financing partner, and covenant stress could restrict liquidity across future periods. This sentence is shared and should not appear in the diff output because both periods contain it.';

  const diff = buildDeterministicSectionDiff({
    sectionId: 'riskFactors',
    label: 'Risk Factors',
    currentText,
    priorText,
  });

  assert.equal(diff.currentAvailable, true);
  assert.equal(diff.priorAvailable, true);
  assert.ok(diff.added.some(sentence => sentence.includes('new financing partner')));
  assert.ok(diff.removed.some(sentence => sentence.includes('legacy supplier')));
});
