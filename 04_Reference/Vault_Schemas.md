---
title: Vault Schemas
type: reference
tags: [reference, schema, validation]
last_updated: 2026-04-02
---

# Vault Schemas

Summary:
- Canonical frontmatter rules for source notes, pull notes, entities, theses, and macro notes.
- Read this before changing schemas, validator logic, or note templates.

## Pull Note Schema

Required fields for notes in `05_Data_Pulls/`:

| Field | Purpose |
| --- | --- |
| `title` | Human-readable note title |
| `source` | Data provider or API name |
| `date_pulled` | Pull date in `YYYY-MM-DD` |
| `domain` | Lowercase domain such as `macro`, `government`, `market`, `housing`, `biotech`, `research`, `energy`, `sectors` |
| `data_type` | Note type such as `snapshot`, `event_list`, `time_series`, `8k_filings`, `sector_scan`, `watchlist_report`, `catalyst_note`, or `full_picture_report` |
| `frequency` | Pull cadence or data cadence |
| `signal_status` | `clear`, `watch`, `alert`, or `critical` |
| `signals` | Array of fired signals, or `[]` |
| `tags` | Array of tags for Dataview and filtering |

Rules:

- Pull notes should live directly under a first-level folder in `05_Data_Pulls/`.
- Filenames should be date-stamped and path-safe: `YYYY-MM-DD_Name.md`.
- Pull notes may add extra fields like `topic`, `symbol`, `record_date`, `lookback_days`, `related_theses`, or `related_pulls`.

## Thesis Schema

Required fields for notes in `10_Theses/`:

| Field | Purpose |
| --- | --- |
| `node_type` | Must be `thesis` |
| `conviction` | `low`, `medium`, or `high` |
| `timeframe` | Holding horizon or thesis timing label |
| `core_entities` | Main linked companies, sectors, or regimes |
| `supporting_regimes` | Macro or thematic regimes that support the thesis |
| `invalidation_triggers` | Concrete conditions that would break the thesis |

Machine-managed thesis fields may also be added by scripts:

| Field Family | Purpose |
| --- | --- |
| `conviction_*` / `suggested_*` | Signal-aware conviction rollup fields from `scan conviction` |
| `fmp_watchlist_*` | Thesis watchlist symbol coverage derived from `core_entities` |
| `fmp_primary_*` | Representative ticker tape and cached-fundamental state from the latest FMP technical and fundamentals context |
| `fmp_next_earnings_*` | Upcoming earnings catalyst timing from the latest FMP calendar pulls |
| `fmp_last_sync` | Last machine sync date for thesis-level FMP fields |

FMP sync fields are written by:

```powershell
node run.mjs thesis-fmp-sync
node run.mjs thesis-fmp-sync --dry-run
node run.mjs thesis-full-picture
node run.mjs thesis-full-picture --thesis "Housing Supply Correction"
```

## Data Source Schema

Required fields for notes in `01_Data_Sources/`:

| Field | Purpose |
| --- | --- |
| `name` | Display name |
| `category` | Must match the top-level folder |
| `type` | Usually `API`, `Dataset`, or `Feed` |
| `provider` | Data owner or publisher |
| `pricing` | `Free`, `Freemium`, `Paid`, or similar |
| `status` | `Active`, `Watching`, `Archived` |
| `priority` | Relative importance |
| `url` | Primary source URL |
| `provides` | Array of data types or outputs |
| `best_use_cases` | Array of intended uses |
| `tags` | Array of tags |
| `related_sources` | Array of related source notes |
| `key_location` | Env var or `None required` |
| `integrated` | Boolean |
| `notes` | Short summary |

Recommended fields for integrated sources:

| Field | Purpose |
| --- | --- |
| `linked_puller` | Matching CLI puller name |
| `update_frequency` | Expected refresh cadence |
| `owner` | Human owner of the note or integration |
| `last_reviewed` | Last schema/content review date |

## Source Categories

The `category` field should match the source folder exactly:

- `Biotech_Healthcare`
- `Climate_Energy`
- `Developer_Code`
- `Frontier_Science`
- `Fundamentals`
- `Geospatial`
- `Government_Contracts`
- `Housing_Real_Estate`
- `Legal_Courts`
- `Macro`
- `Market_Data`
- `News_Media`
- `Prediction_Markets`
- `Private_Markets_VC`
- `Social_Sentiment`
- `Supply_Chain_Trade`

## Validation

Run the validator from `scripts/`:

```powershell
node run.mjs system validate
```

The validator checks:

- Required frontmatter on source notes and pull notes
- Source note category alignment with folders
- Boolean `integrated` values
- Valid `signal_status` values
- Pull note layout issues such as nested files under `05_Data_Pulls/`
- Required thesis fields plus machine-managed conviction and FMP field validation

## Company Risk Schemas

### Company Risk (`12_Company_Risk/Companies/`)

| Field | Purpose |
| --- | --- |
| `node_type` | Must be `company_risk` |
| `ticker` | Exchange ticker or empty string |
| `sector` | Sector label |
| `status` | `Watchlist`, `Active`, or `Archived` |
| `risk_score` | Integer 0–100 (Regulatory 0–40, Sentiment 0–25, Fundamental 0–35) |
| `gap_score` | `Low`, `Medium`, or `High` — narrative vs. reality gap |
| `last_updated` | Date of last manual review (YYYY-MM-DD) |
| `core_entities` | Wikilinked related risk entities |
| `pattern_matches` | Wikilinked pattern notes |
| `tags` | Must include `company-risk` |

