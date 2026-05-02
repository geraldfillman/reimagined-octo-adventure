/**
 * thesis-watchlists.mjs - Shared helpers for thesis and basket watchlist symbol resolution.
 */

import { join, relative, sep } from 'path';
import { getVaultRoot } from './config.mjs';
import { readFolder } from './frontmatter.mjs';

const VAULT_ROOT = getVaultRoot();
const THESES_DIR = join(VAULT_ROOT, '10_Theses');
const STOCKS_DIR = join(VAULT_ROOT, '08_Entities', 'Stocks');

const NON_SYMBOL_LINKS = new Set([
  'AI',
  'BARDA',
  'NATO',
  'SPACE',
  'USA',
  'WHO',
]);

export async function loadThesisWatchlists(options = {}) {
  const strategyOnly = Boolean(options.strategyOnly);
  const includeBaskets = Boolean(options.includeBaskets || strategyOnly);
  const thesisFilter = String(options.thesisFilter || '').trim().toLowerCase();
  const stockSymbolMap = await loadStockSymbolMap();
  const thesisNotes = await readFolder(THESES_DIR, true);

  return thesisNotes
    .filter(note => note?.data?.node_type === 'thesis')
    .map(note => {
      const relativePath = relative(THESES_DIR, note.path).split(sep).join('/');
      const name = String(note.data.name || note.filename.replace(/\.md$/i, ''));
      const isBasket = relativePath.startsWith('Baskets/');
      const isStrategy = isStrategyBasket(note.data, name, isBasket);
      return {
        name,
        note,
        path: note.path,
        relativePath,
        isBasket,
        isStrategy,
        symbols: resolveThesisSymbols(note.data.core_entities, stockSymbolMap),
      };
    })
    .filter(entry => includeBaskets || !entry.isBasket)
    .filter(entry => !strategyOnly || entry.isStrategy)
    .filter(entry =>
      !thesisFilter ||
      entry.name.toLowerCase().includes(thesisFilter) ||
      entry.relativePath.toLowerCase().includes(thesisFilter)
    )
    .filter(entry => entry.symbols.length > 0);
}

export async function loadStockSymbolMap() {
  const stockNotes = await readFolder(STOCKS_DIR, false);
  const symbolMap = new Map();

  for (const note of stockNotes) {
    const baseName = note.filename.replace(/\.md$/i, '');
    const ticker = normalizeSymbol(note?.data?.ticker || baseName);
    if (!ticker) continue;
    symbolMap.set(baseName.toUpperCase(), ticker);
    symbolMap.set(ticker, ticker);
  }

  return symbolMap;
}

export function resolveThesisSymbols(coreEntities, stockSymbolMap) {
  if (!Array.isArray(coreEntities)) return [];

  const symbols = [];
  for (const entity of coreEntities) {
    const target = extractWikiLinkTarget(entity);
    if (!target) continue;

    const mapped = stockSymbolMap.get(target.toUpperCase());
    if (mapped) {
      symbols.push(mapped);
      continue;
    }

    const fallback = normalizeSymbol(target);
    if (!fallback || NON_SYMBOL_LINKS.has(fallback)) continue;
    if (isTickerLike(fallback)) {
      symbols.push(fallback);
    }
  }

  return [...new Set(symbols)];
}

export function normalizeSymbol(value) {
  const symbol = String(value || '').trim().toUpperCase();
  return symbol || null;
}

function extractWikiLinkTarget(value) {
  const text = String(value || '').trim();
  const match = text.match(/^\[\[([^[\]]+)\]\]$/);
  return match ? match[1].trim() : text;
}

function isTickerLike(value) {
  return /^[A-Z][A-Z0-9]{0,4}(?:[._-][A-Z0-9]{1,5})?$/.test(value);
}

function isStrategyBasket(data = {}, name = '', isBasket = false) {
  const tags = Array.isArray(data.tags) ? data.tags.map(tag => String(tag).toLowerCase()) : [];
  if (tags.includes('strategy')) return true;
  return Boolean(isBasket && /\b(style|strategy|quant|garp|value|compounder|momentum|all-weather)\b/i.test(name));
}
