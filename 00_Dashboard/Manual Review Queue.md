---
title: "Manual Review Queue"
type: "dashboard"
tags: ["dashboard", "review-queue", "orchestrator"]
---

# Manual Review Queue

Active items from the latest Streamline Report requiring human review or journaling.

## Open Review Items (unreviewed / review required)

```dataview
TABLE
  signal_status AS "Status",
  domain AS "Domain",
  date_pulled AS "Date"
FROM "05_Data_Pulls"
WHERE (signal_status = "alert" OR signal_status = "critical")
  AND ack_status != "reviewed"
  AND ack_status != "ignored"
SORT signal_status DESC, date_pulled DESC
LIMIT 25
```

## All Alert-Level Notes (last 14 days)

```dataview
TABLE
  signal_status AS "Status",
  domain AS "Domain",
  date_pulled AS "Date",
  ack_status AS "Disposition"
FROM "05_Data_Pulls"
WHERE (signal_status = "alert" OR signal_status = "critical")
  AND date(date_pulled) >= date(today) - dur(14 days)
SORT date_pulled DESC
LIMIT 50
```
