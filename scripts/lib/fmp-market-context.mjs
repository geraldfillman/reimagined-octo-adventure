/**
 * fmp-market-context.mjs - Shared helpers for reading the latest FMP market pull notes.
 */

import { join } from 'path';
import { getVaultRoot } from './config.mjs';
import { readFolder } from './frontmatter.mjs';
import { parseFirstMarkdownTable } from './markdown-table.mjs';
import { today } from './markdown.mjs';
import { normalizeSymbol } from './thesis-watchlists.mjs';

const MARKET_PULLS_DIR = join(getVaultRoot(), '05_Data_Pulls', 'Market');

export async function loadLatestFmpMarketContext() {
  const marketNotes = await readFolder(MARKET_PULLS_DIR, false);
  const technicalBySymbol = buildLatestTechnicalMap(marketNotes);
  const { earningsBySymbol, latestCalendarPullDate } = buildLatestEarningsMap(marketNotes);
  const watchlistReportsByThesis = buildLatestWatchlistReportMap(marketNotes);

  return {
    marketNotes,
    technicalBySymbol,
    earningsBySymbol,
    latestCalendarPullDate,
    watchlistReportsByThesis,
  };
}

export function normalizeDate(value) {
  const date = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function buildLatestTechnicalMap(notes) {
  const latest = new Map();

  for (const note of notes) {
    if (note?.data?.data_type !== 'technical_snapshot') continue;
    if (note?.data?.interval && note.data.interval !== 'daily') continue;

    const symbol = normalizeSymbol(note?.data?.symbol);
    if (!symbol) continue;

    const candidate = {
      symbol,
      data: note.data,
      path: note.path,
      filename: note.filename,
    };
    const current = latest.get(symbol);
    if (!current || compareDatedEntries(candidate, current) < 0) {
      latest.set(symbol, candidate);
    }
  }

  return latest;
}

function buildLatestEarningsMap(notes) {
  const rowsBySymbol = new Map();
  let latestCalendarPullDate = null;

  const calendarNotes = notes
    .filter(note => note?.data?.data_type === 'calendar')
    .sort(compareDatedEntries);

  for (const note of calendarNotes) {
    const pullDate = String(note?.data?.date_pulled || '');
    if (pullDate && (!latestCalendarPullDate || pullDate > latestCalendarPullDate)) {
      latestCalendarPullDate = pullDate;
    }

    const table = parseFirstMarkdownTable(note.content);
    if (!table) continue;

    for (const row of table.rows) {
      const symbol = normalizeSymbol(row.Symbol);
      const date = normalizeDate(row.Date);
      if (!symbol || !date) continue;

      const candidate = {
        symbol,
        date,
        pullDate,
        notePath: note.path,
        fileName: note.filename,
        epsEstimated: row['EPS Est'] || 'N/A',
        epsActual: row['EPS Act'] || 'N/A',
        revenueEstimated: row['Revenue Est'] || 'N/A',
        revenueActual: row['Revenue Act'] || 'N/A',
        lastUpdated: row['Last Updated'] || 'N/A',
      };

      const current = rowsBySymbol.get(symbol);
      if (!current || compareCalendarRows(candidate, current) < 0) {
        rowsBySymbol.set(symbol, candidate);
      }
    }
  }

  return { earningsBySymbol: rowsBySymbol, latestCalendarPullDate };
}

function buildLatestWatchlistReportMap(notes) {
  const latest = new Map();

  for (const note of notes) {
    if (note?.data?.data_type !== 'watchlist_report') continue;

    const thesis = String(note?.data?.thesis || '').trim();
    if (!thesis) continue;

    const candidate = {
      thesis,
      data: note.data,
      path: note.path,
      filename: note.filename,
    };
    const current = latest.get(thesis);
    if (!current || compareDatedEntries(candidate, current) < 0) {
      latest.set(thesis, candidate);
    }
  }

  return latest;
}

function compareDatedEntries(left, right) {
  const leftDate = String(left?.data?.date_pulled || left?.pullDate || '');
  const rightDate = String(right?.data?.date_pulled || right?.pullDate || '');
  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }
  return String(right?.filename || right?.fileName || '').localeCompare(String(left?.filename || left?.fileName || ''));
}

function compareCalendarRows(left, right) {
  if (left.pullDate !== right.pullDate) {
    return String(right.pullDate || '').localeCompare(String(left.pullDate || ''));
  }

  const currentDate = today();
  const leftFuture = left.date >= currentDate;
  const rightFuture = right.date >= currentDate;

  if (leftFuture !== rightFuture) {
    return leftFuture ? -1 : 1;
  }

  if (left.date !== right.date) {
    return leftFuture
      ? left.date.localeCompare(right.date)
      : right.date.localeCompare(left.date);
  }

  return String(right.fileName || '').localeCompare(String(left.fileName || ''));
}
