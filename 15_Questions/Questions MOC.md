---
node_type: moc
title: Questions MOC
description: Index of all open research questions across theses, sectors, and macro.
tags: [moc, question]
---

# Questions MOC

## Open — High Urgency

```dataview
TABLE
  question_text AS "Question",
  linked_thesis AS "Thesis",
  owner AS "Owner",
  opened_date AS "Opened"
FROM "15_Questions"
WHERE node_type = "question" AND status = "open" AND urgency = "high"
SORT opened_date ASC
```

## Open — Medium / Low Urgency

```dataview
TABLE
  question_text AS "Question",
  linked_thesis AS "Thesis",
  owner AS "Owner",
  urgency AS "Urgency",
  opened_date AS "Opened"
FROM "15_Questions"
WHERE node_type = "question" AND status = "open" AND urgency != "high"
SORT urgency ASC, opened_date ASC
```

## In Review

```dataview
TABLE
  question_text AS "Question",
  linked_thesis AS "Thesis",
  owner AS "Owner"
FROM "15_Questions"
WHERE node_type = "question" AND status = "in-review"
SORT opened_date ASC
```

## Resolved

```dataview
TABLE
  question_text AS "Question",
  resolution_summary AS "Resolution",
  resolved_date AS "Resolved"
FROM "15_Questions"
WHERE node_type = "question" AND status = "resolved"
SORT resolved_date DESC
LIMIT 20
```

## Stale

```dataview
TABLE
  question_text AS "Question",
  opened_date AS "Opened",
  owner AS "Owner"
FROM "15_Questions"
WHERE node_type = "question" AND status = "stale"
SORT opened_date ASC
```
