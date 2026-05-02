---
name: "OpenCorporates"
category: "OSINT"
type: "API"
provider: "OpenCorporates Ltd"
pricing: "Free (limited) | Paid tiers for bulk/beneficial ownership"
status: "Active"
priority: "High"
url: "https://opencorporates.com"
provides:
  - "Global company registry data (200+ jurisdictions)"
  - "Registered agent and officer information"
  - "Corporate relationship mapping"
  - "Beneficial ownership data (paid)"
  - "Historical filings and dissolution records"
best_use_cases:
  - "Shell company and beneficial ownership research for Company Risk layer"
  - "Global subsidiary mapping for covered entities"
  - "Regulatory arbitrage detection (offshore entities)"
  - "Private company due diligence for VC/PE theses"
tags:
  - osint
  - company-risk
  - beneficial-ownership
  - corporate-intelligence
  - api
related_sources:
  - "[[ICIJ-OffshoreleaksDB]]"
  - "[[SEC EDGAR API]]"
  - "[[SEC XBRL Company Facts]]"
key_location: "OPENCORPORATES_API_KEY"
integrated: false
notes: "Free API: 500 req/day, basic company search. Paid API unlocks beneficial ownership graph, bulk queries, and officer networks. Most valuable for 12_Company_Risk/ entity enrichment."
---

## Summary

OpenCorporates is the largest open database of company information globally, covering 200+ jurisdictions. For investment research, it is the primary tool for **beneficial ownership mapping and subsidiary chain analysis** — especially for companies with offshore structures, which surface as red flags in the Company Risk layer.

## What It Provides

- Global company registry data (200+ jurisdictions)
- Registered agent and officer information
- Corporate relationship mapping (parent → subsidiary → officer)
- Beneficial ownership data (paid tier)
- Historical filings and dissolution records

## Use Cases

- Shell company and beneficial ownership research → `12_Company_Risk/`
- Global subsidiary mapping for covered entities
- Regulatory arbitrage detection (offshore entity chains)
- Private company due diligence for VC/PE theses (→ `10_Theses/`)

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Yes (OPENCORPORATES_API_KEY) — free tier available  
**Rate Limits**: Free: 500 req/day | Paid: varies by plan  
**Update Frequency**: On-demand per entity  
**Data Format**: JSON REST API  
**Base URL**: `https://api.opencorporates.com/v0.4/`

### Example API call

```bash
curl "https://api.opencorporates.com/v0.4/companies/search?q=Blackstone&api_token=$OPENCORPORATES_API_KEY"
```

### Key endpoints

| Endpoint | Purpose |
|----------|---------|
| `/companies/search` | Search by name |
| `/companies/:jurisdiction/:number` | Fetch company by registry ID |
| `/officers/search` | Find officers across jurisdictions |
| `/corporate_groupings/:name` | Corporate group structure |

## Related Sources

- [[ICIJ-OffshoreleaksDB]]
- [[SEC EDGAR API]]
- [[SEC XBRL Company Facts]]
