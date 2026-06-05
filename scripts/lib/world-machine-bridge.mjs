/**
 * world-machine-bridge.mjs
 *
 * Builds compact, link-only bridge packets from My_Data pull notes. Packets are
 * reviewed in The Research Spine and only approved packets can be written into
 * World_Machine/_Inbox as candidate notes.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { getEngineRoot } from './config.mjs';
import { readFolder } from './frontmatter.mjs';
import { buildNote, buildTable, randomId, today } from './markdown.mjs';
import { parseFirstMarkdownTable } from './markdown-table.mjs';
import { evidenceLink, normalizeVaultPath, obsidianOpenUrl } from './vault-links.mjs';

const SOURCE_VAULT = 'My_Data';
const WORLD_VAULT = 'World_Machine';
const PROMOTABLE_STATUSES = new Set(['watch', 'alert', 'critical']);
const DEFAULT_PILOT_TICKER = 'GEV';
const DEFAULT_VIEWPOINT_LIMIT = 12;

// Cadence window in days — mirrors knowledge-gap-tasks.mjs FRESHNESS_DAYS
const FRESHNESS_DAYS_BRIDGE = {
  '15min': 1, hourly: 1, daily: 2, weekly: 10, monthly: 40, quarterly: 110, 'on-demand': 14,
};

/**
 * Check whether the most recently pulled positioning freshness note is within
 * its declared cadence window. Fails open (returns fresh:true) when the review
 * vault root is absent or no positioning notes exist — this prevents blocking
 * promotions when freshness data has simply never been written.
 *
 * @param {string|null} reviewRoot — path to the World_Machine vault root
 * @returns {Promise<{fresh: boolean, daysSince?: number, cadence?: string}>}
 */
export async function checkPositioningFreshness(reviewRoot) {
  if (!reviewRoot) return { fresh: true };

  const dir = join(reviewRoot, 'Reports', 'Freshness', 'Sources');
  let notes;
  try {
    notes = await readFolder(dir, false);
  } catch {
    return { fresh: true };
  }

  const positioning = notes.filter(n =>
    n.data?.type === 'freshness_item' &&
    String(n.data?.domain || '').toLowerCase() === 'positioning'
  );

  if (positioning.length === 0) return { fresh: true };

  // Use most recently pulled note as the representative
  const mostRecent = positioning.reduce((best, n) => {
    const d = String(n.data?.date_pulled || '');
    return d > String(best.data?.date_pulled || '') ? n : best;
  }, positioning[0]);

  const datePulled = String(mostRecent.data?.date_pulled || '');
  const cadence = String(mostRecent.data?.cadence || 'weekly');
  const parsed = new Date(datePulled);
  if (Number.isNaN(parsed.getTime())) return { fresh: true };

  const daysSince = Math.floor((Date.now() - parsed.getTime()) / 86400000);
  const allowed = FRESHNESS_DAYS_BRIDGE[cadence] ?? 14;
  return { fresh: daysSince <= allowed, daysSince, cadence };
}

export async function buildWorldMachineBridgePackets(options = {}) {
  const engineRoot = options.engineRoot || getEngineRoot();
  const reviewRoot = options.reviewRoot || null;
  const date = options.date || today();
  const pilotTicker = String(options.pilotTicker || options.ticker || DEFAULT_PILOT_TICKER).toUpperCase();
  const viewpointLimit = Math.max(1, Number(options.viewpointLimit || options.limit) || DEFAULT_VIEWPOINT_LIMIT);
  const runId = options.opts?.runId ?? null;
  const pullsRoot = join(engineRoot, '05_Data_Pulls');

  const [thesisNotes, marketNotes, sectorNotes, newsNotes, positioningFreshness] = await Promise.all([
    readFolder(join(pullsRoot, 'Theses'), false),
    readFolder(join(pullsRoot, 'Market'), false),
    readFolder(join(pullsRoot, 'Sectors'), false),
    readFolder(join(pullsRoot, 'News'), false),
    checkPositioningFreshness(reviewRoot),
  ]);

  const allThesisRollups = filterNotes(thesisNotes, {
    date,
    dataType: 'agent_analysis_rollup',
    filenameIncludes: 'Agent_Analysis_All_Theses',
  });
  const tickerAnalyses = filterNotes(marketNotes, {
    date,
    dataType: 'agent_analysis',
    filenameIncludes: `Agent_Analysis_${pilotTicker}`,
  });
  const opportunityNotes = filterNotes(thesisNotes, {
    date,
    dataType: 'opportunity_viewpoints',
    filenameIncludes: 'Opportunity_Viewpoints',
  });
  const sectorSummaries = filterNotes(sectorNotes, {
    date,
    dataType: 'sector_scan',
    filenameIncludes: 'Sector_Scan_Summary',
  });
  const gdeltNotes = filterNotes(newsNotes, {
    date,
    dataType: 'gdelt_news_monitor',
    filenameIncludes: 'GDELT',
  });
  const broadNewsNotes = filterNotes(newsNotes, { date });

  const packets = [
    ...buildAgentThesisPackets({ engineRoot, allThesisRollups, pilotTicker, date, runId }),
    ...buildSingleTickerPackets({ engineRoot, tickerAnalyses, allThesisRollups, pilotTicker, date, runId, positioningFreshness }),
    ...buildOpportunityPackets({ engineRoot, opportunityNotes, date, limit: viewpointLimit, runId }),
    ...buildSectorConfirmPackets({ engineRoot, sectorSummaries, date, runId, positioningFreshness }),
    ...buildNewsPackets({ engineRoot, gdeltNotes, broadNewsNotes, date, runId }),
  ];

  return dedupePackets(packets).sort(comparePackets);
}

