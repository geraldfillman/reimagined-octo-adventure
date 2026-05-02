/**
 * agent-registry.mjs — Agent manifest loader and query library.
 *
 * Loads 16_Agents/agent-manifest.json and provides typed query helpers used
 * by agent-run.mjs (run ordering), streamline-report.mjs (handoff population),
 * and server.mjs (lineage API).
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MANIFEST_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..', '..', '16_Agents', 'agent-manifest.json'
);

let _cached = null;

// ─── Loader ──────────────────────────────────────────────────────────────────

export async function loadManifest() {
  if (_cached) return _cached;
  if (!existsSync(MANIFEST_PATH)) {
    console.warn('agent-registry: agent-manifest.json not found at', MANIFEST_PATH);
    return { manifest_version: 0, agents: [] };
  }
  try {
    _cached = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
    return _cached;
  } catch (err) {
    console.warn('agent-registry: failed to parse manifest —', err.message);
    return { manifest_version: 0, agents: [] };
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Return all agents from the manifest. */
export async function getAllAgents() {
  const manifest = await loadManifest();
  return manifest.agents ?? [];
}

/** Return a single agent by ID, or null. */
export async function getAgent(id) {
  const agents = await getAllAgents();
  return agents.find(a => a.id === id) ?? null;
}

/**
 * Resolve agents in run order using a simple topological sort.
 * Agents without dependencies run first; the orchestrator runs last.
 *
 * @param {string[]} [filterIds] — if provided, only include these agent IDs (plus orchestrator)
 * @returns {Promise<Array>} agents in dependency-safe order
 */
export async function resolveRunOrder(filterIds = null) {
  const agents = await getAllAgents();
  const subset = filterIds
    ? agents.filter(a => filterIds.includes(a.id) || a.id === 'orchestrator')
    : agents;

  // Kahn's algorithm over depends_on edges
  const idSet  = new Set(subset.map(a => a.id));
  const inDeg  = new Map(subset.map(a => [a.id, 0]));
  const graph  = new Map(subset.map(a => [a.id, []]));

  for (const agent of subset) {
    for (const dep of (agent.depends_on ?? [])) {
      if (!idSet.has(dep)) continue;
      graph.get(dep).push(agent.id);
      inDeg.set(agent.id, (inDeg.get(agent.id) ?? 0) + 1);
    }
  }

  const queue  = [...inDeg.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  const sorted = [];

  while (queue.length) {
    const id = queue.shift();
    sorted.push(id);
    for (const next of (graph.get(id) ?? [])) {
      const deg = inDeg.get(next) - 1;
      inDeg.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  const byId = new Map(subset.map(a => [a.id, a]));
  return sorted.map(id => byId.get(id)).filter(Boolean);
}

/**
 * Find which agent owns a given output directory or file path.
 * Matches by checking if the path starts with any of the agent's output_dirs.
 *
 * @param {string} notePath — vault-relative path like "05_Data_Pulls/Market/..."
 * @returns {Promise<object|null>}
 */
export async function getAgentForOutput(notePath) {
  const agents = await getAllAgents();
  const normalized = notePath.replace(/\\/g, '/');
  return agents.find(a =>
    (a.output_dirs ?? []).some(dir => normalized.includes(dir.replace(/\\/g, '/')))
  ) ?? null;
}

/**
 * Find which agent owns a note based on its tags.
 *
 * @param {string[]} tags
 * @returns {Promise<object|null>}
 */
export async function getAgentByTags(tags) {
  if (!tags?.length) return null;
  const agents = await getAllAgents();
  const lower  = tags.map(t => String(t).toLowerCase());
  return agents.find(a =>
    (a.output_tags ?? []).some(tag => lower.includes(tag.toLowerCase()))
  ) ?? null;
}

/**
 * For a given puller script name, find its owning agent.
 *
 * @param {string} pullerName — e.g. "auction-features"
 * @returns {Promise<object|null>}
 */
export async function getAgentByPuller(pullerName) {
  const agents = await getAllAgents();
  return agents.find(a => (a.pullers ?? []).includes(pullerName)) ?? null;
}
