---
title: "EDGAR Financial Skeleton — RKLB"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "general"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "RKLB"
cik: "0001819994"
company: "Rocket Lab Corp"
tags: ["edgar", "company-intel", "rklb"]
---

## Financial Skeleton — General profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $601.8M (2025-12-31) | $436.2M (2024-12-31) | ↑ 38.0% |
| Gross profit | $207.2M (2025-12-31) | $116.1M (2024-12-31) | ↑ 78.4% |
| Operating income | $-228.8M (2025-12-31) | $-189.8M (2024-12-31) | ↓ -20.6% |
| Net income | $-198.2M (2025-12-31) | $-190.2M (2024-12-31) | ↓ -4.2% |
| Operating cash flow | $-165.5M (2025-12-31) | $-48.9M (2024-12-31) | ↓ -238.6% |
| Capital expenditure | $156.3M (2025-12-31) | $67.1M (2024-12-31) | ↑ 132.9% |
| Research & development | $270.7M (2025-12-31) | $174.4M (2024-12-31) | ↑ 55.2% |
| Stock-based compensation | $71.1M (2025-12-31) | $56.8M (2024-12-31) | ↑ 25.1% |
| Cash & equivalents | $828.7M (2025-12-31) | $271.0M (2024-12-31) | ↑ 205.7% |
| Receivables (current) | $39.0M (2025-12-31) | $36.4M (2024-12-31) | ↑ 7.0% |
| Inventory | $158.4M (2025-12-31) | $119.1M (2024-12-31) | ↑ 33.0% |
| Deferred revenue (current) | $195.4M (2025-12-31) | $216.2M (2024-12-31) | ↓ -9.6% |
| Goodwill | $205.8M (2025-12-31) | $71.0M (2024-12-31) | ↑ 189.7% |
| Long-term debt | $1.7M (2025-12-31) | $44.0M (2024-12-31) | ↓ -96.1% |
| Diluted shares (wtd avg) | 530.7M (2025-12-31) | 495.9M (2024-12-31) | ↑ 7.0% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Gross margin | 34.4% | 26.6% |
| Operating margin | -38.0% | -43.5% |
| Free cash flow (OCF − capex) | $-321.8M | $-116.0M |
| OCF / net income | 83.5% | 25.7% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
