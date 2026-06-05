#!/usr/bin/env node
/**
 * regime-bootstrap.mjs — Phase D regime-aware ledger seeding.
 *
 * Stage 1 (`--stage=classify`):
 *   Reads the latest pulls from _state/run-state.json + a few key files,
 *   asks the Regime Classifier agent to produce a strict-JSON regime card,
 *   renders it to World_Machine/Reports/Regime/<date>-regime-card.md.
 *   STOPS HERE for user review.
 *
 * Stage 2 (`--stage=thesis`):
 *   Reads the regime card, asks the Thesis Generator agent to propose
 *   3–7 thesis candidates fitted to the current regime. Each candidate
 *   carries the full Position Block schema.
 *
 * Stage 3 (`--stage=commit`):
 *   Applies the approved theses to:
 *     - World_Machine/_Inbox/Market Positioning Ledger.md (Active Ledger rows)
 *     - World_Machine/_Inbox/Market Positioning Ledger - Positions.md (Position blocks)
 *   Logs the action.
 *
 * Usage:
 *   node scripts/agents/regime-bootstrap.mjs --stage=classify
 *   node scripts/agents/regime-bootstrap.mjs --stage=thesis
 *   node scripts/agents/regime-bootstrap.mjs --stage=commit
 *   node scripts/agents/regime-bootstrap.mjs --stage=classify --llm=claude-code
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

import { chatJson } from '../lib/llm-router.mjs';
import { writeNote } from '../lib/markdown.mjs';
import { getEngineRoot, getWorldMachineRoot } from '../lib/config.mjs';

const STATE_PATH      = join(getEngineRoot(), '_state', 'run-state.json');
const LOG_PATH        = join(getEngineRoot(), '_state', 'run-log.md');
const REGIME_DIR      = join(getWorldMachineRoot(), 'Reports', 'Regime');
const TODAY           = new Date().toISOString().slice(0, 10);
const REGIME_CARD     = join(REGIME_DIR, `${TODAY}-regime-card.md`);
const THESIS_DRAFT    = join(REGIME_DIR, `${TODAY}-thesis-draft.md`);
const LEDGER_PATH     = join(getWorldMachineRoot(), '_Inbox', 'Market Positioning Ledger.md');
const POSITIONS_PATH  = join(getWorldMachineRoot(), '_Inbox', 'Market Positioning Ledger - Positions.md');

const args = parseArgs(process.argv.slice(2));
main().catch(err => { console.error(err); process.exit(1); });

function parseArgs(argv) {
  const out = { stage: null, llm: null, dryRun: false };
  for (const a of argv) {
    if (a.startsWith('--stage='))    out.stage = a.slice(8);
    else if (a.startsWith('--llm=')) out.llm = a.slice(6);
    else if (a === '--dry-run')      out.dryRun = true;
  }
  if (!['classify', 'thesis', 'commit'].includes(out.stage)) {
    console.error('Missing --stage=classify|thesis|commit');
    process.exit(1);
  }
  return out;
}

const REGIME_SCHEMA = `{
  "as_of_date": "YYYY-MM-DD",
  "macro_regime": {
    "label": "restrictive | neutral | accommodative",
    "liquidity_tier": "tight | normal | abundant",
    "evidence": ["string referencing a pull output path"]
  },
  "volatility_regime": {
    "label": "compressed | normal | elevated | stressed",
    "vix_context": "string",
    "evidence": ["string"]
  },
  "breadth_regime": {
    "label": "broad | mixed | narrow | distribution",
    "evidence": ["string"]
  },
  "rates_curve": {
    "label": "steepening | flattening | inverted | normal",
    "evidence": ["string"]
  },
  "dollar_credit": {
    "dollar": "strong | neutral | weak",
    "credit_spreads": "tight | widening | stressed",
    "evidence": ["string"]
  },
  "dominant_catalysts_7d": [
    { "date": "YYYY-MM-DD", "event": "string", "asset_class_impact": ["equities","rates","fx","commodities"] }
  ],
  "dominant_catalysts_30d": [
    { "date": "YYYY-MM-DD", "event": "string", "asset_class_impact": ["string"] }
  ],
  "regime_summary": "string — 3-5 sentences describing the current regime in plain language",
  "stance_implications": [
    { "asset_class": "string", "implied_view": "string", "key_caveat": "string" }
  ],
  "confidence": "low | medium | high",
  "data_completeness_notes": "string — flag any missing or stale evidence"
}`;

const THESIS_SCHEMA = `{
  "regime_summary_echo": "string — paraphrase the regime card briefly",
  "thesis_candidates": [
    {
      "slug": "kebab-case-slug",
      "name": "string — short readable name (max 60 chars)",
      "stance": "Observe | Prepare | Press | Fade | Stand aside",
      "gate": 1,
      "direction_tag": "Upside | Downside | Neutral | Volatility",
      "purpose_tag": "Directional | Protection | Income | Volatility | Defined-Risk | Hedge",
      "position_reasoning": "string — 1 paragraph: why this thesis, why now, why this structure",
      "instrument": "string — underlying + expiry + strikes",
      "structure": "string — leg-by-leg with debit/credit",
      "entry": "string — trigger condition + price + required confirmation",
      "stop_invalidation": "string — hard stop or thesis-invalidation level",
      "target_1": "string — level + meaning",
      "target_2": "string — level + meaning",
      "max_loss": "string",
      "max_profit": "string",
      "reward_risk": "string — ratio at T1 and T2",
      "breakeven": "string",
      "sizing": "string — unit + tactical/core",
      "hold_window": "string",
      "conviction": "●○○○○ to ●●●●●",
      "correlation_note": "string",
      "exit_plan": "string",
      "catalyst_calendar": "string — hard dates governing theta/IV",
      "option_tag_stack": {
        "direction_exposure": "Upside | Downside | Neutral",
        "protection": "Yes (protective put, collar, OTM hedge) | No",
        "income": "Yes (covered call, CSP, credit spread) | No",
        "volatility_stance": "Long vol | Short vol | Vega-neutral",
        "defined_risk": "Yes (debit/credit spread, fly, condor) | No (naked, futures)"
      },
      "source_refs": ["My_Data/path/to/evidence.md"],
      "rationale_vs_regime": "string — explicitly how this fits the regime card"
    }
  ],
  "house_view_update": [
    { "asset_class": "Equities | Gold | Oil | Short-End Rates | Long-End Rates | Credit | Dollar",
      "view": "string",
      "key_driver": "string" }
  ]
}`;

const STANCE_RULES = `Strategy expression rules (AGENTS.md):
- Assume no active position unless explicitly noted. Use "stand aside", "prepare a fresh entry", "avoid new entry", "define a new hedge candidate", or "wait for trigger confirmation".
- Do NOT use position-management verbs (reduce, trim, hold, stay long, add, hedge exposure).
- Every thesis candidate must carry the full Position Block schema. Options structures must carry all five option tags.`;

async function loadEvidencePaths(maxAgeDays = 14) {
  const raw = await readFile(STATE_PATH, 'utf8');
  const state = JSON.parse(raw);
  const cutoff = Date.now() - (maxAgeDays * 86400000);
  const fresh = [];
  for (const [key, info] of Object.entries(state.sources ?? {})) {
    if (!info.last_run) continue;
    if (new Date(info.last_run).getTime() < cutoff) continue;
    if (info.last_status !== 'ok') continue;
    fresh.push({ key, last_run: info.last_run, hash: info.last_hash });
  }
  // Also pull recent slot history for context
  const recentSlots = (state.slot_history ?? []).slice(-10);
  const outputPaths = new Set();
  for (const s of recentSlots) {
    for (const r of s.results ?? []) {
      for (const p of r.outputPaths ?? []) {
        // Normalize to relative-ish paths
        const idx = p.indexOf('My_Data');
        outputPaths.add(idx >= 0 ? p.slice(idx) : p);
      }
    }
  }
  return { freshSources: fresh, outputPaths: [...outputPaths] };
}

async function readCustomPrompt(name) {
  const path = join(getEngineRoot(), '16_Agents', name, '_prompt.md');
  if (!existsSync(path)) return null;
  return readFile(path, 'utf8');
}

async function stageClassify() {
  console.log('[regime] Stage 1: classify');
  const { freshSources, outputPaths } = await loadEvidencePaths();
  if (freshSources.length === 0) {
    console.error('[regime] No fresh pulls found in _state/run-state.json. Run Phase C first.');
    process.exit(2);
  }
  console.log(`[regime] Found ${freshSources.length} fresh sources, ${outputPaths.length} output paths.`);

  const customPrompt = await readCustomPrompt('Regime Classifier');
  const system = `You are the Regime Classifier in a multi-agent trading research vault.
${customPrompt ?? 'Classify the current macro + market regime from the supplied evidence paths and a sober view of what the data tells us. Be specific. Avoid hedging language unless evidence genuinely conflicts.'}

Output STRICT JSON matching this schema (no prose, no markdown fences):
${REGIME_SCHEMA}

${STANCE_RULES}`;

  const userBody = `As-of date: ${TODAY}.

Fresh evidence sources (key, last_run, content hash):
${freshSources.map(s => `- ${s.key} | ${s.last_run} | ${s.hash ?? '-'}`).join('\n')}

Output paths from the most recent slot runs (read these if you need details):
${outputPaths.slice(0, 30).map(p => `- ${p}`).join('\n')}

Task:
1. Classify each regime dimension (macro, volatility, breadth, rates_curve, dollar_credit) with concrete evidence references.
2. Surface dominant catalysts in the next 7 and 30 days from federal-register / earnings / FOMC / NFP data.
3. Write a 3-5 sentence regime_summary in plain language.
4. List stance_implications by asset class.
5. State confidence and flag any data_completeness_notes.

Return JSON only.`;

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userBody },
  ];

  console.log('[regime] Invoking Regime Classifier via llm-router...');
  const res = await chatJson({ messages, temperature: 0.1, maxTokens: 2000, prefer: args.llm });
  if (res?.skipped) {
    console.error(`[regime] LLM skipped: ${res.reason}`);
    process.exit(3);
  }
  if (!res?.ok) {
    console.error(`[regime] LLM error: ${res?.error ?? 'unknown'}`);
    process.exit(3);
  }

  const card = res.data ?? {};
  await mkdir(REGIME_DIR, { recursive: true });
  const md = renderRegimeCard({ card, freshSources, outputPaths, provider: res.provider });
  writeNote(REGIME_CARD, md); // emits OUTPUT:
  console.log(`[regime] Regime card written: ${REGIME_CARD}`);

  // Persist raw JSON beside the card so stage 2 can re-read it without parsing markdown.
  const jsonPath = REGIME_CARD.replace(/\.md$/, '.json');
  await writeFile(jsonPath, JSON.stringify(card, null, 2), 'utf8');
  console.log(`[regime] Raw JSON: ${jsonPath}`);

  console.log('\n[regime] STOP. Review the regime card. When approved, run:');
  console.log(`  node scripts/agents/regime-bootstrap.mjs --stage=thesis`);
}

function renderRegimeCard({ card, freshSources, outputPaths, provider }) {
  const lines = [];
  lines.push('---');
  lines.push('type: regime-card');
  lines.push('source_vault: My_Data');
  lines.push('generated_by: regime-bootstrap');
  lines.push(`generator_script: scripts/agents/regime-bootstrap.mjs#classify`);
  lines.push(`provider: ${provider}`);
  lines.push(`created: ${TODAY}`);
  lines.push(`signal_status: candidate`);
  lines.push('tags:');
  lines.push('  - reports');
  lines.push('  - regime');
  lines.push('  - automation');
  lines.push('---');
  lines.push('');
  lines.push(`# Regime Card — ${TODAY}`);
  lines.push('');
  lines.push(`Generated by the Phase D Regime Classifier. **This is a candidate** — review before approving Stage 2 (thesis generation).`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(card.regime_summary ?? '_(missing)_');
  lines.push('');
  lines.push(`Confidence: **${card.confidence ?? '?'}**`);
  if (card.data_completeness_notes) lines.push(`\n> Data completeness: ${card.data_completeness_notes}`);
  lines.push('');

  const dim = (label, obj, fields) => {
    lines.push(`## ${label}`);
    lines.push('');
    if (!obj) { lines.push('_(missing)_\n'); return; }
    for (const f of fields) lines.push(`- **${f}:** ${obj[f] ?? '_(missing)_'}`);
    if (obj.evidence?.length) {
      lines.push('- **Evidence:**');
      for (const e of obj.evidence) lines.push(`  - ${e}`);
    }
    lines.push('');
  };
  dim('Macro regime',      card.macro_regime,      ['label', 'liquidity_tier']);
  dim('Volatility regime', card.volatility_regime, ['label', 'vix_context']);
  dim('Breadth regime',    card.breadth_regime,    ['label']);
  dim('Rates curve',       card.rates_curve,       ['label']);
  dim('Dollar / Credit',   card.dollar_credit,     ['dollar', 'credit_spreads']);

  lines.push('## Catalysts — next 7 days');
  lines.push('');
  if (card.dominant_catalysts_7d?.length) {
    lines.push('| Date | Event | Asset-class impact |');
    lines.push('|---|---|---|');
    for (const c of card.dominant_catalysts_7d) lines.push(`| ${c.date} | ${c.event} | ${(c.asset_class_impact ?? []).join(', ')} |`);
  } else { lines.push('_(none flagged)_'); }
  lines.push('');

  lines.push('## Catalysts — next 30 days');
  lines.push('');
  if (card.dominant_catalysts_30d?.length) {
    lines.push('| Date | Event | Asset-class impact |');
    lines.push('|---|---|---|');
    for (const c of card.dominant_catalysts_30d) lines.push(`| ${c.date} | ${c.event} | ${(c.asset_class_impact ?? []).join(', ')} |`);
  } else { lines.push('_(none flagged)_'); }
  lines.push('');

  lines.push('## Stance implications by asset class');
  lines.push('');
  if (card.stance_implications?.length) {
    lines.push('| Asset class | Implied view | Key caveat |');
    lines.push('|---|---|---|');
    for (const s of card.stance_implications) lines.push(`| ${s.asset_class} | ${s.implied_view} | ${s.key_caveat ?? ''} |`);
  } else { lines.push('_(none)_'); }
  lines.push('');

  lines.push('## Evidence base used');
  lines.push('');
  lines.push(`${freshSources.length} fresh sources, ${outputPaths.length} output paths.`);
  lines.push('');
  lines.push('<details><summary>Source list</summary>\n');
  for (const s of freshSources) lines.push(`- \`${s.key}\` — last_run ${s.last_run}`);
  lines.push('\n</details>');
  lines.push('');

  return lines.join('\n');
}

async function stageThesis() {
  console.log('[regime] Stage 2: thesis');
  const jsonPath = REGIME_CARD.replace(/\.md$/, '.json');
  if (!existsSync(jsonPath)) {
    console.error(`[regime] Regime card JSON not found at ${jsonPath}. Run --stage=classify first.`);
    process.exit(2);
  }
  const cardRaw = await readFile(jsonPath, 'utf8');
  const card = JSON.parse(cardRaw);

  const customPrompt = await readCustomPrompt('Thesis Generator');
  const system = `You are the Thesis Generator in a multi-agent trading research vault.
${customPrompt ?? 'Given a regime card, generate 3-7 thesis candidates fitted to the current regime. Each candidate must carry the full Position Block schema. Prefer defined-risk option structures where appropriate. Cite specific source paths.'}

Output STRICT JSON matching this schema (no prose, no markdown fences):
${THESIS_SCHEMA}

${STANCE_RULES}`;

  const userBody = `Regime card (full JSON):
${JSON.stringify(card, null, 2)}

Task:
1. Echo a brief regime summary so you've internalized it.
2. Generate 3 to 7 thesis candidates that fit THIS regime, not a generic universe. Each:
   - Has a slug (kebab-case, used as ledger row key and Position block anchor).
   - Carries the full Position Block schema.
   - Includes a rationale_vs_regime stating explicitly how it fits.
   - References source_refs from the evidence base.
   - Includes option_tag_stack if the structure uses options; if futures/spot only, set all five tags to a sensible value (e.g., "Direction Exposure: Upside, Protection: No, Income: No, Volatility Stance: Vega-neutral, Defined Risk: No (futures)").
3. Propose a House View update — 7 asset classes (Equities, Gold, Oil, Short-End Rates, Long-End Rates, Credit, Dollar).

Return JSON only.`;

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userBody },
  ];

  console.log('[regime] Invoking Thesis Generator via llm-router...');
  const res = await chatJson({ messages, temperature: 0.2, maxTokens: 4000, prefer: args.llm });
  if (res?.skipped) { console.error(`[regime] LLM skipped: ${res.reason}`); process.exit(3); }
  if (!res?.ok)     { console.error(`[regime] LLM error: ${res?.error ?? 'unknown'}`); process.exit(3); }

  const data = res.data ?? {};
  const md = renderThesisDraft({ data, provider: res.provider });
  writeNote(THESIS_DRAFT, md);

  const jsonOut = THESIS_DRAFT.replace(/\.md$/, '.json');
  await writeFile(jsonOut, JSON.stringify(data, null, 2), 'utf8');
  console.log(`[regime] Thesis draft: ${THESIS_DRAFT}`);
  console.log(`[regime] Raw JSON: ${jsonOut}`);
  console.log('\n[regime] STOP. Review the thesis draft. When approved, run:');
  console.log(`  node scripts/agents/regime-bootstrap.mjs --stage=commit`);
}

function renderThesisDraft({ data, provider }) {
  const lines = [];
  lines.push('---');
  lines.push('type: thesis-draft');
  lines.push(`provider: ${provider}`);
  lines.push(`created: ${TODAY}`);
  lines.push('signal_status: candidate');
  lines.push('tags: [reports, thesis, draft, automation]');
  lines.push('---\n');
  lines.push(`# Thesis Draft — ${TODAY}\n`);
  lines.push(`Generated by the Phase D Thesis Generator. Review before approving Stage 3 (commit).\n`);
  lines.push(`## Regime echo\n\n${data.regime_summary_echo ?? '_(missing)_'}\n`);
  lines.push(`## Thesis candidates (${data.thesis_candidates?.length ?? 0})\n`);
  for (const t of data.thesis_candidates ?? []) {
    lines.push(`### ${t.name} (\`${t.slug}\`) — ${t.stance} · Gate ${t.gate}\n`);
    lines.push(`**Position Reasoning.** ${t.position_reasoning}\n`);
    lines.push('| Field | Value |');
    lines.push('|---|---|');
    lines.push(`| Direction Tag | ${t.direction_tag} |`);
    lines.push(`| Purpose Tag | ${t.purpose_tag} |`);
    lines.push(`| Instrument | ${t.instrument} |`);
    lines.push(`| Structure | ${t.structure} |`);
    lines.push(`| Entry | ${t.entry} |`);
    lines.push(`| Stop / Invalidation | ${t.stop_invalidation} |`);
    lines.push(`| Target 1 | ${t.target_1} |`);
    lines.push(`| Target 2 | ${t.target_2} |`);
    lines.push(`| Max Loss | ${t.max_loss} |`);
    lines.push(`| Max Profit | ${t.max_profit} |`);
    lines.push(`| Reward:Risk | ${t.reward_risk} |`);
    lines.push(`| Breakeven | ${t.breakeven} |`);
    lines.push(`| Sizing | ${t.sizing} |`);
    lines.push(`| Hold Window | ${t.hold_window} |`);
    lines.push(`| Conviction | ${t.conviction} |`);
    lines.push(`| Correlation | ${t.correlation_note} |`);
    lines.push(`| Exit Plan | ${t.exit_plan} |`);
    lines.push(`| Catalyst Calendar | ${t.catalyst_calendar} |`);
    lines.push('');
    if (t.option_tag_stack) {
      lines.push('**Option-Tag Stack:**\n');
      lines.push('| Tag | Value |');
      lines.push('|---|---|');
      lines.push(`| Direction Exposure | ${t.option_tag_stack.direction_exposure} |`);
      lines.push(`| Protection | ${t.option_tag_stack.protection} |`);
      lines.push(`| Income | ${t.option_tag_stack.income} |`);
      lines.push(`| Volatility Stance | ${t.option_tag_stack.volatility_stance} |`);
      lines.push(`| Defined Risk | ${t.option_tag_stack.defined_risk} |`);
      lines.push('');
    }
    lines.push(`**Rationale vs. regime.** ${t.rationale_vs_regime}\n`);
    if (t.source_refs?.length) {
      lines.push('**Source refs:**');
      for (const r of t.source_refs) lines.push(`- \`${r}\``);
      lines.push('');
    }
    lines.push('---\n');
  }
  if (data.house_view_update?.length) {
    lines.push('## House View Update Proposal\n');
    lines.push('| Asset Class | View | Key Driver |');
    lines.push('|---|---|---|');
    for (const h of data.house_view_update) lines.push(`| ${h.asset_class} | ${h.view} | ${h.key_driver} |`);
  }
  return lines.join('\n');
}

async function stageCommit() {
  console.log('[regime] Stage 3: commit');
  const jsonOut = THESIS_DRAFT.replace(/\.md$/, '.json');
  if (!existsSync(jsonOut)) {
    console.error(`[regime] Thesis draft JSON not found at ${jsonOut}. Run --stage=thesis first.`);
    process.exit(2);
  }
  const draft = JSON.parse(await readFile(jsonOut, 'utf8'));
  const cards = draft.thesis_candidates ?? [];
  if (cards.length === 0) {
    console.error('[regime] No thesis candidates to commit.');
    process.exit(2);
  }

  // Build Active Ledger rows
  const ledgerRows = cards.map(t => buildLedgerRow(t)).join('\n');

  // Build Position blocks
  const positionBlocks = cards.map(t => buildPositionBlock(t)).join('\n\n---\n\n');

  // Apply to ledger
  const ledger = await readFile(LEDGER_PATH, 'utf8');
  const updatedLedger = ledger.replace(
    /\| _\(no active rows\)_ \| \| \| \| \| \| \| \| \| \|/,
    ledgerRows,
  );
  await writeFile(LEDGER_PATH, updatedLedger, 'utf8');

  // Apply House View if provided
  if (draft.house_view_update?.length) {
    const updated2 = applyHouseView(updatedLedger, draft.house_view_update);
    await writeFile(LEDGER_PATH, updated2, 'utf8');
  }

  // Apply to Positions file
  const positions = await readFile(POSITIONS_PATH, 'utf8');
  const headerMatch = positions.match(/(## Active Position Blocks\s*\n\s*> \*\*Empty.*?awaiting Phase D Regime Bootstrap.*?\*\*[^\n]*\n)/s);
  if (!headerMatch) {
    console.error('[regime] Could not locate Active Position Blocks empty-state marker in Positions file. Aborting commit.');
    process.exit(4);
  }
  const newPositions = positions.replace(
    headerMatch[0],
    `## Active Position Blocks\n\n${positionBlocks}\n\n---\n\n`,
  );
  await writeFile(POSITIONS_PATH, newPositions, 'utf8');

  console.log(`[regime] Committed ${cards.length} thesis candidates to ledger + Positions.`);
  console.log(`[regime] Ledger: ${LEDGER_PATH}`);
  console.log(`[regime] Positions: ${POSITIONS_PATH}`);
}

function buildLedgerRow(t) {
  const today = TODAY;
  const srcRef = t.source_refs?.[0] ? '`' + t.source_refs[0] + '`' : '_pending_';
  const watchpoint = '_pending_';
  const posBlock = `[[Market Positioning Ledger - Positions#${t.slug}]]`;
  const cells = [
    t.name,
    t.stance,
    String(t.gate),
    `0→${t.gate} (${today})`,
    srcRef,
    watchpoint,
    posBlock,
    t.entry.slice(0, 80),
    t.stop_invalidation.slice(0, 80),
    'fresh seed',
  ];
  return '| ' + cells.map(c => String(c).replace(/\|/g, '\\|')).join(' | ') + ' |';
}

function buildPositionBlock(t) {
  const lines = [];
  lines.push(`## ${t.slug}\n`);
  lines.push(`> Parent row: [[Market Positioning Ledger#Active Ledger|${t.name}]] · Gate ${t.gate} · Stance: ${t.stance}\n`);
  lines.push(`**Position Reasoning.** ${t.position_reasoning}\n`);
  lines.push('| Field | Value |');
  lines.push('|---|---|');
  lines.push(`| Action Label | ${stanceToActionLabel(t.stance)} |`);
  lines.push(`| Position State | Flat |`);
  lines.push(`| Direction Tag | ${t.direction_tag} |`);
  lines.push(`| Purpose Tag | ${t.purpose_tag} |`);
  lines.push(`| Instrument | ${t.instrument} |`);
  lines.push(`| Structure | ${t.structure} |`);
  lines.push(`| Entry | ${t.entry} |`);
  lines.push(`| Stop / Invalidation | ${t.stop_invalidation} |`);
  lines.push(`| Target 1 | ${t.target_1} |`);
  lines.push(`| Target 2 | ${t.target_2} |`);
  lines.push(`| Max Loss | ${t.max_loss} |`);
  lines.push(`| Max Profit | ${t.max_profit} |`);
  lines.push(`| Reward:Risk | ${t.reward_risk} |`);
  lines.push(`| Breakeven | ${t.breakeven} |`);
  lines.push(`| Sizing | ${t.sizing} |`);
  lines.push(`| Hold Window | ${t.hold_window} |`);
  lines.push(`| Conviction | ${t.conviction} |`);
  lines.push(`| Correlation | ${t.correlation_note} |`);
  lines.push(`| Exit Plan | ${t.exit_plan} |`);
  lines.push(`| Catalyst Calendar | ${t.catalyst_calendar} |`);
  lines.push('');
  if (t.option_tag_stack) {
    lines.push('**Option-Tag Stack:**\n');
    lines.push('| Tag | Value |');
    lines.push('|---|---|');
    lines.push(`| Direction Exposure | ${t.option_tag_stack.direction_exposure} |`);
    lines.push(`| Protection | ${t.option_tag_stack.protection} |`);
    lines.push(`| Income | ${t.option_tag_stack.income} |`);
    lines.push(`| Volatility Stance | ${t.option_tag_stack.volatility_stance} |`);
    lines.push(`| Defined Risk | ${t.option_tag_stack.defined_risk} |`);
  }
  return lines.join('\n');
}

function stanceToActionLabel(stance) {
  const map = { 'Observe': 'Observe', 'Prepare': 'Prepare', 'Press': 'Triggered', 'Fade': 'Prepare', 'Stand aside': 'Observe' };
  return map[stance] ?? 'Observe';
}

function applyHouseView(doc, updates) {
  let next = doc;
  for (const u of updates) {
    const re = new RegExp(`(\\| ${escapeRe(u.asset_class)} \\| )_\\(pending\\)_( \\| \\| \\|)`);
    next = next.replace(re, `$1${u.view} | ${u.key_driver} | ${TODAY} |`.replace(/^\|\s+/, '').replace(/\$1/, `| ${u.asset_class} | `));
  }
  // Simpler line-by-line replacement (the regex above is finicky):
  next = doc;
  for (const u of updates) {
    const needle = `| ${u.asset_class} | _(pending)_ | | |`;
    const repl = `| ${u.asset_class} | ${u.view} | ${u.key_driver} | ${TODAY} |`;
    next = next.replace(needle, repl);
  }
  return next;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

async function main() {
  if (args.stage === 'classify') await stageClassify();
  else if (args.stage === 'thesis') await stageThesis();
  else if (args.stage === 'commit') await stageCommit();
}
