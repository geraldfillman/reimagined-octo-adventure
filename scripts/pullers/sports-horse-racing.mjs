/**
 * sports-horse-racing.mjs - Kentucky Derby horse-racing prep pull
 *
 * Usage:
 *   node run.mjs pull sports-horse-racing
 *   node run.mjs pull sports-horse-racing --year 2026
 *   node run.mjs pull sports-horse-racing --dry-run
 */

import { join, relative } from 'path';
import { dirname } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { fetchWithRetry } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const DEFAULT_YEAR = '2026';
const DEFAULT_RACE_DATE_BY_YEAR = Object.freeze({
  2026: '2026-05-02',
});

const DEFAULT_SOURCE_URL = 'https://www.kentuckyderby.com/derby-horses/';
const LEDGER_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'predictions');
const MODEL_VERSION = 'horse-racing-field-v1';
const PROFILE_FETCH_DELAY_MS = 150;
const LEDGER_COLUMNS = Object.freeze([
  'prediction_id',
  'event_id',
  'date',
  'sport',
  'league',
  'event',
  'market',
  'selection',
  'side',
  'odds_american',
  'odds_decimal',
  'implied_probability',
  'model_probability',
  'edge',
  'confidence_score',
  'status',
  'model_version',
  'stake',
  'variable_snapshot',
  'result',
  'closing_odds_decimal',
  'actual_home_score',
  'actual_away_score',
  'finish_position',
  'notes',
]);

