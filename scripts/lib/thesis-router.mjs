/**
 * thesis-router.mjs - Routes sector findings into relevant theses and manages
 * emerging-pattern stub lifecycle for sector-scan.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getVaultRoot } from './config.mjs';
import { parseFrontmatter } from './history.mjs';
import { buildNote, today } from './markdown.mjs';

const SCORE_THRESHOLD = 3;
const TICKER_MATCH_SCORE = 2;
const STUB_HIT_THRESHOLD = 3;
const INVALIDATION_TOKEN_THRESHOLD = 3;

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but', 'by',
  'for', 'from', 'has', 'have', 'if', 'in', 'into', 'is', 'it', 'its', 'of',
  'on', 'or', 'that', 'the', 'their', 'then', 'there', 'these', 'this', 'to',
  'up', 'vs', 'was', 'were', 'while', 'with', 'within', 'without', 'after',
  'across', 'above', 'against', 'before', 'below', 'between', 'both', 'over',
  'under', 'than', 'not', 'all', 'any', 'each', 'other', 'more', 'most',
  'some', 'such', 'through', 'until', 'very', 'per', 'via', 'will', 'would',
  'can', 'could', 'should', 'may', 'might',
  'years', 'year', 'months', 'month', 'weeks', 'week', 'days', 'day',
  'events', 'event', 'signal', 'signals', 'review', 'change', 'action',
  'top', 'bottom', 'multiple', 'phase', 'risk', 'fund', 'funds',
  'current', 'price', 'prices', 'growth', 'company', 'companies', 'small',
  'large', 'mid', 'market', 'markets', 'commercial', 'government', 'budget',
  'player', 'players', 'fully', 'key',
]);

const SHORT_TOKEN_ALLOWLIST = new Set([
  'ad', 'ai', 'amr', 'bea', 'bls', 'cboe', 'cms', 'cpi', 'eia', 'epa', 'ev',
  'fda', 'fed', 'gdp', 'ipo', 'lng', 'llm', 'opec', 'pce', 'pmi', 'sec',
  'usd',
]);

const GENERIC_ENTITY_PHRASES = new Set([
  'ai',
  'usa',
  'space',
  'defense',
  'housing',
  'healthcare',
  'health',
  'tech sector',
  'technology',
  'consumer',
  'energy',
  'utilities',
  'real estate',
  'financials',
  'industrials',
  'materials',
  'communication services',
  'power infrastructure',
  'clean energy',
  'grid storage',
  'robotics',
  'manufacturing',
  'macro',
]);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripWikiLink(value) {
  return String(value || '')
    .replace(/\[\[|\]\]/g, '')
    .trim();
}

function normalizePhrase(value) {
  return stripWikiLink(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLink(value) {
  return `[[${stripWikiLink(value)}]]`;
}

function uniqueLinks(values) {
  return [...new Set((values || []).map(value => buildLink(value)).filter(Boolean))];
}

function splitMarkdownNote(content) {
  const match = content.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  return {
    frontmatter: parseFrontmatter(content),
    body: match[2] || '',
  };
}

function parseDateStamp(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function formatDateStamp(date) {
  return date.toISOString().slice(0, 10);
}

function isMeaningfulToken(token) {
  if (!token) return false;
  if (/^\d+$/.test(token)) return false;
  if (STOPWORDS.has(token)) return false;
  return token.length >= 3 || SHORT_TOKEN_ALLOWLIST.has(token);
}

function tokenizeMeaningful(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\[\[|\]\]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(isMeaningfulToken);
}

function buildBigrams(tokens) {
  const bigrams = [];
  for (let index = 0; index < tokens.length - 1; index += 1) {
    bigrams.push(`${tokens[index]} ${tokens[index + 1]}`);
  }
  return bigrams;
}

function looksLikeTicker(value) {
  return /^[A-Z]{2,5}$/.test(stripWikiLink(value));
}

function buildPhraseEntry(value) {
  const label = stripWikiLink(value);
  const normalized = normalizePhrase(label);
  const tokens = [...new Set(tokenizeMeaningful(label))];
  if (tokens.length === 0) return null;

  return {
    label,
    normalized,
    tokens,
    bigrams: buildBigrams(tokens),
    isTicker: looksLikeTicker(label),
  };
}

function shouldKeepPositivePhrase(phrase) {
  if (!phrase) return false;
  if (GENERIC_ENTITY_PHRASES.has(phrase.normalized)) return false;
  if (phrase.isTicker) return true;
  if (phrase.tokens.length >= 2) return true;
  return phrase.tokens[0].length >= 4;
}

function mergeStubTerms(existingValues, matchedTerms, limit = 8) {
  const merged = [
    ...(existingValues || []).map(value => stripWikiLink(value)),
    ...matchedTerms.map(value => stripWikiLink(value)),
  ]
    .filter(Boolean)
    .slice(0, limit);

  return uniqueLinks(merged);
}

function updateStubBody(existingBody, options) {
  const {
    currentDate,
    promoted,
    streakDays,
  } = options;

  const introLine = promoted
    ? 'Promoted from Draft after three consecutive sector-scan days. Review before raising conviction.'
    : 'Draft - populate from sector scan evidence before promoting to active.';
  const changeLine = promoted
    ? `Promoted from Draft after ${streakDays} consecutive sector-scan days.`
    : `Draft stub refreshed by sector-scan (${streakDays} consecutive day(s)).`;
  const actionLine = promoted
    ? 'Review evidence and decide whether this thesis should remain Active or return to Draft.'
    : 'Populate evidence and promote conviction before sizing.';

  let body = (existingBody || '').trim();
  if (!body) {
    body = [
      '## Investment Thesis',
      '',
      introLine,
      '',
      '## Monitor Review',
      '',
      `- **Last review**: ${currentDate}`,
      `- **Change this week**: ${changeLine}`,
      '- **Break risk status**: not-seen',
      `- **Action**: ${actionLine}`,
      '',
    ].join('\n');
    return body;
  }

  body = body.replace(/Draft .*?promoting to active\./i, introLine);
  body = body.replace(/Promoted from Draft .*?raising conviction\./i, introLine);

  if (/^- \*\*Last review\*\*: .*$/m.test(body)) {
    body = body.replace(/^- \*\*Last review\*\*: .*$/m, `- **Last review**: ${currentDate}`);
  }
  if (/^- \*\*Change this week\*\*: .*$/m.test(body)) {
    body = body.replace(/^- \*\*Change this week\*\*: .*$/m, `- **Change this week**: ${changeLine}`);
  }
  if (/^- \*\*Break risk status\*\*: .*$/m.test(body)) {
    body = body.replace(/^- \*\*Break risk status\*\*: .*$/m, '- **Break risk status**: not-seen');
  }
  if (/^- \*\*Action\*\*: .*$/m.test(body)) {
    body = body.replace(/^- \*\*Action\*\*: .*$/m, `- **Action**: ${actionLine}`);
  }

  if (!/^## Monitor Review$/m.test(body)) {
    body = `${body}\n\n## Monitor Review\n\n- **Last review**: ${currentDate}\n- **Change this week**: ${changeLine}\n- **Break risk status**: not-seen\n- **Action**: ${actionLine}\n`;
  }

  return body.trim();
}

function loadActiveTheses(thesesDir) {
  const notes = [];
  if (!existsSync(thesesDir)) return notes;

  for (const fileName of readdirSync(thesesDir).filter(file => file.endsWith('.md'))) {
    const filePath = join(thesesDir, fileName);
    const parsed = splitMarkdownNote(readFileSync(filePath, 'utf-8'));
    if (!parsed?.frontmatter || parsed.frontmatter.node_type !== 'thesis') continue;

    notes.push({
      fileName,
      filePath,
      body: parsed.body,
      frontmatter: parsed.frontmatter,
    });
  }

  return notes;
}

export function buildRoutingTable() {
  const thesesDir = join(getVaultRoot(), '10_Theses');
  const table = new Map();

  for (const note of loadActiveTheses(thesesDir)) {
    const fm = note.frontmatter;
    if (fm.status === 'Draft') continue;
    if (Array.isArray(fm.tags) && fm.tags.includes('bridge')) continue;

    const positivePhrases = [];
    const invalidationPhrases = [];

    function ingestPositive(value) {
      const items = Array.isArray(value) ? value : (value ? [value] : []);
      for (const item of items) {
        const phrase = buildPhraseEntry(item);
        if (shouldKeepPositivePhrase(phrase)) {
          positivePhrases.push(phrase);
        }
      }
    }

    ingestPositive(fm.name);
    ingestPositive(fm.core_entities);

    const invalidationItems = Array.isArray(fm.invalidation_triggers)
      ? fm.invalidation_triggers
      : (fm.invalidation_triggers ? [fm.invalidation_triggers] : []);
    for (const item of invalidationItems) {
      const phrase = buildPhraseEntry(item);
      if (phrase) {
        invalidationPhrases.push(phrase);
      }
    }

    table.set(fm.name || note.fileName, {
      slug: slugify(note.fileName.replace(/\.md$/i, '')),
      file: note.fileName,
      filePath: note.filePath,
      name: fm.name || note.fileName.replace(/\.md$/i, ''),
      conviction: fm.conviction || 'low',
      allocationPriority: fm.allocation_priority || 'watch',
      coreEntities: (Array.isArray(fm.core_entities) ? fm.core_entities : [])
        .map(value => normalizePhrase(value))
        .filter(Boolean),
      positivePhrases,
      invalidationPhrases,
    });
  }

  return table;
}

export function scoreFindings(findingText, routingTable) {
  const tokenList = tokenizeMeaningful(findingText);
  const tokens = new Set(tokenList);
  const bigrams = new Set(buildBigrams(tokenList));

  const results = [];
  for (const [thesisName, entry] of routingTable) {
    let score = 0;
    const matched = new Set();
    const invalidationHits = [];

    for (const phrase of entry.positivePhrases) {
      const overlap = phrase.tokens.filter(token => tokens.has(token));
      const bigramOverlap = phrase.bigrams.filter(value => bigrams.has(value));

      if (phrase.isTicker && overlap.length >= 1) {
        score += TICKER_MATCH_SCORE;
        overlap.forEach(token => matched.add(token));
        continue;
      }

      if (phrase.tokens.length === 1 && overlap.length >= 1) {
        score += 2;
        overlap.forEach(token => matched.add(token));
        continue;
      }

      if (bigramOverlap.length >= 1 || overlap.length >= 2) {
        score += Math.max(2, overlap.length + bigramOverlap.length);
        overlap.forEach(token => matched.add(token));
      }
    }

    for (const phrase of entry.invalidationPhrases) {
      const overlap = phrase.tokens.filter(token => tokens.has(token));
      const bigramOverlap = phrase.bigrams.filter(value => bigrams.has(value));
      const enoughTokenOverlap = overlap.length >= Math.max(
        INVALIDATION_TOKEN_THRESHOLD,
        Math.ceil(phrase.tokens.length * 0.6)
      );
      const enoughBigramOverlap = bigramOverlap.length >= Math.min(2, phrase.bigrams.length);

      if (!enoughTokenOverlap && !enoughBigramOverlap) {
        continue;
      }

      for (const token of overlap) {
        matched.add(token);
        invalidationHits.push(token);
      }
      score -= Math.max(3, overlap.length + (bigramOverlap.length * 2));
    }

    if (Math.abs(score) >= SCORE_THRESHOLD) {
      results.push(Object.freeze({
        thesisName,
        slug: entry.slug,
        file: entry.file,
        conviction: entry.conviction,
        allocationPriority: entry.allocationPriority,
        score,
        direction: score > 0 ? 'confirm' : 'contradict',
        matched: [...matched],
        invalidationHits,
      }));
    }
  }

  return results.sort((left, right) => Math.abs(right.score) - Math.abs(left.score));
}

export function shouldCreateStub(findingText, routingTable) {
  const routed = scoreFindings(findingText, routingTable);
  if (routed.length > 0) return false;

  const tokens = new Set(tokenizeMeaningful(findingText));
  return tokens.size >= STUB_HIT_THRESHOLD;
}

export function buildThesisStub(sectorName, matchedTerms) {
  const currentDate = today();
  const normalizedSectorName = sectorName.replace(/ Sector Basket$/i, ' Sector');
  const name = `${normalizedSectorName} - Emerging Pattern`;
  const slug = slugify(name);
  const topTerms = [...new Set(matchedTerms.map(term => stripWikiLink(term)).filter(Boolean))].slice(0, 5);

  const frontmatter = {
    node_type: 'thesis',
    name,
    status: 'Draft',
    conviction: 'low',
    timeframe: 'medium',
    allocation_priority: 'watch',
    allocation_rank: 99,
    why_now: `Emerging pattern detected via sector scan - ${normalizedSectorName}`,
    variant_perception: '',
    next_catalyst: '',
    disconfirming_evidence: 'None identified',
    expected_upside: '',
    expected_downside: '',
    position_sizing: 'watchlist only',
    required_sources: [],
    required_pull_families: ['sector-scan'],
    monitor_status: 'on-track',
    monitor_last_review: currentDate,
    monitor_change: 'Draft stub created by sector-scan.',
    break_risk_status: 'not-seen',
    monitor_action: 'Populate evidence and promote conviction before sizing.',
    suggested_conviction: '',
    suggested_allocation_priority: '',
    conviction_rolling_score_7d: 0,
    conviction_signal_count_7d: 0,
    conviction_last_signal_date: '',
    core_entities: uniqueLinks(topTerms),
    supporting_regimes: [],
    key_indicators: [],
    bullish_drivers: uniqueLinks(topTerms.slice(0, 3)),
    bearish_drivers: [],
    invalidation_triggers: [],
    emerging_pattern_sector: normalizedSectorName,
    emerging_pattern_first_seen: currentDate,
    emerging_pattern_last_seen: currentDate,
    emerging_pattern_streak_days: 1,
    tags: ['thesis', 'draft', 'sector-scan', 'emerging-pattern', slugify(normalizedSectorName)],
  };

  const body = updateStubBody('', {
    currentDate,
    promoted: false,
    streakDays: 1,
  });

  return { slug, name, frontmatter, body };
}

export function upsertEmergingPatternStub(sectorName, matchedTerms, thesesDir, dryRun = false) {
  const stub = buildThesisStub(sectorName, matchedTerms);
  const filePath = join(thesesDir, `${stub.slug}.md`);
  const currentDate = today();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStamp = formatDateStamp(yesterday);

  if (!existsSync(filePath)) {
    if (!dryRun) {
      mkdirSync(thesesDir, { recursive: true });
      writeFileSync(filePath, buildNote({ frontmatter: stub.frontmatter, sections: [] }) + stub.body, 'utf-8');
    }

    return {
      ...stub,
      filePath,
      fileName: `${stub.slug}.md`,
      action: 'created',
      promoted: false,
      sharedCoreEntities: stub.frontmatter.core_entities,
    };
  }

  const parsed = splitMarkdownNote(readFileSync(filePath, 'utf-8'));
  if (!parsed?.frontmatter) {
    return {
      ...stub,
      filePath,
      fileName: `${stub.slug}.md`,
      action: 'skipped',
      promoted: false,
      sharedCoreEntities: stub.frontmatter.core_entities,
    };
  }

  const frontmatter = {
    ...parsed.frontmatter,
    node_type: 'thesis',
    name: parsed.frontmatter.name || stub.name,
    conviction: parsed.frontmatter.conviction || 'low',
    timeframe: parsed.frontmatter.timeframe || 'medium',
    allocation_priority: parsed.frontmatter.allocation_priority || 'watch',
    allocation_rank: parsed.frontmatter.allocation_rank || 99,
    why_now: parsed.frontmatter.why_now || stub.frontmatter.why_now,
    disconfirming_evidence: parsed.frontmatter.disconfirming_evidence || 'None identified',
    position_sizing: parsed.frontmatter.position_sizing || 'watchlist only',
    required_pull_families: [...new Set([...(parsed.frontmatter.required_pull_families || []), 'sector-scan'])],
  };

  const lastSeen = parsed.frontmatter.emerging_pattern_last_seen || '';
  let streakDays = Number(parsed.frontmatter.emerging_pattern_streak_days) || 0;
  if (lastSeen === currentDate) {
    streakDays = Math.max(streakDays, 1);
  } else if (lastSeen === yesterdayStamp) {
    streakDays += 1;
  } else {
    streakDays = 1;
  }

  const promoted = frontmatter.status === 'Draft' && streakDays >= 3;
  const action = promoted ? 'promoted' : 'refreshed';

  frontmatter.status = promoted ? 'Active' : (frontmatter.status || 'Draft');
  frontmatter.conviction = 'low';
  frontmatter.allocation_priority = 'watch';
  frontmatter.allocation_rank = 99;
  frontmatter.core_entities = mergeStubTerms(parsed.frontmatter.core_entities, matchedTerms);
  frontmatter.bullish_drivers = mergeStubTerms(parsed.frontmatter.bullish_drivers, matchedTerms.slice(0, 3), 5);
  frontmatter.monitor_status = 'on-track';
  frontmatter.monitor_last_review = currentDate;
  frontmatter.monitor_change = promoted
    ? `Promoted from Draft after ${streakDays} consecutive sector-scan days.`
    : `Draft stub refreshed by sector-scan (${streakDays} consecutive day(s)).`;
  frontmatter.break_risk_status = 'not-seen';
  frontmatter.monitor_action = promoted
    ? 'Review overlap, evidence, and catalysts before increasing conviction.'
    : 'Populate evidence and promote conviction before sizing.';
  frontmatter.emerging_pattern_sector = sectorName.replace(/ Sector Basket$/i, ' Sector');
  frontmatter.emerging_pattern_first_seen = parsed.frontmatter.emerging_pattern_first_seen || currentDate;
  frontmatter.emerging_pattern_last_seen = currentDate;
  frontmatter.emerging_pattern_streak_days = streakDays;
  frontmatter.tags = [...new Set([...(parsed.frontmatter.tags || []), 'thesis', 'sector-scan', 'emerging-pattern'])];

  const body = updateStubBody(parsed.body, {
    currentDate,
    promoted,
    streakDays,
  });

  if (!dryRun) {
    writeFileSync(filePath, buildNote({ frontmatter, sections: [] }) + body, 'utf-8');
  }

  return {
    slug: stub.slug,
    name: frontmatter.name,
    frontmatter,
    body,
    filePath,
    fileName: `${stub.slug}.md`,
    action,
    promoted,
    sharedCoreEntities: frontmatter.core_entities,
  };
}

export function createBridgeNotes(promotedStub, thesesDir, dryRun = false) {
  const promotedCoreEntities = new Set(
    (promotedStub.frontmatter.core_entities || [])
      .map(value => normalizePhrase(value))
      .filter(Boolean)
  );

  if (promotedCoreEntities.size === 0) return [];

  const bridgeNotes = [];
  for (const note of loadActiveTheses(thesesDir)) {
    const fm = note.frontmatter;
    if (fm.status === 'Draft') continue;
    if (note.fileName === promotedStub.fileName) continue;
    if (Array.isArray(fm.tags) && fm.tags.includes('bridge') && fm.tags.includes('auto-generated')) continue;

    const overlaps = (Array.isArray(fm.core_entities) ? fm.core_entities : [])
      .map(value => normalizePhrase(value))
      .filter(value => promotedCoreEntities.has(value));
    const uniqueOverlaps = [...new Set(overlaps)];
    if (uniqueOverlaps.length < 2) continue;

    const bridgeName = `${promotedStub.frontmatter.name} x ${fm.name || note.fileName.replace(/\.md$/i, '')} Bridge`;
    const bridgeSlug = slugify(bridgeName);
    const bridgePath = join(thesesDir, `${bridgeSlug}.md`);
    if (existsSync(bridgePath)) {
      bridgeNotes.push({
        name: bridgeName,
        filePath: bridgePath,
        action: 'existing',
        sharedCoreEntities: uniqueOverlaps.map(value => buildLink(value)),
      });
      continue;
    }

    const currentDate = today();
    const sharedCoreEntityLinks = uniqueOverlaps.map(value => buildLink(value));
    const bridgeFrontmatter = {
      node_type: 'thesis',
      name: bridgeName,
      status: 'Active',
      conviction: 'low',
      timeframe: 'medium',
      allocation_priority: 'watch',
      allocation_rank: 98,
      why_now: `Bridge thesis generated from overlapping core entities between ${promotedStub.frontmatter.name} and ${fm.name || note.fileName.replace(/\.md$/i, '')}.`,
      variant_perception: '',
      next_catalyst: '',
      disconfirming_evidence: 'The overlap fails to produce durable evidence across both source theses.',
      expected_upside: '',
      expected_downside: '',
      position_sizing: 'watchlist only',
      required_sources: [],
      required_pull_families: ['sector-scan'],
      monitor_status: 'on-track',
      monitor_last_review: currentDate,
      monitor_change: 'Bridge thesis generated automatically after emerging-pattern promotion.',
      break_risk_status: 'not-seen',
      monitor_action: 'Review the overlap before assigning capital.',
      suggested_conviction: '',
      suggested_allocation_priority: '',
      conviction_rolling_score_7d: 0,
      conviction_signal_count_7d: 0,
      conviction_last_signal_date: '',
      core_entities: sharedCoreEntityLinks,
      supporting_regimes: [],
      key_indicators: [],
      bullish_drivers: sharedCoreEntityLinks,
      bearish_drivers: [],
      invalidation_triggers: [],
      tags: ['thesis', 'bridge', 'auto-generated', 'sector-scan'],
    };

    const bridgeBody = [
      '## Bridge Thesis',
      '',
      `- Source theses: [[${promotedStub.fileName.replace(/\.md$/i, '')}]], [[${note.fileName.replace(/\.md$/i, '')}]]`,
      `- Shared core entities: ${sharedCoreEntityLinks.join(', ')}`,
      '- Why it matters: sector-scan surfaced a persistent overlap worth monitoring before it graduates into a core thesis.',
      '',
      '## Monitor Review',
      '',
      `- **Last review**: ${currentDate}`,
      '- **Change this week**: Auto-generated bridge note created after emerging-pattern promotion.',
      '- **Break risk status**: not-seen',
      '- **Action**: Review evidence and decide whether this bridge should remain a standalone thesis.',
      '',
    ].join('\n');

    if (!dryRun) {
      writeFileSync(bridgePath, buildNote({ frontmatter: bridgeFrontmatter, sections: [] }) + bridgeBody, 'utf-8');
    }

    bridgeNotes.push({
      name: bridgeName,
      filePath: bridgePath,
      action: 'created',
      sharedCoreEntities: sharedCoreEntityLinks,
    });
  }

  return bridgeNotes;
}

export function writeRoutingSignal(result, sectorName, signalsDir, dryRun = false) {
  const currentDate = today();
  const prefix = result.direction === 'confirm' ? 'CONFIRM' : 'CONTRADICT';
  const upperSlug = result.slug.toUpperCase().replace(/-/g, '_');
  const fileName = `${currentDate}_${prefix}_${upperSlug}.md`;
  const filePath = join(signalsDir, fileName);
  const severity = Math.abs(result.score) >= 4 ? 'alert' : 'watch';
  const suggestedAction = result.direction === 'confirm' ? 'compound' : 'reduce';

  const frontmatter = {
    signal_id: `${prefix}_${upperSlug}`,
    signal_name: `${prefix.charAt(0)}${prefix.slice(1).toLowerCase()} - ${result.thesisName}`,
    severity,
    date: currentDate,
    sector: sectorName,
    thesis: `[[${result.file.replace(/\.md$/i, '')}]]`,
    score: result.score,
    direction: result.direction,
    matched_terms: result.matched,
    suggested_action: suggestedAction,
    tags: ['signal', 'sector-scan', result.direction, result.slug],
  };

  const invalidationLines = result.invalidationHits.length > 0
    ? ['', '**Invalidation triggers matched:**', ...result.invalidationHits.map(hit => `- \`${hit}\``)]
    : [];
  const actionLine = result.direction === 'confirm'
    ? 'Sector data supports this thesis. Consider increasing conviction or allocation priority if a second independent source confirms it.'
    : 'Sector data matches an invalidation trigger. Set break_risk_status to watch and review disconfirming_evidence.';

  const body = [
    `## ${prefix.charAt(0)}${prefix.slice(1).toLowerCase()} - ${result.thesisName}`,
    '',
    `**Sector:** ${sectorName}  `,
    `**Score:** ${result.score}  `,
    `**Direction:** ${result.direction}`,
    '',
    '## Evidence',
    '',
    ...result.matched.map(match => `- \`${match}\``),
    ...invalidationLines,
    '',
    '## Suggested Action',
    '',
    actionLine,
    '',
    '## How to Apply',
    '',
    `Run \`powershell scripts/update-thesis-scorecards.ps1 -ApplySignals -DryRun\` or edit \`10_Theses/${result.file}\` directly.`,
    '',
  ].join('\n');

  if (!dryRun) {
    mkdirSync(signalsDir, { recursive: true });
    writeFileSync(filePath, buildNote({ frontmatter, sections: [] }) + body, 'utf-8');
  }

  return filePath;
}
