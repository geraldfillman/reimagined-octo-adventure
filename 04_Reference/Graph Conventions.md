---
title: Graph Conventions
type: reference
tags: [reference, conventions, graph]
last_updated: 2026-03-27
---

# Network Graph Conventions

Summary:
- Link protocol for the three-layer research graph: macro, entities, and theses.
- Read this before renaming graph nodes, changing wiki links, or editing graph-facing templates.

## Architecture

The network graph system organizes investment knowledge into three layers:

```text
Layer 1: Macro (09_Macro/)
  Regimes -> Indicators
  e.g., [[Stagflation]] -> [[CPI]], [[PMI]], [[GDP Growth]]

Layer 2: Entities (08_Entities/)
  Sectors, Countries, Commodities, Stocks, ETFs, Currencies
  e.g., [[Tech Sector]] -> [[AAPL]], [[USA]], [[Lithium]]

Layer 3: Theses (10_Theses/)
  Trade ideas linking entities + macro
  e.g., "Energy Supercycle" -> [[Oil]], [[XOM]], [[Saudi Arabia]], [[Inflationary Boom]]
```

## How Graph Edges Are Created

### 1. Frontmatter Wiki Links

```yaml
bullish_drivers: ["[[Rate Cut Cycle]]", "[[Weak USD]]"]
bearish_drivers: ["[[Recession]]", "[[China Slowdown]]"]
related_entities: ["[[AAPL]]", "[[Tech Sector]]"]
sector: "[[Tech Sector]]"
country: "[[USA]]"
```

These create real graph edges and stay queryable in Dataview.

### 2. Inline Wiki Links

```markdown
## Bullish Factors
- [[Rate Cut Cycle]] lowers discount rates, boosting growth valuations
- [[AI Integration]] drives Services revenue growth
```

Use inline links for narrative context around a note's main relationships.

### 3. Directional Tags

```text
#bullish-for/AAPL
#bearish-for/XOM
```

Use these sparingly for lightweight sentiment tagging when a full note would be excessive.

### 4. Bridge Notes

For complex multi-entity relationships, create a thesis note in `10_Theses/` that links all related entities, regimes, and indicators together.

## Frontmatter Schema

Every note in the network should have:

| Field | Purpose | Example |
|-------|---------|---------|
| `node_type` | Identifies the note type | `stock`, `sector`, `regime` |
| `status` | Current relevance | `Active`, `Watching`, `Archived` |
| `bullish_drivers` | What helps this entity | `["[[Rate Cut Cycle]]"]` |
| `bearish_drivers` | What hurts this entity | `["[[Recession]]"]` |
| `related_entities` | Related nodes | `["[[AAPL]]", "[[Tech Sector]]"]` |
| `tags` | Categorization | `[stock]`, `[macro, regime]` |

## Graph View Color Legend

| Color | Node Type | Folder |
|-------|-----------|--------|
| Blue | Stocks | `08_Entities/Stocks/` |
| Light Blue | ETFs | `08_Entities/ETFs/` |
| Green | Sectors | `08_Entities/Sectors/` |
| Orange | Countries | `08_Entities/Countries/` |
| Gold | Commodities | `08_Entities/Commodities/` |
| Teal | Currencies | `08_Entities/Currencies/` |
| Purple | Macro Regimes | `09_Macro/Regimes/` |
| Light Purple | Macro Indicators | `09_Macro/Indicators/` |
| Magenta | Theses | `10_Theses/` |

## Adding New Nodes

1. Use the appropriate template from `03_Templates/`.
2. Fill in the frontmatter, especially `bullish_drivers`, `bearish_drivers`, and `related_entities`.
3. Add inline wiki links in the body for narrative context.
4. Check the graph view to verify connections appear.

## Bidirectional Linking

When linking entity A to entity B, try to add the link in both notes:

- `AAPL.md` -> `sector: "[[Tech Sector]]"`
- `Tech Sector.md` -> `key_stocks: ["[[AAPL]]"]`

This creates stronger graph edges and ensures both notes show backlinks.

## Macro Hierarchy

Tier 1, regimes:
- `key_indicators` links down to indicators.

Tier 2, indicators:
- `parent_regimes` links up to regimes.
- `affects_sectors` and `affects_commodities` link across to entities.

## Templates Available

| Template | Location | Use For |
|----------|----------|---------|
| Stock | `03_Templates/Stock.md` | Individual equities |
| Sector | `03_Templates/Sector.md` | Sector notes |
| Country | `03_Templates/Country.md` | National economies |
| Commodity | `03_Templates/Commodity.md` | Raw materials |
| Macro Regime | `03_Templates/Macro_Regime.md` | Market environments |
| Macro Indicator | `03_Templates/Macro_Indicator.md` | Economic data points |
| Thesis | `03_Templates/Thesis.md` | Trade ideas |

## InfraNodus-Ready Notes

- Use canonical `[[Wiki Links]]` in both frontmatter and body text.
- Keep one observation per paragraph or bullet when possible.
- Add a short summary above large tables so concept extraction has readable text.
- Prefer bridge notes in `10_Theses/` when connecting multiple entities and macro regimes.
- Save measurement takeaways in a Graph Session note so graph findings become durable notes.
