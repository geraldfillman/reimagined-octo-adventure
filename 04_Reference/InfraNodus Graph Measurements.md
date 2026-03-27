---
tags: [reference, graph, infranodus]
---

# InfraNodus Graph Measurements

This vault treats InfraNodus as the measurement layer on top of the Obsidian graph. Obsidian's graph is useful for shape; InfraNodus is useful for cluster detection, bridge discovery, and gap analysis.

## Vault Defaults

The plugin is tuned for this vault's structure:

- `Single page processing`: `[[Wiki Links]] and Concepts`
- `Multi page processing`: `[[Wiki Links]] Prioritized`
- `Link mentions to`: `parent page and others in the same paragraph`
- `Default graph layer`: `topics`
- `Export graph name`: `my_data_*`
- `Export AI context name`: `my_data_ai_*`

Why:

- Single-note analysis needs concepts because thesis notes carry meaning in the body, not only in links.
- Folder analysis should prioritize explicit wiki links so measurement stays anchored to the vault's graph structure.
- Parent-page links make it easier to trace a concept cluster back to the note that owns it.

## What Each Mode Is For

| Mode | Use it for | Main output |
|------|------------|-------------|
| `topics` | Start here for most folder measurements | Dominant clusters and their anchor terms |
| `concepts` | Single-note idea mapping | Salient terms inside one note |
| `gaps` | Missing bridges | Themes that should connect but do not |
| `trends` | Time-based evidence folders | What is changing in recent pull notes |
| `graph` | Final structural check | Raw network shape and weakly connected islands |

## Best Measurement Scopes

| Scope | What to look for | Typical action |
|-------|------------------|----------------|
| `08_Entities/` | Tight sector-country-commodity clusters | Add bridge notes where adjacent clusters barely touch |
| `09_Macro/` | Regime-indicator structure | Add missing parent regime or indicator links |
| `10_Theses/` | Overlapping theses | Merge duplicates or create a stronger parent thesis |
| `05_Data_Pulls/<domain>/` | Repeating evidence terms | Turn repeated signals into a thesis note or signal note |
| `01_Data_Sources/` | Catalog overlap and blind spots | Add missing pullers or mark source redundancy |

## Measurement Workflow

1. Open one folder or one note, not the whole vault.
2. Start in `topics` mode and note the strongest clusters.
3. Switch to `gaps` and identify missing bridge notes, unresolved links, or absent comparative notes.
4. Switch to `graph` to confirm the network shape is real and not a concept-only artifact.
5. Save the result as a Graph Session note with actions.

## CLI Measurement

You can generate an automated session note from the same InfraNodus backend the plugin uses:

```powershell
node run.mjs infranodus --path 10_Theses
node run.mjs infranodus --path 05_Data_Pulls/Government
```

The command writes a dated note to `07_Playbooks/Graph_Sessions/` with topic clusters, gap candidates, concept noise, and follow-up actions.

## Reading The Results

- A strong cluster means the vault already has a coherent theme there.
- A strong bridge node is usually a thesis note, regime note, or major entity that deserves careful maintenance.
- A gap is not automatically a problem; it becomes actionable when two related themes should already be linked for investment reasoning.
- If `topics` is noisy, the underlying notes are usually too table-heavy or inconsistent in naming.

## Writing Notes For Better Measurement

- Prefer canonical `[[Wiki Links]]` over aliases.
- Keep one claim or observation per paragraph or bullet.
- Add a short `TL;DR` and `Key change` section above large tables in pull notes.
- Use the same entity name every time; do not mix `Google`, `Alphabet`, and `GOOGL` unless one is the canonical note.
- When a pull note introduces a new recurring concept, link it to an entity, macro regime, or thesis note immediately.

## Action Thresholds

- Create a bridge note when the same gap appears in two or more measurement sessions.
- Create or repair an entity note when a concept repeats across pull notes but has no canonical `[[Wiki Link]]`.
- Refactor a thesis when it sits in multiple clusters but has weak explicit links.

## Related Notes

- [[Network Graph]]
- [[Graph Conventions]]
- [[Vault_Schemas]]
