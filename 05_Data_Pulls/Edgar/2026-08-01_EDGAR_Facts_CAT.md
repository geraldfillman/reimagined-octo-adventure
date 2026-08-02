---
title: "EDGAR Financial Skeleton — CAT"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "CAT"
cik: "0000018230"
company: "CATERPILLAR INC"
tags: ["edgar", "company-intel", "cat"]
---

## Financial Skeleton — General profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $67.6B (2025-12-31) | $64.8B (2024-12-31) | ↑ 4.3% |
| Gross profit | — | — |  |
| Operating income | $11.2B (2025-12-31) | $13.1B (2024-12-31) | ↓ -14.7% |
| Net income | $2.7B (2010-12-31) | $895.0M (2009-12-31) | ↑ 201.7% |
| Operating cash flow | $11.7B (2025-12-31) | $12.0B (2024-12-31) | ↓ -2.5% |
| Capital expenditure | $2.8B (2025-12-31) | $2.0B (2024-12-31) | ↑ 41.9% |
| Research & development | $2.1B (2025-12-31) | $2.1B (2024-12-31) | ↑ 1.9% |
| Stock-based compensation | — | — |  |
| Cash & equivalents | $10.0B (2025-12-31) | $6.9B (2024-12-31) | ↑ 44.9% |
| Receivables (current) | $10.9B (2025-12-31) | $9.3B (2024-12-31) | ↑ 17.6% |
| Inventory | $18.1B (2025-12-31) | $16.8B (2024-12-31) | ↑ 7.8% |
| Deferred revenue (current) | $3.3B (2025-12-31) | $2.3B (2024-12-31) | ↑ 42.7% |
| Goodwill | $5.3B (2025-12-31) | $5.2B (2024-12-31) | ↑ 1.5% |
| Long-term debt | $30.7B (2025-12-31) | $27.4B (2024-12-31) | ↑ 12.2% |
| Diluted shares (wtd avg) | 472.3M (2025-12-31) | 489.4M (2024-12-31) | ↓ -3.5% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 16.5% | 20.2% |
| Free cash flow (OCF − capex) | $8.9B | $10.0B |
| OCF / net income | — | — |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
