# Agent Instructions — Obsidian Vault Cleanup Implementation

## Purpose

You are cleaning up an Obsidian-based research and terminal-automation project whose CLI has grown broad, inconsistent, and harder to navigate over time. Your job is **not** to rewrite everything at once. Your job is to reduce confusion, improve maintainability, preserve working behavior, and create a cleaner structure for future growth.

This project currently shows several cleanup signals:

- the CLI mixes flat commands, nested commands, utilities, workflows, playbooks, pullers, and a separate Qlib subsystem in one root help surface
- the command surface is too crowded for fast operator understanding
- naming conventions are inconsistent
- some commands and examples appear duplicated or mixed in style
- topic-specific flags are hardcoded in multiple places instead of being driven by a shared registry
- some commands emphasize implementation details instead of operator intent
- write behavior, dry-run behavior, and output expectations are not always consistently presented

Use these instructions to perform a safe, staged cleanup.

---

## Primary Objectives

1. **Preserve working behavior first**
   - Do not break existing workflows if a compatibility shim or alias can preserve them.
   - Avoid destructive refactors that force the vault owner to relearn the tool in one pass.

2. **Improve information architecture**
   - Reorganize the CLI into clearer namespaces and command families.
   - Make the root help read like a map, not a dump of the entire command inventory.

3. **Standardize conventions**
   - Normalize command naming, option naming, examples, output modes, and side-effect signaling.
   - Make similar commands feel like they belong to the same project.

4. **Reduce future maintenance burden**
   - Replace repeated hardcoded topic flags with registries/config-driven definitions where practical.
   - Create one obvious place to add new pullers, research topics, or workflow modules.

5. **Protect vault integrity**
   - Do not rename folders, note paths, frontmatter keys, or generated note types unless explicitly instructed by the migration plan.
   - Obsidian links, note references, dashboards, and scripts must continue to work.

---

## Non-Goals

Do **not** do the following unless explicitly asked:

- do not redesign thesis content itself
- do not rewrite every script from scratch
- do not delete historical notes or generated research artifacts outside approved cleanup scopes
- do not change vault folder conventions casually
- do not remove backward-compatible aliases until deprecation rules are in place
- do not silently change note schemas

---

## Operating Principles

### 1. Prefer staged migration over big-bang rewrites
Every meaningful cleanup should happen in phases:

- audit
- design target structure
- implement compatibility layer
- migrate help/docs
- migrate internals
- deprecate old entry points later

### 2. Keep operator trust high
Whenever a command writes files, edits notes, updates frontmatter, starts a server, or calls external APIs, that behavior must be obvious.

### 3. Make the CLI readable at three altitudes
The tool should be understandable at:
- root level
- group level
- leaf command level

### 4. Every new abstraction must reduce complexity
Do not introduce architecture theater. If a new wrapper, registry, or factory adds mental weight without reducing duplication or improving extensibility, skip it.

### 5. Optimize for future-you in six months
Assume the maintainer will forget why something was named or routed a certain way. Leave durable structure and notes.

---

## Current-State Problems to Correct

Treat the following as active cleanup targets:

### A. Root help is overloaded
The root help currently mixes utilities, workflows, playbooks, pullers, and Qlib in one long stream. This makes discovery harder and increases operator fatigue.

### B. Command grammar is inconsistent
The current interface mixes:
- flat commands
- category-prefixed commands
- special-case subcommands

This creates friction because the user must infer grammar instead of learning one pattern.

### C. Names reflect mixed abstraction levels
Some names represent:
- data sources
- workflows
- note outputs
- internal integration details
- domain concepts

This makes the command catalog feel uneven.

### D. Hardcoded topic flags are multiplying
Topic-specific switches such as research themes and thesis flags should not be hand-expanded across multiple pullers if a registry can define them once.

### E. Side effects are not consistently surfaced
Commands should clearly communicate whether they:
- only read
- read APIs
- write notes
- rewrite frontmatter
- delete or prune generated files
- support dry-run
- support JSON output

### F. Qlib behaves like a second product
Quant commands should either live under a clean namespace or eventually be split into a separate executable if they remain large and specialized.

---

## Target Command Model

Refactor the command surface toward a grouped model like this:

```text
mydata system status
mydata system validate
mydata system dashboard
mydata system cleanup

mydata learn session
mydata learn review

mydata scan sectors
mydata scan company-risk
mydata scan conviction

mydata thesis sync
mydata thesis catalysts
mydata thesis full-picture

mydata pull fred
mydata pull fmp quote
mydata pull fmp technical
mydata pull sec filings
mydata pull pubmed
mydata pull arxiv

mydata playbook housing-cycle

mydata quant setup
mydata quant status
mydata quant universe
mydata quant factors
mydata quant score
mydata quant backtest
mydata quant sim
mydata quant refresh
```

### Rules for this model

- Group names should describe the **kind of task**
- Leaf names should describe the **specific action**
- Root should only show groups and a few representative examples
- Group help should show available commands and common usage
- Leaf help should show options, examples, side effects, and defaults

---

## Naming Rules

Apply these rules consistently.

