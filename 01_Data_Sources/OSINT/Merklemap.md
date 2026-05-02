---
name: "Merklemap"
category: "OSINT"
type: "API (Web)"
provider: "Merklemap (merklemap.com)"
pricing: "Free tier available"
status: "Active"
priority: "Medium"
url: "https://www.merklemap.com"
provides:
  - "Certificate transparency log subdomain discovery"
  - "All subdomains associated with a domain, including unadvertised ones"
  - "Historical certificate records"
  - "API endpoint for programmatic access"
best_use_cases:
  - "Passive infrastructure mapping for portfolio companies"
  - "Detect stealth product launches via new subdomain clusters"
  - "M&A target analysis: map acquired domain infrastructure"
  - "Complement Amass with cert-transparency-specific data"
tags:
  - osint
  - infrastructure
  - subdomain
  - certificate-transparency
  - passive-recon
  - company-risk
related_sources:
  - "[[Amass]]"
  - "[[Columbus-Project]]"
  - "[[SpiderFoot]]"
key_location: "none"
integrated: false
notes: "Passive, no active probing. Uses certificate transparency logs (CT logs) — entirely public data. Free API tier. Best used alongside Amass to cover cert-transparency specifically without running active DNS enumeration."
---

## Summary

Merklemap discovers subdomains by ingesting SSL/TLS certificate transparency logs — a fully passive approach that surfaces subdomains including those not publicly advertised or linked. It complements Amass by focusing specifically on certificate-derived intelligence, which often catches product staging environments, internal tools, and recent infrastructure changes faster than DNS enumeration.

## What It Provides

- All subdomains for a domain derived from CT logs
- Historical certificate issuance records
- New subdomain detection (recent certificate activity)
- REST API for programmatic access

## Use Cases

- **Passive infrastructure mapping**: no DNS brute force, fully public data
- **Stealth product launch detection**: new certificate issuance for staging or product subdomains often precedes public announcements
- **M&A target analysis**: map infrastructure of an acquisition target before announcement
- **Complement Amass**: Merklemap specializes in cert transparency; Amass covers broader passive DNS

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No (free tier, no auth for basic queries)  
**Rate Limits**: Free tier applies; check documentation  
**Update Frequency**: On-demand per domain scan  
**Data Format**: JSON  
**Script**: `node run.mjs scan osint-merklemap --domain example.com` → outputs to `05_Data_Pulls/osint/`

### API Usage

```bash
curl "https://api.merklemap.com/search?query=example.com&page=0"
```

## Related Sources

- [[Amass]]
- [[Columbus-Project]]
- [[SpiderFoot]]
