---
title: "EDGAR Financial Skeleton — NEE"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "NEE"
cik: "0000753308"
company: "NEXTERA ENERGY INC"
tags: ["edgar", "company-intel", "nee"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $25.8B (2025-12-31) | $23.5B (2024-12-31) | ↑ 9.8% |
| Gross profit | — | — |  |
| Operating income | $8.3B (2025-12-31) | $7.5B (2024-12-31) | ↑ 10.7% |
| Net income | $6.8B (2025-12-31) | $6.9B (2024-12-31) | ↓ -1.6% |
| Operating cash flow | $12.5B (2025-12-31) | $13.3B (2024-12-31) | ↓ -5.8% |
| Capital expenditure | — | — |  |
| Research & development | — | — |  |
| Stock-based compensation | — | — |  |
| Cash & equivalents | $2.8B (2025-12-31) | $1.5B (2024-12-31) | ↑ 89.1% |
| Receivables (current) | $4.0B (2025-12-31) | $3.3B (2024-12-31) | ↑ 20.4% |
| Inventory | $2.4B (2025-12-31) | $2.2B (2024-12-31) | ↑ 9.3% |
| Deferred revenue (current) | $709.0M (2025-12-31) | $694.0M (2024-12-31) | ↑ 2.2% |
| Goodwill | $4.8B (2025-12-31) | $4.9B (2024-12-31) | ↓ -0.3% |
| Long-term debt | $89.6B (2025-12-31) | $72.4B (2024-12-31) | ↑ 23.7% |
| Diluted shares (wtd avg) | 2.1B (2025-12-31) | 2.1B (2024-12-31) | ↑ 0.6% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 32.1% | 31.8% |
| OCF / net income | 182.7% | 190.9% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
