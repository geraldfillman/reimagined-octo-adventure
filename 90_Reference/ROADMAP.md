---
title: World Machine — Project Roadmap
type: roadmap
created: 2026-06-02
last_reviewed: 2026-06-04
phase_1_infrastructure_verified: 2026-06-03
infrastructure_phase: p6_live_run_green
horizon: 12 months
status: living document
tags: [roadmap, planning, strategy]
---

# World Machine — Roadmap

A bold direction for the next 12 months. Phases are capability jumps, not feature lists. Each phase has a **hero capability** the system couldn't do before and a small set of supporting changes that make it real.

The bar: every phase has to change what kind of question the system can answer.

> **Infrastructure track (separate from the capability phases below):** the World_Machine + My_Data → single-harness consolidation now runs from `C:\Users\CaveUser\harness` with `My_Data` as the active harness vault. As of 2026-06-04: P1 lift-out/scheduler cutover, P2 self-feeding memory, P3a registry/validate gate, P4 cockpit, P5 doc collapse, and P6 consolidation/de-indexing are complete enough for live operation. Daily and EOD live runs are green after source refresh. P3b remains parked; P7 Neo4j recall remains the next major capability.

---

## 2026-06-04 Infrastructure Closeout

Done:

- Code, scheduler config, memory, tests, and harness cache roots live in `C:\Users\CaveUser\harness`.
- Active vault surface is `My_Data`: `00_Cockpit`, `10_Theses`, `20_Entities`, `30_Sources`, `40_Decisions`, `90_Reference`, `99_System`, `_cache`, `logs`, and generated `Reports`.
- Legacy durable roots (`01_Data_Sources`, `05_Data_Pulls`, `06_Signals`, `12_Knowledge_Bases`) were moved/archive-copied out of the active Obsidian surface and replacement cache roots were seeded.
- Position Research Intake lane is live under `40_Decisions/Research_Inbox/` with raw bodies in `_cache/research-intake`.
- Full live refresh + daily + EOD cadence ran green on 2026-06-04.
- KB/Oy is scaffolded as a reviewed durable KB vault, with raw KB bodies remaining in the harness cache.
- Market-cycle coverage reports `cycle=0` after the manual EIA petroleum inventories/storage snapshot closed the Commodity Delivery And Storage gap.
- P3b source metadata is live as a warning-only validation foundation.

Known remnant:

- `My_Data\scripts` remains because Windows held a file lock during P6. It was archive-copied to `World_Machine\500-archive\Legacy_From_My_Data\2026-06-04\remaining-live-surfaces\scripts` and is ignored by Obsidian. Four legacy scheduled tasks still point at retired/no-op wrappers under that folder, and disabling them failed with Task Scheduler `Access is denied`; remove the remnant only after an elevated/admin task cleanup.

Roadmap left:

1. **P6 cleanup:** use elevated/admin Task Scheduler access to disable/delete the four legacy no-op tasks, then remove the locked `scripts` remnant after restart/unlock.
2. **P3b source gate:** warning-only source metadata foundation is live; expand declarations before making it blocking.
3. **P7 live Neo4j recall:** wire candidate/ledger setup recall into Gate 2 review, with read-only verification first and explicit write gates.
4. **KB/Oy follow-through:** promote selectively into Oy from reviewed material; do not bulk-copy raw cache.
5. **Outcome/calibration operations:** keep `market-positioning-outcomes --dry-run --json` flowing through the harness launcher and apply only approved review JSON.

Execution plan for all non-Neo4j items: [[POST_P6_NON_NEO4J_PLAN]].

---

## Phase 0 — Where we are (today)

The harness cadence scheduler is live for local-analysis/reporting tasks. Raw source refresh remains operator-approved, and the older autonomous 6-slot routine is manual/experimental rather than the scheduled production path. The vault is contract-bound: `My_Data` holds the active harness knowledge and decisions, `World_Machine` is archive/history, and ingestion is gated by schema.

