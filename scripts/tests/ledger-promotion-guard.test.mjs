import assert from 'node:assert/strict';

import {
  finalizePromotionRecords,
  guardLedgerPromotions,
  validatePositionBlock,
} from '../lib/ledger-promotion-guard.mjs';

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

const LEDGER = `# Market Positioning Ledger

## Active Ledger

| Signal / Theme | Stance | Gate | Gate Delta | Source Ref | Watchpoint | Position Block | Trigger / Watch | Invalidation | Outcome Status |
|---|---|---:|---|---|---|---|---|---|---|
| Quality Software Dispersion | Prepare | 2 | 0->2 (2026-06-03) | \`My_Data/05_Data_Pulls/Fundamentals/2026-06-02_Cash_Flow_Quality.md\` | [[Market Positioning Ledger - Positions#quality-software-dispersion|ledger watchpoint]] | [[Market Positioning Ledger - Positions#quality-software-dispersion]] | Gate 3 only if relative strength confirms | Stand aside if breadth broadens | fresh seed |
| Energy Shock Oil Watch | Prepare | 1 | 0->1 (2026-06-03) | \`My_Data/05_Data_Pulls/SourceWatch/2026-06-02_Source_Watch_Posts.md\` | [[Market Positioning Ledger - Positions#energy-shock-oil-watch|ledger watchpoint]] | [[Market Positioning Ledger - Positions#energy-shock-oil-watch]] | USO closes above value area | Source stack fades | fresh seed |

## Portfolio House View
`;

const POSITIONS = `# Market Positioning Ledger - Positions

## quality-software-dispersion

**Position Reasoning.** A complete Gate 2 setup with a defined-risk option expression and fresh evidence.

| Field | Value |
|---|---|
| Action Label | Prepare |
| Position State | Flat |
| Direction Tag | Neutral |
| Purpose Tag | Directional |
| Instrument | Defined-risk option spread |
| Structure | Pair-style option spread with capped risk |
| Entry | Trigger only after relative strength confirms. |
| Stop / Invalidation | Stand aside if software breadth improves. |
| Target 1 | Spread widens over one to five sessions. |
| Target 2 | Follow-up confluence scan confirms. |
| Max Loss | Spread debit. |
| Max Profit | Spread width minus debit. |
| Reward:Risk | Minimum 1.5:1. |
| Breakeven | Expression-specific level. |
| Sizing | Maximum 0.25R. |
| Hold Window | One to five trading days. |
| Conviction | OOOoo |
| Correlation | Software factor but reduced broad beta. |
| Exit Plan | Exit if spread fails to widen. |
| Catalyst Calendar | ORB, options review, earnings. |

**Option-Tag Stack:**

| Tag | Value |
|---|---|
| Direction Exposure | Neutral |
| Protection | Yes |
| Income | No |
| Volatility Stance | Vega-neutral |
| Defined Risk | Yes |

## energy-shock-oil-watch

**Position Reasoning.** Incomplete watch-only block.
`;

const GATE3_CANDIDATE = {
  row: 'Quality Software Dispersion',
  from_gate: 2,
  to_gate: 3,
  reason: 'Relative strength trigger fired.',
  trigger_evidence_paths: ['05_Data_Pulls/Market/2026-06-03_ORB_Entropy_Screen.md'],
  primary_underlying: 'MSFT',
  directional_verdict: 'BULLISH',
  confidence_pct: 62,
  refutation_reasoning: 'High-CFQ name confirmed relative strength while weak tactical leg failed.',
};

await runTest('allows non-Gate-3 updates through the guard', async () => {
  const result = await guardLedgerPromotions({
    candidates: [{ row: 'Energy Shock Oil Watch', from_gate: 1, to_gate: 2, reason: 'Confirmed source.' }],
    ledgerMarkdown: LEDGER,
    positionsMarkdown: POSITIONS,
    runId: 'S6-test',
    agent: 'Positioning Agent',
  });

  assert.equal(result.allowed.length, 1);
  assert.equal(result.blocked.length, 0);
  assert.equal(result.records[0].reason, 'not-gate-3');
});

await runTest('blocks direct Gate 4 updates from S6', async () => {
  const result = await guardLedgerPromotions({
    candidates: [{ row: 'Quality Software Dispersion', from_gate: 3, to_gate: 4, reason: 'Outcome label.' }],
    ledgerMarkdown: LEDGER,
    positionsMarkdown: POSITIONS,
    runId: 'S6-test',
    agent: 'Positioning Agent',
  });

  assert.equal(result.allowed.length, 0);
  assert.equal(result.blocked[0].reason, 'outcome-review-required');
});

