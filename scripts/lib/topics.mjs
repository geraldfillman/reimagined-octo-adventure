/**
 * topics.mjs — Topic registry loader
 *
 * Reads scripts/config/topics.yaml and provides helpers for resolving
 * which topics are active based on CLI flags, and which topics each
 * puller supports.
 *
 * The actual query/condition strings remain in each puller — they are
 * API-specific. This module owns topic identity and puller eligibility.
 *
 * Usage:
 *   import { getTopicsForPuller, flagsToTopics } from '../lib/topics.mjs';
 *
 *   // Get all topic keys supported by this puller
 *   const supported = getTopicsForPuller('arxiv');
 *   // → ['drones', 'defense', 'space', 'amr', 'psychedelics', ...]
 *
 *   // Resolve which topics are active from CLI flags
 *   const active = flagsToTopics(flags, 'arxiv');
 *   // → ['drones', 'amr']  (when --drones --amr were passed)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const REGISTRY_PATH = join(import.meta.dirname, '..', 'config', 'topics.yaml');

/**
 * Parse a minimal YAML structure — handles only the flat key: value
 * and list formats used in topics.yaml. Not a general YAML parser.
 */
function parseTopicsYaml(text) {
  const topics = {};
  let currentTopic = null;
  let inEnabledPullers = false;

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (!line || line.startsWith('#')) continue;

    // Top-level "topics:" key
    if (line === 'topics:') continue;

    // Topic key: "  drones:"
    const topicMatch = line.match(/^  (\w+):$/);
    if (topicMatch) {
      currentTopic = topicMatch[1];
      topics[currentTopic] = { label: '', enabled_pullers: [] };
      inEnabledPullers = false;
      continue;
    }

    if (!currentTopic) continue;

    // label: "    label: Drones & Autonomous Aircraft"
    const labelMatch = line.match(/^    label:\s+(.+)$/);
    if (labelMatch) {
      topics[currentTopic].label = labelMatch[1];
      continue;
    }

    // enabled_pullers inline: "    enabled_pullers: [arxiv, sec]"
    const pullersInline = line.match(/^    enabled_pullers:\s+\[([^\]]+)\]/);
    if (pullersInline) {
      topics[currentTopic].enabled_pullers = pullersInline[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      inEnabledPullers = false;
      continue;
    }

    // enabled_pullers block start: "    enabled_pullers:"
    if (line.match(/^    enabled_pullers:\s*$/)) {
      inEnabledPullers = true;
      continue;
    }

    // List item under enabled_pullers: "      - arxiv"
    if (inEnabledPullers) {
      const itemMatch = line.match(/^      -\s+(\w+)/);
      if (itemMatch) {
        topics[currentTopic].enabled_pullers.push(itemMatch[1]);
      }
    }
  }

  return topics;
}

let _cache = null;

function loadRegistry() {
  if (_cache) return _cache;
  const text = readFileSync(REGISTRY_PATH, 'utf8');
  _cache = parseTopicsYaml(text);
  return _cache;
}

/**
 * Returns all topics from the registry.
 * @returns {Record<string, { label: string, enabled_pullers: string[] }>}
 */
export function getTopics() {
  return loadRegistry();
}

/**
 * Returns topic keys that the given puller supports.
 * @param {string} pullerName
 * @returns {string[]}
 */
export function getTopicsForPuller(pullerName) {
  const registry = loadRegistry();
  return Object.entries(registry)
    .filter(([, def]) => def.enabled_pullers.includes(pullerName))
    .map(([key]) => key);
}

/**
 * Resolves which topic keys are active based on CLI flags.
 * If flags.all is truthy, returns all topics supported by this puller.
 * Otherwise returns the subset that matches active flags.
 *
 * @param {Record<string, unknown>} flags  — parsed CLI flags
 * @param {string} pullerName              — e.g. 'arxiv'
 * @returns {string[]}                     — active topic keys
 */
export function flagsToTopics(flags, pullerName) {
  const supported = getTopicsForPuller(pullerName);
  if (flags.all) return supported;
  return supported.filter(key => flags[key]);
}