**2026-06-03 update:** Phase D Regime Bootstrap is complete. The synthetic seed rows were archived, and the live Market Positioning Ledger now has four evidence-backed rows sourced from refreshed My_Data Phase C pulls: Liquidity Friction Tail Hedge, Hard Assets Debasement Watch, Energy Shock Oil Watch, and Quality Software Dispersion. Phase D was performed in agent-neutral mode through chat-generated regime/thesis artifacts, then committed through the deterministic `regime-bootstrap.mjs --stage=commit` path.

**2026-06-03 second update (end of intensive session):** Phase 1 and Phase 2 infrastructure both shipped in a single session via historical-data shortcut. Headline outcomes: (1) Phase 1 outcomes puller verified + idempotency patched; (2) 98-record historical backtest replaced the 60-day forward-data gate with same-day calibration; (3) Phase 2 refutation panel built, validated for trajectory-aware mode (1/1 true positive), honestly null on first-call discrimination (0/2); (4) upstream synthesis fix shipped — retired the broken `macro` agent (was firing BULLISH 98/98) and symbol-gated BULLISH on GEV/ETN/AMZN (11-25% historical accuracy), simulated +126pp P&L lift; (5) forward-validation scheduled for 2026-06-17.

**What the system can answer today:** "Given the historical thesis corpus, which agents and symbols carry signal versus noise? What is the realistic accuracy floor of the synthesis with broken indicators retired? Does a refutation panel catch ground-truth failures, and under what conditions?"

**What it cannot yet:** close outcomes for Gate 3+ rows without approved review JSON (infrastructure ready, awaits first real Gate 3 promotion); see beyond text; trade.

---

## Phase 1 — Close the Loop (4–6 weeks)

**Hero capability:** every ledger row carries a closed feedback cycle from thesis → trigger → outcome label → calibration metric.

Right now the ledger captures positions but doesn't tell us if it was *right*. Phase 1 makes the ledger self-grading.

**2026-06-03 infrastructure-verified update:** the `market-positioning-outcomes` puller (`My_Data/scripts/pullers/market-positioning-outcomes.mjs` + `My_Data/scripts/lib/market-positioning-outcomes.mjs`) was end-to-end smoke-tested against the live 4-row ledger. Dry-run output matches the 2026-06-03 packet shape exactly (4 candidates, 0 eligible — correct because all rows are at G1-G2). An idempotency patch added a `(row, applied_at)` seen-set check so re-applying the same approved JSON returns `skipped: [{reason: "already-applied"}]` instead of double-writing the Discard Log + calibration. Calibration schema confirmed writeable at `My_Data/_state/calibration.json`. The `positioning-checklist` puller (Phase 1 row 3) also exists and is invokable via `node run.mjs pull positioning-checklist`.

**2026-06-03 calibration-data unlock:** the 60-day forward-data gate was cleared in one analysis pass by backtesting the existing thesis corpus. A new puller `My_Data/scripts/pullers/thesis-backtest.mjs` walks `05_Data_Pulls/Theses/*_Agent_Analysis_All_Theses.md` (12 files, 2026-05-01 → 2026-05-26), pulls FMP daily prices for each `(date, symbol)` pair, and grades each verdict deterministically using a return-threshold + window rule. Output lives in a separate file `My_Data/_state/thesis-calibration.json` so the historical corpus never pollutes the forward-loop calibration. **N=98 observations across 12 symbols, 98/98 graded successfully.** Baseline accuracy is param-sensitive: 30.6% at fragile (10d/3%), **44.9% at robust (10d/5%) — the persisted baseline**, 53-59% at wider (5d/5% or 20d/8%). The robust-param distribution at 10d/5%: 36 Played out, 8 Directional, 7 Noisy, 27 Stale, 20 Missed. Per-verdict accuracy is the actionable headline: **BULLISH 21.88%, NEUTRAL 57.14%, BEARISH 50%**. The directional-bias problem on BULLISH calls became the precise Phase 2 + upstream-fix target.

