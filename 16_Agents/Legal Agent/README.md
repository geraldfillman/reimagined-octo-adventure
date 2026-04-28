---
title: Legal Agent
type: agent-moc
agent_owner: Legal Agent
agent_scope: dashboard
tags: [agents, legal, regulatory, rulemaking, moc]
last_updated: 2026-04-28
---

# Legal Agent

Purpose: Own regulatory rulemaking intelligence, FAA/BVLOS filings, congressional hearing context, and future court document tracking. Surfaces policy catalyst signals that affect thesis positions — especially defense, drones, energy, and biotech.

## Operating Surfaces

- [[16_Agents/Legal Agent/Pulls]]
- [[16_Agents/Legal Agent/Sources]]
- [[16_Agents/Legal Agent/Signals]]

## Commands

```powershell
# Federal Register — rulemaking and notices (via Government Agent puller)
node run.mjs pull federalregister --agency FAA
node run.mjs pull federalregister --agency EPA
node run.mjs pull federalregister --agency FDA

# OpenFEMA regulatory data
node run.mjs pull openfema
```

## Data Coverage

| Domain | Sources | Puller |
|---|---|---|
| FAA rulemaking (BVLOS, Remote ID) | Federal Register | `federalregister.mjs` |
| Congressional hearings / CRS reports | ProQuest Congressional (university) | manual |
| Court filings / PACER | not yet integrated | future |

## Cross-Agent Notes

- `01_Data_Sources/Legal_Courts` is also queried by Government Agent — this is intentional.
  Government Agent covers the procurement/contracts lens; Legal Agent covers the rulemaking/judicial lens.
- `federalregister.mjs` outputs to `05_Data_Pulls/Government/` — cross-queried here by tag.

## Review Cadence

- Weekly: scan new Federal Register notices tagged to active thesis sectors.
- As-needed: pull congressional context before key regulatory catalyst dates.
