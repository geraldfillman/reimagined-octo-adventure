---
title: "EDGAR Financial Skeleton — AMZN"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "AMZN"
cik: "0001018724"
company: "AMAZON COM INC"
tags: ["edgar", "company-intel", "amzn"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $716.9B (2025-12-31) | $638.0B (2024-12-31) | ↑ 12.4% |
| Gross profit | $5.5B (2009-12-31) | $4.3B (2008-12-31) | ↑ 29.5% |
| Operating income | $80.0B (2025-12-31) | $68.6B (2024-12-31) | ↑ 16.6% |
| Net income | $77.7B (2025-12-31) | $59.2B (2024-12-31) | ↑ 31.1% |
| Operating cash flow | $139.5B (2025-12-31) | $115.9B (2024-12-31) | ↑ 20.4% |
| Capital expenditure | $131.8B (2025-12-31) | $83.0B (2024-12-31) | ↑ 58.8% |
| Research & development | — | — |  |
| Stock-based compensation | $19.5B (2025-12-31) | $22.0B (2024-12-31) | ↓ -11.6% |
| Cash & equivalents | $86.8B (2025-12-31) | $78.8B (2024-12-31) | ↑ 10.2% |
| Receivables (current) | $67.7B (2025-12-31) | $55.5B (2024-12-31) | ↑ 22.1% |
| Inventory | $38.3B (2025-12-31) | $34.2B (2024-12-31) | ↑ 12.0% |
| Deferred revenue (current) | $20.6B (2025-12-31) | $18.1B (2024-12-31) | ↑ 13.7% |
| Goodwill | $23.3B (2025-12-31) | $23.1B (2024-12-31) | ↑ 0.9% |
| Long-term debt | $65.6B (2025-12-31) | $52.6B (2024-12-31) | ↑ 24.8% |
| Diluted shares (wtd avg) | 10.8B (2025-12-31) | 10.7B (2024-12-31) | ↑ 1.0% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 11.2% | 10.8% |
| Free cash flow (OCF − capex) | $7.7B | $32.9B |
| OCF / net income | 179.6% | 195.6% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
