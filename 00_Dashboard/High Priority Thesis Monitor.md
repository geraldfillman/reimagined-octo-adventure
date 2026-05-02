---
title: High Priority Thesis Monitor
type: dashboard
tags: [dashboard, theses, monitoring]
last_updated: 2026-04-02
---
# High Priority Thesis Monitor

Summary:
- Weekly review surface for the highest-priority thesis names.
- Use this after fresh pulls or before changing size in the core thesis book.
- Open [[Technical Risk]], [[Earnings Calendar]], [[Catalyst Radar]], and [[Full Picture Reports]] for market-sensitive tape and synthesis checks.

## Core Monitor

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  conviction AS "Conviction",
  next_catalyst AS "Next Catalyst",
  monitor_status AS "Monitor",
  fmp_primary_technical_status AS "Technical",
  fmp_last_sync AS "FMP Sync",
  break_risk_status AS "Break Risk",
  monitor_last_review AS "Last Review"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses" AND allocation_priority = "high"
SORT allocation_rank ASC, conviction DESC, file.name ASC
```

## FMP Tape Check

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  fmp_primary_symbol AS "Symbol",
  fmp_primary_technical_status AS "Tech",
  fmp_primary_technical_bias AS "Bias",
  fmp_primary_rsi14 AS "RSI 14",
  fmp_primary_price_vs_sma200_pct AS "Vs 200D %",
  fmp_next_earnings_date AS "Next Earnings",
  fmp_technical_nonclear_count AS "Non-Clear",
  fmp_last_sync AS "FMP Sync"
FROM "10_Theses"
WHERE node_type = "thesis"
  AND file.folder = "10_Theses"
  AND allocation_priority = "high"
  AND fmp_primary_symbol != null
SORT allocation_rank ASC, file.name ASC
```

## Changes This Week

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  monitor_change AS "Change This Week",
  fmp_primary_technical_status AS "Technical",
  fmp_primary_technical_bias AS "Bias",
  break_risk_status AS "Break Risk",
  next_catalyst AS "Next Catalyst"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses"
  AND allocation_priority = "high"
  AND date(monitor_last_review) >= date(today) - dur(7 days)
SORT date(monitor_last_review) DESC, file.name ASC
```

## Tape Overlay

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  fmp_primary_technical_status AS "Technical",
  fmp_primary_technical_bias AS "Bias",
  fmp_primary_rsi14 AS "RSI",
  fmp_primary_price_vs_sma200_pct AS "Vs SMA200",
  fmp_next_earnings_date AS "Next Earnings",
  fmp_last_sync AS "Last Sync"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses" AND allocation_priority = "high"
SORT fmp_last_sync DESC, file.name ASC
```

## Break-Risk Watch

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  disconfirming_evidence AS "What Would Break It",
  break_risk_status AS "Risk Status",
  required_pull_families AS "Required Pulls"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses" AND allocation_priority = "high"
SORT break_risk_status DESC, file.name ASC
```

## Review Queue

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  monitor_last_review AS "Last Review",
  next_catalyst AS "Next Catalyst"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses"
  AND allocation_priority = "high"
  AND date(monitor_last_review) < date(today) - dur(7 days)
SORT date(monitor_last_review) ASC, file.name ASC
```

## Operating Rules

1. Review every `high` priority thesis after a material pull update or at least once per week.
2. Update `monitor_change` with what actually changed, not a restatement of the thesis.
3. Move `break_risk_status` from `not-seen` to `watch` or `printing` when incoming data starts matching the disconfirming line.
4. Tighten or reduce size before conviction language drifts behind the evidence.
5. Check [[Technical Risk]], [[Earnings Calendar]], and [[Catalyst Radar]] before a weekly review closes if a high-priority thesis has an active market catalyst.
6. Run `node run.mjs thesis-fmp-sync` after fresh FMP market pulls so this monitor reflects the latest tape and earnings timing.
7. Run `node run.mjs thesis-full-picture --thesis "<name>"` when a weekly review needs one consolidated read instead of multiple dashboards.
