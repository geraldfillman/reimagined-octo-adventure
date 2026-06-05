// Synthesis bridge — invokes domain agents (16_Agents/*) via chatJson and
// renders their structured output into ingestion-contract-compliant markdown
// reports under World_Machine/Reports/.
//
// Design:
//   - Agents return STRUCTURED JSON (stance, watch_items, gate_delta_candidates, open_questions).
//   - This bridge owns the prompt envelope, JSON schema, and markdown rendering.
//   - Per-agent role descriptions live below; can be overridden by a
//     16_Agents/<Name>/_prompt.md file if present.
//   - Graceful skip if no LLM provider is configured (chatJson returns skipped:true).

import { readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { existsSync } from 'node:fs';

import { chatJson } from './llm-router.mjs';
import { writeNote } from './markdown.mjs';
import { getEngineRoot, getWorldMachineRoot } from './config.mjs';

const SYNTHESIS_SCHEMA = `{
  "stance": "string — one paragraph; current stance for this slot's scope",
  "watch_items": [
    { "item": "string", "rationale": "string" }
  ],
  "gate_delta_candidates": [
    {
      "row": "string — matches a row in World_Machine/_Inbox/Market Positioning Ledger.md",
      "from_gate": 0,
      "to_gate": 1,
      "reason": "string",
      "trigger_evidence_paths": ["required only when to_gate is 3"],
      "primary_underlying": "required only when to_gate is 3",
      "directional_verdict": "required only when to_gate is 3",
      "confidence_pct": "optional number when to_gate is 3",
      "refutation_reasoning": "required only when to_gate is 3"
    }
  ],
  "open_questions": ["string"]
}`;

// Per-agent role descriptions. Add new agents here or override via 16_Agents/<Name>/_prompt.md.
const AGENT_ROLES = Object.freeze({
  'Macro Agent':       'Own macro regime evidence: rates, inflation, liquidity, credit, treasury, bridge indicators.',
  'Market Agent':      'Own equity tape, breadth, sector flow, index gamma, and short-horizon market structure.',
  'Positioning Agent': 'Own crowding, positioning ledger reconciliation, gate transitions, dealer gamma read.',
  'Thesis Agent':      'Own active thesis rows in the Positioning Ledger: confirm or invalidate against today\'s evidence.',
  'Sectors Agent':     'Own sector rotation, intra-sector dispersion, and theme-level confluence.',
  'News Agent':        'Own narrative tracking, catalyst windows, and event-driven setups.',
});

const AGENT_SLUG = (name) => name.toLowerCase().replace(/\s+agent$/, '').replace(/\s+/g, '-');

const STANCE_RULES = `
Strategy expression rules (from AGENTS.md):
- Assume no active position unless explicitly noted. Use "stand aside", "prepare a fresh entry",
  "avoid new entry", "define a new hedge candidate", or "wait for trigger confirmation".
- Do NOT use position-management verbs: reduce, trim, hold, stay long, add, hedge exposure.
- Every gate_delta_candidate must include a clear reason tied to evidence in this slot's outputs.
- Gate 2->3 candidates must also include trigger_evidence_paths, primary_underlying,
  directional_verdict, confidence_pct when available, and refutation_reasoning.
- Do not propose Gate 3->4. Outcome labels are applied only by market-positioning-outcomes --apply.
`;

async function loadCustomPrompt(agentName) {
  const path = join(getEngineRoot(), '16_Agents', agentName, '_prompt.md');
  if (!existsSync(path)) return null;
  return readFile(path, 'utf8');
}

function buildMessages({ agent, slot, runId, outputPaths, customPrompt }) {
  const role = customPrompt ?? AGENT_ROLES[agent] ?? `Domain agent: ${agent}`;
  const system = `You are the ${agent} in a multi-agent trading research vault.
${role}

Output STRICT JSON matching this schema (no prose, no markdown fences):
${SYNTHESIS_SCHEMA}

${STANCE_RULES}`;

  const userBody = `Slot: ${slot.key} (${slot.label}) — run_id ${runId}.
Evidence paths produced this slot (read these if needed; paths are relative to the My_Data vault root):
${outputPaths.map(p => `- ${p}`).join('\n') || '(no puller outputs this run)'}

Active Positioning Ledger lives at: World_Machine/_Inbox/Market Positioning Ledger.md
Position blocks at:                  World_Machine/_Inbox/Market Positioning Ledger - Positions.md

Task:
1. Produce one-paragraph stance for your domain.
2. List up to 3 watch_items (item + rationale).
3. Propose gate_delta_candidates for any ledger row whose evidence shifted this slot.
4. List open_questions worth resolving before the next slot.

Return JSON only.`;

  return [
    { role: 'system', content: system },
    { role: 'user',   content: userBody },
  ];
}

function renderMarkdown({ agent, slot, runId, json }) {
  const slotKey = slot.key;
  const slotLabel = slot.label;
  const date = new Date().toISOString().slice(0, 10);
  const slug = AGENT_SLUG(agent);

  const lines = [];
  lines.push('---');
  lines.push(`type: ${slotKey === 'S6' ? 'eod-report' : `${slotLabel.toLowerCase().replace(/\W+/g, '-')}-snapshot`}`);
  lines.push('source_vault: My_Data');
  lines.push(`generated_by: ${slotKey}`);
  lines.push(`generator_script: scripts/agents/routine-runner.mjs#${slug}`);
  lines.push(`created: ${date}`);
  lines.push(`slot_run_id: ${runId}`);
  lines.push('signal_status: candidate');
  lines.push('tags:');
  lines.push('  - reports');
  lines.push('  - automation');
  lines.push(`  - ${slug}`);
  lines.push('---');
  lines.push('');
  lines.push(`# ${agent} — ${slotLabel} (${date})`);
  lines.push('');
  lines.push('## Stance');
  lines.push('');
  lines.push(json.stance ?? '_(no stance returned)_');
  lines.push('');
  lines.push('## Watch Items');
  lines.push('');
  if (json.watch_items?.length) {
    for (const w of json.watch_items) lines.push(`- **${w.item}** — ${w.rationale}`);
  } else {
    lines.push('_(none)_');
  }
  lines.push('');
  lines.push('## Gate Δ Candidates');
  lines.push('');
  if (json.gate_delta_candidates?.length) {
    lines.push('| Row | From | To | Reason |');
    lines.push('|---|---:|---:|---|');
    for (const g of json.gate_delta_candidates) {
      lines.push(`| ${g.row} | ${g.from_gate} | ${g.to_gate} | ${g.reason} |`);
    }
  } else {
    lines.push('_(none)_');
  }
  lines.push('');
  lines.push('## Open Questions');
  lines.push('');
  if (json.open_questions?.length) {
    for (const q of json.open_questions) lines.push(`- ${q}`);
  } else {
    lines.push('_(none)_');
  }
  lines.push('');
  return lines.join('\n');
}

function reportPath({ slot, agent, date = new Date().toISOString().slice(0, 10) }) {
  const wmRoot = getWorldMachineRoot();
  const cadenceDir = SLOT_TO_CADENCE_DIR[slot.key] ?? 'Daily';
  return join(wmRoot, 'Reports', cadenceDir, `${date}-${AGENT_SLUG(agent)}.md`);
}

const SLOT_TO_CADENCE_DIR = Object.freeze({
  S1: 'Premarket',
  S2: 'Daily',
  S3: 'Midday',
  S4: 'Preclose',
  S5: 'Daily',
  S6: 'EOD',
});

/**
 * Invoke one synthesis agent. Returns { status, outputs, data, provider, note }.
 * Statuses: 'ok' | 'skipped-no-llm' | 'error'
 */
export async function invokeAgent({ agent, slot, runId, outputPaths, prefer }) {
  let customPrompt = null;
  try { customPrompt = await loadCustomPrompt(agent); } catch { /* fall through */ }

  const messages = buildMessages({ agent, slot, runId, outputPaths, customPrompt });

  let result;
  try {
    result = await chatJson({ messages, temperature: 0.1, maxTokens: 1200, prefer });
  } catch (err) {
    return { status: 'error', outputs: [], note: `llm-error: ${err.message.slice(0, 160)}` };
  }

  if (result?.skipped) {
    return { status: 'skipped-no-llm', outputs: [], note: result.reason ?? 'no provider configured' };
  }
  if (!result?.ok) {
    return { status: 'error', outputs: [], note: result.error ?? 'llm returned not-ok' };
  }

  const path = reportPath({ slot, agent });
  const data = result.data ?? {};
  const md = renderMarkdown({ agent, slot, runId, json: data });
  const provider = result.provider ?? 'unknown';
  try {
    writeNote(path, md); // emits OUTPUT: automatically
    return { status: 'ok', outputs: [path], data, provider, note: `provider=${provider} model=${result.model ?? '?'}` };
  } catch (err) {
    return { status: 'error', outputs: [], data, provider, note: `write-failed: ${err.message.slice(0, 160)}` };
  }
}

export function relPath(absPath) {
  return relative(getEngineRoot(), absPath).split(sep).join('/');
}
