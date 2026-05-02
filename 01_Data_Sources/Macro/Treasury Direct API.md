---
name: "Treasury Direct API"
category: "Macro"
type: "API"
provider: "U.S. Department of the Treasury"
pricing: "Free"
status: "Active"
priority: "Foundation"
url: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/"
provides: ["auction-results", "debt-outstanding", "interest-rates", "treasury-yields"]
best_use_cases: ["yield curve analysis", "government debt tracking", "rate environment monitoring"]
tags: ["treasury", "yields", "rates", "debt", "macro", "government", "free"]
related_sources: ["FRED API", "BEA API", "BLS API"]
key_location: "None required"
integrated: false
notes: ""
---

## Summary

- The Treasury Fiscal Data API provides direct access to U.S. Treasury auction results, debt outstanding, interest rates, and fiscal data. Complements FRED for rate and yield data with more granular auction-level detail.

## What It Provides

- Treasury auction results (bills, notes, bonds, TIPS)
- Average interest rates on Treasury securities
- Monthly statement of the public debt
- Daily Treasury yield curve rates
- Federal debt held by public and intragovernmental

## Use Cases

- Yield curve construction and inversion monitoring
- Mortgage rate forecasting (Treasury → mortgage spread)
- Government debt sustainability analysis
- Auction demand tracking (bid-to-cover ratios)

## Integration Notes

**Status**: Not yet integrated
**API Key Required**: No
**Rate Limits**: No published limit
**Update Frequency**: Daily (yields), weekly (auctions)
**Data Format**: JSON, CSV

## Related Sources

- [[FRED API]]
- [[BEA API]]
- [[BLS API]]

