---
title: "Daily Capital Raise Digest"
source: "SEC EDGAR EFTS"
date_pulled: "2026-05-02"
domain: "fundamentals"
data_type: "digest"
frequency: "daily"
signal_status: "clear"
signals: []
window_from: "2026-05-02"
window_to: "2026-05-02"
total_filings: 0
tags: ["sec", "capital-raise", "offerings", "digest"]
---

## No Activity

_No offering filings between 2026-05-02 and 2026-05-02._

## How to Read

- **424B* prospectus** supplements mean an offering is actively pricing or a shelf is being drawn down — the clearest pre-gap signal.
- **S-1 / S-3 / F-***: shelf registration (fresh capacity); less time-sensitive but worth watching when combined with ATM activity.
- **8-K Item 3.02**: unregistered sales (private placements, converts, warrants) — discount is usually baked in at sign.
- **FWP (free-writing)**: marketing document — appears adjacent to big-book IPO or secondary windows.

## Source

- **API**: efts.sec.gov/LATEST/search-index (free, no key).
- **Window**: inclusive of both end dates.
- Per-family hard cap: 40 rows. Widen the window or narrow with `--forms 424B5` if you need more.
