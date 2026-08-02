---
title: "EDGAR Financial Skeleton — APD"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "APD"
cik: "0000002969"
company: "AIR PRODUCTS AND CHEMICALS, INC."
tags: ["edgar", "company-intel", "apd"]
---

## Financial Skeleton — General profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $12.0B (2025-09-30) | $12.1B (2024-09-30) | ↓ -0.5% |
| Gross profit | $3.0B (2020-09-30) | $2.9B (2019-09-30) | ↑ 2.9% |
| Operating income | $-877.0M (2025-09-30) | $4.5B (2024-09-30) | ↓ -119.6% |
| Net income | $-394.5M (2025-09-30) | $3.8B (2024-09-30) | ↓ -110.3% |
| Operating cash flow | $3.3B (2025-09-30) | $3.6B (2024-09-30) | ↓ -10.7% |
| Capital expenditure | $7.0B (2025-09-30) | $6.8B (2024-09-30) | ↑ 3.3% |
| Research & development | $96.3M (2025-09-30) | $100.2M (2024-09-30) | ↓ -3.9% |
| Stock-based compensation | $76.4M (2025-09-30) | $61.8M (2024-09-30) | ↑ 23.6% |
| Cash & equivalents | $1.9B (2025-09-30) | $3.0B (2024-09-30) | ↓ -37.7% |
| Receivables (current) | $1.9B (2025-09-30) | $1.8B (2024-09-30) | ↑ 4.4% |
| Inventory | $776.5M (2025-09-30) | $766.0M (2024-09-30) | ↑ 1.4% |
| Deferred revenue (current) | $253.4M (2025-09-30) | $240.0M (2024-09-30) | ↑ 5.6% |
| Goodwill | $963.9M (2025-09-30) | $905.1M (2024-09-30) | ↑ 6.5% |
| Long-term debt | $4.9B (2016-09-30) | $3.9B (2015-09-30) | ↑ 24.5% |
| Diluted shares (wtd avg) | 222.7M (2025-09-30) | 222.8M (2024-09-30) | ↓ -0.0% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | -7.3% | 36.9% |
| Free cash flow (OCF − capex) | $-3.8B | $-3.1B |
| OCF / net income | -825.6% | 95.3% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
