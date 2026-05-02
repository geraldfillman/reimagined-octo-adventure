---
name: "ICIJ Offshore Leaks Database"
category: "OSINT"
type: "Web/API"
provider: "International Consortium of Investigative Journalists (ICIJ)"
pricing: "Free"
status: "Active"
priority: "High"
url: "https://offshoreleaks.icij.org"
provides:
  - "Panama Papers entity data"
  - "Pandora Papers entity data"
  - "Offshore Leaks, Bahamas Leaks, Paradise Papers"
  - "Shell company beneficial ownership chains"
  - "Officer and intermediary networks across offshore jurisdictions"
best_use_cases:
  - "Executive and entity screening for Company Risk layer"
  - "Short thesis due diligence on offshore structure opacity"
  - "Related-party transaction risk detection"
  - "Sanctions evasion pattern identification"
tags:
  - osint
  - company-risk
  - beneficial-ownership
  - offshore
  - sanctions
  - short-research
related_sources:
  - "[[OpenCorporates]]"
  - "[[SEC EDGAR API]]"
key_location: ""
integrated: false
notes: "No API key required. REST-style search available at offshoreleaks.icij.org/search. Also accessible via ICIJ's public Neo4j graph dataset for bulk queries. Cross-reference with 12_Company_Risk/Entities/."
---

## Summary

The ICIJ Offshore Leaks Database aggregates leaked data from the Panama Papers, Pandora Papers, Paradise Papers, Bahamas Leaks, and Offshore Leaks investigations — covering 810,000+ offshore entities across 200+ countries. For investment research, it is the fastest way to surface **opacity and related-party risk** in covered companies' beneficial ownership chains.

## What It Provides

- Panama Papers, Pandora Papers, Paradise Papers, Bahamas Leaks entities
- Shell company beneficial ownership chains
- Officer and intermediary networks across offshore jurisdictions
- Country-of-registration cross-reference for sanctions screening

## Use Cases

- Executive and entity screening → `12_Company_Risk/Entities/`
- Short thesis due diligence on offshore structure opacity
- Related-party transaction risk detection
- Sanctions evasion pattern identification

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No  
**Rate Limits**: Web scraping only (no official API); search endpoint is public  
**Update Frequency**: Updated with each major ICIJ investigation release  
**Data Format**: Web search results; bulk Neo4j graph dataset available for download  
**Search URL**: `https://offshoreleaks.icij.org/search?q=<entity_name>`

### Bulk data access

The full Neo4j graph database is available for download at `data.icij.org` — suitable for local querying across all entities.

## Related Sources

- [[OpenCorporates]]
- [[SEC EDGAR API]]
