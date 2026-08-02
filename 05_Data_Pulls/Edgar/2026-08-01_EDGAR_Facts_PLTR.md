---
title: "EDGAR Financial Skeleton — PLTR"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "PLTR"
cik: "0001321655"
company: "Palantir Technologies Inc."
tags: ["edgar", "company-intel", "pltr"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $4.5B (2025-12-31) | $2.9B (2024-12-31) | ↑ 56.2% |
| Gross profit | $3.7B (2025-12-31) | $2.3B (2024-12-31) | ↑ 60.3% |
| Operating income | $1.4B (2025-12-31) | $310.4M (2024-12-31) | ↑ 355.5% |
| Net income | $1.6B (2025-12-31) | $462.2M (2024-12-31) | ↑ 251.6% |
| Operating cash flow | $2.1B (2025-12-31) | $1.2B (2024-12-31) | ↑ 85.0% |
| Capital expenditure | $33.9M (2025-12-31) | $12.6M (2024-12-31) | ↑ 168.2% |
| Research & development | $557.7M (2025-12-31) | $507.9M (2024-12-31) | ↑ 9.8% |
| Stock-based compensation | $684.0M (2025-12-31) | $691.6M (2024-12-31) | ↓ -1.1% |
| Cash & equivalents | $1.4B (2025-12-31) | $2.1B (2024-12-31) | ↓ -32.2% |
| Receivables (current) | $1.0B (2025-12-31) | $575.0M (2024-12-31) | ↑ 81.2% |
| Inventory | — | — |  |
| Deferred revenue (current) | $409.0M (2025-12-31) | $259.6M (2024-12-31) | ↑ 57.5% |
| Goodwill | $37.9M (2022-12-31) | $1.9M (2021-12-31) | ↑ 1929.9% |
| Long-term debt | $0 (2021-12-31) | $198.0M (2020-12-31) | ↓ -100.0% |
| Diluted shares (wtd avg) | 2.6B (2025-12-31) | 2.5B (2024-12-31) | ↑ 4.7% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | 82.4% | 80.2% |
| Operating margin | 31.6% | 10.8% |
| Free cash flow (OCF − capex) | $2.1B | $1.1B |
| OCF / net income | 131.3% | 249.7% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
