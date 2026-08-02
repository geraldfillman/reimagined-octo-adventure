---
title: "EDGAR Health Markers — NVIDIA"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:nvda:inventory_divergence:concern"]
symbol: "NVDA"
cik: "0001045810"
company: "NVIDIA"
benchmark: "XLK"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 8 constructive · 🟡 1 investigate · 🔴 1 concern · ⚪ 1 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| 🟢 constructive | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | 0.83 | 5 FY window — earnings are converting to cash. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🟢 constructive | §5.3 | Receivables growth − revenue growth | +1.3%pp | Collections keeping pace with reported revenue. |
| 🔴 concern | §5.3 | Inventory growth − cost-of-sales growth | +20.9%pp | Persistent inventory excess risk — check turns, obsolescence reserves, discounting (§5.3). |
| 🟢 constructive | §5.5 | Net debt / EBITDA | net cash | Net cash position. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | Interest expense last tagged FY2024 — likely immaterial or retired; verify in the latest debt note. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -1.2% | Net share count declining. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +3.0% | SBC modest relative to revenue. |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -1.2% | Net share count declining — buybacks exceed issuance. |
| 🟢 constructive | §5.7 | Dividend / free cash flow | +1% of FCF | Payout within the comfortable range for a mature company. |
| 🟡 investigate | §9.2 | 12-month return vs XLK | +15.6% vs +36.4% (-20.9%pp) | Underperformance ≥20pp over 12 months deserves a specific explanation — estimate revisions, forced selling, or a changed thesis (§9.2). |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2026-01-25 | 2021-01-31 |
| netIncome | 6 | 2026-01-25 | 2021-01-31 |
| operatingCashFlow | 6 | 2026-01-25 | 2021-01-31 |
| capex | 5 | 2026-01-25 | 2022-01-30 |
| receivables | 6 | 2026-01-25 | 2021-01-31 |
| inventory | 6 | 2026-01-25 | 2021-01-31 |
| costOfRevenue | 6 | 2026-01-25 | 2021-01-31 |
| operatingIncome | 6 | 2026-01-25 | 2021-01-31 |
| depreciationAmortization | 6 | 2026-01-25 | 2021-01-31 |
| interestExpense | 6 | 2024-01-28 | 2019-01-27 |
| cash | 6 | 2026-01-25 | 2021-01-31 |
| shortTermInvestments | 6 | 2025-01-26 | 2020-01-26 |
| debtLongTerm | 6 | 2026-01-25 | 2021-01-31 |
| debtCurrent | 6 | 2026-01-25 | 2021-01-31 |
| dilutedShares | 6 | 2026-01-25 | 2021-01-31 |
| sbc | 6 | 2026-01-25 | 2021-01-31 |
| dividendsPaid | 6 | 2026-01-25 | 2021-01-31 |
| buybacks | 6 | 2026-01-25 | 2021-01-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker NVDA --review`.
4. Check §7.3 hard-stop events before trusting any score.
