/**
 * retry.mjs — Generic async retry with backoff and Retry-After support.
 *
 * Distinct from request spacing (token bucket / minimum-interval pacing) —
 * callers handle that separately. This helper covers transient HTTP failures
 * and 429 responses where the right move is to wait, then try again.
 *
 * Pattern: throw a RateLimitError from your fn() to signal a server-driven
 * delay; throw any other Error for caller-default retries.
 */

import { sleep } from './fetcher.mjs';

export { sleep };

/**
 * Convert a Retry-After header to milliseconds.
 * Accepts: integer seconds (e.g. "9"), or HTTP-date.
 * Returns null when missing or unparseable.
 */
export function parseRetryAfter(headerValue) {
  if (headerValue === null || headerValue === undefined || headerValue === '') return null;
  const str = String(headerValue).trim();
  const seconds = Number.parseInt(str, 10);
  if (Number.isFinite(seconds) && /^\d+$/.test(str) && seconds > 0) return seconds * 1000;
  const dateMs = Date.parse(str);
  if (Number.isFinite(dateMs)) {
    const delta = dateMs - Date.now();
    return delta > 0 ? delta : 0;
  }
  return null;
}

/**
 * Marker error class for HTTP 429 responses participating in withRetry.
 * Set retryAfterMs to the server's recommended wait (or null to use defaults).
 */
export class RateLimitError extends Error {
  constructor(retryAfterMs, body) {
    super(body ? `HTTP 429 Too Many Requests: ${body}` : 'HTTP 429 Too Many Requests');
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * withRetry — invoke fn() up to maxAttempts times, sleeping between attempts.
 *
 * @template T
 * @param {(ctx: { attempt: number }) => Promise<T>} fn
 * @param {object} [opts]
 * @param {number} [opts.maxAttempts=3]
 * @param {number} [opts.baseDelayMs=2000]    Default delay; multiplied by 2^(attempt-1) when exponential.
 * @param {number} [opts.maxDelayMs=60000]
 * @param {boolean} [opts.exponential=false]  When true, delay = baseDelayMs * 2^(attempt-1). When false, flat baseDelayMs.
 * @param {(err: Error, attempt: number) => boolean} [opts.shouldRetry]
 * @param {(err: Error, attempt: number) => number | null} [opts.delayFor]
 *        Returning a number overrides the computed delay. Returning null falls back to backoff/baseDelay.
 *        RateLimitError.retryAfterMs is honored automatically when delayFor is not supplied.
 * @param {(err: Error, attempt: number, waitMs: number) => void} [opts.onRetry]
 * @returns {Promise<T>}
 */
export async function withRetry(fn, opts = {}) {
  const {
    maxAttempts = 3,
    baseDelayMs = 2000,
    maxDelayMs = 60_000,
    exponential = false,
    shouldRetry = () => true,
    delayFor,
    onRetry,
  } = opts;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn({ attempt });
    } catch (err) {
      lastError = err;
      if (attempt >= maxAttempts || !shouldRetry(err, attempt)) throw err;

      let waitMs = null;
      if (typeof delayFor === 'function') waitMs = delayFor(err, attempt);
      if (waitMs === null || waitMs === undefined) {
        if (err instanceof RateLimitError && Number.isFinite(err.retryAfterMs)) {
          waitMs = err.retryAfterMs;
        } else {
          waitMs = exponential ? baseDelayMs * 2 ** (attempt - 1) : baseDelayMs;
        }
      }
      waitMs = Math.min(Math.max(0, waitMs), maxDelayMs);

      if (onRetry) onRetry(err, attempt, waitMs);
      await sleep(waitMs);
    }
  }
  throw lastError;
}
