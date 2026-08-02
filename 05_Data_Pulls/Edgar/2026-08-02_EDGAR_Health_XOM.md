---
title: "EDGAR Health Markers — ExxonMobil"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "XOM"
cik: "0000034088"
company: "ExxonMobil"
benchmark: "XLE"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 4 constructive · 🟡 3 investigate · 🔴 0 concern · ⚪ 4 n/a → `signal_status: clear`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 1.03 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟡 investigate | §5.3 | Receivables growth − revenue growth | +6.3%pp | Receivables outpacing revenue by 5–10pp — check payment terms and contract assets (revenue note). |
| ⚪ n/a | §5.3 | Inventory growth − cost-of-sales growth | — | Inventory and cost-of-sales periods do not align — compute manually. |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | Operating income or D&A not tagged — cannot approximate EBITDA. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | Operating income not tagged. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | +0.2% | Dilution below 1% per year. |
| ⚪ n/a | §5.6 | Stock compensation / revenue | — | ShareBasedCompensation not tagged — check the cash-flow statement. |
| 🟡 investigate | §5.6 | Gross buybacks vs net share count | +0.2% | Buybacks roughly offset grants — net shareholder benefit near zero. |
| 🟡 investigate | §5.7 | Dividend / free cash flow | +73% of FCF | Payout above 60% of FCF — check reinvestment needs and maintenance capex. |
| 🟢 constructive | §9.2 | 12-month return vs XLE | +41.8% vs +39.2% (+2.6%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-12-31 | 2020-12-31 |
| netIncome | 6 | 2025-12-31 | 2020-12-31 |
| operatingCashFlow | 6 | 2025-12-31 | 2020-12-31 |
| capex | 6 | 2025-12-31 | 2020-12-31 |
| receivables | 6 | 2025-12-31 | 2020-12-31 |
| inventory | 2 | 2011-12-31 | 2010-12-31 |
| costOfRevenue | 0 | — | — |
| operatingIncome | 0 | — | — |
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 6 | 2025-12-31 | 2020-12-31 |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 3 | 2010-12-31 | 2008-12-31 |
| debtLongTerm | 6 | 2017-12-31 | 2012-12-31 |
| debtCurrent | 6 | 2025-12-31 | 2020-12-31 |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 0 | — | — |
| dividendsPaid | 6 | 2025-12-31 | 2020-12-31 |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker XOM --review`.
4. Check §7.3 hard-stop events before trusting any score.
