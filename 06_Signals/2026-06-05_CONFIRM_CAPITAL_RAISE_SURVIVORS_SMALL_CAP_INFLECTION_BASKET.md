---
signal_id: "CONFIRM_CAPITAL_RAISE_SURVIVORS_SMALL_CAP_INFLECTION_BASKET"
signal_name: "Confirm - Capital Raise Survivors / Small-Cap Inflection Basket"
severity: "alert"
date: "2026-06-05"
sector: "Real Estate Sector Basket"
thesis: "[[Capital Raise Survivors Small-Cap Inflection Basket]]"
score: 4
direction: "confirm"
matched_terms: ["iipr", "caps"]
suggested_action: "compound"
tags: ["signal", "sector-scan", "confirm", "capital-raise-survivors-small-cap-inflection-basket"]
---
## Confirm - Capital Raise Survivors / Small-Cap Inflection Basket

**Sector:** Real Estate Sector Basket  
**Score:** 4  
**Direction:** confirm

## Evidence

- `iipr`
- `caps`

## Suggested Action

Sector data supports this thesis. Consider increasing conviction or allocation priority if a second independent source confirms it.

## How to Apply

Run `powershell scripts/update-thesis-scorecards.ps1 -ApplySignals -DryRun` or edit `10_Theses/Capital Raise Survivors Small-Cap Inflection Basket.md` directly.
