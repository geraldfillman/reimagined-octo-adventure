---
node_type: "thesis"
name: ""
status: "Active"
conviction: ""
timeframe: ""
core_entities: []
supporting_regimes: []
key_indicators: []
bullish_drivers: []
bearish_drivers: []
invalidation_triggers: []
tags: [thesis]
---

## Thesis Statement
One-paragraph summary of the trade idea.

## Core Logic
Why this thesis should work.

## Key Entities
| Entity | Role | Link |
|--------|------|------|
| | | |

## Supporting Macro
- **Regime**: [[]]
- **Key Indicators**:

## Invalidation Criteria
What would prove this thesis wrong?
-

## Position Sizing & Risk
-

## Signals to Watch
```dataview
TABLE signal_id, severity, date
FROM "06_Signals"
WHERE any(this.core_entities, (e) => contains(string(tags), e))
SORT date DESC
LIMIT 5
```
