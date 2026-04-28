---
title: Legal Agent Pulls
type: agent-dashboard
agent_owner: Legal Agent
agent_scope: pull
tags: [agents, legal, regulatory, pulls]
last_updated: 2026-04-28
---

# Legal Agent Pulls

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", agency AS "Agency", signals AS "Signals"
FROM "05_Data_Pulls/Legal"
SORT date_pulled DESC, file.mtime DESC
LIMIT 80
```

## Federal Register & Regulatory Notices

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Government"
WHERE contains(tags, "legal") OR contains(tags, "rulemaking") OR contains(tags, "regulatory") OR contains(data_type, "federalregister")
SORT date_pulled DESC, file.mtime DESC
LIMIT 40
```

## Active Attention

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Legal" OR "05_Data_Pulls/Government"
WHERE (signal_status != null AND signal_status != "clear") AND (contains(tags, "legal") OR contains(tags, "rulemaking") OR contains(tags, "regulatory"))
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```
