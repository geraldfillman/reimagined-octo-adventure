import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  buildWorldMachineBridgePackets,
  checkPositioningFreshness,
  upsertWorldMachinePromotionQueue,
  writeApprovedWorldMachineCandidates,
} from '../lib/world-machine-bridge.mjs';

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

await runTest('May 12 fixtures create the GEV single-ticker packet with rollup evidence', async () => {
  const root = makeFixtureVault();
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot: root,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });

    const gevPackets = packets.filter(packet => packet.type === 'single_ticker_watch' && packet.symbol === 'GEV');
    assert.equal(gevPackets.length, 1);
    assert.equal(gevPackets[0].thesis, 'AI Power Defense Stack');
    assert.equal(gevPackets[0].suggested_route, '06_Strategy_Development/Watchpoints');
    assert.equal(gevPackets[0].promotion_status, 'needs_review');
    assert.ok(gevPackets[0].evidence_links.some(link => link.rel_path === '05_Data_Pulls/Market/2026-05-12_Agent_Analysis_GEV.md'));
    assert.ok(gevPackets[0].evidence_links.some(link => link.rel_path === '05_Data_Pulls/Theses/2026-05-12_Agent_Analysis_All_Theses.md'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

await runTest('opportunity viewpoints become compact review packets without copied cards', async () => {
  const root = makeFixtureVault();
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot: root,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });

    const viewpoints = packets.filter(packet => packet.type === 'opportunity_viewpoint');
    assert.equal(viewpoints.length, 2);
    assert.match(viewpoints[0].title, /Conviction Momentum Before Upgrade/);
    assert.match(viewpoints[0].summary, /positive signal momentum/);
    assert.ok(viewpoints[0].summary.length < 280);
    assert.doesNotMatch(viewpoints[0].summary, /Next Work|Viewpoint Cards|###/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

await runTest('sector summary emits one packet for the capital raise survivor confirm', async () => {
  const root = makeFixtureVault();
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot: root,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });

    const confirms = packets.filter(packet => packet.type === 'sector_confirm');
    assert.equal(confirms.length, 1);
    assert.match(confirms[0].title, /Capital Raise Survivors Small-Cap Inflection Basket/);
    assert.equal(confirms[0].suggested_route, '06_Strategy_Development/Watchpoints');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

await runTest('GDELT all-fetch failure is a source gap and not a news cluster', async () => {
  const root = makeFixtureVault();
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot: root,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });

    assert.equal(packets.some(packet => packet.type === 'news_cluster'), false);
    const gap = packets.find(packet => packet.type === 'source_gap');
    assert.ok(gap);
    assert.match(gap.title, /GDELT/);
    assert.equal(gap.suggested_route, '01_Data_Sources/News_Media');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

await runTest('World_Machine promotion queue is idempotent and preserves human notes', async () => {
  const root = makeFixtureVault();
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot: root,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });
    const inbox = [
      '# Human Inbox',
      '',
      '## Open',
      '',
      '- [ ] Existing human task',
      '',
      '## World Machine Promotion Queue - 2026-05-12',
      '',
      '- [ ] stale task',
      '',
      '## Later',
      '',
      '- keep me',
      '',
    ].join('\n');

    const once = upsertWorldMachinePromotionQueue(inbox, packets, { date: '2026-05-12' });
    const twice = upsertWorldMachinePromotionQueue(once, packets, { date: '2026-05-12' });

    assert.equal(twice, once);
    assert.match(once, /Existing human task/);
    assert.match(once, /## Later/);
    assert.doesNotMatch(once, /stale task/);
    assert.match(once, /\[world-machine\/single_ticker_watch\]/);
    assert.match(once, /\[world-machine\/source_gap\]/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

await runTest('World Machine writer emits only approved inbox candidates', async () => {
  const root = makeFixtureVault();
  const worldRoot = mkdtempSync(join(tmpdir(), 'world-machine-target-'));
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot: root,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });
    const approved = packets.map((packet, index) => ({
      ...packet,
      promotion_status: index === 0 ? 'approved' : packet.promotion_status,
    }));

    const result = writeApprovedWorldMachineCandidates({
      worldRoot,
      packets: approved,
      date: '2026-05-12',
    });

    assert.equal(result.written.length, 1);
    assert.match(result.written[0], /_Inbox[\\/]World Machine Candidate Packets/);
    assert.equal(existsSync(join(worldRoot, 'Entities')), false);
    assert.equal(existsSync(join(worldRoot, '06_Strategy_Development')), false);

    const content = readFileSync(result.written[0], 'utf-8');
    assert.match(content, /type: "world_machine_candidate"/);
    assert.match(content, /promotion_status: "approved"/);
    assert.doesNotMatch(content, /^\| Score \|/m);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// writeApprovedWorldMachineCandidates — throws when worldRoot is missing
// ---------------------------------------------------------------------------

await runTest('writeApprovedWorldMachineCandidates throws when worldRoot is not provided', async () => {
  assert.throws(
    () => writeApprovedWorldMachineCandidates({ packets: [] }),
    /worldRoot is required/i,
    'must throw with a message about worldRoot being required'
  );
});

await runTest('writeApprovedWorldMachineCandidates throws when worldRoot is explicitly undefined', async () => {
  assert.throws(
    () => writeApprovedWorldMachineCandidates({ worldRoot: undefined, packets: [] }),
    /worldRoot is required/i
  );
});

// ---------------------------------------------------------------------------
// writeApprovedWorldMachineCandidates — only 'approved' packets are written
// ---------------------------------------------------------------------------

await runTest('only packets with promotion_status approved are written, others are excluded', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'wmb-approved-only-'));
  try {
    const packets = [
      makePacket('alpha', 'approved'),
      makePacket('beta', 'watch'),
      makePacket('gamma', 'alert'),
      makePacket('delta', 'needs_review'),
    ];

    const result = writeApprovedWorldMachineCandidates({ worldRoot, packets, date: '2026-05-25', dryRun: true });

    assert.equal(result.approved, 1, 'only 1 approved packet should be counted');
    assert.equal(result.written.length, 1, 'only 1 file path should be returned');
    assert.match(result.written[0], /alpha/i, 'written path should reference the approved packet title');
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('packets with status watch are excluded from written output', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'wmb-exclude-watch-'));
  try {
    const result = writeApprovedWorldMachineCandidates({
      worldRoot,
      date: '2026-05-25',
      dryRun: true,
      packets: [makePacket('watch-packet', 'watch')],
    });

    assert.equal(result.approved, 0);
    assert.equal(result.written.length, 0);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('packets with status alert are excluded from written output', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'wmb-exclude-alert-'));
  try {
    const result = writeApprovedWorldMachineCandidates({
      worldRoot,
      date: '2026-05-25',
      dryRun: true,
      packets: [makePacket('alert-packet', 'alert')],
    });

    assert.equal(result.approved, 0);
    assert.equal(result.written.length, 0);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('packets with status needs_review are excluded from written output', async () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'wmb-exclude-needs-review-'));
  try {
    const result = writeApprovedWorldMachineCandidates({
      worldRoot,
      date: '2026-05-25',
      dryRun: true,
      packets: [makePacket('review-packet', 'needs_review')],
    });

    assert.equal(result.approved, 0);
    assert.equal(result.written.length, 0);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// buildWorldMachineBridgePackets — empty array when no notes exist
// ---------------------------------------------------------------------------

await runTest('buildWorldMachineBridgePackets returns empty array when pull folders contain no notes', async () => {
  const root = mkdtempSync(join(tmpdir(), 'wmb-empty-vault-'));
  try {
    // Create the folder structure but write no note files
    for (const folder of ['Theses', 'Market', 'Sectors', 'News']) {
      mkdirSync(join(root, '05_Data_Pulls', folder), { recursive: true });
    }

    const packets = await buildWorldMachineBridgePackets({
      engineRoot: root,
      date: '2026-05-25',
      pilotTicker: 'GEV',
    });

    assert.ok(Array.isArray(packets), 'result must be an array');
    assert.equal(packets.length, 0, 'must return empty array when no notes exist');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

await runTest('buildWorldMachineBridgePackets returns empty array when pull folders do not exist at all', async () => {
  const root = mkdtempSync(join(tmpdir(), 'wmb-no-folders-'));
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot: root,
      date: '2026-05-25',
      pilotTicker: 'GEV',
    });

    assert.ok(Array.isArray(packets), 'result must be an array');
    assert.equal(packets.length, 0, 'must return empty array when pull folders are absent');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePacket(titleSlug, promotionStatus) {
  return {
    packet_id: `test:2026-05-25:${titleSlug}`,
    type: 'agent_thesis_watch',
    date: '2026-05-25',
    status: 'watch',
    title: titleSlug,
    summary: `Test packet for ${titleSlug}`,
    suggested_route: '03_Macro_and_Economy/Observations',
    target_vault: 'World_Machine',
    promotion_status: promotionStatus,
    review_question: 'Test review question?',
    symbol: null,
    thesis: null,
    score: null,
    posture: null,
    evidence_links: [],
    source_path: '',
    run_id: null,
    review_status: 'unreviewed',
  };
}

function makeFixtureVault() {
  const root = mkdtempSync(join(tmpdir(), 'world-machine-bridge-'));

  writeFixture(root, '05_Data_Pulls/Theses/2026-05-12_Agent_Analysis_All_Theses.md', `---
title: "Agent Analysis Thesis Rollup"
source: "Agent Analyst"
analysis_scope: "thesis"
date_pulled: "2026-05-12"
domain: "market"
data_type: "agent_analysis_rollup"
signal_status: "watch"
---

## Rollup

| Symbol | Verdict | Confidence | Entropy | Status | Note |
| --- | --- | --- | --- | --- | --- |
| GEV | BULLISH | 50% | mixed (0.51) | watch | [[05_Data_Pulls/Market/2026-05-12_Agent_Analysis_GEV]] |
| MSFT | NEUTRAL | 14% | diffuse (0.96) | clear | [[05_Data_Pulls/Market/2026-05-12_Agent_Analysis_MSFT]] |
`);

  writeFixture(root, '05_Data_Pulls/Market/2026-05-12_Agent_Analysis_GEV.md', `---
title: "GEV Agent Analysis"
source: "Agent Analyst"
symbol: "GEV"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-05-12"
domain: "market"
data_type: "agent_analysis"
signal_status: "watch"
final_verdict: "BULLISH"
final_confidence: 0.5
entropy_level: "mixed"
---

## Verdict

- **Final verdict**: BULLISH
- **Final confidence**: 50%
- **Attention status**: watch
- **Reasoning**: Deterministic synthesis is bullish at 50% confidence.
`);

  writeFixture(root, '05_Data_Pulls/Theses/2026-05-12_Opportunity_Viewpoints.md', `---
title: "Opportunity Viewpoints"
source: "Combination Reporting System"
date_pulled: "2026-05-12"
domain: "theses"
data_type: "opportunity_viewpoints"
signal_status: "alert"
---

## Viewpoint Queue

| Score | Lens | Posture | Symbols | Thesis / Sector | Why This Exists | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 146 | Conviction Momentum Before Upgrade | opportunity | N/A | Psychedelic Mental Health Revolution / Healthcare | Psychedelic Mental Health Revolution is showing positive signal momentum before the current conviction/priority fields fully reflect it. | [[2026-05-07_Conviction_Delta]] |
| 42 | Risk Signal First | risk-first | [[AMZN]] | Dilution Alert - AMZN / risk | Dilution Alert - AMZN is a live risk signal that should constrain any related opportunity work. | [[2026-05-02_DILUTION_AMZN]] |

## Viewpoint Cards

### Conviction Momentum Before Upgrade: Psychedelic Mental Health Revolution

**Next Work**
- [ ] This detailed card should not be copied into bridge packet summaries.
`);

  writeFixture(root, '05_Data_Pulls/Sectors/2026-05-12_Sector_Scan_Summary.md', `---
title: "Sector Scan Summary - 2026-05-12"
source: "sector-scan"
date_pulled: "2026-05-12"
domain: "sectors"
data_type: "sector_scan"
signal_status: "watch"
---

## Sector Routing Summary

| Sector | Confirms | Contradicts | Total Hits | Stub Action | Bridge Notes |
| --- | --- | --- | --- | --- | --- |
| Healthcare Sector Basket | 1 | 0 | 1 | none | 0 |

## Signals Written

- [[2026-05-12_CONFIRM_CAPITAL_RAISE_SURVIVORS_SMALL_CAP_INFLECTION_BASKET]]
`);

  writeFixture(root, '05_Data_Pulls/News/2026-05-12_1411_GDELT_News_Monitor.md', `---
title: "GDELT News Monitor (15min)"
source: "GDELT DOC API"
date_pulled: "2026-05-12"
domain: "news"
data_type: "gdelt_news_monitor"
signal_status: "watch"
article_count: 0
fetch_error_count: 9
topic_count: 9
---

## Topic Summary

| Topic | Articles | Top Domain | Latest Seen | Fetch Error | Query |
| --- | --- | --- | --- | --- | --- |
| Markets | 0 | N/A | N/A | fetch failed | "stock market" |
`);

  writeFixture(root, '05_Data_Pulls/News/2026-05-12_FMP_General_News.md', `---
title: "General Market News - FMP"
date_pulled: "2026-05-12"
domain: "news"
data_type: "general_market_news"
signal_status: "clear"
article_count: 50
---
`);

  writeFixture(root, '05_Data_Pulls/News/2026-05-12_News_energy.md', `---
title: "News: energy"
date_pulled: "2026-05-12"
domain: "news"
data_type: "event_list"
signal_status: "watch"
---
`);

  return root;
}

function writeFixture(root, relPath, content) {
  const filePath = join(root, ...relPath.split('/'));
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf-8');
}

// ---------------------------------------------------------------------------
// checkPositioningFreshness — Gap 2: stale positioning guard
// ---------------------------------------------------------------------------

function makeReviewRoot(freshnessNotes = []) {
  const root = mkdtempSync(join(tmpdir(), 'review-root-'));
  for (const note of freshnessNotes) {
    writeFixture(root, `Reports/Freshness/Sources/${note.filename}`, note.content);
  }
  return root;
}

await runTest('checkPositioningFreshness returns fresh:true when no freshness notes exist', async () => {
  const reviewRoot = makeReviewRoot([]);
  try {
    const result = await checkPositioningFreshness(reviewRoot);
    assert.equal(result.fresh, true);
  } finally {
    rmSync(reviewRoot, { recursive: true, force: true });
  }
});

await runTest('checkPositioningFreshness returns fresh:true when reviewRoot is null (fail-open)', async () => {
  const result = await checkPositioningFreshness(null);
  assert.equal(result.fresh, true);
});

await runTest('checkPositioningFreshness returns fresh:true when positioning pulled within cadence window', async () => {
  const recentDate = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10); // 5 days ago
  const reviewRoot = makeReviewRoot([{
    filename: 'positioning-report.md',
    content: `---\ntype: freshness_item\ndomain: positioning\ncadence: weekly\ndate_pulled: "${recentDate}"\n---\n`,
  }]);
  try {
    const result = await checkPositioningFreshness(reviewRoot);
    assert.equal(result.fresh, true);
  } finally {
    rmSync(reviewRoot, { recursive: true, force: true });
  }
});

await runTest('checkPositioningFreshness returns fresh:false when positioning is 23 days stale (weekly cadence)', async () => {
  const staleDate = new Date(Date.now() - 23 * 86400000).toISOString().slice(0, 10); // 23 days ago
  const reviewRoot = makeReviewRoot([{
    filename: 'positioning-report.md',
    content: `---\ntype: freshness_item\ndomain: positioning\ncadence: weekly\ndate_pulled: "${staleDate}"\n---\n`,
  }]);
  try {
    const result = await checkPositioningFreshness(reviewRoot);
    assert.equal(result.fresh, false);
    assert.ok(result.daysSince >= 23);
    assert.equal(result.cadence, 'weekly');
  } finally {
    rmSync(reviewRoot, { recursive: true, force: true });
  }
});

await runTest('checkPositioningFreshness ignores non-positioning freshness notes', async () => {
  const staleDate = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const reviewRoot = makeReviewRoot([{
    filename: 'news-freshness.md',
    content: `---\ntype: freshness_item\ndomain: news\ncadence: daily\ndate_pulled: "${staleDate}"\n---\n`,
  }]);
  try {
    const result = await checkPositioningFreshness(reviewRoot);
    assert.equal(result.fresh, true); // no positioning notes → fail-open
  } finally {
    rmSync(reviewRoot, { recursive: true, force: true });
  }
});

await runTest('stale positioning causes sector_confirm to become source_gap', async () => {
  const engineRoot = makeFixtureVault();
  const staleDate = new Date(Date.now() - 23 * 86400000).toISOString().slice(0, 10);
  const reviewRoot = makeReviewRoot([{
    filename: 'positioning-report.md',
    content: `---\ntype: freshness_item\ndomain: positioning\ncadence: weekly\ndate_pulled: "${staleDate}"\n---\n`,
  }]);
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot,
      reviewRoot,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });
    const confirms = packets.filter(p => p.type === 'sector_confirm');
    const gaps = packets.filter(p => p.type === 'source_gap' && /positioning/i.test(p.title));
    assert.equal(confirms.length, 0, 'sector_confirm should be replaced by source_gap when positioning is stale');
    assert.ok(gaps.length >= 1, 'at least one positioning source_gap should be emitted');
    assert.equal(gaps[0].suggested_route, '01_Data_Sources/Positioning');
  } finally {
    rmSync(engineRoot, { recursive: true, force: true });
    rmSync(reviewRoot, { recursive: true, force: true });
  }
});

await runTest('stale positioning adds warning to single_ticker_watch summary', async () => {
  const engineRoot = makeFixtureVault();
  const staleDate = new Date(Date.now() - 23 * 86400000).toISOString().slice(0, 10);
  const reviewRoot = makeReviewRoot([{
    filename: 'positioning-report.md',
    content: `---\ntype: freshness_item\ndomain: positioning\ncadence: weekly\ndate_pulled: "${staleDate}"\n---\n`,
  }]);
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot,
      reviewRoot,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });
    const ticker = packets.find(p => p.type === 'single_ticker_watch' && p.symbol === 'GEV');
    assert.ok(ticker, 'GEV single_ticker_watch should still be emitted');
    assert.match(ticker.summary, /stale/i, 'summary should contain staleness warning');
  } finally {
    rmSync(engineRoot, { recursive: true, force: true });
    rmSync(reviewRoot, { recursive: true, force: true });
  }
});

await runTest('fresh positioning leaves sector_confirm and single_ticker_watch unchanged', async () => {
  const engineRoot = makeFixtureVault();
  const freshDate = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const reviewRoot = makeReviewRoot([{
    filename: 'positioning-report.md',
    content: `---\ntype: freshness_item\ndomain: positioning\ncadence: weekly\ndate_pulled: "${freshDate}"\n---\n`,
  }]);
  try {
    const packets = await buildWorldMachineBridgePackets({
      engineRoot,
      reviewRoot,
      date: '2026-05-12',
      pilotTicker: 'GEV',
    });
    const confirms = packets.filter(p => p.type === 'sector_confirm');
    const ticker = packets.find(p => p.type === 'single_ticker_watch' && p.symbol === 'GEV');
    assert.equal(confirms.length, 1, 'sector_confirm should be emitted when positioning is fresh');
    assert.ok(ticker, 'GEV single_ticker_watch should be emitted');
    assert.doesNotMatch(ticker.summary, /stale/i, 'summary should not contain staleness warning when fresh');
  } finally {
    rmSync(engineRoot, { recursive: true, force: true });
    rmSync(reviewRoot, { recursive: true, force: true });
  }
});
