---
name: "IMF International Financial Statistics"
category: "Macro"
type: "Dataset"
provider: "International Monetary Fund"
pricing: "Free"
status: "Active"
priority: "Growth"
url: "https://data.imf.org/IFS"
provides:
  - "International reserve data"
  - "Monetary aggregates"
  - "Balance-of-payments context"
  - "Cross-country macro time series"
best_use_cases:
  - "Central bank reserve verification"
  - "Cross-country macro comparisons"
  - "Hard-money thesis backfill"
tags:
  - macro
  - reserves
  - international
  - central-banks
related_sources:
  - "[[World Gold Council Goldhub]]"
  - "[[FRED API]]"
  - "[[US Treasury Data]]"
key_location: "None required"
integrated: false
update_frequency: "monthly"
owner: "CaveUser"
last_reviewed: "2026-04-02"
notes: "Official deep source behind many reserve and international macro datasets, useful when the thesis needs primary cross-country verification rather than a summarized dashboard."
---

## Summary

- IMF International Financial Statistics is the deepest official backstop for reserve and international macro questions in the vault.
- It is less convenient than Goldhub, but stronger when you need primary-source verification or broader macro context.

## What It Provides

- Reserve and reserve-composition data
- Monetary and banking aggregates
- Exchange-rate and balance-of-payments context
- Country-level international macro series

## Use Cases

- Verifying reserve behavior and gold-share trends
- Checking macro cross-country claims in hard-money and fiscal theses
- Supporting manual bridge notes when no easy API exists

## Integration Notes

**Status**: Not yet integrated
**API Key Required**: No
**Rate Limits**: None
**Update Frequency**: Monthly
**Data Format**: Data portal, tables, and downloadable files

## Access Notes

- The IMF Data Portal is public, but library guides and institutional data workflows can make historical extraction easier.
- Best used as a verification source when a summarized downstream dashboard needs confirmation.

## Related Sources

- [[World Gold Council Goldhub]]
- [[FRED API]]
- [[US Treasury Data]]
