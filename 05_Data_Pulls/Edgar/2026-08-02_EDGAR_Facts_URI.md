---
title: "EDGAR Financial Skeleton — URI"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "URI"
cik: "0001067701"
company: "United Rentals, Inc."
tags: ["edgar", "company-intel", "uri"]
---

## Financial Skeleton — General profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $3.7B (2025-12-31) | $3.6B (2024-12-31) | ↑ 3.0% |
| Gross profit | $6.1B (2025-12-31) | $6.2B (2024-12-31) | ↓ -0.1% |
| Operating income | $4.0B (2025-12-31) | $4.1B (2024-12-31) | ↓ -2.3% |
| Net income | $2.5B (2025-12-31) | $2.6B (2024-12-31) | ↓ -3.1% |
| Operating cash flow | $5.2B (2025-12-31) | $4.5B (2024-12-31) | ↑ 14.2% |
| Capital expenditure | $4.1B (2024-12-31) | $3.9B (2023-12-31) | ↑ 6.9% |
| Research & development | — | — |  |
| Stock-based compensation | $134.0M (2025-12-31) | $112.0M (2024-12-31) | ↑ 19.6% |
| Cash & equivalents | $459.0M (2025-12-31) | $457.0M (2024-12-31) | ↑ 0.4% |
| Receivables (current) | $2.5B (2025-12-31) | $2.4B (2024-12-31) | ↑ 6.5% |
| Inventory | $240.0M (2025-12-31) | $200.0M (2024-12-31) | ↑ 20.0% |
| Deferred revenue (current) | $175.0M (2025-12-31) | $185.0M (2024-12-31) | ↓ -5.4% |
| Goodwill | $7.1B (2025-12-31) | $6.9B (2024-12-31) | ↑ 3.2% |
| Long-term debt | $14.3B (2025-12-31) | $13.5B (2024-12-31) | ↑ 6.2% |
| Diluted shares (wtd avg) | 64.6M (2025-12-31) | 66.6M (2024-12-31) | ↓ -2.9% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | 166.3% | 171.4% |
| Operating margin | 107.5% | 113.3% |
| OCF / net income | 208.1% | 176.5% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
