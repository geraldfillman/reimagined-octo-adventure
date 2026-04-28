/**
 * sports-predictions.mjs - generate pending prediction ledgers from slate + odds cache
 *
 * Usage:
 *   node run.mjs pull sports-predictions --date 2026-04-28
 *   node run.mjs pull sports-predictions --from 2026-04-27 --to 2026-04-28
 *   node run.mjs pull sports-predictions --date 2026-04-28 --min-edge 0.01 --force
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { devig, bookmakerOverround } from '../lib/sports/devig.mjs';
import { extractAllForSport } from '../lib/sports/factor-registry.mjs';
import {
  scoreEvent as scoreFactorEvent,
  defaultConfigFor,
  blendWithMarketConsensus,
} from '../lib/sports/scoring.mjs';
import { registry, mapEspnSportToFactorKey } from '../lib/sports/registry-all.mjs';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const ET_TIMEZONE = 'America/New_York';
const PREDICTION_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'predictions');
const ODDS_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'odds');
const ESPN_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'espn');
const MODEL_VERSION = 'multi-factor-v1';
const DEVIG_METHOD = 'multiplicative';
const CSV_COLUMNS = Object.freeze([
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
  'notes',
]);

const SPORTS = Object.freeze({
  baseball: Object.freeze({
    key: 'baseball',
    sport: 'baseball',
    displaySport: 'Baseball',
    league: 'mlb',
    displayLeague: 'MLB',
    espnPath: 'baseball/mlb',
    market: 'home_away',
    marketKey: 'home_away_market',
    period: '',
    scoringWindow: 'full_game',
    starterLabel: 'probable starter',
  }),
  'baseball-f5': Object.freeze({
    key: 'baseball-f5',
    sport: 'baseball',
    displaySport: 'Baseball',
    league: 'mlb',
    displayLeague: 'MLB',
    espnPath: 'baseball/mlb',
    market: 'home_away_1st_half',
    oddsMarket: 'home_away',
    marketKey: 'home_away_market',
    period: '1st_half',
    scoringWindow: 'first_5_innings',
    starterLabel: 'probable starter',
  }),
  basketball: Object.freeze({
    key: 'basketball',
    sport: 'basketball',
    displaySport: 'Basketball',
    league: 'nba',
    displayLeague: 'NBA',
    espnPath: 'basketball/nba',
    market: 'home_away',
    marketKey: 'home_away_market',
    period: '',
    scoringWindow: 'full_game',
  }),
  'ice-hockey': Object.freeze({
    key: 'ice-hockey',
    sport: 'ice-hockey',
    displaySport: 'Hockey',
    league: 'nhl',
    displayLeague: 'NHL',
    espnPath: 'hockey/nhl',
    market: 'home_away',
    marketKey: 'home_away_market',
    period: '',
    scoringWindow: 'full_game',
    starterLabel: 'probable goalie',
  }),
});

const DEFAULT_SPORTS = Object.freeze(['baseball', 'baseball-f5', 'basketball', 'ice-hockey']);

export async function pull(flags = {}) {
  const dates = resolveDates(flags);
  const sports = resolveSports(flags);
  const minEdge = parseProbabilityEdge(flags['min-edge'], 0);
  const results = [];

  for (const date of dates) {
    results.push(await generateDatePredictions(date, sports, minEdge, flags));
  }

  if (flags.json) {
    console.log(JSON.stringify(results, null, 2));
  }

  return results.length === 1
    ? results[0]
    : { filePaths: results.flatMap(result => [result.notePath, result.ledgerPath].filter(Boolean)), results, signals: collectSignals(results) };
}

async function generateDatePredictions(eventDate, sports, minEdge, flags) {
  console.log(`Sports predictions: building ledger for ${eventDate} (${sports.map(s => s.sport).join(', ')})`);

  const sourceResults = await Promise.all(sports.map(sport => buildSportPredictions(eventDate, sport, minEdge, flags)));
  const predictions = sourceResults.flatMap(result => result.predictions);
  const passes = sourceResults.flatMap(result => result.passes);
  const unmatchedOdds = dedupeUnmatchedOdds(sourceResults.flatMap(result => result.unmatchedOdds));
  const sourceErrors = sourceResults.filter(result => result.error);
  const includedRows = flags['include-pass'] ? [...predictions, ...passes] : predictions;

  includedRows.sort(comparePredictionRows);
  passes.sort(comparePredictionRows);

  const ledgerPath = includedRows.length > 0
    ? join(PREDICTION_CACHE_DIR, `${eventDate}_predictions.csv`)
    : null;
  const notePath = join(getPullsDir(), 'Sports', dateStampedFilename(`Sports_Predictions_${eventDate}`));
  const note = buildPredictionNote({
    eventDate,
    minEdge,
    sourceResults,
    predictions,
    passes,
    unmatchedOdds,
    sourceErrors,
    ledgerPath,
    includePass: Boolean(flags['include-pass']),
  });

  if (flags['dry-run']) {
    console.log(`  [dry-run] Candidates: ${predictions.length}; passes: ${passes.length}; unmatched odds: ${unmatchedOdds.length}`);
    if (ledgerPath) console.log(`  [dry-run] Would write ledger: ${ledgerPath}`);
    console.log(`  [dry-run] Would write note: ${notePath}`);
  } else {
    if (ledgerPath) {
      if (existsSync(ledgerPath) && !flags.force) {
        throw new Error(`Prediction ledger already exists: ${ledgerPath}. Pass --force to overwrite.`);
      }
      mkdirSync(dirname(ledgerPath), { recursive: true });
      writeFileSync(ledgerPath, toCsv(includedRows), 'utf8');
      console.log(`  Ledger: ${ledgerPath}`);
    } else {
      console.log('  No candidate predictions met the minimum edge; no ledger written.');
    }
    writeNote(notePath, note);
    console.log(`  Note: ${notePath}`);
  }

  return {
    eventDate,
    predictionCount: predictions.length,
    passCount: passes.length,
    unmatchedOddsCount: unmatchedOdds.length,
    ledgerPath: flags['dry-run'] ? null : ledgerPath,
    notePath: flags['dry-run'] ? null : notePath,
    sourceErrors: sourceErrors.map(result => ({ sport: result.sport.sport, error: result.error })),
    signals: sourceErrors.map(result => `sports_predictions_source_error:${result.sport.sport}`),
  };
}

async function buildSportPredictions(eventDate, sport, minEdge, flags) {
  const oddsPath = oddsPathFor(eventDate, sport);
  const result = {
    sport,
    oddsPath,
    espnUrl: espnUrlFor(eventDate, sport),
    events: [],
    oddsRecords: [],
    predictions: [],
    passes: [],
    unmatchedOdds: [],
    error: '',
  };

  try {
    result.events = await fetchEspnEvents(eventDate, sport, flags);
  } catch (err) {
    result.error = `ESPN fetch failed: ${err.message}`;
    return result;
  }

  if (!existsSync(oddsPath)) {
    result.error = `Odds cache missing: ${relative(getVaultRoot(), oddsPath)}`;
    return result;
  }

  try {
    result.oddsRecords = JSON.parse(readFileSync(oddsPath, 'utf8'));
  } catch (err) {
    result.error = `Odds cache parse failed: ${err.message}`;
    return result;
  }

  if (!Array.isArray(result.oddsRecords)) {
    result.error = 'Odds cache is not a JSON array';
    return result;
  }

  const cleanOdds = cleanOddsRecordsForDate(result.oddsRecords, eventDate, sport);
  result.oddsRecords = cleanOdds.records;
  result.unmatchedOdds.push(...cleanOdds.rejected);

  for (const oddsRecord of result.oddsRecords) {
    const oddsDate = formatDateEt(parseOddsMatchDate(oddsRecord.match_date));
    if (oddsDate && oddsDate !== eventDate) {
      result.unmatchedOdds.push(buildUnmatchedOddsRow(sport, oddsRecord, `odds match_date resolves to ${oddsDate}`));
      continue;
    }

    const event = matchEvent(result.events, oddsRecord);
    if (!event) {
      result.unmatchedOdds.push(buildUnmatchedOddsRow(sport, oddsRecord, 'no ESPN event match'));
      continue;
    }

    const candidate = buildPredictionRow({ eventDate, sport, event, oddsRecord, minEdge, oddsPath });
    if (!candidate) {
      result.unmatchedOdds.push(buildUnmatchedOddsRow(sport, oddsRecord, 'no usable two-sided market rows'));
      continue;
    }

    if (candidate.edge >= minEdge) {
      result.predictions.push(candidate);
    } else {
      result.passes.push({
        ...candidate,
        status: 'pass',
        notes: `${candidate.notes}; below min edge ${formatPercent(minEdge * 100)}`,
      });
    }
  }

  result.predictions = dedupePredictionRows(result.predictions);
  result.passes = dedupePredictionRows(result.passes);
  result.unmatchedOdds = dedupeUnmatchedOdds(result.unmatchedOdds);

  return result;
}

export function cleanOddsRecordsForDate(records, eventDate, sport) {
  const byKey = new Map();
  const rejected = [];

  for (const record of records) {
    const oddsDate = formatDateEt(parseOddsMatchDate(record.match_date));
    if (oddsDate && oddsDate !== eventDate) {
      rejected.push(buildUnmatchedOddsRow(sport, record, `odds match_date resolves to ${oddsDate}`));
      continue;
    }

    const key = oddsRecordKey(record);
    const current = byKey.get(key);
    if (!current || compareOddsRecordQuality(record, current, sport) < 0) {
      byKey.set(key, record);
    }
  }

  return {
    records: [...byKey.values()].sort(compareOddsRecords),
    rejected: dedupeUnmatchedOdds(rejected),
  };
}

async function fetchEspnEvents(eventDate, sport, flags = {}) {
  const url = espnUrlFor(eventDate, sport);
  const cachePath = espnCachePathFor(eventDate, sport);
  const shouldRefresh = Boolean(flags['refresh-source'] || flags.refresh);
  let data;

  if (!shouldRefresh && existsSync(cachePath)) {
    data = JSON.parse(readFileSync(cachePath, 'utf8'));
  } else {
    data = await getJson(url);
    mkdirSync(dirname(cachePath), { recursive: true });
    writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf8');
  }

  const events = Array.isArray(data.events) ? data.events : [];
  return events.map(event => normalizeEspnEvent(event, sport, url));
}

function normalizeEspnEvent(event, sport, sourceUrl) {
  const competition = event.competitions?.[0] ?? {};
  const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
  const home = competitors.find(c => c.homeAway === 'home') ?? competitors[0] ?? null;
  const away = competitors.find(c => c.homeAway === 'away') ?? competitors.find(c => c !== home) ?? null;
  const probables = extractProbables(competitors);
  const venue = formatVenue(competition.venue);
  const environment = formatEnvironment(competition.venue, competition.weather);
  const weatherRisk = classifyWeatherRisk(competition.venue, competition.weather);
  const availability = formatAvailability(sport, probables, competition);
  const score = scoreEvent({ competition, probables, venue: competition.venue, weatherRisk });

  return {
    id: event.id ?? competition.id ?? '',
    event: event.shortName || event.name || 'Untitled event',
    eventName: event.name || event.shortName || 'Untitled event',
    startIso: event.date || competition.date || '',
    startEt: formatDateTimeEt(event.date || competition.date),
    eventState: event.status?.type?.state || competition.status?.type?.state || '',
    eventStatusDetail: event.status?.type?.detail || event.status?.type?.shortDetail || competition.status?.type?.detail || '',
    home: normalizeCompetitor(home),
    away: normalizeCompetitor(away),
    probables,
    venue,
    environment,
    weatherRisk,
    availability,
    availabilityQuality: classifyAvailabilityQuality(probables, competition),
    confidenceScore: score,
    status: classifyEventStatus(event, weatherRisk, availability, score),
    sourceUrl,
  };
}

/**
 * Run the multi-factor scoring pipeline for a single event and blend toward
 * the market consensus by (1 - confidence). Day-1 callers will pass
 * `history = null`, in which case all factors return null, confidence = 0,
 * and the blended probability equals the market consensus exactly.
 *
 * Exported so the wiring can be unit-tested without standing up the ESPN
 * fetcher or odds cache.
 *
 * @param {Object} args
 * @param {Object} args.event - normalized ESPN event (shape from buildPredictionEvent)
 * @param {Object|null} args.history - per-team/player history payload (null on Day 1)
 * @param {{homeNoVigProbability:number, awayNoVigProbability:number}} args.market
 * @param {string|null} args.factorKey - factor-framework league key, or null if unsupported
 * @returns {{modelHome:number, modelAway:number, scoringDetail:object|null}}
 */
