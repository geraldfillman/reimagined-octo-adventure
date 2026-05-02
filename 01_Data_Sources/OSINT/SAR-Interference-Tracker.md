---
name: "SAR Interference Tracker"
category: "OSINT"
type: "Web Tool (Google Earth Engine)"
provider: "Bellingcat / GitHub OSS"
pricing: "Free (Google Earth Engine account required)"
status: "Active"
priority: "Medium"
url: "https://github.com/bellingcat/sar-interference-tracker"
provides:
  - "Synthetic Aperture Radar (SAR) interference detection"
  - "GPS and satellite radar jamming identification"
  - "Geographic heatmaps of jamming activity"
  - "Historical interference timeline by region"
best_use_cases:
  - "Geopolitical Escalation regime: GPS jamming as a pre-conflict signal"
  - "Defense thesis: electronic warfare activity near portfolio company operating regions"
  - "Energy thesis: jamming near Persian Gulf or Black Sea shipping lanes"
  - "Conflict verification: corroborate military activity with SAR interference patterns"
tags:
  - osint
  - geopolitical
  - gps-jamming
  - satellite
  - electronic-warfare
  - bellingcat
related_sources:
  - "[[World-Monitor]]"
  - "[[Bellingcat-ADSB-History]]"
  - "[[Phantom-Tide]]"
key_location: "none"
integrated: false
notes: "Bellingcat tool (553★). Runs in Google Earth Engine — requires a free GEE account. No local install needed. Reference/manual use during geopolitical escalation regime reviews. GPS jamming spikes have historically preceded military operations by days to weeks."
---

## Summary

The SAR Interference Tracker is a Bellingcat Google Earth Engine tool that identifies satellite radar interference caused by GPS jamming or spoofing. GPS jamming is a well-documented precursor to military operations — it disrupts aviation and maritime navigation by overwhelming GNSS signals. For investment research, jamming spikes in key regions (Strait of Hormuz, Black Sea, Eastern Mediterranean) are early geopolitical escalation signals that can affect energy supply, shipping, and defense contract cycles.

## What It Provides

- SAR interference heatmaps by geographic region
- Historical jamming timelines
- Identification of jamming sources by pattern analysis
- Correlation with known military activity zones

## Use Cases

- **Geopolitical Escalation regime**: GPS jamming spikes often precede conflict escalation by days to weeks — use as an early regime shift indicator
- **Defense thesis**: electronic warfare activity near key operating regions correlates with defense contract urgency
- **Energy thesis**: jamming near Gulf or Black Sea shipping lanes is a supply disruption precursor
- **Conflict verification**: corroborate news reports with satellite radar evidence

## Integration Notes

**Status**: Reference (manual; Google Earth Engine web tool)  
**API Key Required**: Google Earth Engine account (free)  
**Update Frequency**: Near real-time (GEE data pipeline)  
**Vault use**: Manual reference during regime classification sessions; bookmark alongside World Monitor  

### Access

1. Create a free Google Earth Engine account at earthengine.google.com
2. Open the tool: github.com/bellingcat/sar-interference-tracker
3. Load the script in GEE Code Editor

## Related Sources

- [[World-Monitor]]
- [[Bellingcat-ADSB-History]]
- [[Phantom-Tide]]
