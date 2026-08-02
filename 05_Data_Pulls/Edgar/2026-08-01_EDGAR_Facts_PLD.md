---
title: "EDGAR Financial Skeleton — PLD"
source: "SEC EDGAR XBRL company facts (data.sec.gov)"
date_pulled: "2026-08-01"
domain: "edgar"
data_type: "financial_skeleton"
skeleton_profile: "reit"
frequency: "on-demand"
signal_status: "clear"
signals: []
symbol: "PLD"
cik: "0001045609"
company: "Prologis, Inc."
tags: ["edgar", "company-intel", "pld"]
---

## Financial Skeleton — REIT / real estate profile (last two fiscal years, XBRL annual facts)

| Metric | Current FY | Prior FY | Δ |
| --- | --- | --- | --- |
| Revenue | $8.8B (2025-12-31) | $8.2B (2024-12-31) | ↑ 7.2% |
| Operating income | $4.4B (2025-12-31) | $4.4B (2024-12-31) | ↓ -1.3% |
| Net income | $3.3B (2025-12-31) | $3.7B (2024-12-31) | ↓ -10.8% |
| Depreciation & amortization | $2.6B (2025-12-31) | $2.6B (2024-12-31) | ↑ 1.8% |
| Interest expense | $1.0B (2025-12-31) | $863.9M (2024-12-31) | ↑ 16.0% |
| Operating cash flow | $5.0B (2025-12-31) | $4.9B (2024-12-31) | ↑ 2.0% |
| Development spend | $2.8B (2025-12-31) | $3.2B (2024-12-31) | ↓ -13.3% |
| Property acquisitions | $1.8B (2025-12-31) | $2.3B (2024-12-31) | ↓ -22.6% |
| Disposition proceeds | $2.2B (2025-12-31) | $3.8B (2024-12-31) | ↓ -40.7% |
| Real estate (net) | $80.4B (2025-12-31) | $78.5B (2024-12-31) | ↑ 2.4% |
| Total assets | $98.7B (2025-12-31) | $95.3B (2024-12-31) | ↑ 3.6% |
| Long-term debt | $35.0B (2025-12-31) | $30.9B (2024-12-31) | ↑ 13.5% |
| Cash & equivalents | $1.1B (2025-12-31) | $1.3B (2024-12-31) | ↓ -13.1% |
| Stock-based compensation | $185.5M (2025-12-31) | $231.7M (2024-12-31) | ↓ -20.0% |
| Diluted shares (wtd avg) | 956.8M (2025-12-31) | 953.6M (2024-12-31) | ↑ 0.3% |

## Derived

| Metric | Current FY | Prior FY |
| --- | --- | --- |
| FFO proxy (NI + D&A; sale gains not adjusted — check 10-K) | $6.0B | $6.3B |
| Long-term debt / total assets | 35.5% | 32.4% |
| OCF / net income | 150.5% | 131.6% |

## Reconciliation Prompts (framework §7 pass 3)

- Does operating cash flow track net income? If not, which working-capital line absorbs the gap?
- Are receivables or inventory growing faster than revenue?
- Is free cash flow after capex enough to fund buybacks, dividends, and debt service without new financing?
- Is SBC materially diluting shareholders despite buybacks (check diluted share trend)?
- Blank rows are explicit gaps — the company may use non-standard XBRL tags; check the filing directly before concluding.