export function computeMultiFactorPrediction({ event, history, market, factorKey }) {
  if (!factorKey) {
    return {
      modelHome: market.homeNoVigProbability,
      modelAway: market.awayNoVigProbability,
      scoringDetail: null,
    };
  }
  const factorsForSport = registry.bySport(factorKey);
  if (!factorsForSport || factorsForSport.length === 0) {
    return {
      modelHome: market.homeNoVigProbability,
      modelAway: market.awayNoVigProbability,
      scoringDetail: null,
    };
  }

  const extractions = extractAllForSport(registry, factorKey, event, history);
  const config = defaultConfigFor(factorsForSport);
  const scored = scoreFactorEvent(extractions, factorsForSport, config);

  // confidence ∈ [0, 1]. blendWithMarketConsensus(model, market, w):
  //   w = 0 → returns model; w = 1 → returns market.
  // We want: low confidence → trust market, so w = 1 - confidence.
  const blendWeight = 1 - scored.confidence;
  const modelHome = blendWithMarketConsensus(
    scored.modelProbability,
    market.homeNoVigProbability,
    blendWeight,
  );
  const modelAway = 1 - modelHome;
  return { modelHome, modelAway, scoringDetail: scored };
}

function buildPredictionRow({ eventDate, sport, event, oddsRecord, minEdge, oddsPath }) {
  const marketRows = Array.isArray(oddsRecord[sport.marketKey]) ? oddsRecord[sport.marketKey] : [];
  const market = summarizeHomeAwayMarket(marketRows);
  if (!market) return null;

  // Multi-factor model block. On Day 1 there is no `history` payload yet,
  // so most factors return null, scored.confidence is 0, and the blend
  // collapses to the market consensus — preserving today's behavior.
  const factorKey = mapEspnSportToFactorKey(sport.key, sport.league);
  const { modelHome, modelAway, scoringDetail } = computeMultiFactorPrediction({
    event,
    history: null,
    market,
    factorKey,
  });

  // Side selection:
  //   - With framework support, pick the side with the largest model-vs-no-vig edge.
  //   - Without framework support, preserve legacy best-book-shopping behavior so
  //     unsupported sports do not see a behavior change today.
  let side;
  if (scoringDetail) {
    const homeEdgeModel = modelHome - market.homeNoVigProbability;
    const awayEdgeModel = modelAway - market.awayNoVigProbability;
    side = homeEdgeModel >= awayEdgeModel ? 'home' : 'away';
  } else {
    const homeEdgeBook = market.homeNoVigProbability - (1 / market.bestHomeDecimal);
    const awayEdgeBook = market.awayNoVigProbability - (1 / market.bestAwayDecimal);
    side = homeEdgeBook >= awayEdgeBook ? 'home' : 'away';
  }

  const selection = side === 'home' ? event.home.displayName : event.away.displayName;
  const oddsDecimal = side === 'home' ? market.bestHomeDecimal : market.bestAwayDecimal;
  const oddsAmerican = side === 'home' ? market.bestHomeAmerican : market.bestAwayAmerican;
  const modelProbability = side === 'home' ? modelHome : modelAway;
  const impliedProbability = 1 / oddsDecimal;
  const edge = modelProbability - impliedProbability;
  const predictionId = [
    eventDate,
    sport.league,
    event.id || stableEventSlug(event.event),
    sport.market,
    side,
  ].map(sanitizeId).join('__');

  const topContributions = scoringDetail
    ? scoringDetail.contributions
        .filter(c => c.used)
        .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
        .slice(0, 5)
        .map(c => ({ id: c.id, contribution: round(c.contribution, 4) }))
    : [];

  const variableSnapshot = {
    model_version: MODEL_VERSION,
    min_edge: minEdge,
    start_et: event.startEt,
    home_team: event.home.displayName,
    away_team: event.away.displayName,
    selected_side: side,
    market_period: sport.period || 'default',
    scoring_window: sport.scoringWindow,
    bullpen_excluded: sport.scoringWindow === 'first_5_innings',
    selected_bookmaker: side === 'home' ? market.bestHomeBookmaker : market.bestAwayBookmaker,
    book_count: market.bookCount,
    bookmaker_list: market.bookmakers,
    home_best_american: market.bestHomeAmerican,
    away_best_american: market.bestAwayAmerican,
    home_avg_decimal: round(market.avgHomeDecimal, 4),
    away_avg_decimal: round(market.avgAwayDecimal, 4),
    home_best_decimal: round(market.bestHomeDecimal, 4),
    away_best_decimal: round(market.bestAwayDecimal, 4),
    home_best_vs_avg_decimal: round(market.bestHomeDecimal - market.avgHomeDecimal, 4),
    away_best_vs_avg_decimal: round(market.bestAwayDecimal - market.avgAwayDecimal, 4),
    selected_best_vs_avg_decimal: round((side === 'home' ? market.bestHomeDecimal - market.avgHomeDecimal : market.bestAwayDecimal - market.avgAwayDecimal), 4),
    home_implied_probability_avg: round(market.avgHomeImplied, 4),
    away_implied_probability_avg: round(market.avgAwayImplied, 4),
    home_implied_probability_stdev: round(market.homeImpliedStdev, 4),
    away_implied_probability_stdev: round(market.awayImpliedStdev, 4),
    home_implied_probability_range: round(market.homeImpliedRange, 4),
    away_implied_probability_range: round(market.awayImpliedRange, 4),
    selected_implied_probability_stdev: round(side === 'home' ? market.homeImpliedStdev : market.awayImpliedStdev, 4),
    selected_implied_probability_range: round(side === 'home' ? market.homeImpliedRange : market.awayImpliedRange, 4),
    market_implied_total_avg: round(market.avgImpliedTotal, 4),
    home_no_vig_probability: round(market.homeNoVigProbability, 4),
    away_no_vig_probability: round(market.awayNoVigProbability, 4),
    devig_method: market.devigMethod,
    book_overround: round(market.bookOverround, 4),
    confidence_score: event.confidenceScore,
    slate_status: event.status,
    event_state: event.eventState,
    event_status_detail: event.eventStatusDetail,
    home_record_summary: event.home.records,
    away_record_summary: event.away.records,
    venue: event.venue,
    environment: event.environment,
    weather_risk: event.weatherRisk,
    availability_quality: event.availabilityQuality,
    availability: event.availability,
    probables: event.probables.map(p => `${p.team} ${p.player}`),
    odds_match_date: oddsRecord.match_date || '',
    odds_scraped_date: oddsRecord.scraped_date || '',
    odds_cache: relative(getVaultRoot(), oddsPath),
    espn_source: event.sourceUrl,
    factor_key: factorKey,
    factor_count_total: scoringDetail?.coverage.total ?? 0,
    factor_count_used: scoringDetail?.coverage.used ?? 0,
    factor_coverage_ratio: scoringDetail
      ? round(scoringDetail.coverage.used / Math.max(1, scoringDetail.coverage.total), 4)
      : 0,
    model_confidence: scoringDetail ? round(scoringDetail.confidence, 4) : 0,
    model_probability_raw: scoringDetail ? round(scoringDetail.modelProbability, 4) : null,
    model_probability_blended: round(modelHome, 4),
    market_blend_weight: scoringDetail ? round(1 - scoringDetail.confidence, 4) : 1,
    factor_contributions_top5: topContributions,
  };

  return {
    prediction_id: predictionId,
    event_id: event.id,
    date: eventDate,
    sport: sport.sport,
    league: sport.displayLeague,
    event: event.event,
    market: sport.market,
    selection,
    side,
    odds_american: oddsAmerican,
    odds_decimal: round(oddsDecimal, 4),
    implied_probability: round(impliedProbability, 4),
    model_probability: round(modelProbability, 4),
    edge: round(edge, 4),
    confidence_score: event.confidenceScore,
    status: edge >= minEdge ? 'pending' : 'pass',
    model_version: MODEL_VERSION,
    stake: 1,
    variable_snapshot: JSON.stringify(variableSnapshot),
    result: 'pending',
    closing_odds_decimal: '',
    actual_home_score: '',
    actual_away_score: '',
    notes: sport.scoringWindow === 'first_5_innings'
      ? `Multi-factor first-five prediction (factor_key=${factorKey ?? 'unsupported'}); bullpen exposure excluded by market period`
      : `Multi-factor prediction (factor_key=${factorKey ?? 'unsupported'}); blended toward market by (1 - confidence)`,
  };
}

