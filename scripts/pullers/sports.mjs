/**
 * sports.mjs - daily sports slate puller
 *
 * Usage:
 *   node run.mjs pull sports --date 2026-04-27
 *   node run.mjs pull sports --from 2026-04-27 --to 2026-04-28
 *   node run.mjs pull sports --days 2 --leagues mlb,nba,nhl
 */

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const ET_TIMEZONE = 'America/New_York';

const DEFAULT_LEAGUES = Object.freeze([
  Object.freeze({ key: 'mlb', sport: 'Baseball', league: 'MLB', path: 'baseball/mlb', starterLabel: 'probable starter' }),
  Object.freeze({ key: 'nba', sport: 'Basketball', league: 'NBA', path: 'basketball/nba' }),
  Object.freeze({ key: 'wnba', sport: 'Basketball', league: 'WNBA', path: 'basketball/wnba' }),
  Object.freeze({ key: 'nhl', sport: 'Hockey', league: 'NHL', path: 'hockey/nhl', starterLabel: 'probable goalie' }),
  Object.freeze({ key: 'nfl', sport: 'Football', league: 'NFL', path: 'football/nfl' }),
  Object.freeze({ key: 'ncaaf', sport: 'Football', league: 'NCAAF', path: 'football/college-football' }),
  Object.freeze({ key: 'ncaamb', sport: 'Basketball', league: 'NCAAM', path: 'basketball/mens-college-basketball' }),
  Object.freeze({ key: 'epl', sport: 'Soccer', league: 'EPL', path: 'soccer/eng.1' }),
  Object.freeze({ key: 'mls', sport: 'Soccer', league: 'MLS', path: 'soccer/usa.1' }),
  Object.freeze({ key: 'ucl', sport: 'Soccer', league: 'UEFA Champions League', path: 'soccer/uefa.champions' }),
  Object.freeze({ key: 'uel', sport: 'Soccer', league: 'UEFA Europa League', path: 'soccer/uefa.europa' }),
  Object.freeze({ key: 'laliga', sport: 'Soccer', league: 'LaLiga', path: 'soccer/esp.1' }),
  Object.freeze({ key: 'seriea', sport: 'Soccer', league: 'Serie A', path: 'soccer/ita.1' }),
  Object.freeze({ key: 'bundesliga', sport: 'Soccer', league: 'Bundesliga', path: 'soccer/ger.1' }),
  Object.freeze({ key: 'ligue1', sport: 'Soccer', league: 'Ligue 1', path: 'soccer/fra.1' }),
]);

const LEAGUES_BY_KEY = Object.freeze(Object.fromEntries(DEFAULT_LEAGUES.map(league => [league.key, league])));

export async function pull(flags = {}) {
  const dates = resolveDates(flags);
  const leagues = resolveLeagues(flags);

  const results = [];
  for (const date of dates) {
    results.push(await pullSportsDate(date, leagues, flags));
  }

  if (flags.json) {
    console.log(JSON.stringify(results, null, 2));
  }

  return results.length === 1
    ? results[0]
    : { filePaths: results.map(result => result.filePath).filter(Boolean), results, signals: [] };
}

async function pullSportsDate(eventDate, leagues, flags) {
  console.log(`Sports: fetching slate for ${eventDate} (${leagues.map(l => l.key).join(', ')})`);

  const sourceResults = await Promise.all(leagues.map(league => fetchLeagueDate(league, eventDate)));
  const sourceErrors = sourceResults.filter(result => result.error);
  const events = sourceResults.flatMap(result => result.events.map(event => normalizeEvent(event, result.league, result.url)));

  events.sort((a, b) => a.startIso.localeCompare(b.startIso) || a.league.localeCompare(b.league));

  console.log(`  ${events.length} events retrieved`);
  for (const result of sourceResults) {
    const note = result.error ? `error: ${result.error}` : `${result.events.length} events`;
    console.log(`  ${result.league.key.padEnd(10)} ${note}`);
  }

  const note = buildDailyReport(eventDate, leagues, sourceResults, events, sourceErrors);
  const filePath = join(getPullsDir(), 'Sports', dateStampedFilename(`Sports_Daily_Slate_${eventDate}`));

  if (flags['dry-run']) {
    console.log(`  [dry-run] Would write: ${filePath}`);
  } else {
    writeNote(filePath, note);
    console.log(`  Wrote: ${filePath}`);
  }

  return {
    filePath: flags['dry-run'] ? null : filePath,
    eventDate,
    eventCount: events.length,
    leaguesChecked: leagues.map(league => league.key),
    sourceErrors: sourceErrors.map(result => ({ league: result.league.key, error: result.error })),
    signals: [],
  };
}

