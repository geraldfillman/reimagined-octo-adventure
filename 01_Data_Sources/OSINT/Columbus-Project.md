---
name: "Columbus Project"
category: "OSINT"
type: "API (Web)"
provider: "elmasy-com / GitHub OSS"
pricing: "Free (open source + hosted API)"
status: "Active"
priority: "Medium"
url: "https://github.com/elmasy-com/columbus"
provides:
  - "Fast subdomain discovery via hosted API"
  - "Clean JSON responses, minimal setup"
  - "Passive enumeration from aggregated public data"
best_use_cases:
  - "Quick passive subdomain sweep — faster than running Amass locally"
  - "Programmatic infrastructure mapping in puller scripts"
  - "Complement Merklemap with a second passive source"
tags:
  - osint
  - infrastructure
  - subdomain
  - passive-recon
  - company-risk
related_sources:
  - "[[Amass]]"
  - "[[Merklemap]]"
  - "[[SpiderFoot]]"
key_location: "none"
integrated: false
notes: "Lightweight REST API. No API key required for the hosted instance. Use alongside Merklemap — Columbus is faster for quick sweeps; Merklemap provides deeper cert transparency history."
---

## Summary

The Columbus Project is a fast, lightweight subdomain discovery API that aggregates passive intelligence from public sources and returns clean JSON. It is simpler to call programmatically than running Amass locally and is best used as a quick first-pass check alongside the deeper Merklemap cert transparency scan.

## What It Provides

- Subdomain enumeration from aggregated passive sources
- Fast REST API with JSON responses
- Self-hostable (Go binary) or use the public hosted instance

## Use Cases

- **Quick passive sweep**: faster than a local Amass run for routine company checks
- **Programmatic integration**: clean API makes it easy to batch across all entities in `08_Entities/`
- **Second passive source**: use alongside Merklemap — Columbus catches different passive sources

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No (public hosted instance)  
**Rate Limits**: Be conservative; self-host if running at scale  
**Update Frequency**: On-demand  
**Data Format**: JSON  
**Script**: `node run.mjs scan osint-columbus --domain example.com` → outputs to `05_Data_Pulls/osint/`

### API Usage

```bash
curl "https://columbus.elmasy.com/api/v1/search/example.com"
```

### Self-host

```bash
git clone https://github.com/elmasy-com/columbus
cd columbus && go build ./...
```

## Related Sources

- [[Amass]]
- [[Merklemap]]
- [[SpiderFoot]]
