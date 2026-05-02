---
name: "OpenFEMA API"
category: "Government_Contracts"
type: "API"
provider: "FEMA / DHS"
pricing: "Free"
status: "Active"
priority: "Foundation"
url: "https://www.fema.gov/about/openfema/api"
provides: ["disaster-declarations", "assistance-payments", "hazard-mitigation", "NFIP-claims"]
best_use_cases: ["disaster risk analysis", "housing vulnerability", "insurance exposure", "climate-housing overlap"]
tags: ["government", "disaster", "fema", "housing-risk", "climate", "free"]
related_sources: ["NOAA Storm Events", "Census API", "FRED Housing Series"]
key_location: "None required"
integrated: true
linked_puller: "openfema"
update_frequency: "daily / on-demand"
owner: "CaveUser"
last_reviewed: "2026-03-26"
notes: "Disaster declarations feed used in the morning sequence and housing risk overlays."
---

## Summary

- OpenFEMA provides data on disaster declarations, individual and public assistance, hazard mitigation grants, and National Flood Insurance Program claims. Critical for understanding which areas face recurring disaster exposure — directly connects climate risk to housing value.

## What It Provides

- Disaster declarations by type, state, county
- Individual assistance (housing, other needs)
- Public assistance grants
- Hazard mitigation projects
- NFIP flood insurance claims and policies
- Registration intake data

## Use Cases

- Map disaster frequency to housing markets
- Identify counties with recurring flood/fire exposure
- Track FEMA spending trends over time
- Overlay disaster risk on housing investment thesis

## Integration Notes

**Status**: Integrated
**Linked Puller**: `openfema`
**API Key Required**: No
**Rate Limits**: 1,000 records per request, no daily limit
**Update Frequency**: Daily / on-demand
**Data Format**: JSON, CSV
**Owner**: CaveUser
**Last Reviewed**: 2026-03-26

## Related Sources

- [[NOAA Storm Events]]
- [[Census API]]
- [[FRED Housing Series]]

