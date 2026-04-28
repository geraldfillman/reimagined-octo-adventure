---
title: VC Agent Signals
type: agent-dashboard
agent_owner: VC Agent
agent_scope: signal
tags: [agents, vc, deal-flow, signals]
last_updated: 2026-04-28
---

# VC Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "vc") OR contains(tags, "deal-flow") OR contains(tags, "capital-raise") OR contains(tags, "private-markets")
SORT date DESC, file.mtime DESC
LIMIT 80
```

## Company Risk Alerts

```dataview
TABLE file.mtime AS "Updated", ticker AS "Ticker", signal_status AS "Status", signals AS "Signals"
FROM "12_Company_Risk"
WHERE signal_status != null AND signal_status != "clear"
SORT file.mtime DESC
LIMIT 30
```
