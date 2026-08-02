---
node_type: "intel_finding"
date: "2026-08-01"
company: "Palantir Technologies Inc."
ticker: "PLTR"
classification: "unresolved"
machine_effect: "financing"
thesis_impact: "no-change"
evidence_filing: "FY2025 10-K XBRL: CashAndCashEquivalents $1.4B vs $2.1B prior, while OCF-capex ≈ $2.1B"
source_link: "https://www.sec.gov/Archives/edgar/data/1321655/000132165526000011/pltr-20251231.htm"
related_theses: []
tags: [intel-finding]
---

# Finding: PLTR cash & equivalents fell 32% in a $2.1B FCF year

## Finding

Cash & equivalents declined **-32.2%** ($2.1B → $1.4B) in FY2025 while the company generated roughly **$2.1B** of free cash flow — about $2.8B of cash movement to explain.

## Evidence

XBRL companyfacts, FY2025 vs FY2024 ([[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_PLTR]]). Note: the skeleton tracks the cash-and-equivalents tag only; short-term investments are outside the pulled concept set — this is likely the whole story, but it is not yet evidenced.

## Possible Benign Explanation

Treasury management: cash swept into short-term US Treasuries / marketable securities (Palantir has historically parked most liquidity there), plus buyback execution. Total liquidity likely grew; the *mix* moved out of the cash line.

## Possible Negative Explanation

Aggressive buybacks or an unannounced large cash use (acquisition escrow, prepayments) consuming liquidity faster than reported profitability suggests. Low prior probability given zero debt and no acquisition 8-Ks in the window, but unverified.

## Effect on the Company Machine

Financing/distribution layer only — no operating implication if the benign case holds.

## Next Evidence Needed

1. FY2025 10-K balance sheet: marketable-securities line — does cash + investments total exceed prior year?
2. FY2025 cash-flow statement financing section: buyback dollars vs. the 2023 authorization
3. Investing section: any purchases of securities line confirming the sweep

## Thesis Impact

`no-change` expected — logged because the framework requires every unusually large balance-sheet move to have a located explanation before it is dismissed (§6.5 footnote test). Resolve on 10-K read; escalate only if cash + investments *combined* declined.
