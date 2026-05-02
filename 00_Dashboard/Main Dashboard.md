---
title: Main Dashboard
type: dashboard
tags: [dashboard, main, orchestrator, agents]
last_updated: 2026-04-28
---

# Main Dashboard

![[sitdeck]]

---

## Agent Pipeline

```dataviewjs
const routes = [
  ["Orchestrator", ["05_Data_Pulls/Orchestrator"], ["orchestrator"]],
  ["Market",       ["05_Data_Pulls/Market"],       ["market", "agent-analysis"]],
  ["Macro",        ["05_Data_Pulls/Macro"],         ["macro"]],
  ["Thesis",       ["05_Data_Pulls/Theses"],        ["thesis"]],
  ["Fundamentals", ["05_Data_Pulls/Fundamentals"],  ["fundamentals"]],
  ["Biotech",      ["05_Data_Pulls/Biotech"],       ["biotech"]],
  ["Government",   ["05_Data_Pulls/Government"],    ["government"]],
  ["Housing",      ["05_Data_Pulls/Housing"],       ["housing"]],
  ["Energy",       ["05_Data_Pulls/Energy"],        ["energy"]],
  ["Research",     ["05_Data_Pulls/Research"],      ["research", "arxiv", "pubmed"]],
  ["Sectors",      ["05_Data_Pulls/Sectors"],       ["sectors", "sector"]],
  ["OSINT",        ["05_Data_Pulls/osint", "05_Data_Pulls/social"], ["osint", "social"]],
  ["VC",           ["05_Data_Pulls/VC"],            ["vc", "capital-raise", "deal-flow"]],
  ["News",         ["05_Data_Pulls/News"],          ["news", "media", "sentiment"]],
  ["Legal",        ["05_Data_Pulls/Legal"],         ["legal", "rulemaking", "regulatory"]],
];

function inAnyFolder(page, folders) {
  return folders.some(f => page.file.folder === f || page.file.folder.startsWith(f + "/"));
}
function hasAnyTag(page, tags) {
  const vals = Array.isArray(page.tags) ? page.tags.map(t => String(t).toLowerCase()) : [];
  return tags.some(t => vals.includes(t));
}

const rows = routes.map(([agent, folders, tags]) => {
  const pulls = dv.pages('"05_Data_Pulls"')
    .where(p => inAnyFolder(p, folders) || hasAnyTag(p, tags));
  const critical = pulls.where(p => p.signal_status === "critical").length;
  const alert    = pulls.where(p => p.signal_status === "alert").length;
  const watch    = pulls.where(p => p.signal_status === "watch").length;
  const latest   = pulls.sort(p => p.date_pulled, "desc").first();
  const status   = critical > 0 ? "🔴" : alert > 0 ? "🟠" : watch > 0 ? "🟡" : "⚪";
  const lastPull = latest ? latest.date_pulled : "—";
  return [status, agent, lastPull, critical || "—", alert || "—", watch || "—", latest ? latest.file.link : "—"];
});

dv.table(["", "Agent", "Last Pull", "🔴", "🟠", "🟡", "Latest"], rows);
```

---

## Priority Queue

```dataview
TABLE WITHOUT ID
  choice(signal_status = "critical", "🔴",
    choice(signal_status = "alert", "🟠", "🟡")) AS "",
  file.link AS "Report",
  domain AS "Domain",
  date_pulled AS "Date",
  choice((date(today) - date_pulled) > dur("30 days"), "🔴 stale",
    choice((date(today) - date_pulled) > dur("7 days"), "⚠️ aging", "")) AS "Age",
  signals AS "Signals"
FROM "05_Data_Pulls"
WHERE signal_status = "critical" OR signal_status = "alert"
SORT choice(signal_status = "critical", 0, 1) ASC, date_pulled DESC
LIMIT 20
```

---

## Signal History

```dataview
TABLE WITHOUT ID
  choice(severity = "critical", "🔴",
    choice(severity = "alert", "🟠",
      choice(severity = "watch", "🟡", "⚪"))) AS "",
  file.link AS "Signal",
  signal_id AS "ID",
  source AS "Source",
  date AS "Date"
FROM "06_Signals"
WHERE date >= (date(today) - dur("30 days"))
SORT date DESC
LIMIT 15
```

---

## Research Feed

```dataview
TABLE WITHOUT ID
  file.link AS "Report",
  domain AS "Domain",
  date_pulled AS "Date",
  signals AS "Signals"
FROM "05_Data_Pulls"
WHERE contains(data_type, "opportunity") OR contains(tags, "opportunity-viewpoints") OR contains(data_type, "agent-analysis") OR contains(tags, "agent-analysis")
SORT date_pulled DESC, file.mtime DESC
LIMIT 15
```
