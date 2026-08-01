/**
 * fetcher.mjs — HTTP client with retry, rate-limit awareness, and timeout
 *
 * Wraps native fetch() (Node 20+) with:
 * - Automatic retry with exponential backoff (3 attempts)
 * - Rate limit header awareness (Retry-After)
 * - Configurable timeout (default 30s)
 * - Response format detection (JSON vs text)
 * - Returns immutable response objects
 */

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;
// 429s get a longer ladder than transient errors (5s/10s/20s) — free-tier
// per-minute limits need more than 1s/2s/4s to clear.
const RATE_LIMIT_BASE_DELAY_MS = 5_000;

// ── FMP token-bucket rate limiter ─────────────────────────────────────────────
// Default: 30 calls/min — paced for the FMP FREE tier (the binding limit is
// ~250 calls/day; gentle pacing avoids burst 429s). If the account is ever
// upgraded, raise via FMP_CALLS_PER_MINUTE env var (capped at 750).
const FMP_HOST = 'financialmodelingprep.com';
const FMP_CALLS_PER_MINUTE = Math.min(
  750,
  parseInt(process.env.FMP_CALLS_PER_MINUTE ?? '30', 10)
);
// Refill rate in tokens per millisecond
const FMP_TOKENS_PER_MS = FMP_CALLS_PER_MINUTE / 60_000;
// Allow a short burst before throttling kicks in
const FMP_MAX_TOKENS = 5;

const _fmpBucket = {
  tokens: FMP_MAX_TOKENS,
  lastRefill: Date.now(),
};

// Once an FMP call 429s through a full retry cycle, the daily quota is almost
// certainly spent — fail the rest of this process's FMP calls immediately
// instead of burning the full backoff ladder on each one. (Per-process only:
// each cadence task is its own node process.)
let _fmpQuotaExhausted = false;

async function acquireFmpToken() {
  while (true) {
    const now = Date.now();
    const elapsed = now - _fmpBucket.lastRefill;
    _fmpBucket.tokens = Math.min(
      FMP_MAX_TOKENS,
      _fmpBucket.tokens + elapsed * FMP_TOKENS_PER_MS
    );
    _fmpBucket.lastRefill = now;

    if (_fmpBucket.tokens >= 1) {
      _fmpBucket.tokens -= 1;
      return;
    }

    // Wait until the next token is available
    const waitMs = Math.ceil((1 - _fmpBucket.tokens) / FMP_TOKENS_PER_MS);
    await sleep(waitMs);
  }
}

function isFmpUrl(url) {
  try { return new URL(url).hostname.includes(FMP_HOST); } catch { return false; }
}

/**
 * Fetch a URL with retry and timeout.
 * @param {string} url
 * @param {object} [options]
 * @param {string} [options.method='GET']
 * @param {object} [options.headers]
 * @param {string|object} [options.body] — auto-stringified if object
 * @param {number} [options.timeout=30000] — ms
 * @param {number} [options.retries=3]
 * @returns {Promise<{data: any, status: number, headers: object}>}
 */
export async function fetchWithRetry(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = DEFAULT_TIMEOUT_MS,
    retries = MAX_RETRIES,
  } = options;

  const fetchHeaders = {
    'User-Agent': 'MyData-Vault/1.0',
    ...headers,
  };

  if (body && typeof body === 'object' && !fetchHeaders['Content-Type']) {
    fetchHeaders['Content-Type'] = 'application/json';
  }

  const fetchBody = body && typeof body === 'object' ? JSON.stringify(body) : body;

  let lastError = null;

  // Proactively throttle FMP requests before the first attempt
  if (isFmpUrl(url)) {
    if (_fmpQuotaExhausted) {
      throw new Error(`FMP quota exhausted earlier in this run (persistent 429) — failing fast: ${url}`);
    }
    await acquireFmpToken();
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: fetchHeaders,
        body: fetchBody,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Rate limited — wait and retry
      if (response.status === 429) {
        lastError = new Error(`Rate limited (429): ${url}`);
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
        const waitMs = retryAfter || RATE_LIMIT_BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`  Rate limited (429). Waiting ${Math.round(waitMs / 1000)}s before retry...`);
        await sleep(waitMs);
        continue;
      }

      // Server error — retry with backoff
      if (response.status >= 500) {
        lastError = new Error(`Server error ${response.status}: ${response.statusText}`);
        const waitMs = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`  Server error (${response.status}). Retry ${attempt + 1}/${retries} in ${waitMs}ms...`);
        await sleep(waitMs);
        continue;
      }

      // Parse response
      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
        // Try parsing as JSON anyway (some APIs don't set content-type)
        try {
          data = JSON.parse(data);
        } catch {
          // Keep as text
        }
      }

      return Object.freeze({
        data,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        lastError = new Error(`Request timed out after ${timeout}ms: ${url}`);
      }
      if (attempt < retries - 1) {
        const waitMs = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`  Fetch error: ${lastError.message}. Retry ${attempt + 1}/${retries} in ${waitMs}ms...`);
        await sleep(waitMs);
      }
    }
  }

  if (isFmpUrl(url) && lastError?.message?.includes('429')) {
    _fmpQuotaExhausted = true;
  }
  throw new Error(`Failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Convenience: GET JSON from a URL.
 * @param {string} url
 * @param {object} [options]
 * @returns {Promise<any>} — the parsed data
 */
export async function getJson(url, options = {}) {
  const result = await fetchWithRetry(url, { ...options, method: 'GET' });
  if (!result.ok) {
    throw new Error(`HTTP ${result.status}: ${typeof result.data === 'string' ? result.data.slice(0, 200) : JSON.stringify(result.data).slice(0, 200)}`);
  }
  return result.data;
}

/**
 * Convenience: POST JSON to a URL.
 * @param {string} url
 * @param {object} body
 * @param {object} [options]
 * @returns {Promise<any>} — the parsed data
 */
export async function postJson(url, body, options = {}) {
  const result = await fetchWithRetry(url, { ...options, method: 'POST', body });
  if (!result.ok) {
    throw new Error(`HTTP ${result.status}: ${typeof result.data === 'string' ? result.data.slice(0, 200) : JSON.stringify(result.data).slice(0, 200)}`);
  }
  return result.data;
}

/** Parse Retry-After header (seconds or date) */
function parseRetryAfter(header) {
  if (!header) return null;
  const seconds = parseInt(header, 10);
  if (!isNaN(seconds)) return seconds * 1000;
  const date = new Date(header);
  if (!isNaN(date.getTime())) return Math.max(0, date.getTime() - Date.now());
  return null;
}

/** Promise-based sleep */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run an async function over an array with bounded concurrency.
 * @template T, U
 * @param {T[]} items
 * @param {number} limit — max simultaneous in-flight tasks
 * @param {(item: T) => Promise<U>} fn
 * @returns {Promise<U[]>}
 */
export async function mapConcurrent(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) { const i = cursor++; out[i] = await fn(items[i]); }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, worker));
  return out;
}
