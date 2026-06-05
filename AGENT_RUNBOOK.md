---
type: agent-runbook
version: 1
created: 2026-06-02
last_reviewed: 2026-06-04
runner: scripts/agents/routine-runner.mjs
state_file: _state/run-state.json
log_file: _state/run-log.md
companion_docs:
  - FRESHNESS_POLICY.md
  - ../World_Machine/_Inbox/INGESTION_CONTRACT.md
  - CLAUDE.md
tags:
  - runbook
  - automation
  - orchestrator
---

# Agent Runbook

**This is the agent's only entry point.** Do not crawl the vault. Read this file, the freshness policy, and the run-state, then act.

The runbook defines six daily slots. Each slot lists exactly which pullers run, what counts as success, and where outputs go. The freshness policy decides whether each puller actually fires this run.

Current scheduler status: manual/experimental only. Do not register `WM-Routine-S1..S6` as active Windows tasks until the LLM synthesis errors are repaired and the user explicitly approves promotion. `routine-runner.mjs --dry-run` is expected to be non-mutating and must not append `_state/run-log.md` or save `_state/run-state.json`.

## Operating Principles

1. **Read 3 files, not the vault.** Runbook → freshness policy → run-state. That's the discovery surface.
2. **Skip what's fresh.** A puller only runs if `now - last_run > ttl` per `FRESHNESS_POLICY.md`.
3. **Write to declared paths only.** No discovery on output side — every puller has a fixed sink.
4. **Append, don't overwrite, run-state.** State is mutated by a helper, not by ad-hoc writes.
5. **Surface to World_Machine via the contract.** Anything destined for the inbox follows `INGESTION_CONTRACT.md`.
6. **Updates to the Positioning Ledger only happen on a Gate Δ.** Otherwise, leave it alone.

## Slot Schedule (6 slots, weekday ET)

| Slot | Time (ET) | Mode | Duration target |
|---|---|---|---|
| S1 Pre-open | 06:30 | Deterministic pulls + brief synthesis | ≤10 min |
| S2 Open+30 | 10:00 | Deterministic pulls + flow read | ≤15 min |
| S3 Midday | 12:30 | Freshness sweep + thesis check | ≤10 min |
| S4 Preclose | 15:30 | Positioning + gamma map | ≤10 min |
| S5 Postclose | 16:30 | Earnings, filings, AH catalysts | ≤15 min |
| S6 EOD | 18:00 | Ledger reconciliation + Discard Log + EOD report | ≤20 min |

Weekend / lower-cadence slots (deep-research arXiv/PubMed/COT, weekly compression, monthly playback) are out of scope for v1. Add as S7/S8 once v1 is stable.

## Slot Definitions

Every slot follows the same six-step shape:

```
1. Resolve slot from clock + runbook.
2. Read run-state.json; diff against FRESHNESS_POLICY.
3. Run the slot's pullers (only those out of TTL).
4. Write outputs to declared paths.
5. Apply ingestion contract → drop World_Machine packets if any qualify.
6. Update run-state.json and append to run-log.md.
```

### S1 — Pre-open (06:30 ET)

**Goal:** stance set before bell.

| Step | Puller / script | Output path | Success criteria |
|---|---|---|---|
| Overnight macro | `scripts/pullers/macro-bridges.mjs` | `01_Data_Sources/Macro/_runs/<date>/macro-bridges.md` | Non-empty rows, latest FRED tick within TTL |
| FX / vol overnight | `scripts/pullers/macro-volatility.mjs` | `01_Data_Sources/Macro/_runs/<date>/vol.md` | DXY + VIX captured |
| Premarket movers | `scripts/pullers/opportunity-viewpoints.mjs --scope=premarket` | `02_Opportunity_Viewpoints/<date>/premarket.md` | At least 1 row per active thesis |
| News scan | `scripts/pullers/sourcewatch.mjs --since=overnight` | `04_News/_runs/<date>/overnight.md` | All sources polled or marked unavailable |
| Synthesis | invoke `16_Agents/Macro Agent` + `16_Agents/Market Agent` | `Reports/Premarket/<date>.md` | One-paragraph stance + 3 watch items |

**World_Machine packet condition:** if synthesis flags a Gate Δ candidate, write a packet to `World_Machine/_Inbox/00_Triage/`.

