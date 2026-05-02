---
title: Agent Layer Map
type: reference
tags: [reference, agents, vault-organization]
last_updated: 2026-04-28
---

# Agent Layer Map

Summary:
- `16_Agents/` is a navigation and operating layer.
- Existing `05_Data_Pulls/` and `01_Data_Sources/` remain canonical storage.
- Phase 1 does not move legacy notes, change validation, or reroute pullers.

## Routing Table

| Agent | Pull Folders | Source Categories |
| --- | --- | --- |
| Orchestrator Agent | `05_Data_Pulls/Orchestrator`, cross-domain synthesis | all source categories (synthesis layer) |
| Market Agent | `05_Data_Pulls/Market` | `Market_Data`, `Prediction_Markets`, `Social_Sentiment` |
| Macro Agent | `05_Data_Pulls/Macro` | `Macro` |
| Thesis Agent | `05_Data_Pulls/Theses`, `10_Theses` indexes | cross-domain source queries |
| Fundamentals Agent | `05_Data_Pulls/Fundamentals` | `Fundamentals` |
| Biotech Agent | `05_Data_Pulls/Biotech` | `Biotech_Healthcare` |
| Government Agent | `05_Data_Pulls/Government` | `Government_Contracts`, `Legal_Courts` |
| Housing Agent | `05_Data_Pulls/Housing` | `Housing_Real_Estate` |
| Energy Agent | `05_Data_Pulls/Energy` | `Climate_Energy`, `Supply_Chain_Trade` |
| Research Agent | `05_Data_Pulls/Research`, strategy rollups in `05_Data_Pulls/Theses` | `Frontier_Science`, `Developer_Code`, strategy baskets in `10_Theses/Baskets` |
| Sectors Agent | `05_Data_Pulls/Sectors` | source notes tagged or described as sector-related |
| OSINT Agent | `05_Data_Pulls/osint`, `05_Data_Pulls/social` | `OSINT`, `Geospatial` |
| VC Agent | `05_Data_Pulls/VC`, `05_Data_Pulls/Fundamentals` (capital-raise) | `Private_Markets_VC` |
| News Agent | `05_Data_Pulls/News`, `05_Data_Pulls/social` (shared) | `News_Media` |
| Legal Agent | `05_Data_Pulls/Legal`, `05_Data_Pulls/Government` (shared) | `Legal_Courts` (shared with Government Agent) |

## Metadata

New agent-owned notes may add:

```yaml
agent_owner: "Market Agent"
agent_scope: "pull"
```

Allowed `agent_scope` values for this layer:
- `pull`
- `source`
- `signal`
- `dashboard`

These fields are optional and are not required by validation in phase 1.