function summarizeHomeAwayMarket(rows) {
  const prices = rows
    .map(row => ({
      homeAmerican: parseAmericanOdds(row['1']),
      awayAmerican: parseAmericanOdds(row['2']),
      bookmaker: row.bookmaker_name || row.bookmaker || '',
    }))
    .filter(row => row.homeAmerican !== null && row.awayAmerican !== null)
    .map(row => ({
      ...row,
      homeDecimal: americanToDecimal(row.homeAmerican),
      awayDecimal: americanToDecimal(row.awayAmerican),
    }));

  if (prices.length === 0) return null;

  const bestHome = prices.reduce((best, row) => row.homeDecimal > best.homeDecimal ? row : best, prices[0]);
  const bestAway = prices.reduce((best, row) => row.awayDecimal > best.awayDecimal ? row : best, prices[0]);
  const avgHomeImplied = average(prices, row => 1 / row.homeDecimal);
  const avgAwayImplied = average(prices, row => 1 / row.awayDecimal);
  const avgHomeDecimal = 1 / avgHomeImplied;
  const avgAwayDecimal = 1 / avgAwayImplied;
  const homeImpliedValues = prices.map(row => 1 / row.homeDecimal);
  const awayImpliedValues = prices.map(row => 1 / row.awayDecimal);
  const [homeNoVigProbability, awayNoVigProbability] = devig(
    [avgHomeDecimal, avgAwayDecimal],
    DEVIG_METHOD,
  );
  const overround = bookmakerOverround([avgHomeDecimal, avgAwayDecimal]);

  return {
    bookCount: prices.length,
    bestHomeAmerican: formatAmerican(bestHome.homeAmerican),
    bestAwayAmerican: formatAmerican(bestAway.awayAmerican),
    bestHomeDecimal: bestHome.homeDecimal,
    bestAwayDecimal: bestAway.awayDecimal,
    bestHomeBookmaker: bestHome.bookmaker,
    bestAwayBookmaker: bestAway.bookmaker,
    bookmakers: [...new Set(prices.map(row => row.bookmaker).filter(Boolean))],
    avgHomeDecimal,
    avgAwayDecimal,
    avgHomeImplied,
    avgAwayImplied,
    avgImpliedTotal: avgHomeImplied + avgAwayImplied,
    homeImpliedStdev: standardDeviation(homeImpliedValues),
    awayImpliedStdev: standardDeviation(awayImpliedValues),
    homeImpliedRange: range(homeImpliedValues),
    awayImpliedRange: range(awayImpliedValues),
    homeNoVigProbability,
    awayNoVigProbability,
    devigMethod: DEVIG_METHOD,
    bookOverround: overround,
  };
}

