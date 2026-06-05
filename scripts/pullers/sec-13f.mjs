import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { getEngineCacheDir } from '../lib/config.mjs';

const CACHE_DIR = getEngineCacheDir('institutional-positioning', 'sec-13f');

export async function pull(flags = {}) {
  const quarter = String(flags.quarter || currentQuarter());
  const payload = flags.file
    ? ingestManualFile(flags.file, quarter)
    : {
        schema_version: 1,
        quarter,
        source: 'SEC Form 13F data sets',
        status: 'manual/API setup required',
        currentRows: [],
        priorRows: [],
        symbolToCusip: {},
        limitations: [
          '13F is delayed and long-only.',
          'Use --file <json-or-csv> to normalize a downloaded SEC 13F data set in this MVP slice.',
        ],
      };

  if (flags['dry-run']) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    mkdirSync(CACHE_DIR, { recursive: true });
    const outPath = join(CACHE_DIR, `${quarter}.json`);
    writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`Wrote: ${outPath}`);
  }

  if (flags.json) console.log(JSON.stringify({ quarter, rows: payload.currentRows.length }, null, 2));
  return payload;
}

function ingestManualFile(path, quarter) {
  const text = readFileSync(path, 'utf8');
  const rows = path.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseCsv(text);
  return {
    schema_version: 1,
    quarter,
    source: 'SEC Form 13F data sets',
    source_file: basename(path),
    status: 'OK',
    currentRows: Array.isArray(rows) ? rows.map(normalize13fRow) : [],
    priorRows: [],
    symbolToCusip: {},
    limitations: ['13F is delayed and long-only; file is manually supplied.'],
  };
}

function normalize13fRow(row) {
  return {
    accession_number: row.accession_number ?? row.ACCESSION_NUMBER ?? '',
    filing_manager_name: row.filing_manager_name ?? row.MANAGER_NAME ?? row.NAMEOFISSUER ?? '',
    filing_manager_cik: row.filing_manager_cik ?? row.CIK ?? '',
    cusip: row.cusip ?? row.CUSIP ?? '',
    issuer_name: row.issuer_name ?? row.NAMEOFISSUER ?? '',
    class_title: row.class_title ?? row.TITLEOFCLASS ?? '',
    put_call: row.put_call ?? row.PUTCALL ?? '',
    shares_or_principal_amount: Number(row.shares_or_principal_amount ?? row.SSHPRNAMT ?? 0) || 0,
    market_value_usd_thousands: Number(row.market_value_usd_thousands ?? row.VALUE ?? 0) || 0,
  };
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
  });
}

function splitCsvLine(line) {
  return line.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
}

function currentQuarter() {
  const now = new Date();
  return `${now.getFullYear()}Q${Math.ceil((now.getMonth() + 1) / 3)}`;
}
