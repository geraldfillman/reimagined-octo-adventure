---
name: "Zillow ZTRAX"
category: "Housing_Real_Estate"
type: "Download"
provider: "Zillow Group"
pricing: "Free (academic/research)"
status: "Active"
priority: "Growth"
url: "https://www.zillow.com/research/ztrax/"
provides: ["deed-transfers", "tax-assessments", "property-characteristics", "transaction-history"]
best_use_cases: ["property-level research", "housing transaction analysis", "tax assessment trends"]
tags: ["housing", "property", "zillow", "academic", "deeds", "free"]
related_sources: ["Zillow Research Data", "ATTOM Data", "Census API"]
key_location: "None required"
integrated: false
notes: ""
---

## Summary

- ZTRAX (Zillow Transaction and Assessment Dataset) provides property-level deed transfers and tax assessment data for academic and research use. Covers 400M+ property records. Much more granular than Zillow's public research CSV downloads.

## What It Provides

- Deed transfer records (buyer, seller, price, date)
- Tax assessment values and history
- Property characteristics (beds, baths, sqft, year built)
- Mortgage origination data
- Foreclosure records

## Use Cases

- Academic housing market research
- Transaction volume trends at the property level
- Assessment-to-sale-price ratio analysis
- Foreclosure pipeline research

## Integration Notes

**Status**: Not yet integrated
**API Key Required**: No (application required for academic access)
**Rate Limits**: Bulk download after approval
**Update Frequency**: Quarterly updates
**Data Format**: CSV (bulk)

## Related Sources

- [[Zillow Research Data]]
- [[ATTOM Data]]
- [[Census API]]

