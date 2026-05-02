---
title: "Orchestrator Coverage Gaps"
type: "dashboard"
tags: ["dashboard", "coverage", "orchestrator"]
---

# Orchestrator Coverage Gaps

Shows days where the Streamline Report detected missing module evidence.

```dataview
TABLE
  coverage_gap_count AS "Gaps",
  signal_status AS "Status",
  active_review_count AS "Queue"
FROM "05_Data_Pulls/Orchestrator"
WHERE data_type = "streamline_report" AND coverage_gap_count > 0
SORT date_pulled DESC
LIMIT 30
```

## Run Ledger — Recent Failures

```dataview
TABLE
  date_pulled AS "Date"
FROM "05_Data_Pulls/Orchestrator"
WHERE contains(tags, "run-ledger") AND failed_count > 0
SORT date_pulled DESC
LIMIT 10
```