export async function pull(flags = {}) {
  const year = String(flags.year || DEFAULT_YEAR);
  const raceDate = String(flags['race-date'] || DEFAULT_RACE_DATE_BY_YEAR[year] || '');
  const sourceUrl = String(flags.url || DEFAULT_SOURCE_URL);

  console.log(`Horse racing: fetching Kentucky Derby ${year} prep board`);
  console.log(`  Source: ${sourceUrl}`);

  const response = await fetchWithRetry(sourceUrl, {
    timeout: 45_000,
    headers: {
      'User-Agent': 'MyData-Vault/1.0 DerbyPrepPull/1.0',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok || typeof response.data !== 'string') {
    throw new Error(`Kentucky Derby source fetch failed: HTTP ${response.status}`);
  }

  const contenders = parseContenders(response.data);
  const enrichedContenders = flags['no-profiles']
    ? contenders
    : await enrichContendersWithProfiles(contenders);
  const ledgerRows = buildFieldLedgerRows({ year, raceDate, sourceUrl, contenders: enrichedContenders });
  const ledgerPath = join(LEDGER_DIR, `${raceDate || today()}_horse_racing_kentucky_derby_${year}.csv`);
  const note = buildDerbyPrepNote({ year, raceDate, sourceUrl, contenders: enrichedContenders, ledgerRows, ledgerPath });
  const filePath = join(getPullsDir(), 'Sports', dateStampedFilename(`Horse_Racing_Kentucky_Derby_${year}_Prep`));

  if (flags['dry-run']) {
    console.log(`  [dry-run] Contenders parsed: ${enrichedContenders.length}`);
    console.log(`  [dry-run] Field ledger rows: ${ledgerRows.length}`);
    console.log(`  [dry-run] Would write ledger: ${ledgerPath}`);
    console.log(`  [dry-run] Would write: ${filePath}`);
  } else {
    mkdirSync(dirname(ledgerPath), { recursive: true });
    writeFileSync(ledgerPath, toCsv(LEDGER_COLUMNS, ledgerRows), 'utf8');
    writeNote(filePath, note);
    console.log(`  Contenders parsed: ${enrichedContenders.length}`);
    console.log(`  Ledger: ${ledgerPath}`);
    console.log(`  Wrote: ${filePath}`);
  }

  if (flags.json) {
    console.log(JSON.stringify({ year, raceDate, sourceUrl, contenderCount: enrichedContenders.length, ledgerRows: ledgerRows.length, contenders: enrichedContenders }, null, 2));
  }

  return {
    filePath: flags['dry-run'] ? null : filePath,
    ledgerPath: flags['dry-run'] ? null : ledgerPath,
    year,
    raceDate,
    contenderCount: enrichedContenders.length,
    ledgerRows: ledgerRows.length,
    signals: enrichedContenders.length === 0 ? ['horse_racing_derby_no_contenders_parsed'] : [],
  };
}

function buildDerbyPrepNote({ year, raceDate, sourceUrl, contenders, ledgerRows, ledgerPath }) {
  const topOdds = [...contenders]
    .filter(row => row.morningLineOdds)
    .sort((a, b) => fractionalOddsToDecimal(a.morningLineOdds) - fractionalOddsToDecimal(b.morningLineOdds))
    .slice(0, 6)
    .map(row => `${row.horse} ${row.morningLineOdds}`)
    .join('; ');

  const ledgerPreviewRows = ledgerRows.slice(0, 10).map(row => [
    row.selection,
    row.side,
    row.odds_american,
    formatPercent(Number(row.implied_probability) * 100),
    formatPercent(Number(row.model_probability) * 100),
    formatPercent(Number(row.edge) * 100),
    row.confidence_score,
  ]);

  const rows = contenders.map(row => [
    row.post,
    row.horse,
    row.morningLineOdds,
    row.trainer,
    row.jockey,
    row.points,
    row.earnings,
    row.sex,
    row.color,
    row.profileUrl,
  ]);

  const profileRows = contenders.map(row => [
    row.post,
    row.horse,
    row.profile?.status || 'not_fetched',
    row.profile?.sire || '',
    row.profile?.damFamily || '',
    row.profile?.paceStyle || '',
    row.profile?.recentPrep || '',
    row.profile?.riskNotes?.join('; ') || '',
    row.profile?.evidenceLinks?.slice(0, 2).map(link => link.text).join('; ') || '',
  ]);

  const factorRows = [
    ['Speed figures', 'Missing', 'Needs Beyer/Equibase/Timeform-style recent speed figures before model scoring.'],
    ['Class change', 'Partial', 'Prep path and points imply class context, but last-race class levels are not normalized here.'],
    ['Rest days', 'Missing', 'Needs last start date per runner.'],
    ['Jockey/trainer form', 'Partial', 'Jockey and trainer names are captured; 30-day strike rates are not.'],
    ['Post position', 'Captured', 'Official post is captured from the Derby leaderboard.'],
    ['Distance/surface/going fit', 'Missing', 'Needs race history by 10f dirt and expected Churchill going.'],
    ['Pace fit', 'Missing', 'Needs running style and field pace projection.'],
    ['Weight', 'Missing', 'Needs assigned weight and field average.'],
  ];

  return buildNote({
    frontmatter: {
      title: `Horse Racing Derby Prep - Kentucky Derby ${year}`,
      source: 'Kentucky Derby official leaderboard',
      source_url: sourceUrl,
      date_pulled: today(),
      event_date: raceDate,
      domain: 'sports',
      data_type: 'horse_racing_derby_prep',
      frequency: 'on-demand',
      signal_status: contenders.length === 0 ? 'watch' : 'clear',
      signals: contenders.length === 0 ? ['horse_racing_derby_no_contenders_parsed'] : [],
      contender_count: contenders.length,
      ledger_rows: ledgerRows.length,
      ledger: relative(getVaultRoot(), ledgerPath),
      top_morning_line: topOdds,
      tags: ['sports', 'horse-racing', 'kentucky-derby', 'derby-prep', 'backtesting-input'],
    },
    sections: [
      {
        heading: 'Executive Summary',
        content: [
          `Race: Kentucky Derby ${year}`,
          raceDate ? `Race date: ${raceDate}` : 'Race date: not configured',
          `Source: ${sourceUrl}`,
          `Contenders parsed: ${contenders.length}`,
          `Field ledger rows: ${ledgerRows.length}`,
          `Ledger: ${relative(getVaultRoot(), ledgerPath)}`,
          topOdds ? `Top morning-line cluster: ${topOdds}` : 'Top morning-line cluster: N/A',
          '',
          'This is a preparation pull for horse-racing research. The generated CSV is a field-event ledger: each horse is one pending runner row using de-vigged morning-line probability as the baseline model.',
        ].join('\n'),
      },
      {
        heading: 'Field Snapshot',
        content: contenders.length
          ? buildTable(['Post', 'Horse', 'ML Odds', 'Trainer', 'Jockey', 'Points', 'Earnings', 'Sex', 'Color', 'Profile'], rows)
          : 'No contenders were parsed from the source page.',
      },
      {
        heading: 'Field Ledger Preview',
        content: ledgerPreviewRows.length
          ? buildTable(['Horse', 'Post', 'ML Odds', 'Implied P', 'Model P', 'Edge', 'Score'], ledgerPreviewRows)
          : 'No ledger rows were generated.',
      },
      {
        heading: 'Profile Enrichment',
        content: contenders.length
          ? buildTable(['Post', 'Horse', 'Status', 'Sire', 'Dam Family', 'Pace', 'Prep Signal', 'Risk Notes', 'Evidence Links'], profileRows)
          : 'No horse profiles were enriched.',
      },
      {
        heading: 'Factor Readiness',
        content: buildTable(['Factor Group', 'Status', 'Next Input Needed'], factorRows),
      },
      {
        heading: 'Source Notes',
        content: [
          `Official leaderboard: ${sourceUrl}`,
          `Prediction ledger: ${relative(getVaultRoot(), ledgerPath)}`,
          '',
          '`sports-backtest` can read this ledger after `result` is manually settled to `win`, `loss`, or `push`. `sports-settle` does not yet settle horse-racing rows automatically because ESPN home/away scores do not apply to a multi-runner race.',
          '',
          'Use this pull as the field roster baseline. Add speed figures, workouts, pace style, final track condition, and late scratches to move beyond the morning-line baseline.',
        ].join('\n'),
      },
    ],
  });
}

function buildFieldLedgerRows({ year, raceDate, sourceUrl, contenders }) {
  const priced = contenders
    .map(contender => ({ contender, odds: parseFractionalOdds(contender.morningLineOdds) }))
    .filter(row => row.odds);
  const impliedTotal = priced.reduce((sum, row) => sum + row.odds.impliedProbability, 0);
  if (impliedTotal <= 0) return [];

  return priced.map(({ contender, odds }) => {
    const modelProbability = odds.impliedProbability / impliedTotal;
    const edge = modelProbability - odds.impliedProbability;
    const snapshot = {
      model_version: MODEL_VERSION,
      source_url: sourceUrl,
      race_year: year,
      race_date: raceDate,
      race: `Kentucky Derby ${year}`,
      horse: contender.horse,
      post_position: Number(contender.post),
      trainer: contender.trainer,
      jockey: contender.jockey,
      owner: contender.owner,
      earnings: contender.earnings,
      total_points: contender.points,
      morning_line_odds: contender.morningLineOdds,
      profile_url: contender.profileUrl,
      profile_fetch_status: contender.profile?.status || 'not_fetched',
      sire: contender.profile?.sire || '',
      dam_family: contender.profile?.damFamily || '',
      pace_style_hint: contender.profile?.paceStyle || '',
      recent_prep_signal: contender.profile?.recentPrep || '',
      profile_risk_notes: contender.profile?.riskNotes || [],
      profile_evidence_links: contender.profile?.evidenceLinks || [],
      profile_fields_captured: contender.profile?.fieldsCaptured || [],
      market_implied_probability: round(odds.impliedProbability, 4),
      field_implied_total: round(impliedTotal, 4),
      devig_method: 'field_normalized_morning_line',
      factor_key: 'horse_racing',
      factor_count_total: 14,
      factor_count_used: 2,
      factor_coverage_ratio: round(2 / 14, 4),
      model_confidence: 0.14,
      factor_contributions_top5: [
        { id: 'horse_racing_post_position_bias', status: 'captured_unscored' },
        { id: 'horse_racing_connections_names', status: 'captured_unscored' },
        { id: 'horse_racing_profile_pedigree_hint', status: contender.profile?.sire ? 'captured_unscored' : 'missing' },
        { id: 'horse_racing_profile_pace_hint', status: contender.profile?.paceStyle ? 'captured_unscored' : 'missing' },
        { id: 'horse_racing_profile_recent_prep_hint', status: contender.profile?.recentPrep ? 'captured_unscored' : 'missing' },
      ],
      missing_inputs: ['speed_figures', 'last_start_date', 'pace_style', 'distance_record', 'surface_record', 'going_record', 'assigned_weight'],
    };

    return {
      prediction_id: [raceDate || today(), 'horse-racing', `kentucky-derby-${year}`, contender.post, contender.horse].map(sanitizeId).join('__'),
      event_id: `kentucky-derby-${year}`,
      date: raceDate || today(),
      sport: 'horse-racing',
      league: 'Kentucky Derby',
      event: `Kentucky Derby ${year}`,
      market: 'win',
      selection: contender.horse,
      side: contender.post,
      odds_american: odds.american,
      odds_decimal: round(odds.decimal, 4),
      implied_probability: round(odds.impliedProbability, 4),
      model_probability: round(modelProbability, 4),
      edge: round(edge, 4),
      confidence_score: 14,
      status: 'pending',
      model_version: MODEL_VERSION,
      stake: 1,
      variable_snapshot: JSON.stringify(snapshot),
      result: 'pending',
      closing_odds_decimal: '',
      actual_home_score: '',
      actual_away_score: '',
      finish_position: '',
      notes: 'Field-event baseline from official morning line; manually settle result after race.',
    };
  });
}

async function enrichContendersWithProfiles(contenders) {
  const enriched = [];
  for (const contender of contenders) {
    const profile = await fetchHorseProfile(contender.profileUrl);
    enriched.push({ ...contender, profile });
    await sleep(PROFILE_FETCH_DELAY_MS);
  }
  return enriched;
}

async function fetchHorseProfile(profileUrl) {
  if (!profileUrl) {
    return { status: 'missing_url', fieldsCaptured: [] };
  }

  try {
    const response = await fetchWithRetry(profileUrl, {
      timeout: 45_000,
      headers: {
        'User-Agent': 'MyData-Vault/1.0 DerbyPrepPull/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok || typeof response.data !== 'string') {
      return { status: `fetch_failed_http_${response.status}`, fieldsCaptured: [] };
    }

    return parseHorseProfile(response.data, profileUrl);
  } catch (error) {
    return { status: `fetch_error_${String(error.message || error).slice(0, 80)}`, fieldsCaptured: [] };
  }
}

function parseHorseProfile(html, profileUrl) {
  const details = parseProfileInfoItems(html);
  const overview = firstMatch(html, /<div class="single-horse__copy single-horse__copy--overview">([\s\S]*?)<\/div>/i);
  const overviewText = cleanHtml(overview);
  const links = parseProfileLinks(overview)
    .map(link => ({ ...link, text: normalizeEvidenceText(link.text) }))
    .filter(link => isUsefulEvidenceLink(link.text))
    .slice(0, 8);

  const profile = {
    status: 'fetched',
    source_url: profileUrl,
    owner: details.Owner || '',
    trainer: details.Trainer || '',
    jockey: details.Jockey || '',
    breeder: details.Breeder || '',
    earnings: details.Earnings || '',
    color: details.Color || '',
    sire: extractSireHint(overviewText),
    damFamily: extractDamFamilyHint(overviewText),
    paceStyle: extractPaceStyleHint(overviewText),
    recentPrep: extractRecentPrepHint(overviewText),
    riskNotes: extractRiskNotes(overviewText),
    evidenceLinks: links,
  };

  profile.fieldsCaptured = Object.entries(profile)
    .filter(([key, value]) => !['status', 'source_url', 'fieldsCaptured', 'evidenceLinks', 'riskNotes'].includes(key) && Boolean(value))
    .map(([key]) => key);
  if (profile.riskNotes.length) profile.fieldsCaptured.push('riskNotes');
  if (profile.evidenceLinks.length) profile.fieldsCaptured.push('evidenceLinks');

  return profile;
}

function parseProfileInfoItems(html) {
  const details = {};
  const pattern = /<div class="single-horse__profile-info__item">\s*<p class="single-horse__profile-info__item-title">([\s\S]*?)<\/p>\s*<p class="single-horse__profile-info__item-value">([\s\S]*?)<\/p>\s*<\/div>/gi;
  for (const match of String(html).matchAll(pattern)) {
    const key = cleanHtml(match[1]);
    const value = cleanHtml(match[2]);
    if (key && value) details[key] = value;
  }
  return details;
}

function parseProfileLinks(html) {
  const links = [];
  for (const match of String(html || '').matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeEntities(match[1]);
    const text = cleanHtml(match[2]);
    if (href && text) links.push({ text, href });
  }
  return links;
}

function normalizeEvidenceText(text) {
  return cleanHtml(text)
    .replace(/[\u2012\u2013\u2014\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\*\*/g, '')
    .slice(0, 90);
}

function isUsefulEvidenceLink(text) {
  if (!text) return false;
  if (/^bet\b/i.test(text)) return false;
  if (/^@|^#|^pic\.twitter/i.test(text)) return false;
  if (/^https?:\/\//i.test(text)) return false;
  if (/^[A-Z][a-z]+ \d{1,2}, \d{4}$/.test(text)) return false;
  if (/^\d{4}$/.test(text)) return false;
  return text.length >= 4;
}

function extractSireHint(text) {
  const father = firstMatch(text, /\bfather is ([^,.!?;]+)/i);
  if (father) return father;
  return firstMatch(text, /\bpedigree\s*,?\s*([^,.!?;]+?)\s+out of\b/i);
}

function extractDamFamilyHint(text) {
  const mother = firstMatch(text, /\bmother comes from the ([^,.!?;]+? family)/i);
  if (mother) return mother;
  return firstMatch(text, /\bout of a ([^,.!?;]+? mare)/i);
}

function extractPaceStyleHint(text) {
  const lower = String(text || '').toLowerCase();
  if (/\bclos(e|er|ing)|off the pace|finishing kick|late pace\b/.test(lower)) return 'closer';
  if (/\bfront.?runner|front end|wire-to-wire|early speed|speed horse\b/.test(lower)) return 'front';
  if (/\bstalk|stalking\b/.test(lower)) return 'stalk';
  if (/\bpress|pressing\b/.test(lower)) return 'press';
  return '';
}

function extractRecentPrepHint(text) {
  const lower = String(text || '').toLowerCase();
  if (lower.includes('arkansas derby')) return 'Arkansas Derby';
  if (lower.includes('florida derby')) return 'Florida Derby';
  if (lower.includes('blue grass')) return 'Blue Grass';
  if (lower.includes('santa anita derby')) return 'Santa Anita Derby';
  if (lower.includes('louisiana derby')) return 'Louisiana Derby';
  if (lower.includes('wood memorial')) return 'Wood Memorial';
  if (lower.includes('sam f. davis')) return 'Sam F. Davis';
  if (lower.includes('tampa bay derby')) return 'Tampa Bay Derby';
  if (lower.includes('rebel stakes')) return 'Rebel Stakes';
  return '';
}

function extractRiskNotes(text) {
  const lower = String(text || '').toLowerCase();
  const notes = [];
  if (lower.includes('traffic')) notes.push('traffic risk');
  if (lower.includes('trip-related') || lower.includes('trip related')) notes.push('trip risk');
  if (lower.includes('layoff')) notes.push('layoff risk');
  if (lower.includes('distance')) notes.push('distance question');
  if (lower.includes('pace')) notes.push('pace dependency');
  return [...new Set(notes)].slice(0, 4);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseContenders(html) {
  const chunks = String(html).split(/<li\s+class="leaderboard-show__table__row"/i).slice(1);
  const contenders = [];

  for (const rawChunk of chunks) {
    const chunk = rawChunk.slice(0, rawChunk.search(/<\/li>/i) + 5 || rawChunk.length);
    const heading = firstMatch(chunk, /<div class="leaderboard-show__table__row__heading">([\s\S]*?)<div class="leaderboard-show__table__row__content"/i);
    if (!heading) continue;

    const post = cleanHtml(firstMatch(heading, /<div class="leaderboard-show__table__row__heading__column">\s*<p>([\s\S]*?)<\/p>/i));
    const profileUrl = cleanHtml(firstMatch(heading, /<a href="([^"]+)" target="_blank">/i));
    const horse = cleanHtml(firstMatch(heading, /<a href="[^"]+" target="_blank">\s*([\s\S]*?)\s*<\/a>/i));
    if (!horse || !/^\d+$/.test(post)) continue;

    const headingCells = [...heading.matchAll(/<div class="leaderboard-show__table__row__heading__column">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/gi)]
      .map(match => cleanHtml(match[1]))
      .filter(Boolean);

    const details = parseDetails(chunk);
    const owner = details.OWNER || headingCells[2] || '';
    const trainer = details.TRAINER || headingCells[3] || '';
    const morningLineOdds = headingCells.find(cell => /^\d+\s*-\s*\d+$/.test(cell)) || '';

    contenders.push({
      post,
      horse,
      owner,
      trainer,
      morningLineOdds,
      jockey: details.JOCKEY || '',
      breeder: details.BREEDER || '',
      sex: details.SEX || '',
      color: details.COLOR || '',
      earnings: details.EARNINGS || '',
      points: details['TOTAL POINTS'] || '',
      profileUrl,
    });
  }

  return contenders.sort((a, b) => Number(a.post) - Number(b.post));
}

function parseDetails(chunk) {
  const details = {};
  const pattern = /<p>\s*([A-Z][A-Z\s]+?)\s*<span>([\s\S]*?)<\/span>\s*<\/p>/gi;
  for (const match of chunk.matchAll(pattern)) {
    const key = cleanHtml(match[1]).replace(/\s+/g, ' ').trim();
    const value = cleanHtml(match[2]);
    if (key && value) details[key] = value;
  }
  return details;
}

function firstMatch(text, pattern) {
  const match = String(text).match(pattern);
  return match ? match[1] : '';
}

function cleanHtml(value) {
  return decodeEntities(String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim());
}

function decodeEntities(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function fractionalOddsToDecimal(value) {
  const parsed = parseFractionalOdds(value);
  return parsed ? parsed.decimal - 1 : Number.POSITIVE_INFINITY;
}

function parseFractionalOdds(value) {
  const match = String(value || '').match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  const decimal = 1 + (numerator / denominator);
  return {
    numerator,
    denominator,
    decimal,
    american: numerator >= denominator
      ? `+${Math.round((numerator / denominator) * 100)}`
      : String(Math.round(-100 / (numerator / denominator))),
    impliedProbability: 1 / decimal,
  };
}

function toCsv(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(header => csvCell(row[header] ?? '')).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function csvCell(value) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

function sanitizeId(value) {
  return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
