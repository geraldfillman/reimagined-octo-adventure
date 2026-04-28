---
title: OSINT Agent
type: agent-moc
agent_owner: OSINT Agent
agent_scope: dashboard
tags: [agents, osint, moc]
last_updated: 2026-04-28
---

# OSINT Agent

Purpose: Own passive OSINT scans, social scraping, geospatial discovery, breach/intel source notes, and external signal collection.

## Operating Surfaces

- [[16_Agents/OSINT Agent/Pulls]]
- [[16_Agents/OSINT Agent/Sources]]
- [[16_Agents/OSINT Agent/Signals]]
- [[00_Dashboard/OSINT Intelligence]]

## Commands

```powershell
node run.mjs scan osint-spiderfoot --domain example.com
node run.mjs scan osint-harvester --domain example.com
node run.mjs scan osint-amass --domain example.com
node run.mjs scan osint-snscrape --platform twitter --query "NVDA earnings"
node run.mjs scan osint-osmsearch --location hormuz --radius 15000
```

## Review Cadence

- On demand: run passive scans for target-specific investigations.
- Weekly: review OSINT freshness, tool failures, and high-confidence findings.
