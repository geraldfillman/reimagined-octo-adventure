/**
 * fmp.mjs — Financial Modeling Prep puller
 *
 * Usage:
 *   node run.mjs fmp --profile AAPL
 *   node run.mjs fmp --income AAPL
 *   node run.mjs fmp --options SPY
 */

import { join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';
import {
  evaluatePutCallRatio, evaluateUnusualOptionsActivity,
  highestSeverity, formatSignalsSection,
} from '../lib/signals.mjs';

export async function pull(flags = {}) {
  const apiKey = getApiKey('fmp');
  const baseUrl = getBaseUrl('fmp');

  if (flags.profile) {
    await pullProfile(flags.profile, apiKey, baseUrl);
  } else if (flags.income) {
    await pullIncome(flags.income, apiKey, baseUrl);
  } else if (flags.options) {
    return await pullOptions(flags.options, apiKey, baseUrl);
  } else {
    throw new Error('Specify --profile <SYMBOL>, --income <SYMBOL>, or --options <SYMBOL>');
  }
}

async function pullProfile(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  console.log(`📊 FMP: Fetching profile for ${sym}...`);

  const data = await getJson(`${baseUrl}/profile/${sym}?apikey=${apiKey}`);
  const p = Array.isArray(data) ? data[0] : data;

  if (!p?.symbol) {
    throw new Error(`No profile data for ${sym}`);
  }

  console.log(`  ${p.companyName} | ${p.sector} / ${p.industry}`);
  console.log(`  Price: $${p.price} | Mkt Cap: ${formatNumber(p.mktCap, { style: 'currency' })}`);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Profile — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      company: p.companyName,
      date_pulled: today(),
      domain: 'market',
      data_type: 'snapshot',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['equities', 'profile', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${p.companyName} (${sym})`,
        content: `**Sector**: ${p.sector} | **Industry**: ${p.industry} | **Exchange**: ${p.exchangeShortName}\n\n${(p.description || '').slice(0, 300)}`,
      },
      {
        heading: 'Key Metrics',
        content: buildTable(
          ['Metric', 'Value'],
          [
            ['Price', `$${p.price?.toFixed(2) || 'N/A'}`],
            ['Market Cap', formatNumber(p.mktCap, { style: 'currency' })],
            ['Beta', p.beta?.toFixed(2) || 'N/A'],
            ['Vol Avg', formatNumber(p.volAvg, { style: 'compact' })],
            ['52W Range', `$${p.range || 'N/A'}`],
            ['DCF', p.dcf ? `$${p.dcf.toFixed(2)}` : 'N/A'],
            ['IPO Date', p.ipoDate || 'N/A'],
          ]
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (profile)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Profile_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
}

async function pullIncome(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  console.log(`📊 FMP: Fetching income statement for ${sym}...`);

  const data = await getJson(`${baseUrl}/income-statement/${sym}?period=annual&limit=5&apikey=${apiKey}`);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No income data for ${sym}`);
  }

  console.log(`  ${data.length} annual periods retrieved`);

  const rows = data.map(d => [
    d.calendarYear || d.date?.slice(0, 4),
    formatNumber(d.revenue, { style: 'currency' }),
    formatNumber(d.grossProfit, { style: 'currency' }),
    formatNumber(d.operatingIncome, { style: 'currency' }),
    formatNumber(d.netIncome, { style: 'currency' }),
    d.eps?.toFixed(2) || 'N/A',
  ]);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Income Statement — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'time_series',
      frequency: 'annual',
      signal_status: 'clear',
      signals: [],
      tags: ['equities', 'income-statement', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Annual Income Statement`,
        content: buildTable(
          ['Year', 'Revenue', 'Gross Profit', 'Operating Income', 'Net Income', 'EPS'],
          rows
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (income-statement)\n- **Symbol**: ${sym}\n- **Periods**: Last ${data.length} years\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Income_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
}

/**
 * Pull options chain data for a symbol.
 * @param {string} symbol — ticker symbol
 * @param {string} apiKey
 * @param {string} baseUrl
 * @returns {Promise<{filePath: string, signals: object[]}>}
 */
async function pullOptions(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  console.log(`📊 FMP: Fetching options chain for ${sym}...`);

  let chain = null;

  try {
    const v3Url = `${baseUrl}/stock/option-chain/${sym}?apikey=${apiKey}`;
    const v3Data = await getJson(v3Url);

    if (v3Data?.['Error Message']) {
      throw new Error(v3Data['Error Message']);
    }

    if (Array.isArray(v3Data) && v3Data.length > 0) {
      chain = v3Data;
    } else {
      console.log(`  v3 returned empty — trying v4 fallback...`);
      const v4Url = `${baseUrl.replace('/v3', '/v4')}/stock/option-chain/${sym}?apikey=${apiKey}`;
      const v4Data = await getJson(v4Url);

      if (v4Data?.['Error Message']) {
        throw new Error(v4Data['Error Message']);
      }

      if (Array.isArray(v4Data) && v4Data.length > 0) {
        chain = v4Data;
      }
    }
  } catch (err) {
    console.error(`  Error fetching options chain for ${sym}: ${err.message}`);
    return { filePath: null, signals: [] };
  }

  if (!chain || chain.length === 0) {
    console.log(`  No options data available for ${sym}.`);
    return { filePath: null, signals: [] };
  }

  console.log(`  ${chain.length} contracts retrieved`);

  // --- Derived metrics ---

  // Put/Call volume ratio
  let totalCallVolume = 0;
  let totalPutVolume = 0;
  let totalCallIV = 0;
  let totalPutIV = 0;
  let callIVCount = 0;
  let putIVCount = 0;

  // Max pain: combined OI per strike
  const oiByStrike = {};

  // Unusual volume: max vol/OI ratio
  let maxVolToOI = 0;

  for (const contract of chain) {
    const type = (contract.type || contract.optionType || '').toLowerCase();
    const vol = Number(contract.volume) || 0;
    const oi = Number(contract.openInterest) || 0;
    const iv = Number(contract.impliedVolatility) || 0;
    const strike = Number(contract.strike) || 0;

    if (type === 'call') {
      totalCallVolume += vol;
      if (iv > 0) { totalCallIV += iv; callIVCount++; }
    } else if (type === 'put') {
      totalPutVolume += vol;
      if (iv > 0) { totalPutIV += iv; putIVCount++; }
    }

    if (strike > 0) {
      oiByStrike[strike] = (oiByStrike[strike] || 0) + oi;
    }

    if (oi > 0) {
      const ratio = vol / oi;
      if (ratio > maxVolToOI) maxVolToOI = ratio;
    }
  }

  const putCallRatio = totalCallVolume > 0
    ? totalPutVolume / totalCallVolume
    : null;

  // Max pain strike
  let maxPainStrike = null;
  let maxPainOI = -Infinity;
  for (const [strike, combinedOI] of Object.entries(oiByStrike)) {
    if (combinedOI > maxPainOI) {
      maxPainOI = combinedOI;
      maxPainStrike = Number(strike);
    }
  }

  const avgCallIV = callIVCount > 0 ? (totalCallIV / callIVCount) : null;
  const avgPutIV = putIVCount > 0 ? (totalPutIV / putIVCount) : null;

  // --- Signals ---
  const signals = [];
  if (putCallRatio !== null) {
    const pcSignal = evaluatePutCallRatio(putCallRatio);
    if (pcSignal) signals.push(pcSignal);
  }
  if (maxVolToOI > 0) {
    const uvSignal = evaluateUnusualOptionsActivity(maxVolToOI);
    if (uvSignal) signals.push(uvSignal);
  }

  const severity = highestSeverity(signals);

  // --- Top contracts table (by volume, top 30) ---
  const sorted = [...chain].sort((a, b) => (Number(b.volume) || 0) - (Number(a.volume) || 0));
  const top30 = sorted.slice(0, 30);

  const rows = top30.map(c => [
    c.strike != null ? `$${Number(c.strike).toFixed(2)}` : 'N/A',
    c.expiration || c.expirationDate || 'N/A',
    (c.type || c.optionType || 'N/A').toUpperCase(),
    c.lastPrice != null ? `$${Number(c.lastPrice).toFixed(2)}` : 'N/A',
    c.bid != null ? `$${Number(c.bid).toFixed(2)}` : 'N/A',
    c.ask != null ? `$${Number(c.ask).toFixed(2)}` : 'N/A',
    formatNumber(Number(c.volume) || 0, { style: 'compact' }),
    formatNumber(Number(c.openInterest) || 0, { style: 'compact' }),
    c.impliedVolatility != null ? `${(Number(c.impliedVolatility) * 100).toFixed(1)}%` : 'N/A',
    c.delta != null ? Number(c.delta).toFixed(3) : 'N/A',
  ]);

  // --- Summary bullets ---
  const summaryLines = [
    `- **Total Call Volume**: ${formatNumber(totalCallVolume, { style: 'compact' })}`,
    `- **Total Put Volume**: ${formatNumber(totalPutVolume, { style: 'compact' })}`,
    `- **Put/Call Volume Ratio**: ${putCallRatio !== null ? putCallRatio.toFixed(3) : 'N/A'}`,
    `- **Max Pain Strike**: ${maxPainStrike !== null ? `$${maxPainStrike.toFixed(2)}` : 'N/A'}`,
    `- **Avg Call IV**: ${avgCallIV !== null ? `${(avgCallIV * 100).toFixed(1)}%` : 'N/A'}`,
    `- **Avg Put IV**: ${avgPutIV !== null ? `${(avgPutIV * 100).toFixed(1)}%` : 'N/A'}`,
    `- **Max Vol/OI Ratio**: ${maxVolToOI > 0 ? maxVolToOI.toFixed(2) : 'N/A'}`,
    `- **Contracts in Chain**: ${chain.length}`,
  ];

  // --- Build note ---
  const signalsSection = formatSignalsSection(signals);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Options Chain — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'snapshot',
      frequency: 'on-demand',
      signal_status: severity || 'clear',
      signals: signals.map(s => s.label || s.name || s.type || 'signal'),
      tags: ['options', 'options-chain', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      ...(signals.length > 0 ? [{ heading: 'Signals', content: signalsSection }] : []),
      {
        heading: 'Summary',
        content: summaryLines.join('\n'),
      },
      {
        heading: `Top 30 Contracts by Volume`,
        content: buildTable(
          ['Strike', 'Exp', 'Type', 'Last', 'Bid', 'Ask', 'Vol', 'OI', 'IV', 'Delta'],
          rows
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (option-chain)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Options_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);

  // Write signal log
  if (signals.length > 0) {
    const signalLogPath = join(getSignalsDir(), dateStampedFilename(`signals_FMP_Options_${sym}`));
    writeNote(signalLogPath, buildNote({
      frontmatter: {
        title: `Signals — FMP Options ${sym}`,
        source: 'Financial Modeling Prep',
        symbol: sym,
        date_pulled: today(),
        signal_status: severity,
        tags: ['signals', 'options', sym.toLowerCase(), 'fmp'],
      },
      sections: [{ heading: 'Signals', content: signalsSection }],
    }));
    console.log(`🚨 Signals written: ${signalLogPath}`);
  }

  return { filePath, signals };
}
