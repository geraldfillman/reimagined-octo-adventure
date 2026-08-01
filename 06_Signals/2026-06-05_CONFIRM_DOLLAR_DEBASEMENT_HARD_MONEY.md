---
signal_id: "CONFIRM_DOLLAR_DEBASEMENT_HARD_MONEY"
signal_name: "Confirm - Dollar Debasement & Hard Money"
severity: "alert"
date: "2026-06-05"
sector: "Utilities Sector Basket"
thesis: "[[Dollar Debasement Hard Money]]"
score: 4
direction: "confirm"
matched_terms: ["gold"]
suggested_action: "compound"
tags: ["signal", "sector-scan", "confirm", "dollar-debasement-hard-money"]
---
## Confirm - Dollar Debasement & Hard Money

**Sector:** Utilities Sector Basket  
**Score:** 4  
**Direction:** confirm

## Evidence

- `gold`

## Suggested Action

Sector data supports this thesis. Consider increasing conviction or allocation priority if a second independent source confirms it.

## How to Apply

Run `powershell scripts/update-thesis-scorecards.ps1 -ApplySignals -DryRun` or edit `10_Theses/Dollar Debasement Hard Money.md` directly.
