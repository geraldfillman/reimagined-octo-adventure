---
name: "SAM.gov"
category: "Government_Contracts"
type: "API"
provider: "U.S. General Services Administration"
pricing: "Free"
status: "Active"
priority: "Foundation"
url: "https://api.sam.gov"
provides: ["entity-registrations", "contract-opportunities", "pre-award-pipeline"]
best_use_cases: ["gov contract intelligence", "pre-award pipeline tracking", "NAICS opportunity clustering"]
tags: ["sam-gov", "government-contracts", "pre-award", "entity-registration", "opportunities"]
related_sources: ["[[USASpending API]]", "[[FPDS public procurement data]]", "[[SAM.gov API]]"]
key_location: "SAM_GOV_API_KEY"
integrated: true
linked_puller: "sam"
update_frequency: "daily / on-demand"
owner: "CaveUser"
last_reviewed: "2026-03-26"
notes: "Detailed operating note for the SAM.gov integration and pull commands."
---

# SAM.gov

## Summary

- Federal government's primary pre-award contracting database covering entity registrations, solicitations, and pre-solicitation notices.
- Best used alongside `[[USASpending API]]` to track budget intent before awards are recorded post-award.

System for Award Management — the federal government's primary pre-award contracting database. Covers entity registrations, solicitations, and pre-solicitation notices. Complements USASpending (post-award) by providing visibility into the contracting pipeline before awards are made.

## Data Groups

| Group | API Endpoint | Auth Method | Notes |
|-------|-------------|-------------|-------|
| Entity Registrations | `/entity-information/v3/entities` | API key (query param) | Active registered vendors by NAICS |
| Contract Opportunities | `/prod/opportunity/v2/search` | `x-api-key` header | Solicitations & pre-solicitations |

## Pull Commands

```powershell
# Pull active entities for a NAICS code (default: 541715 — R&D in physical/engineering sciences)
node run.mjs sam --entities 541715

# Pull recent opportunities by keyword (default: "defense technology")
node run.mjs sam --opportunities "defense technology"

# Pull both with defaults
node run.mjs sam --all

# Custom combinations
node run.mjs sam --entities 336411 --opportunities "aircraft systems"
```

## Signal Thresholds

| Signal | Trigger | Severity |
|--------|---------|----------|
| Large Opportunity | Award amount exceeds threshold | HIGH |
| Opportunity Cluster | 5+ opportunities in same NAICS code | MEDIUM |

## Investment Relevance

**Why this matters for portfolio analysis:**

- **Pre-award pipeline**: Solicitations appear 30–180 days before USASpending records an award. SAM.gov signals budget intent before capital is deployed.
- **Vendor discovery**: Entity registrations reveal which companies are actively pursuing federal work in a NAICS sector — useful for identifying emerging defense/tech primes and sub-contractors.
- **Cluster detection**: A surge of solicitations in a NAICS code (e.g., 541715 R&D, 336411 Aircraft) signals a budget push in that sector — actionable for sector rotation and thematic ETF positioning.
- **Defense tech overlap**: Opportunities tagged with NAICS codes 541715, 336411, 334511 frequently surface dual-use technologies relevant to defense tech VC and public market positions.

## Related Sources

- [[USASpending]] — Post-award contract data (complements SAM pre-award)
- [[FPDS]] — Federal Procurement Data System (legacy award records)
- [[Beta_SAM_Search]] — Manual search interface at sam.gov
