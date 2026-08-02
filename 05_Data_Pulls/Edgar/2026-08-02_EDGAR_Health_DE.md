---
title: "EDGAR Health Markers — DEERE & CO"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "DE"
cik: "0000315189"
company: "DEERE & CO"
benchmark: "XLI"
reporting_currency: "USD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **USD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 7 constructive · 🟡 0 investigate · 🔴 0 concern · ⚪ 4 n/a → `signal_status: clear`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.88 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| ⚪ n/a | §5.3 | Receivables growth − revenue growth | — | No current-receivables concept tagged. |
| ⚪ n/a | §5.3 | Inventory growth − cost-of-sales growth | — | Inventory and cost-of-sales periods do not align — compute manually. |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | Operating income and D&A report different periods — cannot approximate EBITDA without mixing years. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | Operating income and interest expense report different periods — cannot compute coverage without mixing years. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -1.9% | Net share count declining. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +0.3% | SBC modest relative to revenue. |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -1.9% | Net share count declining — buybacks exceed issuance. |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +28% of FCF | Payout within the comfortable range for a mature company. |
| 🟢 constructive | §9.2 | 12-month return vs XLI | +18.3% vs +20.1% (-1.8%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-11-02 | 2020-11-01 |
| netIncome | 6 | 2025-11-02 | 2020-11-01 |
| operatingCashFlow | 6 | 2025-11-02 | 2020-11-01 |
| capex | 6 | 2025-11-02 | 2020-11-01 |
| receivables | 0 | — | — |
| inventory | 6 | 2025-11-02 | 2020-11-01 |
| costOfRevenue | 6 | 2017-10-29 | 2014-10-31 |
| operatingIncome | 6 | 2024-10-27 | 2019-11-03 |
| depreciationAmortization | 6 | 2025-11-02 | 2020-11-01 |
| interestExpense | 6 | 2025-11-02 | 2020-11-01 |
| cash | 6 | 2025-11-02 | 2020-11-01 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 6 | 2021-10-31 | 2017-10-29 |
| debtCurrent | 6 | 2025-11-02 | 2020-11-01 |
| dilutedShares | 6 | 2025-11-02 | 2020-11-01 |
| sbc | 6 | 2025-11-02 | 2020-11-01 |
| dividendsPaid | 6 | 2025-11-02 | 2020-11-01 |
| buybacks | 6 | 2025-11-02 | 2020-11-01 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker DE --review`.
4. Check §7.3 hard-stop events before trusting any score.
