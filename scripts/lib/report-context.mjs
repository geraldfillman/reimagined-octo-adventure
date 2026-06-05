import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const CONFIG_DIR = join(HERE, '..', 'config');

const CADENCE_MECHANISM_TAGS = {
  premarket: ['macro', 'liquidity', 'credit', 'fx', 'rates'],
  daily: ['macro', 'flows', 'credit', 'earnings', 'positioning'],
  midday: ['options', 'vol', 'microstructure', 'flows', 'positioning'],
  preclose: ['options', 'gamma', 'microstructure', 'vol', 'positioning'],
  endofday: ['credit', 'macro', 'positioning', 'sentiment', 'earnings'],
};

const CADENCE_CHECKLISTS = {
  premarket: [
    ['Overnight macro', 'FRED rates/inflation/liquidity/credit plus Treasury curve'],
    ['Calendar risk', 'FMP macro and earnings calendar'],
    ['Overnight tape', 'Index, rates, credit, dollar, gold, oil, and vol ETF basket'],
    ['Vol context', 'VIX complex plus SPY/QQQ term structure'],
  ],
  daily: [
    ['Open-bell breadth', 'FMP market performance, SPY/QQQ/IWM, entropy monitor'],
    ['Official pull refresh', 'SEC thesis filings and Treasury/FRED refresh'],
    ['Thesis tape', 'FMP thesis watchlists and opportunity viewpoints'],
  ],
  midday: [
    ['Intraday tape', 'Index basket, market performance, FMP news'],
    ['Vol intraday', '5-minute VIX complex and same-day put/call read'],
    ['Entropy check', 'Compression and breakout monitor'],
  ],
  preclose: [
    ['Last-hour tape', 'Index basket and market performance before the close'],
    ['Gamma / P-C', 'SPY/QQQ/IWM near-expiry put/call and VIX complex'],
    ['News sweep', 'FMP general news before close'],
  ],
  endofday: [
    ['Volatility close', 'VIX complex, term structure, full P/C and IV context'],
    ['Macro close', 'Macro calendar and earnings calendar refresh'],
    ['COT / positioning', 'COT on Fridays, insider activity on market days'],
    ['Opportunity review', 'Opportunity viewpoints and strategy register update'],
  ],
};

function readConfig(name) {
  return JSON.parse(readFileSync(join(CONFIG_DIR, name), 'utf-8'));
}

function arrayFrom(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeToken(value) {
  return String(value || '').toLowerCase();
}

function resolveLimit(value, fallback) {
  if (value === undefined || value === null) {
    return fallback;
  }
  const limit = Number(value);
  return Number.isFinite(limit) && limit >= 0 ? limit : fallback;
}

export function loadMechanismMap() {
  const parsed = readConfig('mechanism-map.json');
  return Array.isArray(parsed.mechanisms) ? parsed.mechanisms : [];
}

export function loadStrategyCatalog() {
  const parsed = readConfig('strategy-catalog.json');
  return Array.isArray(parsed.strategies) ? parsed.strategies : [];
}

export function selectMechanismsForCadence(cadence, options = {}) {
  const limit = resolveLimit(options.limit, 10);
  const cadenceTags = arrayFrom(CADENCE_MECHANISM_TAGS[cadence]).map(normalizeToken);

  return loadMechanismMap()
    .map(item => {
      const mechanismTokens = new Set([
        item.category,
        ...arrayFrom(item.tags),
        ...arrayFrom(item.regime),
        ...arrayFrom(item.regimes),
      ].map(normalizeToken).filter(Boolean));
      const score = cadenceTags.reduce((total, tag) => total + (mechanismTokens.has(tag) ? 1 : 0), 0);
      return { item, score };
    })
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score || String(a.item.name).localeCompare(String(b.item.name)))
    .slice(0, limit)
    .map(row => row.item);
}

export function mechanismRowsForCadence(cadence, options = {}) {
  return selectMechanismsForCadence(cadence, options).map(item => [
    item.name,
    item.category,
    arrayFrom(item.regimes ?? item.regime).join(', '),
    arrayFrom(item.trigger_conditions).slice(0, 2).join('; '),
    arrayFrom(item.signals_to_watch).slice(0, 3).map(signal => signal.signal || signal).join('; '),
  ]);
}

export function strategyRowsForRegister(options = {}) {
  const strategies = loadStrategyCatalog();
  const limit = resolveLimit(options.limit, strategies.length);
  return strategies.slice(0, limit).map(item => [
    item.name,
    item.status,
    item.tracking_mode,
    arrayFrom(item.data_requirements).join(', '),
    item.review_rule,
  ]);
}

export function strategyRowsForBriefing(options = {}) {
  const strategies = loadStrategyCatalog();
  const limit = resolveLimit(options.limit, 8);
  return strategies.slice(0, limit).map(item => [
    item.name,
    item.status,
    item.tracking_mode,
    item.review_rule,
  ]);
}

export function buildCadenceChecklist(cadence) {
  const rows = CADENCE_CHECKLISTS[cadence] || CADENCE_CHECKLISTS.daily;
  return rows.map(row => [...row]);
}
