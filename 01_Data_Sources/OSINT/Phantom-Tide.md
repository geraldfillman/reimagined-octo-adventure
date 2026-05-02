---
name: "Phantom Tide"
category: "OSINT"
type: "CLI/Dashboard (OSS)"
provider: "tg12 / GitHub OSS"
pricing: "Free (open source)"
status: "Active"
priority: "High"
url: "https://github.com/tg12/phantomtide"
provides:
  - "Real-time AIS vessel tracking"
  - "Airspace activity monitoring"
  - "Satellite detection overlays"
  - "Official maritime notices (NOTAMs, MSIs)"
  - "Environmental context (weather, ocean conditions)"
  - "Cross-domain correlation of vessel + airspace signals"
best_use_cases:
  - "Energy thesis: commodity flow and chokepoint monitoring"
  - "Defense thesis: dual-use maritime/airspace activity"
  - "Supply chain thesis: combined vessel + air freight signals"
  - "Geopolitical escalation regime: cross-domain situational awareness"
tags:
  - osint
  - maritime
  - airspace
  - supply-chain
  - geopolitical
  - cross-domain
related_sources:
  - "[[VesselFinder]]"
  - "[[Bellingcat-ADSB-History]]"
  - "[[Hormuz-Tracker]]"
  - "[[World-Monitor]]"
key_location: "none"
integrated: false
notes: "Self-hosted Python dashboard. Combines what VesselFinder and ADS-B cover separately into one cross-domain view. Run locally for on-demand situational snapshots."
---

## Summary

Phantom Tide is a cross-domain OSINT dashboard that correlates vessel tracking, airspace activity, official maritime notices, environmental context, and satellite detections in a single view. It is more analytically powerful than VesselFinder alone because it surfaces multi-signal patterns — a vessel goes dark while airspace activity spikes in the same region, for example.

## What It Provides

- Real-time AIS vessel positions and track history
- Airspace activity (flight paths, restricted zones)
- Satellite detection overlays
- Official notices: NOTAMs, Maritime Safety Information (MSIs)
- Environmental context: weather, ocean currents
- Cross-domain signal correlation

## Use Cases

- **Energy thesis**: monitor commodity flow through key chokepoints (Hormuz, Malacca, Suez) alongside airspace activity
- **Defense thesis**: detect dual-use maritime and airspace patterns relevant to conflict escalation
- **Supply chain thesis**: correlate vessel delays with air freight routing changes
- **Geopolitical escalation regime**: comprehensive situational awareness when multiple domains move together

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No  
**Rate Limits**: Self-hosted; no external limits  
**Update Frequency**: On-demand situational snapshot  
**Data Format**: Web dashboard (Python/Flask); JSON endpoints available internally  
**Script**: `node run.mjs scan osint-phantom --region hormuz` → outputs to `05_Data_Pulls/osint/`

### Setup

```bash
git clone https://github.com/tg12/phantomtide
cd phantomtide
pip install -r requirements.txt
python app.py
```

## Related Sources

- [[VesselFinder]]
- [[Bellingcat-ADSB-History]]
- [[Hormuz-Tracker]]
- [[World-Monitor]]
