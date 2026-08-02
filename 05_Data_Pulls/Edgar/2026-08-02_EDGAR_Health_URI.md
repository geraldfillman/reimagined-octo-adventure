---
title: "EDGAR Health Markers — UNITED RENTALS, INC."
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "watch"
signals: ["health:uri:inventory_divergence:concern"]
symbol: "URI"
cik: "0001067701"
company: "UNITED RENTALS, INC."
benchmark: "XLI"
reporting_currency: "USD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **general**, reporting currency: **USD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 5 constructive · 🟡 2 investigate · 🔴 1 concern · ⚪ 3 n/a → `signal_status: watch`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| ⚪ n/a | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | — | Fewer than 2 period-aligned fiscal years across NI/OCF/capex — one series is sparse or a tag was retired mid-window. |
| 🟡 investigate | §5.3 | Operating cash flow vs earnings trend | 1 yr divergent | Earnings rose while operating cash fell in the latest year — check for a temporary working-capital build (10-Q cash-flow statement). |
| 🟢 constructive | §5.3 | Receivables growth − revenue growth | +3.5%pp | Collections keeping pace with reported revenue. |
| 🔴 concern | §5.3 | Inventory growth − cost-of-sales growth | +11.7%pp | Persistent inventory excess risk — check turns, obsolescence reserves, discounting (§5.3). |
| 🟡 investigate | §5.5 | Net debt / EBITDA | 3.50x | Watch zone — check maturity schedule and covenant headroom (debt note). |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | No material interest expense tagged — likely unlevered; verify in the debt note. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -2.9% | Net share count declining. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +3.6% | SBC modest relative to revenue. |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -2.9% | Net share count declining — buybacks exceed issuance. |
| ⚪ n/a | §5.7 | Dividend / free cash flow | — | Dividends, OCF, and capex report different periods — compute the payout manually from one cash-flow statement. |
| 🟢 constructive | §9.2 | 12-month return vs XLI | +25.6% vs +20.1% (+5.4%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-12-31 | 2020-12-31 |
| netIncome | 6 | 2025-12-31 | 2020-12-31 |
| operatingCashFlow | 6 | 2025-12-31 | 2020-12-31 |
| capex | 6 | 2024-12-31 | 2019-12-31 |
| receivables | 6 | 2025-12-31 | 2020-12-31 |
| inventory | 6 | 2025-12-31 | 2020-12-31 |
| costOfRevenue | 6 | 2025-12-31 | 2020-12-31 |
| operatingIncome | 6 | 2025-12-31 | 2020-12-31 |
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 0 | — | — |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 6 | 2025-12-31 | 2020-12-31 |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 5 | 2025-12-31 | 2021-12-31 |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker URI --review`.
4. Check §7.3 hard-stop events before trusting any score.
