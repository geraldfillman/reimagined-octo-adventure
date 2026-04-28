---
title: Research Agent Signals
type: agent-dashboard
agent_owner: Research Agent
agent_scope: signal
tags: [agents, research, signals]
last_updated: 2026-04-28
---

# Research Agent Signals

```dataview
TABLE date AS "Date", severity AS "Severity", signal_status AS "Status", source AS "Source", tags AS "Tags"
FROM "06_Signals"
WHERE contains(tags, "research") OR contains(tags, "arxiv") OR contains(tags, "pubmed") OR contains(tags, "science") OR contains(tags, "clinicaltrials")
SORT date DESC, file.mtime DESC
LIMIT 80
```

## Thesis-Confirming Research

Research pulls with thesis links and elevated signal status — the clearest cross-sector evidence layer.

```dataview
TABLE date_pulled AS "Date", source AS "Source", topic AS "Topic", related_theses AS "Theses", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Research" OR "05_Data_Pulls/Biotech" OR "05_Data_Pulls/Government"
WHERE related_theses != null AND signal_status != null AND signal_status != "clear"
SORT date_pulled DESC, file.mtime DESC
LIMIT 40
```

## ClinicalTrials Activity

```dataview
TABLE date_pulled AS "Date", data_type AS "Type", signal_status AS "Status", signals AS "Signals"
FROM "05_Data_Pulls/Biotech"
WHERE contains(data_type, "clinicaltrials") OR contains(tags, "clinicaltrials")
SORT date_pulled DESC, file.mtime DESC
LIMIT 20
```
