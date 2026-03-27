---
title: My_Data Pull System - Reference Guide
updated: 2026-03-26
theses: 18
companies_tracked: ~90
tags: [reference, system, data-pulls, guide]
---

# My_Data Pull System

This guide documents the current CLI surface in `scripts/run.mjs`.

## Quick Start

Run pulls from the scripts directory in PowerShell:

```powershell
Set-Location "C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\scripts"
node run.mjs help
node run.mjs status
node run.mjs <puller> [flags]
```

The CLI loads `.env` from the vault root:

```text
C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\.env
```

## Daily Workflow

1. Run `node run.mjs status` to confirm keys before starting.
2. Run the morning sequence line by line, or use the external `morning-data-pull` scheduled task if it exists on this machine.
3. Run targeted thesis stacks or a playbook when you need a deeper read.
4. Review notes in `05_Data_Pulls/` and signal notes in `06_Signals/`.

## Morning Sequence (17 Commands)

Copy-paste safe for PowerShell 5.1:

```powershell
# Macro and market
node run.mjs fred --group rates
node run.mjs fred --group housing
node run.mjs fred --group labor
node run.mjs alphavantage --quote SPY
node run.mjs treasury --yields

# Government and regulatory
node run.mjs openfema --recent
node run.mjs usaspending --recent
node run.mjs fda --recent-approvals
node run.mjs sec --thesis

# Clinical and patent intelligence
node run.mjs clinicaltrials --oncology
node run.mjs clinicaltrials --amr
node run.mjs uspto --ptab

# Research sources
node run.mjs arxiv --drones
node run.mjs arxiv --amr
node run.mjs pubmed --amr
node run.mjs pubmed --psychedelics

# News
node run.mjs newsapi --topic business
```

## Utilities and Playbooks

```powershell
node run.mjs help
node run.mjs status
node run.mjs playbook housing-cycle
```

Only `housing-cycle` is currently implemented.

## Morning Pullers

| Puller | Key | Output | Common flags |
|---|---|---|---|
| `fred` | `FRED_API_KEY` | `05_Data_Pulls/Macro/` or `05_Data_Pulls/Housing/` | `--group housing, labor, inflation, rates, credit, liquidity`, `--series`, `--limit` |
| `alphavantage` | `ALPHA_VANTAGE_API_KEY` | `05_Data_Pulls/Market/` | `--quote`, `--overview` |
| `treasury` | None | `05_Data_Pulls/Macro/` | `--yields` |
| `openfema` | None | `05_Data_Pulls/Government/` | `--recent` |
| `usaspending` | None | `05_Data_Pulls/Government/` | `--recent` |
| `fda` | Optional `FDA_OPEN_DATA_API_KEY` | `05_Data_Pulls/Biotech/` | `--recent-approvals` |
| `sec` | None | `05_Data_Pulls/Government/` | `--thesis`, thesis flags, `--sectors [name]` |
| `clinicaltrials` | None | `05_Data_Pulls/Biotech/` | `--oncology`, `--cardio`, `--neuro`, `--amr`, `--glp1`, `--geneediting`, `--alzheimers`, `--longevity`, `--query` |
| `uspto` | `PATENTSVIEW_API_KEY` | `05_Data_Pulls/Government/` | `--ptab`, `--filings`, `--all` |
| `arxiv` | None | `05_Data_Pulls/Research/` | `--drones`, `--defense`, `--amr`, `--psychedelics`, `--glp1`, `--geneediting`, `--alzheimers`, `--longevity`, `--nuclear`, `--quantum`, `--humanoid`, `--space`, `--all` |
| `pubmed` | None | `05_Data_Pulls/Research/` | `--amr`, `--psychedelics`, `--glp1`, `--geneediting`, `--alzheimers`, `--longevity`, `--all` |
| `newsapi` | `NEWSAPI_API_KEY` | Topic-based domain under `05_Data_Pulls/` | `--topic`, `--limit` |

## Additional Pullers

These are implemented in the repo but are not part of the default morning sequence.

| Puller | Key | Output | Common flags |
|---|---|---|---|
| `fmp` | `FINANCIAL_MODELING_PREP_API_KEY` | `05_Data_Pulls/Market/` | `--profile`, `--income`, `--options` |
| `bea` | `BEA_API_KEY` | `05_Data_Pulls/Macro/` | `--gdp`, `--income` |
| `eia` | `EIA_API_KEY` | `05_Data_Pulls/Energy/` | `--electricity-demand`, `--generation-mix`, `--regional-load`, `--all` |
| `cboe` | None | `05_Data_Pulls/Market/` | `--skew`, `--vix`, `--all` |
| `sam` | `SAM_GOV_API_KEY` | `05_Data_Pulls/Government/` | `--entities`, `--opportunities`, `--all` |
| `socrata` | Optional `SOCRATA_APP_TOKEN` | Dataset-based domain under `05_Data_Pulls/` | `--permits`, `--311`, `--chi-permits`, `--custom` |

## SEC Coverage

### Thesis Flags

