---
tags: [playbook, housing]
playbook_id: housing-cycle
run_command: "node scripts/run.mjs playbook housing-cycle"
data_sources:
  - "[[FRED Housing Series]]"
  - "[[FRED API]]"
  - "[[Census Bureau Housing Data]]"
  - "[[OpenFEMA API]]"
  - "[[FHFA House Price Index]]"
signals_monitored:
  - HOUSING_STARTS_DROP
  - MORTGAGE_RATE_SPIKE
  - CASE_SHILLER_DECLINING
  - INVENTORY_SURGE
  - FEMA_SPIKE
  - UNEMPLOYMENT_SPIKE
  - YIELD_CURVE_INVERSION
---

# Housing Cycle Playbook

## Investment Question

Is the housing market expanding, stable, cooling, or contracting?

## Data Pull Sequence

1. **FRED Housing Group**: Starts, permits, Case-Shiller, mortgage rates
2. **FRED Rates Group**: Fed funds, 2Y, 10Y, 30Y, curve spread
3. **FRED Labor Group**: Unemployment, payrolls, initial claims
4. **OpenFEMA**: Recent disaster declarations (regional risk overlay)
5. **News**: Business headlines for sentiment context

## Regime Classification

| Regime | Indicators | Typical Duration |
|--------|-----------|-----------------|
| **Expansion** | Starts rising, prices rising, rates low/stable | 3-5 years |
| **Peak** | Starts flattening, prices high, rates rising | 6-12 months |
| **Cooling** | Starts declining, prices flat, rates high | 12-18 months |
| **Contraction** | Starts collapsing, prices falling, inventory surging | 12-24 months |
| **Recovery** | Starts bottoming, prices stabilizing, rates declining | 6-12 months |

## Cross-Domain Checks

- If macro regime is "late cycle" → housing likely peaking
- If FEMA declarations concentrated in growth markets → regional repricing
- If unemployment rising → housing demand drop follows 3-6 months
- If yield curve inverted → recession risk → housing demand at risk 12-18 months

## Action Matrix

| Signal Combination | Action |
|-------------------|--------|
| Starts down + Rates up | Underweight builders, avoid rate-sensitive REITs |
| Starts down + Rates down | Watch for recovery — rates cutting into weakness |
| Prices falling + Inventory rising | Buyer's market forming — watch for entry points |
| FEMA spike + Sun Belt metros | Overweight insurers, avoid affected regional banks |
| Unemployment spike + Starts flat | Demand destruction coming — reduce housing exposure |
| Curve inverted + Starts still rising | Late cycle euphoria — prepare for reversal |

## Related Dashboards

- [[Signal Board]] — check for active housing/macro signals
- [[Macro Regime]] — rate environment and labor context
- [[Cross-Domain Thesis Board]] — housing + macro convergence view
- [[Housing Intelligence]] — source catalog and data availability