### Commands
- use lowercase kebab-case for leaf commands when needed
- prefer short plain-English verbs or nouns
- avoid names that expose implementation quirks unless necessary

### Options
- singular for one value: `--ticker`
- plural for multiple values: `--tickers`
- use `--from` and `--to` for ranges
- use `--limit` for list size
- use `--output` for output format
- use `--dry-run` for preview-only mode
- use `--json` only for machine-readable output
- use `--write` or `--apply` only when a command is otherwise read-first

### Examples
- every command should have at least one short example
- all examples must use the same canonical invocation style
- do not mix `node run.mjs ...` and another executable form in public-facing help once a canonical binary exists

---

## Cleanup Workstreams

## Workstream 1 — Audit and Inventory

### Goal
Create a structured inventory of the existing command surface and behavior.

### Required outputs
Create a note such as:

`90_System/CLI Command Audit.md`

Include:
- command name
- current category
- actual purpose
- reads APIs? yes/no
- writes notes? yes/no
- rewrites frontmatter? yes/no
- destructive/pruning behavior? yes/no
- supports dry-run? yes/no
- supports json? yes/no
- proposed new namespace
- compatibility alias required? yes/no
- status: keep / rename / regroup / deprecate

### Agent rules
- do not infer behavior carelessly from names alone
- inspect implementation before classifying side effects
- identify duplicate or overlapping commands
- identify commands that belong together but are currently separated

---

## Workstream 2 — Root Help Redesign

### Goal
Shrink root help into a navigational layer.

### Requirements
Root help should include:
- tool name
- one canonical usage line
- command groups
- 4 to 8 examples
- one line telling the user how to access group help

### Root help should NOT include
- every topic flag
- every research theme
- long option lists for leaf commands
- deep Qlib option details
- repeated examples

### Example target shape

```text
MyData CLI

Usage:
  mydata <group> <command> [options]

Groups:
  system    Status, validation, dashboard, cleanup
  learn     Learning sessions and reviews
  scan      Sector, company-risk, conviction workflows
  thesis    Thesis sync, catalysts, full-picture reports
  pull      External datasets and pullers
  playbook  Multi-step workflows
  quant     Quant research and simulation tools

Examples:
  mydata system status
  mydata learn session --candidate 5 --topic-id macro-rate-transmission
  mydata scan sectors --sector industrials --dry-run
  mydata pull fmp quote --tickers AAPL,MSFT
  mydata quant sim --thesis semis --summary-only

Run `mydata <group> --help` for more.
```

---

## Workstream 3 — Namespace and Routing Cleanup

### Goal
Move commands into coherent families without breaking current usage.

### Requirements
- create grouped command routers or dispatchers
- preserve old entry points as aliases where feasible
- log or print deprecation notices for legacy forms
- ensure legacy commands still map to the same internal handler until migration is complete

### Compatibility rules
For old commands:
- support them during transition
- print a deprecation hint like:
  - `Deprecated: use "mydata scan company-risk" instead of "company-risk-scan"`
- do not remove old commands until:
  - docs are updated
  - aliases exist
  - smoke tests pass
  - at least one release cycle passes

---

## Workstream 4 — Topic Registry Refactor

### Goal
Replace repeated hardcoded thematic flags with one shared registry.

### Create a registry file
Suggested path:

`config/topics.yaml`

Suggested schema:

```yaml
topics:
  drones:
    label: Drones
    tags: [uas, unmanned systems, drone]
    enabled_pullers: [arxiv, sec, pubmed]
    thesis_keywords: [drone, uas, autonomy]
  defense:
    label: Defense
    tags: [defense, military, weapons]
    enabled_pullers: [arxiv, sec, sam, usaspending]
  glp1:
    label: GLP-1
    tags: [glp1, obesity, metabolic]
    enabled_pullers: [arxiv, pubmed, clinicaltrials]
```

### Rules
- do not define topics separately in multiple pullers unless absolutely necessary
- pullers should query the registry instead of each having their own custom switch forest
- allow commands like:
  - `mydata pull arxiv --topic drones`
  - `mydata pull sec --topic defense`
- validate unknown topics and return helpful errors

---

## Workstream 5 — Side-Effect Transparency

### Goal
Make write/read behavior obvious everywhere.

### Every leaf command help should expose
- reads external API
- writes vault notes
- updates frontmatter
- deletes/prunes generated files
- supports dry-run
- supports json

### Example format
```text
Effects:
  Reads external APIs: yes
  Writes vault notes: yes
  Rewrites frontmatter: no
  Destructive cleanup: no
  Supports --dry-run: yes
  Supports --json: yes
```

### Rules
- never let a mutating command appear read-only
- default to safest behavior when ambiguity exists
- destructive cleanup must require explicit flags

---

## Workstream 6 — Cleanup Command Hardening

### Goal
Make cleanup safe, inspectable, and recoverable.

### Required features
- dry-run must be first-class and easy to use
- output should clearly show:
  - files matched
  - files to keep
  - files to archive
  - files to delete
  - reasons for each decision
- create optional archive mode before delete mode

### Preferred cleanup flow
1. scan
2. preview
3. archive
4. verify
5. optional delete

