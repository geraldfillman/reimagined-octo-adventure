import assert from 'node:assert/strict';

import {
  buildResearchScoutPayload,
  classifyCandidateStatus,
  noteMatchesChannel,
} from '../pullers/weekly-research-scout.mjs';

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function note({ channel, title, content }) {
  return {
    channel,
    filename: `${title.replace(/\W+/g, '_')}.md`,
    path: `C:/tmp/${title}.md`,
    rel_path: `05_Data_Pulls/Test/${title}.md`,
    data: { title, date_pulled: '2026-06-03', tags: [] },
    content,
  };
}

runTest('classifies one-channel evidence as watch only', () => {
  assert.equal(classifyCandidateStatus({ confirmationCount: 0 }), 'clear');
  assert.equal(classifyCandidateStatus({ confirmationCount: 1 }), 'watch');
  assert.equal(classifyCandidateStatus({ confirmationCount: 2 }), 'alert');
  assert.equal(classifyCandidateStatus({ confirmationCount: 3, urgentCount: 1 }), 'critical');
});

runTest('keeps news-only AI power cluster at watch', () => {
  const payload = buildResearchScoutPayload({
    asOfDate: '2026-06-03',
    evidenceNotes: [
      note({
        channel: 'newsapi',
        title: 'Data center power demand',
        content: 'AI data center electricity demand is stressing grid power capacity.',
      }),
    ],
    thesisNotes: [],
  });

  const candidate = payload.candidates.find(item => item.id === 'ai-power-grid-bottleneck');
  assert.equal(candidate.signal_status, 'watch');
  assert.equal(candidate.confirmation_count, 1);
  assert.equal(candidate.is_new_candidate, true);
  assert.equal(payload.summary.alert_or_higher_count, 0);
});

runTest('raises alert when independent channels support the same new thesis candidate', () => {
  const payload = buildResearchScoutPayload({
    asOfDate: '2026-06-03',
    evidenceNotes: [
      note({
        channel: 'newsapi',
        title: 'Data center grid bottleneck',
        content: 'AI data center grid power demand is accelerating.',
      }),
      note({
        channel: 'fmp_news',
        title: 'Power equipment beneficiaries',
        content: 'Financial Modeling Prep news mentions data center electricity and power grid equipment demand.',
      }),
      note({
        channel: 'semantic_scholar',
        title: 'Compute electricity research',
        content: 'Academic research discusses artificial intelligence compute load and grid electricity constraints.',
      }),
    ],
    thesisNotes: [],
  });

  const candidate = payload.candidates.find(item => item.id === 'ai-power-grid-bottleneck');
  assert.equal(candidate.signal_status, 'alert');
  assert.equal(candidate.confirmation_count, 3);
  assert.equal(candidate.recommended_action, 'promote-to-watchpoint-review');
  assert.equal(payload.summary.alert_or_higher_count, 1);
});

runTest('maps candidates to existing theses when thesis notes share theme terms', () => {
  const payload = buildResearchScoutPayload({
    asOfDate: '2026-06-03',
    evidenceNotes: [
      note({
        channel: 'newsapi',
        title: 'Rare earth tariff news',
        content: 'Rare earth critical minerals and steel tariff headlines affect energy and materials supply.',
      }),
      note({
        channel: 'sourcewatch',
        title: 'Critical minerals source watch',
        content: 'SourceWatch posts discuss rare earth critical minerals supply.',
      }),
    ],
    thesisNotes: [
      {
        filename: 'Critical Materials.md',
        thesis_name: 'Critical Materials Supply Chain',
        data: { name: 'Critical Materials Supply Chain' },
        content: 'This thesis tracks rare earth critical minerals and copper supply.',
      },
    ],
  });

  const candidate = payload.candidates.find(item => item.id === 'energy-critical-materials');
  assert.equal(candidate.signal_status, 'alert');
  assert.equal(candidate.is_new_candidate, false);
  assert.deepEqual(candidate.related_existing_theses, ['Critical Materials Supply Chain']);
  assert.equal(candidate.recommended_action, 'research');
});

runTest('recognizes theme terms reports as an independent research evidence channel', () => {
  const themeNote = {
    filename: '2026-06-03_Neocloud_Photonics_Terms_Report.md',
    data: {
      title: 'Neocloud Photonics Terms Report',
      data_type: 'theme_terms_report',
      tags: ['research', 'terms-to-know'],
    },
    content: 'Neocloud photonics and optical interconnects for AI compute capacity.',
  };

  assert.equal(noteMatchesChannel(themeNote, 'theme_terms'), true);
  assert.equal(noteMatchesChannel(themeNote, 'sourcewatch'), false);
});

runTest('theme terms reports can confirm AI infrastructure thesis candidates', () => {
  const payload = buildResearchScoutPayload({
    asOfDate: '2026-06-03',
    evidenceNotes: [
      note({
        channel: 'theme_terms',
        title: 'Neocloud Photonics Terms Report',
        content: 'Neocloud providers use photonics and optical interconnects for AI compute and data center capacity.',
      }),
      note({
        channel: 'sourcewatch',
        title: 'AI data center power follow-up',
        content: 'SourceWatch posts discuss AI data center power, grid, and electricity bottlenecks.',
      }),
    ],
    thesisNotes: [],
  });

  const candidate = payload.candidates.find(item => item.id === 'ai-power-grid-bottleneck');
  assert.equal(candidate.signal_status, 'alert');
  assert.equal(candidate.confirmation_count, 2);
  assert.deepEqual(candidate.evidence_channels.sort(), ['sourcewatch', 'theme_terms']);
});
