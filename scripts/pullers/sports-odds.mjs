/**
 * sports-odds.mjs - optional OddsHarvester wrapper for sports odds ingestion
 *
 * Usage:
 *   node run.mjs pull sports-odds --date 2026-04-28 --dry-run
 *   node run.mjs pull sports-odds --from 2026-04-27 --to 2026-04-28 --sports baseball,basketball,ice-hockey
 *   node run.mjs pull sports-odds --sport football --league england-premier-league --market 1x2
 *
 * Requires: pipx install oddsharvester, or provide --executable <path>
 */

import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'odds');
const DEFAULT_UPCOMING_SPORTS = Object.freeze(['baseball', 'baseball-f5', 'basketball', 'ice-hockey']);
const SPORT_DEFAULTS = Object.freeze({
  baseball: Object.freeze({ sport: 'baseball', label: 'baseball', league: 'mlb', market: 'home_away', period: '' }),
  'baseball-f5': Object.freeze({ sport: 'baseball', label: 'baseball-f5', league: 'mlb', market: 'home_away', period: '1st_half' }),
  basketball: Object.freeze({ sport: 'basketball', label: 'basketball', league: 'nba', market: 'home_away', period: '' }),
  'ice-hockey': Object.freeze({ sport: 'ice-hockey', label: 'ice-hockey', league: 'nhl', market: 'home_away', period: '' }),
  'american-football': Object.freeze({ sport: 'american-football', label: 'american-football', league: 'nfl', market: 'home_away', period: '' }),
  football: Object.freeze({ sport: 'football', label: 'football', league: '', market: '1x2', period: '' }),
  tennis: Object.freeze({ sport: 'tennis', label: 'tennis', league: '', market: 'match_winner', period: '' }),
});

export async function pull(flags = {}) {
  const mode = String(flags.mode || (flags.historic ? 'historic' : 'upcoming')).toLowerCase();
  if (!['upcoming', 'historic'].includes(mode)) {
    throw new Error('--mode must be "upcoming" or "historic"');
  }

  const executable = String(flags.executable || process.env.ODDSHARVESTER_BIN || 'oddsharvester');
  const dryRun = Boolean(flags['dry-run']);
  const format = validateFormat(String(flags.format || 'json'));
  const jobs = buildJobs(flags, mode, format);

  if (!dryRun) {
    assertOddsharvesterAvailable(executable);
    mkdirSync(CACHE_DIR, { recursive: true });
  }

  console.log(`Sports odds: ${mode} ${jobs.length} OddsHarvester job(s)`);
  const results = [];
  for (const job of jobs) {
    const command = buildCommand(executable, job, flags, mode, format);
    console.log(`  ${formatCommand(command)}`);

    if (dryRun) {
      results.push({ ...job, command, status: 'dry-run', exitCode: null, outputFile: outputFileFor(job, format), records: null, error: '' });
      continue;
    }

    const result = runCommand(command, flags);
    const outputFile = outputFileFor(job, format);
    const records = existsSync(outputFile) ? countRecords(outputFile, format) : null;
    results.push({
      ...job,
      command,
      status: result.status === 0 ? 'ok' : 'error',
      exitCode: result.status,
      outputFile,
      records,
      error: result.status === 0 ? '' : summarizeProcessError(result),
    });
  }

  if (dryRun) {
    console.log('  [dry-run] No scraper commands executed and no note written.');
    return { filePath: null, results, signals: [] };
  }

  const note = buildOddsNote(mode, results, flags, format);
  const label = mode === 'historic'
    ? `Sports_Odds_Harvest_${mode}_${sanitizeFilename(flags.season || 'current')}`
    : `Sports_Odds_Harvest_${mode}_${results[0]?.eventDate || today()}`;
  const filePath = join(getPullsDir(), 'Sports', dateStampedFilename(label));
  writeNote(filePath, note);
  console.log(`  Wrote: ${filePath}`);

  return {
    filePath,
    results,
    signals: results.filter(result => result.status === 'error').map(result => `sports_odds_error:${result.sport}`),
  };
}

