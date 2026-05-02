---
name: "World Monitor"
category: "OSINT"
type: "Web Platform"
provider: "World Monitor (worldmonitor.app)"
pricing: "Free tier available"
status: "Active"
priority: "High"
url: "https://www.worldmonitor.app"
provides:
  - "Live conflict tracking and incident mapping"
  - "Military flight and vessel monitoring"
  - "GPS jamming and spoofing detection"
  - "Satellite imagery integration"
  - "Geopolitical risk scores by country"
  - "5 specialized intelligence dashboards"
best_use_cases:
  - "Geopolitical escalation regime: live conflict and military activity signals"
  - "Defense thesis: military flight and vessel patterns"
  - "Energy thesis: GPS jamming in oil-producing regions"
  - "Regime classification: corroborate macro regime shift with live threat data"
tags:
  - osint
  - geopolitical
  - conflict
  - military
  - gps-jamming
  - satellite
  - regime-detection
related_sources:
  - "[[Phantom-Tide]]"
  - "[[Bellingcat-ADSB-History]]"
  - "[[SAR-Interference-Tracker]]"
  - "[[VesselFinder]]"
key_location: "none"
integrated: false
notes: "Web platform — no local install required. 5 dashboards: conflict tracker, military flights, vessel monitor, GPS jamming map, geopolitical risk scores. Use as the primary geopolitical OSINT dashboard for regime detection."
---

## Summary

World Monitor is a real-time global intelligence platform aggregating conflict tracking, military flight and vessel monitoring, GPS jamming data, satellite imagery, and geopolitical risk scores into five specialized dashboards. It is the most comprehensive single-platform OSINT source for geopolitical regime detection in this vault.

## What It Provides

- **Conflict Dashboard**: live incident mapping, escalation markers, civilian harm tracking
- **Military Flights**: military aircraft flight paths, sortie patterns, airspace violations
- **Vessel Monitor**: military and commercial vessel positions, fleet movements
- **GPS Jamming Map**: real-time GPS/GNSS interference detection by region
- **Geopolitical Risk Scores**: country-level risk indices updated continuously

## Use Cases

- **Geopolitical Escalation regime**: primary signal dashboard — use when multiple domains are moving together (conflict + military + jamming)
- **Defense thesis**: military flight patterns as a leading indicator of contract and deployment cycles
- **Energy thesis**: GPS jamming in the Persian Gulf or Black Sea regions correlates with supply disruption risk
- **Regime classification**: corroborate macro regime shift (Goldilocks → Stagflation) with live threat data

## Integration Notes

**Status**: Reference (web platform; no local API confirmed)  
**API Key Required**: Unknown — check platform for data export or API access  
**Update Frequency**: Real-time  
**Script**: Manual reference dashboard; note any API availability for future automation  
**Vault use**: Open as a reference during thesis review and regime classification sessions

## Related Sources

- [[Phantom-Tide]]
- [[Bellingcat-ADSB-History]]
- [[SAR-Interference-Tracker]]
- [[VesselFinder]]
