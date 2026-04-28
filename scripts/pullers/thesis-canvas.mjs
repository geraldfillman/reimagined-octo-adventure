/**
 * thesis-canvas.mjs — Auto-generate a JSON Canvas visualizing all active theses.
 *
 * Usage:
 *   node run.mjs thesis canvas
 *   node run.mjs thesis canvas --all        (include inactive theses)
 *
 * Output: 10_Theses/Thesis Map.canvas
 *
 * Layout:
 *   - Thesis nodes arranged in a 4-column grid, sorted by conviction desc then name
 *   - Group nodes frame each conviction tier (high / medium / low)
 *   - Conviction colors: high=4 (green), medium=3 (yellow), low=6 (purple), inactive=gray
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const THESES_DIR = join(VAULT_ROOT, '10_Theses');
const OUTPUT = join(THESES_DIR, 'Thesis Map.canvas');

// Node dimensions and grid layout
const NODE_W = 380;
const NODE_H = 180;
const COL_GAP = 40;
const ROW_GAP = 40;
const COLS = 4;
const GROUP_PAD = 30;
const GROUP_HEADER = 60;
const GROUP_GAP = 60;

const CONVICTION_COLOR = { high: '4', medium: '3', low: '6' };
const CONVICTION_ORDER = ['high', 'medium', 'low'];

/** Stable 16-char hex ID from a string (djb2 hash, two passes) */
function stableId(str) {
  let h1 = 5381, h2 = 52711;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = ((h1 << 5) + h1) ^ c;
    h2 = ((h2 << 5) + h2) ^ c;
  }
  const toHex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(h1) + toHex(h2);
}

/** Extract YAML frontmatter scalar value for a key */
function fmValue(content, key) {
  const m = content.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, 'm'));
  return m ? m[1].trim() : '';
}

/**
 * Extract YAML frontmatter inline array for a key.
 * Handles: key: ["[[A]]", "[[B]]"] and key:\n  - "[[A]]"
 */
