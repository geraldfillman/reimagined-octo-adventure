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
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
        const waitMs = retryAfter || BASE_DELAY_MS * Math.pow(2, attempt);
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
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
