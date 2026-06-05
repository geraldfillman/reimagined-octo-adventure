const REQUIRED_SCENARIO_FIELDS = ['id', 'slug', 'name', 'status', 'asOfDate'];
const DEFAULT_TARGET_LABELS = ['Stock', 'Sector', 'Regime', 'Commodity', 'MacroIndicator'];
const ALLOWED_TARGET_LABELS = new Set(DEFAULT_TARGET_LABELS);
const ALLOWED_SECTOR_RULES = new Set(['FAVORS_SECTOR', 'PRESSURES_SECTOR']);

export function normalizeScenarioConfig(raw = {}) {
  for (const field of REQUIRED_SCENARIO_FIELDS) {
    if (!raw[field]) throw new Error(`Scenario config missing required field: ${field}`);
  }

  const shockVectors = arrayOfObjects(raw.shockVectors, 'shockVectors');
  const riskThemes = arrayOfObjects(raw.riskThemes, 'riskThemes');
  const themeMappings = normalizeThemeMappings(raw.themeMappings);
  const sectorRules = normalizeSectorRules(raw.sectorRules);
  const candidateExposure = normalizeCandidateExposure(raw.candidateExposure);

  const shockVectorIds = new Set(shockVectors.map(vector => vector.id));
  const riskThemeIds = new Set(riskThemes.map(theme => theme.id));
  for (const { from, to } of themeMappings) {
    if (!shockVectorIds.has(from)) throw new Error(`Theme mapping references unknown ShockVector: ${from}`);
    if (!riskThemeIds.has(to)) throw new Error(`Theme mapping references unknown RiskTheme: ${to}`);
  }
  for (const rule of sectorRules) {
    if (!riskThemeIds.has(rule.themeId)) throw new Error(`Sector rule references unknown RiskTheme: ${rule.themeId}`);
  }

  return {
    ...raw,
    tags: normalizeList(raw.tags),
    domains: normalizeList(raw.domains),
    shockVectors: shockVectors.map(vector => ({
      ...vector,
      status: vector.status || raw.status,
      tags: normalizeList(vector.tags),
      domains: normalizeList(vector.domains || raw.domains),
      anchors: normalizeList(vector.anchors),
    })),
    riskThemes: riskThemes.map(theme => ({
      ...theme,
      status: theme.status || raw.status,
      tags: normalizeList(theme.tags),
      domains: normalizeList(theme.domains || raw.domains),
    })),
    themeMappings,
    sectorRules,
    candidateExposure,
  };
}

export function buildDryRunPlan(scenario) {
  return {
    dryRun: true,
    scenario: {
      id: scenario.id,
      name: scenario.name,
      status: scenario.status,
      asOfDate: scenario.asOfDate,
    },
    nodes: {
      scenarios: 1,
      shockVectors: scenario.shockVectors.length,
      riskThemes: scenario.riskThemes.length,
    },
    relationships: {
      shockVectors: scenario.shockVectors.length,
      riskThemes: scenario.riskThemes.length,
      themeMappings: scenario.themeMappings.length,
      sectorRules: scenario.sectorRules.length,
    },
    candidateExposure: {
      maxCandidates: scenario.candidateExposure.maxCandidates,
      minTagScore: scenario.candidateExposure.minTagScore,
      targetLabels: scenario.candidateExposure.targetLabels,
    },
  };
}

export function buildCandidateLinkId({ scenarioId, sourceId, targetId, type }) {
  return [
    'candidate',
    slug(type),
    slug(scenarioId),
    slug(sourceId),
    slug(targetId),
  ].join(':');
}

export function scoreTagOverlap({ tags = [], target = {} }) {
  const normalizedTags = normalizeList(tags);
  const searchable = expandSearchTerms([
    ...(Array.isArray(target.tags) ? target.tags : []),
    target.name,
    target.canonicalName,
    target.domain,
    target.sector,
    target.subdomain,
  ]).join(' ');

  return normalizedTags.reduce((count, tag) => {
    const terms = expandSearchTerms([tag]);
    return terms.some(term => searchable.includes(term)) ? count + 1 : count;
  }, 0);
}

export function scenarioConfigToCypherParams(scenario) {
  return {
    scenario: {
      id: scenario.id,
      name: scenario.name,
      status: scenario.status,
      asOfDate: scenario.asOfDate,
      createdBy: scenario.createdBy || 'codex',
      method: scenario.method || 'scenario_theory_seed_v1',
      tags: scenario.tags,
      domains: scenario.domains,
      riskThemes: scenario.riskThemes.map(theme => theme.id),
    },
    shockVectors: scenario.shockVectors.map(vector => ({
      id: vector.id,
      name: vector.name,
      vectorType: vector.vectorType,
      status: vector.status,
      direction: vector.direction,
      confidence: vector.confidence,
      tags: vector.tags,
      domains: vector.domains,
      anchors: vector.anchors,
    })),
    riskThemes: scenario.riskThemes.map(theme => ({
      id: theme.id,
      name: theme.name,
      themeType: theme.themeType,
      status: theme.status,
      tags: theme.tags,
      domains: theme.domains,
    })),
    themeMappings: scenario.themeMappings,
    sectorRules: scenario.sectorRules,
  };
}

