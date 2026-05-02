---
name: "OSM Search (Bellingcat)"
category: "OSINT"
type: "CLI/Web (OSS)"
provider: "Bellingcat / GitHub OSS"
pricing: "Free (open source)"
status: "Active"
priority: "Medium"
url: "https://github.com/bellingcat/osm-search"
provides:
  - "Proximity-based OpenStreetMap feature search"
  - "Find tagged features near specific coordinates"
  - "Natural language OSM query builder"
  - "Export results as GeoJSON"
best_use_cases:
  - "Geospatial thesis enrichment: find infrastructure near a company site"
  - "Defense thesis: proximity analysis of military or dual-use facilities"
  - "Energy thesis: locate nearby energy infrastructure relative to a site of interest"
  - "Real estate thesis: neighborhood infrastructure and amenity context"
tags:
  - osint
  - geospatial
  - openstreetmap
  - proximity-analysis
  - bellingcat
related_sources:
  - "[[OpenStreetMap]]"
  - "[[Phantom-Tide]]"
  - "[[umbra-open-data-tracker]]"
key_location: "none"
integrated: false
notes: "Bellingcat tool (205★). User-friendly OSM query interface for proximity searches. Complements the existing OpenStreetMap source note. No API key needed. GeoJSON output."
---

## Summary

OSM Search is Bellingcat's user-friendly tool for proximity-based OpenStreetMap queries — finding tagged infrastructure features near a given coordinate without writing raw Overpass QL. For investment research, it provides geospatial context around specific sites: what rail lines, pipelines, ports, or industrial facilities are near a company's reported location.

## What It Provides

- Proximity search: find OSM features (amenities, transport, industrial) near coordinates
- Natural language query interface (no Overpass QL required)
- GeoJSON export for mapping and analysis
- Configurable search radius and feature type filters

## Use Cases

- **Geospatial enrichment**: what infrastructure exists near a facility mentioned in an earnings call or news article
- **Defense thesis**: proximity of military facilities to dual-use industrial sites
- **Energy thesis**: pipeline, refinery, and terminal proximity for supply chain analysis
- **Real estate thesis**: neighborhood infrastructure context for development sites

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No (uses public OSM/Overpass API)  
**Rate Limits**: Overpass API rate limits apply; be conservative  
**Update Frequency**: On-demand  
**Data Format**: GeoJSON  
**Script**: `node run.mjs scan osint-osmsearch --lat 25.3 --lon 56.3 --radius 10000` → outputs GeoJSON to `05_Data_Pulls/osint/`

### Setup

```bash
git clone https://github.com/bellingcat/osm-search
cd osm-search
pip install -r requirements.txt
python search.py --lat 25.3 --lon 56.3 --radius 10000
```

## Related Sources

- [[OpenStreetMap]]
- [[Phantom-Tide]]
- [[umbra-open-data-tracker]]
