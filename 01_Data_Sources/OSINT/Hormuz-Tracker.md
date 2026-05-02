---
name: "Hormuz Tracker"
category: "OSINT"
type: "CLI/Dashboard (OSS)"
provider: "johnsmalls22-rgb / GitHub OSS"
pricing: "Free (open source)"
status: "Active"
priority: "High"
url: "https://github.com/johnsmalls22-rgb/hormuz-tracker"
provides:
  - "Real-time Strait of Hormuz vessel positions"
  - "AIS dark ship detection (vessels that disable transponders)"
  - "Live crude oil price context"
  - "Aircraft carrier positioning"
  - "Chokepoint traffic density metrics"
best_use_cases:
  - "Energy thesis: Hormuz crude flow as a real-time supply signal"
  - "Energy sector basket: oil price context alongside chokepoint risk"
  - "Geopolitical escalation regime: dark ship activity as an early warning signal"
  - "Stagflation regime: supply disruption risk monitoring"
tags:
  - osint
  - maritime
  - energy
  - geopolitical
  - crude-oil
  - supply-chain
related_sources:
  - "[[VesselFinder]]"
  - "[[Phantom-Tide]]"
  - "[[EIA API]]"
  - "[[World-Monitor]]"
key_location: "none"
integrated: false
notes: "GitHub OSS, Python-based. Combines AIS data with crude price feeds. Particularly useful when EIA or news signals show oil price movement — cross-check with actual chokepoint traffic."
---

## Summary

Hormuz Tracker provides real-time tracking of vessel activity in the Strait of Hormuz, with specific focus on AIS dark ship detection — vessels that disable their transponders, historically associated with sanctions evasion or covert cargo movements. Crude oil price context is embedded directly in the dashboard.

## What It Provides

- Real-time AIS vessel positions in and around the Strait of Hormuz
- Dark ship detection: vessels operating without AIS transponders
- Live crude oil price ticker (Brent, WTI)
- Aircraft carrier positioning in the Persian Gulf
- Chokepoint traffic density over time

## Use Cases

- **Energy thesis**: Hormuz crude flow is a real-time physical supply signal that leads or confirms oil price moves
- **Energy sector basket**: cross-reference with EIA inventory and production data
- **Geopolitical escalation regime**: dark ship spikes are an early indicator of supply disruption risk
- **Stagflation regime**: chokepoint closure risk as an inflation driver

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No  
**Rate Limits**: Self-hosted; no limits  
**Update Frequency**: On-demand; real-time when dashboard is running  
**Data Format**: Web dashboard; AIS data via public feeds  
**Script**: `node run.mjs scan osint-hormuz` → outputs snapshot to `05_Data_Pulls/osint/`

### Setup

```bash
git clone https://github.com/johnsmalls22-rgb/hormuz-tracker
cd hormuz-tracker
pip install -r requirements.txt
python app.py
```

## Related Sources

- [[VesselFinder]]
- [[Phantom-Tide]]
- [[EIA API]]
- [[World-Monitor]]
