---
name: "Amass"
category: "OSINT"
type: "CLI"
provider: "OWASP / caffix"
pricing: "Free (open source)"
status: "Active"
priority: "Medium"
url: "https://github.com/owasp-amass/amass"
provides:
  - "DNS subdomain enumeration"
  - "Attack surface mapping"
  - "Passive intelligence gathering (intel mode)"
  - "Certificate transparency log mining"
  - "ASN and IP range discovery"
best_use_cases:
  - "Infrastructure mapping for tech company M&A target analysis"
  - "Stealth product launch detection via new subdomain clusters"
  - "Attack surface change monitoring for cybersecurity thesis"
  - "Pre-acquisition due diligence on domain footprint"
tags:
  - osint
  - company-risk
  - dns-intelligence
  - passive-recon
  - network-intelligence
related_sources:
  - "[[SpiderFoot]]"
  - "[[theHarvester]]"
key_location: ""
integrated: false
notes: "Go binary — fast and reliable. Use 'amass intel' (passive) not 'amass enum' (active brute force) for investment research. Certificate transparency logs reveal product launches before announcements."
---

## Summary

Amass (OWASP) performs DNS subdomain enumeration and attack surface mapping. For investment research, the **`amass intel`** passive mode mines certificate transparency logs, DNS records, and public data sources to map a company's infrastructure footprint — revealing new product launches, acquired domains, or shadow IT before public disclosure.

## What It Provides

- DNS subdomain enumeration (passive intel mode)
- Attack surface mapping
- Certificate transparency log mining
- ASN and IP range discovery
- Historical subdomain change detection

## Use Cases

- Infrastructure mapping for tech company M&A target analysis
- Stealth product launch detection via new subdomain clusters
- Attack surface change monitoring for cybersecurity thesis signals
- Pre-acquisition due diligence on domain footprint

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Optional (Shodan, Censys, VirusTotal for richer results)  
**Rate Limits**: Certificate transparency and DNS are effectively unlimited passively  
**Update Frequency**: On-demand or scheduled monthly per covered entity  
**Data Format**: JSON (`-json output.json`) or text  
**Script**: `node run.mjs scan osint-amass --domain <domain>` → output to `05_Data_Pulls/osint/`  
**Signal**: New subdomain cluster → flag for thesis review note

### Setup

```bash
# Go install
go install -v github.com/owasp-amass/amass/v4/...@master

# or download binary from GitHub releases
```

### Passive intel invocation

```bash
# Passive mode only — no active probing
amass intel -d example.com -passive -json output.json

# Certificate transparency mining
amass intel -d example.com -src
```

## Related Sources

- [[SpiderFoot]]
- [[theHarvester]]
