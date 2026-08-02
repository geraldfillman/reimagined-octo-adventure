---
title: "EDGAR Financial Skeleton — JPM"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "JPM"
cik: "0000019617"
company: "JPMORGAN CHASE & CO"
tags: ["edgar", "company-intel", "jpm"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $182.4B (2025-12-31) | $177.6B (2024-12-31) | ↑ 2.8% |
| Gross profit | — | — |  |
| Operating income | — | — |  |
| Net income | $57.0B (2025-12-31) | $58.5B (2024-12-31) | ↓ -2.4% |
| Operating cash flow | $-147.8B (2025-12-31) | $-42.0B (2024-12-31) | ↓ -251.8% |
| Capital expenditure | — | — |  |
| Research & development | — | — |  |
| Stock-based compensation | $3.6B (2025-12-31) | $3.5B (2024-12-31) | ↑ 3.1% |
| Cash & equivalents | $278.8B (2018-12-31) | $431.3B (2017-12-31) | ↓ -35.4% |
| Receivables (current) | — | — |  |
| Inventory | — | — |  |
| Deferred revenue (current) | — | — |  |
| Goodwill | $52.7B (2025-12-31) | $52.6B (2024-12-31) | ↑ 0.3% |
| Long-term debt | $267.9B (2013-12-31) | $249.0B (2012-12-31) | ↑ 7.6% |
| Diluted shares (wtd avg) | 2.8B (2025-12-31) | 2.9B (2024-12-31) | ↓ -3.4% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | — | — |
| OCF / net income | -259.0% | -71.9% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
