---
name: "SpiderFoot"
category: "OSINT"
type: "CLI/API"
provider: "smicallef / OWASP Community"
pricing: "Free (open source) | SpiderFoot HX cloud: paid"
status: "Active"
priority: "High"
url: "https://github.com/smicallef/spiderfoot"
provides:
  - "Domain and subdomain enumeration"
  - "Leaked credential detection"
  - "Infrastructure and IP mapping"
  - "Dark web mention monitoring"
  - "Email and personnel exposure"
  - "Threat intelligence aggregation (200+ sources)"
best_use_cases:
  - "Passive attack surface scan on portfolio company domains"
  - "Breach/leak detection for company risk signals"
  - "Pre-earnings infrastructure change detection"
  - "Short thesis due diligence on management exposure"
tags:
  - osint
  - company-risk
  - threat-intel
  - passive-recon
  - network-intelligence
related_sources:
  - "[[theHarvester]]"
  - "[[Amass]]"
  - "[[OTX-AlienVault]]"
key_location: "SPIDERFOOT_API_KEY"
integrated: false
notes: "Run in passive mode only for investment research. REST API available when running local server (port 5001). Outputs to JSON. Best used for company-risk enrichment on covered entities."
---

## Summary

SpiderFoot is an OSINT automation platform with 200+ modules that aggregate intelligence from public sources. For investment research, it is run in **passive mode** against portfolio company domains to surface leaked credentials, infrastructure changes, public breach mentions, and dark web exposure — all routed into the Company Risk layer.

## What It Provides

- Domain and subdomain enumeration
- Leaked credential detection (via HaveIBeenPwned, DeHashed integrations)
- Infrastructure and IP mapping
- Dark web mention monitoring
- Email and personnel exposure
- Threat intelligence aggregation across 200+ sources

## Use Cases

- Passive attack surface scan on portfolio company domains
- Breach/leak detection for company risk signals (→ P1/P2 Signal Board)
- Pre-earnings infrastructure change detection
- Short thesis due diligence on management exposure

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Optional (SPIDERFOOT_API_KEY for HX cloud; most passive modules are keyless)  
**Rate Limits**: Self-hosted instance has no external rate limits; module-level rate limiting applies  
**Update Frequency**: On-demand per company scan  
**Data Format**: JSON via REST API (`/api/v1/scan/`) or CLI stdout  
**Script**: `node run.mjs scan osint-spiderfoot --domain <domain>` → outputs to `05_Data_Pulls/osint/`  
**Signal trigger**: Credential leak finding → P1 signal note in `06_Signals/`  

### Setup

```bash
pip install spiderfoot
# or clone: git clone https://github.com/smicallef/spiderfoot
python sf.py -l 127.0.0.1:5001   # Start REST API server
```

### Passive scan invocation

```bash
# CLI passive scan
spiderfoot -s example.com -m sfp_dnsresolve,sfp_haveibeenpwned,sfp_shodan -o json
```

## Related Sources

- [[theHarvester]]
- [[Amass]]
- [[OTX-AlienVault]]