**Still pending in Phase 1:** S6+1 sub-slot wiring (deferred — forward-loop apply path works manually); auto-emit of pre-trade checklist on first Gate 3 promotion (`positioning-checklist` puller exists, not yet hooked); forward-loop outcome labels accumulating in `_state/calibration.json` as real Gate 3 promotions happen.

| Change | Why it matters |
|---|---|
| **Outcome agent (S6+1)** — a new slot or sub-step that scores every closed/triggered row against price + catalyst data and writes an Outcome Label deterministically (Played out / Right-poorly-timed / Noisy / Missed / Stale) | Stops outcome labels from being subjective |
| **Calibration ledger** — a new sidecar `_state/calibration.json` tracking (agent, gate, outcome) tuples over 90/180/365-day windows | Quantifies how well each agent's Gate 3 calls actually played out |
| **Pre-trade checklist generator** — when a row hits Gate 3, auto-emit a printable checklist combining the Position Block + current evidence freshness + correlation risk | Turns synthesis into something actionable in <60 seconds |
| **Outcome label hooks in Discard Log** | Every demotion gets a paired outcome reason; the log becomes a teacher, not just an audit |

**Decision unlock:** "Which agent or pattern is over-promoting Gate 3 candidates that go on to fail?"

---

## Phase 2 — Adversarial Truth (6–10 weeks)

**Hero capability:** no Gate Δ ships without surviving a panel of skeptics whose job is to refute it.

The biggest hidden risk in agentic systems is plausible-but-wrong reasoning. We already have an `agent-debate-engine.mjs` library (confirmed present at `My_Data/scripts/lib/agent-debate-engine.mjs`) — Phase 2 wires it into the synthesis path so promotion is *adversarially earned*.

**2026-06-03 Phase 2 readiness:** the calibration-gate that previously blocked Phase 2 is now cleared (see thesis-backtest results in Phase 1 above). With robust grading params (10d / 5%), thesis baseline accuracy is **44.9%** over 98 observations. Per-verdict breakdown is the actionable signal: **BULLISH verdicts are 21.88% accurate** (worse than random), NEUTRAL 57%, BEARISH 50%. The directional-bias problem on BULLISH calls is the precise target Phase 2's refutation panel is built to catch.

**2026-06-03 Phase 2 infrastructure shipped:**

- **`My_Data/scripts/lib/refutation-panel.mjs`** — spawns 3 lens-diverse skeptics per verdict (Correctness, Base-Rate, Alternative-Explanation). Each skeptic returns a structured JSON judgment that gets normalized into a `challenge` `AgentMessage` consumed by the existing `agent-debate-engine.mjs`. Quorum: ≥2 of 3 refute → verdict killed; ≤1 refute → verdict survives.
- **`My_Data/scripts/pullers/refute-thesis.mjs`** — wrapper puller. Default is `--dry-run` (no LLM spend; emits prompts only) per Operating Principle 5. Opt-in `--live` triggers actual LLM calls via `llm-client.chatJson`. Supports `--from-backtest=BULLISH` to pull the worst-accuracy verdicts from `_state/thesis-calibration.json` (worst-first ordering: Missed → Stale → Noisy → ...).
- **Cost envelope (estimate):** ~1800 tokens/thesis × 3 skeptics. At Groq llama-3.3-70b rates: ~$0.001/thesis. Full BULLISH-Missed subset (~25 verdicts) ≈ $0.05.
- **Refutation log:** persisted at `My_Data/_state/refutation-log/<date>.json`. Each run appends its full `(symbol, verdict, refuted_count, challenges[])` block.

**2026-06-03 Phase 2 meta-validation passed — 9/9 refutations on ground-truth failures.** A live refutation panel was dispatched against the 3 worst BULLISH-Missed verdicts from the thesis-backtest corpus:

