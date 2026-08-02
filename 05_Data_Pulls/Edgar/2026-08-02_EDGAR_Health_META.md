---
title: "EDGAR Health Markers — Meta Platforms, Inc."
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:meta:sbc_to_revenue:concern"]
symbol: "META"
cik: "0001326801"
company: "Meta Platforms, Inc."
benchmark: "XLC"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 8 constructive · 🟡 1 investigate · 🔴 1 concern · ⚪ 1 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.90 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟢 constructive | §5.3 | Receivables growth − revenue growth | -5.8%pp | Collections keeping pace with reported revenue. |
| ⚪ n/a | §5.3 | Inventory growth − cost-of-sales growth | — | No inventory tagged (asset-light or service model) — marker not applicable. |
| 🟢 constructive | §5.5 | Net debt / EBITDA | net cash | Net cash position. |
| 🟢 constructive | §5.5 | EBIT / interest expense | 76.40x | Interest burden well covered by operating earnings. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -1.5% | Net share count declining. |
| 🔴 concern | §5.6 | Stock compensation / revenue | +10.2% | Above 10% of revenue — real cost to owners; especially serious without strong cash economics (§5.6). |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -1.5% | Net share count declining — buybacks exceed issuance. |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +12% of FCF | Payout within the comfortable range for a mature company. |
| 🟡 investigate | §9.2 | 12-month return vs XLC | -25.8% vs +2.0% (-27.8%pp) | Underperformance ≥20pp over 12 months deserves a specific explanation — estimate revisions, forced selling, or a changed thesis (§9.2). |

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
| interestExpense | 4 | 2025-12-31 | 2022-12-31 |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 6 | 2025-12-31 | 2017-12-31 |
| debtLongTerm | 6 | 2025-12-31 | 2013-12-31 |
| debtCurrent | 0 | — | — |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 4 | 2025-12-31 | 2022-12-31 |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker META --review`.
4. Check §7.3 hard-stop events before trusting any score.
