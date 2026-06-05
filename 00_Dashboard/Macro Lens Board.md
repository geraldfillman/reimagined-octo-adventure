---
title: Macro Lens Board
type: dashboard
tags: [dashboard, macro, lens]
---
# Macro Lens Board

> The vault as a **macroinvestment resource** — housing, finance/macro, energy-climate, and VC special-situations only. Multi-domain content is untouched; this is a filtered view. See [[04_Reference/Macro Lens]] for the convention.

## Macro Theses — Conviction & Allocation

```dataview
TABLE WITHOUT ID
  link(file.link, name) AS "Thesis",
  conviction AS "Conviction",
  allocation_rank AS "Rank",
  monitor_status AS "Monitor",
  break_risk_status AS "Break Risk",
  monitor_last_review AS "Last Review"
FROM "10_Theses"
WHERE node_type = "thesis" AND status = "Active" AND (
  contains(string(tags), "macro") OR contains(string(tags), "housing") OR
  contains(string(tags), "real-estate") OR contains(string(tags), "rates") OR
  contains(string(tags), "fiscal") OR contains(string(tags), "inflation") OR
  contains(string(tags), "energy") OR contains(string(tags), "power") OR
  contains(string(tags), "grid") OR contains(string(tags), "storage") OR
  contains(string(tags), "clean-energy") OR contains(string(tags), "nuclear") OR
  contains(string(tags), "utilities") OR contains(string(tags), "capital-raise") OR
  contains(string(tags), "macro-core")
)
SORT allocation_rank ASC, conviction DESC
```

## Progress Over Time — Monitor Trail

*Most recent monitor changes across the macro cluster. This is the live per-thesis movement history.*

```dataview
TABLE WITHOUT ID
  link(file.link, name) AS "Thesis",
  monitor_last_review AS "Reviewed",
  monitor_status AS "Status",
  monitor_change AS "What Changed"
FROM "10_Theses"
WHERE node_type = "thesis" AND status = "Active" AND monitor_last_review AND (
  contains(string(tags), "macro") OR contains(string(tags), "housing") OR
  contains(string(tags), "energy") OR contains(string(tags), "power") OR
  contains(string(tags), "grid") OR contains(string(tags), "nuclear") OR
  contains(string(tags), "storage") OR contains(string(tags), "fiscal") OR
  contains(string(tags), "rates") OR contains(string(tags), "capital-raise") OR
  contains(string(tags), "macro-core")
)
SORT monitor_last_review DESC
```

> Long-horizon record: [[09_Macro/Macro Snapshot Log]] (monthly, never pruned).

## Supporting Macro Regimes

```dataview
TABLE WITHOUT ID
  link(file.link, file.name) AS "Regime",
  status AS "Status",
  monitor_last_review AS "Last Review"
FROM "09_Macro/Regimes"
WHERE node_type = "regime"
SORT file.name ASC
```

## Recent Macro Signals

```dataview
TABLE WITHOUT ID
  link(file.link, file.name) AS "Signal",
  severity AS "Severity",
  date AS "Date"
FROM "06_Signals"
WHERE date AND (
  contains(string(tags), "macro") OR contains(string(tags), "housing") OR
  contains(string(tags), "energy") OR contains(string(tags), "rates") OR
  contains(string(tags), "fiscal") OR contains(string(tags), "inflation")
)
SORT date DESC
LIMIT 15
```

## AI Opinion — Latest Orchestrator Synthesis

*Signal-intelligence, opportunity-viewpoints, and streamline-report synthesis. Refresh with `node run.mjs pull signal-intelligence` / `pull opportunity-viewpoints` / `pull streamline-report`.*

```dataview
TABLE WITHOUT ID
  link(file.link, file.name) AS "Report",
  data_type AS "Type",
  date_pulled AS "Generated"
FROM "05_Data_Pulls/Orchestrator"
SORT file.mtime DESC
LIMIT 10
```

## AI Opinion — Macro-Cluster Agent Analyses

*Per-ticker agent reads for macro-core entities (homebuilders, hard-money, grid/energy names). Refresh with `node run.mjs pull agent-analyst --all-thesis`.*

```dataview
TABLE WITHOUT ID
  link(file.link, file.name) AS "Agent Analysis",
  signal_status AS "Signal",
  date_pulled AS "Date"
FROM "05_Data_Pulls/Market"
WHERE contains(file.name, "Agent_Analysis") AND (
  contains(file.name, "DHI") OR contains(file.name, "LEN") OR contains(file.name, "NVR") OR
  contains(file.name, "TOL") OR contains(file.name, "TMHC") OR contains(file.name, "SKY") OR
  contains(file.name, "GOLD") OR contains(file.name, "NEM") OR contains(file.name, "WPM") OR
  contains(file.name, "MSTR") OR contains(file.name, "COIN") OR
  contains(file.name, "FLNC") OR contains(file.name, "STEM") OR contains(file.name, "ENVX") OR
  contains(file.name, "ETN") OR contains(file.name, "EXC") OR contains(file.name, "FE")
)
SORT date_pulled DESC
LIMIT 20
```

## Macro Data Freshness

```dataview
TABLE WITHOUT ID
  link(file.link, file.name) AS "Pull",
  file.folder AS "Domain",
  signal_status AS "Signal",
  date_pulled AS "Pulled"
FROM "05_Data_Pulls/Macro" OR "05_Data_Pulls/Housing" OR "05_Data_Pulls/Energy"
WHERE date_pulled
SORT date_pulled DESC
LIMIT 20
```
