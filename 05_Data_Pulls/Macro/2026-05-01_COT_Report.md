---
title: "COT Report"
source: "CFTC Commitment of Traders"
date_pulled: "2026-05-01"
domain: "macro"
data_type: "cot_report"
frequency: "weekly"
signal_status: "clear"
signals: []
agent_owner: "macro"
handoff_to: ["orchestrator"]
tags: ["cot", "positioning", "commitment-of-traders", "macro"]
fetch_error: "HTTP 403 from CFTC"
---

## Fetch Error

> COT data unavailable: HTTP 403 from CFTC
> The CFTC releases the report every Friday ~3:30 PM ET.
> Retry with `node run.mjs pull cot-report` after Friday release.
