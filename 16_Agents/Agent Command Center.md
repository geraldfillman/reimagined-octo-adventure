---
title: Agent Command Center
type: agent-index
agent_scope: dashboard
tags: [agents, dashboard, command-center]
last_updated: 2026-04-28
---

# Agent Command Center

This is the top-level operating layer for the vault's domain agents. It organizes existing pulls and sources without moving legacy files.

## Agent Index

| Agent | Pulls | Sources | Signals |
| --- | --- | --- | --- |
| [[16_Agents/Orchestrator Agent/README|Orchestrator Agent]] | [[16_Agents/Orchestrator Agent/Pulls|Pulls]] | [[16_Agents/Orchestrator Agent/Sources|Sources]] | [[16_Agents/Orchestrator Agent/Signals|Signals]] |
| [[16_Agents/Market Agent/README|Market Agent]] | [[16_Agents/Market Agent/Pulls|Pulls]] | [[16_Agents/Market Agent/Sources|Sources]] | [[16_Agents/Market Agent/Signals|Signals]] |
| [[16_Agents/Macro Agent/README|Macro Agent]] | [[16_Agents/Macro Agent/Pulls|Pulls]] | [[16_Agents/Macro Agent/Sources|Sources]] | [[16_Agents/Macro Agent/Signals|Signals]] |
| [[16_Agents/Thesis Agent/README|Thesis Agent]] | [[16_Agents/Thesis Agent/Pulls|Pulls]] | [[16_Agents/Thesis Agent/Sources|Sources]] | [[16_Agents/Thesis Agent/Signals|Signals]] |
| [[16_Agents/Fundamentals Agent/README|Fundamentals Agent]] | [[16_Agents/Fundamentals Agent/Pulls|Pulls]] | [[16_Agents/Fundamentals Agent/Sources|Sources]] | [[16_Agents/Fundamentals Agent/Signals|Signals]] |
| [[16_Agents/Biotech Agent/README|Biotech Agent]] | [[16_Agents/Biotech Agent/Pulls|Pulls]] | [[16_Agents/Biotech Agent/Sources|Sources]] | [[16_Agents/Biotech Agent/Signals|Signals]] |
| [[16_Agents/Government Agent/README|Government Agent]] | [[16_Agents/Government Agent/Pulls|Pulls]] | [[16_Agents/Government Agent/Sources|Sources]] | [[16_Agents/Government Agent/Signals|Signals]] |
| [[16_Agents/Housing Agent/README|Housing Agent]] | [[16_Agents/Housing Agent/Pulls|Pulls]] | [[16_Agents/Housing Agent/Sources|Sources]] | [[16_Agents/Housing Agent/Signals|Signals]] |
| [[16_Agents/Energy Agent/README|Energy Agent]] | [[16_Agents/Energy Agent/Pulls|Pulls]] | [[16_Agents/Energy Agent/Sources|Sources]] | [[16_Agents/Energy Agent/Signals|Signals]] |
| [[16_Agents/Research Agent/README|Research Agent]] | [[16_Agents/Research Agent/Pulls|Pulls]] | [[16_Agents/Research Agent/Sources|Sources]] | [[16_Agents/Research Agent/Signals|Signals]] |
| [[16_Agents/Sectors Agent/README|Sectors Agent]] | [[16_Agents/Sectors Agent/Pulls|Pulls]] | [[16_Agents/Sectors Agent/Sources|Sources]] | [[16_Agents/Sectors Agent/Signals|Signals]] |
| [[16_Agents/Sports Agent/README|Sports Agent]] | [[16_Agents/Sports Agent/Pulls|Pulls]] | [[16_Agents/Sports Agent/Sources|Sources]] | [[16_Agents/Sports Agent/Signals|Signals]] |
| [[16_Agents/OSINT Agent/README|OSINT Agent]] | [[16_Agents/OSINT Agent/Pulls|Pulls]] | [[16_Agents/OSINT Agent/Sources|Sources]] | [[16_Agents/OSINT Agent/Signals|Signals]] |
| [[16_Agents/VC Agent/README|VC Agent]] | [[16_Agents/VC Agent/Pulls|Pulls]] | [[16_Agents/VC Agent/Sources|Sources]] | [[16_Agents/VC Agent/Signals|Signals]] |
| [[16_Agents/News Agent/README|News Agent]] | [[16_Agents/News Agent/Pulls|Pulls]] | [[16_Agents/News Agent/Sources|Sources]] | [[16_Agents/News Agent/Signals|Signals]] |
| [[16_Agents/Legal Agent/README|Legal Agent]] | [[16_Agents/Legal Agent/Pulls|Pulls]] | [[16_Agents/Legal Agent/Sources|Sources]] | [[16_Agents/Legal Agent/Signals|Signals]] |

## Cross-Agent Alerts

```dataviewjs
const routes = [
  ["Orchestrator Agent", ["05_Data_Pulls/Orchestrator"], ["orchestrator"]],
  ["Market Agent", ["05_Data_Pulls/Market"], ["market", "agent-analysis"]],
  ["Macro Agent", ["05_Data_Pulls/Macro"], ["macro"]],
  ["Thesis Agent", ["05_Data_Pulls/Theses"], ["thesis"]],
  ["Fundamentals Agent", ["05_Data_Pulls/Fundamentals"], ["fundamentals"]],
  ["Biotech Agent", ["05_Data_Pulls/Biotech"], ["biotech"]],
  ["Government Agent", ["05_Data_Pulls/Government"], ["government"]],
  ["Housing Agent", ["05_Data_Pulls/Housing"], ["housing"]],
  ["Energy Agent", ["05_Data_Pulls/Energy"], ["energy"]],
  ["Research Agent", ["05_Data_Pulls/Research"], ["research"]],
  ["Sectors Agent", ["05_Data_Pulls/Sectors"], ["sectors", "sector"]],
  ["Sports Agent", ["05_Data_Pulls/Sports"], ["sports"]],
  ["OSINT Agent", ["05_Data_Pulls/osint", "05_Data_Pulls/social"], ["osint", "social"]],
  ["VC Agent", ["05_Data_Pulls/VC"], ["vc", "capital-raise", "deal-flow"]],
  ["News Agent", ["05_Data_Pulls/News"], ["news", "media", "sentiment", "reddit"]],
  ["Legal Agent", ["05_Data_Pulls/Legal"], ["legal", "rulemaking", "regulatory", "faa", "court"]]
];

function inAnyFolder(page, folders) {
  return folders.some(folder => page.file.folder === folder || page.file.folder.startsWith(folder + "/"));
}

function hasAnyTag(page, tags) {
  const values = Array.isArray(page.tags) ? page.tags.map(t => String(t).toLowerCase()) : [];
  return tags.some(tag => values.includes(tag));
}

const rows = routes.map(([agent, folders, tags]) => {
  const pulls = dv.pages('"05_Data_Pulls"')
    .where(p => inAnyFolder(p, folders) || hasAnyTag(p, tags));
  const active = pulls.where(p => p.signal_status && p.signal_status !== "clear");
  const critical = pulls.where(p => p.signal_status === "critical").length;
  const alert = pulls.where(p => p.signal_status === "alert").length;
  const watch = pulls.where(p => p.signal_status === "watch").length;
  const latest = pulls.sort(p => p.date_pulled, "desc").first();
  return [agent, critical, alert, watch, active.length, latest ? latest.file.link : ""];
});

dv.table(["Agent", "Critical", "Alert", "Watch", "Active", "Latest Pull"], rows);
```

## Reference

- [[04_Reference/Agent Layer Map]]
- [[04_Reference/Pull_System_Guide]]
