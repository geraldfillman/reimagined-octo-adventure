---
title: "EDGAR Health Markers — NOVO NORDISK A S"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "NVO"
cik: "0000353278"
company: "NOVO NORDISK A S"
benchmark: "XLV"
reporting_currency: "DKK"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **DKK**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 6 constructive · 🟡 3 investigate · 🔴 0 concern · ⚪ 2 n/a → `signal_status: clear`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.85 | 5 FY window — earnings are converting to cash. |
| 🟡 investigate | §5.3 | Operating cash flow vs earnings trend | 1 yr divergent | Earnings rose while operating cash fell in the latest year — check for a temporary working-capital build (10-Q cash-flow statement). |
| 🟢 constructive | §5.3 | Receivables growth − revenue growth | -7.9%pp | Collections keeping pace with reported revenue. |
| 🟢 constructive | §5.3 | Inventory growth − cost-of-sales growth | -10.6%pp | Inventory tracking cost of sales. |
| 🟢 constructive | §5.5 | Net debt / EBITDA | 0.73x | Leverage comfortable for a non-financial filer. |
| 🟢 constructive | §5.5 | EBIT / interest expense | 30.34x | Interest burden well covered by operating earnings. |
| ⚪ n/a | §5.6 | Diluted share growth (YoY) | — | Diluted share count unavailable for two fiscal years. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +0.5% | SBC modest relative to revenue. |
| ⚪ n/a | §5.6 | Gross buybacks vs net share count | — | Buybacks present but share-count trend unavailable. |
| 🟡 investigate | §5.7 | Dividend / free cash flow | +88% of FCF | Payout above 60% of FCF — check reinvestment needs and maintenance capex. |
| 🟡 investigate | §9.2 | 12-month return vs XLV | -2.3% vs +24.0% (-26.3%pp) | Underperformance ≥20pp over 12 months deserves a specific explanation — estimate revisions, forced selling, or a changed thesis (§9.2). |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-12-31 | 2020-12-31 |
| netIncome | 6 | 2025-12-31 | 2020-12-31 |
| operatingCashFlow | 6 | 2025-12-31 | 2020-12-31 |
| capex | 6 | 2025-12-31 | 2020-12-31 |
| receivables | 6 | 2025-12-31 | 2020-12-31 |
| inventory | 6 | 2025-12-31 | 2020-12-31 |
| costOfRevenue | 6 | 2025-12-31 | 2020-12-31 |
| operatingIncome | 6 | 2025-12-31 | 2020-12-31 |
| depreciationAmortization | 4 | 2025-12-31 | 2022-12-31 |
| interestExpense | 6 | 2025-12-31 | 2020-12-31 |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 0 | — | — |
| dilutedShares | 0 | — | — |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 6 | 2025-12-31 | 2020-12-31 |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker NVO --review`.
4. Check §7.3 hard-stop events before trusting any score.