function fmArray(content, key) {
  // Inline: key: ["a", "b"]
  const inline = content.match(new RegExp(`^${key}:\\s*\\[([^\\]]+)\\]`, 'm'));
  if (inline) {
    return inline[1].split(',')
      .map(s => s.trim().replace(/^["']|["']$/g, '').replace(/^\[\[|\]\]$/g, '').trim())
      .filter(Boolean);
  }
  // Multi-line block: key:\n  - item
  const blockStart = content.search(new RegExp(`^${key}:\\s*$`, 'm'));
  if (blockStart === -1) return [];
  const block = content.slice(blockStart).split('\n').slice(1);
  const items = [];
  for (const line of block) {
    if (!line.match(/^\s+-\s/)) break;
    items.push(line.replace(/^\s+-\s*/, '').replace(/^["']|["']$/g, '').replace(/^\[\[|\]\]$/g, '').trim());
  }
  return items;
}

/** Parse thesis notes from 10_Theses/ */
function loadTheses(includeAll) {
  const files = readdirSync(THESES_DIR).filter(f => extname(f) === '.md');
  return files.map(f => {
    const content = readFileSync(join(THESES_DIR, f), 'utf8');
    return {
      file: basename(f, '.md'),
      name: fmValue(content, 'name') || basename(f, '.md'),
      status: fmValue(content, 'status'),
      conviction: fmValue(content, 'conviction') || 'low',
      timeframe: fmValue(content, 'timeframe'),
      monitor_status: fmValue(content, 'monitor_status'),
      allocation_priority: fmValue(content, 'allocation_priority'),
      supporting_regimes: fmArray(content, 'supporting_regimes'),
    };
  }).filter(t => includeAll || t.status === 'Active');
}

export async function run(flags = {}) {
  const includeAll = Boolean(flags.all);
  const theses = loadTheses(includeAll);

  if (theses.length === 0) {
    console.log('📭 No active theses found.');
    return;
  }

  // Sort: conviction order → name alphabetically
  theses.sort((a, b) => {
    const ci = CONVICTION_ORDER.indexOf(a.conviction) - CONVICTION_ORDER.indexOf(b.conviction);
    return ci !== 0 ? ci : a.name.localeCompare(b.name);
  });

  const nodes = [];
  const edges = [];

  // Group theses by conviction
  const byConviction = {};
  for (const t of theses) {
    const key = CONVICTION_ORDER.includes(t.conviction) ? t.conviction : 'low';
    (byConviction[key] = byConviction[key] || []).push(t);
  }

  let cursorY = GROUP_PAD;
  const thesisNodeMap = new Map(); // thesis name → nodeId

  for (const conviction of CONVICTION_ORDER) {
    const group = byConviction[conviction];
    if (!group || group.length === 0) continue;

    const rows = Math.ceil(group.length / COLS);
    const groupW = COLS * NODE_W + (COLS - 1) * COL_GAP + GROUP_PAD * 2;
    const groupH = GROUP_HEADER + rows * NODE_H + (rows - 1) * ROW_GAP + GROUP_PAD;
    const groupId = stableId(`group-${conviction}`);

    // Group node
    nodes.push({
      id: groupId,
      type: 'group',
      x: 0,
      y: cursorY,
      width: groupW,
      height: groupH,
      label: `${conviction.charAt(0).toUpperCase() + conviction.slice(1)} Conviction`,
      color: CONVICTION_COLOR[conviction],
    });

    // Thesis nodes inside the group
    group.forEach((t, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = GROUP_PAD + col * (NODE_W + COL_GAP);
      const y = cursorY + GROUP_HEADER + row * (NODE_H + ROW_GAP);
      const nodeId = stableId(t.name);

      const monitorBadge = t.monitor_status ? ` · ${t.monitor_status}` : '';
      const timeframeBadge = t.timeframe ? ` · ${t.timeframe}` : '';
      const text = `## ${t.name}\n\n**Conviction:** ${t.conviction}${timeframeBadge}${monitorBadge}\n\n[[${t.file}]]`;

      nodes.push({
        id: nodeId,
        type: 'text',
        x,
        y,
        width: NODE_W,
        height: NODE_H,
        color: CONVICTION_COLOR[conviction],
        text,
      });
      thesisNodeMap.set(t.name, nodeId);
    });

    cursorY += groupH + GROUP_GAP;
  }

  // ── Regime nodes (row below all conviction groups) ──────────────────────
  const allRegimes = [...new Set(theses.flatMap(t => t.supporting_regimes))].sort();
  const regimeNodeMap = new Map(); // regime name → nodeId
  const REGIME_W = 300;
  const REGIME_H = 80;
  const REGIME_GAP = 30;
  const REGIME_COLS = 4;
  const REGIME_COLOR = '2';

  allRegimes.forEach((regime, i) => {
    const col = i % REGIME_COLS;
    const row = Math.floor(i / REGIME_COLS);
    const x = GROUP_PAD + col * (REGIME_W + REGIME_GAP);
    const y = cursorY + row * (REGIME_H + REGIME_GAP);
    const nodeId = stableId(`regime-${regime}`);
    nodes.push({
      id: nodeId,
      type: 'text',
      x,
      y,
      width: REGIME_W,
      height: REGIME_H,
      color: REGIME_COLOR,
      text: `**${regime}**`,
    });
    regimeNodeMap.set(regime, nodeId);
  });

  // ── Edges: each thesis → its supporting regimes ────────────────────────
  for (const t of theses) {
    const fromId = thesisNodeMap.get(t.name);
    if (!fromId) continue;
    for (const regime of t.supporting_regimes) {
      const toId = regimeNodeMap.get(regime);
      if (!toId) continue;
      edges.push({
        id: stableId(`edge-${t.name}-${regime}`),
        fromNode: fromId,
        toNode: toId,
        fromSide: 'bottom',
        toSide: 'top',
      });
    }
  }

  const canvas = { nodes, edges };
  writeFileSync(OUTPUT, JSON.stringify(canvas, null, 2), 'utf8');
  console.log(`🗺️  Thesis Map canvas written → 10_Theses/Thesis Map.canvas`);
  console.log(`   ${theses.length} theses · ${allRegimes.length} regime nodes · ${edges.length} edges`);
}
