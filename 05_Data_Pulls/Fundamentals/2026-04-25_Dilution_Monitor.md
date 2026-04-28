---
title: "Dilution Monitor"
source: "SEC EDGAR + FMP Premium"
date_pulled: "2026-04-25"
domain: "fundamentals"
data_type: "batch_scan"
frequency: "on_demand"
signal_status: "alert"
signals: ["shelf_new"]
tags: ["dilution", "sec", "fmp", "company-risk", "fundamentals"]
signal_state: new
---

## Dilution Risk Scorecard

| Ticker | Thesis        | Runway | Shelf Room | ATM/Float | Risk | Triggers  |
| ------ | ------------- | ------ | ---------- | --------- | ---- | --------- |
| ETN    | aipower       | ∞      | $0         | 0%        | 🟢   | —         |
| GEV    | aipower       | ∞      | $0         | 0%        | 🟢   | shelf_new |
| HUBB   | gridequipment | ∞      | $0         | 0%        | 🟢   | —         |
| POWL   | gridequipment | ∞      | $0         | 0%        | 🟢   | —         |
| PWR    | gridequipment | ∞      | $0         | 0%        | 🟢   | —         |
| MTZ    | gridequipment | ∞      | $0         | 0%        | 🟢   | —         |
| STRL   | aipower       | ∞      | $0         | 0%        | 🟢   | —         |
| MYRG   | gridequipment | ∞      | $0         | 0%        | 🟢   | —         |
| AMSC   | gridequipment | ∞      | $0         | 0%        | 🟢   | —         |
| WCC    | gridequipment | ∞      | $0         | 0%        | 🟢   | —         |

## Methodology

- **Cash runway** = (cash + short-term investments) / avg quarterly operating burn, expressed in months.
- **Shelf room** = MaximumAggregateOfferingPrice (EDGAR XBRL) − 424B takedowns in the last 24 months.
- **ATM/Float** = currently-effective shelf capacity ÷ float market value.
- **Risk**: 🟢 low · 🟡 medium · 🟠 high · 🔴 critical (thresholds in `scripts/lib/dilution-rules.mjs`).
- **Lookback**: 90 days of EDGAR filings per ticker.

## Sources

- **SEC EDGAR** submissions + XBRL company-facts (free, no key).
- **FMP Premium** balance-sheet-statement, cash-flow-statement, shares-float, quote.
