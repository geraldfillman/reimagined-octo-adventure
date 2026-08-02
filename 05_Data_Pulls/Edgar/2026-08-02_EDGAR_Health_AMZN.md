---
title: "EDGAR Health Markers — Amazon"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:amzn:fcf_conversion:concern"]
symbol: "AMZN"
cik: "0001018724"
company: "Amazon"
benchmark: "XLY"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 6 constructive · 🟡 1 investigate · 🔴 1 concern · ⚪ 3 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🔴 concern | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.21 | 5 FY window — below 50% without explanation is an earnings-quality red flag (§5.3). |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟡 investigate | §5.3 | Receivables growth − revenue growth | +9.8%pp | Receivables outpacing revenue by 5–10pp — check payment terms and contract assets (revenue note). |
| 🟢 constructive | §5.3 | Inventory growth − cost-of-sales growth | +2.8%pp | Inventory tracking cost of sales. |
| 🟢 constructive | §5.5 | Net debt / EBITDA | net cash | Net cash position. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | Interest expense last tagged FY2023 — likely immaterial or retired; verify in the latest debt note. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | +1.0% | Dilution below 1% per year. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +2.7% | SBC modest relative to revenue. |
| ⚪ n/a | §5.6 | Gross buybacks vs net share count | — | No share repurchases in the latest fiscal year. |
| ⚪ n/a | §5.7 | Dividend / free cash flow | — | No dividend paid — retention/reinvestment model. |
| 🟢 constructive | §9.2 | 12-month return vs XLY | +26.5% vs +7.4% (+19.0%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

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
| interestExpense | 6 | 2023-12-31 | 2018-12-31 |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 6 | 2025-12-31 | 2020-12-31 |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 6 | 2025-12-31 | 2020-12-31 |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 0 | — | — |
| buybacks | 6 | 2024-12-31 | 2014-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker AMZN --review`.
4. Check §7.3 hard-stop events before trusting any score.
