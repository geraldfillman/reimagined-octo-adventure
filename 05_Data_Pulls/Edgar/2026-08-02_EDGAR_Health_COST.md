---
title: "EDGAR Health Markers — COSTCO WHOLESALE CORP /NEW"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "COST"
cik: "0000909832"
company: "COSTCO WHOLESALE CORP /NEW"
benchmark: "XLP"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 9 constructive · 🟡 2 investigate · 🔴 0 concern · ⚪ 0 n/a → `signal_status: clear`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.92 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟡 investigate | §5.3 | Receivables growth − revenue growth | +9.5%pp | Receivables outpacing revenue by 5–10pp — check payment terms and contract assets (revenue note). |
| 🟢 constructive | §5.3 | Inventory growth − cost-of-sales growth | -10.7%pp | Inventory tracking cost of sales. |
| 🟢 constructive | §5.5 | Net debt / EBITDA | net cash | Net cash position. |
| 🟢 constructive | §5.5 | EBIT / interest expense | 67.42x | Interest burden well covered by operating earnings. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | +0.0% | Dilution below 1% per year. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +0.3% | SBC modest relative to revenue. |
| 🟡 investigate | §5.6 | Gross buybacks vs net share count | +0.0% | Buybacks roughly offset grants — net shareholder benefit near zero. |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +28% of FCF | Payout within the comfortable range for a mature company. |
| 🟢 constructive | §9.2 | 12-month return vs XLP | -0.1% vs +6.1% (-6.2%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-08-31 | 2020-08-30 |
| netIncome | 6 | 2025-08-31 | 2020-08-30 |
| operatingCashFlow | 6 | 2025-08-31 | 2020-08-30 |
| capex | 6 | 2025-08-31 | 2020-08-30 |
| receivables | 6 | 2025-08-31 | 2020-08-30 |
| inventory | 6 | 2025-08-31 | 2020-08-30 |
| costOfRevenue | 6 | 2025-08-31 | 2020-08-30 |
| operatingIncome | 6 | 2025-08-31 | 2020-08-30 |
| depreciationAmortization | 6 | 2025-08-31 | 2020-08-30 |
| interestExpense | 6 | 2025-08-31 | 2020-08-30 |
| cash | 6 | 2025-08-31 | 2020-08-30 |
| shortTermInvestments | 6 | 2025-08-31 | 2020-08-30 |
| debtLongTerm | 6 | 2025-08-31 | 2020-08-30 |
| debtCurrent | 6 | 2025-08-31 | 2020-08-30 |
| dilutedShares | 6 | 2025-08-31 | 2020-08-30 |
| sbc | 6 | 2025-08-31 | 2020-08-30 |
| dividendsPaid | 6 | 2025-08-31 | 2020-08-30 |
| buybacks | 6 | 2025-08-31 | 2020-08-30 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker COST --review`.
4. Check §7.3 hard-stop events before trusting any score.
