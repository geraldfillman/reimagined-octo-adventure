---
title: "Dilution Alert — RCAT"
node_type: "signal"
source: "SEC EDGAR + FMP Premium"
date_pulled: "2026-04-23"
ticker: "RCAT"
company: "Red Cat Holdings"
thesis: "drones"
domain: "fundamentals"
data_type: "signal"
signal_status: "alert"
signals: ["shelf_new", "unregistered_sale"]
overall_risk: "low"
cash_runway_months: 22.6
shelf_headroom_usd: 0
atm_to_float: 0
nasdaq_compliant: true
tags: ["signal", "dilution", "rcat"]
ack_status: "reviewed"
---

## Triggers

- **[ALERT] shelf_new** — New S-3 shelf went effective (capacity $0)
- **[WATCH] unregistered_sale** — 8-K Item 3.02 (unregistered sale) filed within last 30 days

## Key Metrics

| Metric | Value |
| --- | --- |
| Overall Risk | 🟢 low |
| Cash Runway (months) | 22.6mo |
| Shelf Max (USD) | $0 |
| Shelf Headroom (USD) | $0 |
| ATM / Float (market value) | 0% |
| Float Shares | 87.2M |
| Price | $12.54 |
| Nasdaq Compliant | ✅ |

## Recent Filings

| Date | Form | Items | Accession |
| --- | --- | --- | --- |
| 2026-04-23 | S-1 | — | 0001683168-26-003166 |
| 2026-04-10 | 8-K | 1.01,3.02,8.01,9.01 | 0001683168-26-002816 |
| 2026-02-05 | 8-K | 3.03,5.03,9.01 | 0001683168-26-000776 |

## Next Steps

- Verify shelf effective status on [EDGAR company page](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany).
- Check for any 8-K Item 8.01 press releases announcing an imminent raise.
- If long: review position sizing against worst-case offering discount.
