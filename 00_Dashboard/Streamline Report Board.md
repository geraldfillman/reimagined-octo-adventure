---
title: "Streamline Report Board"
type: "dashboard"
tags: ["dashboard", "streamline-report", "orchestrator"]
---

# Streamline Report Board

```dataview
TABLE
  signal_status AS "Status",
  active_review_count AS "Queue",
  coverage_gap_count AS "Gaps",
  new_since_last_report AS "New",
  resolved_since_last_report AS "Resolved",
  failed_agent_count AS "Failed Agents",
  cadence AS "Cadence"
FROM "05_Data_Pulls/Orchestrator"
WHERE data_type = "streamline_report"
SORT date_pulled DESC
LIMIT 14
```

## Weekly Trend (last 4 weeks)

```dataview
TABLE
  signal_status AS "Status",
  active_review_count AS "Queue",
  coverage_gap_count AS "Gaps",
  cadence AS "Cadence"
FROM "05_Data_Pulls/Orchestrator"
WHERE data_type = "streamline_report" AND cadence = "weekly"
SORT date_pulled DESC
LIMIT 4
```
