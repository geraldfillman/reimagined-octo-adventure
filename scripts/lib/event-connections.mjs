import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getEngineRoot } from './config.mjs';

const DEFAULT_HANDOFF_LIMIT = 12;
const SIGNAL_RANK = Object.freeze({ clear: 0, watch: 1, alert: 2, critical: 3 });

export async function loadEventExposureMap({ engineRoot = getEngineRoot(), configPath = null } = {}) {
  const path = configPath || join(engineRoot, 'scripts', 'config', 'event-exposure-map.json');
  const text = await readFile(path, 'utf8');
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.targets)) {
    throw new Error(`Event exposure map must include a targets array: ${path}`);
  }
  return {
    ...parsed,
    targets: parsed.targets.map((target, index) => normalizeTarget(target, index)),
  };
}

export function buildResearchHandoffs({
  scenario,
  layerContexts = [],
  phaseContexts = [],
  exposureMap,
  handoffLimit = DEFAULT_HANDOFF_LIMIT,
} = {}) {
  if (!scenario?.id || !Array.isArray(exposureMap?.targets)) return [];
  const limit = Math.max(1, Number(handoffLimit) || DEFAULT_HANDOFF_LIMIT);
  const ranked = [];
  const seen = new Map();

  for (const target of exposureMap.targets) {
    if (!target.scenario_ids.includes(scenario.id)) continue;
    const score = scoreTarget(target, { scenario, layerContexts, phaseContexts });
    if (score.total <= 0) continue;

    const handoff = {
      target_id: target.id,
      scenario_id: scenario.id,
      target_type: target.target_type,
      symbol: target.symbol || null,
      label: target.label,
      commodity_label: target.commodity_label || null,
      sector_slug: target.sector_slug || null,
      exposure: target.exposure || '',
      direction: target.direction || 'mixed',
      agents: target.agents,
      related_theses: target.related_theses,
      matched_layer: score.bestLayer?.name || null,
      timing_phase: score.bestPhase?.phase || null,
      matched_terms: score.matchedTerms,
      evidence_links: score.evidenceLinks,
      score: score.total,
      confidence: confidenceFromScore(score.total),
      rationale: buildRationale(target, score),
      commands: buildHandoffCommands(target),
    };

    const key = handoffKey(handoff);
    const prior = seen.get(key);
    if (!prior || handoff.score > prior.score) {
      seen.set(key, handoff);
    }
  }

  ranked.push(...seen.values());
  return ranked
    .sort((left, right) =>
      handoffTypeRank(left) - handoffTypeRank(right) ||
      right.score - left.score ||
      originalOrder(left, exposureMap) - originalOrder(right, exposureMap) ||
      String(left.label).localeCompare(String(right.label))
    )
    .slice(0, limit);
}

export function buildHandoffCommands(target) {
  const symbol = String(target.symbol || '').toUpperCase();
  const label = target.label || symbol;
  const quotedLabel = quoteArg(label);

  if (target.target_type === 'company' && symbol) {
    return [
      `node run.mjs pull agent-analyst --symbol ${symbol} --agents price,risk,macro,fundamentals --skip-llm --dry-run`,
      `node run.mjs scan company-risk --ticker ${symbol} --company ${quotedLabel} --dry-run`,
    ];
  }

  if (target.target_type === 'commodity_proxy' && symbol) {
    return [
      `node run.mjs pull agent-analyst --symbol ${symbol} --asset commodity --agents price,macro,risk --skip-llm --dry-run`,
    ];
  }

  if (target.target_type === 'sector') {
    const sector = target.sector_slug || slugify(label);
    return [`node run.mjs scan sectors --sector ${sector} --dry-run`];
  }

  if (target.target_type === 'thesis') {
    return [`node run.mjs thesis full-picture --thesis ${quotedLabel} --dry-run`];
  }

  return [];
}

function normalizeTarget(target, index) {
  const normalized = {
    ...target,
    id: String(target.id || `target-${index + 1}`),
    scenario_ids: arrayFrom(target.scenario_ids || target.scenario_id).map(value => String(value).trim()).filter(Boolean),
    target_type: String(target.target_type || target.type || 'company').trim(),
    symbol: target.symbol ? String(target.symbol).toUpperCase().trim() : '',
    label: String(target.label || target.name || target.symbol || `Target ${index + 1}`).trim(),
    commodity_label: target.commodity_label ? String(target.commodity_label).trim() : '',
    sector_slug: target.sector_slug ? String(target.sector_slug).trim() : '',
    exposure: String(target.exposure || '').trim(),
    direction: String(target.direction || 'mixed').trim(),
    agents: arrayFrom(target.agents).map(value => String(value).trim()).filter(Boolean),
    match_terms: uniqueValues(arrayFrom(target.match_terms)).filter(value => normalizeText(value).length >= 2),
    related_theses: arrayFrom(target.related_theses).map(cleanWikiText).filter(Boolean),
    _order: index,
  };
  return normalized;
}

