---
title: Positioning Board
type: cockpit-board
status: active
tags: [cockpit, positioning]
---

# Positioning Board

```dataview
TABLE WITHOUT ID row AS "Thesis", stance AS "Stance", gate AS "Gate",
  outcome AS "Last Outcome", updated AS "Updated"
FROM "40_Decisions"
WHERE type = "ledger-row" AND gate >= 2
SORT gate DESC, updated DESC
```

## G2 Candidates

```dataview
TABLE WITHOUT ID row AS "Thesis", stance AS "Stance", updated AS "Updated"
FROM "40_Decisions"
WHERE type = "ledger-row" AND gate = 2
SORT updated DESC
```

## Recently Closed

```dataview
TABLE WITHOUT ID row AS "Thesis", outcome AS "Outcome", updated AS "Updated"
FROM "40_Decisions"
WHERE type = "ledger-row" AND outcome
SORT updated DESC
LIMIT 20
```

## Pending Research Confirmation

```dataview
TABLE WITHOUT ID file.link AS "Review", ledger_rows AS "Ledger Rows",
  evidence_stance AS "Stance", source_quality AS "Source", created AS "Created"
FROM "40_Decisions/Research_Inbox/Reviews"
WHERE type = "position-research-review" AND status = "pending_human_review"
SORT created DESC
LIMIT 20
```