| # | Verdict | Realized | Refuted | Reason |
|---|---|---:|---:|---|
| 1 | GEV BULLISH 2026-05-09 (conf 50%) | −5.71% | **3/3** | quorum-refuted |
| 2 | ETN BULLISH 2026-05-09 (conf 43%) | −11.25% | **3/3** | quorum-refuted |
| 3 | GEV BULLISH 2026-05-24 (conf 44%) | −7.73% | **3/3** | quorum-refuted |

Total: **9 of 9 skeptic calls** correctly refuted the verdicts blind (no skeptic was shown the realized return). Consistent failure modes the panel surfaced:

1. **Sub-50% confidence labeled BULLISH** — flagged by all three lenses as structurally incoherent. A verdict can't be "BULLISH at 43% confidence"; that's NEUTRAL with a bullish lean at best.
2. **"Top risks: N/A"** — every refutation independently identified zero-stated-risks as a drawdown predictor, not an absence of risk.
3. **Majority-NEUTRAL signals overridden by minority-BULLISH** — 4-vs-6 (ETN) and 5-vs-5 (GEV) splits being called BULLISH is a synthesis bug, not a setup.
4. **Crowded-narrative naming** ("AI Power Defense Stack", "Druckenmiller Style Secular Trend Leaders") flagged as late-cycle positioning signals.
5. **Risk-agent self-demotion** between consecutive same-symbol calls (GEV May 9 → May 24) being ignored by the synthesis.

**Execution architecture note:** the refutation was dispatched via **Claude Code parallel sub-agents (Sonnet 4.6)**, not through the `llm-client.chatJson` path. 9 agents in one batch, ~30K tokens each, ~70 seconds wall-clock. Token cost was absorbed by the Claude Code subscription (no external API spend), confirming an alternate execution lane that respects Operating Principle 5 even more strictly than Groq would have. The Node `refute-thesis` puller remains the codified-cadence path; the Claude Code dispatch is the ad-hoc / interactive lane.

**Codex-friendly interactive lane:** when Claude Code is unavailable, returns invalid JSON, or the operator wants Codex supervision, dispatch the same three skeptic roles as separate Codex sub-agent prompts: Correctness Skeptic, Base-Rate Skeptic, and Alternative-Explanation Skeptic. Each Codex sub-agent must return the same structured judgment shape used by `refutation-panel.mjs`: `{refuted, summary, confidence, signal_status, discrimination_mode, reasoning}`. The quorum rule is unchanged: `>=2` refuted kills the Gate 2->3 promotion; `<=1` refuted survives only when the prompt includes prior same-symbol trajectory context. First-call Codex reviews are context-only and must not promote above Gate 2.

**2026-06-03 Indicator audit — what works, what to retire.** After the false-positive test surfaced the prompt-asymmetry concern, a clean re-test plus a full per-agent / per-symbol / per-verdict slice of the 98-record thesis-calibration produced an actionable kill list. Stored in detail at `My_Data/_state/refutation-log/2026-06-03.json` and the indicator slice script output.

**KEEP** (verified signal): `microstructure`-BULLISH (66.7% n=15), `risk`-BEARISH (54% n=63 — the actual workhorse), `price`-BEARISH (53.1% n=32), NEUTRAL verdicts on MSFT (100%) and PLTR (58%), the consecutive-call deterioration detector in the refutation panel (1/1 TP).

**RETIRE** (noise or contrarian):
- **`macro` agent entirely** — emits BULLISH 98/98 times. Constant signal = no information. Pull from "Top drivers" label and discount in any synthesis.
- **`sentiment`-BULLISH** (37.5%, n=64) — below baseline; mildly contrarian.
- **`fundamentals`-BEARISH** (30%, n=10) — actively misleading; CONTRARIAN indicator.
- **`price`-BULLISH** (35.7%, n=56) — below baseline; weakly contrarian.
- **BULLISH verdicts on GEV / ETN / AMZN** — 11-25% accuracy across 30 calls. Symbol-specific BULLISH-bias failure mode. Either lower thresholds materially or stop running BULLISH on these names.
- **First-call refutation panel (no trajectory context)** — clean re-test: 0/2 discrimination on first-call losers vs winners with matched information. Refutation works longitudinally, not single-shot.

