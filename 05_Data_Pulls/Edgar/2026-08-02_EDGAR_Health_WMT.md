---
title: "EDGAR Health Markers — Walmart Inc."
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "WMT"
cik: "0000104169"
company: "Walmart Inc."
benchmark: "XLP"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 9 constructive · 🟡 1 investigate · 🔴 0 concern · ⚪ 1 n/a → `signal_status: clear`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.80 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟡 investigate | §5.3 | Receivables growth − revenue growth | +7.3%pp | Receivables outpacing revenue by 5–10pp — check payment terms and contract assets (revenue note). |
| 🟢 constructive | §5.3 | Inventory growth − cost-of-sales growth | -0.3%pp | Inventory tracking cost of sales. |
| 🟢 constructive | §5.5 | Net debt / EBITDA | 0.62x | Leverage comfortable for a non-financial filer. |
| 🟢 constructive | §5.5 | EBIT / interest expense | 12.87x | Interest burden well covered by operating earnings. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -0.7% | Net share count declining. |
| ⚪ n/a | §5.6 | Stock compensation / revenue | — | ShareBasedCompensation not tagged — check the cash-flow statement. |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -0.7% | Net share count declining — buybacks exceed issuance. |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +50% of FCF | Payout within the comfortable range for a mature company. |
| 🟢 constructive | §9.2 | 12-month return vs XLP | +12.9% vs +6.1% (+6.8%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2026-01-31 | 2021-01-31 |
| netIncome | 6 | 2026-01-31 | 2021-01-31 |
| operatingCashFlow | 6 | 2026-01-31 | 2021-01-31 |
| capex | 6 | 2026-01-31 | 2021-01-31 |
| receivables | 6 | 2026-01-31 | 2021-01-31 |
| inventory | 6 | 2026-01-31 | 2021-01-31 |
| costOfRevenue | 6 | 2026-01-31 | 2021-01-31 |
| operatingIncome | 6 | 2026-01-31 | 2021-01-31 |
| depreciationAmortization | 6 | 2026-01-31 | 2021-01-31 |
| interestExpense | 6 | 2026-01-31 | 2021-01-31 |
| cash | 6 | 2026-01-31 | 2021-01-31 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 6 | 2026-01-31 | 2021-01-31 |
| debtCurrent | 6 | 2026-01-31 | 2021-01-31 |
| dilutedShares | 6 | 2026-01-31 | 2021-01-31 |
| sbc | 0 | — | — |
| dividendsPaid | 6 | 2026-01-31 | 2021-01-31 |
| buybacks | 6 | 2026-01-31 | 2021-01-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker WMT --review`.
4. Check §7.3 hard-stop events before trusting any score.
