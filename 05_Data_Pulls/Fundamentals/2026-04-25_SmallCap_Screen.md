---
title: "Small-Cap Edge Screener"
source: "FMP Premium + SEC EDGAR"
date_pulled: "2026-04-25"
domain: "fundamentals"
data_type: "screener"
frequency: "on_demand"
signal_status: "clear"
signals: []
total_hits: 0
filters:
  marketCapMin: 50000000
  marketCapMax: 2000000000
  priceMin: 1
  volumeMin: 100000
  floatMax: 75000000
  shortMin: 5
  noOfferings: true
tags: ["screener", "smallcap", "fmp", "sec"]
---

## Matches — 0

_No tickers matched the filter combination. Loosen float/short thresholds or widen the market-cap band._

## How to Read

- **Offering 30d = ⚠️ yes** means a shelf/prospectus filing hit EDGAR in the last 30 days — **expect dilution pressure**, not clean setup.
- **✅ clean** means no S-1/S-3/F-*/424B* on file in the window — safer for squeeze setups.
- **?** means we couldn't resolve a CIK via the SEC ticker map; usually foreign or recently-listed.
- Rank = short % minus a float-size penalty. Tune via source ordering when finer control needed.

## Source

- **FMP Premium** `/stable/company-screener` — market-cap / price / volume filters.
- **FMP Premium** `/stable/shares-float` and `/stable/short-interest` — float + short.
- **SEC EDGAR** `/submissions/` — recent offering-related filings.