function buildPredictionNote({ eventDate, minEdge, sourceResults, predictions, passes, unmatchedOdds, sourceErrors, ledgerPath, includePass }) {
  const signalStatus = sourceErrors.length > 0 ? 'watch' : 'clear';
  const predictionRows = predictions.map(row => [
    row.event,
    row.sport,
    row.market,
    row.selection,
    row.side,
    row.odds_american,
    formatPercent(row.model_probability * 100),
    formatPercent(row.edge * 100),
    row.confidence_score,
    summarizeSnapshot(row.variable_snapshot),
  ]);
  const passRows = passes.slice(0, 25).map(row => [
    row.event,
    row.sport,
    row.market,
    row.selection,
    row.odds_american,
    formatPercent(row.edge * 100),
    row.confidence_score,
    passReason(row, minEdge),
  ]);
  const unmatchedRows = unmatchedOdds.slice(0, 30).map(row => [
    row.sport,
    row.event,
    row.home,
    row.away,
    row.reason,
  ]);
  const coverageRows = sourceResults.map(result => [
    result.sport.sport,
    result.sport.league,
    result.events.length,
    result.oddsRecords.length,
    result.predictions.length,
    result.passes.length,
    result.unmatchedOdds.length,
    result.error || 'OK',
    relative(getVaultRoot(), result.oddsPath),
  ]);

  return buildNote({
    frontmatter: {
      title: `Sports Prediction Ledger - ${eventDate}`,
      source: 'ESPN scoreboard + OddsHarvester local cache',
      date_pulled: today(),
      event_date: eventDate,
      domain: 'sports',
      data_type: 'sports_predictions',
      frequency: 'on-demand',
      signal_status: signalStatus,
      signals: sourceErrors.map(result => `sports_predictions_source_error:${result.sport.sport}`),
      prediction_count: predictions.length,
      pass_count: passes.length,
      unmatched_odds_count: unmatchedOdds.length,
      tags: ['sports', 'predictions', 'backtesting-input', 'market-consensus'],
    },
    sections: [
      {
        heading: 'Executive Summary',
        content: [
          `Event date: ${eventDate}`,
          `Model: ${MODEL_VERSION}`,
          `Minimum edge: ${formatPercent(minEdge * 100)}`,
          `Prediction candidates: ${predictions.length}`,
          `Pass candidates: ${passes.length}`,
          `Unmatched odds records: ${unmatchedOdds.length}`,
          `Ledger: ${ledgerPath ? relative(getVaultRoot(), ledgerPath) : 'No ledger written; no candidates met the filter'}`,
          `Pass rows included in CSV: ${includePass ? 'yes' : 'no'}`,
          '',
          'This note records research predictions for later settlement and calibration. It is not a recommendation engine; it preserves the variables available at prediction time so the process can be backtested without hindsight edits.',
        ].join('\n'),
      },
      {
        heading: 'Prediction Candidates',
        content: predictionRows.length
          ? buildTable(['Event', 'Sport', 'Market', 'Selection', 'Side', 'Odds', 'Model P', 'Edge', 'Score', 'Snapshot'], predictionRows)
          : 'No prediction candidates met the minimum edge filter.',
      },
      {
        heading: 'Pass Candidates',
        content: passRows.length
          ? buildTable(['Event', 'Sport', 'Market', 'Selection', 'Odds', 'Edge', 'Score', 'Reason'], passRows)
          : 'No pass candidates were generated.',
      },
      {
        heading: 'Unmatched Odds',
        content: unmatchedRows.length
          ? buildTable(['Sport', 'Odds Event', 'Home', 'Away', 'Reason'], unmatchedRows)
          : sourceErrors.length > 0
            ? 'No unmatched odds rows were available because one or more source/cache inputs failed.'
            : 'All odds records matched ESPN events for the requested date.',
      },
      {
        heading: 'Source Coverage',
        content: buildTable(['Sport', 'League', 'ESPN Events', 'Odds Records', 'Predictions', 'Passes', 'Unmatched', 'Status', 'Odds File'], coverageRows),
      },
      {
        heading: 'Ledger Contract',
        content: [
          'The CSV is compatible with `sports-backtest` because it includes `date`, `event`, `market`, `selection`, `model_probability`, `result`, `stake`, and `odds_decimal`.',
          'Prediction rows start with `result: pending`. A later settlement step should fill `result`, final scores, and closing odds.',
          '`variable_snapshot` is JSON captured before the event: probables, venue, weather risk, slate score, selected side, book count, and source file pointers.',
        ].join('\n'),
      },
    ],
  });
}

