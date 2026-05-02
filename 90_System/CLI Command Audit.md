---
title: CLI Command Audit
type: reference
tags: [system, cli, audit]
last_updated: 2026-04-28
---

# CLI Command Audit

Inventory of all `node run.mjs` commands with side-effect classification and proposed namespace mapping.

**Side-effect key:**
- API = reads external APIs
- W = writes new vault notes
- FM = rewrites existing note frontmatter
- D = destructive / prunes files
- DR = supports `--dry-run`
- JSON = supports `--json` output

---

## System Group

| Command | New Namespace | API | W | FM | D | DR | JSON | Status |
|---------|--------------|-----|---|----|---|----|------|--------|
| `status` | `system status` | no | no | no | no | no | no | rename |
| `validate` | `system validate` | no | no | no | no | no | no | rename |
| `dashboard` | `system dashboard` | no | no | no | no | no | no | rename |
| `cleanup` | `system cleanup` | no | no | no | yes | yes | no | rename |
| `infranodus` | `system infranodus` | no | yes | no | no | no | no | rename |

---

## Learn Group

| Command | New Namespace | API | W | FM | D | DR | JSON | Status |
|---------|--------------|-----|---|----|---|----|------|--------|
| `learning-session` | `learn session` | no | yes | no | no | no | no | rename |

---

## Scan Group

| Command | New Namespace | API | W | FM | D | DR | JSON | Status |
|---------|--------------|-----|---|----|---|----|------|--------|
| `sector-scan` | `scan sectors` | yes | yes | yes | no | yes | no | rename |
| `company-risk-scan` | `scan company-risk` | yes | yes | yes | no | yes | no | rename |
| `conviction-delta` | `scan conviction` | no | yes | no | no | yes | yes | rename |
| — | `scan osint-spiderfoot` | no* | yes | no | no | yes | no | new — *local CLI tool, no external API |
| — | `scan osint-harvester` | no* | yes | no | no | yes | no | new — *queries public sources directly |
| — | `scan osint-amass` | no* | yes | no | no | yes | no | new — *cert transparency + DNS |
| — | `scan osint-recon` | no* | yes | no | no | yes | no | new — *passive public sources |
| — | `scan osint-telegram` | no* | yes | no | no | yes | no | new — *Telethon MTProto; TELEGRAM_API_ID required |
| — | `scan osint-leaker` | no | yes | no | no | yes | no | new — passive breach/credential enumeration across 10 DBs |
| — | `scan osint-octosuite` | no* | yes | no | no | yes | no | new — *GITHUB_TOKEN optional; GitHub org/user OSINT (Bellingcat) |
| — | `scan osint-merklemap` | no | yes | no | no | yes | no | new — cert transparency subdomain discovery (Merklemap API) |
| — | `scan osint-columbus` | no | yes | no | no | yes | no | new — fast passive subdomain discovery (Columbus Project API) |
| — | `scan osint-snscrape` | no | yes | no | no | yes | no | new — multi-platform social scraper (Bellingcat); twitter/instagram/reddit |
| — | `scan osint-umbra` | no | yes | no | no | yes | no | new — Umbra SAR satellite open data tracker (Bellingcat); named regions |
| — | `scan osint-osmsearch` | no | yes | no | no | yes | no | new — OpenStreetMap proximity feature search (Bellingcat); Overpass fallback |

---

## Thesis Group

| Command | New Namespace | API | W | FM | D | DR | JSON | Status |
|---------|--------------|-----|---|----|---|----|------|--------|
| `thesis-fmp-sync` | `thesis sync` | yes | no | yes | no | yes | no | rename |
| `thesis-catalysts` | `thesis catalysts` | yes | yes | no | no | yes | no | rename |
| `thesis-full-picture` | `thesis full-picture` | yes | yes | no | no | yes | no | rename |

---

## Pull Group — Core Data Pullers

| Command | New Namespace | API | W | FM | D | DR | JSON | Notes |
|---------|--------------|-----|---|----|---|----|------|-------|
| `fred` | `pull fred` | yes | yes | no | no | no | no | FRED_API_KEY |
| `fmp` | `pull fmp` | yes | yes | no | no | yes (watchlists) | no | FINANCIAL_MODELING_PREP_API_KEY |
| `entropy-monitor` | `pull entropy-monitor` | yes | yes | no | no | yes | yes | FINANCIAL_MODELING_PREP_API_KEY; SPY/QQQ entropy shadow ledger + `--backtest` |
| `sec` | `pull sec` | no | yes | no | no | no | no | no key |
| `treasury` | `pull treasury` | no | yes | no | no | no | no | no key |
| `cboe` | `pull cboe` | no | yes | no | no | no | no | no key |
| `bea` | `pull bea` | yes | yes | no | no | no | no | BEA_API_KEY |
| `eia` | `pull eia` | yes | yes | no | no | no | no | EIA_API_KEY |
| `fda` | `pull fda` | no | yes | no | no | no | no | no key |
| `arxiv` | `pull arxiv` | no | yes | no | no | no | no | no key |
| `pubmed` | `pull pubmed` | no | yes | no | no | no | no | no key |
| `clinicaltrials` | `pull clinicaltrials` | no | yes | no | no | no | no | no key |
| `newsapi` | `pull newsapi` | yes | yes | no | no | no | no | NEWSAPI_API_KEY |
| - | `pull gdelt` | yes | yes | no | no | yes | yes | no key; GDELT DOC 2.0 15-minute news monitor |
| — | `pull reddit` | no* | yes | no | no | yes | no | new — *public JSON API; OAuth optional via REDDIT_CLIENT_ID |
| `openfema` | `pull openfema` | no | yes | no | no | no | no | no key |
| `usaspending` | `pull usaspending` | no | yes | no | no | no | no | no key |
| `sam` | `pull sam` | yes | yes | no | no | no | no | SAM_GOV_API_KEY |
| `socrata` | `pull socrata` | no | yes | no | no | no | no | SOCRATA_APP_TOKEN optional |
| `uspto` | `pull uspto` | yes | yes | no | no | no | no | PATENTSVIEW_API_KEY |
| `macro-bridges` | `pull macro-bridges` | yes | yes | no | no | no | no | no key |
| `nahb` | `pull nahb` | no | yes | no | no | yes | no | no key |
| `federalregister` | `pull federalregister` | no | yes | no | no | yes | no | no key |