Risk bands: 0–19 Normal · 20–39 Watchlist · 40–59 Elevated · 60+ High Priority

### Risk Event (`12_Company_Risk/Events/`)

| Field | Purpose |
| --- | --- |
| `node_type` | Must be `risk_event` |
| `date` | Event date in `YYYY-MM-DD` |
| `event_type` | `Regulatory`, `Sentiment`, `Financial`, or `Governance` |
| `company` | Plain name of the related company |
| `severity` | `Low`, `Medium`, or `High` |
| `source` | Data source or publication |
| `link` | URL or reference |
| `confidence` | `Low`, `Medium`, or `High` |
| `pattern_matches` | Wikilinked pattern notes |
| `tags` | Must include `risk-event` |

Filenames: `YYYY-MM-DD - Event Title.md`

### Risk Pattern (`12_Company_Risk/Patterns/`)

| Field | Purpose |
| --- | --- |
| `node_type` | Must be `risk_pattern` |
| `pattern_type` | `Financial`, `Governance`, `Narrative`, or `Structural` |
| `severity` | `Low`, `Medium`, or `High` |
| `tags` | Must include `risk-pattern` |

Filenames: `Pattern - Name.md`

### Risk Entity (`12_Company_Risk/Entities/`)

| Field | Purpose |
| --- | --- |
| `node_type` | Must be `risk_entity` |
| `entity_type` | `Company`, `Person`, or `Fund` |
| `known_connections` | Wikilinked company and entity notes |
| `tags` | Must include `risk-entity` |

## Company Intel Schemas

Method reference: `04_Reference/EDGAR_Company_Deconstruction_Framework.md`.

### Company Dossier (`13_Company_Intel/Companies/`)

| Field | Purpose |
| --- | --- |
| `node_type` | Must be `company_intel` |
| `company` | Company display name |
| `ticker` | Exchange ticker |
| `cik` | SEC CIK (string, zero-padded ok) |
| `sector` | Sector label (SIC description or GICS-style) |
| `fiscal_year_end` | e.g. `12-31` or SEC `fiscalYearEnd` format |
| `research_status` | `Scaffold`, `Card`, `Baseline`, `Active`, or `Archived` |
| `confidence` | `Low`, `Medium`, or `High` |
| `overall_state` | `green`, `yellow`, `orange`, or `red` (framework §12.5) |
| `one_liner` | The bare-bones one-sentence description (surfaced on dashboards) |
| `last_updated` | Date of last manual review (YYYY-MM-DD) |
| `clarity_score` | 0–25 (§12.1) — blank until scored |
| `economic_quality_score` | 0–35 (§12.2) — blank until scored |
| `governance_score` | 0–35 (§12.3) — blank until scored |
| `disclosure_score` | 0–35 (§12.4) — blank until scored |
| `evolution_score` | 0–50 for the latest material initiative (§4.5) — blank until scored |
| `core_entities` | Wikilinks to `08_Entities/` notes |
| `related_theses` | Wikilinks to `10_Theses/` notes |
| `tags` | Must include `company-intel` |

Filenames: `TICKER - Dossier.md`. Dossiers are living notes updated in place (unlike pull notes).

### Intel Finding (`13_Company_Intel/Findings/`)

| Field | Purpose |
| --- | --- |
| `node_type` | Must be `intel_finding` |
| `date` | Finding date in `YYYY-MM-DD` |
| `company` | Plain company name |
| `ticker` | Exchange ticker |
| `classification` | One of: `strengthens-core`, `weakens-core`, `expands-adjacent-capability`, `creates-new-engine`, `improves-moat`, `reduces-dependency`, `adds-dependency`, `improves-economics`, `reduces-cash-quality`, `increases-complexity`, `changes-control`, `raises-financing-risk`, `raises-disclosure-risk`, `unresolved` |
| `machine_effect` | `revenue`, `cost`, `asset`, `capability`, `dependency`, `bottleneck`, `flywheel`, `control`, `financing`, or `disclosure` |
| `thesis_impact` | `no-change`, `monitor`, `positive-revision`, `negative-revision`, or `thesis-broken` |
| `evidence_filing` | Exact filing, section, table, note, or exhibit |
| `source_link` | EDGAR URL or reference |
| `related_theses` | Wikilinks to affected thesis notes |
| `tags` | Must include `intel-finding` |

Filenames: `YYYY-MM-DD - TICKER - Short Title.md`

### Edgar Pull Notes (`05_Data_Pulls/Edgar/`)

Written by the `edgar` CLI group (`edgar baseline`, `edgar facts`). Standard pull-note schema with `domain: edgar`, `data_type: filing_baseline` or `financial_skeleton`, plus `symbol` and `cik` extras.

### Risk Transaction (`12_Company_Risk/Transactions/`)

| Field | Purpose |
| --- | --- |
| `node_type` | Must be `risk_transaction` |
| `date` | Transaction date in `YYYY-MM-DD` |
| `transaction_type` | `Cash`, `Equity`, or `Asset Transfer` |
| `company` | Plain name of the primary company |
| `entities_involved` | Wikilinked entity notes |
| `confidence` | `Low`, `Medium`, or `High` |
| `pattern_matches` | Wikilinked pattern notes |
| `tags` | Must include `risk-transaction` |

Filenames: `YYYY-MM-DD - Description.md`
