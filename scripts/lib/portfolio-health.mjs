import { buildFrontmatter, buildTable } from './markdown.mjs';

export const DEFAULT_IGNORED_ACCOUNTS = ['JEFFERSON DEFINED CONTRIBUTION RETIREMENT PLAN'];

const STATUS_RANK = { clear: 0, watch: 1, alert: 2, critical: 3 };

const ACCOUNT_RISK = {
  BrokerageLink: {
    tier: 2,
    label: 'Brokerage account / mutual funds',
    intent: 'Moderate tactical mutual-fund sleeve',
  },
  'Rollover IRA': {
    tier: 3,
    label: 'Rollover IRA / ETF only',
    intent: 'ETF-only growth and diversifier sleeve',
  },
  Individual: {
    tier: 4,
    label: 'Individual / aggressive income',
    intent: 'Highest-risk and income-focused sleeve',
  },
};

const ROLLOVER_TEMPLATE = [
  {
    role: 'US total-market core',
    targetPct: 35,
    candidates: ['VTI', 'ITOT', 'SCHB'],
    why: 'Broad core growth anchor; offsets the sector-heavy mutual-fund account.',
  },
  {
    role: 'International core',
    targetPct: 15,
    candidates: ['VXUS', 'IXUS'],
    why: 'Non-US diversification without adding another narrow sector bet.',
  },
  {
    role: 'Small-cap value/profitability tilt',
    targetPct: 10,
    candidates: ['AVUV', 'DFSV', 'VBR', 'IJS'],
    why: 'Higher-risk equity factor sleeve appropriate for the Rollover tier.',
  },
  {
    role: 'Dividend/quality income tilt',
    targetPct: 10,
    candidates: ['SCHD', 'DGRO', 'VIG', 'NOBL'],
    why: 'Income and quality exposure without relying on single stocks.',
  },
  {
    role: 'Cash-flow/quality tilt',
    targetPct: 10,
    candidates: ['COWZ', 'QUAL', 'SPHQ', 'MOAT'],
    why: 'Adds capital-discipline and quality filters to the equity sleeve.',
  },
  {
    role: 'Infrastructure / real-asset equity',
    targetPct: 5,
    candidates: ['PAVE', 'IGF', 'IFRA', 'NFRA'],
    why: 'Real-asset growth exposure; keep modest because BrokerageLink already has real estate and utilities.',
  },
  {
    role: 'Gold bullion diversifier',
    targetPct: 5,
    candidates: ['IAU', 'GLDM', 'SGOL'],
    why: 'Prefer bullion exposure here; BrokerageLink already has a large gold-miner sleeve.',
  },
  {
    role: 'Managed futures diversifier',
    targetPct: 5,
    candidates: ['DBMF', 'KMLM', 'CTA', 'FMF'],
    why: 'Small alternative sleeve for crisis/trend diversification.',
  },
  {
    role: 'Treasury bill reserve',
    targetPct: 5,
    candidates: ['SGOV', 'BIL', 'SHV', 'GBIL'],
    why: 'Keeps a small rebalance reserve while the Jefferson tier remains the lower-risk anchor.',
  },
];

export function parsePortfolioCsv(csvText) {
  const records = parseCsvRecords(String(csvText || '').replace(/^\uFEFF/, ''));
  if (records.length < 2) return [];

  const headers = records[0].map(value => String(value || '').trim());
  return records
    .slice(1)
    .map(cells => rowFromCells(headers, cells))
    .map(normalizeHolding)
    .filter(Boolean);
}

export function buildPortfolioHealthPayload({
  date,
  holdings,
  ignoredAccounts = DEFAULT_IGNORED_ACCOUNTS,
  etfUniverse = new Set(),
  sourceFile = '',
} = {}) {
  const ignoredSet = new Set(ignoredAccounts.map(value => normalizeComparable(value)));
  const includedHoldings = [];
  const ignoredHoldings = [];

  for (const holding of holdings || []) {
    if (ignoredSet.has(normalizeComparable(holding.accountName))) {
      ignoredHoldings.push(holding);
    } else {
      includedHoldings.push(holding);
    }
  }

  const totalValue = sumValues(includedHoldings);
  const ignoredValue = sumValues(ignoredHoldings);
  const accountSummaries = summarizeAccounts(includedHoldings, totalValue);
  const themeExposures = summarizeThemes(includedHoldings, totalValue);
  const signals = buildHealthSignals({ includedHoldings, accountSummaries, totalValue });
  const rolloverValue = accountSummaries.find(account => account.accountName === 'Rollover IRA')?.currentValue || 0;
  const rolloverAllocation = buildRolloverAllocation({ rolloverValue, etfUniverse });

  return {
    date,
    sourceFile,
    ignoredAccounts,
    includedHoldings,
    ignoredHoldings,
    totalValue,
    ignoredValue,
    accountSummaries,
    themeExposures,
    signals,
    signal_status: maxSignalStatus(signals.map(signal => signal.status)),
    rolloverAllocation,
  };
}