export function buildScenarioSchemaStatements() {
  return [
    'CYPHER 25 CREATE CONSTRAINT scenario_id_unique IF NOT EXISTS FOR (s:Scenario) REQUIRE s.id IS UNIQUE',
    'CYPHER 25 CREATE CONSTRAINT shockvector_id_unique IF NOT EXISTS FOR (s:ShockVector) REQUIRE s.id IS UNIQUE',
    'CYPHER 25 CREATE CONSTRAINT risktheme_id_unique IF NOT EXISTS FOR (r:RiskTheme) REQUIRE r.id IS UNIQUE',
    'CYPHER 25 CREATE INDEX scenario_status IF NOT EXISTS FOR (s:Scenario) ON (s.status)',
    'CYPHER 25 CREATE INDEX shockvector_type IF NOT EXISTS FOR (s:ShockVector) ON (s.vectorType)',
    'CYPHER 25 CREATE INDEX risktheme_type IF NOT EXISTS FOR (r:RiskTheme) ON (r.themeType)',
  ];
}

export function buildWriteScenarioCypher() {
  return `CYPHER 25
MERGE (sc:Scenario {id: $scenario.id})
SET sc.name = $scenario.name,
    sc.status = $scenario.status,
    sc.asOfDate = date($scenario.asOfDate),
    sc.createdBy = $scenario.createdBy,
    sc.method = $scenario.method,
    sc.tags = $scenario.tags,
    sc.domains = $scenario.domains,
    sc.riskThemes = $scenario.riskThemes,
    sc.updatedAt = datetime()
WITH sc
UNWIND $shockVectors AS row
MERGE (sv:ShockVector {id: row.id})
SET sv.name = row.name,
    sv.scenarioId = sc.id,
    sv.vectorType = row.vectorType,
    sv.status = coalesce(row.status, 'active_watch'),
    sv.direction = row.direction,
    sv.confidence = toFloat(row.confidence),
    sv.tags = row.tags,
    sv.domains = coalesce(row.domains, []),
    sv.anchors = coalesce(row.anchors, []),
    sv.updatedAt = datetime()
MERGE (sc)-[:HAS_SHOCK_VECTOR]->(sv)
WITH DISTINCT sc
UNWIND $riskThemes AS row
MERGE (rt:RiskTheme {id: row.id})
SET rt.name = row.name,
    rt.themeType = row.themeType,
    rt.status = coalesce(row.status, 'active_watch'),
    rt.tags = row.tags,
    rt.domains = coalesce(row.domains, []),
    rt.updatedAt = datetime()
MERGE (sc)-[:HAS_RISK_THEME]->(rt)
RETURN sc.id AS scenarioId`;
}

export function buildWriteThemeMappingsCypher() {
  return `CYPHER 25
UNWIND $themeMappings AS row
MATCH (sv:ShockVector {id: row.from})
MATCH (rt:RiskTheme {id: row.to})
MERGE (sv)-[:MAPS_TO_THEME]->(rt)
RETURN count(*) AS mappings`;
}

export function buildCandidateExposureReadCypher() {
  const branches = DEFAULT_TARGET_LABELS.map(label => `  MATCH (target:${label})
  WHERE '${label}' IN $targetLabels
  WITH target, theme, ${matchedTagsExpression('target')} AS matchedTags
  WHERE size(matchedTags) >= $minTagScore
  RETURN target, matchedTags`).join('\n  UNION\n');

  return `CYPHER 25
MATCH (sc:Scenario {id: $scenarioId})-[:HAS_RISK_THEME]->(theme:RiskTheme)
CALL (theme) {
${branches}
}
RETURN
  sc.id AS scenarioId,
  theme.id AS sourceId,
  theme.name AS sourceName,
  theme.tags AS sourceTags,
  labels(target) AS targetLabels,
  target.id AS targetId,
  coalesce(target.name, target.ticker, target.canonicalName) AS targetName,
  matchedTags AS matchedTags,
  size(matchedTags) AS matchedTagCount,
  size(theme.tags) AS sourceTagCount
ORDER BY matchedTagCount DESC, targetName
LIMIT $maxCandidates`;
}

export function buildWriteCandidateExposureCypher() {
  return `CYPHER 25
UNWIND $candidates AS row
MATCH (theme:RiskTheme {id: row.sourceId})
MATCH (target:$($row.targetLabel) {id: row.targetId})
MERGE (c:CandidateLink {id: row.candidateId})
SET c.type = 'scenario_exposure',
    c.status = 'candidate',
    c.reviewState = 'needs_review',
    c.method = 'scenario_theory_metadata_match',
    c.source = 'neo4j-scenario-theory',
    c.reason = row.reason,
    c.score = row.score,
    c.createdBy = 'codex',
    c.asOfDate = date(row.asOfDate),
    c.lastSeen = date(row.asOfDate),
    c.matchedTags = row.matchedTags,
    c.scenarioId = row.scenarioId,
    c.updatedAt = datetime()
MERGE (theme)-[:PROPOSED_BY]->(c)
MERGE (c)-[:PROPOSES]->(target)
RETURN count(DISTINCT c) AS candidateLinks`;
}

