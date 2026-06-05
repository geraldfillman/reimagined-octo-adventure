import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { getEngineCacheDir } from '../lib/config.mjs';
import { today } from '../lib/markdown.mjs';

const CACHE_DIR = getEngineCacheDir('institutional-positioning', 'sec-ftd');

export async function pull(flags = {}) {
  const date = String(flags.date || today()).slice(0, 10);
  const payload = flags.file
    ? normalizeFtdFile(flags.file, date)
    : {
        schema_version: 1,
        date,
        source: 'SEC Fails-to-Deliver',
        status: 'manual/API setup required',
        records: [],
        limitations: [
          'FTDs are aggregate settlement fails, not daily new fails.',
          'Use --file <SEC pipe-delimited txt> to normalize a downloaded FTD file in this MVP slice.',
        ],
      };

  if (flags['dry-run']) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    mkdirSync(CACHE_DIR, { recursive: true });
    const outPath = join(CACHE_DIR, `${date}.json`);
    writeFileSync(outPath, JSON.stringify(indexBySymbol(payload.records), null, 2), 'utf8');
    console.log(`Wrote: ${outPath}`);
  }

  if (flags.json) console.log(JSON.stringify({ date, records: payload.records.length }, null, 2));
  return payload;
}

function normalizeFtdFile(path, date) {
  const text = readFileSync(path, 'utf8');
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split('|').map(header => header.trim().toLowerCase());
  const records = lines.slice(1).map(line => {
    const cells = line.split('|');
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
    return {
      settlement_date: normalizeDate(row.settlementdate || row.settlement_date || date),
      cusip: row.cusip || '',
      symbol: String(row.symbol || '').toUpperCase(),
      quantityFails: Number(row.quantity || row.quantity_fails || 0) || 0,
      description: row.description || '',
      price_previous_close: row.price === '.' ? null : Number(row.price || 0) || null,
      source_file: basename(path),
    };
  });
  return {
    schema_version: 1,
    date,
    source: 'SEC Fails-to-Deliver',
    source_file: basename(path),
    status: 'OK',
    records,
    limitations: ['FTDs are aggregate settlement fails, not daily new fails.'],
  };
}

function indexBySymbol(records) {
  return records.reduce((map, record) => {
    if (!record.symbol) return map;
    map[record.symbol] = record;
    return map;
  }, {});
}

function normalizeDate(raw) {
  const value = String(raw || '');
  if (/^\d{8}$/.test(value)) return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  return value.slice(0, 10);
}