export function buildWorldMachinePromotionQueueSection(packets, options = {}) {
  const date = options.date || today();
  const grouped = groupByType(packets);
  const lines = [
    `## World Machine Promotion Queue - ${date}`,
    '',
    '_Human gate: approve a packet before running `node run.mjs pull world-machine-flow --approved-only`._',
    '',
  ];

  if (packets.length === 0) {
    lines.push('_No bridge packets met the current promotion rules._', '');
    return lines.join('\n');
  }

  for (const [type, typePackets] of grouped.entries()) {
    lines.push(`### ${type}`, '');
    for (const packet of typePackets) {
      lines.push(formatQueueTask(packet));
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function upsertWorldMachinePromotionQueue(inboxRaw, packets, options = {}) {
  const date = options.date || today();
  const sectionBlock = buildWorldMachinePromotionQueueSection(packets, { date }).trimEnd();
  const heading = `## World Machine Promotion Queue - ${date}`;
  const escapedHeading = escapeRegExp(heading);
  const sectionRe = new RegExp(`${escapedHeading}[\\s\\S]*?(?=\\n## |$)`);
  const normalized = stripBom(inboxRaw);

  if (sectionRe.test(normalized)) {
    return normalized.replace(sectionRe, sectionBlock);
  }

  const marker = '<!-- AUTO-INSERT-ABOVE';
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex < 0) {
    return `${normalized.trimEnd()}\n\n${sectionBlock}\n`;
  }

  const before = normalized.slice(0, markerIndex).replace(/\s+$/, '');
  const after = normalized.slice(markerIndex);
  return `${before}\n\n${sectionBlock}\n\n${after}`;
}

export function writeApprovedWorldMachineCandidates(options = {}) {
  const worldRoot = options.worldRoot;
  if (!worldRoot) throw new Error('worldRoot is required to write World_Machine candidates.');

  const date = options.date || today();
  const packets = arrayFrom(options.packets).filter(packet =>
    String(packet.promotion_status || '').toLowerCase() === 'approved'
  );
  const outDir = join(worldRoot, '_Inbox', 'World Machine Candidate Packets');
  const written = [];

  for (const packet of packets) {
    const filePath = join(outDir, `${date} - ${safeFilename(packet.title || packet.packet_id)}.md`);
    if (options.dryRun) {
      written.push(filePath);
      continue;
    }

    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, renderWorldMachineCandidate(packet, { date }), 'utf-8');
    written.push(filePath);
  }

  return {
    written,
    approved: packets.length,
    dryRun: Boolean(options.dryRun),
  };
}

export function mergePromotionStatuses(generatedPackets, previousPackets) {
  const statusById = new Map(arrayFrom(previousPackets)
    .filter(packet => packet?.packet_id)
    .map(packet => [packet.packet_id, packet.promotion_status]));

  return arrayFrom(generatedPackets).map(packet => ({
    ...packet,
    promotion_status: statusById.get(packet.packet_id) || packet.promotion_status || 'needs_review',
  }));
}

function buildAgentThesisPackets({ engineRoot, allThesisRollups, pilotTicker, date, runId }) {
  const packets = [];

  for (const note of allThesisRollups) {
    if (!isPromotable(note.data?.signal_status)) continue;
    const table = parseFirstMarkdownTable(sectionContent(note.content, 'Rollup')) || parseFirstMarkdownTable(note.content);
    for (const row of table?.rows || []) {
      const symbol = cleanText(row.Symbol).toUpperCase();
      const status = normalizeStatus(row.Status);
      if (!symbol || !isPromotable(status)) continue;

      packets.push(basePacket({
        type: 'agent_thesis_watch',
        date,
        key: symbol,
        status,
        title: `${symbol} thesis-agent watch`,
        summary: `${symbol} is ${cleanText(row.Verdict).toLowerCase() || 'non-clear'} in the all-thesis agent rollup at ${cleanText(row.Confidence) || 'unknown confidence'} with ${cleanText(row.Entropy) || 'unknown entropy'}.`,
        suggested_route: symbol === pilotTicker ? '02_Strategy_Development/Watchpoints' : '03_Macro_and_Economy/Observations',
        review_question: `Does ${symbol} need a World_Machine watchpoint, thesis bridge, or no action after human review?`,
        symbol,
        source_path: note.path || '',
        run_id: runId,
        evidence_links: [
          noteLink(engineRoot, note.path, 'All-thesis agent rollup'),
          ...linksFromWikiCell(engineRoot, row.Note),
        ],
      }));
    }
  }

  return packets;
}

function buildSingleTickerPackets({ engineRoot, tickerAnalyses, allThesisRollups, pilotTicker, date, runId, positioningFreshness = { fresh: true } }) {
  return tickerAnalyses
    .filter(note => isPromotable(note.data?.signal_status))
    .map(note => {
      const symbol = String(note.data?.symbol || pilotTicker).toUpperCase();
      const thesis = cleanWiki(note.data?.thesis_name || firstValue(note.data?.related_theses) || '');
      const stalenessWarning = positioningFreshness.fresh
        ? ''
        : ` ⚠ Positioning data is ${positioningFreshness.daysSince}d stale (cadence: ${positioningFreshness.cadence}) — verify before acting.`;
      return basePacket({
        type: 'single_ticker_watch',
        date,
        key: symbol,
        status: normalizeStatus(note.data?.signal_status),
        title: `${symbol} single-ticker watch`,
        summary: `${symbol} is ${cleanText(note.data?.final_verdict).toLowerCase() || 'non-clear'} at ${formatConfidence(note.data?.final_confidence)} with ${cleanText(note.data?.entropy_level) || 'unknown'} agent entropy.${stalenessWarning}`,
        suggested_route: '06_Strategy_Development/Watchpoints',
        review_question: `Should ${symbol} become a conditional watchpoint for ${thesis || 'its related thesis'}?`,
        symbol,
        thesis,
        source_path: note.path || '',
        run_id: runId,
        evidence_links: [
          noteLink(engineRoot, note.path, `${symbol} agent analysis`),
          ...allThesisRollups.map(rollup => noteLink(engineRoot, rollup.path, 'All-thesis agent rollup')),
        ],
      });
    });
}

function buildOpportunityPackets({ engineRoot, opportunityNotes, date, limit, runId }) {
  const packets = [];

  for (const note of opportunityNotes) {
    if (!isPromotable(note.data?.signal_status)) continue;
    const table = parseFirstMarkdownTable(sectionContent(note.content, 'Viewpoint Queue')) || parseFirstMarkdownTable(note.content);
    for (const row of (table?.rows || []).slice(0, limit)) {
      const lens = cleanText(row.Lens);
      const thesisSector = cleanText(row['Thesis / Sector']);
      const titleTarget = thesisSector.split('/')[0]?.trim() || cleanText(row.Symbols) || 'cross-source viewpoint';
      const score = cleanText(row.Score);
      const status = cleanText(row.Posture).toLowerCase() === 'risk-first' ? 'alert' : normalizeStatus(note.data?.signal_status);

      packets.push(basePacket({
        type: 'opportunity_viewpoint',
        date,
        key: `${lens}:${titleTarget}`,
        status,
        title: `${lens}: ${titleTarget}`,
        summary: compactSentence(cleanText(row['Why This Exists']), 260),
        suggested_route: '06_Strategy_Development/Watchpoints',
        review_question: `Does this ${cleanText(row.Posture) || 'viewpoint'} deserve a World_Machine watchpoint, observation, or rejection?`,
        score,
        posture: cleanText(row.Posture),
        thesis: titleTarget,
        source_path: note.path || '',
        run_id: runId,
        evidence_links: [
          noteLink(engineRoot, note.path, 'Opportunity viewpoints'),
          ...linksFromWikiCell(engineRoot, row.Evidence),
        ],
      }));
    }
  }

  return packets;
}

function buildSectorConfirmPackets({ engineRoot, sectorSummaries, date, runId, positioningFreshness = { fresh: true } }) {
  const packets = [];

  for (const note of sectorSummaries) {
    if (!isPromotable(note.data?.signal_status)) continue;
    const signals = extractWikiLinks(sectionContent(note.content, 'Signals Written'))
      .filter(link => /CONFIRM_/i.test(link));

    for (const signal of signals) {
      const cleanName = titleFromSignal(signal);

      if (!positioningFreshness.fresh) {
        // Stale positioning data means we cannot reliably confirm sector signals.
        // Emit a source_gap instead to surface the dependency before promotion.
        packets.push(basePacket({
          type: 'source_gap',
          date,
          key: `positioning-stale:${cleanName}`,
          status: 'watch',
          title: `Stale positioning data blocks ${cleanName} sector confirm`,
          summary: `Positioning data is ${positioningFreshness.daysSince}d stale (cadence: ${positioningFreshness.cadence}). Refresh positioning before promoting this sector confirm to a World_Machine watchpoint.`,
          suggested_route: '01_Data_Sources/Positioning',
          review_question: `Refresh positioning data then re-run the sector scan. Is ${cleanName} still confirmed?`,
          source_path: note.path || '',
          run_id: runId,
          evidence_links: [noteLink(engineRoot, note.path, 'Sector scan summary')],
        }));
        continue;
      }

      packets.push(basePacket({
        type: 'sector_confirm',
        date,
        key: cleanName,
        status: 'watch',
        title: `${cleanName} sector confirm`,
        summary: `${cleanName} appeared in the sector scan signal output and needs a human check before becoming a World_Machine watchpoint.`,
        suggested_route: '06_Strategy_Development/Watchpoints',
        review_question: `What threshold or evidence channel would confirm ${cleanName} as a durable watchpoint?`,
        source_path: note.path || '',
        run_id: runId,
        evidence_links: [
          noteLink(engineRoot, note.path, 'Sector scan summary'),
          ...signalToEvidenceLinks(signal),
        ],
      }));
    }
  }

  return packets;
}

function buildNewsPackets({ engineRoot, gdeltNotes, broadNewsNotes, date, runId }) {
  const packets = [];

  for (const note of gdeltNotes) {
    const articleCount = Number(note.data?.article_count || 0);
    const fetchErrors = Number(note.data?.fetch_error_count || 0);
    const topicCount = Number(note.data?.topic_count || 0);

    if (fetchErrors > 0 && articleCount === 0 && (!topicCount || fetchErrors >= topicCount)) {
      packets.push(basePacket({
        type: 'source_gap',
        date,
        key: `gdelt:${basename(note.path)}`,
        status: 'watch',
        title: 'GDELT news monitor source gap',
        summary: `GDELT returned ${fetchErrors} fetch error(s) and no articles, so fast-news coverage should fall back to NewsAPI/FMP before promotion.`,
        suggested_route: '01_Data_Sources/News_Media',
        review_question: 'Is this a transient GDELT outage or a source configuration issue that needs repair?',
        source_path: note.path || '',
        run_id: runId,
        evidence_links: [noteLink(engineRoot, note.path, 'GDELT news monitor')],
      }));
      continue;
    }

    if (isPromotable(note.data?.signal_status) && articleCount > 0) {
      packets.push(basePacket({
        type: 'news_cluster',
        date,
        key: `gdelt:${basename(note.path)}`,
        status: normalizeStatus(note.data?.signal_status),
        title: 'GDELT news cluster',
        summary: `GDELT found ${articleCount} article(s) across monitored topics; promote only if tied to a thesis, regime, entity, or policy trigger.`,
        suggested_route: '03_Macro_and_Economy/Observations',
        review_question: 'Which repeated topic connects to a World_Machine regime, entity, policy risk, or thesis?',
        source_path: note.path || '',
        run_id: runId,
        evidence_links: [noteLink(engineRoot, note.path, 'GDELT news monitor')],
      }));
    }
  }

  for (const note of broadNewsNotes) {
    if (note.data?.data_type === 'gdelt_news_monitor') continue;
    if (!isPromotable(note.data?.signal_status)) continue;
    if (!/general_market_news/i.test(String(note.data?.data_type || ''))) continue;

    packets.push(basePacket({
      type: 'news_cluster',
      date,
      key: `fmp:${basename(note.path)}`,
      status: normalizeStatus(note.data?.signal_status),
      title: 'FMP general-news cluster',
      summary: 'FMP general news is non-clear; use it only as supporting evidence for a linked thesis, macro regime, policy risk, or entity exposure.',
      suggested_route: '08_Macro_and_Economy/Observations',
      review_question: 'What existing World_Machine object does this news cluster update?',
      source_path: note.path || '',
      run_id: runId,
      evidence_links: [noteLink(engineRoot, note.path, 'FMP general news')],
    }));
  }

  return packets;
}

function basePacket(input) {
  return {
    packet_id: packetId(input.type, input.date, input.key),
    packet_type: input.type,
    type: input.type,
    date: input.date,
    status: normalizeStatus(input.status),
    title: input.title,
    summary: input.summary,
    suggested_route: input.suggested_route,
    target_vault: WORLD_VAULT,
    promotion_status: 'needs_review',
    review_question: input.review_question,
    symbol: input.symbol || null,
    thesis: input.thesis || null,
    score: input.score || null,
    posture: input.posture || null,
    evidence_links: dedupeEvidenceLinks(input.evidence_links),
    source_path: input.source_path || '',
    run_id: input.run_id ?? null,
    review_status: 'unreviewed',
  };
}

function renderWorldMachineCandidate(packet, options = {}) {
  const date = options.date || packet.date || today();
  return buildNote({
    frontmatter: {
      type: 'world_machine_candidate',
      created: date,
      packet_id: randomId(),
      packet_type: packet.type,
      promotion_status: 'approved',
      source_vault: SOURCE_VAULT,
      suggested_route: packet.suggested_route,
      symbol: packet.symbol,
      thesis: packet.thesis,
      signal_status: packet.status,
      tags: ['world-machine-candidate', packet.type],
      source_path: packet.source_path || '',
      run_id: packet.run_id ?? null,
      review_status: 'unreviewed',
    },
    sections: [
      {
        heading: 'Candidate Summary',
        content: [
          `- **Signal**: ${packet.status}`,
          `- **Route**: ${packet.suggested_route}`,
          `- **Summary**: ${packet.summary}`,
          `- **Review question**: ${packet.review_question}`,
        ].join('\n'),
      },
      {
        heading: 'Evidence Links',
        content: renderEvidenceLinkList(packet.evidence_links),
      },
      {
        heading: 'Ingestion Notes',
        content: [
          '- This is a reviewed candidate packet, not a canonical World_Machine note.',
          '- Use the World_Machine Inbox Ingestion Runbook to route it into an observation, watchpoint, entity, policy, or macro note.',
          '- Do not copy raw My_Data tables; open the evidence links when details are needed.',
        ].join('\n'),
      },
    ],
  });
}

function formatQueueTask(packet) {
  const evidence = packet.evidence_links.slice(0, 2)
    .map(link => `[${escapeMarkdownLinkText(link.label)}](${link.url})`)
    .join(', ') || 'no evidence link';

  return `- [ ] [world-machine/${packet.type}] ${packet.title} - status: ${packet.status}; packet: \`${packet.packet_id}\`; route: \`${packet.suggested_route}\`; evidence: ${evidence}`;
}

function renderEvidenceLinkList(links) {
  const rows = arrayFrom(links).map(link => [
    link.vault || SOURCE_VAULT,
    link.label || link.rel_path,
    `[open](${link.url || obsidianOpenUrl(link.vault || SOURCE_VAULT, link.rel_path)})`,
    link.rel_path,
  ]);
  return rows.length
    ? buildTable(['Vault', 'Evidence', 'Open', 'Path'], rows)
    : '- No evidence links supplied.';
}

function filterNotes(notes, criteria = {}) {
  return arrayFrom(notes).filter(note => {
    if (criteria.date && noteDate(note) !== criteria.date) return false;
    if (criteria.dataType && String(note.data?.data_type || '') !== criteria.dataType) return false;
    if (criteria.filenameIncludes && !note.filename.includes(criteria.filenameIncludes)) return false;
    return true;
  });
}

function noteLink(engineRoot, filePath, label) {
  return evidenceLink({ vaultName: SOURCE_VAULT, vaultRoot: engineRoot, filePath, label });
}

function linksFromWikiCell(engineRoot, value) {
  return extractWikiLinks(value)
    .filter(link => link.includes('/'))
    .map(link => {
      const relPath = normalizeVaultPath(link.endsWith('.md') ? link : `${link}.md`);
      return {
        vault: SOURCE_VAULT,
        rel_path: relPath,
        label: basename(relPath, '.md'),
        url: obsidianOpenUrl(SOURCE_VAULT, relPath),
      };
    });
}

function signalToEvidenceLinks(signal) {
  const relPath = `06_Signals/${normalizeVaultPath(signal).replace(/\.md$/i, '')}.md`;
  return [{
    vault: SOURCE_VAULT,
    rel_path: relPath,
    label: basename(relPath, '.md'),
    url: obsidianOpenUrl(SOURCE_VAULT, relPath),
  }];
}

function sectionContent(content, heading) {
  const lines = String(content || '').split(/\r?\n/);
  const target = String(heading || '').trim().toLowerCase();
  let start = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^##\s+(.+?)\s*$/);
    if (match && match[1].trim().toLowerCase() === target) {
      start = index + 1;
      break;
    }
  }

  if (start < 0) return '';

  let end = lines.length;
  for (let index = start; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      end = index;
      break;
    }
  }

  return lines.slice(start, end).join('\n').trim();
}

