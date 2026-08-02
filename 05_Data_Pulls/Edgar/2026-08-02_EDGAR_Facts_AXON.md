---
title: "EDGAR Financial Skeleton — AXON"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "AXON"
cik: "0001069183"
company: "Axon Enterprise, Inc."
tags: ["edgar", "company-intel", "axon"]
---

## Financial Skeleton — General profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $2.8B (2025-12-31) | $2.1B (2024-12-31) | ↑ 33.5% |
| Gross profit | $1.7B (2025-12-31) | $1.2B (2024-12-31) | ↑ 33.6% |
| Operating income | $-62.1M (2025-12-31) | $58.5M (2024-12-31) | ↓ -206.0% |
| Net income | $124.7M (2025-12-31) | $377.0M (2024-12-31) | ↓ -66.9% |
| Operating cash flow | $211.3M (2025-12-31) | $408.3M (2024-12-31) | ↓ -48.2% |
| Capital expenditure | $136.3M (2025-12-31) | $78.8M (2024-12-31) | ↑ 72.9% |
| Research & development | $684.3M (2025-12-31) | $441.6M (2024-12-31) | ↑ 55.0% |
| Stock-based compensation | $634.2M (2025-12-31) | $382.6M (2024-12-31) | ↑ 65.8% |
| Cash & equivalents | $1.2B (2025-12-31) | $454.8M (2024-12-31) | ↑ 164.1% |
| Receivables (current) | $18.1M (2012-12-31) | $11.8M (2011-12-31) | ↑ 53.7% |
| Inventory | $341.8M (2025-12-31) | $265.3M (2024-12-31) | ↑ 28.8% |
| Deferred revenue (current) | $714.7M (2025-12-31) | $613.0M (2024-12-31) | ↑ 16.6% |
| Goodwill | $1.4B (2025-12-31) | $756.8M (2024-12-31) | ↑ 81.0% |
| Long-term debt | $1.7B (2025-12-31) | $0 (2024-12-31) | ↑ |
| Diluted shares (wtd avg) | 82.4M (2025-12-31) | 78.6M (2024-12-31) | ↑ 4.9% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | 59.7% | 59.6% |
| Operating margin | -2.2% | 2.8% |
| Free cash flow (OCF − capex) | $75.1M | $329.5M |
| OCF / net income | 169.5% | 108.3% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
