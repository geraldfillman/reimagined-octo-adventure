---
title: "EDGAR Financial Skeleton — PLD"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "PLD"
cik: "0001045609"
company: "Prologis, Inc."
tags: ["edgar", "company-intel", "pld"]
---

## Financial Skeleton (last two fiscal years, XBRL 10-K facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $8.8B (2025-12-31) | $8.2B (2024-12-31) | ↑ 7.2% |
| Gross profit | — | — |  |
| Operating income | $4.4B (2025-12-31) | $4.4B (2024-12-31) | ↓ -1.3% |
| Net income | $3.3B (2025-12-31) | $3.7B (2024-12-31) | ↓ -10.8% |
| Operating cash flow | $5.0B (2025-12-31) | $4.9B (2024-12-31) | ↑ 2.0% |
| Capital expenditure | — | — |  |
| Research & development | — | — |  |
| Stock-based compensation | $185.5M (2025-12-31) | $231.7M (2024-12-31) | ↓ -20.0% |
| Cash & equivalents | $1.1B (2025-12-31) | $1.3B (2024-12-31) | ↓ -13.1% |
| Receivables (current) | — | — |  |
| Inventory | — | — |  |
| Deferred revenue (current) | — | — |  |
| Goodwill | — | — |  |
| Long-term debt | $35.0B (2025-12-31) | $30.9B (2024-12-31) | ↑ 13.5% |
| Diluted shares (wtd avg) | 956.8M (2025-12-31) | 953.6M (2024-12-31) | ↑ 0.3% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 49.6% | 53.8% |
| OCF / net income | 150.5% | 131.6% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
