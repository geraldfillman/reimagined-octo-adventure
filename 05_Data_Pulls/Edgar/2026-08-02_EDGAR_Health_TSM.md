---
title: "EDGAR Health Markers — TAIWAN SEMICONDUCTOR MANUFACTURING CO LTD"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "TSM"
cik: "0001046179"
company: "TAIWAN SEMICONDUCTOR MANUFACTURING CO LTD"
benchmark: "SMH"
reporting_currency: "TWD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **TWD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 7 constructive · 🟡 1 investigate · 🔴 0 concern · ⚪ 3 n/a → `signal_status: clear`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟡 investigate | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.55 | 5 FY window — check working capital and growth-capex explanation (10-K cash-flow statement). |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟢 constructive | §5.3 | Receivables growth − revenue growth | +0.6%pp | Collections keeping pace with reported revenue. |
| 🟢 constructive | §5.3 | Inventory growth − cost-of-sales growth | -14.0%pp | Inventory tracking cost of sales. |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | No debt concepts tagged — verify debt-free status in the 10-K debt note before treating as constructive. |
| 🟢 constructive | §5.5 | EBIT / interest expense | 125.96x | Interest burden well covered by operating earnings. |
| ⚪ n/a | §5.6 | Diluted share growth (YoY) | — | Diluted share count unavailable for two fiscal years. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +0.0% | SBC modest relative to revenue. |
| ⚪ n/a | §5.6 | Gross buybacks vs net share count | — | No share repurchases in the latest fiscal year. |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +42% of FCF | Payout within the comfortable range for a mature company. |
| 🟢 constructive | §9.2 | 12-month return vs SMH | +71.9% vs +90.4% (-18.5%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2024-12-31 | 2019-12-31 |
| netIncome | 6 | 2024-12-31 | 2019-12-31 |
| operatingCashFlow | 6 | 2024-12-31 | 2019-12-31 |
| capex | 6 | 2024-12-31 | 2019-12-31 |
| receivables | 6 | 2024-12-31 | 2019-12-31 |
| inventory | 6 | 2024-12-31 | 2019-12-31 |
| costOfRevenue | 6 | 2024-12-31 | 2019-12-31 |
| operatingIncome | 6 | 2024-12-31 | 2019-12-31 |
| depreciationAmortization | 0 | — | — |
| interestExpense | 6 | 2024-12-31 | 2019-12-31 |
| cash | 6 | 2024-12-31 | 2019-12-31 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 0 | — | — |
| debtCurrent | 0 | — | — |
| dilutedShares | 0 | — | — |
| sbc | 6 | 2024-12-31 | 2019-12-31 |
| dividendsPaid | 6 | 2024-12-31 | 2019-12-31 |
| buybacks | 0 | — | — |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker TSM --review`.
4. Check §7.3 hard-stop events before trusting any score.
