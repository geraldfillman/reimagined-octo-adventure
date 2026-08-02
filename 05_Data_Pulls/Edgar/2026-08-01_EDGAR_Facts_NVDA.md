---
title: "EDGAR Financial Skeleton — NVDA"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "NVDA"
cik: "0001045810"
company: "NVIDIA CORP"
tags: ["edgar", "company-intel", "nvda"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $215.9B (2026-01-25) | $130.5B (2025-01-26) | ↑ 65.5% |
| Gross profit | $153.5B (2026-01-25) | $97.9B (2025-01-26) | ↑ 56.8% |
| Operating income | $130.4B (2026-01-25) | $81.5B (2025-01-26) | ↑ 60.1% |
| Net income | $120.1B (2026-01-25) | $72.9B (2025-01-26) | ↑ 64.7% |
| Operating cash flow | $102.7B (2026-01-25) | $64.1B (2025-01-26) | ↑ 60.3% |
| Capital expenditure | $6.0B (2026-01-25) | $3.2B (2025-01-26) | ↑ 86.7% |
| Research & development | $18.5B (2026-01-25) | $12.9B (2025-01-26) | ↑ 43.2% |
| Stock-based compensation | $6.4B (2026-01-25) | $4.7B (2025-01-26) | ↑ 34.8% |
| Cash & equivalents | $10.6B (2026-01-25) | $8.6B (2025-01-26) | ↑ 23.5% |
| Receivables (current) | $38.5B (2026-01-25) | $23.1B (2025-01-26) | ↑ 66.8% |
| Inventory | $21.4B (2026-01-25) | $10.1B (2025-01-26) | ↑ 112.3% |
| Deferred revenue (current) | $1.4B (2026-01-25) | $837.0M (2025-01-26) | ↑ 64.8% |
| Goodwill | $20.8B (2026-01-25) | $5.2B (2025-01-26) | ↑ 301.5% |
| Long-term debt | $7.5B (2026-01-25) | $8.5B (2025-01-26) | ↓ -11.7% |
| Diluted shares (wtd avg) | 24.5B (2026-01-25) | 24.8B (2025-01-26) | ↓ -1.2% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | 71.1% | 75.0% |
| Operating margin | 60.4% | 62.4% |
| Free cash flow (OCF − capex) | $96.7B | $60.9B |
| OCF / net income | 85.6% | 87.9% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