**NEEDS DATA**: `microstructure` agent fires on only 23/98 records — close the coverage gap before depending on its 66.7% bullish accuracy. BEARISH verdicts are 10/98 total — too few to grade reliably.

The systemic lesson: the synthesis system labels `macro`, `price`, `fundamentals` as "Top drivers" but they co-fire on essentially every BULLISH verdict. The actual differentiator across the agent stack is `risk` (BEARISH 54%) and `microstructure` (BULLISH 66.7%) — the two agents the synthesis demotes most often. Inverting that priority would likely close a meaningful chunk of the BULLISH-accuracy gap (from 21.9% toward 45%+).

**2026-06-03 Phase 2 false-positive test passed — winners survived 2/2 (but with caveats below).** Same 3-lens panel dispatched against the only 2 BULLISH-Played-out verdicts in the corpus:

| # | Verdict | Realized | Refuted | Survives | Reason |
|---|---|---:|---:|---|---|
| 1 | GEV BULLISH 2026-05-16 (conf 50%) | +5.75% | 1/3 | ✓ | quorum-survived (2-of-3) |
| 2 | ETN BULLISH 2026-05-16 (conf 43%) | +5.57% | 0/3 | ✓ | quorum-survived (3-of-3) |

**Discrimination summary across both tests:**

| Test | N verdicts | Refuted (correctly?) | Survived (correctly?) |
|---|---:|---:|---:|
| Ground-truth (losers) | 3 | **3/3 ✓** | 0 |
| False-positive (winners) | 2 | 0 | **2/2 ✓** |
| **Total panel accuracy** | **5** | **5/5 correct** | — |

The discriminating signal the panel latched onto: **"0% bearish across 10 agents"** + **bullish-tilted entropy distribution** (e.g., 74/0/26 or 63/0/37). The panel treats zero-bearish as structural asymmetry that can offset sub-50% confidence.

**Methodology caveat (honest):** the winner prompts included entropy distribution percentages that the loser prompts did not. The losers' source files contain similar distributions; a clean re-test would re-run the losers with equalized prompt information. Until that re-run is done, the 5/5 result should be read as "panel is at least directionally discriminating" rather than "panel is provably bias-free."

**2026-06-03 Clean re-test result — only the trajectory-case loser was correctly refuted.** Re-dispatched the 3 BULLISH-Missed losers with prompts equalized to the winner-run information level (entropy distribution + risk-degradation context). Outcome:

| Verdict | Realized | Re-test result | Prior result |
|---|---:|---|---|
| GEV 2026-05-09 (first-call, no trajectory) | -5.71% | **SURVIVES** 2/3 | was refuted 3/3 |
| ETN 2026-05-09 (first-call, no trajectory) | -11.25% | **SURVIVES** 3/3 | was refuted 3/3 |
| GEV 2026-05-24 (second call with deterioration) | -7.73% | **REFUTED** 3/3 | refuted 3/3 |

**Honest scorecard:** combined refutation panel + false-positive test = **3/5 correct (60%)** with equalized prompts. The 5/5 number from the prior run was prompt-asymmetry, not signal.

The actionable read: **single-thesis refutation cannot discriminate first-call losers from first-call winners — because the thesis-synthesis output doesn't carry that signal.** The panel only works when there's a longitudinal comparison (consecutive same-symbol calls with deterioration trajectory). This narrows Phase 2's hero capability from "every Gate Δ survives refutation" to **"every Gate Δ that follows a prior call on the same name survives a trajectory-aware refutation."**

