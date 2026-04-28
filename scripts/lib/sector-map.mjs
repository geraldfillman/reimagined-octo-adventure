/**
 * sector-map.mjs — Maps sector basket names to data source aliases
 *
 * Each entry maps a basket filename prefix to the three puller targets:
 *   secAlias   — flag for `sec --sectors <alias>`
 *   fmpSector  — sector name for FMP screening
 *   newsTopic  — topic keyword for newsapi
 */

export const SECTOR_MAP = Object.freeze([
  {
    basket: 'Aerospace & Defense Sector Basket',
    slug: 'aerospace-defense',
    secAlias: 'industrial',
    fmpSector: 'Industrials',
    newsTopic: 'defense',
  },
  {
    basket: 'Communication Services Sector Basket',
    slug: 'communication-services',
    secAlias: 'technology',
    fmpSector: 'Communication Services',
    newsTopic: 'technology',
  },
  {
    basket: 'Consumer Discretionary Sector Basket',
    slug: 'consumer-discretionary',
    secAlias: 'consumer',
    fmpSector: 'Consumer Cyclical',
    newsTopic: 'consumer',
  },
  {
    basket: 'Consumer Staples Sector Basket',
    slug: 'consumer-staples',
    secAlias: 'consumer',
    fmpSector: 'Consumer Defensive',
    newsTopic: 'consumer',
  },
  {
    basket: 'Energy Sector Basket',
    slug: 'energy',
    secAlias: 'energy',
    fmpSector: 'Energy',
    newsTopic: 'energy',
  },
  {
    basket: 'Financials Sector Basket',
    slug: 'financials',
    secAlias: 'finance',
    fmpSector: 'Financial Services',
    newsTopic: 'finance',
  },
  {
    basket: 'Healthcare Sector Basket',
    slug: 'healthcare',
    secAlias: 'health',
    fmpSector: 'Healthcare',
    newsTopic: 'health',
  },
  {
    basket: 'Industrials Sector Basket',
    slug: 'industrials',
    secAlias: 'industrial',
    fmpSector: 'Industrials',
    newsTopic: 'manufacturing',
  },
  {
    basket: 'Materials Sector Basket',
    slug: 'materials',
    secAlias: 'industrial',
    fmpSector: 'Basic Materials',
    newsTopic: 'commodities',
  },
  {
    basket: 'Real Estate Sector Basket',
    slug: 'real-estate',
    secAlias: 'realestate',
    fmpSector: 'Real Estate',
    newsTopic: 'housing',
  },
  {
    basket: 'Tech Sector Basket',
    slug: 'tech',
    secAlias: 'technology',
    fmpSector: 'Technology',
    newsTopic: 'technology',
  },
  {
    basket: 'Utilities Sector Basket',
    slug: 'utilities',
    secAlias: 'cleanenergy',
    fmpSector: 'Utilities',
    newsTopic: 'energy',
  },
]);

/**
 * Find a sector entry by basket name prefix or slug (case-insensitive).
 * @param {string} query
 * @returns {object|null}
 */
export function findSector(query) {
  const q = query.toLowerCase();
  return SECTOR_MAP.find(
    s => s.slug === q || s.basket.toLowerCase().startsWith(q)
  ) ?? null;
}
