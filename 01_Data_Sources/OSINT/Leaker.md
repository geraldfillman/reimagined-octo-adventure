---
name: "Leaker"
category: "OSINT"
type: "CLI (OSS)"
provider: "vflame6 / GitHub OSS"
pricing: "Free (open source)"
status: "Active"
priority: "High"
url: "https://github.com/vflame6/leaker"
provides:
  - "Passive credential and data breach enumeration"
  - "Simultaneous search across 10 breach databases"
  - "Email, username, and domain breach lookups"
  - "JSON-exportable results"
best_use_cases:
  - "Company Risk layer: domain breach sweep for portfolio companies"
  - "Enhance SpiderFoot coverage with dedicated multi-database breach check"
  - "Short thesis due diligence: executive email exposure"
  - "Pre-earnings risk scan: new breach appearance for covered companies"
tags:
  - osint
  - company-risk
  - breach
  - credential-leak
  - passive-recon
related_sources:
  - "[[SpiderFoot]]"
  - "[[OTX-AlienVault]]"
  - "[[theHarvester]]"
key_location: "none"
integrated: false
notes: "Passive-only CLI. Queries 10 breach databases simultaneously (HaveIBeenPwned, DeHashed, IntelX, and others). Much faster multi-source breach coverage than running individual tools. No active probing."
---

## Summary

Leaker is a passive CLI tool that searches across 10 breach databases simultaneously for a given email, username, or domain. It provides materially broader breach coverage than a single-source check (like OTX alone) and outputs structured JSON, making it straightforward to pipe into the `12_Company_Risk/` layer.

## What It Provides

- Simultaneous query across 10 breach databases including HaveIBeenPwned, DeHashed, IntelX, LeakCheck, and others
- Email, username, and domain breach lookups
- Structured JSON output
- Passive mode only — no active scanning or probing

## Use Cases

- **Company Risk layer**: domain-level breach sweep for all covered entities in `08_Entities/`
- **Enhance SpiderFoot coverage**: SpiderFoot's breach modules are rate-limited; Leaker fills the gap with dedicated multi-DB lookups
- **Short thesis due diligence**: check executive email patterns for exposure
- **Pre-earnings risk scan**: detect new breach appearances before earnings releases

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Some underlying databases require free API keys (HaveIBeenPwned, etc.)  
**Rate Limits**: Per-database limits apply; Leaker handles gracefully  
**Update Frequency**: On-demand per company scan  
**Data Format**: JSON output  
**Script**: `node run.mjs scan osint-leaker --domain example.com` → outputs to `05_Data_Pulls/osint/`  
**Signal trigger**: New breach finding → P2 signal note in `06_Signals/`

### Setup

```bash
pip install leaker
# or: git clone https://github.com/vflame6/leaker && pip install -r requirements.txt
leaker --email ceo@example.com --json
leaker --domain example.com --json
```

## Related Sources

- [[SpiderFoot]]
- [[OTX-AlienVault]]
- [[theHarvester]]
