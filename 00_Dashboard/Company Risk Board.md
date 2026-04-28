---
title: "Company Risk Board"
type: "dashboard"
tags: [dashboard, company-risk]
last_updated: ""
---

# Company Risk Board

Main operator surface for the Company Risk Intelligence system. Tracks watchlist status, recent evidence events, and pattern exposure across all monitored companies.

---

## Active Watchlist

Companies sorted by risk score. Add companies using the `Company_Risk` template in `03_Templates/`.

```dataview
TABLE WITHOUT ID
  choice(risk_score >= 60, "🔴",
    choice(risk_score >= 40, "🟠",
      choice(risk_score >= 20, "🟡", "⚪"))) AS "Level",
  file.link AS "Company",
  ticker AS "Ticker",
  sector AS "Sector",
  status AS "Status",
  risk_score AS "Score",
  gap_score AS "Gap",
  last_updated AS "Updated"
FROM "12_Company_Risk/Companies"
WHERE node_type = "company_risk" AND status != "Archived"
SORT risk_score DESC
```

---

## Recent Events

Latest 30 evidence notes across all monitored companies.

```dataview
TABLE WITHOUT ID
  choice(severity = "High", "🔴",
    choice(severity = "Medium", "🟠", "🟡")) AS "Sev",
  file.link AS "Event",
  company AS "Company",
  event_type AS "Type",
  date AS "Date",
  confidence AS "Confidence"
FROM "12_Company_Risk/Events"
WHERE node_type = "risk_event"
SORT date DESC
LIMIT 30
```

---

## Pattern Exposure by Company

Companies with the most pattern matches — high counts indicate systemic risk signals.

```dataview
TABLE WITHOUT ID
  file.link AS "Company",
  risk_score AS "Score",
  length(pattern_matches) AS "Patterns",
  gap_score AS "Gap Score",
  status AS "Status"
FROM "12_Company_Risk/Companies"
WHERE node_type = "company_risk"
SORT length(pattern_matches) DESC
```

---

## Archived

```dataview
TABLE WITHOUT ID
  file.link AS "Company",
  ticker AS "Ticker",
  risk_score AS "Final Score",
  last_updated AS "Archived"
FROM "12_Company_Risk/Companies"
WHERE status = "Archived"
SORT last_updated DESC
```