function extractWikiLinks(value) {
  const matches = [...String(value || '').matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)];
  return matches.map(match => match[1].trim()).filter(Boolean);
}

function cleanWiki(value) {
  return String(value || '').replace(/^\[\[/, '').replace(/\]\]$/, '').trim();
}

function titleFromSignal(value) {
  return String(value || '')
    .replace(/^\d{4}-\d{2}-\d{2}_/, '')
    .replace(/^CONFIRM_/i, '')
    .replace(/^CONTRADICT_/i, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/\bSmall Cap\b/g, 'Small-Cap')
    .trim();
}

function noteDate(note) {
  const fromData = String(note.data?.date_pulled || '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromData)) return fromData;
  const match = note.filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function packetId(type, date, key) {
  return `${type}:${date}:${slugify(key)}`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'packet';
}

function safeFilename(value) {
  return String(value || 'World Machine Candidate')
    .replace(/[<>:"/\\|?*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function isPromotable(status) {
  return PROMOTABLE_STATUSES.has(normalizeStatus(status));
}

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase().trim();
  return value || 'clear';
}

function formatConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'unknown confidence';
  if (number <= 1) return `${Math.round(number * 100)}% confidence`;
  return `${number}% confidence`;
}

function compactSentence(value, limit) {
  const text = cleanText(value).replace(/\s+/g, ' ');
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 3)).trimEnd()}...`;
}

function cleanText(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstValue(value) {
  return arrayFrom(value)[0] || '';
}

function dedupePackets(packets) {
  const seen = new Set();
  const out = [];
  for (const packet of packets) {
    if (!packet?.packet_id || seen.has(packet.packet_id)) continue;
    seen.add(packet.packet_id);
    out.push(packet);
  }
  return out;
}

function dedupeEvidenceLinks(links) {
  const seen = new Set();
  const out = [];
  for (const link of arrayFrom(links)) {
    const key = `${link.vault}:${link.rel_path || link.url}`;
    if (!link || seen.has(key)) continue;
    seen.add(key);
    out.push(link);
  }
  return out;
}

function groupByType(packets) {
  const grouped = new Map();
  for (const packet of packets) {
    const list = grouped.get(packet.type) || [];
    list.push(packet);
    grouped.set(packet.type, list);
  }
  return grouped;
}

function comparePackets(left, right) {
  return statusRank(right.status) - statusRank(left.status) ||
    String(left.type).localeCompare(String(right.type)) ||
    String(left.title).localeCompare(String(right.title));
}

function statusRank(status) {
  return { clear: 0, watch: 1, alert: 2, critical: 3 }[normalizeStatus(status)] || 0;
}

function stripBom(value) {
  const text = String(value || '');
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeMarkdownLinkText(value) {
  return String(value || '').replace(/\]/g, '\\]').replace(/\|/g, '/');
}

function arrayFrom(value) {
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined && item !== '');
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

export function packetManifestPayload(packets, options = {}) {
  return {
    schema_version: 1,
    generated_on: options.generatedOn || today(),
    source_vault: SOURCE_VAULT,
    target_vault: WORLD_VAULT,
    packets: arrayFrom(packets),
  };
}
