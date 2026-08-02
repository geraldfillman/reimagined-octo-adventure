/**
 * edgar-triggers.mjs — price-based thesis-reconsideration triggers.
 *
 * Framework §9.4 (vault extension of the Corporate Health, Integrity &
 * Market-Behavior Framework): every scored health review carries a price
 * band; a breach forces the §17 review loop to re-run. Triggers are
 * investigation prompts, never trade signals.
 *
 * Commands (router group `edgar`):
 *   edgar triggers                 → check current prices vs stored bands,
 *                                    write a check pull note on breaches
 *   edgar triggers --set           → backfill default bands (−20%/+25%) into
 *                                    reviews that lack them
 *     --ticker <T>                 limit either mode to one ticker
 *     --down 20 / --up 25          override default band percentages (--set)
 *     --force                      overwrite existing bands (--set)
 *     --dry-run                    print only, write nothing
 *
 * Prices come from Yahoo daily closes (keyless; no FMP quota). Missing
 * prices are reported as explicit gaps, never estimated.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { readFolder } from '../lib/frontmatter.mjs';
import { buildNote, buildTable, writeNote, dateStampedFilename, today } from '../lib/markdown.mjs';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { fetchYahooDailyPrices } from '../lib/yahoo-client.mjs';
import {
  DEFAULT_DOWNSIDE_PCT,
  DEFAULT_UPSIDE_PCT,
  computeDefaultTriggers,
  classifyTriggerState,
  latestClose,
  upsertPriceTriggerFields,
} from '../lib/price-triggers.mjs';

const REVIEW_FOLDER = join('13_Company_Intel', 'Reviews');
const PULL_FOLDER = 'Edgar';

const STATE_LABELS = Object.freeze({
  'below-low': '🔴 below reconsider-low — §17 re-review due',
  'above-high': '🟠 above reconsider-high — §13 Pattern C check due',
  within: '🟢 within band',
});

async function loadReviews(tickerFilter) {
  const notes = await readFolder(join(getVaultRoot(), REVIEW_FOLDER));
  return notes.filter(n =>
    n.data?.node_type === 'health_review' &&
    (!tickerFilter || String(n.data.ticker).toUpperCase() === tickerFilter));
}

async function fetchCloseCached(cache, ticker) {
  if (cache.has(ticker)) return cache.get(ticker);
  let close = null;
  try {
    close = latestClose(await fetchYahooDailyPrices(ticker, { range: '5d' }));
    if (close != null) close = Math.round(close * 100) / 100;
  } catch (error) {
    console.warn(`⚠️  ${ticker}: Yahoo price unavailable (${error.message}) — explicit gap.`);
  }
  cache.set(ticker, close);
  return close;
}

async function setTriggers(flags) {
  const tickerFilter = flags.ticker ? String(flags.ticker).toUpperCase() : null;
  const downPct = Number(flags.down ?? DEFAULT_DOWNSIDE_PCT);
  const upPct = Number(flags.up ?? DEFAULT_UPSIDE_PCT);
  const dryRun = Boolean(flags['dry-run'] ?? flags.dryRun);
  const reviews = await loadReviews(tickerFilter);
  const priceCache = new Map();
  let updated = 0;
  let skipped = 0;

  for (const note of reviews) {
    const ticker = String(note.data.ticker ?? '').toUpperCase();
    if (!ticker) continue;
    if (note.data.price_at_review != null && !flags.force) {
      skipped++;
      continue;
    }
    const close = await fetchCloseCached(priceCache, ticker);
    if (close == null) continue;
    const band = computeDefaultTriggers(close, { downPct, upPct });
    if (!band) continue;
    const original = await readFile(note.path, 'utf-8');
    const next = upsertPriceTriggerFields(original, { price: close, low: band.low, high: band.high });
    if (!next) {
      console.warn(`⚠️  ${note.filename}: no markers_pull anchor — set the band manually.`);
      continue;
    }
    if (dryRun) {
      console.log(`(dry) ${ticker}: ${close} → [${band.low}, ${band.high}]`);
    } else {
      await writeFile(note.path, next, 'utf-8');
      console.log(`✅ ${ticker}: price ${close} → reconsider band [${band.low}, ${band.high}] (${note.filename})`);
    }
    updated++;
  }
  console.log(`Done — ${updated} review(s) banded (−${downPct}% / +${upPct}%), ${skipped} already set (use --force to overwrite).`);
  return { updated, skipped };
}

async function checkTriggers(flags) {
  const tickerFilter = flags.ticker ? String(flags.ticker).toUpperCase() : null;
  const dryRun = Boolean(flags['dry-run'] ?? flags.dryRun);
  const reviews = (await loadReviews(tickerFilter))
    .filter(n => n.data.price_at_review != null);
  if (reviews.length === 0) {
    console.log('No reviews carry price bands yet — run `edgar triggers --set` first.');
    return { checked: 0, breaches: [] };
  }

  const priceCache = new Map();
  const rows = [];
  const breaches = [];
  const signals = [];

  for (const note of reviews) {
    const ticker = String(note.data.ticker).toUpperCase();
    const close = await fetchCloseCached(priceCache, ticker);
    const low = note.data.reconsider_price_low;
    const high = note.data.reconsider_price_high;
    const state = close == null ? null : classifyTriggerState(close, low, high);
    const label = state ? STATE_LABELS[state] : '⚪ price unavailable';
    rows.push([ticker, String(note.data.price_at_review), String(low ?? '—'), String(high ?? '—'), close == null ? '—' : String(close), label]);
    if (state === 'below-low' || state === 'above-high') {
      breaches.push({ ticker, state, close, low, high, review: note.filename });
      signals.push(`price-trigger:${ticker.toLowerCase()}:${state}`);
    }
  }

  for (const r of rows) console.log(r.join('  '));
  console.log(`\n${breaches.length} breach(es) across ${reviews.length} review(s).`);

  if (!dryRun) {
    const status = breaches.length >= 3 ? 'alert' : breaches.length >= 1 ? 'watch' : 'clear';
    const note = buildNote({
      frontmatter: {
        title: 'EDGAR Price Trigger Check',
        source: 'yahoo-finance',
        date_pulled: today(),
        domain: 'edgar',
        data_type: 'price_triggers',
        frequency: 'on-demand',
        signal_status: status,
        signals,
        tags: ['edgar', 'company-intel', 'health-review'],
      },
      sections: [
        {
          heading: 'How to read this',
          content: [
            'Framework §9.4 ([[04_Reference/Corporate_Health_Integrity_Framework]]): a breached band means the thesis goes back on the desk — re-run the §17 loop and write a fresh dated review. **Triggers are investigation prompts, not trade signals.**',
            '',
            `Board: [[00_Dashboard/Health Review Board]] · ${breaches.length} breach(es) / ${reviews.length} banded review(s).`,
          ].join('\n'),
        },
        {
          heading: 'Bands vs current price',
          content: buildTable(['Ticker', 'Price at review', 'Reconsider low', 'Reconsider high', 'Current', 'State'], rows),
        },
      ],
    });
    const filePath = join(getPullsDir(), PULL_FOLDER, dateStampedFilename('EDGAR_Trigger_Check'));
    writeNote(filePath, note);
    console.log(`✅ Check note → ${filePath}`);
  }
  return { checked: reviews.length, breaches };
}

export async function triggers(flags = {}) {
  return flags.set ? setTriggers(flags) : checkTriggers(flags);
}