async function fetchLeagueDate(league, eventDate) {
  const espnDate = eventDate.replaceAll('-', '');
  const url = `${ESPN_BASE}/${league.path}/scoreboard?dates=${espnDate}&limit=500`;

  try {
    const data = await getJson(url);
    return {
      league,
      url,
      events: Array.isArray(data.events) ? data.events : [],
      error: null,
    };
  } catch (err) {
    return {
      league,
      url,
      events: [],
      error: err.message,
    };
  }
}

function normalizeEvent(event, league, sourceUrl) {
  const competition = event.competitions?.[0] ?? {};
  const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
  const home = competitors.find(c => c.homeAway === 'home') ?? competitors[0] ?? null;
  const away = competitors.find(c => c.homeAway === 'away') ?? competitors.find(c => c !== home) ?? null;
  const probables = extractProbables(competitors);
  const odds = competition.odds?.[0] ?? null;
  const market = formatMarket(odds);
  const venue = formatVenue(competition.venue);
  const environment = formatEnvironment(competition.venue, competition.weather);
  const weatherRisk = classifyWeatherRisk(competition.venue, competition.weather);
  const availability = formatAvailability(league, probables, competition);
  const keyMatchup = formatKeyMatchup(probables, market);
  const score = scoreEvent({ competition, probables, odds, venue: competition.venue, weatherRisk, league });
  const status = classifyStatus({ availability, weatherRisk, score, event });
  const researchLean = buildResearchLean(market, probables);

  return {
    id: event.id ?? competition.id ?? '',
    sport: league.sport,
    league: league.league,
    leagueKey: league.key,
    event: event.shortName || event.name || 'Untitled event',
    eventName: event.name || event.shortName || 'Untitled event',
    startIso: event.date || competition.date || '',
    startEt: formatDateTimeEt(event.date || competition.date),
    venue,
    environment,
    weatherRisk,
    availability,
    keyMatchup,
    market,
    researchLean,
    confidenceScore: score,
    status,
    notes: buildEventNotes(event, competition, probables, market),
    sourceUrl,
    eventUrl: findEventUrl(event),
    home: normalizeCompetitor(home),
    away: normalizeCompetitor(away),
    probables,
  };
}

function normalizeCompetitor(competitor) {
  if (!competitor) return null;
  return {
    homeAway: competitor.homeAway || '',
    displayName: competitor.team?.displayName || competitor.athlete?.displayName || competitor.displayName || 'Unknown',
    abbreviation: competitor.team?.abbreviation || competitor.athlete?.shortName || '',
    records: Array.isArray(competitor.records)
      ? competitor.records.map(record => `${record.name || 'record'} ${record.summary || ''}`.trim()).filter(Boolean)
      : [],
    stats: summarizeStats(competitor.statistics),
    injuries: summarizeInjuries(competitor.injuries),
  };
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
        status: 'Projected',
      });
    }
  }
  return rows;
}

function formatMarket(odds) {
  if (!odds) {
    return {
      provider: 'Not in feed',
      details: '',
      total: '',
      spread: '',
      moneyline: '',
      movement: 'Not in feed',
    };
  }

  const provider = odds.provider?.displayName || odds.provider?.name || 'Odds provider';
  const total = odds.overUnder === undefined || odds.overUnder === null ? '' : String(odds.overUnder);
  const spread = odds.spread === undefined || odds.spread === null ? '' : String(odds.spread);
  const homeMl = odds.moneyline?.home?.close?.odds;
  const awayMl = odds.moneyline?.away?.close?.odds;
  const moneyline = homeMl || awayMl ? `home ${homeMl || 'N/A'}, away ${awayMl || 'N/A'}` : '';
  const movementParts = [
    formatLineMovement('home ML', odds.moneyline?.home?.open?.odds, odds.moneyline?.home?.close?.odds),
    formatLineMovement('away ML', odds.moneyline?.away?.open?.odds, odds.moneyline?.away?.close?.odds),
  ].filter(Boolean);

  return {
    provider,
    details: odds.details || '',
    total,
    spread,
    moneyline,
    movement: movementParts.join('; ') || 'No open/close movement in feed',
  };
}

