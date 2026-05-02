---
title: Full Picture Reports
type: dashboard
tags: [dashboard, theses, synthesis, report]
last_updated: 2026-04-02
---
# Full Picture Reports

Summary:
- Generated synthesis layer that combines thesis framing, tape, fundamentals, macro pulse, and catalyst timing.
- Run `node run.mjs thesis-full-picture` after thesis market refreshes when you want one clean operator note per thesis instead of bouncing between dashboards.
- Open [[Capital Allocation Board]] for ranking, [[High Priority Thesis Monitor]] for review cadence, and use this board for the deep-dive handoff.

## Latest Reports

```dataview
TABLE WITHOUT ID
  thesis AS "Thesis",
  structural_view AS "Structural",
  tactical_view AS "Tactical",
  technical_status AS "Tech",
  fundamentals_status AS "Fundamentals",
  macro_signal_status AS "Macro",
  next_earnings_date AS "Next Earnings",
  coverage_gap_count AS "Gaps",
  file.link AS "Report"
FROM "05_Data_Pulls/Theses"
WHERE data_type = "full_picture_report"
SORT date_pulled DESC, thesis_name ASC, file.name ASC
```

## Coverage Gaps

```dataview
TABLE WITHOUT ID
  thesis AS "Thesis",
  fundamentals_status AS "Fundamentals",
  macro_indicator_match_count AS "Macro Hits",
  coverage_gap_count AS "Gaps",
  file.link AS "Report"
FROM "05_Data_Pulls/Theses"
WHERE data_type = "full_picture_report"
  AND coverage_gap_count > 0
SORT date_pulled DESC, coverage_gap_count DESC, thesis_name ASC
```

## Operating Notes

1. Refresh `fmp --thesis-watchlists`, `thesis-fmp-sync`, and `thesis-catalysts` before trusting the tactical layer.
2. Use `structural_view` to decide whether the thesis still deserves attention at all.
3. Use `tactical_view` to decide whether size changes should happen now or wait for confirmation.
4. Treat `coverage_gap_count` as a confidence discount, not just a data hygiene issue.
