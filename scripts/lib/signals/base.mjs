/**
 * signals/base.mjs — Core signal factory
 *
 * Provides the Signal typedef and the internal createSignal factory used by
 * all domain modules. Not re-exported from the barrel index.
 */

/**
 * @typedef {object} Signal
 * @property {string} id
 * @property {string} name
 * @property {string} domain
 * @property {string} severity — 'watch' | 'alert' | 'critical'
 * @property {number} value — the actual measured value
 * @property {number} threshold — the threshold that was crossed
 * @property {string} message — human-readable description
 * @property {string[]} implications — actionable investment implications
 * @property {string[]} related_domains — other domains affected
 */

function createSignal(fields) {
  return Object.freeze({
    id: fields.id,
    name: fields.name,
    domain: fields.domain,
    severity: fields.severity,
    value: fields.value,
    threshold: fields.threshold,
    message: fields.message,
    implications: Object.freeze([...fields.implications]),
    related_domains: Object.freeze([...(fields.related_domains || [])]),
    timestamp: new Date().toISOString(),
  });
}

export { createSignal };
