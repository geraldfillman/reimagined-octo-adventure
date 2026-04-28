---
title: Biotech Agent
type: agent-moc
agent_owner: Biotech Agent
agent_scope: dashboard
tags: [agents, biotech, moc]
last_updated: 2026-04-28
---

# Biotech Agent

Purpose: Own biotech, clinical, FDA, PubMed-adjacent biotech evidence, and healthcare catalyst monitoring.

## Operating Surfaces

- [[16_Agents/Biotech Agent/Pulls]]
- [[16_Agents/Biotech Agent/Sources]]
- [[16_Agents/Biotech Agent/Signals]]

## Commands

```powershell
node run.mjs pull fda --recent-approvals
node run.mjs pull clinicaltrials --oncology
node run.mjs pull clinicaltrials --amr
node run.mjs pull biofood
```

## Review Cadence

- Daily: review FDA and clinical catalyst notes when active.
- Weekly: compare biotech evidence against active healthcare theses.