function extractProbables(competitors) {
  const rows = [];
  for (const competitor of competitors) {
    const team = competitor.team?.abbreviation || competitor.team?.displayName || competitor.homeAway || '';
    for (const probable of competitor.probables ?? []) {
      rows.push({
        team,
        side: competitor.homeAway || '',
        role: probable.displayName || probable.shortDisplayName || probable.name || 'Probable',
        player: probable.athlete?.displayName || probable.athlete?.fullName || probable.displayName || 'Unknown',
      });
    }
  }
  return rows;
}

function normalizeCompetitor(competitor) {
  return {
    homeAway: competitor?.homeAway || '',
    displayName: competitor?.team?.displayName || competitor?.athlete?.displayName || competitor?.displayName || 'Unknown',
    abbreviation: competitor?.team?.abbreviation || competitor?.athlete?.shortName || '',
    records: Array.isArray(competitor?.records)
      ? competitor.records.map(record => `${record.name || 'record'} ${record.summary || ''}`.trim()).filter(Boolean)
      : [],
    aliases: [
      competitor?.team?.displayName,
      competitor?.team?.name,
      competitor?.team?.shortDisplayName,
      competitor?.team?.abbreviation,
      competitor?.displayName,
    ].filter(Boolean),
  };
}

function formatVenue(venue) {
  if (!venue) return 'Venue not in feed';
  const city = venue.address?.city;
  const state = venue.address?.state || venue.address?.country;
  const location = [city, state].filter(Boolean).join(', ');
  return [venue.fullName, location].filter(Boolean).join(' - ') || 'Venue not in feed';
}