### S2 — Open+30 (10:00 ET)

**Goal:** first real-tape read; 10:00 economic prints captured.

| Step | Puller / script | Output path |
|---|---|---|
| ISM / 10:00 prints | `scripts/pullers/bea.mjs` (when scheduled) | `01_Data_Sources/Macro/_runs/<date>/10am.md` |
| Opening range | `scripts/pullers/orb-entropy.mjs` | `02_Opportunity_Viewpoints/<date>/orb.md` |
| Gamma map | `scripts/pullers/cboe.mjs` | `01_Data_Sources/Market_Data/_runs/<date>/gamma.md` |
| Sector scan | `scripts/pullers/confluence-scan.mjs` | `02_Opportunity_Viewpoints/<date>/sector.md` |

**World_Machine packet condition:** breadth thrust / sector dispersion delta vs. S1 → packet.

### S3 — Midday (12:30 ET)

**Goal:** confirm or invalidate S1 thesis; cheap freshness sweep.

| Step | Action |
|---|---|
| Freshness sweep | Re-run any puller whose TTL elapsed |
| Thesis check | Invoke `16_Agents/Thesis Agent` against current Positioning Ledger active rows |
| Catalyst calendar | `scripts/pullers/federalregister.mjs` |

**World_Machine packet condition:** thesis invalidation OR new catalyst within 24h.

### S4 — Preclose (15:30 ET)

**Goal:** positioning view ready for close.

| Step | Puller / script | Output path |
|---|---|---|
| Options flow | `scripts/pullers/options-review.mjs` | `01_Data_Sources/Market_Data/_runs/<date>/flow.md` |
| Dealer gamma map | `scripts/pullers/cboe.mjs --refresh` | overwrite from S2 |
| Crowding read | invoke `16_Agents/Positioning Agent` | `02_Opportunity_Viewpoints/<date>/positioning.md` |

**World_Machine packet condition:** crowding score change >1 stdev vs. trailing 20d.

### S5 — Postclose (16:30 ET)

**Goal:** catch after-hours catalysts before EOD compression.

| Step | Puller / script |
|---|---|
| Earnings catalysts | `scripts/pullers/filing-digest.mjs --window=ah` |
| Capital raises | `scripts/pullers/capital-raise.mjs` |
| Disclosure delta | `scripts/pullers/disclosure-reality.mjs` |
| Biotech / FDA (Tue/Thu only) | `scripts/pullers/fda.mjs`, `scripts/pullers/clinicaltrials.mjs` |

**World_Machine packet condition:** any single-name disclosure that hits an active ledger row's underlying.

### S6 — EOD (18:00 ET)

**Goal:** reconcile day → ledger → next-day prep.

| Step | Action |
|---|---|
| Compile day's runs | aggregate from `_runs/<date>/` directories |
| Synthesis | Positioning Agent invoked via the bridge; returns `gate_delta_candidates` JSON |
| Reconcile Positioning Ledger | `lib/runner-reconciler.mjs::applyLedgerUpdates` matches candidates to rows, rewrites Gate + Gate Δ cells. Ambiguous or unmatched candidates are skipped (never guessed) and logged. |
| Write Discard Log batch | reconciler appends an S6 batch to `World_Machine/_Inbox/Market Positioning Ledger - Discard Log.md` |
| EOD report | Positioning Agent's synthesis output is rendered to `World_Machine/Reports/EOD/<date>-positioning.md` per ingestion contract |
| KB health | `scripts/kb/kb-health.mjs` (non-blocking) |
| Run-state checkpoint | flush `_state/run-state.json` and append closing line to `_state/run-log.md` |

**World_Machine packet condition:** always — EOD report is itself the packet.

**Mutation rules.** The reconciler is the only code path allowed to write to the Positioning Ledger files. It is gated by `slot.mayMutateLedger === true` (only S6 has it) AND `agent === 'Positioning Agent'`. Other slots that surface gate Δ candidates do so via triage packets per `INGESTION_CONTRACT.md`.

## Agent Composition

Heavy-judgment steps invoke domain agents under `16_Agents/` via the synthesis bridge (`scripts/lib/runner-synthesis.mjs`). The runbook owns scheduling; the agents own reasoning.

