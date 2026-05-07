/**
 * market-cycle-monitor.mjs - writes Research Spine market cycle status notes.
 *
 * Raw source artifacts stay in My_Data. Generated status notes live in
 * The Research Spine and link back to source pull notes only.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';

import {
  getEngineRoot,
  getPullsDir,
  getResearchVaultRoot,
  toEngineRelative,
} from '../lib/config.mjs';
import { buildTable } from '../lib/markdown.mjs';

const SOURCE = 'market-cycle-monitor';
const GENERATED_BY = 'Research Spine Market Cycle Monitor';
const SOURCE_VAULT_NAME = 'My_Data';
const CONFIG_REL_PATH = ['99_System', 'config', 'market-cycle-monitor.config.json'];
const GENERIC_DATA_TYPES = new Set([
  'time_series',
  'event_list',
  'daily_index_snapshot',
  'snapshot',
]);
const RECENT_PULL_LIMIT = 1600;
const SOURCE_TOKEN_STOPWORDS = new Set([
  'api',
  'v2',
  'data',
  'the',
  'and',
  'or',
  'of',
  'for',
  'a',
  'an',
  'to',
  'by',
]);
const RATES_FUNDING_TERMS = [
  'rates',
  'rate',
  'treasury',
  'yield',
  'yields',
  'sofr',
  'repo',
  'funding',
  'collateral',
  'macro volatility',
];
const HISTORICAL_CASE_TERMS = [
  'historical',
  'history',
  'case',
  'cases',
  'crisis',
  'crash',
  'ltcm',
  'gfc',
  'flash',
  'volmageddon',
  'archegos',
  'svb',
  'ldi',
  'nickel',
  'gamestop',
  'yen',
  'wti',
  '1987',
  '2020',
];
const COMMODITY_DELIVERY_STORAGE_TERMS = [
  'delivery',
  'deliveries',
  'storage',
  'inventory',
  'inventories',
  'oil',
  'gas',
  'petroleum',
  'crude',
  'futures',
  'curve',
  'commodity',
  'commodities',
  'margin',
  'opec',
  'jodi',
];
const GENERIC_LAYER_TERMS = {
  commodity_delivery_storage: COMMODITY_DELIVERY_STORAGE_TERMS,
  fx_crypto_carry_liquidations: [
    'fx',
    'crypto',
    'bitcoin',
    'btc',
    'dxy',
    'currency',
    'currencies',
    'carry',
    'liquidation',
    'liquidations',
    'macro bridge',
  ],
};

export function classifySignalStatus(signal) {
  const normalized = String(signal || '').trim().toLowerCase();
  return ['critical', 'alert', 'watch', 'clear'].includes(normalized)
    ? normalized
    : 'unknown';
}

export function classifyCoverage({
  latest,
  sourceStatus,
  ageHours,
  staleAfterHours,
  missingInputCount,
  signalStatus,
}) {
  const status = classifySignalStatus(signalStatus);
  const staleHours = normalizeStaleAfterHours(staleAfterHours);

  if (!latest) {
    return { coverageStatus: 'gap', cycleState: 'data_gap' };
  }
  if (String(sourceStatus || '').trim().toLowerCase() === 'degraded') {
    return { coverageStatus: 'degraded', cycleState: 'degraded' };
  }
  if (Number(ageHours) > staleHours) {
    return { coverageStatus: 'stale', cycleState: 'data_gap' };
  }
  if (Number(missingInputCount || 0) > 0) {
    return {
      coverageStatus: 'partial',
      cycleState: stateFromSignal(status, 'incomplete'),
    };
  }

  return {
    coverageStatus: 'active',
    cycleState: stateFromSignal(status, 'stable'),
  };
}

export function resolveCycleStatusRoot(config, researchRoot = getResearchVaultRoot()) {
  const configuredDir = typeof config === 'string'
    ? config
    : config?.cycle_status_dir;
  const resolvedRoot = resolve(researchRoot);
  const resolvedTarget = resolve(resolvedRoot, String(configuredDir || ''));
  return assertContainedPath(resolvedRoot, resolvedTarget, 'cycle_status_dir');
}

export function makeCycleStatusNote(input) {
  const layer = input.layer || {};
  const latest = input.latest || null;
  const label = String(layer.label || input.cycleLayer || 'Unknown Cycle Layer');
  const layerId = String(layer.id || input.cycleLayerId || slugify(label));
  const missingInputs = input.missingInputs ?? missingInputsText(layer);
  const missingInputCount = numberOrDefault(input.missingInputCount, missingInputsCount(layer));
  const staleAfterHours = normalizeStaleAfterHours(input.staleAfterHours ?? layer.stale_after_hours);
  const ageHours = roundOne(numberOrDefault(input.ageHours, latest ? 0 : 999999));
  const lastUpdated = input.lastUpdated || '';
  const sourcePath = normalizeDisplayPath(input.sourcePath ?? latest?.source_path ?? '');
  const sourceRelPath = normalizeDisplayPath(input.sourceRelPath ?? latest?.source_rel_path ?? '');
  const obsidianUrl = input.obsidianUrl ?? latest?.obsidian_url ?? '';
  const title = `${label} Cycle Status`;

  const frontmatter = buildCycleFrontmatter({
    type: 'market_cycle_status',
    title,
    cycle_layer: label,
    cycle_layer_id: layerId,
    cycle_state: input.cycleState || 'data_gap',
    transition: input.transition || 'new',
    signal_status: classifySignalStatus(input.signalStatus),
    coverage_status: input.coverageStatus || 'gap',
    missing_inputs: missingInputs,
    missing_input_count: missingInputCount,
    last_updated: lastUpdated,
    update_cadence: layer.update_cadence || input.updateCadence || '',
    stale_after_hours: staleAfterHours,
    age_hours: ageHours,
    source_path: sourcePath,
    source_rel_path: sourceRelPath,
    obsidian_url: obsidianUrl,
    generated_by: GENERATED_BY,
    generated_on: input.generatedOn || toLocalIsoSeconds(new Date()),
    tags: ['research-spine', 'market-cycle-monitor'],
  });

  const summaryRows = [
    ['Cycle state', input.cycleState || 'data_gap'],
    ['Transition', input.transition || 'new'],
    ['Signal status', classifySignalStatus(input.signalStatus)],
    ['Coverage status', input.coverageStatus || 'gap'],
    ['Last updated', lastUpdated || ''],
    ['Update cadence', layer.update_cadence || input.updateCadence || ''],
    ['Stale after hours', String(staleAfterHours)],
    ['Age hours', String(ageHours)],
    ['Missing inputs', missingInputs || 'None listed'],
  ];

  const latestLines = latest
    ? [
        `- Title: ${latest.title || ''}`,
        `- Data type: ${latest.data_type || ''}`,
        `- My_Data path: \`${sourceRelPath}\``,
        `- Open source: ${obsidianUrl}`,
      ]
    : ['- No matching source artifact was found in My_Data for this cycle layer.'];

  return [
    frontmatter,
    '',
    `# ${title}`,
    '',
    buildTable(['Field', 'Value'], summaryRows),
    '',
    '## Latest Source',
    '',
    ...latestLines,
    '',
    'Link-only policy: this note links to My_Data artifacts and does not copy raw payloads into The Research Spine.',
    '',
  ].join('\n');
}

export async function pull(flags = {}) {
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);
  const engineRoot = getEngineRoot();
  const pullRoot = getPullsDir();
  const researchRoot = resolve(getResearchVaultRoot());
  const config = readCycleConfig(researchRoot);
  const cycleStatusRoot = resolveCycleStatusRoot(config, researchRoot);

  if (!existsSync(pullRoot)) {
    throw new Error(`My_Data pull root not found: ${pullRoot}`);
  }
  if (!dryRun) {
    mkdirSync(cycleStatusRoot, { recursive: true });
  }

  const notes = readRecentPullNotes(pullRoot);
  const outputs = [];

  for (const layer of arrayFrom(config.cycle_layers)) {
    const latestNote = notes.find(note => layerMatchesNote(note, layer)) || null;
    const latest = latestNote ? latestForOutput(latestNote) : null;
    const staleAfterHours = normalizeStaleAfterHours(layer.stale_after_hours);
    const ageHours = latestNote ? (Date.now() - latestNote.mtimeMs) / (60 * 60 * 1000) : 999999;
    const signalStatus = classifySignalStatus(latestNote?.frontmatter?.signal_status);
    const missingList = arrayFrom(layer.known_missing_inputs).map(String).filter(Boolean);
    const { coverageStatus, cycleState } = classifyCoverage({
      latest: latestNote,
      sourceStatus: layer.source_status,
      ageHours,
      staleAfterHours,
      missingInputCount: missingList.length,
      signalStatus,
    });

    const outputPath = resolveContainedChild(
      cycleStatusRoot,
      `${slugify(layer.id || layer.label)}.md`,
      researchRoot,
      `cycle status output for ${layer.id || layer.label || 'unknown layer'}`
    );
    const previousFrontmatter = existsSync(outputPath) ? readFrontmatter(outputPath) : {};
    const transition = classifyTransition(previousFrontmatter, cycleState, coverageStatus);
    const note = makeCycleStatusNote({
      layer,
      latest,
      cycleState,
      transition,
      signalStatus,
      coverageStatus,
      missingInputs: missingList.join('; '),
      missingInputCount: missingList.length,
      lastUpdated: latestNote ? toLocalIsoSeconds(latestNote.mtime) : '',
      staleAfterHours,
      ageHours,
      generatedOn: toLocalIsoSeconds(new Date()),
    });

    const output = {
      layer: String(layer.label || ''),
      layerId: String(layer.id || ''),
      state: cycleState,
      coverage: coverageStatus,
      signal: signalStatus,
      transition,
      missing: missingList.length,
      source: latest?.source_rel_path || '',
      output: outputPath,
    };
    outputs.push(output);

    if (dryRun) {
      console.log(`[dry-run] Would write cycle status: ${outputPath}`);
    } else {
      writeFileSync(outputPath, note, 'utf-8');
      console.log(`Wrote cycle status: ${outputPath}`);
    }
  }

  return { source: SOURCE, outputs, dryRun };

  function latestForOutput(note) {
    const helperRelPath = toEngineRelative(note.path);
    const fallbackRelPath = normalizeDisplayPath(relative(engineRoot, note.path));
    const relPath = helperRelPath && !helperRelPath.startsWith('..') ? helperRelPath : fallbackRelPath;
    return {
      title: note.frontmatter.title || basename(note.path, '.md'),
      source: note.frontmatter.source || '',
      data_type: note.frontmatter.data_type || '',
      date_pulled: note.frontmatter.date_pulled || '',
      signal_status: classifySignalStatus(note.frontmatter.signal_status),
      source_path: normalizeDisplayPath(note.path),
      source_rel_path: relPath,
      obsidian_url: toObsidianUrl(relPath),
    };
  }
}

function stateFromSignal(signalStatus, fallback) {
  if (signalStatus === 'critical' || signalStatus === 'alert') return 'stress';
  if (signalStatus === 'watch') return 'watch';
  return fallback;
}

function readCycleConfig(researchRoot) {
  const configPath = resolveContainedChild(
    researchRoot,
    join(...CONFIG_REL_PATH),
    researchRoot,
    'market cycle config path'
  );
  if (!existsSync(configPath)) {
    throw new Error(`Missing market cycle config: ${configPath}`);
  }
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}

function readRecentPullNotes(root) {
  return listMarkdownFiles(root)
    .map(filePath => {
      const stat = statSync(filePath);
      return {
        path: filePath,
        mtime: stat.mtime,
        mtimeMs: stat.mtimeMs,
        frontmatter: readFrontmatter(filePath),
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, RECENT_PULL_LIMIT);
}

function listMarkdownFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = join(root, entry.name);
    if (fullPath.toLowerCase().includes('_archive')) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function readFrontmatter(filePath) {
  const text = stripBom(readFileSync(filePath, 'utf-8'));
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return {};

  const frontmatter = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---') break;
    const match = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    frontmatter[match[1]] = unquoteFrontmatterValue(match[2].trim());
  }
  return frontmatter;
}

export function layerMatchesNote(note, layer) {
  const fm = note.frontmatter || {};
  const dataType = String(fm.data_type || '').trim().toLowerCase();
  const expectedTypes = arrayFrom(layer.expected_data_types).map(item => String(item).trim().toLowerCase()).filter(Boolean);
  const expectedSources = arrayFrom(layer.expected_sources);
  const sourceMatched = sourceOrTitleMatches(note, expectedSources);
  const context = makeMatchContext(note);
  const layerId = String(layer.id || slugify(layer.label)).trim().toLowerCase();

  if (layerId === 'rates_funding_collateral') {
    return matchesRatesFundingCollateral(context, expectedTypes, sourceMatched);
  }
  if (layerId === 'historical_case_studies') {
    return matchesHistoricalCaseStudies(context, sourceMatched);
  }

  for (const expectedType of expectedTypes) {
    if (dataType !== expectedType) continue;
    if (GENERIC_DATA_TYPES.has(expectedType)) {
      return (sourceMatched || expectedSources.length === 0) && genericLayerHasEvidence(context, layer);
    }
    return true;
  }

  if (expectedTypes.length > 0) {
    return false;
  }

  return sourceMatched;
}

function matchesRatesFundingCollateral(context, expectedTypes, sourceMatched) {
  if (!sourceMatched) return false;
  const typeMatched = expectedTypes.includes(context.dataType);
  const allowedRatesType = typeMatched || ['snapshot', 'time_series', 'macro_volatility'].includes(context.dataType);
  return allowedRatesType && textHasAnyTerm(context, RATES_FUNDING_TERMS);
}

function matchesHistoricalCaseStudies(context, sourceMatched) {
  if (!sourceMatched) return false;
  if (!['semantic_scholar_papers', 'knowledge_gap_report'].includes(context.dataType)) {
    return false;
  }
  return textHasAnyTerm(context, HISTORICAL_CASE_TERMS);
}

function genericLayerHasEvidence(context, layer) {
  const layerId = String(layer.id || slugify(layer.label)).trim().toLowerCase();
  const configuredTerms = GENERIC_LAYER_TERMS[layerId];
  if (configuredTerms) {
    if (layerId === 'commodity_delivery_storage') {
      return textHasAnyTerm(subjectEvidenceContext(context), configuredTerms);
    }
    return textHasAnyTerm(context, configuredTerms);
  }

  const layerTerms = [
    layer.id,
    layer.label,
    ...arrayFrom(layer.expected_sources),
  ];
  return textHasAnyTerm(context, layerTerms);
}

function sourceOrTitleMatches(note, expectedSources) {
  const expected = arrayFrom(expectedSources);
  if (expected.length === 0) return false;

  const context = makeMatchContext(note);
  return expected
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .some(needle => tokenAwareTextMatches(context, needle));
}

function tokenAwareTextMatches(context, needle) {
  const normalizedNeedle = normalizeSearchText(needle);
  const tokens = meaningfulTokens(needle);
  if (tokens.length === 0) return false;
  if (tokens.length <= 2 && normalizedNeedle && context.text.includes(normalizedNeedle)) {
    return true;
  }
  return tokens.every(token => context.tokens.has(token));
}

function textHasAnyTerm(context, terms) {
  return arrayFrom(terms)
    .map(term => String(term || '').trim())
    .filter(Boolean)
    .some(term => tokenAwareTextMatches(context, term));
}

function makeMatchContext(note) {
  const fm = note.frontmatter || {};
  const searchable = [
    fm.source,
    fm.title,
    fm.data_type,
    fm.domain,
    fm.topic,
    fm.query,
    fm.tags,
    note.path,
  ].flat().join(' ');
  const subjectSearchable = [
    fm.source,
    fm.title,
    fm.data_type,
    note.path,
  ].flat().join(' ');

  return {
    dataType: String(fm.data_type || '').trim().toLowerCase(),
    text: normalizeSearchText(searchable),
    tokens: new Set(tokenize(searchable)),
    subjectText: normalizeSearchText(subjectSearchable),
    subjectTokens: new Set(tokenize(subjectSearchable)),
  };
}

function subjectEvidenceContext(context) {
  return {
    dataType: context.dataType,
    text: context.subjectText || context.text,
    tokens: context.subjectTokens || context.tokens,
  };
}

function classifyTransition(previousFrontmatter, cycleState, coverageStatus) {
  const previousState = String(previousFrontmatter.cycle_state || '').trim();
  const previousCoverage = String(previousFrontmatter.coverage_status || '').trim();

  if (!previousState) {
    return 'new';
  }
  if (previousState !== cycleState) {
    return `state_changed_from_${previousState}`;
  }
  if (previousCoverage !== coverageStatus) {
    return `coverage_changed_from_${previousCoverage}`;
  }
  return 'unchanged';
}

function buildCycleFrontmatter(fields) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    lines.push(formatYamlField(key, value));
  }
  lines.push('---');
  return lines.join('\n');
}

function formatYamlField(key, value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return `${key}: []`;
    return [`${key}:`, ...value.map(item => `  - ${yamlQuote(item)}`)].join('\n');
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${key}: ${value}`;
  }
  if (key === 'type') {
    return `${key}: ${String(value)}`;
  }
  return `${key}: ${yamlQuote(value)}`;
}

function yamlQuote(value) {
  return `"${String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n')}"`;
}

function unquoteFrontmatterValue(value) {
  return String(value || '')
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

function missingInputsText(layer) {
  return arrayFrom(layer.known_missing_inputs).map(String).filter(Boolean).join('; ');
}

function missingInputsCount(layer) {
  return arrayFrom(layer.known_missing_inputs).map(String).filter(Boolean).length;
}

function normalizeStaleAfterHours(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 24;
}

function numberOrDefault(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundOne(value) {
  return Math.round(Number(value) * 10) / 10;
}

function slugify(value) {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'item';
}

function toObsidianUrl(relPath) {
  if (!relPath) return '';
  return `obsidian://open?vault=${SOURCE_VAULT_NAME}&file=${encodeURIComponent(relPath.replace(/\\/g, '/'))}`;
}

function toLocalIsoSeconds(date) {
  const pad = value => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
    ':',
    pad(date.getSeconds()),
  ].join('');
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function normalizeDisplayPath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function arrayFrom(value) {
  return Array.isArray(value) ? value : [];
}

function resolveContainedChild(basePath, childPath, containmentRoot, label) {
  return assertContainedPath(containmentRoot, resolve(basePath, childPath), label);
}

function assertContainedPath(rootPath, targetPath, label) {
  const root = resolve(rootPath);
  const target = resolve(targetPath);
  const rel = relative(root, target);
  if (rel !== '' && (rel.startsWith('..') || isAbsolute(rel))) {
    throw new Error(`${label} must stay under Research Spine root: ${target}`);
  }
  return target;
}

function normalizeSearchText(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

function meaningfulTokens(value) {
  return tokenize(value).filter(token => (
    !SOURCE_TOKEN_STOPWORDS.has(token)
    && (token.length > 1 || /^[0-9]+$/.test(token))
  ));
}