function scoreTarget(target, { scenario, layerContexts, phaseContexts }) {
  let total = 0;
  let bestLayer = null;
  let bestLayerScore = 0;
  let bestPhase = null;
  let bestPhaseScore = 0;
  const matchedTerms = new Set();
  const evidenceLinks = [];

  const scenarioText = normalizeText([
    scenario.name,
    scenario.core_trigger,
    ...arrayFrom(scenario.trigger_causes),
  ].join(' '));
  const scenarioScore = scoreText(target.match_terms, scenarioText);
  if (scenarioScore.total > 0) {
    total += scenarioScore.total;
    scenarioScore.terms.forEach(term => matchedTerms.add(term));
  }

  for (const layer of layerContexts) {
    const layerText = layerSearchText(layer);
    const beneficiaryText = normalizeText(arrayFrom(layer.beneficiaries).join(' '));
    const loserText = normalizeText(arrayFrom(layer.losers).join(' '));
    const termScore = scoreText(target.match_terms, layerText);
    const thesisOverlap = overlapCount(target.related_theses, arrayFrom(layer.related_theses).map(cleanWikiText));
    const directionScore = scoreDirection(target, beneficiaryText, loserText);
    let layerScore = termScore.total + thesisOverlap * 3 + directionScore;

    if (layerScore > 0) {
      layerScore += Math.min(Number(layer.evidenceCount) || 0, 5);
      layerScore += rankSignal(layer.signalStatus);
      total += layerScore;
      termScore.terms.forEach(term => matchedTerms.add(term));
      if (thesisOverlap > 0) {
        target.related_theses.forEach(thesis => {
          if (arrayFrom(layer.related_theses).map(cleanWikiText).includes(thesis)) matchedTerms.add(thesis);
        });
      }
      for (const note of arrayFrom(layer.evidence).slice(0, 3)) {
        if (note?.link) evidenceLinks.push(note.link);
      }
    }

    if (layerScore > bestLayerScore) {
      bestLayerScore = layerScore;
      bestLayer = layer;
    }
  }

  for (const phase of phaseContexts) {
    const phaseText = normalizeText([
      phase.phase,
      ...arrayFrom(phase.watch_terms),
      ...arrayFrom(phase.winners),
      ...arrayFrom(phase.losers),
    ].join(' '));
    const phaseScore = scoreText(target.match_terms, phaseText);
    if (phaseScore.total > 0) {
      const score = phaseScore.total + Math.min(Number(phase.evidenceCount) || 0, 3);
      total += score;
      phaseScore.terms.forEach(term => matchedTerms.add(term));
      if (score > bestPhaseScore) {
        bestPhaseScore = score;
        bestPhase = phase;
      }
    }
  }

  return {
    total,
    bestLayer,
    bestPhase,
    matchedTerms: [...matchedTerms].slice(0, 8),
    evidenceLinks: uniqueValues(evidenceLinks).slice(0, 5),
  };
}

function scoreText(terms, text) {
  let total = 0;
  const hits = [];
  for (const term of terms) {
    const normalized = normalizeText(term);
    if (!normalized || !text.includes(normalized)) continue;
    hits.push(term);
    total += normalized.includes(' ') ? 4 : 2;
  }
  return { total, terms: hits };
}

function scoreDirection(target, beneficiaryText, loserText) {
  const direction = normalizeText(target.direction);
  const terms = target.match_terms.map(normalizeText);
  const beneficiaryHit = terms.some(term => term && beneficiaryText.includes(term));
  const loserHit = terms.some(term => term && loserText.includes(term));
  if (['beneficiary', 'adaptation'].includes(direction) && beneficiaryHit) return 3;
  if (['risk', 'input cost', 'input_cost'].includes(direction) && loserHit) return 3;
  if (direction === 'mixed' && (beneficiaryHit || loserHit)) return 2;
  return 0;
}

function layerSearchText(layer) {
  return normalizeText([
    layer.name,
    layer.mechanism,
    ...arrayFrom(layer.watch_terms),
    ...arrayFrom(layer.beneficiaries),
    ...arrayFrom(layer.losers),
    ...arrayFrom(layer.sources_to_check),
    ...arrayFrom(layer.related_theses),
    ...arrayFrom(layer.related_indicators),
  ].join(' '));
}

function buildRationale(target, score) {
  const layer = score.bestLayer?.name ? ` via ${score.bestLayer.name}` : '';
  const terms = score.matchedTerms.length ? `; matched ${score.matchedTerms.slice(0, 4).join(', ')}` : '';
  const exposure = target.exposure ? ` ${target.exposure}` : '';
  return `${target.label}${layer}${terms}.${exposure}`.replace(/\s+/g, ' ').trim();
}

function confidenceFromScore(score) {
  if (score >= 24) return 'high';
  if (score >= 12) return 'medium';
  return 'low';
}

function rankSignal(status) {
  return SIGNAL_RANK[normalizeSignalStatus(status)] ?? 0;
}

function normalizeSignalStatus(status) {
  const normalized = String(status || 'clear').toLowerCase();
  return Object.prototype.hasOwnProperty.call(SIGNAL_RANK, normalized) ? normalized : 'clear';
}

function originalOrder(handoff, exposureMap) {
  const target = exposureMap.targets.find(row => row.id === handoff.target_id);
  return target?._order ?? Number.MAX_SAFE_INTEGER;
}

function handoffTypeRank(handoff) {
  const ranks = {
    company: 0,
    commodity_proxy: 0,
    sector: 1,
    thesis: 2,
  };
  return ranks[handoff.target_type] ?? 3;
}

function handoffKey(handoff) {
  return `${handoff.target_type}:${handoff.symbol || normalizeText(handoff.label)}`;
}

function overlapCount(left, right) {
  const set = new Set(right.map(value => normalizeText(value)));
  return left.map(value => normalizeText(value)).filter(value => set.has(value)).length;
}

function quoteArg(value) {
  return `"${String(value || '').replace(/"/g, '\\"')}"`;
}

function cleanWikiText(value) {
  return String(value || '').replace(/\[\[|\]\]/g, '').trim();
}

function normalizeText(value) {
  return cleanWikiText(value)
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueValues(values) {
  return [...new Set(arrayFrom(values).map(value => String(value || '').trim()).filter(Boolean))];
}

function arrayFrom(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