function buildResearchLean(market, probables) {
  if (market.details) return `Market watch: ${market.details}`;
  if (probables.length >= 2) return `Starter matchup watch: ${probables.map(p => `${p.team} ${p.player}`).join(' vs ')}`;
  if (probables.length === 1) return `Role watch: ${probables[0].team} ${probables[0].player}`;
  return 'No lean from schedule feed';
}

function formatLineMovement(label, open, close) {
  if (!open && !close) return '';
  if (open && close && String(open) !== String(close)) return `${label}: ${open} to ${close}`;
  if (close) return `${label}: ${close}`;
  return `${label}: open ${open}`;
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

function formatAvailability(league, probables, competition) {
  if (probables.length > 0) {
    const label = league.starterLabel || 'probable starter';
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

function formatKeyMatchup(probables, market) {
  if (probables.length >= 2) return probables.map(p => `${p.team}: ${p.player}`).join(' / ');
  if (probables.length === 1) return `${probables[0].team}: ${probables[0].player}`;
  if (market.details) return market.details;
  return 'Key matchup pending';
}

function scoreEvent({ competition, probables, odds, venue, weatherRisk }) {
  let score = 0;

  if (competition.date) score += 10;
  if (competition.venue?.fullName) score += 8;
  if (venue && venue !== 'Venue not in feed') score += 5;
  if (venue?.indoor === true) score += 10;
  else if (weatherRisk === 'Low') score += 8;
  else if (weatherRisk === 'Unknown') score += 3;
  if (odds) score += 10;
  if (probables.length >= 2) score += 15;
  else if (probables.length === 1) score += 7;
  else score += 4;
  if ((competition.competitors ?? []).some(c => Array.isArray(c.statistics) && c.statistics.length > 0)) score += 5;
  if ((competition.competitors ?? []).some(c => Array.isArray(c.records) && c.records.length > 0)) score += 5;
  if (competition.status?.type?.state === 'pre' || !competition.status) score += 5;

  return Math.max(0, Math.min(74, score));
}

function classifyStatus({ availability, weatherRisk, score, event }) {
  const state = event.status?.type?.state;
  if (state && state !== 'pre') return state === 'post' ? 'Final/Review Only' : 'Live/Review Only';
  if (weatherRisk === 'Watch') return 'Weather Watch';
  if (availability.startsWith('Availability')) return 'Availability Pending';
  if (score >= 62) return 'Watchlist';
  if (score >= 55) return 'Data Pending';
  return 'Pass';
}

function buildEventNotes(event, competition, probables, market) {
  const status = event.status?.type?.shortDetail || event.status?.type?.detail || event.status?.type?.description || 'Status not in feed';
  const bits = [`Status: ${status}`];
  if (probables.length > 0) bits.push(`Probables: ${probables.map(p => `${p.team} ${p.player}`).join(', ')}`);
  if (market.provider !== 'Not in feed') bits.push(`Market source: ${market.provider}; movement: ${market.movement}`);
  if (competition.neutralSite) bits.push('Neutral site');
  return bits.join('; ');
}

function summarizeStats(stats) {
  if (!Array.isArray(stats) || stats.length === 0) return 'Not in feed';
  return stats
    .slice(0, 4)
    .map(stat => `${stat.abbreviation || stat.name}: ${stat.displayValue ?? stat.value ?? 'N/A'}`)
    .join(', ');
}

function summarizeInjuries(injuries) {
  if (!Array.isArray(injuries) || injuries.length === 0) return 'Not in feed';
  return injuries
    .slice(0, 3)
    .map(injury => `${injury.athlete?.displayName || injury.displayName || 'Player'} ${injury.status || injury.type || ''}`.trim())
    .join(', ');
}

function buildDailyReport(eventDate, leagues, sourceResults, events, sourceErrors) {
  const pendingPredictions = loadPendingPredictions(eventDate);
  const pendingPredictionRows = pendingPredictions.map(row => [
    row.event,
    row.sport,
    row.market,
    row.selection,
    row.odds_american || row.odds_decimal,
    formatPercent(Number(row.model_probability) * 100),
    formatPercent(Number(row.edge) * 100),
    row.confidence_score,
    summarizePredictionSnapshot(row.variable_snapshot),
  ]);

  const slateRows = events.map(event => [
    event.sport,
    event.league,
    event.event,
    event.startEt,
    event.venue,
    event.availability,
    event.environment,
    event.market.details || 'Not in feed',
    event.researchLean,
    event.confidenceScore,
    event.status,
  ]);

  const rankedEvents = [...events]
    .sort((a, b) => b.confidenceScore - a.confidenceScore || a.startIso.localeCompare(b.startIso))
    .slice(0, 15);

  const rankedRows = rankedEvents.map((event, index) => [
    index + 1,
    event.event,
    event.league,
    event.researchLean,
    `${event.confidenceScore} (${gradeScore(event.confidenceScore)})`,
    event.status,
    event.keyMatchup,
    finalCheckFor(event),
  ]);

  const playerRows = events.flatMap(event => event.probables.map(probable => [
    event.sport,
    probable.player,
    probable.team,
    opposingTeamFor(event, probable.team),
    probable.role,
    probable.status,
    event.environment,
    event.confidenceScore,
    event.status,
    `Confirm before start: ${event.startEt}`,
  ]));

  const teamRows = events.flatMap(event => [
    buildTeamRow(event, event.away, event.home),
    buildTeamRow(event, event.home, event.away),
  ].filter(Boolean));

  const environmentRows = events
    .filter(event => event.weatherRisk !== 'Low')
    .map(event => [
      event.sport,
      event.event,
      event.weatherRisk,
      event.environment,
      event.weatherRisk === 'Watch' ? 'Final weather check required' : 'Weather missing from source feed',
    ]);

  const passRows = events
    .filter(event => ['Pass', 'Availability Pending', 'Data Pending'].includes(event.status))
    .map(event => [
      event.sport,
      event.event,
      passReason(event),
    ]);

  const sourceRows = sourceResults.map(result => [
    result.league.key,
    result.league.league,
    result.events.length,
    result.error || 'OK',
    result.url,
  ]);

  const topBoard = rankedEvents.length
    ? rankedEvents.slice(0, 5).map((event, index) => `${index + 1}. ${event.event} - ${event.researchLean} (${event.confidenceScore}, ${event.status})`).join('\n')
    : 'No events returned by the configured schedule feeds.';

  const missingData = [
    'Confirmed lineups, injuries, minutes, tactical notes, and player props are not fully covered by the ESPN scoreboard feed.',
    'Outdoor games with no weather object are marked as weather unknown and require a final weather pass.',
    'Market lines are recorded when ESPN exposes an odds object; this report does not independently validate price value.',
  ];

  return buildNote({
    frontmatter: {
      title: `Daily Sports Matchup Report - ${eventDate}`,
      source: 'ESPN public scoreboard API',
      date_pulled: today(),
      event_date: eventDate,
      domain: 'sports',
      data_type: 'daily_slate',
      frequency: 'daily',
      signal_status: sourceErrors.length > 0 ? 'watch' : 'clear',
      signals: sourceErrors.map(result => `source_error:${result.league.key}`),
      event_count: events.length,
      pending_prediction_count: pendingPredictions.length,
      leagues_checked: leagues.map(league => league.key),
      tags: ['sports', 'daily-slate', 'matchup-research'],
    },
    sections: [
      {
        heading: 'Executive Summary',
        content: [
          `Pulled at: ${formatDateTimeEt(new Date().toISOString())}`,
          `Pending predictions pushed: ${pendingPredictions.length}`,
          '',
          'Top board:',
          topBoard,
          '',
          `Best team/game edge: ${rankedEvents[0]?.researchLean || 'None'}`,
          '',
          'Best player-prop edge: Not scored by this source pass; player roles require sport-specific confirmation.',
          '',
          `Best weather/environment edge: ${bestEnvironmentSummary(events)}`,
          '',
          `Best injury/availability edge: ${bestAvailabilitySummary(events)}`,
          '',
          `Best pass/fade: ${bestPassSummary(events)}`,
        ].join('\n'),
      },
      {
        heading: 'Pending Prediction Push',
        content: pendingPredictionRows.length
          ? buildTable(['Event', 'Sport', 'Market', 'Selection', 'Odds', 'Model P', 'Edge', 'Score', 'Snapshot'], pendingPredictionRows)
          : 'No pending prediction rows found for this event date.',
      },
      {
        heading: 'Slate Table',
        content: slateRows.length
          ? buildTable(['Sport', 'League', 'Event', 'Start ET', 'Venue', 'Availability', 'Environment', 'Market', 'Research Lean', 'Score', 'Status'], slateRows)
          : 'No scheduled events returned for the configured leagues.',
      },
      {
        heading: 'Ranked Research Board',
        content: rankedRows.length
          ? buildTable(['Rank', 'Event', 'League', 'Research Lean', 'Score', 'Status', 'Key Matchup', 'Final Check'], rankedRows)
          : 'No ranked events available.',
      },
      {
        heading: 'Player Watchlist',
        content: playerRows.length
          ? buildTable(['Sport', 'Player', 'Team/Side', 'Opponent', 'Role', 'Starting Status', 'Environment', 'Score', 'Status', 'Notes'], playerRows)
          : 'No probable starters or player roles returned by the source feed.',
      },
      {
        heading: 'Team/Game Watchlist',
        content: teamRows.length
          ? buildTable(['Sport', 'Event', 'Team/Side', 'Opponent', 'Venue', 'Rest/Travel', 'Injury Context', 'Season Context', 'Market Context', 'Score', 'Status'], teamRows)
          : 'No team rows available.',
      },
      {
        heading: 'Weather and Environment Fades',
        content: environmentRows.length
          ? buildTable(['Sport', 'Event', 'Risk', 'Environment', 'Action'], environmentRows)
          : 'No weather or environment fades from the slate feed.',
      },
      {
        heading: 'Pass List',
        content: passRows.length
          ? buildTable(['Sport', 'Event/Player', 'Reason'], passRows)
          : 'No automatic pass items from the slate-only pass.',
      },
      {
        heading: 'Source Log',
        content: [
          buildTable(['Key', 'League', 'Events', 'Status', 'URL'], sourceRows),
          '',
          'Sources checked:',
          '- Official schedule: ESPN public scoreboard endpoints listed above',
          '- Availability: probable starters/goalies only when included in scoreboard response',
          '- Projected/confirmed lineups: not fully available from this source pass',
          '- Sport-specific stats: team statistics when included in scoreboard response',
          '- Venue/environment: venue metadata from scoreboard response',
          '- Weather: only when included in scoreboard response',
          '- Market/pricing: ESPN-exposed odds object when present',
          '- News/beat reports: not included',
          '',
          'Missing data:',
          missingData.map(item => `- ${item}`).join('\n'),
        ].join('\n'),
      },
    ],
  });
}

function loadPendingPredictions(eventDate) {
  const ledgerPath = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'predictions', `${eventDate}_predictions.csv`);
  if (!existsSync(ledgerPath)) return [];
  return parseCsv(readFileSync(ledgerPath, 'utf8'))
    .filter(row => String(row.status || '').toLowerCase() === 'pending' || String(row.result || '').toLowerCase() === 'pending')
    .filter(row => String(row.status || '').toLowerCase() !== 'pass');
}

function summarizePredictionSnapshot(raw) {
  try {
    const snapshot = JSON.parse(raw || '{}');
    return [
      snapshot.selected_bookmaker ? `book ${snapshot.selected_bookmaker}` : '',
      snapshot.book_count ? `${snapshot.book_count} books` : '',
      Number.isFinite(Number(snapshot.selected_best_vs_avg_decimal)) ? `best/avg +${Number(snapshot.selected_best_vs_avg_decimal).toFixed(3)}` : '',
      Number.isFinite(Number(snapshot.selected_implied_probability_stdev)) ? `disp ${Number(snapshot.selected_implied_probability_stdev).toFixed(3)}` : '',
      snapshot.availability_quality || '',
    ].filter(Boolean).join('; ');
  } catch {
    return 'Snapshot parse failed';
  }
}

function buildTeamRow(event, team, opponent) {
  if (!team) return null;
  return [
    event.sport,
    event.event,
    team.displayName,
    opponent?.displayName || 'Unknown',
    event.venue,
    'Not in feed',
    team.injuries,
    team.records.length > 0 ? team.records.join('; ') : team.stats,
    event.market.details || 'Not in feed',
    event.confidenceScore,
    event.status,
  ];
}

function passReason(event) {
  if (event.status === 'Pass') return 'Insufficient edge data in slate feed';
  if (event.status === 'Data Pending') return 'Market, weather, or late-news context still missing';
  return 'Starting roles or injury status not confirmed in source feed';
}

function bestPassSummary(events) {
  const pass = events.find(event => event.status === 'Pass');
  if (pass) return `${pass.event} (${passReason(pass)})`;
  const pending = events.find(event => ['Availability Pending', 'Data Pending'].includes(event.status));
  if (pending) return `${pending.event} (${passReason(pending)})`;
  return 'None flagged from slate-only pass';
}

function opposingTeamFor(event, teamAbbreviation) {
  const teams = [event.away, event.home].filter(Boolean);
  const opponent = teams.find(team => team.abbreviation !== teamAbbreviation && team.displayName !== teamAbbreviation);
  return opponent?.abbreviation || opponent?.displayName || 'Unknown';
}

function finalCheckFor(event) {
  const checks = [];
  if (event.availability.startsWith('Availability')) checks.push('confirm active/starting roles');
  if (event.weatherRisk !== 'Low') checks.push('confirm weather');
  if (event.market.details) checks.push('confirm line has not moved past edge');
  return checks.length ? checks.join('; ') : 'confirm no late scratches';
}

function bestEnvironmentSummary(events) {
  const indoor = events.find(event => event.environment.startsWith('Indoor'));
  if (indoor) return `${indoor.event} (${indoor.environment})`;
  const known = events.find(event => event.weatherRisk === 'Low');
  if (known) return `${known.event} (${known.environment})`;
  return 'No clean environment edge identified';
}

function bestAvailabilitySummary(events) {
  const withProbables = events.find(event => event.probables.length >= 2);
  if (withProbables) return `${withProbables.event} (${withProbables.keyMatchup})`;
  return 'No confirmed availability edge identified';
}

function gradeScore(score) {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 62) return 'B';
  if (score >= 55) return 'C';
  return 'Pass';
}

function findEventUrl(event) {
  const link = event.links?.find(l => l.rel?.includes('summary')) || event.links?.[0];
  return link?.href || '';
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

function formatPercent(value) {
  if (!Number.isFinite(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

function parseCsv(raw) {
  const records = parseCsvRecords(raw);
  if (records.length === 0) return [];
  const headers = records[0].map(header => header.trim());
  return records.slice(1)
    .filter(record => !record.every(cell => cell.trim() === ''))
    .map(record => {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = record[index] ?? '';
      });
      return row;
    });
}

function parseCsvRecords(raw) {
  const records = [];
  let record = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    const next = raw[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      record.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}

function resolveLeagues(flags) {
  if (!flags.leagues) return DEFAULT_LEAGUES;

  const keys = String(flags.leagues)
    .split(',')
    .map(key => key.trim().toLowerCase())
    .filter(Boolean);

  const unknown = keys.filter(key => !LEAGUES_BY_KEY[key]);
  if (unknown.length > 0) {
    throw new Error(`Unknown sports league key(s): ${unknown.join(', ')}. Available: ${Object.keys(LEAGUES_BY_KEY).join(', ')}`);
  }

  return keys.map(key => LEAGUES_BY_KEY[key]);
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
