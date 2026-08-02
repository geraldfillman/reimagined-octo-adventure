---
title: "EDGAR Health Markers — Air Products & Chemicals, Inc."
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:apd:fcf_conversion:concern", "health:apd:dividend_to_fcf:concern"]
symbol: "APD"
cik: "0000002969"
company: "Air Products & Chemicals, Inc."
benchmark: "XLB"
reporting_currency: "USD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **USD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 6 constructive · 🟡 0 investigate · 🔴 2 concern · ⚪ 3 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🔴 concern | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | -0.72 | 5 FY window — below 50% without explanation is an earnings-quality red flag (§5.3). |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟢 constructive | §5.3 | Receivables growth − revenue growth | +4.9%pp | Collections keeping pace with reported revenue. |
| 🟢 constructive | §5.3 | Inventory growth − cost-of-sales growth | +0.3%pp | Inventory tracking cost of sales. |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | Debt concepts last reported FY2016 — tag likely retired (repaid or restructured); verify in the latest 10-K debt note. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | Interest expense last tagged FY2023 — likely immaterial or retired; verify in the latest debt note. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -0.0% | Net share count declining. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +0.6% | SBC modest relative to revenue. |
| ⚪ n/a | §5.6 | Gross buybacks vs net share count | — | No share repurchases in the latest fiscal year. |
| 🔴 concern | §5.7 | Dividend / free cash flow | FCF ≤ 0 | Dividend paid while free cash flow is non-positive — funded by debt, asset sales, or underinvestment (§5.7). |
| 🟢 constructive | §9.2 | 12-month return vs XLB | +4.7% vs +16.3% (-11.6%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-09-30 | 2020-09-30 |
| netIncome | 6 | 2025-09-30 | 2020-09-30 |
| operatingCashFlow | 6 | 2025-09-30 | 2020-09-30 |
| capex | 6 | 2025-09-30 | 2020-09-30 |
| receivables | 6 | 2025-09-30 | 2020-09-30 |
| inventory | 6 | 2025-09-30 | 2020-09-30 |
| costOfRevenue | 6 | 2025-09-30 | 2020-09-30 |
| operatingIncome | 6 | 2025-09-30 | 2020-09-30 |
| depreciationAmortization | 6 | 2025-09-30 | 2020-09-30 |
| interestExpense | 6 | 2023-09-30 | 2018-09-30 |
| cash | 6 | 2025-09-30 | 2020-09-30 |
| shortTermInvestments | 6 | 2025-09-30 | 2020-09-30 |
| debtLongTerm | 6 | 2016-09-30 | 2011-09-30 |
| debtCurrent | 6 | 2016-09-30 | 2011-09-30 |
| dilutedShares | 6 | 2025-09-30 | 2020-09-30 |
| sbc | 6 | 2025-09-30 | 2020-09-30 |
| dividendsPaid | 6 | 2025-09-30 | 2020-09-30 |
| buybacks | 6 | 2015-09-30 | 2010-09-30 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker APD --review`.
4. Check §7.3 hard-stop events before trusting any score.