| Flag | Theme |
|---|---|
| `--drones` | Drone autonomous systems |
| `--defense` | Defense AI and autonomous warfare |
| `--amr` | Antimicrobial resistance |
| `--psychedelics` | Psychedelic mental health |
| `--glp1` | GLP-1 and metabolic disease |
| `--geneediting` | Gene editing and CRISPR |
| `--alzheimers` | Alzheimer's disease modification |
| `--longevity` | Longevity and aging biology |
| `--nuclear` | Nuclear renaissance and SMRs |
| `--storage` | Grid-scale battery storage |
| `--aipower` | AI power infrastructure |
| `--humanoid` | Humanoid robotics |
| `--quantum` | Quantum computing |
| `--semis` | Semiconductor sovereignty and CHIPS |
| `--housing` | Housing supply correction |
| `--hardmoney` | Dollar debasement and hard money |
| `--space` | Space domain awareness |
| `--hypersonics` | Hypersonic weapons and advanced defense |

### Sector Flags

```powershell
node run.mjs sec --sectors
node run.mjs sec --sectors tech
node run.mjs sec --sectors health
node run.mjs sec --sectors energy
node run.mjs sec --sectors finance
node run.mjs sec --sectors industrial
node run.mjs sec --sectors consumer
node run.mjs sec --sectors realestate
node run.mjs sec --sectors clean
```

### 8-K Items Tracked

| Item | Event |
|---|---|
| `1.01` | Material contract |
| `1.02` | Contract termination |
| `2.02` | Earnings results |
| `2.06` | Material impairment |
| `4.01` | Auditor change |
| `5.02` | Executive departure |
| `5.03` | Amendment to articles |
| `7.01` | Regulation FD disclosure |
| `8.01` | Other material event |

## Representative Output Layout

Exact filenames are date-stamped by the pullers. Use this as a directory map, not a hardcoded file list.

```text
05_Data_Pulls/
  Macro/       FRED_Rates, FRED_Labor, Treasury_Rates, BEA_*, News_* for macro topics
  Market/      AV_Quote_*, AV_Overview_*, FMP_*, CBOE_*
  Government/  OpenFEMA_*, USASpending_*, USPTO_*, SEC_*, SAM_*, Socrata_311, Socrata_Custom
  Biotech/     FDA_*, ClinicalTrials_*, News_* for biotech topics
  Research/    arXiv_*, PubMed_*
  Housing/     FRED_Housing, Housing_Cycle_Report, Socrata_permits, Socrata_chi-permits, News_* for housing topics
  Energy/      EIA_*, News_* for energy topics

06_Signals/
  signals_* notes written by pullers that evaluate thresholds
```

`newsapi`, `fred`, `eia`, and `socrata` route output by topic or domain, so the final folder depends on the flags you use.

## API Keys

| Key variable | Used by |
|---|---|
| `FRED_API_KEY` | `fred` |
| `ALPHA_VANTAGE_API_KEY` | `alphavantage` |
| `NEWSAPI_API_KEY` | `newsapi` |
| `PATENTSVIEW_API_KEY` | `uspto` |
| `BEA_API_KEY` | `bea` |
| `EIA_API_KEY` | `eia` |
| `FINANCIAL_MODELING_PREP_API_KEY` | `fmp` |
| `SAM_GOV_API_KEY` | `sam` |
| `SOCRATA_APP_TOKEN` | `socrata` |
| `FDA_OPEN_DATA_API_KEY` | Optional for `fda` |

No key is required for `treasury`, `openfema`, `usaspending`, `clinicaltrials`, `arxiv`, `pubmed`, `sec`, and `cboe`.

## PowerShell-Safe Stacks

Run these as separate lines in PowerShell 5.1:

```powershell
# AMR stack
node run.mjs clinicaltrials --amr
node run.mjs pubmed --amr
node run.mjs sec --amr
```

```powershell
# Housing stack
node run.mjs fred --group housing
node run.mjs fred --group rates
node run.mjs sec --housing
node run.mjs playbook housing-cycle
```

```powershell
# Defense stack
node run.mjs arxiv --drones
node run.mjs sec --drones
node run.mjs sec --hypersonics
node run.mjs usaspending --recent
```

```powershell
# Psychedelics stack
node run.mjs pubmed --psychedelics
node run.mjs clinicaltrials --neuro
node run.mjs sec --psychedelics
```

## Known Limitations

| Item | Status | Notes |
|---|---|---|
| `morning-data-pull` task | External | This repo references the scheduled task but does not define it. |
| Playbooks | Limited | `housing-cycle` exists. No `recession-watch` file is present. |
| BLS | Not wired | `BLS_API_KEY` exists in config, but there is no `bls.mjs` puller. |
| USPTO full-text migration | In progress | `uspto --filings` still depends on the current PatentsView migration path. |
| SEC exhibits | Partial | The SEC puller tracks filing metadata and item codes, not Exhibit 99.1 text. |
| NewsAPI topic matching | Narrow | The puller maps the first word of `--topic` to a category on `top-headlines`. |
| Socrata token | Optional | The puller runs without `SOCRATA_APP_TOKEN`, but at lower rate limits. |

## Source of Truth

For future updates, keep these in sync:

1. `scripts/run.mjs` help text
2. `scripts/pullers/*.mjs` flag handling and output paths
3. This guide
