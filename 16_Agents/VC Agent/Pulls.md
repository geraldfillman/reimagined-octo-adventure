---
title: VC Agent Pulls
type: agent-dashboard
agent_owner: VC Agent
agent_scope: pull
tags: [agents, vc, deal-flow, pulls]
last_updated: 2026-04-28
---

# VC Agent Pulls

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", ticker AS "Ticker", signals AS "Signals"
FROM "05_Data_Pulls/VC"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Capital Raise Activity

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", ticker AS "Ticker", signals AS "Signals"
FROM "05_Data_Pulls/Fundamentals"
WHERE contains(data_type, "capital-raise") OR contains(tags, "vc") OR contains(tags, "capital-raise")
SORT date_pulled DESC, file.mtime DESC
LIMIT 40
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", ticker AS "Ticker", signals AS "Signals"
FROM "05_Data_Pulls/VC" OR "05_Data_Pulls/Fundamentals"
WHERE (signal_status != null AND signal_status != "clear") AND (contains(tags, "vc") OR contains(tags, "capital-raise") OR contains(tags, "deal-flow"))
SORT date_pulled DESC, file.mtime DESC
LIMIT 30
```

## Due Diligence Reports

```dataview
TABLE date_pulled AS "Date", ticker AS "Ticker", signal_status AS "Status", signals AS "Signals"
FROM "12_Company_Risk"
WHERE contains(data_type, "dd-report") OR contains(tags, "dd-report") OR contains(tags, "due-diligence")
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```