export function buildPortfolioHealthNote(payload) {
  const signalNames = payload.signals
    .filter(signal => signal.status !== 'clear')
    .map(signal => signal.name);

  const frontmatter = buildFrontmatter({
    title: `Portfolio Health Scan - ${payload.date}`,
    source: 'Fidelity positions CSV',
    date_pulled: payload.date,
    domain: 'portfolio',
    data_type: 'portfolio_health_scan',
    frequency: 'ad hoc',
    signal_status: payload.signal_status,
    signals: signalNames,
    portfolio_total: roundMoney(payload.totalValue),
    ignored_value: roundMoney(payload.ignoredValue),
    ignored_accounts: payload.ignoredAccounts,
    tags: ['portfolio', 'health', 'allocation', 'rollover-ira'],
  });

  return [
    frontmatter,
    '',
    '# Portfolio Health Scan',
    '',
    '## Scope And Assumptions',
    '',
    `- Source file: \`${payload.sourceFile || 'not recorded'}\``,
    `- Ignored account section: ${payload.ignoredAccounts.map(account => `\`${account}\``).join(', ')}`,
    '- The ignored Jefferson section includes its BrokerageLink aggregate row; separate BrokerageLink holdings are included as the mutual-fund account.',
    `- Included portfolio value: ${formatMoney(payload.totalValue)}`,
    `- Ignored Jefferson-plan value: ${formatMoney(payload.ignoredValue)}`,
    '- This is a monitoring and allocation-research note, not a trade order.',
    '',
    '## Account Snapshot',
    '',
    buildTable(
      ['Account', 'Risk tier', 'Current value', 'Portfolio %', 'Cash %', 'Top 3 %', 'Largest exposure', 'Intent'],
      payload.accountSummaries.map(account => [
        account.accountName,
        account.riskLabel,
        formatMoney(account.currentValue),
        formatPct(account.portfolioPct),
        formatPct(account.cashPct),
        formatPct(account.topThreePct),
        account.largestExposure,
        account.intent,
      ])
    ),
    '',
    '## Health Signals',
    '',
    buildTable(
      ['Status', 'Signal', 'Evidence', 'Suggested action'],
      payload.signals.map(signal => [
        signal.status,
        signal.name,
        signal.evidence,
        signal.action,
      ])
    ),
    '',
    '## Included Holdings',
    '',
    buildTable(
      ['Account', 'Symbol', 'Description', 'Value', 'Account %', 'Theme', 'Type', 'Gain/Loss %'],
      sortHoldings(payload.includedHoldings).map(holding => [
        holding.accountName,
        displaySymbol(holding),
        holding.description,
        formatMoney(holding.currentValue),
        formatNullablePct(holding.percentOfAccount),
        holding.theme,
        holding.assetType,
        formatNullablePct(holding.totalGainLossPercent),
      ])
    ),
    '',
    '## Rollover IRA ETF Balance Model',
    '',
    'Use the Rollover IRA to add broad ETF exposure before adding more sector/thematic risk. The model below uses tickers present in `08_Entities/ETFs` and avoids individual stocks.',
    '',
    buildTable(
      ['Role', 'Candidate ETF', 'Target %', 'Approx dollars', 'Why'],
      payload.rolloverAllocation.map(row => [
        row.role,
        row.ticker,
        formatPct(row.targetPct),
        formatMoney(row.targetDollars),
        row.why,
      ])
    ),
    '',
    '## Monitoring Rules',
    '',
    '- Recheck if any one Rollover ETF sleeve drifts more than 5 percentage points from target.',
    '- Recheck the full portfolio every 6 to 12 months or after major deposits/withdrawals.',
    '- Keep inverse funds and long-call option premium intentional, capped, and separately reviewed.',
    '- Do not add PSIL to the base Rollover allocation; if researched later, treat it as a very small satellite rather than a core holding.',
    '',
    '## Source Links',
    '',
    '- [[ETF]]',
    '- [[PSIL]]',
    '- [Investor.gov - Asset Allocation and Diversification](https://www.investor.gov/introduction-investing/getting-started/asset-allocation)',
    '',
  ].join('\n');
}

export function buildRolloverAllocation({ rolloverValue, etfUniverse = new Set() } = {}) {
  const universe = normalizeUniverse(etfUniverse);
  return ROLLOVER_TEMPLATE.map(row => {
    const ticker = row.candidates.find(candidate => universe.has(candidate)) || row.candidates[0];
    return {
      role: row.role,
      ticker,
      targetPct: row.targetPct,
      targetDollars: roundMoney((Number(rolloverValue) || 0) * row.targetPct / 100),
      why: row.why,
      candidates: row.candidates,
    };
  });
}

export function extractEtfUniverseFromMarkdown(files) {
  const tickers = new Set();
  for (const content of files || []) {
    const text = String(content || '');
    for (const match of text.matchAll(/\b[A-Z][A-Z0-9]{1,5}\b/g)) {
      tickers.add(match[0]);
    }
    const fmTicker = text.match(/^ticker:\s*"?([A-Z][A-Z0-9]{1,5})"?\s*$/m);
    if (fmTicker) tickers.add(fmTicker[1]);
  }
  return tickers;
}

export function maxSignalStatus(statuses) {
  return (statuses || []).reduce((best, status) => {
    const normalized = String(status || 'clear').toLowerCase();
    return (STATUS_RANK[normalized] || 0) > (STATUS_RANK[best] || 0) ? normalized : best;
  }, 'clear');
}

function parseCsvRecords(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter(cells => cells.some(cell => String(cell || '').trim() !== ''));
}

function rowFromCells(headers, cells) {
  const row = {};
  headers.forEach((header, index) => {
    row[header] = cells[index] ?? '';
  });
  return row;
}

function normalizeHolding(row) {
  const accountName = clean(row['Account Name']);
  const currentValue = parseMoney(row['Current Value']);
  if (!accountName || currentValue === null) return null;

  const rawSymbol = clean(row.Symbol);
  const symbol = rawSymbol.replace(/^\s+/, '').replace(/\*+$/g, '');
  const description = clean(row.Description);
  const holding = {
    accountNumber: clean(row['Account Number']),
    accountName,
    rawSymbol,
    symbol,
    description,
    quantity: parseNumber(row.Quantity),
    lastPrice: parseMoney(row['Last Price']),
    lastPriceChange: parseMoney(row['Last Price Change']),
    currentValue,
    todayGainLossDollar: parseMoney(row["Today's Gain/Loss Dollar"]),
    todayGainLossPercent: parsePercent(row["Today's Gain/Loss Percent"]),
    totalGainLossDollar: parseMoney(row['Total Gain/Loss Dollar']),
    totalGainLossPercent: parsePercent(row['Total Gain/Loss Percent']),
    percentOfAccount: parsePercent(row['Percent Of Account']),
    costBasisTotal: parseMoney(row['Cost Basis Total']),
    averageCostBasis: parseMoney(row['Average Cost Basis']),
    holdingType: clean(row.Type),
  };

  holding.assetType = classifyAssetType(holding);
  holding.theme = classifyTheme(holding);
  return holding;
}

function summarizeAccounts(holdings, portfolioTotal) {
  return Object.entries(groupBy(holdings, holding => holding.accountName))
    .map(([accountName, group]) => {
      const currentValue = sumValues(group);
      const sorted = [...group].sort((left, right) => right.currentValue - left.currentValue);
      const topThreeValue = sumValues(sorted.slice(0, 3));
      const cashValue = sumValues(group.filter(holding => holding.assetType === 'cash'));
      const optionValue = sumValues(group.filter(holding => holding.assetType === 'option'));
      const inverseValue = sumValues(group.filter(holding => holding.theme === 'Inverse hedge'));
      const goldMinerValue = sumValues(group.filter(holding => holding.theme === 'Gold miners'));
      const risk = ACCOUNT_RISK[accountName] || {
        tier: 9,
        label: accountName,
        intent: 'Unclassified sleeve',
      };

      return {
        accountName,
        currentValue: roundMoney(currentValue),
        portfolioPct: pct(currentValue, portfolioTotal),
        cashValue: roundMoney(cashValue),
        cashPct: pct(cashValue, currentValue),
        optionValue: roundMoney(optionValue),
        optionPct: pct(optionValue, currentValue),
        inverseValue: roundMoney(inverseValue),
        inversePct: pct(inverseValue, currentValue),
        goldMinerValue: roundMoney(goldMinerValue),
        goldMinerPct: pct(goldMinerValue, currentValue),
        topThreeValue: roundMoney(topThreeValue),
        topThreePct: pct(topThreeValue, currentValue),
        largestExposure: sorted[0] ? `${displaySymbol(sorted[0])} (${formatPct(pct(sorted[0].currentValue, currentValue))})` : 'N/A',
        riskTier: risk.tier,
        riskLabel: risk.label,
        intent: risk.intent,
        holdingCount: group.length,
      };
    })
    .sort((left, right) => left.riskTier - right.riskTier || left.accountName.localeCompare(right.accountName));
}

function summarizeThemes(holdings, portfolioTotal) {
  return Object.entries(groupBy(holdings, holding => holding.theme))
    .map(([theme, group]) => ({
      theme,
      value: roundMoney(sumValues(group)),
      portfolioPct: pct(sumValues(group), portfolioTotal),
      holdings: group.length,
    }))
    .sort((left, right) => right.value - left.value);
}

function buildHealthSignals({ includedHoldings, accountSummaries, totalValue }) {
  const signals = [];
  const rollover = accountSummaries.find(account => account.accountName === 'Rollover IRA');
  const brokerage = accountSummaries.find(account => account.accountName === 'BrokerageLink');
  const individual = accountSummaries.find(account => account.accountName === 'Individual');
  const totalCash = sumValues(includedHoldings.filter(holding => holding.assetType === 'cash'));
  const coreEtfValue = sumValues(includedHoldings.filter(holding => holding.assetType === 'etf' && /VTI|ITOT|SCHB|VXUS|IXUS/.test(holding.symbol)));

  if (rollover?.cashPct >= 95) {
    signals.push({
      status: 'alert',
      name: 'Rollover IRA idle cash',
      evidence: `Rollover IRA is ${formatPct(rollover.cashPct)} cash (${formatMoney(rollover.cashValue)}).`,
      action: 'Use the ETF-only sleeve to establish broad core exposure before adding more sector risk.',
    });
  }

  if (pct(totalCash, totalValue) >= 25) {
    signals.push({
      status: 'watch',
      name: 'High included cash drag',
      evidence: `Cash/pending activity is ${formatPct(pct(totalCash, totalValue))} of the included portfolio.`,
      action: 'Decide which cash is operating reserve versus deployable capital.',
    });
  }

  if (brokerage?.topThreePct >= 30) {
    signals.push({
      status: 'watch',
      name: 'BrokerageLink top-heavy sector funds',
      evidence: `Top three BrokerageLink holdings are ${formatPct(brokerage.topThreePct)} of that account.`,
      action: 'Cap sector funds intentionally and let Rollover IRA carry the broad ETF core.',
    });
  }

  if (brokerage?.goldMinerPct >= 12) {
    signals.push({
      status: 'watch',
      name: 'Gold-miner duplication',
      evidence: `Gold and precious-metals mutual funds are ${formatPct(brokerage.goldMinerPct)} of BrokerageLink.`,
      action: 'Avoid adding more miner exposure in Rollover; use small bullion ETF exposure only if desired.',
    });
  }

  if (brokerage?.inversePct >= 5) {
    signals.push({
      status: 'watch',
      name: 'Inverse S&P 500 fund needs explicit hedge budget',
      evidence: `RYURX is ${formatPct(brokerage.inversePct)} of BrokerageLink.`,
      action: 'Review whether this is a timed hedge, a standing hedge, or dead weight.',
    });
  }

  if (individual?.optionPct >= 20) {
    signals.push({
      status: 'watch',
      name: 'Individual account option premium concentration',
      evidence: `Long calls are ${formatPct(individual.optionPct)} of the Individual account by current value.`,
      action: 'Set a max premium budget and review expiring/large-loss contracts separately.',
    });
  }

  if (coreEtfValue <= 0) {
    signals.push({
      status: 'watch',
      name: 'No broad core ETF exposure in included accounts',
      evidence: 'Included accounts are mostly cash, sector mutual funds, individual stocks, and calls.',
      action: 'Make broad ETFs the first Rollover allocation layer.',
    });
  }

  if (signals.length === 0) {
    signals.push({
      status: 'clear',
      name: 'No portfolio health flags',
      evidence: 'Current snapshot did not breach the configured monitoring thresholds.',
      action: 'Continue scheduled review.',
    });
  }

  return signals;
}

function classifyAssetType(holding) {
  const symbol = String(holding.symbol || '').toUpperCase();
  const description = String(holding.description || '').toUpperCase();
  if (symbol === 'PENDING ACTIVITY' || description === 'PENDING ACTIVITY') return 'cash';
  if (description.includes('HELD IN MONEY MARKET') || /^(SPAXX|FDRXX|VMFXX|FZFXX|SPRXX)$/.test(symbol)) return 'cash';
  if (symbol.startsWith('-') || /\b(CALL|PUT)\b/.test(description)) return 'option';
  if (/\bETF\b/.test(description)) return 'etf';
  if (/\b(FUND|PORT|INDEX|IDX|MONEY MARKET)\b/.test(description) || holding.accountName === 'BrokerageLink') return 'mutual_fund';
  return 'stock';
}

function classifyTheme(holding) {
  const text = `${holding.symbol} ${holding.description}`.toLowerCase();
  if (holding.assetType === 'cash') return 'Cash';
  if (holding.assetType === 'option') return 'Options';
  if (text.includes('inverse')) return 'Inverse hedge';
  if (text.includes('gold') || text.includes('precious')) return 'Gold miners';
  if (text.includes('semiconductor')) return 'Semiconductors';
  if (text.includes('defense') || text.includes('aerospace')) return 'Defense/aerospace';
  if (text.includes('real estate')) return 'Real estate';
  if (text.includes('telecom') || text.includes('utilities')) return 'Utilities/telecom';
  if (text.includes('china')) return 'China';
  if (text.includes('overseas') || text.includes('intl') || text.includes('international')) return 'International';
  if (text.includes('biotech') || text.includes('pharmaceutical')) return 'Healthcare/biotech';
  if (text.includes('construction') || text.includes('housing')) return 'Housing';
  if (text.includes('financial')) return 'Financials';
  if (text.includes('consumer stples') || text.includes('consumer staples')) return 'Consumer staples';
  if (text.includes('agricultur')) return 'Agriculture';
  if (text.includes('water')) return 'Water';
  if (text.includes('industrial') || text.includes('flowserve')) return 'Industrials';
  if (text.includes('sportradar')) return 'Data/gaming';
  if (text.includes('immunitybio')) return 'Biotech single stock';
  return titleCase(holding.assetType);
}

function sortHoldings(holdings) {
  return [...holdings].sort((left, right) => {
    const leftRisk = ACCOUNT_RISK[left.accountName]?.tier || 9;
    const rightRisk = ACCOUNT_RISK[right.accountName]?.tier || 9;
    return leftRisk - rightRisk || right.currentValue - left.currentValue;
  });
}

function displaySymbol(holding) {
  if (String(holding.symbol || '').toUpperCase() === 'PENDING ACTIVITY' || holding.description === 'Pending activity') return 'Pending';
  return holding.symbol || 'N/A';
}

function groupBy(items, keyFn) {
  const groups = {};
  for (const item of items || []) {
    const key = keyFn(item);
    groups[key] ||= [];
    groups[key].push(item);
  }
  return groups;
}

function normalizeUniverse(etfUniverse) {
  if (etfUniverse instanceof Set) return new Set([...etfUniverse].map(value => String(value).toUpperCase()));
  if (Array.isArray(etfUniverse)) return new Set(etfUniverse.map(value => String(value).toUpperCase()));
  return new Set();
}

function clean(value) {
  return String(value ?? '').trim();
}

function parseMoney(value) {
  const cleaned = clean(value);
  if (!cleaned || cleaned === '--') return null;
  const numeric = Number(cleaned.replace(/[$,+%]/g, '').replace(/,/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function parseNumber(value) {
  const cleaned = clean(value);
  if (!cleaned || cleaned === '--') return null;
  const numeric = Number(cleaned.replace(/[,+]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function parsePercent(value) {
  const cleaned = clean(value);
  if (!cleaned || cleaned === '--') return null;
  const numeric = Number(cleaned.replace(/[,+%]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function sumValues(items) {
  return (items || []).reduce((sum, item) => sum + (Number(item.currentValue ?? item.value) || 0), 0);
}

function pct(value, denominator) {
  return denominator ? roundOne((Number(value) || 0) / denominator * 100) : 0;
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function roundOne(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatPct(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

function formatNullablePct(value) {
  return value === null || value === undefined ? 'N/A' : formatPct(value);
}

function normalizeComparable(value) {
  return String(value || '').trim().toLowerCase();
}

function titleCase(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