### Do not
- directly delete files on first implementation unless the cleanup scope is extremely narrow and well-tested
- prune notes that are user-authored unless the command explicitly targets generated artifacts only

### Suggested cleanup strategy
Use three modes:
- `--dry-run`
- `--archive`
- `--delete`

If `--delete` exists, it should only operate on known generated notes or files.

---

## Workstream 7 — Documentation and Vault Notes

### Goal
Make the vault itself explain the tool.

### Required notes
Create or update:

- `90_System/CLI Overview.md`
- `90_System/CLI Command Audit.md`
- `90_System/CLI Migration Map.md`
- `90_System/Topic Registry.md`
- `90_System/Agent Cleanup Log.md`

### Documentation expectations
`CLI Overview.md`
- what the CLI is for
- command groups
- canonical invocation
- common workflows

`CLI Migration Map.md`
- old command
- new command
- compatibility status
- deprecation timing
- notes

`Agent Cleanup Log.md`
- timestamp
- action taken
- files changed
- why
- rollback notes if needed

---

## Workstream 8 — Tests and Validation

### Goal
Prevent cleanup from breaking working vault flows.

### Minimum test expectations
- root help renders
- each group help renders
- each migrated command resolves
- old aliases still resolve
- dry-run commands do not write files
- write commands create expected note paths
- cleanup commands never touch user-authored notes outside approved generated scopes
- topic registry lookups work across enabled pullers
- quant namespace still functions after routing changes

### Add smoke tests for
- `status`
- `validate`
- `cleanup --dry-run`
- one scan command
- one thesis command
- one pull command
- one quant command

### Add regression tests for
- duplicate help entries
- mixed invocation examples
- missing defaults in help
- inconsistent option names

---

## Workstream 9 — Obsidian-Specific Guardrails

### Protect these at all times
- wiki links
- note paths used in dashboards
- frontmatter keys used by Dataview or dashboards
- folder paths assumed by scripts
- generated note naming conventions
- attachments and embedded references

### Before changing note paths or filenames
- search the vault for backlinks
- search scripts for hardcoded paths
- search dashboards, queries, and templates
- record any migration mapping in `CLI Migration Map.md`

### If renaming is necessary
- create migration notes
- preserve aliases or redirects where possible
- batch-update links safely
- validate Dataview and dashboard queries afterward

---

## Implementation Sequence

Follow this exact order unless blocked.

### Phase 1 — Audit
- inventory all commands
- classify side effects
- identify duplicates and naming inconsistencies
- identify likely namespace targets

### Phase 2 — Design
- define final command tree
- define naming rules
- define topic registry schema
- define help-output templates
- define compatibility mapping

### Phase 3 — Safe Routing
- implement grouped dispatch
- add aliases for legacy commands
- keep behavior unchanged
- add deprecation messages

### Phase 4 — Help and Docs
- rewrite root help
- create group help
- rewrite leaf help progressively
- update vault docs

### Phase 5 — Registry Refactor
- replace duplicated thematic flags where practical
- migrate pullers to registry-backed topic resolution
- verify unchanged behavior for core topics

### Phase 6 — Cleanup Hardening
- improve cleanup preview output
- add archive-first mode if missing
- verify generated-only deletion boundaries
- test retention rules carefully

### Phase 7 — Validation
- run smoke tests
- run regression tests
- verify Obsidian links, dashboards, and note generation

### Phase 8 — Deprecation Planning
- document old-to-new mapping
- keep aliases active
- mark eventual removals
- do not remove legacy entry points until explicitly approved

---

## Acceptance Criteria

The cleanup is successful when all of the following are true:

1. Root help is concise and navigational.
2. Commands are grouped into coherent namespaces.
3. Legacy commands still work through aliases or adapters.
4. Duplicate and confusing help entries are removed.
5. Option conventions are standardized across major commands.
6. Topic handling is more centralized and less repetitive.
7. Cleanup commands are safer and more transparent.
8. Documentation inside the vault explains the structure clearly.
9. Obsidian note links, dashboards, and schemas continue to function.
10. Tests cover the main workflows and prevent regressions.

---

## Red Flags

Pause and document before proceeding if you discover any of the following:

- multiple commands write to the same note paths with incompatible schemas
- folder names are used as implicit business logic throughout the codebase
- dashboards depend on undocumented frontmatter keys
- cleanup rules cannot reliably distinguish generated notes from authored notes
- quant commands rely on a separate runtime that the main CLI does not validate
- command routing is tightly coupled to help text formatting
- topic flags are implemented differently across pullers in incompatible ways

---

## Preferred Output Style for the Agent

When making progress, log actions in a compact structured format like:

```markdown
### 2026-04-04 10:30
- Audited root help and identified duplicate `learning-session` entry
- Grouped commands into provisional namespaces: system, learn, scan, thesis, pull, playbook, quant
- No file deletions performed
- Next: create compatibility map and rewrite root help
```

---

## Final Rule

Do not try to make the project look “clean” by hiding complexity. Make it genuinely easier to understand, safer to operate, and cheaper to extend.
