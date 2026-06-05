/**
 * config.mjs — .env loader + API key registry
 *
 * Loads environment variables from the vault root .env file.
 * Provides a registry mapping source names to their keys and base URLs.
 * Validates that required keys exist before any puller runs.
 */

import { config } from 'dotenv';
import { resolve, dirname, relative, sep, isAbsolute } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = resolve(__dirname, '..', '..');
const DEFAULT_RESEARCH_VAULT_ROOT = resolve(ENGINE_ROOT, '..', 'The Research Spine');
const DEFAULT_WORLD_MACHINE_ROOT = resolve(ENGINE_ROOT, '..', 'World_Machine');
const DEFAULT_REPORTS_VAULT_ROOT = ENGINE_ROOT;

// Load .env from vault root
config({ path: resolve(ENGINE_ROOT, '.env') });

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
  bea: {
    name: 'BEA API',
    keyVar: 'BEA_API_KEY',
    baseUrl: 'https://apps.bea.gov/api/data',
  },
  eia: {
    name: 'EIA API',
    keyVar: 'EIA_API_KEY',
    baseUrl: 'https://api.eia.gov/v2',
  },
  datagov: {
    name: 'api.data.gov',
    keyVar: 'DATA_GOV_API_KEY',
    baseUrl: 'https://api.data.gov',
  },
  'api-data-gov': {
    name: 'api.data.gov',
    keyVar: 'DATA_GOV_API_KEY',
    baseUrl: 'https://api.data.gov',
  },
  fmp: {
    name: 'Financial Modeling Prep',
    keyVar: 'FINANCIAL_MODELING_PREP_API_KEY',
    baseUrl: 'https://financialmodelingprep.com/api/v3',
  },
  alphavantage: {
    name: 'Alpha Vantage',
    keyVar: 'ALPHA_VANTAGE_API_KEY',
    baseUrl: 'https://www.alphavantage.co/query',
  },
  newsapi: {
    name: 'NewsAPI',
    keyVar: 'NEWSAPI_API_KEY',
    baseUrl: 'https://newsapi.org/v2',
  },
  gdelt: {
    name: 'GDELT DOC API',
    keyVar: null,
    baseUrl: 'https://api.gdeltproject.org/api/v2/doc/doc',
  },
  semanticscholar: {
    name: 'Semantic Scholar Academic Graph',
    keyVar: 'SEMANTIC_SCHOLAR_API_KEY',
    baseUrl: 'https://api.semanticscholar.org/graph/v1',
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
  finra: {
    name: 'FINRA Query API',
    keyVar: 'FINRA_CLIENT_ID',
    baseUrl: 'https://api.finra.org',
  },
  cftc: {
    name: 'CFTC Public Reporting',
    keyVar: null,
    baseUrl: 'https://publicreporting.cftc.gov',
  },
  occ: {
    name: 'OCC Market Data',
    keyVar: null,
    baseUrl: 'https://www.theocc.com/market-data',
  },
  secmarkets: {
    name: 'SEC Market Structure Data',
    keyVar: null,
    baseUrl: 'https://www.sec.gov/data-research/sec-markets-data',
  },
  sam: {
    name: 'SAM.gov',
    keyVar: 'SAM_GOV_API_KEY',
    baseUrl: 'https://api.sam.gov',
  },
  // OSINT sources
  otx: {
    name: 'OTX AlienVault',
    keyVar: 'OTX_API_KEY',
    baseUrl: 'https://otx.alienvault.com/api/v1',
  },
  opencorporates: {
    name: 'OpenCorporates',
    keyVar: 'OPENCORPORATES_API_KEY',
    baseUrl: 'https://api.opencorporates.com/v0.4',
  },
  vesselfinder: {
    name: 'VesselFinder AIS',
    keyVar: 'VESSELFINDER_API_KEY',
    baseUrl: 'https://api.vesselfinder.com',
  },
  spiderfoot: {
    name: 'SpiderFoot (local)',
    keyVar: 'SPIDERFOOT_API_KEY',
    baseUrl: null,  // self-hosted; SPIDERFOOT_HOST/SPIDERFOOT_PORT env vars used instead
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
      `Set ${source.keyVar} in ${resolve(ENGINE_ROOT, '.env')}`
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

/** Get the engine root path (My_Data). */
export function getEngineRoot() {
  return ENGINE_ROOT;
}

/** Resolve a path under the engine root. */
export function resolveEnginePath(...parts) {
  return resolve(ENGINE_ROOT, ...parts);
}

/** Get the human-facing research vault root path. */
export function getResearchVaultRoot() {
  const configured = process.env.RESEARCH_VAULT_ROOT?.trim();
  if (configured && resolve(configured) !== ENGINE_ROOT) {
    return resolve(configured);
  }
  return DEFAULT_RESEARCH_VAULT_ROOT;
}

/** Resolve a path under the research vault root. */
export function resolveResearchPath(...parts) {
  return resolve(getResearchVaultRoot(), ...parts);
}

/** Convert an absolute path to a research-vault-relative display path. */
export function toResearchRelative(absPath) {
  return relative(getResearchVaultRoot(), absPath).split(sep).join('/');
}

/** Get the durable World_Machine vault root path. */
export function getWorldMachineRoot() {
  const configured = process.env.WORLD_MACHINE_ROOT?.trim();
  if (configured && resolve(configured) !== ENGINE_ROOT) {
    return resolve(configured);
  }
  return DEFAULT_WORLD_MACHINE_ROOT;
}

/** Resolve a path under the World_Machine vault root. */
export function resolveWorldMachinePath(...parts) {
  return resolve(getWorldMachineRoot(), ...parts);
}

/** Convert an absolute path to a World_Machine-relative display path. */
export function toWorldMachineRelative(absPath) {
  return relative(getWorldMachineRoot(), absPath).split(sep).join('/');
}

/** Get the active report/research output root path. Defaults to My_Data. */
export function getReportsVaultRoot() {
  const configured = process.env.REPORTS_VAULT_ROOT?.trim();
  if (configured && resolve(configured) !== ENGINE_ROOT) {
    return resolve(configured);
  }
  return DEFAULT_REPORTS_VAULT_ROOT;
}

/** Resolve a path under the active report/research output root. */
export function resolveReportsPath(...parts) {
  return resolve(getReportsVaultRoot(), ...parts);
}

/** Convert an absolute path to a report-root-relative display path. */
export function toReportsRelative(absPath) {
  return relative(getReportsVaultRoot(), absPath).split(sep).join('/');
}

/** Backward-compatible review root helper. New report output defaults to My_Data. */
export function getReviewVaultRoot() {
  return getReportsVaultRoot();
}

/** Resolve a path under the active reports vault root. */
export function resolveReviewPath(...parts) {
  return resolve(getReviewVaultRoot(), ...parts);
}

/** Convert an absolute path to a report-root-relative display path. */
export function toReviewRelative(absPath) {
  return relative(getReviewVaultRoot(), absPath).split(sep).join('/');
}

/** Convert an absolute path to an engine-relative display path. */
export function toEngineRelative(absPath) {
  return relative(ENGINE_ROOT, absPath).split(sep).join('/');
}

/**
 * Backward-compatible engine root helper.
 *
 * Prefer explicit getEngineRoot()/getResearchVaultRoot() in new code.
 */
export function getVaultRoot() {
  return ENGINE_ROOT;
}

/** Get the raw data pulls directory. Raw/generated pulls stay in My_Data. */
export function getPullsDir() {
  return resolveEnginePath('05_Data_Pulls');
}

/** Get the signals directory (engine-side → ENGINE_ROOT) */
export function getSignalsDir() {
  return resolve(ENGINE_ROOT, '06_Signals');
}

/** Get the theses directory (engine-side → ENGINE_ROOT) */
export function getThesesDir() {
  return resolve(ENGINE_ROOT, '10_Theses');
}

/** Get the entities directory, optionally with nested path parts. (engine-side → ENGINE_ROOT) */
export function getEntitiesDir(...parts) {
  return resolve(ENGINE_ROOT, '08_Entities', ...parts);
}

/** Get the macro directory, optionally with nested path parts. (engine-side → ENGINE_ROOT) */
export function getMacroDir(...parts) {
  return resolve(ENGINE_ROOT, '09_Macro', ...parts);
}

/** Get the company-risk directory, optionally with nested path parts. (engine-side → ENGINE_ROOT) */
export function getCompanyRiskDir(...parts) {
  return resolve(ENGINE_ROOT, '12_Company_Risk', ...parts);
}

/** Get the research dashboards directory. (engine-side → ENGINE_ROOT) */
export function getResearchDashboardDir() {
  return resolve(ENGINE_ROOT, '00_Dashboard');
}

/** Get the research playbooks directory. (engine-side → ENGINE_ROOT) */
export function getResearchPlaybooksDir() {
  return resolve(ENGINE_ROOT, '07_Playbooks');
}

/** Get the data source notes directory. (engine-side → ENGINE_ROOT) */
export function getDataSourcesDir() {
  return resolve(ENGINE_ROOT, '01_Data_Sources');
}

/** Get an engine cache path under scripts/.cache. */
export function getEngineCacheDir(...parts) {
  return resolveEnginePath('scripts', '.cache', ...parts);
}

/** Return true when a path is inside the routed research pulls directory. */
export function isResearchPullPath(absPath) {
  const rel = relative(getPullsDir(), absPath);
  return Boolean(rel) && !rel.startsWith('..') && !isAbsolute(rel);
}

/** Extract the pull domain from an absolute path inside 05_Data_Pulls. */
export function pullDomainFromPath(absPath) {
  if (!isResearchPullPath(absPath)) return '';
  return relative(getPullsDir(), absPath).split(/[\\/]/)[0]?.toLowerCase() || '';
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

/** Get the learning vault root path */
export function getLearningVaultRoot() {
  return process.env.LEARNING_VAULT_ROOT || ENGINE_ROOT;
}

/** Get the learning root path */
export function getLearningRoot() {
  return resolve(getLearningVaultRoot(), '11_Learning');
}

/** Get the KB vault root path */
export function getKBVaultRoot() {
  return process.env.KB_VAULT_ROOT || ENGINE_ROOT;
}

/** Get the KB root path */
export function getKBRoot() {
  return resolve(getKBVaultRoot(), '12_Knowledge_Bases');
}

export { SOURCES };