The bridge:
- Builds a system+user prompt from the agent's role (inlined in the bridge, or `16_Agents/<Name>/_prompt.md` if present — that file overrides).
- Asks the LLM for STRICT JSON: `{ stance, watch_items, gate_delta_candidates, open_questions }`.
- Renders the JSON to an ingestion-contract-compliant markdown report under `World_Machine/Reports/<cadence>/<date>-<agent-slug>.md`.
- Emits `OUTPUT:` so the runner hashes and tracks the report like any puller output.
- Skips gracefully if no LLM provider is configured (`synthesis.skipped` in the log; slot continues).

To override an agent's prompt: drop a `_prompt.md` file in `16_Agents/<Agent Name>/`. The bridge will read it and use it as the role description.

The `Orchestrator Agent` is the default fan-out if a slot ever needs >3 domain agents in parallel.

### LLM provider selection

The synthesis bridge routes through `scripts/lib/llm-router.mjs`. Provider precedence (highest first):

1. `--llm=<provider>` CLI flag on the runner.
2. `LLM_PREFER=<provider>` environment variable.
3. `auto` (default).

Valid values: `claude-code`, `api`, `auto`, `none`.

- **`claude-code`** — spawns `claude -p` as a subprocess, uses your desktop sign-in. **No API tokens consumed.** Preferred when you're at the desk.
- **`api`** — HTTP call via `lib/llm-client.mjs`. Uses an env-var API key (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.). Used when no `claude` CLI is on PATH.
- **`auto`** — chooses `claude-code` if `claude` is on PATH, otherwise `api`, otherwise skip.
- **`none`** — synthesis always skips. Useful when you only want pullers to run.

The provider that actually ran is logged as `provider=<name>` in `run-log.md` for every synthesis call.

**Recommended setup:** install Claude Code CLI on the workstation (`claude --version` should print a version). The runner will then use your desktop session for all six slots automatically. If your laptop is closed or `claude` isn't on PATH at run time, the router silently falls back to the API key (if set) or skips synthesis.

### Codex interactive sub-agent lane

Use Codex as the supervised interactive lane when `claude-code` is unavailable, returns invalid JSON, or the operator wants the skeptic panel reviewed inside Codex. This lane does not replace the Node runner or the Claude Code section above; it is an ad-hoc fallback for refutation and promotion review.

Rules:
- Keep executable pulls and ledger writes in `My_Data`; Codex sub-agents produce judgments only.
- Do not let Codex write Gate 3 or Gate 4 directly. Gate 2->3 still goes through S6 + promotion guard; Gate 3->4 still goes through `market-positioning-outcomes --apply`.
- Use three separate Codex prompts for the same candidate: Correctness Skeptic, Base-Rate Skeptic, Alternative-Explanation Skeptic.
- Each response must be JSON with: `{refuted, summary, confidence, signal_status, discrimination_mode, reasoning}`.
- Apply the same quorum rule: `>=2` refuted kills the promotion; `<=1` refuted survives only when prior same-symbol trajectory context exists.
- First-call reviews are context-only. If no prior call exists, keep the row at Gate 2 and log `first-call-context-only`.

Codex prompt template:

```text
You are the <Correctness Skeptic | Base-Rate Skeptic | Alternative-Explanation Skeptic> for the World Machine refutation panel.

Evaluate this Gate 2->3 promotion candidate. Use only the provided evidence and prior-call trajectory. Do not invent source values. Do not recommend a trade. Return JSON only.

Candidate:
<paste gate_delta_candidate JSON>

Active ledger row:
<paste row from World_Machine/_Inbox/Market Positioning Ledger.md>

Position block:
<paste matching block from World_Machine/_Inbox/Market Positioning Ledger - Positions.md>

Prior same-symbol or same-row calls:
<paste prior records from My_Data/_state/promotion-history.json, or write [] if none>

Indicator priors:
- HIGH SIGNAL: risk-BEARISH, microstructure-BULLISH, price-BEARISH.
- RETIRED/NOISE: macro, sentiment-BULLISH, fundamentals-BEARISH, price-BULLISH.
- BULLISH-bias-failure symbols: GEV, ETN, AMZN.
- Reliable NEUTRAL symbols: MSFT, PLTR.

Return exactly:
{
  "refuted": true,
  "summary": "<=200 chars",
  "confidence": 0.0,
  "signal_status": "clear|watch|alert|critical",
  "discrimination_mode": "trajectory-aware|first-call",
  "reasoning": "<=500 chars"
}
```