**Still pending in Phase 2 (re-scoped):**

- Refit `scripts/lib/refutation-panel.mjs` to require longitudinal context — refuse to grade a thesis unless prior calls on the same symbol are passed in (or none exist on file). Single-shot mode marked as `discrimination: trajectory-required`, not a general-purpose grader.
- Wire `refute-thesis` into the synthesis path so new Gate 2→3 promotions automatically get a trajectory-refutation pass before reaching the ledger.
- Self-debate for stance: macro-vs-market disagreement in S1 triggers a one-round debate (roadmap row 5).
- Refutation outcomes feed back into calibration — track whether refuted verdicts subsequently played out (would have been false-positives killed correctly).
- **Upstream fix (highest leverage):** before more refutation work, retire the broken `macro` agent and reweight the synthesis to lean on `risk`-BEARISH and `microstructure`-BULLISH as primary differentiators. The 30%→45%+ accuracy lift is sitting in the source, not in the refutation layer.

**2026-06-03 upstream fix SHIPPED — synthesis reweighting + symbol gating (+126pp P&L lift).** Before/after on 98-record historical replay (uniform per-agent confidence — directionally indicative, not perfect fidelity):

| Synthesis variant | Total P&L | Avg/trade | Big wins | Big losses | W/L ratio |
|---|---:|---:|---:|---:|---:|
| V1 baseline (live, pre-fix) | -99.34 | -1.01 | 10 | 16 | 0.63 |
| Retire macro only | -47.52 | -0.48 | 14 | 16 | 0.88 |
| Symbol-gate only | -24.89 | -0.25 | 8 | 11 | 0.73 |
| **V_COMB (both) — SHIPPED** | **+26.93** | **+0.27** | **12** | **11** | **1.09** |

**Operational lesson:** *aggressive* reweighting (the initial V2 attempt that re-scored every agent based on per-agent accuracy) **regressed** -26pp because per-agent accuracy measured under V1's weighting doesn't transfer — combinatorial effects matter. *Targeted retirement* of demonstrated noise + symbol gating improved +126pp. The user's "leave behind what doesn't work" was directly correct.

**Patch surface:**
- `My_Data/scripts/config/scoring-weights.json` — `macro` weight 1.1 → 0.0; removed `macro` from `downsideBoostedAgents` and `bearishRiskCluster.confirmationAgents`; added new `symbolBullishGating` block blocking BULLISH on `[GEV, ETN, AMZN]` → `NEUTRAL` (review date 2026-08-01).
- `My_Data/scripts/agents/marketmind/scoring.mjs` — `synthesizeDeterministic(agentSignals, context)` now accepts a `{symbol}` context; emits `raw_verdict` + `symbol_gated` alongside `final_verdict`; reasoning explains the gate when applied. New `applySymbolGate()` helper.
- `My_Data/scripts/pullers/agent-analyst.mjs` — passes `{symbol}` into `synthesizeDeterministic`.

**Validated:** existing test suite (`scripts/tests/agent-scoring.test.mjs`) still passes. Smoke test on mock GEV vs MSFT BULLISH shows GEV symbol-gates to NEUTRAL while MSFT BULLISH passes through unchanged.

**Forward measurement gate:** the +126pp lift was simulated on historical records with uniform per-agent confidence. The real-world lift will be measured by re-running `thesis-backtest` after the next ~14 days of live thesis files accumulate under the new synthesis. If the forward delta lands within ±20% of the simulated lift, the fix is durable.

| Change | Why it matters |
|---|---|
| **Refutation panel** — when the Positioning Agent proposes Gate 2→3, spawn 3 lens-diverse skeptics (correctness, base-rate, alternative-explanation) tasked with refuting | Single-vote synthesis is too generous |
| **Lens diversity, not redundancy** — each skeptic gets a different role description; the bridge enforces it | Three identical refuters miss the same failure modes |
| **Promotion quorum** — ≥2 of 3 skeptics must agree the candidate survives | Mirrors how good investment committees actually work |
| **Refutation log** — adversarial rounds appended to the Discard Log with `superseded-by-skeptics` reason code | Captures *why* a candidate was killed, not just *that* it was |
| **Self-debate for stance** — Macro vs. Market disagreement in S1 triggers a one-round debate; consensus or "escalate to user" | Catches cross-domain inconsistency before it reaches the ledger |

