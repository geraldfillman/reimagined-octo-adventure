---
title: Delta Review
description: Shows only what changed in the last 7 days. Review change, not everything.
tags: [dashboard]
---

# Delta Review

> Review what changed. Skip what hasn't.

---

## New Signals (Last 7 Days)

```dataview
TABLE
  signal_id AS "Signal",
  severity AS "Severity",
  date AS "Date",
  file.outlinks AS "Linked To"
FROM "06_Signals"
WHERE node_type = "signal" AND date >= date(today) - dur(7 days)
SORT date DESC
```

---

## Theses with Recent Activity

```dataview
TABLE
  name AS "Thesis",
  conviction AS "Conviction",
  status AS "Status",
  file.mtime AS "Last Modified"
FROM "10_Theses"
WHERE node_type = "thesis"
SORT file.mtime DESC
LIMIT 10
```

---

## High-Value Notes Not Yet Human-Reviewed

```dataview
TABLE
  file.name AS "Note",
  file.folder AS "Folder",
  file.mtime AS "Last Modified"
FROM "10_Theses" OR "09_Macro"
WHERE (human_confidence = "" OR human_confidence = null) AND file.mtime >= date(today) - dur(7 days)
SORT file.mtime DESC
```

---

## Open Questions Added Recently

```dataview
TABLE
  question_text AS "Question",
  linked_thesis AS "Thesis",
  urgency AS "Urgency",
  owner AS "Owner",
  opened_date AS "Opened"
FROM "15_Questions"
WHERE node_type = "question" AND status = "open" AND opened_date >= date(today) - dur(7 days)
SORT urgency ASC, opened_date ASC
```

---

## New Cross-Thesis Links (Notes Referencing 2+ Theses)

```dataview
TABLE
  file.name AS "Note",
  file.folder AS "Folder",
  length(filter(file.outlinks, (l) => contains(string(l), "10_Theses"))) AS "Thesis Links",
  file.mtime AS "Last Modified"
FROM ""
WHERE length(filter(file.outlinks, (l) => contains(string(l), "10_Theses"))) >= 2
  AND file.mtime >= date(today) - dur(7 days)
  AND !contains(file.folder, "00_Dashboard")
SORT file.mtime DESC
LIMIT 15
```

---

## Proposed Bridge Notes Awaiting Review

```dataview
TABLE
  bridge_id AS "Bridge ID",
  bridge_rationale AS "Rationale",
  confidence AS "Confidence",
  proposed_date AS "Proposed"
FROM "14_Bridge_Notes"
WHERE node_type = "bridge_note" AND status = "proposed"
SORT proposed_date ASC
```
