---
title: "EDGAR Health Markers — Eli Lilly"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:lly:receivable_divergence:concern", "health:lly:inventory_divergence:concern"]
symbol: "LLY"
cik: "0000059478"
company: "Eli Lilly"
benchmark: "XLV"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**) plus the §9.2 relative-performance prompt.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 5 constructive · 🟡 0 investigate · 🔴 2 concern · ⚪ 4 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| ⚪ n/a | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | — | Capex concept not tagged — cannot compute FCF; verify in the cash-flow statement. |
| 🟢 constructive | §5.3 | Operating cash flow vs earnings trend | aligned | Operating cash tracks earnings direction. |
| 🔴 concern | §5.3 | Receivables growth − revenue growth | +16.7%pp | Receivables outpacing revenue by >10pp — route to receivable note, allowance roll-forward, customer concentration (§15). |
| 🔴 concern | §5.3 | Inventory growth − cost-of-sales growth | +49.8%pp | Persistent inventory excess risk — check turns, obsolescence reserves, discounting (§5.3). |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | Operating income or D&A not tagged — cannot approximate EBITDA. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | Operating income not tagged. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -0.5% | Net share count declining. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +1.0% | SBC modest relative to revenue. |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -0.5% | Net share count declining — buybacks exceed issuance. |
| ⚪ n/a | §5.7 | Dividend / free cash flow | — | OCF or capex unavailable — cannot compute FCF payout. |
| 🟢 constructive | §9.2 | 12-month return vs XLV | +50.7% vs +24.0% (+26.7%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-12-31 | 2020-12-31 |
| netIncome | 6 | 2025-12-31 | 2020-12-31 |
| operatingCashFlow | 6 | 2025-12-31 | 2020-12-31 |
| capex | 0 | — | — |
| receivables | 6 | 2025-12-31 | 2020-12-31 |
| inventory | 6 | 2025-12-31 | 2020-12-31 |
| costOfRevenue | 6 | 2025-12-31 | 2020-12-31 |
| operatingIncome | 0 | — | — |
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 6 | 2023-12-31 | 2018-12-31 |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 6 | 2024-12-31 | 2019-12-31 |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 6 | 2025-12-31 | 2020-12-31 |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 6 | 2025-12-31 | 2020-12-31 |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker LLY --review`.
4. Check §7.3 hard-stop events before trusting any score.
