---
name: "Census API"
category: "Macro"
type: "API"
provider: "U.S. Census Bureau"
pricing: "Free"
status: "Active"
priority: "Foundation"
url: "https://www.census.gov/data/developers/data-sets.html"
provides: ["demographics", "housing-characteristics", "income-by-zip", "population-estimates", "ACS-data"]
best_use_cases: ["demographic analysis", "housing demand modeling", "income distribution", "population growth trends"]
tags: ["census", "demographics", "housing", "population", "government", "free"]
related_sources: ["FRED API", "BLS API", "HUD User Datasets"]
key_location: "CENSUS_API_KEY"
integrated: false
notes: ""
---

## Overview

The Census Bureau API provides access to American Community Survey (ACS), decennial census, population estimates, and housing data at national, state, county, and ZIP-code levels. Essential for understanding who lives where and how communities are changing.

## What It Provides

- American Community Survey (ACS) 1-year and 5-year estimates
- Population estimates and projections
- Housing unit counts, vacancy rates, homeownership
- Median household income by geography
- Demographic breakdowns (age, race, education)
- Building permits survey

## Use Cases

- Overlay demographics on housing price trends
- Identify growing vs shrinking metro areas
- Income-to-housing-cost ratio analysis
- Migration pattern tracking

## Integration Notes

**Status**: Not yet integrated
**API Key Required**: Yes (free, instant)
**Rate Limits**: 500 requests/day without key, 50,000/day with key
**Update Frequency**: Annual (ACS), Monthly (building permits)
**Data Format**: JSON

## Related Sources

- [[FRED API]]
- [[BLS API]]
- [[HUD User Datasets]]
