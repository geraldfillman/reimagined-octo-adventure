---
title: "Dilution Alert — MNTS"
node_type: "signal"
source: "SEC EDGAR + FMP Premium"
date_pulled: "2026-04-23"
ticker: "MNTS"
company: "Momentus Space"
thesis: "space"
domain: "fundamentals"
data_type: "signal"
signal_status: "alert"
signals: ["shelf_new", "unregistered_sale"]
overall_risk: "medium"
cash_runway_months: 6.6
shelf_headroom_usd: 0
atm_to_float: 0
nasdaq_compliant: true
tags: ["signal", "dilution", "mnts"]
ack_status: "reviewed"
---

## Triggers

- **[ALERT] shelf_new** — New S-3 shelf went effective (capacity $0)
- **[WATCH] unregistered_sale** — 8-K Item 3.02 (unregistered sale) filed within last 30 days

## Key Metrics

| Metric | Value |
| --- | --- |
| Overall Risk | 🟡 medium |
| Cash Runway (months) | 6.6mo |
| Shelf Max (USD) | $0 |
| Shelf Headroom (USD) | $0 |
| ATM / Float (market value) | 0% |
| Float Shares | 5.7M |
| Price | $5.64 |
| Nasdaq Compliant | ✅ |

## Recent Filings

| Date | Form | Items | Accession |
| --- | --- | --- | --- |
| 2026-04-21 | S-3 | — | 0001140361-26-015951 |
| 2026-04-20 | 8-K | 1.02 | 0001140361-26-015530 |
| 2026-04-16 | 8-K | 1.01,3.02,7.01,9.01 | 0001140361-26-014988 |
| 2026-04-13 | 8-K | 8.01,9.01 | 0001140361-26-014365 |
| 2026-02-20 | 8-K | 8.01 | 0001140361-26-006335 |

## Next Steps

- Verify shelf effective status on [EDGAR company page](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany).
- Check for any 8-K Item 8.01 press releases announcing an imminent raise.
- If long: review position sizing against worst-case offering discount.
