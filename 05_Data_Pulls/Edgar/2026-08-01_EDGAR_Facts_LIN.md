---
title: "EDGAR Financial Skeleton — LIN"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "LIN"
cik: "0001707925"
company: "Linde plc"
tags: ["edgar", "company-intel", "lin"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $34.0B (2025-12-31) | $33.0B (2024-12-31) | ↑ 3.0% |
| Gross profit | — | — |  |
| Operating income | $8.9B (2025-12-31) | $8.6B (2024-12-31) | ↑ 3.3% |
| Net income | $6.9B (2025-12-31) | $6.6B (2024-12-31) | ↑ 5.1% |
| Operating cash flow | $10.3B (2025-12-31) | $9.4B (2024-12-31) | ↑ 9.8% |
| Capital expenditure | $5.3B (2025-12-31) | $4.5B (2024-12-31) | ↑ 17.0% |
| Research & development | $147.0M (2025-12-31) | $150.0M (2024-12-31) | ↓ -2.0% |
| Stock-based compensation | $107.0M (2022-12-31) | $128.0M (2021-12-31) | ↓ -16.4% |
| Cash & equivalents | $5.1B (2025-12-31) | $4.8B (2024-12-31) | ↑ 4.2% |
| Receivables (current) | $5.0B (2025-12-31) | $4.6B (2024-12-31) | ↑ 7.4% |
| Inventory | $2.1B (2025-12-31) | $1.9B (2024-12-31) | ↑ 5.6% |
| Deferred revenue (current) | $1.2B (2025-12-31) | $1.2B (2024-12-31) | ↑ 3.1% |
| Goodwill | $27.9B (2025-12-31) | $25.9B (2024-12-31) | ↑ 7.7% |
| Long-term debt | $20.7B (2025-12-31) | $15.3B (2024-12-31) | ↑ 34.8% |
| Diluted shares (wtd avg) | 472.2M (2025-12-31) | 482.1M (2024-12-31) | ↓ -2.1% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 26.3% | 26.2% |
| Free cash flow (OCF − capex) | $5.1B | $4.9B |
| OCF / net income | 150.0% | 143.5% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
