---
title: "GDELT News Monitor (15min)"
source: "GDELT DOC API"
date_pulled: "2026-05-01"
domain: "news"
data_type: "gdelt_news_monitor"
frequency: "15min"
signal_status: "watch"
signals: ["GDELT_FETCH_ERROR"]
timespan: "15min"
topic_count: 1
article_count: 0
fetch_error_count: 1
alert_threshold: 60
tags: ["news", "gdelt", "event-monitor", "orchestrator-input"]
---

## Topic Summary

| Topic | Articles | Top Domain | Latest Seen | Fetch Error | Query |
| --- | --- | --- | --- | --- | --- |
| Markets | 0 | N/A | N/A | Failed after 2 attempts: fetch failed | ("stock market" OR equities OR "S&P 500" OR Nasdaq OR "Federal Reserve") |

## Latest Articles

_No GDELT articles matched the configured topics in this interval._

## Monitor Use

- Treat this as a news radar input, not a verified signal by itself.
- Promote an item only when it connects to a thesis, catalyst, filing, macro event, or repeated source cluster.
- Pair fast headlines with slower evidence: SEC filings, FRED/Fed reports, company releases, and thesis notes.
- The 15-minute loop should write small interval notes; the Streamline Report then decides what deserves review.

## Source

- **API**: GDELT DOC 2.0 API, Article List mode
- **Timespan**: 15min
- **Max records per topic**: 75
- **Fetch errors**: 1
- **Official docs**: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
- **Auto-pulled**: 2026-05-01