## Failure Handling

| Condition | Action |
|---|---|
| Puller errors | Log to `run-log.md` with reason; mark source `stale-error` in run-state; continue slot |
| Source rate-limited | Defer to next slot, do not retry within slot |
| Required puller blocks (e.g., FMP down for S1 stance) | Slot exits with `degraded`; EOD reconciliation flags gap |
| Ingestion contract violation | Packet dropped, reason logged in Discard Log batch |
| Run-state write failure | Hard fail the slot — never proceed with stale state |

## Adding a New Puller or Source

1. Add the puller under `scripts/pullers/` and its source note under `01_Data_Sources/<category>/`.
2. Add a row to `FRESHNESS_POLICY.md` with TTL + criticality.
3. Add the puller step to the appropriate slot above.
4. Add the source key to the `sources` block in `_state/run-state.json`.
5. If output feeds World_Machine, update `INGESTION_CONTRACT.md`.

## Phase 1 — Close-the-Loop Procedure

Infrastructure shipped 2026-06-03. Use this loop to grade ledger rows once any reach Gate 3:

1. **Generate packet** — `node run.mjs pull market-positioning-outcomes --dry-run --json` emits the proposed outcome packet for all active ledger rows. Rows at Gate ≥ 3 surface as `eligibility: outcome_eligible`; G1–G2 rows surface as `monitor_only` for tracking only.
2. **Human/chat review** — flatten the eligible candidates into an approvals file:
   ```json
   {
     "schema_version": 1,
     "date": "<YYYY-MM-DD>",
     "approved_by": "<reviewer>",
     "outcomes": [
       { "row": "<row name>", "approved": true, "label": "<one of Played out | Directionally right / poorly timed | Noisy | Missed | Stale | Rebuild>", "realized_path": "<what happened>", "outcome_note": "<short note>" }
     ]
   }
   ```
   Note the top-level key is `outcomes` (or `candidates`), not `approvals`.
3. **Apply** — `node run.mjs pull market-positioning-outcomes --apply=<path-to-approved.json>`. The apply step:
   - Writes the label into the ledger row's Outcome Status cell (`World_Machine/_Inbox/Market Positioning Ledger.md`).
   - Bumps Gate 3 → 4 with a dated `gate_delta`.
   - Appends an `outcome-review` block to `World_Machine/_Inbox/Market Positioning Ledger - Discard Log.md`.
   - Appends a calibration record to `_state/calibration.json` with `(row, label, gate_before, gate_after, realized_path, outcome_note, approved_by, applied_at)`.
4. **Idempotency** — re-applying the same JSON returns `skipped: [{reason: "already-applied"}]`. Dedup key is `(row, applied_at)` checked against `calibration.json` records.
5. **Cadence decision** — after 3-5 approved outcomes, review `_state/calibration.json` and decide whether to harden the loop into an S6+1 sub-slot or keep it ad-hoc.

The `market-positioning-outcomes --apply` path is the second permitted ledger mutator alongside the S6 reconciler, per `World_Machine/AGENTS.md` §Ledger Mutation.

### Historical Backtest (calibration-gate unlock)

When historical thesis data exists in `05_Data_Pulls/Theses/*_Agent_Analysis_All_Theses.md`, use `thesis-backtest.mjs` to populate calibration retroactively rather than waiting 60 days for forward-loop data.

```
node run.mjs pull thesis-backtest --dry-run --json --limit=3   # smoke test
node run.mjs pull thesis-backtest                              # full run
node run.mjs pull thesis-backtest --window=5 --threshold=5     # tune
```

Per-thesis grading rule (deterministic):
- **BULLISH:** return ≥ +threshold% → Played out; positive but under → Directional; mild negative → Stale (or Noisy if confidence < 20%); ≤ -threshold% → Missed.
- **BEARISH:** symmetric.
- **NEUTRAL:** |return| < threshold → Played out; |return| < 2× threshold → Stale/Noisy; else Missed.

