---
type: positioning-discard-log
parent: "[[Market Positioning Ledger]]"
cadence: weekly-append
created: 2026-06-02
last_reviewed: 2026-06-02
tags:
  - positioning
  - audit
  - discard-log
---

# Market Positioning Ledger — Discard Log

Append-only audit of items deduped, demoted, archived, or filtered out during ledger review. This is the "noise removed" surface — the [[Market Positioning Ledger]] is the signal; this log is the evidence that noise was actively filtered, not silently ignored.

**Rule:** every weekly review writes one batch row (even if empty — record "no discards"). Every Gate downgrade or archive move logs here with a reason code.

## Reason Codes

| Code | Meaning |
|---|---|
| `duplicate` | Same signal already represented by another active row. |
| `single-source` | Failed Gate 1 — no independent confirming source. |
| `stale-evidence` | Evidence aged past usefulness without trigger. |
| `noisy` | Alert fired repeatedly without decision edge. |
| `superseded-by` | A stronger/cleaner version replaced it (cite the replacement). |
| `invalidated` | Thesis explicitly broken by data/price action. |
| `out-of-scope` | Belongs in another vault surface (My_Data, Reports, Watchpoints). |
| `compressed-into` | Folded into a broader theme row (cite the target). |

## Discard Batches

### 2026-06-02 — Initial schema migration

| Item | Reason | Notes | Routed To |
|---|---|---|---|
| Generic "Broad thesis basket alerts" inline-trigger text | `compressed-into` | Trigger detail moved to watchpoint per [[AGENTS\|AGENTS.md]] §Signal Bridge Routing — ledger is a routing surface | _pending watchpoint_ |
| Free-text Outcome Status commentary | `superseded-by` | Replaced by canonical Outcome Labels enum | [[Market Positioning Ledger#Outcome Labels]] |
| Relative Value Pairs (previous structure) | `noisy` | Single-source price-only alerts; rebuild on new framework | [[500-archive/Stale/Positioning/_index\|Stale Positioning]] |

### 2026-06-03 — Phase B synthetic-seed reset (focused streamline)

Triggered by streamline audit `[[STREAMLINE_AUDIT]]` which found 11/11 Source Ref + Watchpoint references on active rows were fictional. All seven active rows + four Position Structure blocks were synthetic scaffolding authored when the ledger schema was first introduced. Archived in full to [[500-archive/Stale/Positioning/2026-06-03-seed/README|2026-06-03-seed]]. Phase D Regime Bootstrap later repopulated the Active Ledger from refreshed My_Data evidence on 2026-06-03.

| Item | Reason | Notes | Routed To |
|---|---|---|---|
| AI power/grid bottleneck (Gate 3, Press selectively) | `single-source` | Source Ref `My_Data/event-research/2026-05/ai-infra-scenarios.md` did not exist; Watchpoint link unresolved | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Active Ledger Rows]] |
| Software rally fade (Gate 2, Prepare) | `single-source` | Source Ref + Watchpoint both fictional; thesis was lifted from Crown Macro letter dated 2026-06-01 | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Active Ledger Rows]] |
| Macro liquidity friction (Gate 2, Observe) | `single-source` | Source Ref `My_Data/macro/fred/2026-05-rrp-liquidity.md` did not exist | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Active Ledger Rows]] |
| Momentum breadth (Gate 2, Prepare) | `single-source` | Source Ref `My_Data/fmp/market-performance/2026-05-week-22.md` did not exist | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Active Ledger Rows]] |
| Hard assets / metals (Gate 1, Observe) | `single-source` | Source Ref `My_Data/signal-intelligence/2026-05-29-metals.md` did not exist | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Active Ledger Rows]] |
| Relative Value Pairs (Gate 1, Archive/rebuild) | `noisy` | Already archive-flagged in original row; consolidated into seed archive | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Active Ledger Rows]] |
| Broad thesis basket alerts (Gate 1, Stand aside) | `single-source` | Source Ref `My_Data/scans/thesis-basket/2026-05.md` did not exist | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Active Ledger Rows]] |
| Portfolio House View (2026-06-01 snapshot from Crown letter) | `stale-evidence` | Bullish-equities / SOXX-tilt view sourced from one external publication, never refreshed against live FRED + market data | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Active Ledger Rows#archived-portfolio-house-view-as-of-2026-06-01]] |
| 4 Position Structure blocks (ai-power-grid-bottleneck, software-rally-fade, macro-liquidity-friction, momentum-breadth) | `superseded-by` | All four parent rows archived; blocks moved with them verbatim | [[500-archive/Stale/Positioning/2026-06-03-seed/Archived Position Blocks]] |

## Batch Template

```markdown
### YYYY-MM-DD — <review type: weekly / monthly / ad-hoc>

| Item | Reason | Notes | Routed To |
|---|---|---|---|
| <signal or row name> | `<reason-code>` | <one-line context> | <archive path or replacement link> |
```

## Monthly Roll-Up

At month-end, summarize discard counts per reason code and link from the matching `Reports/Monthly/` playback note.

| Month | Total Discards | Top Reason | Linked Report |
|---|---:|---|---|
| 2026-06 | 12 (initial-migration + seed-reset) | `single-source` (entire seed archived) | [[STREAMLINE_AUDIT]] |