---

## Playbook Group

| Command | New Namespace | API | W | FM | D | DR | JSON | Notes |
|---------|--------------|-----|---|----|---|----|------|-------|
| `playbook housing-cycle` | `playbook housing-cycle` | yes | yes | no | no | no | no | orchestrates multiple pullers |

---

## KB Group (Knowledge Base pipeline)

| Command | Namespace | API | W | FM | D | DR | JSON | Notes |
|---------|-----------|-----|---|----|---|----|------|-------|
| `kb ingest` | `kb ingest` | maybe | yes | no | no | yes | no | --url fetches external; --file copies local |
| `kb normalize` | `kb normalize` | no | yes | no | no | yes | no | writes index manifests to wiki/index/ |
| `kb classify` | `kb classify` | no | no | yes | no | yes | no | rewrites manifest status/extraction-depth |
| `kb compile` | `kb compile` | no | yes | no | no | yes | no | writes wiki pages to wiki/summaries/ etc. |
| `kb query` | `kb query` | no | maybe | no | no | yes | no | --save writes to wiki/query-results/ |
| `kb librarian` | `kb librarian` | no | maybe | yes | no | yes | no | --fix auto-patches TLDR stubs |
| `kb health` | `kb health` | no | yes | no | no | yes | no | writes health-checks/health-<date>.md |
| `kb transcribe` | `kb transcribe` | no | yes | no | no | yes | no | writes wiki summary + extraction note |
| `kb suggest` | `kb suggest` | no | maybe | no | no | yes | no | --save writes health-checks/suggestions-<date>.md |
| `kb dispatch` | `kb dispatch` | — | — | — | — | — | — | alias front-door; delegates to above |

---

## Topic Flag Coverage

Which pullers accept each topic flag:

| Topic Flag       | arxiv | pubmed | clinicaltrials | sec |
| ---------------- | ----- | ------ | -------------- | --- |
| `--drones`       | ✓     | —      | —              | ✓   |
| `--defense`      | ✓     | —      | —              | ✓   |
| `--amr`          | ✓     | ✓      | ✓              | ✓   |
| `--psychedelics` | ✓     | ✓      | —              | ✓   |
| `--glp1`         | ✓     | ✓      | ✓              | ✓   |
| `--geneediting`  | ✓     | ✓      | ✓              | ✓   |
| `--alzheimers`   | ✓     | ✓      | ✓              | ✓   |
| `--longevity`    | ✓     | ✓      | ✓              | ✓   |
| `--nuclear`      | ✓     | —      | —              | ✓   |
| `--quantum`      | ✓     | —      | —              | ✓   |
| `--humanoid`     | ✓     | —      | —              | ✓   |
| `--space`        | ✓     | —      | —              | ✓   |
| `--storage`      | —     | —      | —              | ✓   |
| `--aipower`      | —     | —      | —              | ✓   |
| `--semis`        | —     | —      | —              | ✓   |
| `--housing`      | —     | —      | —              | ✓   |
| `--hardmoney`    | —     | —      | —              | ✓   |
| `--hypersonics`  | —     | —      | —              | ✓   |
| `--oncology`     | —     | —      | ✓              | —   |
| `--cardio`       | —     | —      | ✓              | —   |
| `--neuro`        | —     | —      | ✓              | —   |

---

## Compatibility Aliases Required

The following flat commands must remain working during transition (with deprecation notices):

| Legacy form | New form | Alias in run.mjs |
|-------------|----------|------------------|
| `sector-scan` | `scan sectors` | yes |
| `company-risk-scan` | `scan company-risk` | yes |
| `conviction-delta` | `scan conviction` | yes |
| `thesis-fmp-sync` | `thesis sync` | yes |
| `thesis-catalysts` | `thesis catalysts` | yes |
| `thesis-full-picture` | `thesis full-picture` | yes |
| `learning-session` | `learn session` | yes |
| `status` | `system status` | yes |
| `validate` | `system validate` | yes |
| `dashboard` | `system dashboard` | yes |
| `cleanup` | `system cleanup` | yes |
| `infranodus` | `system infranodus` | yes |
| `fred` / `fmp` / etc. | `pull fred` / `pull fmp` etc. | not required (still valid as `pull <name>` passthrough) |
