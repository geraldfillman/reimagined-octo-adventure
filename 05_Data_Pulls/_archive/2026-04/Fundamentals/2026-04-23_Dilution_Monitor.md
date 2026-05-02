---
title: "Dilution Monitor"
source: "SEC EDGAR + FMP Premium"
date_pulled: "2026-04-23"
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
| ATAI | psychedelics | 29.7mo | $0 | 0% | 🟢 | — |
| NRXP | psychedelics | 6.6mo | $0 | 0% | 🟡 | — |
| CMPS | psychedelics | 11.4mo | $0 | 0% | 🟡 | — |
| GHRS | psychedelics | 76.1mo | $0 | 0% | 🟢 | — |
| VKTX | glp1 | 30.4mo | $0 | 0% | 🟢 | — |
| ALVO | glp1 | 41.2mo | $0 | 0% | 🟢 | — |
| NTLA | geneediting | 13.7mo | $0 | 0% | 🟢 | — |
| BEAM | geneediting | 43.3mo | $0 | 0% | 🟢 | — |
| EDIT | geneediting | 10.6mo | $0 | 0% | 🟡 | — |
| SPRO | amr | 38.3mo | $0 | 0% | 🟢 | — |

## Methodology

- **Cash runway** = (cash + short-term investments) / avg quarterly operating burn, expressed in months.
- **Shelf room** = MaximumAggregateOfferingPrice (EDGAR XBRL) − 424B takedowns in the last 24 months.
- **ATM/Float** = currently-effective shelf capacity ÷ float market value.
- **Risk**: 🟢 low · 🟡 medium · 🟠 high · 🔴 critical (thresholds in `scripts/lib/dilution-rules.mjs`).
- **Lookback**: 90 days of EDGAR filings per ticker.

## Sources

- **SEC EDGAR** submissions + XBRL company-facts (free, no key).
- **FMP Premium** balance-sheet-statement, cash-flow-statement, shares-float, quote.
