---
title: "EDGAR Financial Skeleton — VRT"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "VRT"
cik: "0001674101"
company: "Vertiv Holdings Co"
tags: ["edgar", "company-intel", "vrt"]
---

## Financial Skeleton — General profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $10.2B (2025-12-31) | $8.0B (2024-12-31) | ↑ 27.7% |
| Gross profit | — | — |  |
| Operating income | $1.8B (2025-12-31) | $1.4B (2024-12-31) | ↑ 33.8% |
| Net income | $1.3B (2025-12-31) | $495.8M (2024-12-31) | ↑ 168.8% |
| Operating cash flow | $2.1B (2025-12-31) | $1.3B (2024-12-31) | ↑ 60.2% |
| Capital expenditure | $220.0M (2025-12-31) | $167.0M (2024-12-31) | ↑ 31.7% |
| Research & development | $441.7M (2025-12-31) | $367.6M (2024-12-31) | ↑ 20.2% |
| Stock-based compensation | $45.9M (2025-12-31) | $34.6M (2024-12-31) | ↑ 32.7% |
| Cash & equivalents | $1.7B (2025-12-31) | $1.2B (2024-12-31) | ↑ 40.8% |
| Receivables (current) | $3.1B (2025-12-31) | $2.4B (2024-12-31) | ↑ 31.6% |
| Inventory | $1.5B (2025-12-31) | $1.2B (2024-12-31) | ↑ 17.0% |
| Deferred revenue (current) | $1.8B (2025-12-31) | $1.1B (2024-12-31) | ↑ 70.7% |
| Goodwill | $2.0B (2025-12-31) | $1.3B (2024-12-31) | ↑ 53.9% |
| Long-term debt | $2.9B (2025-12-31) | $2.9B (2024-12-31) | ↓ -0.5% |
| Diluted shares (wtd avg) | 390.7M (2025-12-31) | 386.3M (2024-12-31) | ↑ 1.1% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 17.9% | 17.1% |
| Free cash flow (OCF − capex) | $1.9B | $1.2B |
| OCF / net income | 158.6% | 266.1% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
