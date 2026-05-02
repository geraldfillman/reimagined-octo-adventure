---
name: "Bellingcat ADS-B History"
category: "OSINT"
type: "Web Tool"
provider: "Bellingcat"
pricing: "Free"
status: "Active"
priority: "Low"
url: "https://github.com/bellingcat/adsb-history"
provides:
  - "ADS-B flight history for specific aircraft tail numbers"
  - "Private jet and government aircraft route tracking"
  - "Historical flight path reconstruction"
best_use_cases:
  - "Corporate jet tracking for executive activity intelligence"
  - "Activist/PE thesis: tracking management travel patterns"
  - "Confirming company presence at deal locations"
  - "Geopolitical movement tracking for defense thesis"
tags:
  - osint
  - bellingcat
  - aviation
  - corporate-intelligence
  - geospatial
related_sources:
  - "[[VesselFinder]]"
  - "[[FAA UAS Integration Office]]"
key_location: ""
integrated: false
notes: "Vue.js web app. Uses ADS-B Exchange historical data. Requires tail number (N-number) input. Best used manually for specific due diligence rather than scheduled automation. Complement with FlightAware for active tracking."
---

## Summary

Bellingcat's ADS-B History tool reconstructs historical flight paths for specific aircraft using ADS-B Exchange data. For investment research, it enables **corporate jet tracking** — confirming executive travel patterns, deal activity, or geopolitical movements that precede announcements.

## What It Provides

- ADS-B flight history for specific aircraft tail numbers
- Private jet and government aircraft route tracking
- Historical flight path reconstruction

## Use Cases

- Corporate jet tracking for executive activity intelligence (activist/PE theses)
- Confirming company presence at deal locations before announcement
- Tracking management travel to geopolitically sensitive regions
- Defense thesis: government aircraft movement monitoring

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No  
**Rate Limits**: ADS-B Exchange rate limits apply  
**Update Frequency**: On-demand / manual  
**Usage**: Navigate to the deployed tool, enter tail number (FAA N-number)  

### Related flight tracking resources

| Tool | Coverage | Best for |
|------|----------|---------|
| ADS-B Exchange | Global, no filtering | Raw data access |
| FlightAware | Commercial + private | Real-time tracking |
| Bellingcat adsb-history | Historical paths | Investigation reconstruction |

## Related Sources

- [[VesselFinder]]
- [[FAA UAS Integration Office]]
