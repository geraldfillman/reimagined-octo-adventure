---
title: Signal Board
type: cockpit-board
status: active
tags: [cockpit, signals]
---

# Signal Board

```dataview
TABLE WITHOUT ID name AS "Signal", scope AS "Scope", signal_status AS "Status",
  direction AS "Direction", confidence AS "Confidence", evidence_count AS "Evidence", date AS "Date"
FROM "00_Cockpit/_data"
WHERE type = "signal-row" AND contains(["critical", "alert"], signal_status)
SORT signal_status ASC, scope ASC, name ASC
```

## Watch Items

```dataview
TABLE WITHOUT ID name AS "Signal", scope AS "Scope", direction AS "Direction",
  confidence AS "Confidence", evidence_count AS "Evidence", date AS "Date"
FROM "00_Cockpit/_data"
WHERE type = "signal-row" AND signal_status = "watch"
SORT scope ASC, name ASC
```
