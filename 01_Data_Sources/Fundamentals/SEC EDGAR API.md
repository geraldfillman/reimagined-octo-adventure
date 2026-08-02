---
name: SEC EDGAR API
category: Fundamentals
type: API
provider: "U.S. Securities and Exchange Commission"
pricing: Free
status: Active
priority: Foundation
url: "https://www.sec.gov/search-filings/edgar-application-programming-interfaces"
provides:
  - Company filings (10-K, 10-Q, 8-K, DEF 14A, 3/4/5, 13D/G, S-1/S-3, 424B, 144, SD)
  - Company submissions index (data.sec.gov/submissions)
  - XBRL company facts (data.sec.gov/api/xbrl/companyfacts)
  - Full-text filing search (efts.sec.gov)
best_use_cases:
  - Filing baseline packages for company deconstruction
  - Financial skeleton from XBRL facts
  - Filing alerts and event tracking
  - Company research
tags:
  - fundamentals
  - edgar
  - company-intel
related_sources: ["[[01_Data_Sources/Fundamentals/SEC EDGAR Search]]", "[[01_Data_Sources/Fundamentals/EDGAR Dilution Monitor]]"]
key_location: "None required"
integrated: true
linked_puller: edgar
update_frequency: "Real-time filings; pulled on demand and per company review cadence"
owner: operator
last_reviewed: 2026-08-01
notes: Primary-source gold mine. Backbone of the Company Intel deconstruction system.
---

## Summary

- Free, keyless SEC APIs: submissions index per CIK, XBRL company facts, and full-text search. Primary-source gold mine and the backbone of the Company Intel system ([[000-moc/moc-company-intel]]).

## What It Provides

- Company filings: 10-K, 10-Q, 8-K, DEF 14A, Forms 3/4/5, 13D/13G, 13F, S-1/S-3, 424B, 144, SD, 20-F/6-K
- `data.sec.gov/submissions/CIK##########.json` — full filing inventory per company
- `data.sec.gov/api/xbrl/companyfacts/CIK##########.json` — all XBRL facts (revenue, cash flow, shares, debt...)
- `efts.sec.gov/LATEST/search-index` — full-text search across filings
- `sec.gov/files/company_tickers.json` — ticker → CIK map

## Use Cases

- `node run.mjs edgar baseline --ticker X` — filing baseline package (framework §5)
- `node run.mjs edgar facts --ticker X` — XBRL financial skeleton
- `node run.mjs edgar scaffold --ticker X` — pre-filled company dossier
- `node run.mjs pull sec --thesis` — thesis-routed 8-K scanning (existing)

## Integration Notes

**Status**: Integrated — `scripts/lib/edgar.mjs` (shared client) + `scripts/pullers/edgar-company.mjs` + `scripts/pullers/sec.mjs`
**API Key Required**: None (declared User-Agent required)
**Rate Limits**: SEC guidance max 10 req/s; client throttles to ≥150ms between requests
**Update Frequency**: Filings appear near real-time
**Data Format**: JSON

## Related Sources

- [[01_Data_Sources/Fundamentals/SEC EDGAR Search]]
- [[01_Data_Sources/Fundamentals/EDGAR Dilution Monitor]]
