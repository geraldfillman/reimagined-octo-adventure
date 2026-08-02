---
title: "EDGAR Health Markers — Palantir"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "alert"
signals: ["health:pltr:receivable_divergence:concern", "health:pltr:diluted_share_growth:concern", "health:pltr:sbc_to_revenue:concern", "health:pltr:buyback_offset:concern"]
symbol: "PLTR"
cik: "0001321655"
company: "Palantir"
benchmark: "SPY"
reporting_currency: "USD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **USD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 2 constructive · 🟡 1 investigate · 🔴 4 concern · ⚪ 4 n/a → `signal_status: alert`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 3.17 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🔴 concern | §5.3 | Receivables growth − revenue growth | +25.0%pp | Receivables outpacing revenue by >10pp — route to receivable note, allowance roll-forward, customer concentration (§15). |
| ⚪ n/a | §5.3 | Inventory growth − cost-of-sales growth | — | No inventory tagged (asset-light or service model) — marker not applicable. |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | Debt concepts last reported FY2021 — tag likely retired (repaid or restructured); verify in the latest 10-K debt note. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | Interest expense last tagged FY2023 — likely immaterial or retired; verify in the latest debt note. |
| 🔴 concern | §5.6 | Diluted share growth (YoY) | +4.7% | Above 3% dilution — route to statement of equity and proxy compensation tables (§15). |
| 🔴 concern | §5.6 | Stock compensation / revenue | +15.3% | Above 10% of revenue — real cost to owners; especially serious without strong cash economics (§5.6). |
| 🔴 concern | §5.6 | Gross buybacks vs net share count | +4.7% | Buybacks while the diluted share count still rose — repurchases are absorbing grants, not returning capital (§5.6). |
| ⚪ n/a | §5.7 | Dividend / free cash flow | — | No dividend paid — retention/reinvestment model. |
| 🟡 investigate | §9.2 | 12-month return vs SPY | -20.2% vs +20.2% (-40.4%pp) | Underperformance ≥20pp over 12 months deserves a specific explanation — estimate revisions, forced selling, or a changed thesis (§9.2). |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-12-31 | 2020-12-31 |
| netIncome | 6 | 2025-12-31 | 2020-12-31 |
| operatingCashFlow | 6 | 2025-12-31 | 2020-12-31 |
| capex | 6 | 2025-12-31 | 2020-12-31 |
| receivables | 6 | 2025-12-31 | 2020-12-31 |
| inventory | 0 | — | — |
| costOfRevenue | 6 | 2025-12-31 | 2020-12-31 |
| operatingIncome | 6 | 2025-12-31 | 2020-12-31 |
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 6 | 2023-12-31 | 2018-12-31 |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 5 | 2025-12-31 | 2021-12-31 |
| debtLongTerm | 3 | 2021-12-31 | 2019-12-31 |
| debtCurrent | 0 | — | — |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 0 | — | — |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker PLTR --review`.
4. Check §7.3 hard-stop events before trusting any score.
