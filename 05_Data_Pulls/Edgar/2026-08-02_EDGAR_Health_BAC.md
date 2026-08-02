---
title: "EDGAR Health Markers — BANK OF AMERICA CORP /DE/"
source: "sec-edgar"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "health_markers"
skeleton_profile: "bank"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "BAC"
cik: "0000070858"
company: "BANK OF AMERICA CORP /DE/"
benchmark: "XLF"
reporting_currency: "USD"
tags: ["edgar", "company-intel", "health-review"]
---

## How to read this

Quantitative layer of [[04_Reference/Corporate_Health_Integrity_Framework]] — §5 screening bands (profile: **bank**, reporting currency: **USD**) plus the §9.2 relative-performance prompt. All markers are ratios/growth rates, so the currency cancels within each marker.

> Bands are **investigation prompts, not verdicts** (§5). Every 🟡/🔴 routes to a filing via the §15 table. ⚪ `n/a` is an explicit data gap — never estimated.

Rollup: 🟢 4 constructive · 🟡 1 investigate · 🔴 0 concern · ⚪ 6 n/a → `signal_status: clear`

## Markers

| Band | § | Marker | Value | Next step / context |
| --- | --- | --- | --- | --- |
| ⚪ n/a | §5.3 | FCF conversion (cumulative FCF / net income, ≤5 FY) | — | Capex concept not tagged — cannot compute FCF; verify in the cash-flow statement. |
| 🟡 investigate | §5.3 | Operating cash flow vs earnings trend | 1 yr divergent | Earnings rose while operating cash fell in the latest year — check for a temporary working-capital build (10-Q cash-flow statement). |
| ⚪ n/a | §5.3 | Receivables growth − revenue growth | — | No current-receivables concept tagged. |
| ⚪ n/a | §5.3 | Inventory growth − cost-of-sales growth | — | No inventory tagged (asset-light or service model) — marker not applicable. |
| ⚪ n/a | §5.5 | Net debt / EBITDA | — | §14: ordinary leverage bands do not apply to bank filers — use the sector emphasis list instead. |
| ⚪ n/a | §5.5 | EBIT / interest expense | — | §14: interest expense is a core operating cost for bank filers — coverage bands do not apply. |
| 🟢 constructive | §5.6 | Diluted share growth (YoY) | -3.2% | Net share count declining. |
| 🟢 constructive | §5.6 | Stock compensation / revenue | +3.5% | SBC modest relative to revenue. |
| 🟢 constructive | §5.6 | Gross buybacks vs net share count | -3.2% | Net share count declining — buybacks exceed issuance. |
| ⚪ n/a | §5.7 | Dividend / free cash flow | — | No dividend in the latest FY (last paid FY2013) — check whether the dividend was cut or suspended. |
| 🟢 constructive | §9.2 | 12-month return vs XLF | +35.7% vs +10.8% (+24.9%pp) | Within normal range of the benchmark; §9 ownership and volume markers still need the manual pass. |

## Fiscal-year coverage

Annual periods found per series (newest / oldest end date). Sparse series explain `n/a` markers above.

| Series | Years | Latest FY end | Oldest FY end |
| --- | --- | --- | --- |
| revenue | 6 | 2025-12-31 | 2020-12-31 |
| netIncome | 6 | 2025-12-31 | 2020-12-31 |
| operatingCashFlow | 6 | 2025-12-31 | 2020-12-31 |
| capex | 0 | — | — |
| receivables | 0 | — | — |
| inventory | 0 | — | — |
| costOfRevenue | 0 | — | — |
| operatingIncome | 0 | — | — |
| depreciationAmortization | 6 | 2025-12-31 | 2020-12-31 |
| interestExpense | 6 | 2023-12-31 | 2018-12-31 |
| cash | 6 | 2025-12-31 | 2020-12-31 |
| shortTermInvestments | 0 | — | — |
| debtLongTerm | 6 | 2025-12-31 | 2020-12-31 |
| debtCurrent | 0 | — | — |
| dilutedShares | 6 | 2025-12-31 | 2020-12-31 |
| sbc | 6 | 2025-12-31 | 2020-12-31 |
| dividendsPaid | 6 | 2013-12-31 | 2008-12-31 |
| buybacks | 6 | 2025-12-31 | 2020-12-31 |

## Next steps

1. Route every 🔴 concern with the §15 EDGAR table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.
2. Complete the qualitative pass (§6 operations, §7 governance, §8 accounting, §9 ownership) in a Health Review note.
3. Score §16 (economic 40 / stewardship 40 / market 20) — scaffold with `node run.mjs edgar health --ticker BAC --review`.
4. Check §7.3 hard-stop events before trusting any score.
