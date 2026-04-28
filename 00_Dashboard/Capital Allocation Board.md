---
title: Capital Allocation Board
type: dashboard
tags: [dashboard, theses, allocation]
last_updated: 2026-04-02
---
# Capital Allocation Board

Summary:
- Allocation-first view of the thesis book across conviction, timing, sizing, and next catalyst.
- Use this board when comparing opportunity cost across active theses rather than reading them one by one.
- Open [[High Priority Thesis Monitor]] when you need the weekly change log and break-risk review for core positions.
- Open [[Technical Risk]], [[Earnings Calendar]], [[Catalyst Radar]], and [[Full Picture Reports]] before changing size in event-sensitive names.
- Use the `Conviction Momentum` and `Emerging Patterns` sections after running `conviction-delta` and `update-thesis-scorecards.ps1 -ApplySignals`.

## Core Allocation Board

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  allocation_priority AS "Priority",
  conviction AS "Conviction",
  timeframe AS "Timeframe",
  position_sizing AS "Sizing",
  next_catalyst AS "Next Catalyst"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses"
SORT allocation_rank ASC, conviction DESC, file.name ASC
```

## Core Positions

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  why_now AS "Why Now",
  variant_perception AS "Variant",
  expected_upside AS "Upside",
  expected_downside AS "Downside"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses" AND allocation_priority = "high"
SORT conviction DESC, file.name ASC
```

## FMP Tape & Catalysts

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  fmp_primary_symbol AS "Symbol",
  fmp_primary_technical_bias AS "Bias",
  fmp_primary_price_vs_sma200_pct AS "Vs 200D %",
  fmp_technical_nonclear_count AS "Non-Clear",
  fmp_next_earnings_date AS "Next Earnings",
  fmp_last_sync AS "FMP Sync"
FROM "10_Theses"
WHERE node_type = "thesis"
  AND file.folder = "10_Theses"
  AND fmp_primary_symbol != null
SORT allocation_rank ASC, conviction DESC, file.name ASC
```

## FMP Valuation Snapshot

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  fmp_primary_symbol AS "Symbol",
  fmp_primary_fundamentals_status AS "Coverage",
  fmp_primary_trailing_pe AS "P/E",
  fmp_primary_ev_to_sales AS "EV/Sales",
  fmp_primary_roe_pct AS "ROE %",
  fmp_primary_target_upside_pct AS "Target Upside %"
FROM "10_Theses"
WHERE node_type = "thesis"
  AND file.folder = "10_Theses"
  AND fmp_primary_symbol != null
SORT allocation_rank ASC, conviction DESC, file.name ASC
```

## Medium Priority Sleeves

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  conviction AS "Conviction",
  next_catalyst AS "Next Catalyst",
  required_sources AS "Required Sources"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses" AND allocation_priority = "medium"
SORT conviction DESC, file.name ASC
```

## Watchlist Optionality

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  timeframe AS "Timeframe",
  next_catalyst AS "Next Catalyst",
  disconfirming_evidence AS "What Would Break It"
FROM "10_Theses"
WHERE node_type = "thesis" AND file.folder = "10_Theses" AND allocation_priority = "watch"
SORT file.name ASC
```

## Conviction Momentum

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  conviction_rolling_score_7d AS "7d Score",
  conviction_signal_count_7d AS "Signals",
  conviction_last_signal_date AS "Last Signal",
  suggested_conviction AS "Suggested Conviction",
  suggested_allocation_priority AS "Suggested Priority"
FROM "10_Theses"
WHERE node_type = "thesis"
  AND file.folder = "10_Theses"
  AND (conviction_rolling_score_7d >= 3 OR conviction_rolling_score_7d <= -3)
SORT conviction_rolling_score_7d DESC, conviction_signal_count_7d DESC, file.name ASC
```

## Emerging Patterns

```dataview
TABLE WITHOUT ID
  file.link AS "Pattern",
  status AS "Status",
  emerging_pattern_sector AS "Sector",
  emerging_pattern_streak_days AS "Streak",
  emerging_pattern_last_seen AS "Last Seen",
  conviction AS "Conviction"
FROM "10_Theses"
WHERE node_type = "thesis"
  AND file.folder = "10_Theses"
  AND (status = "Draft" OR (emerging_pattern_streak_days >= 1 AND conviction = "low" AND allocation_priority = "watch"))
SORT emerging_pattern_streak_days DESC, emerging_pattern_last_seen DESC, file.name ASC
```

## How To Use

1. Start with the `high` priority row set when capital is scarce.
2. Compare `next_catalyst` and `required_sources` before increasing size.
3. Move a thesis down when the `disconfirming_evidence` line starts printing in the data.
4. Keep `watch` theses small until they earn better catalysts or cleaner evidence chains.
5. Review `Conviction Momentum` after weekly sector routing so the suggested scorecard changes stay explicit.
6. Review `Emerging Patterns` before promoting Draft stubs or keeping auto-generated bridge notes alive.
7. Check [[Technical Risk]], [[Earnings Calendar]], and [[Catalyst Radar]] before increasing size in names with tight catalyst windows.
8. After fresh `fmp --technical` or `fmp --earnings-calendar` pulls, run `node run.mjs thesis-fmp-sync` so this board inherits the new tape and catalyst fields.
9. Run `node run.mjs thesis-full-picture --thesis "<name>"` when one thesis needs the full structural + tactical synthesis in one note.
