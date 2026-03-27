---
title: Vault Schemas
updated: 2026-03-26
tags: [reference, schema, validation]
---

# Vault Schemas

This document defines the canonical frontmatter used by the validator and the pull system.

## Pull Note Schema

Required fields for notes in `05_Data_Pulls/`:

| Field | Purpose |
| --- | --- |
| `title` | Human-readable note title |
| `source` | Data provider or API name |
| `date_pulled` | Pull date in `YYYY-MM-DD` |
| `domain` | Lowercase domain such as `macro`, `government`, `market`, `housing`, `biotech`, `research`, `energy` |
| `data_type` | Note type such as `snapshot`, `event_list`, `time_series`, `8k_filings` |
| `frequency` | Pull cadence or data cadence |
| `signal_status` | `clear`, `watch`, `alert`, or `critical` |
| `signals` | Array of fired signals, or `[]` |
| `tags` | Array of tags for Dataview and filtering |

Rules:

- Pull notes should live directly under a first-level folder in `05_Data_Pulls/`.
- Filenames should be date-stamped and path-safe: `YYYY-MM-DD_Name.md`.
- Pull notes may add extra fields like `topic`, `symbol`, `record_date`, `lookback_days`, or `related_pulls`.

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
node run.mjs validate
```

The validator checks:

- Required frontmatter on source notes and pull notes
- Source note category alignment with folders
- Boolean `integrated` values
- Valid `signal_status` values
- Pull note layout issues such as nested files under `05_Data_Pulls/`
