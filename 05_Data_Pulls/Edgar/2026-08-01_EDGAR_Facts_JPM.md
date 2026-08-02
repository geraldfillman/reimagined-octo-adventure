---
title: "EDGAR Financial Skeleton — JPM"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "bank"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "JPM"
cik: "0000019617"
company: "JPMORGAN CHASE & CO"
tags: ["edgar", "company-intel", "jpm"]
---

## Financial Skeleton — Bank / lender profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Total net revenue | $182.4B (2025-12-31) | $177.6B (2024-12-31) | ↑ 2.8% |
| Net interest income | $95.4B (2025-12-31) | $92.6B (2024-12-31) | ↑ 3.1% |
| Noninterest income | $87.0B (2025-12-31) | $85.0B (2024-12-31) | ↑ 2.4% |
| Provision for credit losses | $14.2B (2025-12-31) | $10.7B (2024-12-31) | ↑ 33.1% |
| Noninterest expense | $95.6B (2025-12-31) | $91.8B (2024-12-31) | ↑ 4.2% |
| Net income | $57.0B (2025-12-31) | $58.5B (2024-12-31) | ↓ -2.4% |
| Loans (net of allowance) | $1467.7B (2025-12-31) | $1323.6B (2024-12-31) | ↑ 10.9% |
| Deposits | $2559.3B (2025-12-31) | $2406.0B (2024-12-31) | ↑ 6.4% |
| Total assets | $4424.9B (2025-12-31) | $4002.8B (2024-12-31) | ↑ 10.5% |
| Stockholders' equity | $362.4B (2025-12-31) | $344.8B (2024-12-31) | ↑ 5.1% |
| Stock-based compensation | $3.6B (2025-12-31) | $3.5B (2024-12-31) | ↑ 3.1% |
| Diluted shares (wtd avg) | 2.8B (2025-12-31) | 2.9B (2024-12-31) | ↓ -3.4% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Efficiency ratio (noninterest expense / revenue) | 52.4% | 51.7% |
| Return on equity (NI / period-end equity) | 15.7% | 17.0% |
| Provision / net loans | 1.0% | 0.8% |
| Loans / deposits | 57.3% | 55.0% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
