---
name: "Nasdaq Data Link"
category: "Market_Data"
type: "API"
provider: "Nasdaq"
pricing: "Freemium"
status: "Active"
priority: "Growth"
url: "https://data.nasdaq.com/"
provides: ["financial-time-series", "economic-indicators", "housing-indices", "commodity-prices"]
best_use_cases: ["institutional-grade time series", "economic research", "cross-asset analysis"]
tags: ["market-data", "time-series", "economic", "quandl", "freemium"]
related_sources: ["Financial Modeling Prep", "FRED API", "Twelve Data"]
key_location: "NASDAQ_DATA_LINK_API_KEY"
integrated: false
notes: ""
---

## Summary

- Formerly Quandl. Provides institutional-grade economic and financial time series data. Cleaner data formatting than many free alternatives, with good coverage of housing indices, commodities, and alternative datasets.

## What It Provides

- ZSFH (Zillow Single-Family Home Values via Quandl)
- Commodity futures prices
- Economic indicators (leading, coincident, lagging)
- Treasury yield curves
- International economic data

## Use Cases

- Cross-asset correlation analysis
- Housing index time series with clean formatting
- Economic regime detection
- Alternative data exploration

## Integration Notes

**Status**: Not yet integrated
**API Key Required**: Yes (free tier)
**Rate Limits**: 50 calls/day (free), 2,000/day (premium)
**Update Frequency**: Varies by dataset
**Data Format**: JSON, CSV

## Related Sources

- [[Financial Modeling Prep]]
- [[FRED API]]
- [[Twelve Data]]

