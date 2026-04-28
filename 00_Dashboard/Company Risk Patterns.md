---
title: "Company Risk Patterns"
type: "dashboard"
tags: [dashboard, company-risk, risk-pattern]
last_updated: ""
---

# Company Risk Patterns

Pattern library overview. Each pattern is a reusable deception template. One signal = noise. Multiple aligned patterns = insight.

> **Principle:** Patterns > Opinions. Build the library first, then match to companies.

---

## Pattern Library

All known deception patterns. Use the `Risk_Pattern` template in `03_Templates/` to add new ones.

```dataview
TABLE WITHOUT ID
  choice(severity = "High", "🔴",
    choice(severity = "Medium", "🟠", "🟡")) AS "Sev",
  file.link AS "Pattern",
  pattern_type AS "Type",
  severity AS "Severity"
FROM "12_Company_Risk/Patterns"
WHERE node_type = "risk_pattern"
SORT severity DESC, pattern_type ASC
```

---

## Recent Transactions

Suspicious or notable asset/money movements.

```dataview
TABLE WITHOUT ID
  choice(confidence = "High", "🔴",
    choice(confidence = "Medium", "🟠", "🟡")) AS "Conf",
  file.link AS "Transaction",
  company AS "Company",
  transaction_type AS "Type",
  date AS "Date"
FROM "12_Company_Risk/Transactions"
WHERE node_type = "risk_transaction"
SORT date DESC
LIMIT 20
```

---

## Entity Network

Related entities (shells, persons, funds) in the risk network.

```dataview
TABLE WITHOUT ID
  file.link AS "Entity",
  entity_type AS "Type",
  length(known_connections) AS "Connections"
FROM "12_Company_Risk/Entities"
WHERE node_type = "risk_entity"
SORT length(known_connections) DESC
```

---

## Risk Score Distribution

```dataview
TABLE WITHOUT ID
  file.link AS "Company",
  ticker AS "Ticker",
  risk_score AS "Score",
  choice(risk_score >= 60, "High Priority",
    choice(risk_score >= 40, "Elevated Risk",
      choice(risk_score >= 20, "Watchlist", "Normal"))) AS "Band"
FROM "12_Company_Risk/Companies"
WHERE node_type = "company_risk"
SORT risk_score DESC
```
