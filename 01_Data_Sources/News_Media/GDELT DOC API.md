---
name: "GDELT DOC API"
category: "News_Media"
type: "API"
provider: "The GDELT Project"
pricing: "Free"
status: "Active"
priority: "High"
url: "https://api.gdeltproject.org/api/v2/doc/doc"
provides:
  - "Near-real-time global news article metadata"
  - "Article titles, URLs, detected time, source domain, language, and source country"
  - "15-minute minimum timespan monitoring for fast news radar loops"
best_use_cases:
  - "Intraday news radar for the Streamline Report"
  - "Cross-source confirmation of market, macro, policy, company, sector, and event narratives"
  - "Headline-cluster detection before slower evidence is reviewed"
tags:
  - news-media
  - gdelt
  - event-monitor
related_sources:
  - "[[NewsAPI]]"
  - "[[SEC EDGAR API]]"
  - "[[FRED API]]"
key_location: "No key required"
integrated: true
linked_puller: "scripts/pullers/gdelt.mjs"
update_frequency: "15 minutes when gdelt-news-loop.ps1 is running"
owner: "News Agent"
last_reviewed: "2026-05-01"
notes: "Uses GDELT DOC 2.0 Article List mode as a fast radar input. Headlines require human/source confirmation before being promoted to signals."
---

## Summary

GDELT DOC API is a no-key global news metadata API. In this vault it is used as a fast news radar feeding `05_Data_Pulls/News/` and the Streamline Report.

## Pull Commands

```powershell
node run.mjs pull gdelt --topic markets
node run.mjs pull gdelt --all --timespan 15min --limit 75
powershell scripts\gdelt-news-loop.ps1
powershell scripts\gdelt-news-loop.ps1 -Once
```

## Integration Notes

- Writes `gdelt_news_monitor` notes to `05_Data_Pulls/News/`.
- The 15-minute loop is a monitoring input, not a verified signal source.
- Promote a GDELT headline only when it connects to a thesis, filing, company release, macro report, or repeated source cluster.
- Official DOC API docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
