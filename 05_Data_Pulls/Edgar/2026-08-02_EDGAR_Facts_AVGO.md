---
title: "EDGAR Financial Skeleton — AVGO"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "AVGO"
cik: "0001730168"
company: "Broadcom Inc."
tags: ["edgar", "company-intel", "avgo"]
---

## Financial Skeleton — General profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $63.9B (2025-11-02) | $51.6B (2024-11-03) | ↑ 23.9% |
| Gross profit | $43.3B (2025-11-02) | $32.5B (2024-11-03) | ↑ 33.2% |
| Operating income | $25.5B (2025-11-02) | $13.5B (2024-11-03) | ↑ 89.3% |
| Net income | $5.9B (2024-11-03) | $14.1B (2023-10-29) | ↓ -58.1% |
| Operating cash flow | $27.5B (2025-11-02) | $20.0B (2024-11-03) | ↑ 37.9% |
| Capital expenditure | $623.0M (2025-11-02) | $548.0M (2024-11-03) | ↑ 13.7% |
| Research & development | $11.0B (2025-11-02) | $9.3B (2024-11-03) | ↑ 17.9% |
| Stock-based compensation | $7.6B (2025-11-02) | $5.7B (2024-11-03) | ↑ 31.8% |
| Cash & equivalents | $16.2B (2025-11-02) | $9.3B (2024-11-03) | ↑ 73.1% |
| Receivables (current) | $7.1B (2025-11-02) | $4.4B (2024-11-03) | ↑ 61.8% |
| Inventory | $2.3B (2025-11-02) | $1.8B (2024-11-03) | ↑ 29.0% |
| Deferred revenue (current) | $9.5B (2025-11-02) | $9.4B (2024-11-03) | ↑ 0.8% |
| Goodwill | $97.8B (2025-11-02) | $97.9B (2024-11-03) | ↓ -0.1% |
| Long-term debt | $39.4B (2021-10-31) | $40.2B (2020-11-01) | ↓ -2.0% |
| Diluted shares (wtd avg) | 4.9B (2025-11-02) | 4.8B (2024-11-03) | ↑ 1.6% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | 67.8% | 63.0% |
| Operating margin | 39.9% | 26.1% |
| Free cash flow (OCF − capex) | $26.9B | $19.4B |
| OCF / net income | — | — |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
