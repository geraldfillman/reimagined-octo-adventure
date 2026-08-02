---
title: "EDGAR Health Markers — LINDE PLC"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "LIN"
cik: "0001707925"
company: "LINDE PLC"
benchmark: "XLB"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 9 constructive · 🟡 0 investigate · 🔴 0 concern · ⚪ 2 n/a → `signal_status: clear`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 1.01 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟢 constructive | §5.3 | Receivables growth − revenue growth | +4.5%pp | Collections keeping pace with reported revenue. |
| ⚪ n/a | §5.3 | Inventory growth − cost-of-sales growth | — | Inventory and cost-of-sales periods do not align — compute manually. |
| 🟢 constructive | §5.5 | Net debt / EBITDA | 1.37x | Leverage comfortable for a non-financial filer. |
| 🟢 constructive | §5.5 | EBIT / interest expense | 15.52x | Interest burden well covered by operating earnings. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -2.1% | Net share count declining. |
| ⚪ n/a | §5.6 | Stock compensation / revenue | — | Revenue unavailable or period-misaligned with SBC. |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -2.1% | Net share count declining — buybacks exceed issuance. |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +55% of FCF | Payout within the comfortable range for a mature company. |
| 🟢 constructive | §9.2 | 12-month return vs XLB | +4.1% vs +16.3% (-12.2%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

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
| costOfRevenue | 0 | — | — |
| operatingIncome | 6 | 2025-12-31 | 2020-12-31 |
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 6 | 2025-12-31 | 2020-12-31 |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 5 | 2025-12-31 | 2021-12-31 |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2022-12-31 | 2017-12-31 |
| dividendsPaid | 6 | 2025-12-31 | 2020-12-31 |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker LIN --review`.
4. Check §7.3 hard-stop events before trusting any score.
