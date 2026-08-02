---
title: "Company Intel Board"
type: "dashboard"
tags: [dashboard, company-intel]
---

# Company Intel Board

Operator surface for the EDGAR Company Deconstruction system. Method: [[04_Reference/EDGAR_Company_Deconstruction_Framework]] · Map: [[000-moc/moc-company-intel]]

> **State legend:** 🟢 green — machine clear, improving, filing-supported · 🟡 yellow — plausible but needs proof · 🟠 orange — description outrunning evidence · 🔴 red — narrative conflicts with filings

---

## Attention First — Orange / Red

```dataview
TABLE ticker, overall_state, one_liner, last_updated
FROM "13_Company_Intel/Companies"
WHERE node_type = "company_intel" AND (overall_state = "orange" OR overall_state = "red")
SORT last_updated ASC
```

## Coverage

```dataview
TABLE ticker, overall_state, research_status, confidence, one_liner, last_updated
FROM "13_Company_Intel/Companies"
WHERE node_type = "company_intel"
SORT last_updated DESC
```

## Thesis-Relevant Findings

```dataview
TABLE ticker, classification, machine_effect, thesis_impact, evidence_filing
FROM "13_Company_Intel/Findings"
WHERE node_type = "intel_finding" AND (thesis_impact = "negative-revision" OR thesis_impact = "positive-revision" OR thesis_impact = "thesis-broken")
SORT date DESC
LIMIT 20
```

## Unresolved / Monitoring

```dataview
TABLE ticker, classification, machine_effect, evidence_filing, date
FROM "13_Company_Intel/Findings"
WHERE node_type = "intel_finding" AND (classification = "unresolved" OR thesis_impact = "monitor")
SORT date DESC
LIMIT 25
```

## Recent Findings Feed

```dataview
TABLE ticker, classification, thesis_impact, date
FROM "13_Company_Intel/Findings"
WHERE node_type = "intel_finding"
SORT date DESC
LIMIT 30
```

## Filing Baseline Freshness

```dataview
TABLE symbol, data_type, date_pulled, signal_status
FROM "05_Data_Pulls/Edgar"
SORT date_pulled DESC
LIMIT 20
```

## Stale Dossiers (no review in 90+ days)

```dataview
TABLE ticker, research_status, last_updated
FROM "13_Company_Intel/Companies"
WHERE node_type = "company_intel" AND research_status != "Archived" AND last_updated != "" AND date(last_updated) < date(today) - dur(90 days)
SORT last_updated ASC
```

---

## CLI

```powershell
node run.mjs edgar scaffold --ticker NVDA        # create dossier from template with CIK, sector, fiscal year-end
node run.mjs edgar baseline --ticker NVDA        # filing inventory pull note (10-K/10-Q/8-K/DEF 14A/insiders/13D-G/offerings)
node run.mjs edgar facts --ticker NVDA           # XBRL financial skeleton pull note (revenue → FCF → shares)
```
