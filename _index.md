# Vault Index

Start here.

Core maps:
- [[000-moc/moc-dashboard]]
- [[000-moc/moc-data-sources]]
- [[000-moc/moc-reference]]
- [[000-moc/moc-macro]]
- [[000-moc/moc-entities]]
- [[000-moc/moc-theses]]
- [[000-moc/moc-playbooks]]
- [[000-moc/moc-company-risk]]

Learning workspace (Dr_Magnifico vault — open separately in Obsidian):
- `11_Learning/` — daily sessions, nodes, mastery tracking
- `11_Learning/00_Dashboard/Mastery_Dashboard.md`
- `11_Learning/Learning System.canvas`
- Run: `node run.mjs learn web` (learning UI at localhost:4747)

KB workspace (Oy vault — open separately in Obsidian):
- `12_Knowledge_Bases/wiki/` — compiled knowledge pages
- Run: `node run.mjs kb query --query "..."` (from My_Data scripts)

Control notes:
- [[AGENTS]]
- [[CLAUDE]]
- [[04_Reference/Qlib Cheat Sheet]]

Default exclusions:
- Do not scan `500-archive/` unless the task is explicitly about historical or retired material.
- Do not scan `.obsidian/`, `.claude/`, or `scripts/` unless the task is explicitly about tooling or configuration.
- Do not load `05_Data_Pulls/`, `06_Signals/`, or `07_Playbooks/Graph_Sessions/` by default. Open them only when you need evidence, provenance, or a recent generated output.
- Treat `08_Entities/`, `09_Macro/`, and `10_Theses/` as graph-critical areas. Prefer the MOCs first, then open only the specific notes needed for the task.
