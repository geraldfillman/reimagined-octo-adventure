---
signal_id: "CONFIRM_ANTIMICROBIAL_RESISTANCE_PIPELINE"
signal_name: "Confirm - Antimicrobial Resistance Pipeline"
severity: "alert"
date: "2026-04-20"
sector: "Healthcare Sector Basket"
thesis: "[[Antimicrobial Resistance Pipeline]]"
score: 4
direction: "confirm"
matched_terms: ["jnj", "who"]
suggested_action: "compound"
tags: ["signal", "sector-scan", "confirm", "antimicrobial-resistance-pipeline"]
---
## Confirm - Antimicrobial Resistance Pipeline

**Sector:** Healthcare Sector Basket  
**Score:** 4  
**Direction:** confirm

## Evidence

- `jnj`
- `who`

## Suggested Action

Sector data supports this thesis. Consider increasing conviction or allocation priority if a second independent source confirms it.

## How to Apply

Run `powershell scripts/update-thesis-scorecards.ps1 -ApplySignals -DryRun` or edit `10_Theses/Antimicrobial Resistance Pipeline.md` directly.
