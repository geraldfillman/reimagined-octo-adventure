---
title: "SEC Filing Digest"
source: "SEC EDGAR"
date_pulled: "2026-04-24"
domain: "fundamentals"
data_type: "digest"
frequency: "daily"
signal_status: "clear"
signals: []
lookback_since: "2026-04-22"
tickers_scanned: 10
tags: ["sec", "edgar", "digest", "fundamentals"]
---

## No Filings

_No tagged filings in the window._

## Methodology

- Categories are ordered most-severe-first; each filing counted exactly once under its first matching category.
- Summaries are rule-based (no LLM). For narrative summaries pipe the filing body through `node run.mjs kb compile` with an 8-K template.
- Sources: data.sec.gov/submissions (no key, 10 req/sec cap).
