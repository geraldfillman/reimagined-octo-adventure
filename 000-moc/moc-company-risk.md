---
title: "MOC: Company Risk Intelligence"
type: "moc"
tags: [moc, company-risk]
---

# MOC: Company Risk Intelligence

Pattern recognition system for identifying misalignment between narrative and structural reality across companies.

> **Core Lens:** Always compare what is being *said* vs. what the *structure and data* show.

---

## Operator Surfaces

- [[00_Dashboard/Company Risk Board]] — Active watchlist, recent events, pattern exposure
- [[00_Dashboard/Company Risk Patterns]] — Pattern library, entity network, transaction log

---

## Companies

```dataview
LIST
FROM "12_Company_Risk/Companies"
WHERE node_type = "company_risk"
SORT risk_score DESC
```

---

## Pattern Library

```dataview
LIST
FROM "12_Company_Risk/Patterns"
WHERE node_type = "risk_pattern"
SORT file.name ASC
```

---

## Recent Events

```dataview
LIST
FROM "12_Company_Risk/Events"
WHERE node_type = "risk_event"
SORT date DESC
LIMIT 15
```

---

## Entity Network

```dataview
LIST
FROM "12_Company_Risk/Entities"
WHERE node_type = "risk_entity"
SORT file.name ASC
```

---

## Risk Scoring Model

| Component | Max | Key Signals |
|-----------|-----|-------------|
| Regulatory | 40 | FDA letter +15, Recall +10, Repeat +15 |
| Sentiment | 25 | Negative spike +10, Complaints +10, Narrative conflict +5 |
| Fundamental | 35 | Revenue slowdown +10, Margin decline +10, Cash/debt stress +10, Restatement +5 |

**Risk Levels:** 0–19 Normal · 20–39 Watchlist · 40–59 Elevated · 60+ High Priority

---

## Weekly Workflow

1. **Scan** (30–60 min) — FDA, news/sentiment, SEC filings
2. **Log Events** — Create 1–3 event notes max from `03_Templates/Risk_Event`
3. **Match Patterns** — Link events to known patterns
4. **Update Company** — Add event links, update pattern matches, adjust risk score

---

## Templates

- [[03_Templates/Company_Risk]] — Company node
- [[03_Templates/Risk_Event]] — Atomic evidence note
- [[03_Templates/Risk_Pattern]] — Deception pattern
- [[03_Templates/Risk_Entity]] — Shell entity / person / fund
- [[03_Templates/Risk_Transaction]] — Money/asset movement

---

## Key Principles

1. **Store evidence, not conclusions** — Use "risk signal" not "fraud"
2. **Patterns > Opinions** — One signal = noise; multiple aligned = insight
3. **Narrative vs Reality is the core lens**
4. **Build over time** — Start with 10 companies, 10 patterns, 20–30 events
