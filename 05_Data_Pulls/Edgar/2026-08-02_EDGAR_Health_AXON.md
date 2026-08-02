---
title: "EDGAR Health Markers — AXON ENTERPRISE, INC."
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "alert"
signals: ["health:axon:net_debt_ebitda:concern", "health:axon:diluted_share_growth:concern", "health:axon:sbc_to_revenue:concern"]
symbol: "AXON"
cik: "0001069183"
company: "AXON ENTERPRISE, INC."
benchmark: "XLI"
reporting_currency: "USD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **USD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 3 constructive · 🟡 1 investigate · 🔴 3 concern · ⚪ 4 n/a → `signal_status: alert`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 1.03 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| ⚪ n/a | §5.3 | Receivables growth − revenue growth | — | Receivables and revenue periods do not align — compute manually from the 10-K. |
| 🟢 constructive | §5.3 | Inventory growth − cost-of-sales growth | -4.5%pp | Inventory tracking cost of sales. |
| 🔴 concern | §5.5 | Net debt / EBITDA | 4.94x | Above 4x — high risk, especially if cyclical or shrinking; route to debt note and maturity table (§15). |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | No material interest expense tagged — likely unlevered; verify in the debt note. |
| 🔴 concern | §5.6 | Diluted share growth (YoY) | +4.9% | Above 3% dilution — route to statement of equity and proxy compensation tables (§15). |
| 🔴 concern | §5.6 | Stock compensation / revenue | +22.8% | Above 10% of revenue — real cost to owners; especially serious without strong cash economics (§5.6). |
| ⚪ n/a | §5.6 | Gross buybacks vs net share count | — | No share repurchases in the latest fiscal year. |
| ⚪ n/a | §5.7 | Dividend / free cash flow | — | No dividend paid — retention/reinvestment model. |
| 🟡 investigate | §9.2 | 12-month return vs XLI | -28.9% vs +20.1% (-49.0%pp) | Underperformance ≥20pp over 12 months deserves a specific explanation — estimate revisions, forced selling, or a changed thesis (§9.2). |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-12-31 | 2020-12-31 |
| netIncome | 6 | 2025-12-31 | 2020-12-31 |
| operatingCashFlow | 6 | 2025-12-31 | 2020-12-31 |
| capex | 6 | 2025-12-31 | 2020-12-31 |
| receivables | 3 | 2012-12-31 | 2010-12-31 |
| inventory | 6 | 2025-12-31 | 2020-12-31 |
| costOfRevenue | 6 | 2025-12-31 | 2020-12-31 |
| operatingIncome | 6 | 2025-12-31 | 2020-12-31 |
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 0 | — | — |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 6 | 2025-12-31 | 2020-12-31 |
| debtLongTerm | 3 | 2025-12-31 | 2023-12-31 |
| debtCurrent | 3 | 2025-12-31 | 2023-12-31 |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 0 | — | — |
| buybacks | 6 | 2018-12-31 | 2013-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker AXON --review`.
4. Check §7.3 hard-stop events before trusting any score.
