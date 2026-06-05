---
title: Macro Lens
type: reference
tags: [reference, macro, lens]
---
# Macro Lens

A **lens, not a partition.** The vault stays fully multi-domain (housing, biotech, defense, energy, frontier, macro). This lens lets you look at the vault *as a macroinvestment resource* — surfacing the housing / finance-macro / energy-climate / VC cluster, tracking how those theses move over time, and pulling the AI/agent opinion already generated for them — without removing or moving any content.

## What counts as "macro-core"

Membership is derived from the **existing `tags` array** on each thesis — no re-tagging, no new required field. A thesis is in the lens if its tags intersect this set:

```
macro · housing · real-estate · rates · fiscal · inflation
energy · power · grid · grid-equipment · storage · clean-energy · nuclear · utilities
capital-raise · dilution            (finance / VC special-situations)
```

Today that resolves to roughly: Dollar Debasement Hard Money, Housing Supply Correction, Fiscal Scarcity Rearmament, Grid Equipment Bottleneck, Grid-Scale Battery Storage, Nuclear Renaissance SMRs, AI Power Infrastructure, and Capital Raise Survivors. The set updates automatically as thesis tags change — nothing to maintain by hand.

To **pin** a thesis into the lens regardless of tags, add `macro-core` to its tags. To **exclude** one, the dashboard query is the single place to edit the tag list.

## What the lens gives you

- **[[00_Dashboard/Macro Lens Board]]** — the operator surface:
  - Macro theses ranked by conviction / allocation, with monitor + break-risk state.
  - **Progress over time** — a chronological trail of `monitor_change` entries so you can see how each thesis has moved review-to-review.
  - Supporting macro regimes and their state.
  - Recent macro signals and pull freshness (housing / macro / energy).
  - **AI opinion** — the latest orchestrator synthesis (signal-intelligence, opportunity-viewpoints, streamline-report) plus agent analyses, scoped to the macro cluster.
- **[[09_Macro/Macro Snapshot Log]]** — a monthly point-in-time record (regime + top-thesis conviction) for long-horizon progress tracking that survives even as pull notes age out under retention.

## How progress tracking works

Two complementary layers:

1. **Automatic (per-thesis trail).** Every thesis carries `monitor_status`, `monitor_last_review`, and `monitor_change`. The board renders these chronologically, so the movement history is always live — no extra step. `node run.mjs scan conviction --window 30` and the thesis scorecard scripts keep these fields current.
2. **Manual/cadenced (vault-level snapshot).** Once a month, append one row to [[09_Macro/Macro Snapshot Log]] capturing the regime call and the conviction of each macro-core thesis. This is the durable time series — it is intentionally tiny and never pruned, so a year from now you can see the arc even after the underlying pull notes have been archived to `World_Machine`.

## How AI opinion is surfaced

The vault already generates AI/agent commentary; the lens just concentrates the macro slice of it:

| Source | Folder | What it adds |
|--------|--------|--------------|
| Signal intelligence | `05_Data_Pulls/Orchestrator` | Convergence + lifecycle scoring across the macro cluster |
| Opportunity viewpoints | `05_Data_Pulls/Orchestrator` | Ranked opportunity reads over a rolling window |
| Streamline report | `05_Data_Pulls/Orchestrator` | One-note synthesis of the current tape |
| Agent analysis | `05_Data_Pulls/Market/*_Agent_Analysis_*` | Per-ticker agent opinion for macro-core entities |

Refresh them with the normal cadence (`node run.mjs pull signal-intelligence`, `pull opportunity-viewpoints`, `pull agent-analyst --all-thesis`); the board picks up the newest automatically.

## Extending the lens

- Add a domain to the cluster: edit the tag list in the board's two thesis queries (and the set above).
- Want a stricter macro-only vault view in Obsidian's graph: filter the graph by `tag:#macro OR tag:#housing OR tag:#energy`.
- This lens is additive and read-only over existing data — safe to delete or restyle without touching theses, signals, or pulls.
