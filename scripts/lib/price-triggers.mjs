/**
 * price-triggers.mjs — price-based thesis-reconsideration triggers.
 *
 * Vault extension of the Corporate Health, Integrity & Market-Behavior
 * Framework §9 (see §9.4 in 04_Reference/Corporate_Health_Integrity_Framework.md).
 *
 * A trigger is an INVESTIGATION prompt, not a trade signal (§9.2: "prompts,
 * not automatic trading rules"): breaching a band means the review's thesis
 * goes back on the desk — §17 re-run — not that anything is bought or sold.
 * Defaults are mechanical (−20% ≈ the §9.2 drawdown prompt; +25% is where
 * Pattern C valuation risk compounds) and are meant to be overridden with
 * the researcher's own valuation-informed levels in the review note.
 *
 * Pure functions only — fetching and note writing live in
 * scripts/pullers/edgar-triggers.mjs.
 */

export const DEFAULT_DOWNSIDE_PCT = 20; // §9.2: ~20% drawdown deserves a specific explanation
export const DEFAULT_UPSIDE_PCT = 25;   // Pattern C prompt: quality already paid for

const round2 = n => Math.round(n * 100) / 100;

/** Mechanical default band around the review-date price. Null on bad input. */
export function computeDefaultTriggers(price, { downPct = DEFAULT_DOWNSIDE_PCT, upPct = DEFAULT_UPSIDE_PCT } = {}) {
  const p = Number(price);
  if (!Number.isFinite(p) || p <= 0) return null;
  return Object.freeze({
    low: round2(p * (1 - downPct / 100)),
    high: round2(p * (1 + upPct / 100)),
  });
}

/** Where the current price sits relative to the stored band. */
export function classifyTriggerState(current, low, high) {
  const c = Number(current);
  if (!Number.isFinite(c) || c <= 0) return null;
  // null/undefined must read as "no bound", not Number(null) === 0.
  const lo = low == null ? NaN : Number(low);
  const hi = high == null ? NaN : Number(high);
  if (Number.isFinite(lo) && lo > 0 && c <= lo) return 'below-low';
  if (Number.isFinite(hi) && hi > 0 && c >= hi) return 'above-high';
  if (!Number.isFinite(lo) && !Number.isFinite(hi)) return null;
  return 'within';
}

/** Last close from an oldest→newest daily price array (yahoo-client shape). */
export function latestClose(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return null;
  for (let i = prices.length - 1; i >= 0; i--) {
    const close = Number(prices[i]?.close);
    if (Number.isFinite(close) && close > 0) return close;
  }
  return null;
}

const TRIGGER_KEYS = ['price_at_review', 'reconsider_price_low', 'reconsider_price_high'];

/**
 * Insert or update the price-trigger frontmatter fields in a review note's
 * raw text. Anchors on the `markers_pull:` line (present in every health
 * review). Pure string transform — returns the new text, or null when the
 * note has no frontmatter anchor to attach to.
 */
export function upsertPriceTriggerFields(noteText, { price, low, high }) {
  if (typeof noteText !== 'string' || !noteText.startsWith('---')) return null;
  const endOfFrontmatter = noteText.indexOf('\n---', 3);
  if (endOfFrontmatter === -1) return null;

  let head = noteText.slice(0, endOfFrontmatter);
  const tail = noteText.slice(endOfFrontmatter);

  // Drop any existing trigger lines, then re-insert as one block.
  head = head
    .split('\n')
    .filter(line => !TRIGGER_KEYS.some(k => line.startsWith(`${k}:`)))
    .join('\n');

  const block = [
    `price_at_review: ${price}`,
    `reconsider_price_low: ${low}`,
    `reconsider_price_high: ${high}`,
  ].join('\n');

  const anchor = head.split('\n').find(line => line.startsWith('markers_pull:'));
  if (!anchor) return null;
  return head.replace(anchor, `${anchor}\n${block}`) + tail;
}
