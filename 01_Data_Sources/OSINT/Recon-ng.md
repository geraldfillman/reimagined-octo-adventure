---
name: "Recon-ng"
category: "OSINT"
type: "CLI"
provider: "lanmaster53 / Open Source"
pricing: "Free (open source)"
status: "Active"
priority: "Medium"
url: "https://github.com/lanmaster53/recon-ng"
provides:
  - "Corporate contact and personnel enumeration"
  - "Domain and subdomain discovery"
  - "Company profile aggregation"
  - "LinkedIn and social profile scraping (via modules)"
  - "Breach data correlation"
best_use_cases:
  - "Management team mapping for activist / short thesis research"
  - "Employee enumeration before corporate events"
  - "Domain structure analysis for M&A target research"
  - "Contact harvesting for key personnel change detection"
tags:
  - osint
  - company-risk
  - personnel-intelligence
  - passive-recon
related_sources:
  - "[[SpiderFoot]]"
  - "[[theHarvester]]"
key_location: ""
integrated: false
notes: "Modular framework like Metasploit for OSINT. No REST API — invoked via Python CLI. Outputs to SQLite workspace or CSV/JSON. Passive modules only for investment use."
---

## Summary

Recon-ng is a modular web reconnaissance framework (Python) with a Metasploit-style console. It is best used for **corporate personnel intelligence** — mapping management teams, contact structures, and domain ownership ahead of earnings events, activist campaigns, or M&A thesis validation.

## What It Provides

- Corporate contact and personnel enumeration
- Domain and subdomain discovery
- Company profile aggregation
- LinkedIn and social profile scraping (via modules)
- Breach data correlation

## Use Cases

- Management team mapping for activist/short thesis research
- Employee enumeration before corporate events (earnings, proxy fights)
- Domain structure analysis for M&A target research
- Contact harvesting for key personnel change detection

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Some modules require keys (Shodan, Hunter.io); core passive modules are free  
**Rate Limits**: Module-specific; passive modules have no hard limits  
**Update Frequency**: On-demand per company  
**Data Format**: SQLite workspace + CSV/JSON export  
**Script**: `node run.mjs scan osint-recon --domain <domain>` → raw output to `05_Data_Pulls/osint/`

### Setup

```bash
pip install recon-ng
# or: git clone https://github.com/lanmaster53/recon-ng
recon-ng
```

### Example module sequence (passive)

```
[recon-ng] > marketplace install recon/domains-hosts/brute_hosts
[recon-ng] > marketplace install recon/domains-contacts/whois_pocs
[recon-ng] > modules load recon/domains-contacts/whois_pocs
[recon-ng][whois_pocs] > options set SOURCE example.com
[recon-ng][whois_pocs] > run
```

## Related Sources

- [[SpiderFoot]]
- [[theHarvester]]