function formatEnvironment(venue, weather) {
  if (venue?.indoor === true) return 'Indoor/controlled';
  if (weather?.displayValue) return `Open air - ${weather.displayValue}`;
  if (weather?.condition) return `Open air - ${weather.condition}`;
  if (venue?.indoor === false) return 'Open air - weather not in ESPN feed';
  return 'Venue type not in feed';
}

function classifyWeatherRisk(venue, weather) {
  if (venue?.indoor === true) return 'Low';
  const text = [weather?.displayValue, weather?.condition, weather?.temperature].filter(Boolean).join(' ').toLowerCase();
  if (!text && venue?.indoor === false) return 'Unknown';
  if (/(rain|storm|snow|wind|delay|postpon)/i.test(text)) return 'Watch';
  return text ? 'Low' : 'Unknown';
}

function formatAvailability(sport, probables, competition) {
  if (probables.length > 0) {
    const label = sport.starterLabel || 'probable starter';
    return `Projected ${label}s: ${probables.map(p => `${p.team} ${p.player}`).join(' vs ')}`;
  }
  const injuryCount = countInjuries(competition);
  if (injuryCount > 0) return `${injuryCount} injury records in feed; starting roles still require confirmation`;
  return 'Availability and starting roles not included in ESPN scoreboard feed';
}

