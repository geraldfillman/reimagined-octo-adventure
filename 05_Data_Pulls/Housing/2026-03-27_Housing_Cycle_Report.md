---
title: "Housing Cycle Report — 2026-03-27"
source: "Playbook: Housing Cycle"
date_pulled: "2026-03-27"
domain: "housing"
data_type: "synthesis"
frequency: "on-demand"
regime: "Late Cycle / Peak Risk"
regime_confidence: "Medium"
signal_status: "alert"
signals:
  -
    id: "YIELD_CURVE_FLATTENING"
    severity: "watch"
    message: "Yield curve flattening: 10Y-2Y spread at 0.49%"
  -
    id: "FEMA_SPIKE"
    severity: "alert"
    message: "25 FEMA disaster declarations in past 60 days"
tags: ["playbook", "housing", "synthesis", "regime-assessment"]
related_pulls: ["2026-03-27_FRED_Housing.md", "2026-03-27_FRED_Interest_Rates.md", "2026-03-27_FRED_Labor_Market.md", "2026-03-27_FEMA_Declarations.md", "2026-03-27_News_housing.md"]
signal_state: new
---

## Housing Regime Assessment: Late Cycle / Peak Risk

**Confidence**: Medium
**Overall Signal Status**: ALERT

Macro signals suggest late cycle — housing may be approaching a peak.

**Key Drivers:**
- Yield curve flattening

**Implication:**
Housing still expanding but macro headwinds building. Begin reviewing defensive positions.

## Active Signals

|  | Signal | Domain | Message |
| --- | --- | --- | --- |
| 🟡 | Yield Curve Flattening | macro | Yield curve flattening: 10Y-2Y spread at 0.49% |
| 🟠 | FEMA Declaration Spike | cross-domain | 25 FEMA disaster declarations in past 60 days |

## Signal Details

### 🟡 Yield Curve Flattening (WATCH)

Yield curve flattening: 10Y-2Y spread at 0.49%

**Implications:**
- Late-cycle dynamics forming
- Begin reviewing defensive positions
- Watch for further compression toward inversion

### 🟠 FEMA Declaration Spike (ALERT)

25 FEMA disaster declarations in past 60 days

**Implications:**
- Regional housing risk elevated
- Insurance costs likely rising in affected areas
- Check affected metro housing data for price impact
- Construction demand may spike in recovery phase


## Pull Status

| Source | Status | Detail |
| --- | --- | --- |
| housing | ✅ Success | 2026-03-27_FRED_Housing.md |
| rates | ✅ Success | 2026-03-27_FRED_Interest_Rates.md |
| labor | ✅ Success | 2026-03-27_FRED_Labor_Market.md |
| fema | ✅ Success | 2026-03-27_FEMA_Declarations.md |
| news | ✅ Success | 2026-03-27_News_housing.md |

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
- **Signals**: 2 fired
- **Generated**: 2026-03-27
