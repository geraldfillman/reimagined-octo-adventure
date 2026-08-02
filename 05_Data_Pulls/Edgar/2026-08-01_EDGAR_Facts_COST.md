---
title: "EDGAR Financial Skeleton — COST"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "COST"
cik: "0000909832"
company: "COSTCO WHOLESALE CORP /NEW"
tags: ["edgar", "company-intel", "cost"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $275.2B (2025-08-31) | $254.5B (2024-09-01) | ↑ 8.2% |
| Gross profit | — | — |  |
| Operating income | $10.4B (2025-08-31) | $9.3B (2024-09-01) | ↑ 11.8% |
| Net income | $8.1B (2025-08-31) | $7.4B (2024-09-01) | ↑ 9.9% |
| Operating cash flow | $13.3B (2025-08-31) | $11.3B (2024-09-01) | ↑ 17.6% |
| Capital expenditure | $5.5B (2025-08-31) | $4.7B (2024-09-01) | ↑ 16.7% |
| Research & development | — | — |  |
| Stock-based compensation | $860.0M (2025-08-31) | $818.0M (2024-09-01) | ↑ 5.1% |
| Cash & equivalents | $14.2B (2025-08-31) | $9.9B (2024-09-01) | ↑ 43.0% |
| Receivables (current) | — | — |  |
| Inventory | $18.1B (2025-08-31) | $18.6B (2024-09-01) | ↓ -2.8% |
| Deferred revenue (current) | $2.9B (2025-08-31) | $2.5B (2024-09-01) | ↑ 14.1% |
| Goodwill | $994.0M (2024-09-01) | $994.0M (2023-09-03) | → 0.0% |
| Long-term debt | $5.7B (2025-08-31) | $5.8B (2024-09-01) | ↓ -1.4% |
| Diluted shares (wtd avg) | 444.8M (2025-08-31) | 444.8M (2024-09-01) | ↑ 0.0% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 3.8% | 3.6% |
| Free cash flow (OCF − capex) | $7.8B | $6.6B |
| OCF / net income | 164.6% | 153.9% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