function countInjuries(competition) {
  const competitionInjuries = Array.isArray(competition.injuries) ? competition.injuries.length : 0;
  const competitorInjuries = (competition.competitors ?? []).reduce((sum, competitor) => {
    return sum + (Array.isArray(competitor.injuries) ? competitor.injuries.length : 0);
  }, 0);
  return competitionInjuries + competitorInjuries;
}

function classifyAvailabilityQuality(probables, competition) {
  if (probables.length >= 2) return 'projected_roles';
  if (probables.length === 1) return 'partial_projected_roles';
  if (countInjuries(competition) > 0) return 'injury_records_only';
  return 'missing_roles';
}

function scoreEvent({ competition, probables, venue, weatherRisk }) {
  let score = 0;
  if (competition.date) score += 10;
  if (competition.venue?.fullName) score += 8;
  if (venue) score += 5;
  if (venue?.indoor === true) score += 10;
  else if (weatherRisk === 'Low') score += 8;
  else if (weatherRisk === 'Unknown') score += 3;
  if (probables.length >= 2) score += 15;
  else if (probables.length === 1) score += 7;
  else score += 4;
  if ((competition.competitors ?? []).some(c => Array.isArray(c.records) && c.records.length > 0)) score += 5;
  if (competition.status?.type?.state === 'pre' || !competition.status) score += 5;
  return Math.max(0, Math.min(74, score));
}

function classifyEventStatus(event, weatherRisk, availability, score) {
  const state = event.status?.type?.state;
  if (state && state !== 'pre') return state === 'post' ? 'Final/Review Only' : 'Live/Review Only';
  if (weatherRisk === 'Watch') return 'Weather Watch';
  if (availability.startsWith('Availability')) return 'Availability Pending';
  if (score >= 62) return 'Watchlist';
  if (score >= 55) return 'Data Pending';
  return 'Pass';
}

function matchEvent(events, oddsRecord) {
  const oddsHome = normalizeTeamName(oddsRecord.home_team);
  const oddsAway = normalizeTeamName(oddsRecord.away_team);
  let best = null;
  let bestScore = 0;

  for (const event of events) {
    const homeScore = aliasesMatch(event.home.aliases, oddsHome) ? 2 : 0;
    const awayScore = aliasesMatch(event.away.aliases, oddsAway) ? 2 : 0;
    const score = homeScore + awayScore;
    if (score > bestScore) {
      bestScore = score;
      best = event;
    }
  }

  return bestScore >= 4 ? best : null;
}

function aliasesMatch(aliases, normalizedTarget) {
  return aliases.some(alias => {
    const normalized = normalizeTeamName(alias);
    return normalized === normalizedTarget || normalized.includes(normalizedTarget) || normalizedTarget.includes(normalized);
  });
}

function buildUnmatchedOddsRow(sport, oddsRecord, reason) {
  return {
    sport: sport.sport,
    event: `${oddsRecord.away_team || 'Away'} @ ${oddsRecord.home_team || 'Home'}`,
    home: oddsRecord.home_team || '',
    away: oddsRecord.away_team || '',
    reason,
  };
}

function oddsRecordKey(record) {
  return [
    normalizeTeamName(record.home_team),
    normalizeTeamName(record.away_team),
    String(record.match_date || ''),
  ].join('\u0001');
}

function compareOddsRecordQuality(a, b, sport) {
  return compareNumbersDesc(countMarketRows(a, sport), countMarketRows(b, sport))
    || compareDateDesc(a.scraped_date, b.scraped_date)
    || compareStrings(a.home_team, b.home_team)
    || compareStrings(a.away_team, b.away_team);
}

function compareOddsRecords(a, b) {
  return compareStrings(a.match_date, b.match_date)
    || compareStrings(a.away_team, b.away_team)
    || compareStrings(a.home_team, b.home_team)
    || compareStrings(a.scraped_date, b.scraped_date);
}

function countMarketRows(record, sport) {
  const rows = Array.isArray(record?.[sport.marketKey]) ? record[sport.marketKey] : [];
  return rows.length;
}

function oddsPathFor(eventDate, sport) {
  const oddsMarket = sport.oddsMarket || sport.market;
  const periodSuffix = sport.period ? `_${sport.period}` : '';
  return join(ODDS_CACHE_DIR, eventDate, `upcoming_${eventDate}_${sport.sport}_${sport.league}_${oddsMarket}${periodSuffix}.json`);
}

function espnCachePathFor(eventDate, sport) {
  return join(ESPN_CACHE_DIR, eventDate, `${sport.key}_${sport.league}.json`);
}

function espnUrlFor(eventDate, sport) {
  return `${ESPN_BASE}/${sport.espnPath}/scoreboard?dates=${eventDate.replaceAll('-', '')}&limit=500`;
}

function parseAmericanOdds(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(String(value).replace('+', '').trim());
  if (!Number.isFinite(parsed) || parsed === 0) return null;
  return parsed;
}

function americanToDecimal(american) {
  return american > 0 ? 1 + (american / 100) : 1 + (100 / Math.abs(american));
}

function formatAmerican(value) {
  return value > 0 ? `+${value}` : String(value);
}

