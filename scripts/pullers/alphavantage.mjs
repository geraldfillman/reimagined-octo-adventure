/**
 * alphavantage.mjs — Alpha Vantage stock data puller
 *
 * Usage:
 *   node run.mjs alphavantage --quote SPY
 *   node run.mjs alphavantage --overview AAPL
 */

import { join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, formatNumber, today, dateStampedFilename } from '../lib/markdown.mjs';
import { highestSeverity } from '../lib/signals.mjs';

export async function pull(flags = {}) {
  const apiKey = getApiKey('alphavantage');
  const baseUrl = getBaseUrl('alphavantage');

  if (flags.quote) {
    await pullQuote(flags.quote, apiKey, baseUrl);
  } else if (flags.overview) {
    await pullOverview(flags.overview, apiKey, baseUrl);
  } else {
    throw new Error('Specify --quote <SYMBOL> or --overview <SYMBOL>');
  }
}

async function pullQuote(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  console.log(`📈 Alpha Vantage: Fetching quote for ${sym}...`);

  const url = `${baseUrl}?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${apiKey}`;
  const data = await getJson(url);
  const q = data['Global Quote'];

  if (!q || !q['05. price']) {
    throw new Error(`No quote data returned for ${sym}. Response: ${JSON.stringify(data).slice(0, 200)}`);
  }

  const price = parseFloat(q['05. price']);
  const change = parseFloat(q['09. change']);
  const changePct = q['10. change percent']?.replace('%', '');
  const volume = parseInt(q['06. volume']);
  const prevClose = parseFloat(q['08. previous close']);
  const high = parseFloat(q['03. high']);
  const low = parseFloat(q['04. low']);

  console.log(`  ${sym}: $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePct}%)`);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Quote — Alpha Vantage`,
      source: 'Alpha Vantage',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'snapshot',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['equities', 'quote', sym.toLowerCase(), 'alpha-vantage'],
    },
    sections: [
      {
        heading: `${sym} — Market Quote`,
        content: buildTable(
          ['Metric', 'Value'],
          [
            ['Price', `$${price.toFixed(2)}`],
            ['Change', `${change >= 0 ? '+' : ''}${change.toFixed(2)}`],
            ['Change %', `${changePct}%`],
            ['Previous Close', `$${prevClose.toFixed(2)}`],
            ['Day High', `$${high.toFixed(2)}`],
            ['Day Low', `$${low.toFixed(2)}`],
            ['Volume', formatNumber(volume, { style: 'compact', decimals: 0 })],
          ]
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Alpha Vantage (GLOBAL_QUOTE)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`AV_Quote_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

async function pullOverview(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  console.log(`📊 Alpha Vantage: Fetching company overview for ${sym}...`);

  const url = `${baseUrl}?function=OVERVIEW&symbol=${sym}&apikey=${apiKey}`;
  const data = await getJson(url);

  if (!data.Symbol) {
    throw new Error(`No overview data for ${sym}. Response: ${JSON.stringify(data).slice(0, 200)}`);
  }

  console.log(`  ${data.Name} (${data.Exchange}): ${data.Sector} / ${data.Industry}`);
  console.log(`  Market Cap: $${formatNumber(parseFloat(data.MarketCapitalization), { style: 'compact' })}`);
  console.log(`  P/E: ${data.PERatio} | EPS: $${data.EPS} | Div Yield: ${data.DividendYield}`);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Company Overview — Alpha Vantage`,
      source: 'Alpha Vantage',
      symbol: sym,
      company: data.Name,
      sector: data.Sector,
      industry: data.Industry,
      date_pulled: today(),
      domain: 'market',
      data_type: 'snapshot',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['equities', 'fundamentals', sym.toLowerCase(), data.Sector?.toLowerCase().replace(/\s+/g, '-')],
    },
    sections: [
      {
        heading: `${data.Name} (${sym})`,
        content: `**Exchange**: ${data.Exchange} | **Sector**: ${data.Sector} | **Industry**: ${data.Industry}\n\n${data.Description?.slice(0, 300) || 'No description available.'}`,
      },
      {
        heading: 'Key Metrics',
        content: buildTable(
          ['Metric', 'Value'],
          [
            ['Market Cap', `$${formatNumber(parseFloat(data.MarketCapitalization), { style: 'compact' })}`],
            ['P/E Ratio', data.PERatio || 'N/A'],
            ['Forward P/E', data.ForwardPE || 'N/A'],
            ['EPS', `$${data.EPS || 'N/A'}`],
            ['Revenue TTM', `$${formatNumber(parseFloat(data.RevenueTTM), { style: 'compact' })}`],
            ['Profit Margin', data.ProfitMargin || 'N/A'],
            ['Dividend Yield', data.DividendYield ? `${(parseFloat(data.DividendYield) * 100).toFixed(2)}%` : 'N/A'],
            ['52-Week High', `$${data['52WeekHigh'] || 'N/A'}`],
            ['52-Week Low', `$${data['52WeekLow'] || 'N/A'}`],
            ['Beta', data.Beta || 'N/A'],
          ]
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Alpha Vantage (OVERVIEW)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`AV_Overview_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}
