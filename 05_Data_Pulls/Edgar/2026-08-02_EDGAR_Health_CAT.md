---
title: "EDGAR Health Markers — Caterpillar"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:cat:receivable_divergence:concern"]
symbol: "CAT"
cik: "0000018230"
company: "Caterpillar"
benchmark: "XLI"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 7 constructive · 🟡 1 investigate · 🔴 1 concern · ⚪ 2 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.99 | 5 FY window — earnings are converting to cash. |
| 🟡 investigate | §5.3 | Operating cash flow vs earnings trend | 1 yr divergent | Earnings rose while operating cash fell in the latest year — check for a temporary working-capital build (10-Q cash-flow statement). |
| 🔴 concern | §5.3 | Receivables growth − revenue growth | +13.4%pp | Receivables outpacing revenue by >10pp — route to receivable note, allowance roll-forward, customer concentration (§15). |
| 🟢 constructive | §5.3 | Inventory growth − cost-of-sales growth | -3.6%pp | Inventory tracking cost of sales. |
| 🟢 constructive | §5.5 | Net debt / EBITDA | 1.54x | Leverage comfortable for a non-financial filer. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | No material interest expense tagged — likely unlevered; verify in the debt note. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -3.5% | Net share count declining. |
| ⚪ n/a | §5.6 | Stock compensation / revenue | — | ShareBasedCompensation not tagged — check the cash-flow statement. |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -3.5% | Net share count declining — buybacks exceed issuance. |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +31% of FCF | Payout within the comfortable range for a mature company. |
| 🟢 constructive | §9.2 | 12-month return vs XLI | +90.1% vs +20.1% (+70.0%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

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
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 0 | — | — |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 0 | — | — |
| dividendsPaid | 6 | 2025-12-31 | 2020-12-31 |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker CAT --review`.
4. Check §7.3 hard-stop events before trusting any score.
