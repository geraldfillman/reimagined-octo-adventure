---
title: "EDGAR Financial Skeleton — XOM"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "XOM"
cik: "0000034088"
company: "Exxon Mobil Corporation"
tags: ["edgar", "company-intel", "xom"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $332.2B (2025-12-31) | $349.6B (2024-12-31) | ↓ -5.0% |
| Gross profit | — | — |  |
| Operating income | — | — |  |
| Net income | $28.8B (2025-12-31) | $33.7B (2024-12-31) | ↓ -14.4% |
| Operating cash flow | $52.0B (2025-12-31) | $55.0B (2024-12-31) | ↓ -5.5% |
| Capital expenditure | $28.4B (2025-12-31) | $24.3B (2024-12-31) | ↑ 16.7% |
| Research & development | $1.2B (2025-12-31) | $1.0B (2024-12-31) | ↑ 20.0% |
| Stock-based compensation | — | — |  |
| Cash & equivalents | $10.7B (2025-12-31) | $23.0B (2024-12-31) | ↓ -53.6% |
| Receivables (current) | $35.7B (2025-12-31) | $35.3B (2024-12-31) | ↑ 1.3% |
| Inventory | $15.0B (2011-12-31) | $13.0B (2010-12-31) | ↑ 15.8% |
| Deferred revenue (current) | — | — |  |
| Goodwill | — | — |  |
| Long-term debt | $23.1B (2017-12-31) | $27.7B (2016-12-31) | ↓ -16.6% |
| Diluted shares (wtd avg) | 4.4B (2013-12-31) | 4.6B (2012-12-31) | ↓ -4.5% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | — | — |
| Free cash flow (OCF − capex) | $23.6B | $30.7B |
| OCF / net income | 180.2% | 163.4% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