function buildJobs(flags, mode, format) {
  const sports = resolveSports(flags);
  const marketsBySport = resolveMappedOption(flags.market || flags.markets);
  const leaguesBySport = resolveMappedOption(flags.league || flags.leagues);
  const periodsBySport = resolveMappedOption(flags.period || flags.periods);
  const dates = mode === 'upcoming' ? resolveDates(flags) : [null];

  if (mode === 'historic' && !flags.season) {
    throw new Error('Historic odds pulls require --season <YYYY|YYYY-YYYY|current>');
  }

  const jobs = [];
  for (const date of dates) {
    for (const sportKey of sports) {
      const defaults = SPORT_DEFAULTS[sportKey] || { sport: sportKey, label: sportKey, league: '', market: 'home_away', period: '' };
      const sport = defaults.sport;
      const league = leaguesBySport[sportKey] ?? leaguesBySport[sport] ?? leaguesBySport.default ?? defaults.league;
      const market = marketsBySport[sportKey] ?? marketsBySport[sport] ?? marketsBySport.default ?? defaults.market;
      const period = periodsBySport[sportKey] ?? periodsBySport[sport] ?? periodsBySport.default ?? defaults.period ?? '';
      const slugParts = [mode, date || flags.season || 'current', sport, league || 'all', market, period].filter(Boolean).map(sanitizeFilename);
      jobs.push({
        mode,
        eventDate: date,
        sportKey,
        sport,
        label: defaults.label || sportKey,
        league,
        market,
        period,
        season: flags.season ? String(flags.season) : '',
        outputStem: join(CACHE_DIR, date || flags.season || 'historic', slugParts.join('_')),
        outputFormat: format,
      });
    }
  }
  return jobs;
}

function buildCommand(executable, job, flags, mode, format) {
  const args = [executable, mode, '--sport', job.sport, '--market', job.market, '--storage', 'local', '--format', format, '--output', job.outputStem];

  if (mode === 'upcoming') {
    args.push('--date', job.eventDate.replaceAll('-', ''));
  } else {
    args.push('--season', job.season);
    if (flags['max-pages']) args.push('--max-pages', String(flags['max-pages']));
  }

  if (job.league && !flags['no-league']) args.push('--league', job.league);
  if (flags['match-link']) args.push('--match-link', String(flags['match-link']));
  if (truthyFlag(flags.headless, true)) args.push('--headless');
  if (flags['preview-only']) args.push('--preview-only');
  if (flags['odds-history']) args.push('--odds-history');
  if (flags['target-bookmaker']) args.push('--target-bookmaker', String(flags['target-bookmaker']));
  if (flags['bookies-filter']) args.push('--bookies-filter', String(flags['bookies-filter']));
  if (job.period) args.push('--period', String(job.period));

  args.push('--concurrency', String(parsePositiveInt(flags.concurrency, 1, '--concurrency')));
  args.push('--request-delay', String(parsePositiveNumber(flags['request-delay'], 3, '--request-delay')));

  return args;
}

function runCommand(command, flags) {
  const [executable, ...args] = command;
  const timeoutMinutes = parsePositiveNumber(flags['timeout-min'], 15, '--timeout-min');
  return spawnSync(executable, args, {
    cwd: getVaultRoot(),
    encoding: 'utf8',
    timeout: timeoutMinutes * 60 * 1000,
    env: {
      ...process.env,
      OH_STORAGE: 'local',
      OH_HEADLESS: 'true',
      OH_CONCURRENCY: String(parsePositiveInt(flags.concurrency, 1, '--concurrency')),
      OH_REQUEST_DELAY: String(parsePositiveNumber(flags['request-delay'], 3, '--request-delay')),
    },
  });
}

function assertOddsharvesterAvailable(executable) {
  const result = spawnSync(executable, ['--help'], { encoding: 'utf8', timeout: 30_000 });
  if (result.error) {
    throw new Error(`OddsHarvester executable not available: ${result.error.message}. Install with "pipx install oddsharvester" or pass --executable <path>.`);
  }
}

