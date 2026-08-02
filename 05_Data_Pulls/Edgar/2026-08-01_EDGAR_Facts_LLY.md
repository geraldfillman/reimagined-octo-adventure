---
title: "EDGAR Financial Skeleton — LLY"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "LLY"
cik: "0000059478"
company: "ELI LILLY & Co"
tags: ["edgar", "company-intel", "lly"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $65.2B (2025-12-31) | $45.0B (2024-12-31) | ↑ 44.7% |
| Gross profit | — | — |  |
| Operating income | — | — |  |
| Net income | $20.6B (2025-12-31) | $10.6B (2024-12-31) | ↑ 94.9% |
| Operating cash flow | $16.8B (2025-12-31) | $8.8B (2024-12-31) | ↑ 90.7% |
| Capital expenditure | — | — |  |
| Research & development | $7.2B (2022-12-31) | $6.9B (2021-12-31) | ↑ 3.8% |
| Stock-based compensation | $626.0M (2025-12-31) | $646.0M (2024-12-31) | ↓ -3.1% |
| Cash & equivalents | $7.3B (2025-12-31) | $3.3B (2024-12-31) | ↑ 122.4% |
| Receivables (current) | $17.8B (2025-12-31) | $11.0B (2024-12-31) | ↑ 61.4% |
| Inventory | $13.7B (2025-12-31) | $7.6B (2024-12-31) | ↑ 81.1% |
| Deferred revenue (current) | — | — |  |
| Goodwill | $5.9B (2025-12-31) | $5.8B (2024-12-31) | ↑ 2.2% |
| Long-term debt | $40.9B (2025-12-31) | $28.5B (2024-12-31) | ↑ 43.3% |
| Diluted shares (wtd avg) | 899.3M (2025-12-31) | 904.1M (2024-12-31) | ↓ -0.5% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | — | — |
| OCF / net income | 81.5% | 83.3% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