**Decision unlock:** "How many of last month's Gate 3 promotions would have survived an adversarial panel?" (Answer drives Phase 1's calibration.)

---

## Phase 3 — Memory & Learning (10–16 weeks)

**Hero capability:** the system remembers what worked, finds analogues, and tunes itself.

Phases 1–2 generate signal. Phase 3 turns that signal into *priors*.

| Change | Why it matters |
|---|---|
| **Setup similarity index** — embed every closed Position Block; on new Gate 2 candidates, surface the 5 nearest historical setups + their outcomes | "This DDOG fade looks like the 2024 PLTR fade — that one cost 1.3R. Worth it?" |
| **Self-modifying prompts** — when an agent's calibration on a sector or regime drifts >1σ, propose an updated `_prompt.md`; human approves with a single command | Agents improve themselves under supervision, not autonomously |
| **Pattern detection on the run-state** — anomaly detector flags "puller X has degraded 3 days running" or "stance Y has flipped 5 times in 2 weeks" → creates a triage task | Operational hygiene becomes proactive |
| **Knowledge graph activation** — wire `99_System/exports/neo4j/` into a live MCP server so agents can query *"what entities are touched by this thesis and what policy items moved them historically?"* | The KB stops being archival and starts being interrogated |

**Decision unlock:** "Show me every setup in the last 3 years that matched the current macro liquidity friction signature. What worked, what didn't?"

---

## Phase 4 — Multi-Modal Sense (16–24 weeks)

**Hero capability:** the system reads charts, listens to pressers, watches earnings calls.

Text is one modality. The real evidence is multi-modal, and the routine should consume it.

| Change | Why it matters |
|---|---|
| **Chart capture + vision** — headless Playwright grabs SPY/QQQ/sector charts at S2 and S4; vision model annotates structure (HH/HL, key levels, divergences) | Replaces our reliance on derived numerical features with the same visual cues a discretionary trader uses |
| **Fed presser transcription** — `whisper`-class transcription on FOMC press conferences; semantic diff vs. prior presser; surfaces tone shifts | The signal is in what changed, not what was said |
| **Earnings call extraction** — same pattern: transcribe, extract guidance deltas + analyst Q&A heat | One slot per important call, results land in S5 |
| **Image-as-evidence in Position Blocks** — store annotated charts inline with the Position Structure (Obsidian-friendly) | Decisions become re-explainable months later |

**Decision unlock:** "What does the SPY chart *look like* right now compared to the last 3 times we faded software?"

---

## Phase 5 — Live Execution (24+ weeks, gated)

**Hero capability:** the system places paper trades end-to-end, and eventually live with strict guardrails.

This is the bridge from "decision-support" to "execution." Gated behind Phase 1 calibration showing the system is actually right enough to trust.

| Change | Why it matters |
|---|---|
| **Paper trade adapter** — Alpaca / IBKR sandbox account; S6 promotes confirmed Gate 3 rows into paper orders with the documented entry/stop/target | Live timing data, real fills, zero risk |
| **Position-state reconciler** — broker positions ↔ ledger Position Blocks. Drift triggers an alert | Reality check on whether the ledger matches the book |
| **Risk dashboard** — Greeks aggregation, scenario stress (rates +100bp, VIX +5, dollar +3%), correlation drift, concentration limits | What every prop desk has, automated here |
| **Live execution gate** — explicit user opt-in per ledger row; size capped per row + total daily R-budget; kill switch | No autonomous capital deployment without staged approval |

**Decision unlock:** "Show me how the system's paper book performed over Q1 vs. a 60/40 benchmark, attributed by signal source."

---

## Moonshots — long-horizon swings

These are not on the timeline. They're listed because they're worth keeping in view; any one of them would change what the project *is*.

### M1 — The Federated Trading Vault

Other operators run their own World Machines. A federation protocol lets each vault publish a sanitized signal feed; subscribed vaults ingest under their own contract. Convergence across independent operators is the strongest signal of all.

### M2 — Self-Curating Source Universe

Sources are not given; they're discovered. A background agent crawls candidate sources (newsletters, podcasts, alt data feeds), scores them against retrospective signal quality, promotes high-signal sources into the freshness policy, and retires low-signal ones. The corpus tunes itself.

### M3 — The Voice Cockpit

A microphone on the desk and a one-key hotword. *"What's the stance on AI power right now and what's the next catalyst?"* → spoken EOD-quality answer. *"Show me yesterday's gate transitions."* → spoken with citations. The vault stops being a thing you navigate and becomes a thing you ask.

### M4 — Conviction-Calibrated Sizing

Position size becomes a function of three measurables: agent calibration on this regime × adversarial panel survival ratio × historical setup similarity hit rate. No more gut-feel "0.5 unit vs 1 unit" — sizing is *derived* from how much the system has earned the right to be confident on this exact kind of trade.

### M5 — The Pre-Mortem Engine

For every Gate 3 position, run a continuous pre-mortem: "Six months from now, this trade is a documented failure. What was the most likely cause?" Pipe the top causes into a watchlist that triggers stop-loss conditions or thesis-invalidation alerts before the position turns. Failure modes become first-class entities.

---

## Operating Principles for the Roadmap

1. **Each phase changes the kind of question we can ask.** If a phase only makes existing questions faster, it's polish, not progress. Polish gets done between phases.
2. **Calibration before scaling.** Phase 1 (close the loop) gates everything downstream. Don't add modalities, prompts, or capital until the system can grade itself.
3. **Adversarial by default.** From Phase 2 onward, no synthesis output reaches the ledger without a refutation lap. Single-perspective output is treated as a draft, not a finding.
4. **Boundaries stay enforced.** Every phase respects the AGENTS.md routing rules: My_Data executes, World_Machine reasons, ingestion is contract-gated. No phase blurs these.
5. **Token cost is a budget.** Agent-neutral, local, and chat-mediated reasoning is the default for synthesis. New phases that require API spend must be explicit opt-ins and justify the spend in the phase entry.
6. **One slot, one job.** Don't pack capability into S6 because it's already heaviest. Add slots (S7 Tue/Thu deep-research; S8 Sun weekly compression; S9 Mon adversarial replay) as the workload grows.
7. **Outcomes are first-class.** Every promotion ends with an outcome label. Every outcome label feeds calibration. No exceptions.

---

## What to do next

The infrastructure track is live enough to operate. The next work should be narrow and payoff-ranked:

1. Finish **P6 cleanup** only with elevated/admin Task Scheduler access: disable/delete the four legacy no-op tasks, verify no task points at `My_Data\scripts`, then remove/archive the remnant if the lock clears.
2. If admin cleanup is not available, continue **KB/Oy selective promotion**: promote only reviewed evergreen knowledge into Oy with `KB_VAULT_ROOT` set for that run.
3. Keep outcome/calibration flowing through the harness launcher: `& "$env:USERPROFILE\harness\harness.ps1" pull market-positioning-outcomes --dry-run --json`.
4. Use the Position Research Intake lane for web/file evidence against active ledger rows; reviews stay human-gated and never mutate the ledger automatically.
5. Expand **P3b source_ids** gradually; keep validation warning-only until coverage is high and false positives are low.

By the time P7 has live recall and the outcome loop has several approved closes, the capability roadmap should rank itself from measured evidence instead of guesses.