Output:
- `_state/thesis-calibration.json` — **separate file** from the forward-loop `_state/calibration.json`; corpora never mix.
- `World_Machine/Reports/Regime/<date>-thesis-backtest.md` — distribution tables + first 30 records.

Use the backtest results to size the gap that Phase 2 (Adversarial Truth) needs to close.

### Phase 2 — Refutation Panel (LLM-gated, opt-in)

Adversarially evaluates a thesis verdict via 3 lens-diverse skeptics (Correctness, Base-Rate, Alternative-Explanation). Quorum: ≥2 refute → verdict killed; ≤1 refute → survives.

```
# Default is --dry-run (no LLM spend, emits prompts only)
node run.mjs pull refute-thesis --from-backtest=BULLISH --limit=3

# Opt-in live spend
node run.mjs pull refute-thesis --from-backtest=BULLISH --limit=3 --live

# Ad-hoc single thesis
node run.mjs pull refute-thesis --symbol=GEV --verdict=BULLISH --reasoning="..." --live
```

LLM provider is resolved from env vars by `scripts/lib/llm-client.mjs` — checks `AGENT_LLM_PROVIDER` → `GROQ_API_KEY` → `OPENAI_API_KEY`. Refutation runs append to `_state/refutation-log/<date>.json`. Cost envelope per thesis: ~1800 tokens × 3 skeptics; on Groq llama-3.3-70b ≈ $0.001/thesis. Alternate execution lane: dispatch parallel Claude Code sub-agents (Sonnet 4.6) from a session — same library, no external API spend.

Codex-friendly fallback: use the Codex interactive sub-agent lane above with the same three skeptic roles and JSON judgment schema, then apply the same quorum rule manually before any deterministic ledger step.

**Refutation panel honest limits (2026-06-03):**
- **Trajectory-aware mode** (priorCalls provided) — 1/1 true positive in re-test; works as designed.
- **First-call mode** (no prior calls on the same symbol) — 0/2 discrimination on losers vs winners with matched information. The thesis-synthesis output alone does not carry directional signal at first call. Use first-call mode for context only; do not act on the verdict.

**Indicator priors baked into prompts** (from 2026-06-03 calibration audit):
- HIGH SIGNAL: `risk`-BEARISH (54% n=63), `microstructure`-BULLISH (66.7% n=15), `price`-BEARISH (53% n=32)
- RETIRED: `macro` agent entirely (98/98 BULLISH = broken), `sentiment`-BULLISH, `fundamentals`-BEARISH (contrarian), `price`-BULLISH (below baseline)
- SYMBOL FAILURES: BULLISH verdicts on GEV / ETN / AMZN are 11-25% accurate — discount heavily.
- SYMBOL WINS: NEUTRAL verdicts on MSFT / PLTR are 100% / 58% accurate — trust these.

## Promotion Path to Production

- **v1:** S1 + S6 only, no agent invocations — prove the runner + state diff loop.
- **v1.1:** add S2–S5 deterministic pulls.
- **v1.2:** add agent invocations for synthesis + reconciliation.
- **v2:** add S7 deep-research (Tue/Thu) and S8 weekly (Sun).
- **v2.1:** Phase 1 Close-the-Loop — `market-positioning-outcomes` puller + `_state/calibration.json` (infrastructure verified 2026-06-03; awaiting first Gate 3 promotions).
- **v2.2:** Phase 1 historical-backtest unlock — `thesis-backtest` puller + `_state/thesis-calibration.json` (shipped 2026-06-03; N=98 graded; baseline accuracy 44.9% at robust params [10d/5%]; BULLISH accuracy 21.9% identified as Phase 2 target).
- **v2.3:** Phase 2 refutation panel infrastructure — `refutation-panel.mjs` lib + `refute-thesis.mjs` puller (shipped 2026-06-03; `--dry-run` default, `--live` opt-in for LLM spend; supports `--from-backtest` to refute worst-accuracy verdicts).
- **v2.4:** Upstream synthesis fix — `scoring-weights.json` retired the broken `macro` agent (weight 1.1 → 0) and added `symbolBullishGating` to block BULLISH verdicts on GEV/ETN/AMZN. `scoring.mjs` extended with `context.symbol` parameter and `applySymbolGate()`. Historical simulation: +126pp P&L lift (-99 → +27). Shipped 2026-06-03; forward-validated by 2026-08-01 review.
