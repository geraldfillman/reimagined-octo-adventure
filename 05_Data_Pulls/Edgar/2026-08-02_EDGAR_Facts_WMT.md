---
title: "EDGAR Financial Skeleton — WMT"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "WMT"
cik: "0000104169"
company: "WALMART INC."
tags: ["edgar", "company-intel", "wmt"]
---

## Financial Skeleton — General profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $706.4B (2026-01-31) | $674.5B (2025-01-31) | ↑ 4.7% |
| Gross profit | — | — |  |
| Operating income | $29.8B (2026-01-31) | $29.3B (2025-01-31) | ↑ 1.6% |
| Net income | $21.9B (2026-01-31) | $19.4B (2025-01-31) | ↑ 12.6% |
| Operating cash flow | $41.6B (2026-01-31) | $36.4B (2025-01-31) | ↑ 14.1% |
| Capital expenditure | $26.6B (2026-01-31) | $23.8B (2025-01-31) | ↑ 12.0% |
| Research & development | — | — |  |
| Stock-based compensation | — | — |  |
| Cash & equivalents | $10.7B (2026-01-31) | $9.0B (2025-01-31) | ↑ 18.7% |
| Receivables (current) | — | — |  |
| Inventory | $58.9B (2026-01-31) | $56.4B (2025-01-31) | ↑ 4.3% |
| Deferred revenue (current) | — | — |  |
| Goodwill | $28.7B (2026-01-31) | $28.8B (2025-01-31) | ↓ -0.2% |
| Long-term debt | $34.6B (2026-01-31) | $33.4B (2025-01-31) | ↑ 3.7% |
| Diluted shares (wtd avg) | 8.0B (2026-01-31) | 8.1B (2025-01-31) | ↓ -0.7% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | — | — |
| Operating margin | 4.2% | 4.4% |
| Free cash flow (OCF − capex) | $14.9B | $12.7B |
| OCF / net income | 189.9% | 187.5% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
