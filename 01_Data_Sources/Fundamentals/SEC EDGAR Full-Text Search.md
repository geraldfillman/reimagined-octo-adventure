---
name: "SEC EDGAR Full-Text Search"
category: "Fundamentals"
type: "API"
provider: "SEC"
pricing: "Free"
status: "Active"
priority: "Growth"
url: "https://efts.sec.gov/LATEST/search-index?q="
provides: ["10-K-full-text", "10-Q-search", "8-K-search", "proxy-statements", "filing-search"]
best_use_cases: ["earnings analysis", "risk factor monitoring", "keyword tracking across filings"]
tags: ["sec", "edgar", "filings", "full-text", "fundamentals", "free"]
related_sources: ["SEC EDGAR API", "SEC XBRL Company Facts", "Financial Modeling Prep (free tier)"]
key_location: "None required"
integrated: false
notes: ""
---

## Overview

SEC EDGAR Full-Text Search (EFTS) lets you search across the full text of all SEC filings. Unlike the structured EDGAR API which returns metadata, this searches the actual content of 10-Ks, 10-Qs, 8-Ks, and more. Find mentions of keywords, competitors, risk factors, or any phrase across millions of filings.

## What It Provides

- Full-text search across all SEC filing types
- Filter by date range, filing type, company
- Returns filing excerpts with keyword highlighting
- Links to full filing documents
- Covers 10-K, 10-Q, 8-K, DEF 14A, S-1, and more

## Use Cases

- Track mentions of specific risks (e.g., 'tariff', 'recession') across filings
- Monitor competitor mentions in earnings reports
- Research IPO prospectuses (S-1 filings)
- Identify companies discussing specific technologies or markets

## Integration Notes

**Status**: Not yet integrated
**API Key Required**: No
**Rate Limits**: 10 requests/second
**Update Frequency**: Real-time as filings are submitted
**Data Format**: JSON

## Related Sources

- [[SEC EDGAR API]]
- [[SEC XBRL Company Facts]]
- [[Financial Modeling Prep (free tier)]]
