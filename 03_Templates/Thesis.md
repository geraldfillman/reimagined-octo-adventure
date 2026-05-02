---
node_type: "thesis"
name: ""
status: "Active"
conviction: ""
timeframe: ""
allocation_priority: ""
allocation_rank: 0
why_now: ""
variant_perception: ""
next_catalyst: ""
disconfirming_evidence: ""
expected_upside: ""
expected_downside: ""
position_sizing: ""
required_sources: []
required_pull_families: []
monitor_status: ""
monitor_last_review: ""
monitor_change: ""
break_risk_status: ""
monitor_action: ""
suggested_conviction: ""
suggested_allocation_priority: ""
conviction_rolling_score_7d: 0
conviction_signal_count_7d: 0
conviction_last_signal_date: ""
emerging_pattern_sector: ""
emerging_pattern_first_seen: ""
emerging_pattern_last_seen: ""
emerging_pattern_streak_days: 0
core_entities: []
supporting_regimes: []
key_indicators: []
bullish_drivers: []
bearish_drivers: []
invalidation_triggers: []
reviewed_by: ""
review_date: ""
human_confidence: ""
agrees_with_machine: null
disagreement_notes: ""
next_review_date: ""
evidence_chain:
  - dashboard_card: ""
    thesis_field: ""
    signal_note: ""
    pull_note: ""
    original_source: ""
thesis_timeline:
  created: ""
  major_revisions: []
  conviction_history: []
  signal_milestones: []
  contradiction_milestones: []
  last_human_review: ""
  next_expected_review: ""
tags: [thesis]
---

## Summary
- One paragraph or 3 bullets covering the trade idea, timing, and edge.
- Put the highest-conviction claim first.

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

## Investment Scorecard
- **Allocation Priority**:
- **Why now**:
- **Variant perception**:
- **Next catalyst**:
- **Disconfirming evidence**:
- **Expected upside**:
- **Expected downside**:
- **Sizing rule**:

## Required Evidence
- **Source notes**:
- **Pull families**:

## Monitor Review
- **Last review**:
- **Change this week**:
- **Break risk status**:
- **Action**:

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
