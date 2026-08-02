---
title: "EDGAR Financial Skeleton — META"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "META"
cik: "0001326801"
company: "Meta Platforms, Inc."
tags: ["edgar", "company-intel", "meta"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $201.0B (2025-12-31) | $164.5B (2024-12-31) | ↑ 22.2% |
| Gross profit | — | — |  |
| Operating income | $83.3B (2025-12-31) | $69.4B (2024-12-31) | ↑ 20.0% |
| Net income | $60.5B (2025-12-31) | $62.4B (2024-12-31) | ↓ -3.1% |
| Operating cash flow | $115.8B (2025-12-31) | $91.3B (2024-12-31) | ↑ 26.8% |
| Capital expenditure | $69.7B (2025-12-31) | $37.3B (2024-12-31) | ↑ 87.1% |
| Research & development | $57.4B (2025-12-31) | $43.9B (2024-12-31) | ↑ 30.8% |
| Stock-based compensation | $20.4B (2025-12-31) | $16.7B (2024-12-31) | ↑ 22.4% |
| Cash & equivalents | $35.9B (2025-12-31) | $43.9B (2024-12-31) | ↓ -18.3% |
| Receivables (current) | $19.8B (2025-12-31) | $17.0B (2024-12-31) | ↑ 16.3% |
| Inventory | — | — |  |
| Deferred revenue (current) | $721.0M (2024-12-31) | $626.0M (2023-12-31) | ↑ 15.2% |
| Goodwill | $24.5B (2025-12-31) | $20.7B (2024-12-31) | ↑ 18.8% |
| Long-term debt | $58.7B (2025-12-31) | $28.8B (2024-12-31) | ↑ 103.8% |
| Diluted shares (wtd avg) | 2.6B (2025-12-31) | 2.6B (2024-12-31) | ↓ -1.5% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 41.4% | 42.2% |
| Free cash flow (OCF − capex) | $46.1B | $54.1B |
| OCF / net income | 191.5% | 146.5% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
