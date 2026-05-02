---
name: "Socrata Open Data"
category: "Government_Contracts"
type: "API"
provider: "Tyler Technologies (Socrata)"
pricing: "Free"
status: "Active"
priority: "Growth"
url: "https://dev.socrata.com/"
provides: ["city-permits", "building-inspections", "311-requests", "local-government-data"]
best_use_cases: ["local market intelligence", "permit activity tracking", "neighborhood analysis"]
tags: ["government", "local", "permits", "open-data", "cities", "free"]
related_sources: ["Census API", "HUD User Datasets", "OpenFEMA API"]
key_location: "SOCRATA_APP_TOKEN"
integrated: true
linked_puller: "socrata"
update_frequency: "daily / on-demand"
owner: "CaveUser"
last_reviewed: "2026-03-26"
notes: "Used by the socrata puller for permits, 311 data, and custom municipal datasets."
---

## Summary

- Socrata powers open data portals for hundreds of cities and counties (NYC, Chicago, LA, Seattle, etc.). Access building permits, code violations, 311 service requests, property transfers, and more at the local level. The hyperlocal complement to your federal data sources.

## What It Provides

- Building permit applications and approvals
- Code enforcement violations
- 311 service requests
- Property sales and transfers
- Business licenses
- Public safety incidents

## Use Cases

- Track building permit activity as a leading housing indicator
- Monitor code violations in target neighborhoods
- Correlate 311 data with property values
- Compare local economic activity across cities

## Integration Notes

**Status**: Integrated
**Linked Puller**: `socrata`
**API Key Required**: Optional (app token increases rate limits)
**Rate Limits**: 1,000/hour without token, higher with token
**Update Frequency**: Daily / on-demand
**Data Format**: JSON, CSV, GeoJSON
**Owner**: CaveUser
**Last Reviewed**: 2026-03-26

## Related Sources

- [[Census API]]
- [[HUD User Datasets]]
- [[OpenFEMA API]]

