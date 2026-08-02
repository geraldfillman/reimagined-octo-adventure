---
title: "EDGAR Financial Skeleton — BAC"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-02"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "bank"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "BAC"
cik: "0000070858"
company: "BofA Finance LLC"
tags: ["edgar", "company-intel", "bac"]
---

## Financial Skeleton — Bank / lender profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Total net revenue | $113.1B (2025-12-31) | $105.9B (2024-12-31) | ↑ 6.8% |
| Net interest income | $60.1B (2025-12-31) | $56.1B (2024-12-31) | ↑ 7.2% |
| Noninterest income | $53.0B (2025-12-31) | $49.8B (2024-12-31) | ↑ 6.4% |
| Provision for credit losses | $3.6B (2019-12-31) | $3.3B (2018-12-31) | ↑ 9.4% |
| Noninterest expense | $69.7B (2025-12-31) | $66.8B (2024-12-31) | ↑ 4.4% |
| Net income | $30.5B (2025-12-31) | $27.0B (2024-12-31) | ↑ 13.1% |
| Loans (net of allowance) | $1172.5B (2025-12-31) | $1082.6B (2024-12-31) | ↑ 8.3% |
| Deposits | $2018.7B (2025-12-31) | $1965.5B (2024-12-31) | ↑ 2.7% |
| Total assets | $3411.7B (2025-12-31) | $3261.3B (2024-12-31) | ↑ 4.6% |
| Stockholders' equity | $303.2B (2025-12-31) | $294.0B (2024-12-31) | ↑ 3.2% |
| Stock-based compensation | $4.0B (2025-12-31) | $3.4B (2024-12-31) | ↑ 16.5% |
| Diluted shares (wtd avg) | 7.7B (2025-12-31) | 7.9B (2024-12-31) | ↓ -3.2% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| Efficiency ratio (noninterest expense / revenue) | 61.7% | 63.1% |
| Return on equity (NI / period-end equity) | 10.1% | 9.2% |
| Provision / net loans | — | — |
| Loans / deposits | 58.1% | 55.1% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
