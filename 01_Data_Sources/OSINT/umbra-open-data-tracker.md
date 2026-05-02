---
name: "Umbra Open Data Tracker"
category: "OSINT"
type: "CLI (OSS)"
provider: "Bellingcat / GitHub OSS"
pricing: "Free (open source)"
status: "Active"
priority: "Medium"
url: "https://github.com/bellingcat/umbra-open-data-tracker"
provides:
  - "Monitoring of Umbra Space SAR satellite open data catalog"
  - "New image availability alerts by geographic region"
  - "KML export for Google Earth visualization"
  - "Coverage tracking for specific coordinates or regions"
best_use_cases:
  - "Defense thesis: monitor satellite imagery of military installations or test sites"
  - "Energy thesis: track infrastructure activity at refineries, LNG terminals, or pipelines"
  - "Geopolitical thesis: new satellite coverage of disputed regions as a situational signal"
  - "Short thesis: physical verification of reported site activity"
tags:
  - osint
  - satellite
  - geospatial
  - defense
  - energy
  - bellingcat
related_sources:
  - "[[SAR-Interference-Tracker]]"
  - "[[World-Monitor]]"
  - "[[Phantom-Tide]]"
key_location: "none"
integrated: false
notes: "Bellingcat tool (30★). Monitors Umbra's open SAR imagery catalog — Umbra publishes a subset of their commercial satellite data publicly. Lightweight Python script, outputs KML for Google Earth. Useful for physical verification of site activity relevant to defense or energy theses."
---

## Summary

The Umbra Open Data Tracker monitors Umbra Space's public SAR (Synthetic Aperture Radar) satellite imagery catalog and alerts when new imagery is available for specified regions. Unlike optical satellites, SAR works through cloud cover and at night, making it more reliable for continuous site monitoring. Umbra publishes a portion of their commercial data openly, providing a free source of high-resolution infrastructure imagery.

## What It Provides

- Automated monitoring of Umbra's open data catalog
- New coverage alerts for user-defined regions or coordinates
- KML export for Google Earth and GIS visualization
- Historical coverage tracking

## Use Cases

- **Defense thesis**: monitor imagery of shipyards, test ranges, or military installations for activity changes
- **Energy thesis**: track physical changes at refineries, LNG terminals, or pipeline infrastructure
- **Geopolitical thesis**: new satellite coverage of contested regions signals intelligence-gathering interest
- **Short thesis**: physical verification of claimed operational activity at company facilities

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No  
**Rate Limits**: None (public catalog monitoring)  
**Update Frequency**: Automated monitor (runs on schedule)  
**Data Format**: KML + console alerts  
**Script**: `node run.mjs scan osint-umbra --region "25.0,56.0,27.0,58.0"` → outputs KML to `05_Data_Pulls/osint/`

### Setup

```bash
git clone https://github.com/bellingcat/umbra-open-data-tracker
cd umbra-open-data-tracker
pip install -r requirements.txt
python tracker.py --region <lat_min,lon_min,lat_max,lon_max>
```

## Related Sources

- [[SAR-Interference-Tracker]]
- [[World-Monitor]]
- [[Phantom-Tide]]
