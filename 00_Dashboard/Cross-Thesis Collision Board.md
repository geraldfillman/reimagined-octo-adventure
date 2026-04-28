---
title: Cross-Thesis Collision Board
description: Surfaces events and signals that affect multiple theses simultaneously. Distinct from Cross-Domain Thesis Board (which is a thesis overview). This board is about collision events.
tags: [dashboard, synthesis]
---

# Cross-Thesis Collision Board

> One event, multiple theses. Find where your positions are correlated — and where they create opportunity or compounding risk.

---

## Auto-Detected Collisions
*Notes that wikilink to 2 or more thesis notes — potential collision events.*

```dataview
TABLE
  file.name AS "Note",
  file.folder AS "Type",
  length(filter(file.outlinks, (l) => contains(string(l), "10_Theses"))) AS "Thesis Links",
  file.mtime AS "Last Modified"
FROM ""
WHERE length(filter(file.outlinks, (l) => contains(string(l), "10_Theses"))) >= 2
  AND !contains(file.folder, "00_Dashboard")
  AND !contains(file.folder, "000-moc")
  AND !contains(file.folder, "03_Templates")
SORT length(filter(file.outlinks, (l) => contains(string(l), "10_Theses"))) DESC
LIMIT 20
```

---

## High-Value Collision Register
*Manually curated. Add rows for collisions that warrant explicit tracking.*

| Event / Signal | Theses Affected | Collision Type | First-Order Effect | Second-Order Effect | Confidence | Review Priority |
|----------------|-----------------|----------------|-------------------|---------------------|------------|-----------------|
| | | | | | | |

**Collision type options:** reinforcing · contradicting · correlated-risk · pivot-signal · regime-shift

---

## Proposed Bridge Notes Awaiting Approval

```dataview
TABLE
  bridge_id AS "Bridge",
  bridge_rationale AS "Rationale",
  source_notes AS "Connecting",
  confidence AS "Confidence",
  proposed_date AS "Proposed"
FROM "14_Bridge_Notes"
WHERE node_type = "bridge_note" AND status = "proposed"
SORT proposed_date ASC
```

---

## Approved Bridge Notes

```dataview
TABLE
  bridge_id AS "Bridge",
  bridge_rationale AS "Rationale",
  source_notes AS "Connecting",
  reviewed_date AS "Approved"
FROM "14_Bridge_Notes"
WHERE node_type = "bridge_note" AND status = "approved"
SORT reviewed_date DESC
LIMIT 10
```

---

## Conversation Area

### What Changed
*(New collisions this week)*

### What Matters
*(Highest-priority collision right now)*

### What Is Disputed
*(Any collision interpretation that is contested)*

### What to Review Next
*(Specific synthesis action or bridge note to propose)*
