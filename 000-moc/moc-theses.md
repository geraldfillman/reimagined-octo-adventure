---
title: Theses
type: moc
tags: [theses, synthesis, strategy]
last_updated: 2026-04-02
---
# Theses

Summary:
- Thesis notes are the primary synthesis layer across macro, entity, and signal inputs.
- Use dashboards first, then open only the theses relevant to the question.
- Use the Emerging Patterns section after weekly sector-scan review to catch Draft stubs and newly promoted low-conviction theses.

Open first when:
- You need the current investment framing, cross-domain alignment, or a thesis-specific read.

Key notes:
- [[00_Dashboard/Cross-Domain Thesis Board]]
- [[00_Dashboard/Capital Allocation Board]]
- [[00_Dashboard/High Priority Thesis Monitor]]
- [[00_Dashboard/Full Picture Reports]]
- [[00_Dashboard/Technical Risk]]
- [[00_Dashboard/Earnings Calendar]]
- [[10_Theses/Housing Supply Correction]]
- [[10_Theses/AI Power Infrastructure]]
- [[10_Theses/Defense AI Autonomous Warfare]]
- [[10_Theses/Dollar Debasement Hard Money]]
- [[10_Theses/AI Power Defense Stack]]
- [[10_Theses/Fiscal Scarcity Rearmament]]
- [[10_Theses/Biosecurity Compute Convergence]]

## Emerging Patterns

```dataview
TABLE WITHOUT ID
  file.link AS "Thesis",
  status AS "Status",
  emerging_pattern_sector AS "Sector",
  emerging_pattern_streak_days AS "Streak",
  emerging_pattern_last_seen AS "Last Seen"
FROM "10_Theses"
WHERE node_type = "thesis"
  AND file.folder = "10_Theses"
  AND (status = "Draft" OR (emerging_pattern_streak_days >= 1 AND conviction = "low" AND allocation_priority = "watch"))
SORT emerging_pattern_streak_days DESC, emerging_pattern_last_seen DESC, file.name ASC
```

Basket Universes (not conviction theses):
- `10_Theses/Baskets/` - sector and investment-style baskets used for watchlist and strategy grouping.
- Do not link these from dashboards or thesis synthesis unless a workflow explicitly includes baskets.

Decisions:
- Thesis notes are the main synthesis surface.
- Open supporting entities, regimes, and pull notes only after the thesis note identifies the relevant links.
- Basket files live in `10_Theses/Baskets/` and are excluded from all dashboard Dataview queries via `file.folder = "10_Theses"`.
