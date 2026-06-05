---
type: ingestion-contract
version: 1
created: 2026-06-02
last_reviewed: 2026-06-02
source_vault: My_Data
target_vault: World_Machine
companion_docs:
  - "[[AGENTS]]"
  - "[[README]]"
  - "../../My_Data/AGENT_RUNBOOK.md"
tags:
  - ingestion
  - automation
  - contract
---

# World_Machine Ingestion Contract

The rules that govern what `My_Data` is allowed to drop into this vault, in what shape, and where. The runbook on the `My_Data` side will reject packets that don't conform, log the rejection in the [[Market Positioning Ledger - Discard Log]], and continue.

## Allowed Drop Zones

| Zone | Purpose | Who writes |
|---|---|---|
| `_Inbox/00_Triage/` | Generic candidate packets pending routing | Any My_Data slot |
| `_Inbox/10_Themes/` | Theme-tagged candidates (Fed, AI Power, etc.) | Routed by theme metadata |
| `_Inbox/20_Sectors/` | Sector-tagged candidates | Routed by sector metadata |
| `_Inbox/90_Ready_to_Route/` | Packets that the agent considers complete and ready for World_Machine promotion | Synthesis steps only |
| `Reports/Premarket/` | S1 premarket reports | S1 synthesis |
| `Reports/Midday/` | S3 midday snapshots | S3 |
| `Reports/Preclose/` | S4 preclose monitoring | S4 |
| `Reports/EOD/` | S6 end-of-day reports | S6 |
| `Reports/Daily/` | Other daily briefings | Any slot |
| `Reports/Freshness/` | Generated freshness summaries | S6 |
| `Reports/Inbox Reports/` | Manual/scheduled inbox ingestion batch reports | Inbox ingestion bridge |

Anything outside these zones is **out of scope** for automated ingestion. Canonical object notes (`Entities/`, `Macro/`, `Policy/`, `Politics/`) are user-curated only.

## Required Frontmatter (all packets)

```yaml
---
type: <packet-type>           # premarket-snapshot, eod-report, thesis-check, candidate, etc.
source_vault: My_Data
generated_by: <slot>          # S1 / S2 / S3 / S4 / S5 / S6
generator_script: <path>      # scripts/pullers/<name>.mjs
created: YYYY-MM-DD
slot_run_id: <iso8601>        # matches _state/run-state.json run_id
freshness_window: <ttl-code>  # from FRESHNESS_POLICY.md
signal_status: <gate>         # raw / eligible / candidate / triggered / reviewed
links_to:                     # canonical objects this packet references
  - "[[Entities/...]]"
  - "[[Macro/...]]"
tags:
  - <required-tags-below>
---
```

A packet missing `type`, `source_vault`, `generated_by`, or `created` is **rejected** with reason `frontmatter-missing` and logged to the Discard Log.

## Required Tags by Type

| Packet type | Required tags |
|---|---|
| `premarket-snapshot` | `reports`, `premarket`, `automation` |
| `midday-snapshot` | `reports`, `midday`, `automation` |
| `preclose-snapshot` | `reports`, `preclose`, `automation` |
| `eod-report` | `reports`, `eod`, `automation` |
| `thesis-check` | `thesis`, `review`, `automation` |
| `candidate` | `triage`, `candidate`, `automation` |
| `freshness-summary` | `reports`, `freshness`, `automation` |

## Content Rules

1. **Link-first.** Every reference to an entity, indicator, regime, policy item, or watchpoint must use a `[[wiki-link]]` to the canonical note. Plain-text mentions are flagged for review.
2. **No raw tables.** Long data tables stay in `My_Data`. Packets carry summaries with a link back to the source run directory (e.g., `My_Data/01_Data_Sources/Macro/_runs/<date>/macro-bridges.md`).
3. **Strategy-expression compliance.** No position-management verbs (`reduce`, `trim`, `hold`, `add`, `hedge exposure`) unless an explicit active position is documented in the linked watchpoint. Use `stand aside`, `prepare a fresh entry`, etc. per [[AGENTS#Strategy Expression Rules|AGENTS.md §Strategy Expression Rules]].
4. **Path repair.** If imported content references `08_Entities/` or `09_Macro/`, rewrite to `Entities/` and `Macro/` before drop.
5. **No duplicate canonical notes.** Packets must not create new files under `Entities/`, `Macro/`, `Policy/`, or `Politics/` — only link to existing canonical notes.
6. **No node_modules, scripts, or executables.** Per [[AGENTS]]: automation stays in `My_Data`.

## Routing Rules (slot → drop zone)

| Slot | Default drop zone | Conditional drops |
|---|---|---|
| S1 | `Reports/Premarket/<date>.md` | `_Inbox/00_Triage/` for Gate Δ candidates |
| S2 | `_Inbox/00_Triage/` | `_Inbox/20_Sectors/` if breadth thrust |
| S3 | `_Inbox/00_Triage/` | `Reports/Midday/<date>.md` if a thesis is invalidated |
| S4 | `Reports/Preclose/<date>.md` | `_Inbox/00_Triage/` for crowding-score spikes |
| S5 | `_Inbox/00_Triage/` | `_Inbox/10_Themes/Fed Speeches and FOMC Communications/` for Fed catalysts |
| S6 | `Reports/EOD/<date>.md` | Ledger sidecar updates (Positions, Discard Log) |

## Ledger-Update Permissions

Only S6 (EOD slot) is allowed to mutate:

- `_Inbox/Market Positioning Ledger.md`
- `_Inbox/Market Positioning Ledger - Positions.md`
- `_Inbox/Market Positioning Ledger - Discard Log.md`

Other slots may propose ledger changes by dropping a candidate in `_Inbox/00_Triage/` with `type: ledger-proposal` and `signal_status: candidate`. S6 reconciles and applies.

## Rejection Reasons

The runner logs any rejected packet with one of these codes:

| Code | Meaning |
|---|---|
| `frontmatter-missing` | Required fields absent |
| `wrong-drop-zone` | Packet routed outside allowed zones |
| `tag-missing` | Required tag for type absent |
| `position-language-violation` | Position-management verb used without an active position |
| `raw-table-too-large` | Inline table > 50 rows; should link to My_Data run |
| `canonical-write-attempt` | Packet attempted to create a new canonical note |
| `path-unrepaired` | Stale `08_Entities/` or `09_Macro/` paths present |
| `duplicate-of` | Same content hash already exists in target zone (cite the existing note) |

Rejections are logged to `World_Machine/_Inbox/Market Positioning Ledger - Discard Log.md` under the appropriate reason code and dropped from the run.

## Versioning

When this contract changes:

1. Bump the `version` field in frontmatter.
2. Log the change in `World_Machine/Reports/Freshness/_contract-changelog.md`.
3. Update `My_Data/AGENT_RUNBOOK.md`'s `companion_docs` reference if path changes.
