# My_Data Vault

An Obsidian-based investment research system covering housing, biotech, defense, energy, and macro. The vault combines data ingestion (18 API pullers), signal detection (4-tier severity), knowledge graphs (InfraNodus), and thesis-driven analysis across 18 active investment theses.

## Folder Structure

| Folder | Purpose |
|--------|---------|
| `00_Dashboard/` | 8 Dataview dashboards — start here for any overview |
| `01_Data_Sources/` | 64 source definitions across 16 categories |
| `02_Projects/` | Active project tracking |
| `03_Templates/` | 11 canonical templates for all note types |
| `04_Reference/` | Schema docs, graph conventions, pull system guide |
| `05_Data_Pulls/` | Timestamped pull notes from API pullers (90+ notes) |
| `06_Signals/` | Discrete signal notes when thresholds fire |
| `07_Playbooks/` | Execution playbooks + Graph Sessions subfolder |
| `08_Entities/` | Stocks (46), Sectors (12), Countries (8), Commodities (7), ETFs, Currencies |
| `09_Macro/` | Indicators (17) and Regimes (9) |
| `10_Theses/` | 18 investment theses with conviction tracking |
| `scripts/` | Node.js automation (pullers, validator, InfraNodus) |

## Frontmatter Schemas

All schemas are defined in `04_Reference/Vault_Schemas.md`. Key rules:

- **Data Sources** (`01_Data_Sources/`): Must have `name`, `category` (matches folder name), `type`, `provider`, `pricing`, `status`, `priority`, `url`, `provides[]`, `integrated` (boolean)
- **Pull Notes** (`05_Data_Pulls/`): Must have `title`, `source`, `date_pulled` (YYYY-MM-DD), `domain`, `data_type`, `frequency`, `signal_status` (clear|watch|alert|critical), `signals[]`, `tags[]`
- **Entities** (`08_Entities/`): Must have `node_type`, `status`, `bullish_drivers[]`, `bearish_drivers[]`, `related_entities[]`
- **Theses** (`10_Theses/`): Must have `node_type: "thesis"`, `conviction` (high|medium|low), `timeframe`, `core_entities[]`, `supporting_regimes[]`, `invalidation_triggers[]`
- **Macro Indicators** (`09_Macro/Indicators/`): Must have `node_type: "indicator"`, `parent_regimes[]`, `affects_sectors[]`
- **Macro Regimes** (`09_Macro/Regimes/`): Must have `node_type: "regime"`, `key_indicators[]`, `favors_sectors[]`, `hurts_sectors[]`

## Naming Conventions

- Pull notes: `YYYY-MM-DD_Name.md` (date-stamped, path-safe)
- Entity files: Match the canonical name (e.g., `AAPL.md`, `Tech Sector.md`)
- Source categories must match folder names exactly (see `04_Reference/Vault_Schemas.md` for the 16 valid categories)

## Wiki Links & Graph Connectivity

Use `[[wikilinks]]` in frontmatter arrays to create graph edges:
```yaml
bullish_drivers: ["[[Rate Cut Cycle]]", "[[Weak USD]]"]
core_entities: ["[[DHI]]", "[[LEN]]", "[[Housing]]"]
parent_regimes: ["[[Rate Cut Cycle]]"]
```

See `04_Reference/Graph Conventions.md` for the full linking protocol.

## Pull System (CLI)

All commands run from `scripts/`:

```powershell
node run.mjs help              # Show all commands
node run.mjs status            # Check API key configuration
node run.mjs validate          # Run vault schema validator
node run.mjs fred --group rates     # Pull macro data
node run.mjs sec --thesis           # Pull SEC 8-K filings for thesis tickers
node run.mjs infranodus --path 10_Theses  # Run InfraNodus graph measurement
node run.mjs playbook housing-cycle       # Run housing cycle playbook
```

Morning sequence (17 commands) is documented in `04_Reference/Pull_System_Guide.md`.

### API Keys

Required keys are in `.env` (never commit). Run `node run.mjs status` to check. Key pullers and their requirements:

| Puller | Key Variable | Required? |
|--------|-------------|-----------|
| fred | `FRED_API_KEY` | Yes |
| alphavantage | `ALPHA_VANTAGE_API_KEY` | Yes |
| bea | `BEA_API_KEY` | Yes |
| eia | `EIA_API_KEY` | Yes |
| newsapi | `NEWSAPI_API_KEY` | Yes |
| sam | `SAM_GOV_API_KEY` | Yes |
| fmp | `FINANCIAL_MODELING_PREP_API_KEY` | Yes |
| uspto | `PATENTSVIEW_API_KEY` | Yes |
| treasury, openfema, usaspending, clinicaltrials, arxiv, pubmed, sec, cboe | None | No |

## InfraNodus Integration

Graph measurement workflow is documented in `04_Reference/InfraNodus Graph Measurements.md`.

- Run `node run.mjs infranodus --path <scope>` to generate a graph session note
- Sessions are saved to `07_Playbooks/Graph_Sessions/`
- Best scopes: `10_Theses/`, `08_Entities/`, `09_Macro/`, `05_Data_Pulls/<domain>/`
- Plugin defaults: Wiki Links Prioritized for folders, Wiki Links + Concepts for single notes

## Signal System

Pull notes fire signals at 4 severity levels: `clear`, `watch`, `alert`, `critical`. The Signal Board dashboard (`00_Dashboard/Signal Board.md`) aggregates all non-clear signals. Discrete signal notes in `06_Signals/` document significant events with implications and related domains.

## Dashboards

All dashboards use Dataview queries against frontmatter fields. They render automatically in Obsidian with the Dataview plugin enabled. Key dashboards:

- **Signal Board** — Active alerts and watch items across all domains
- **Cross-Domain Thesis Board** — Multi-domain signal convergence
- **Data Freshness Monitor** — Stale data detection
- **Macro Regime Tracker** — Rate, labor, inflation, GDP data
- **Network Graph** — Entity connectivity and orphan detection
- **InfraNodus Measurements** — Graph session entry point and hub/bridge analysis

## Validation

Run `node run.mjs validate` before committing. The validator checks required frontmatter fields, category alignment, boolean types, valid signal_status values, and pull note file layout.

## Immutability

When working with vault data, always create new notes rather than overwriting existing pull notes. Pull notes are timestamped snapshots — historical data is preserved, not updated in place.
