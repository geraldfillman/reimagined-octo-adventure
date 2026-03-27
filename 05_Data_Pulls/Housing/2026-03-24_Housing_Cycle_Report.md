---
title: "Housing Cycle Report — 2026-03-24"
source: "Playbook: Housing Cycle"
date_pulled: "2026-03-24"
domain: "housing"
data_type: "synthesis"
frequency: "on-demand"
regime: "Stable / Expansion"
regime_confidence: "Medium"
signal_status: "clear"
signals: []
tags: ["playbook", "housing", "synthesis", "regime-assessment"]
related_pulls: ["2026-03-24_FRED_Housing.md", "2026-03-24_FRED_Interest_Rates.md", "2026-03-24_FRED_Labor_Market.md", "2026-03-24_News_housing.md"]
---

## Housing Regime Assessment: Stable / Expansion

**Confidence**: Medium
**Overall Signal Status**: ⚪ Clear

No warning signals detected. Housing indicators within normal ranges.

**Key Drivers:**
- Housing starts within normal range
- Mortgage rates stable month-over-month
- No yield curve stress
- Labor market holding

**Implication:**
Maintain current housing allocation. Continue monitoring for emerging signals.

## Pull Status

| Source | Status | Detail |
| --- | --- | --- |
| housing | ✅ Success | 2026-03-24_FRED_Housing.md |
| rates | ✅ Success | 2026-03-24_FRED_Interest_Rates.md |
| labor | ✅ Success | 2026-03-24_FRED_Labor_Market.md |
| fema | ✅ Success | OK |
| news | ✅ Success | 2026-03-24_News_housing.md |

## Action Matrix

| Condition | Action |
|-----------|--------|
| Starts down + Rates up | Underweight builders, avoid rate-sensitive REITs |
| Starts down + Rates down | Watch for recovery — rates cutting into weakness |
| Prices falling + Inventory rising | Buyer's market forming — watch for entry |
| FEMA spike in growth markets | Overweight insurers, avoid regional banks |
| Unemployment spike + Starts flat | Demand destruction — reduce housing exposure |

## Next Steps

- Review [[Signal Board]] for any new alerts
- Check [[Macro Regime]] for rate environment context
- Run again in 2-4 weeks: `node run.mjs playbook housing-cycle`
- For deeper analysis, run: `node run.mjs fred --group credit`

## Source

- **Playbook**: Housing Cycle
- **Pulls**: 5 sources
- **Signals**: 0 fired
- **Generated**: 2026-03-24
