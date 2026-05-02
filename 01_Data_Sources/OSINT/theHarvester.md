---
name: "theHarvester"
category: "OSINT"
type: "CLI"
provider: "laramies / Open Source"
pricing: "Free (open source)"
status: "Active"
priority: "High"
url: "https://github.com/laramies/theHarvester"
provides:
  - "Email address harvesting from 40+ public sources"
  - "Subdomain discovery"
  - "IP and host enumeration"
  - "URL pattern discovery"
  - "Personnel identification via email format inference"
best_use_cases:
  - "Key personnel email mapping for companies under coverage"
  - "Pre-earnings infrastructure reconnaissance"
  - "Domain email pattern detection for M&A target research"
  - "Personnel change signals via new email domain patterns"
tags:
  - osint
  - company-risk
  - email-intelligence
  - passive-recon
  - personnel-intelligence
related_sources:
  - "[[SpiderFoot]]"
  - "[[Recon-ng]]"
  - "[[Amass]]"
key_location: ""
integrated: false
notes: "Purely passive. Aggregates from Google, Bing, Shodan, Hunter.io, DuckDuckGo, and 35+ other sources. CLI only — no REST API. JSON output supported. Fast and lightweight."
---

## Summary

theHarvester is a passive email, subdomain, IP, and URL harvesting tool that queries 40+ public sources simultaneously. For investment research it is the fastest way to map **email patterns and personnel exposure** for any company domain — useful for tracking key hires, departures, or infrastructure signals before earnings.

## What It Provides

- Email address harvesting from 40+ public sources
- Subdomain discovery
- IP and host enumeration
- URL pattern discovery
- Personnel identification via email format inference

## Use Cases

- Key personnel email mapping for companies under coverage
- Pre-earnings infrastructure reconnaissance
- Domain email pattern detection for M&A target research
- Personnel change signals via new email domain patterns (→ `08_Entities/` profiles)

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Optional per-source keys (Shodan, Hunter.io) for higher rate limits; core sources are keyless  
**Rate Limits**: Source-dependent; 5–10 second delays between queries recommended  
**Update Frequency**: On-demand per company  
**Data Format**: JSON (`-f json`), XML, or stdout  
**Script**: `node run.mjs scan osint-harvester --domain <domain>` → output to `05_Data_Pulls/osint/` and `08_Entities/`

### Setup

```bash
pip install theHarvester
# or: git clone https://github.com/laramies/theHarvester
```

### Example invocation (passive, JSON output)

```bash
theHarvester -d example.com -b google,bing,duckduckgo,shodan,hunter -f results.json
```

### Key source flags

| Flag | Source | What it finds |
|------|--------|---------------|
| `-b google` | Google | Emails, subdomains |
| `-b shodan` | Shodan | Open ports, IPs |
| `-b hunter` | Hunter.io | Email formats, contacts |
| `-b all` | All sources | Full sweep |

## Related Sources

- [[SpiderFoot]]
- [[Recon-ng]]
- [[Amass]]
