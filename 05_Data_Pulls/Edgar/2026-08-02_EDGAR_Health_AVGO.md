---
title: "EDGAR Health Markers — Broadcom Inc."
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "alert"
signals: ["health:avgo:receivable_divergence:concern", "health:avgo:inventory_divergence:concern", "health:avgo:sbc_to_revenue:concern", "health:avgo:buyback_offset:concern"]
symbol: "AVGO"
cik: "0001730168"
company: "Broadcom Inc."
benchmark: "SMH"
reporting_currency: "USD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **USD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 3 constructive · 🟡 2 investigate · 🔴 4 concern · ⚪ 2 n/a → `signal_status: alert`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 1.53 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🔴 concern | §5.3 | Receivables growth − revenue growth | +37.9%pp | Receivables outpacing revenue by >10pp — route to receivable note, allowance roll-forward, customer concentration (§15). |
| 🔴 concern | §5.3 | Inventory growth − cost-of-sales growth | +21.0%pp | Persistent inventory excess risk — check turns, obsolescence reserves, discounting (§5.3). |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | Operating income or D&A not tagged — cannot approximate EBITDA. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | Interest expense last tagged FY2024 — likely immaterial or retired; verify in the latest debt note. |
| 🟡 investigate | §5.6 | Diluted share growth (YoY) | +1.6% | 1–3% annual dilution — net buybacks against grants (statement of equity). |
| 🔴 concern | §5.6 | Stock compensation / revenue | +11.8% | Above 10% of revenue — real cost to owners; especially serious without strong cash economics (§5.6). |
| 🔴 concern | §5.6 | Gross buybacks vs net share count | +1.6% | Buybacks while the diluted share count still rose — repurchases are absorbing grants, not returning capital (§5.6). |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +41% of FCF | Payout within the comfortable range for a mature company. |
| 🟡 investigate | §9.2 | 12-month return vs SMH | +34.9% vs +90.4% (-55.5%pp) | Underperformance ≥20pp over 12 months deserves a specific explanation — estimate revisions, forced selling, or a changed thesis (§9.2). |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-11-02 | 2020-11-01 |
| netIncome | 6 | 2025-11-02 | 2020-11-01 |
| operatingCashFlow | 6 | 2025-11-02 | 2020-11-01 |
| capex | 6 | 2025-11-02 | 2020-11-01 |
| receivables | 6 | 2025-11-02 | 2020-11-01 |
| inventory | 6 | 2025-11-02 | 2020-11-01 |
| costOfRevenue | 6 | 2025-11-02 | 2020-11-01 |
| operatingIncome | 6 | 2025-11-02 | 2020-11-01 |
| depreciationAmortization | 0 | — | — |
| interestExpense | 6 | 2024-11-03 | 2019-11-03 |
| cash | 6 | 2025-11-02 | 2020-11-01 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 5 | 2021-10-31 | 2017-10-29 |
| debtCurrent | 6 | 2025-11-02 | 2020-11-01 |
| dilutedShares | 6 | 2025-11-02 | 2020-11-01 |
| sbc | 6 | 2025-11-02 | 2020-11-01 |
| dividendsPaid | 6 | 2025-11-02 | 2020-11-01 |
| buybacks | 6 | 2025-11-02 | 2020-11-01 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker AVGO --review`.
4. Check §7.3 hard-stop events before trusting any score.
