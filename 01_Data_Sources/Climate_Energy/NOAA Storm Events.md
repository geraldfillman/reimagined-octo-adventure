---
name: "NOAA Storm Events Database"
category: "Climate_Energy"
type: "Download"
provider: "NOAA / NCEI"
pricing: "Free"
status: "Active"
priority: "Foundation"
url: "https://www.ncdc.noaa.gov/stormevents/"
provides: ["storm-damage", "property-loss", "crop-loss", "fatalities", "county-level-events"]
best_use_cases: ["climate risk analysis", "housing vulnerability", "insurance exposure", "disaster frequency"]
tags: ["climate", "storms", "disaster", "property-damage", "noaa", "free"]
related_sources: ["OpenFEMA API", "EIA API", "NOAA Climate Data Online"]
key_location: "None required"
integrated: false
notes: ""
---

## Summary

- NOAA Storm Events Database records severe weather events with property and crop damage estimates at the county level going back to 1950. Connects directly to housing risk analysis — which areas face recurring tornado, hurricane, flood, or wildfire damage.

## What It Provides

- Storm events by type (tornado, hurricane, flood, hail, wildfire, etc.)
- Property damage estimates per event
- Crop damage estimates
- Fatalities and injuries
- County and state-level geographic detail
- Begin/end dates and narratives

## Use Cases

- Map storm damage frequency to housing markets
- Calculate annual expected property loss by county
- Identify climate risk trends over decades
- Overlay with FEMA disaster declarations for complete risk picture

## Integration Notes

**Status**: Not yet integrated
**API Key Required**: No
**Rate Limits**: Bulk CSV download
**Update Frequency**: Monthly updates
**Data Format**: CSV

## Related Sources

- [[OpenFEMA API]]
- [[EIA API]]
- [[NOAA Climate Data Online]]