export function normalizeCandidateRows(records, scenario) {
  return records
    .map(recordToCandidate(scenario))
    .filter(candidate => candidate.targetId && candidate.sourceId && candidate.targetLabel)
    .map(candidate => ({
      ...candidate,
      candidateId: buildCandidateLinkId({
        scenarioId: candidate.scenarioId,
        sourceId: candidate.sourceId,
        targetId: candidate.targetId,
        type: 'scenario_exposure',
      }),
    }));
}

function recordToCandidate(scenario) {
  return record => {
    const sourceTagCount = numericRecordValue(record.get('sourceTagCount'));
    const matchedTagCount = numericRecordValue(record.get('matchedTagCount'));
    const targetName = record.get('targetName') || record.get('targetId');
    const sourceName = record.get('sourceName') || record.get('sourceId');
    const targetLabels = record.get('targetLabels') || [];
    const targetLabel = DEFAULT_TARGET_LABELS.find(label => targetLabels.includes(label));
    return {
      scenarioId: record.get('scenarioId'),
      sourceId: record.get('sourceId'),
      sourceName,
      targetId: record.get('targetId'),
      targetName,
      targetLabel,
      asOfDate: scenario.asOfDate,
      score: sourceTagCount > 0 ? Number((matchedTagCount / sourceTagCount).toFixed(3)) : 0.5,
      matchedTags: record.get('matchedTags') || [],
      reason: `Scenario metadata overlap between ${sourceName} and ${targetName}`,
    };
  };
}

function matchedTagsExpression(targetVar) {
  return `[tag IN coalesce(theme.tags, []) WHERE
    tag IN coalesce(${targetVar}.tags, [])
    OR toLower(coalesce(${targetVar}.name, '')) CONTAINS tag
    OR toLower(coalesce(${targetVar}.canonicalName, '')) CONTAINS tag
    OR toLower(coalesce(${targetVar}.domain, '')) CONTAINS tag
    OR toLower(coalesce(${targetVar}.sector, '')) CONTAINS tag
    OR toLower(coalesce(${targetVar}.subdomain, '')) CONTAINS tag]`;
}

function normalizeThemeMappings(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (!Array.isArray(item) || item.length !== 2) {
      throw new Error(`Scenario themeMappings[${index}] must be a [from, to] pair`);
    }
    return { from: String(item[0]), to: String(item[1]) };
  });
}

function normalizeSectorRules(value) {
  if (!Array.isArray(value)) return [];
  return value.map((rule, index) => {
    if (!rule || typeof rule !== 'object') throw new Error(`Scenario sectorRules[${index}] must be an object`);
    if (!ALLOWED_SECTOR_RULES.has(rule.relation)) throw new Error(`Unsupported sector rule relation: ${rule.relation}`);
    return {
      themeId: String(rule.themeId || ''),
      relation: rule.relation,
      sectorNames: arrayOfStrings(rule.sectorNames),
    };
  });
}

function normalizeCandidateExposure(value = {}) {
  const targetLabels = arrayOfStrings(value.targetLabels?.length ? value.targetLabels : DEFAULT_TARGET_LABELS);
  for (const label of targetLabels) {
    if (!ALLOWED_TARGET_LABELS.has(label)) throw new Error(`Unsupported scenario candidate target label: ${label}`);
  }
  return {
    maxCandidates: Number(value.maxCandidates ?? 100),
    minTagScore: Number(value.minTagScore ?? 1),
    targetLabels,
  };
}

function normalizeList(value) {
  return [...new Set(arrayOfStrings(value).map(item => item.toLowerCase()))];
}

function arrayOfStrings(value) {
  const list = Array.isArray(value) ? value : [value];
  return list.map(item => String(item || '').trim()).filter(Boolean);
}

function arrayOfObjects(value, field) {
  if (!Array.isArray(value) || value.some(item => !item || typeof item !== 'object')) {
    throw new Error(`Scenario config field ${field} must be an array of objects`);
  }
  return value;
}

function expandSearchTerms(value) {
  const terms = normalizeList(value);
  const expanded = new Set(terms);
  for (const term of terms) {
    if (term.endsWith('ies')) expanded.add(`${term.slice(0, -3)}y`);
    if (term.endsWith('s')) expanded.add(term.slice(0, -1));
  }
  return [...expanded];
}

function numericRecordValue(value) {
  if (typeof value?.toNumber === 'function') return value.toNumber();
  return Number(value ?? 0);
}

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