await runTest('blocks malformed Gate 3 candidates missing required fields', async () => {
  const result = await guardLedgerPromotions({
    candidates: [{ row: 'Quality Software Dispersion', from_gate: 2, to_gate: 3, reason: 'Too thin.' }],
    ledgerMarkdown: LEDGER,
    positionsMarkdown: POSITIONS,
    runId: 'S6-test',
    agent: 'Positioning Agent',
  });

  assert.equal(result.blocked[0].reason, 'missing-gate3-fields');
  assert.deepEqual(result.records[0].missing_fields, [
    'trigger_evidence_paths',
    'primary_underlying',
    'directional_verdict',
    'refutation_reasoning',
  ]);
});

await runTest('blocks Gate 3 when the Position Block is missing', async () => {
  const result = await guardLedgerPromotions({
    candidates: [GATE3_CANDIDATE],
    ledgerMarkdown: LEDGER,
    positionsMarkdown: '# Empty Positions\n',
    promotionHistory: { records: [{ row: 'Quality Software Dispersion', primary_underlying: 'MSFT', status: 'blocked' }] },
    runId: 'S6-test',
    agent: 'Positioning Agent',
  });

  assert.equal(result.blocked[0].reason, 'position-block-not-found');
});

await runTest('blocks first-call Gate 3 as context-only', async () => {
  const result = await guardLedgerPromotions({
    candidates: [GATE3_CANDIDATE],
    ledgerMarkdown: LEDGER,
    positionsMarkdown: POSITIONS,
    promotionHistory: { records: [] },
    runId: 'S6-test',
    agent: 'Positioning Agent',
  });

  assert.equal(result.allowed.length, 0);
  assert.equal(result.blocked[0].reason, 'first-call-context-only');
});

await runTest('blocks refuted trajectory-aware Gate 3 candidates', async () => {
  const result = await guardLedgerPromotions({
    candidates: [GATE3_CANDIDATE],
    ledgerMarkdown: LEDGER,
    positionsMarkdown: POSITIONS,
    promotionHistory: { records: [{ row: 'Quality Software Dispersion', primary_underlying: 'MSFT', status: 'blocked', reason: 'prior-watch' }] },
    runId: 'S6-test',
    agent: 'Positioning Agent',
    liveRefutation: true,
    evaluateRefutation: async () => ({ verdict_survives: false, refuted_count: 2, challenge_count: 3, reason: 'quorum-refuted', discrimination_mode: 'trajectory-aware' }),
  });

  assert.equal(result.allowed.length, 0);
  assert.equal(result.blocked[0].reason, 'quorum-refuted');
  assert.equal(result.records[0].prior_calls_count, 1);
  assert.equal(result.records[0].verdict_survives, false);
});

await runTest('allows survived trajectory-aware Gate 3 candidates', async () => {
  const result = await guardLedgerPromotions({
    candidates: [GATE3_CANDIDATE],
    ledgerMarkdown: LEDGER,
    positionsMarkdown: POSITIONS,
    promotionHistory: { records: [{ row: 'Quality Software Dispersion', primary_underlying: 'MSFT', status: 'blocked', reason: 'prior-watch' }] },
    runId: 'S6-test',
    agent: 'Positioning Agent',
    liveRefutation: true,
    evaluateRefutation: async () => ({ verdict_survives: true, refuted_count: 1, challenge_count: 3, reason: 'quorum-survived', discrimination_mode: 'trajectory-aware' }),
  });

  assert.equal(result.allowed.length, 1);
  assert.equal(result.blocked.length, 0);
  assert.equal(result.records[0].reason, 'trajectory-refutation-survived');
});

await runTest('finalizes allowed records with applied checklist path', () => {
  const records = finalizePromotionRecords({
    guardRecords: [{ row: 'Quality Software Dispersion', to_gate: 3, status: 'allowed', reason: 'trajectory-refutation-survived' }],
    reconciliation: { applied: [{ row: 'Quality Software Dispersion', to_gate: 3 }], skipped: [] },
    checklistPath: '05_Data_Pulls/Positioning/2026-06-03_Positioning_Checklist.md',
  });

  assert.equal(records[0].status, 'applied');
  assert.equal(records[0].applied, true);
  assert.match(records[0].checklist_path, /Positioning_Checklist/);
});

await runTest('validates complete Position Blocks', () => {
  const row = {
    position_block: '[[Market Positioning Ledger - Positions#quality-software-dispersion]]',
  };

  const result = validatePositionBlock({ row, positionsMarkdown: POSITIONS });
  assert.equal(result.ok, true);
  assert.equal(result.reason, 'position-block-complete');
});
