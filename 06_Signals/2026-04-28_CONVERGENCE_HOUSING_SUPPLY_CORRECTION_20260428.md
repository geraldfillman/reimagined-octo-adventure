---
signal_id: "CONVERGENCE_HOUSING_SUPPLY_CORRECTION_20260428"
signal_name: "Cross-Domain Convergence — [[Housing Supply Correction]]"
severity: "critical"
signal_state: "new"
date: "2026-04-28"
thesis: "[[[[Housing Supply Correction]]]]"

domains_confirmed: ["Housing", "Market"]
domain_count: 2
source_pull: "Housing/2026-04-23_NAHB_Builder_Confidence.md, Housing/2026-04-24_NAHB_Builder_Confidence.md, Housing/2026-04-28_NAHB_Builder_Confidence.md, Market/2026-04-23_Catalyst_DHI.md, Market/2026-04-23_Catalyst_LEN.md"
direction: "confirm"
suggested_action: "review"
tags: ["signal", "convergence", "cross-domain", "housing_supply_correction"]
---
## Cross-Domain Convergence — [[Housing Supply Correction]]

**Domains:** Housing, Market
**Domain count:** 2 independent sources
**Date:** 2026-04-28

## Evidence

- **Housing** flagged `[[Housing Supply Correction]]` at alert or critical severity
- **Market** flagged `[[Housing Supply Correction]]` at alert or critical severity

## Why This Matters

2 independent agent domains have flagged the same thesis within 7 days. Cross-domain convergence is a strong confirming signal — each domain uses different data sources, reducing the probability this is noise.

## Suggested Action

Review the source pull notes listed below and consider escalating conviction or allocation if the evidence is consistent. Run `node run.mjs pull signal-review` to check current signal lifecycle state.

## Source Pulls

- `Housing/2026-04-23_NAHB_Builder_Confidence.md`
- `Housing/2026-04-24_NAHB_Builder_Confidence.md`
- `Housing/2026-04-28_NAHB_Builder_Confidence.md`
- `Market/2026-04-23_Catalyst_DHI.md`
- `Market/2026-04-23_Catalyst_LEN.md`
- `Market/2026-04-23_Catalyst_NVR.md`
- `Market/2026-04-24_Catalyst_DHI.md`
- `Market/2026-04-24_Catalyst_LEN.md`
- `Market/2026-04-24_Catalyst_NVR.md`
- `Market/2026-04-25_Catalyst_DHI.md`
