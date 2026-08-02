---
title: "EDGAR Health Markers — Rocket Lab"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:rklb:diluted_share_growth:concern", "health:rklb:sbc_to_revenue:concern"]
symbol: "RKLB"
cik: "0001819994"
company: "Rocket Lab"
benchmark: "ARKX"
reporting_currency: "USD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **USD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 3 constructive · 🟡 1 investigate · 🔴 2 concern · ⚪ 5 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| ⚪ n/a | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | — | Cumulative net income ≤ 0 over 5 FY — ratio not meaningful; judge cash burn against milestones instead. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟢 constructive | §5.3 | Receivables growth − revenue growth | -30.9%pp | Collections keeping pace with reported revenue. |
| 🟡 investigate | §5.3 | Inventory growth − cost-of-sales growth | +9.7%pp | Inventory building ahead of sales — check backlog/launch explanation (MD&A). |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | EBITDA ≤ 0 — leverage ratio not meaningful; check §4 Level 1 survival markers instead. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | No material interest expense tagged — likely unlevered; verify in the debt note. |
| 🔴 concern | §5.6 | Diluted share growth (YoY) | +7.0% | Above 3% dilution — route to statement of equity and proxy compensation tables (§15). |
| 🔴 concern | §5.6 | Stock compensation / revenue | +11.8% | Above 10% of revenue — real cost to owners; especially serious without strong cash economics (§5.6). |
| ⚪ n/a | §5.6 | Gross buybacks vs net share count | — | No share repurchases in the latest fiscal year. |
| ⚪ n/a | §5.7 | Dividend / free cash flow | — | No dividend paid — retention/reinvestment model. |
| 🟢 constructive | §9.2 | 12-month return vs ARKX | +44.9% vs +19.8% (+25.2%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

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
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 0 | — | — |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 5 | 2025-12-31 | 2021-12-31 |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 6 | 2025-12-31 | 2020-12-31 |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 0 | — | — |
| buybacks | 0 | — | — |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker RKLB --review`.
4. Check §7.3 hard-stop events before trusting any score.
