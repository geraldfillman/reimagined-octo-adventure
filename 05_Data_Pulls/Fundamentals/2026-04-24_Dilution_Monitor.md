---
title: "Dilution Monitor"
source: "SEC EDGAR + FMP Premium"
date_pulled: "2026-04-24"
domain: "fundamentals"
data_type: "batch_scan"
frequency: "on_demand"
signal_status: "clear"
signals: []
tags: ["dilution", "sec", "fmp", "company-risk", "fundamentals"]
---

## Dilution Risk Scorecard

| Ticker | Thesis | Runway | Shelf Room | ATM/Float | Risk | Triggers |
| --- | --- | --- | --- | --- | --- | --- |
| ECPG | — | — | — | — | ⚠️ | error: no CIK mapping for ECPG — add to lib/cik-map.mjs |
| PRKS | — | — | — | — | ⚠️ | error: no CIK mapping for PRKS — add to lib/cik-map.mjs |
| IIPR | — | — | — | — | ⚠️ | error: Failed after 3 attempts: fetch failed |
| BRBR | — | — | — | — | ⚠️ | error: no CIK mapping for BRBR — add to lib/cik-map.mjs |
| KGEI | — | — | — | — | ⚠️ | error: no CIK mapping for KGEI — add to lib/cik-map.mjs |
| SLVM | — | — | — | — | ⚠️ | error: no CIK mapping for SLVM — add to lib/cik-map.mjs |
| YELP | — | — | — | — | ⚠️ | error: no CIK mapping for YELP — add to lib/cik-map.mjs |
| UFPT | — | — | — | — | ⚠️ | error: no CIK mapping for UFPT — add to lib/cik-map.mjs |
| WOLF | — | — | — | — | ⚠️ | error: Failed after 3 attempts: fetch failed |
| PPIH | — | — | — | — | ⚠️ | error: no CIK mapping for PPIH — add to lib/cik-map.mjs |

## Methodology

- **Cash runway** = (cash + short-term investments) / avg quarterly operating burn, expressed in months.
- **Shelf room** = MaximumAggregateOfferingPrice (EDGAR XBRL) − 424B takedowns in the last 24 months.
- **ATM/Float** = currently-effective shelf capacity ÷ float market value.
- **Risk**: 🟢 low · 🟡 medium · 🟠 high · 🔴 critical (thresholds in `scripts/lib/dilution-rules.mjs`).
- **Lookback**: 90 days of EDGAR filings per ticker.

## Sources

- **SEC EDGAR** submissions + XBRL company-facts (free, no key).
- **FMP Premium** balance-sheet-statement, cash-flow-statement, shares-float, quote.