function buildOddsNote(mode, results, flags, format) {
  const errors = results.filter(result => result.status === 'error');
  const rows = results.map(result => [
    result.eventDate || result.season || '',
    result.label || result.sport,
    result.sport,
    result.league || 'all',
    result.market,
    result.period || 'default',
    result.status,
    result.records ?? 'N/A',
    result.outputFile ? relative(getVaultRoot(), result.outputFile) : '',
    result.error || '',
  ]);

  const commandRows = results.map(result => [
    result.label || result.sport,
    result.sport,
    result.league || 'all',
    result.period || 'default',
    formatCommand(result.command),
  ]);

  return buildNote({
    frontmatter: {
      title: `Sports Odds Harvest - ${mode}`,
      source: 'OddsHarvester / OddsPortal',
      date_pulled: today(),
      domain: 'sports',
      data_type: mode === 'historic' ? 'historical_odds' : 'upcoming_odds',
      frequency: 'on-demand',
      signal_status: errors.length > 0 ? 'watch' : 'clear',
      signals: errors.map(result => `sports_odds_error:${result.sport}`),
      tags: ['sports', 'odds', 'oddsharvester', 'backtesting-input'],
    },
    sections: [
      {
        heading: 'Executive Summary',
        content: [
          `Mode: ${mode}`,
          `Jobs completed: ${results.length - errors.length}/${results.length}`,
          `Output format: ${format}`,
          `Local cache: ${relative(getVaultRoot(), CACHE_DIR)}`,
          '',
          'Use this as an odds-history or line-context input for sports-backtest. The daily ESPN slate remains the schedule baseline.',
        ].join('\n'),
      },
      {
        heading: 'Harvest Results',
        content: buildTable(['Date/Season', 'Job', 'Sport', 'League', 'Market', 'Period', 'Status', 'Records', 'Output File', 'Error'], rows),
      },
      {
        heading: 'Safety Controls',
        content: [
          '- Remote/S3 storage is not exposed by this wrapper; all jobs force `--storage local`.',
          '- Default concurrency is 1 and default request delay is 3 seconds.',
          '- Browser mode is headless by default.',
          '- Scraper output stays in `scripts/.cache/sports/odds/`; the vault note stores only a source log and file pointers.',
          '- Check OddsPortal terms and local law before running live scraping at scale.',
        ].join('\n'),
      },
      {
        heading: 'Command Log',
        content: buildTable(['Job', 'Sport', 'League', 'Period', 'Command'], commandRows),
      },
    ],
  });
}

function resolveSports(flags) {
  const raw = flags.sports || flags.sport;
  if (!raw) return DEFAULT_UPCOMING_SPORTS;
  return String(raw).split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
}

function resolveMappedOption(raw) {
  if (!raw) return {};
  const text = String(raw);
  const result = {};
  for (const part of text.split(',').map(item => item.trim()).filter(Boolean)) {
    const [key, value] = part.includes(':') ? part.split(':', 2) : ['default', part];
    result[key.trim().toLowerCase()] = value.trim();
  }
  return result;
}

function resolveDates(flags) {
  if (flags.date) return [validateDate(String(flags.date))];

  const from = flags.from ? validateDate(String(flags.from)) : today();
  if (flags.to) return dateRange(from, validateDate(String(flags.to)));

  const days = parsePositiveInt(flags.days, 1, '--days');
  if (days > 7) throw new Error('--days is capped at 7 for sports-odds');

  const dates = [];
  let cursor = parseDate(from);
  for (let i = 0; i < days; i++) {
    dates.push(formatDate(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Invalid date "${value}". Use YYYY-MM-DD.`);
  const parsed = parseDate(value);
  if (formatDate(parsed) !== value) throw new Error(`Invalid date "${value}". Use a real calendar date.`);
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
    if (dates.length > 7) throw new Error('sports-odds date ranges are capped at 7 days');
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

function outputFileFor(job, format) {
  return `${job.outputStem}.${format}`;
}

function countRecords(filePath, format) {
  const raw = readFileSync(filePath, 'utf8');
  if (format === 'json') {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 1;
  }
  const lines = raw.split(/\r?\n/).filter(Boolean);
  return Math.max(0, lines.length - 1);
}

function summarizeProcessError(result) {
  if (result.error) return result.error.message;
  return [result.stderr, result.stdout].filter(Boolean).join(' ').slice(0, 300);
}

function validateFormat(format) {
  if (!['json', 'csv'].includes(format)) throw new Error('--format must be json or csv');
  return format;
}

function parsePositiveInt(value, fallback, label) {
  if (value === undefined || value === null || value === true) return fallback;
  const parsed = parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${label} must be a positive integer`);
  return parsed;
}

function parsePositiveNumber(value, fallback, label) {
  if (value === undefined || value === null || value === true) return fallback;
  const parsed = Number(String(value));
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${label} must be a positive number`);
  return parsed;
}

function truthyFlag(value, fallback) {
  if (value === undefined || value === null) return fallback;
  return !['false', '0', 'no'].includes(String(value).toLowerCase());
}

function formatCommand(command) {
  return command.map(part => quoteArg(part)).join(' ');
}

function quoteArg(value) {
  const text = String(value);
  return /[\s"'`]/.test(text) ? `"${text.replace(/"/g, '\\"')}"` : text;
}

function sanitizeFilename(value) {
  return String(value || 'all')
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}
