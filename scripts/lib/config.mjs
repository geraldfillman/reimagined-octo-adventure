/**
 * config.mjs — .env loader + API key registry
 *
 * Loads environment variables from the vault root .env file.
 * Provides a registry mapping source names to their keys and base URLs.
 * Validates that required keys exist before any puller runs.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = resolve(__dirname, '..', '..');

// Load .env from vault root
config({ path: resolve(VAULT_ROOT, '.env') });

/** API source registry — maps source names to config */
const SOURCES = Object.freeze({
  fred: {
    name: 'FRED API',
    keyVar: 'FRED_API_KEY',
    baseUrl: 'https://api.stlouisfed.org/fred',
  },
  fda: {
    name: 'openFDA',
    keyVar: 'FDA_OPEN_DATA_API_KEY',
    baseUrl: 'https://api.fda.gov',
  },
  bls: {
    name: 'BLS API',
    keyVar: 'BLS_API_KEY',
    baseUrl: 'https://api.bls.gov/publicAPI/v2',
  },
  bea: {
    name: 'BEA API',
    keyVar: 'BEA_API_KEY',
    baseUrl: 'https://apps.bea.gov/api/data',
  },
  census: {
    name: 'Census API',
    keyVar: 'CENSUS_API_KEY',
    baseUrl: 'https://api.census.gov/data',
  },
  eia: {
    name: 'EIA API',
    keyVar: 'EIA_API_KEY',
    baseUrl: 'https://api.eia.gov/v2',
  },
  alphavantage: {
    name: 'Alpha Vantage',
    keyVar: 'ALPHA_VANTAGE_API_KEY',
    baseUrl: 'https://www.alphavantage.co/query',
  },
  fmp: {
    name: 'Financial Modeling Prep',
    keyVar: 'FINANCIAL_MODELING_PREP_API_KEY',
    baseUrl: 'https://financialmodelingprep.com/api/v3',
  },
  newsapi: {
    name: 'NewsAPI',
    keyVar: 'NEWSAPI_API_KEY',
    baseUrl: 'https://newsapi.org/v2',
  },
  patentsview: {
    name: 'USPTO PatentsView',
    keyVar: 'PATENTSVIEW_API_KEY',
    baseUrl: 'https://search.patentsview.org/api/v1',
  },
  // No-key sources
  treasury: {
    name: 'Treasury Fiscal Data',
    keyVar: null,
    baseUrl: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service',
  },
  usaspending: {
    name: 'USASpending',
    keyVar: null,
    baseUrl: 'https://api.usaspending.gov/api/v2',
  },
  openfema: {
    name: 'OpenFEMA',
    keyVar: null,
    baseUrl: 'https://www.fema.gov/api/open/v2',
  },
  clinicaltrials: {
    name: 'ClinicalTrials.gov',
    keyVar: null,
    baseUrl: 'https://clinicaltrials.gov/api/v2',
  },
  secedgar: {
    name: 'SEC EDGAR Full-Text',
    keyVar: null,
    baseUrl: 'https://efts.sec.gov/LATEST',
  },
  arxiv: {
    name: 'arXiv Preprints',
    keyVar: null,
    baseUrl: 'https://export.arxiv.org/api/query',
  },
  pubmed: {
    name: 'NCBI PubMed',
    keyVar: null,
    baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
  },
  noaa: {
    name: 'NOAA Storm Events',
    keyVar: null,
    baseUrl: 'https://www.ncdc.noaa.gov/stormevents',
  },
  worldbank: {
    name: 'World Bank',
    keyVar: null,
    baseUrl: 'https://api.worldbank.org/v2',
  },
  socrata: {
    name: 'Socrata Open Data',
    keyVar: 'SOCRATA_APP_TOKEN',
    baseUrl: 'https://data.cityofnewyork.us/resource',
  },
  cboe: {
    name: 'CBOE Market Data',
    keyVar: null,
    baseUrl: 'https://cdn.cboe.com/api/global/us_indices/daily_prices',
  },
  sam: {
    name: 'SAM.gov',
    keyVar: 'SAM_GOV_API_KEY',
    baseUrl: 'https://api.sam.gov',
  },
});

/**
 * Get the API key for a source. Throws if key is required but missing.
 * @param {string} sourceId — key from SOURCES registry
 * @returns {string|null} — the API key, or null if not required
 */
export function getApiKey(sourceId) {
  const source = SOURCES[sourceId];
  if (!source) {
    throw new Error(`Unknown source: "${sourceId}". Available: ${Object.keys(SOURCES).join(', ')}`);
  }
  if (!source.keyVar) {
    return null; // No key required
  }
  const key = process.env[source.keyVar]?.trim();
  if (!key) {
    throw new Error(
      `API key not configured for ${source.name}. ` +
      `Set ${source.keyVar} in ${resolve(VAULT_ROOT, '.env')}`
    );
  }
  return key;
}

/**
 * Get the base URL for a source.
 * @param {string} sourceId
 * @returns {string}
 */
export function getBaseUrl(sourceId) {
  const source = SOURCES[sourceId];
  if (!source) {
    throw new Error(`Unknown source: "${sourceId}"`);
  }
  return source.baseUrl;
}

/**
 * Get source display name.
 * @param {string} sourceId
 * @returns {string}
 */
export function getSourceName(sourceId) {
  return SOURCES[sourceId]?.name ?? sourceId;
}

/** Get the vault root path */
export function getVaultRoot() {
  return VAULT_ROOT;
}

/** Get the data pulls directory */
export function getPullsDir() {
  return resolve(VAULT_ROOT, '05_Data_Pulls');
}

/** Get the signals directory */
export function getSignalsDir() {
  return resolve(VAULT_ROOT, '06_Signals');
}

/** List all registered source IDs */
export function listSources() {
  return Object.entries(SOURCES).map(([id, s]) => ({
    id,
    name: s.name,
    requiresKey: !!s.keyVar,
    hasKey: s.keyVar ? !!process.env[s.keyVar]?.trim() : true,
  }));
}

export { SOURCES };