function parseOddsMatchDate(value) {
  if (!value) return null;
  const normalized = String(value).trim().replace(' UTC', 'Z').replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateEt(date) {
  if (!date) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ET_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function formatDateTimeEt(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: ET_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

function summarizeSnapshot(raw) {
  try {
    const snapshot = JSON.parse(raw);
    return [
      snapshot.environment,
      snapshot.availability_quality,
      `${snapshot.book_count} books`,
      `weather ${snapshot.weather_risk}`,
    ].filter(Boolean).join('; ');
  } catch {
    return 'Snapshot parse failed';
  }
}

function passReason(row, minEdge) {
  if (row.edge < minEdge) return `below min edge ${formatPercent(minEdge * 100)}`;
  return row.notes || 'not selected';
}

function collectSignals(results) {
  return results.flatMap(result => result.signals ?? []);
}

export function dedupePredictionRows(rows) {
  const byId = new Map();
  for (const row of rows) {
    const current = byId.get(row.prediction_id);
    if (!current || comparePredictionRowQuality(row, current) < 0) {
      byId.set(row.prediction_id, row);
    }
  }
  return [...byId.values()].sort(comparePredictionRows);
}

function comparePredictionRowQuality(a, b) {
  return compareNumbersDesc(a.edge, b.edge)
    || compareNumbersDesc(a.confidence_score, b.confidence_score)
    || compareNumbersDesc(a.odds_decimal, b.odds_decimal)
    || compareStrings(a.selection, b.selection)
    || compareStrings(a.odds_american, b.odds_american);
}

function comparePredictionRows(a, b) {
  return compareNumbersDesc(a.edge, b.edge)
    || compareStrings(a.event, b.event)
    || compareStrings(a.market, b.market)
    || compareStrings(a.side, b.side)
    || compareStrings(a.selection, b.selection)
    || compareStrings(a.prediction_id, b.prediction_id);
}

function dedupeUnmatchedOdds(rows) {
  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    const key = [row.sport, row.event, row.home, row.away, row.reason].join('\u0001');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }
  return deduped.sort((a, b) =>
    compareStrings(a.sport, b.sport)
    || compareStrings(a.event, b.event)
    || compareStrings(a.reason, b.reason)
  );
}

function toCsv(rows) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const row of rows) {
    lines.push(CSV_COLUMNS.map(column => csvCell(row[column] ?? '')).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function csvCell(value) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function average(rows, fn) {
  return rows.reduce((sum, row) => sum + fn(row), 0) / rows.length;
}

function standardDeviation(values) {
  const clean = values.filter(Number.isFinite);
  if (clean.length <= 1) return 0;
  const mean = clean.reduce((sum, value) => sum + value, 0) / clean.length;
  const variance = clean.reduce((sum, value) => sum + (value - mean) ** 2, 0) / clean.length;
  return Math.sqrt(variance);
}

function range(values) {
  const clean = values.filter(Number.isFinite);
  if (clean.length === 0) return 0;
  return Math.max(...clean) - Math.min(...clean);
}

function compareNumbersDesc(a, b) {
  return (Number(b) || 0) - (Number(a) || 0);
}

function compareDateDesc(a, b) {
  const aTime = Date.parse(String(a || ''));
  const bTime = Date.parse(String(b || ''));
  return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
}

function compareStrings(a, b) {
  return String(a || '').localeCompare(String(b || ''));
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

function normalizeTeamName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function stableEventSlug(value) {
  return String(value || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function sanitizeId(value) {
  return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function resolveSports(flags) {
  const raw = flags.sports || flags.sport;
  const keys = raw
    ? String(raw).split(',').map(item => item.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_SPORTS;
  const unknown = keys.filter(key => !SPORTS[key]);
  if (unknown.length > 0) {
    throw new Error(`Unknown sports prediction key(s): ${unknown.join(', ')}. Available: ${Object.keys(SPORTS).join(', ')}`);
  }
  return keys.map(key => SPORTS[key]);
}

function resolveDates(flags) {
  if (flags.date) return [validateDate(String(flags.date))];
  const from = flags.from ? validateDate(String(flags.from)) : today();
  if (flags.to) return dateRange(from, validateDate(String(flags.to)));

  const days = flags.days ? parseInt(String(flags.days), 10) : 1;
  if (!Number.isInteger(days) || days < 1 || days > 14) {
    throw new Error('--days must be an integer from 1 to 14');
  }

  const dates = [];
  let cursor = parseDate(from);
  for (let i = 0; i < days; i++) {
    dates.push(formatDate(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid date "${value}". Use YYYY-MM-DD.`);
  }
  const parsed = parseDate(value);
  if (formatDate(parsed) !== value) {
    throw new Error(`Invalid date "${value}". Use a real calendar date.`);
  }
  return value;
}

function dateRange(from, to) {
  const start = parseDate(from);
  const end = parseDate(to);
  if (end < start) throw new Error('--to must be on or after --from');

  const dates = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor = addDays(cursor, 1);
    if (dates.length > 14) throw new Error('Date ranges are capped at 14 days');
  }
  return dates;
}

function parseDate(value) {
  return new Date(`${value}T00:00:00Z`);
}

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseProbabilityEdge(value, fallback) {
  if (value === undefined || value === null || value === true) return fallback;
  const parsed = Number(String(value));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error('--min-edge must be a decimal probability from 0 to 1, e.g. 0.01 for 1%');
  }
  return parsed;
}
