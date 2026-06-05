import 'dotenv/config';

import { fetchBatchQuotes } from '../lib/fmp-client.mjs';
import {
  buildDataPullMeta,
  buildDryRunPlan,
  normalizeCadence,
  normalizeTickers,
  quoteToMetricSnapshots,
  writeDataPull,
  writeMetricSnapshots,
} from '../lib/neo4j-metric-snapshots.mjs';

export async function pull(flags = {}) {
  const result = await runNeo4jFmpMetricSnapshotsPull({ flags });
  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  if (result.dryRun) {
    console.log(`Neo4j FMP metric snapshots dry-run: ${result.targets.length} target(s), cadence ${result.dataPull.frequency}`);
    console.log(`Planned DataPull: ${result.dataPull.id}`);
    return result;
  }

  console.log(`Neo4j FMP metric snapshots wrote ${result.snapshots} snapshot(s) for ${result.targets.length} target(s).`);
  console.log(`DataPull: ${result.dataPull.id}`);
  return result;
}

export async function runNeo4jFmpMetricSnapshotsPull({ flags = {}, now = new Date() } = {}) {
  const cadence = normalizeCadence(flags.cadence || 'eod');
  const tickers = normalizeTickers(flags.tickers || flags.symbols || flags.ticker);
  if (tickers.length === 0) {
    throw new Error('Missing --tickers AAPL,MSFT,NVDA');
  }

  const asOfDate = String(flags.date || now.toISOString().slice(0, 10)).slice(0, 10);
  const datePulled = flags['date-pulled'] ? String(flags['date-pulled']) : now.toISOString();
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);

  if (dryRun) {
    return buildDryRunPlan({ tickers, cadence, asOfDate, datePulled });
  }

  const neo4j = await import('neo4j-driver');
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER || 'neo4j';
  const password = process.env.NEO4J_PASSWORD;
  if (!password) throw new Error('NEO4J_PASSWORD missing in .env');

  const driver = neo4j.default.driver(uri, neo4j.default.auth.basic(username, password));
  const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });
  try {
    const quotes = await fetchBatchQuotes(tickers);
    const quoteByTicker = new Map(quotes.map(quote => [String(quote.symbol || '').toUpperCase(), quote]));
    const dataPull = buildDataPullMeta({ cadence, asOfDate, datePulled, status: 'ok' });
    await writeDataPull(session, dataPull);

    let snapshots = 0;
    let latestUpdates = 0;
    const targets = [];
    for (const ticker of tickers) {
      const quote = quoteByTicker.get(ticker);
      if (!quote) continue;
      const metrics = quoteToMetricSnapshots(quote, { cadence, asof: datePulled });
      const target = { label: 'Stock', key: 'ticker', keyValue: ticker };
      latestUpdates += await writeMetricSnapshots(session, dataPull.id, target, metrics);
      snapshots += metrics.length;
      targets.push({ ...target, snapshots: metrics.length });
    }

    return {
      dryRun: false,
      dataPull,
      targets,
      snapshots,
      latestUpdates,
    };
  } finally {
    await session.close();
    await driver.close();
  }
}
