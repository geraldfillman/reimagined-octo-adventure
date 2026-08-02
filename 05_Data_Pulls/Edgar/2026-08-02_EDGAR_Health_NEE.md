---
title: "EDGAR Health Markers — NextEra Energy"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:nee:net_debt_ebitda:concern"]
symbol: "NEE"
cik: "0000753308"
company: "NextEra Energy"
benchmark: "XLU"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 3 constructive · 🟡 0 investigate · 🔴 1 concern · ⚪ 7 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| ⚪ n/a | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | — | Capex concept not tagged — cannot compute FCF; verify in the cash-flow statement. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| ⚪ n/a | §5.3 | Receivables growth − revenue growth | — | Receivables and revenue periods do not align — compute manually from the 10-K. |
| ⚪ n/a | §5.3 | Inventory growth − cost-of-sales growth | — | Inventory and cost-of-sales periods do not align — compute manually. |
| 🔴 concern | §5.5 | Net debt / EBITDA | 6.07x | Above 4x — high risk, especially if cyclical or shrinking; route to debt note and maturity table (§15). |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | No material interest expense tagged — likely unlevered; verify in the debt note. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | +0.6% | Dilution below 1% per year. |
| ⚪ n/a | §5.6 | Stock compensation / revenue | — | ShareBasedCompensation not tagged — check the cash-flow statement. |
| ⚪ n/a | §5.6 | Gross buybacks vs net share count | — | No share repurchases in the latest fiscal year. |
| ⚪ n/a | §5.7 | Dividend / free cash flow | — | OCF or capex unavailable — cannot compute FCF payout. |
| 🟢 constructive | §9.2 | 12-month return vs XLU | +23.5% vs +3.4% (+20.1%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2012-12-31 | 2009-12-31 |
| netIncome | 6 | 2025-12-31 | 2020-12-31 |
| operatingCashFlow | 6 | 2025-12-31 | 2020-12-31 |
| capex | 0 | — | — |
| receivables | 6 | 2025-12-31 | 2020-12-31 |
| inventory | 6 | 2025-12-31 | 2020-12-31 |
| costOfRevenue | 0 | — | — |
| operatingIncome | 6 | 2025-12-31 | 2020-12-31 |
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 0 | — | — |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 6 | 2025-12-31 | 2020-12-31 |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 0 | — | — |
| dividendsPaid | 6 | 2025-12-31 | 2020-12-31 |
| buybacks | 6 | 2014-12-31 | 2010-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker NEE --review`.
4. Check §7.3 hard-stop events before trusting any score.
