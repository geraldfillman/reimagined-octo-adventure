---
name: "VesselFinder AIS"
category: "OSINT"
type: "API/Web"
provider: "VesselFinder"
pricing: "Free (web) | API: $0–$299/month by plan"
status: "Active"
priority: "Medium"
url: "https://www.vesselfinder.com"
provides:
  - "Real-time AIS vessel positions globally"
  - "Historical vessel route tracking"
  - "Port call data and ETA estimates"
  - "Cargo ship and tanker movements"
  - "Dark ship detection (AIS-off vessels)"
best_use_cases:
  - "Supply chain disruption signal for commodity theses"
  - "Strait of Hormuz and Red Sea shipping lane monitoring"
  - "LNG/oil tanker movement tracking for energy thesis"
  - "Sanctions evasion vessel detection (AIS spoofing patterns)"
tags:
  - osint
  - supply-chain
  - maritime
  - geospatial
  - commodities
related_sources:
  - "[[UN Comtrade API]]"
  - "[[EIA API]]"
  - "[[NOAA Storm Events]]"
key_location: "VESSELFINDER_API_KEY"
integrated: false
notes: "Free web access is sufficient for manual checks. API required for automated pulls. Alternative: MarineTraffic API (similar coverage). Cross-reference with Hormuz Tracker (GitHub: johnsmalls22-rgb/hormuz-tracker) for geopolitical shipping signals."
---

## Summary

VesselFinder tracks real-time AIS (Automatic Identification System) positions of vessels globally. For investment research, it provides **shipping lane intelligence** for commodity theses — monitoring LNG tanker movements, disruptions in the Red Sea/Hormuz corridor, and detecting sanctions evasion via AIS-dark vessels.

## What It Provides

- Real-time AIS vessel positions globally
- Historical vessel route tracking (with paid API)
- Port call data and ETA estimates
- Cargo ship, tanker, and container vessel movements
- Dark ship detection (vessels going AIS-off)

## Use Cases

- Supply chain disruption signal for commodity theses → Signal Board
- Strait of Hormuz and Red Sea shipping lane monitoring
- LNG/oil tanker movement tracking for energy thesis
- Sanctions evasion vessel detection (dark shipping patterns)

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Yes for automated queries (VESSELFINDER_API_KEY)  
**Rate Limits**: Plan-dependent  
**Update Frequency**: Real-time AIS (2–5 min refresh); daily summary pulls recommended  
**Data Format**: JSON REST API  

### Related open-source tools

- **Hormuz Tracker** — github.com/johnsmalls22-rgb/hormuz-tracker: Real-time Strait of Hormuz vessel tracking with AIS data, dark ship detection, oil prices, and carrier positions
- **Phantom Tide** — github.com/tg12/phantomtide: Cross-domain OSINT dashboard combining vessel tracking, airspace activity, and satellite detections

## Related Sources

- [[UN Comtrade API]]
- [[EIA API]]
- [[NOAA Storm Events]]
