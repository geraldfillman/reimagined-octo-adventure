# AGENT_Vault_Improvements.md

## Purpose

Improve the Obsidian vault as a structured operating environment for research, thesis monitoring, signal review, and agent-assisted navigation.

This agent focuses on the **research side of the vault**, not the learning UI.

The learning system in `11_Learning/` should remain checkpoint-based, progression-based, and unlock-driven. Research improvements should apply to the research system only.

---

## Boundary Rule

### Research system
Should be:
- interactive
- investigative
- synthesis-oriented
- easy for agents to reference
- easy for humans to review and challenge

### Learning system
Should remain:
- staged
- checkpoint-based
- script-driven
- unlock-oriented
- separate from research conversation areas

Do not merge these modes.

---

## Current Context

The vault already includes:
- MOCs
- dashboards
- thesis notes
- signal notes
- pull notes
- entity and macro structures
- CLI pullers
- sector scan
- conviction delta
- scorecard updates
- graph-session workflows
- a separate `11_Learning/` workspace

This improvement plan should build on that structure rather than replacing it.

---

## Main Objective

Make the research vault easier for:
- **agents** to retrieve clean context, extend notes, and identify next actions
- **humans** to quickly review changes, inspect evidence, spot gaps, and verify what has actually been reviewed

The goal is not only more data. The goal is better interaction, traceability, and synthesis.

---

## Priority Improvements to Implement

## 1. Unanswered Questions System
Create a first-class note type for unresolved questions.

Each question note should support:
- linked thesis or sector
- question type
- why it matters
- blockers
- suggested next evidence source
- urgency
- owner: human, agent, or open
- status: open, in review, resolved, stale

### Why this matters
- captures what still needs work
- gives agents explicit follow-up targets
- gives humans a clean steering queue
- reduces the chance that unresolved issues vanish into note sprawl

---

## 2. Briefing Packs
Create compact, auto-assembled context packs for recurring workflows.

Suggested pack types:
- thesis pack
- company pack
- sector pack
- macro pack
- catalyst pack

Each pack should contain:
- short summary
- current state
- recent signals
- recent contradictions
- open questions
- key source links
- related entities
- next review items

### Why this matters
- makes retrieval cleaner for agents
- reduces note-jumping for humans
- supports faster handoff and review

---

## 3. What Changed Since Last Review Dashboard
Build a dashboard specifically for delta review.

Show only:
- new signals
- changed conviction
- new contradictions
- new catalysts
- thesis status changes
- new cross-thesis links
- items not yet human-reviewed

### Why this matters
- humans review change instead of rereading everything
- agents can prioritize fresh material
- improves daily operating rhythm

---

## 4. Thesis Timeline Views
Add a visible progression layer to thesis notes.

Track:
- creation date
- major revisions
- signal milestones
- contradiction milestones
- score or conviction shifts
- linked catalyst events
- last human review
- next expected review

This should sit above immutable pull notes rather than replace them.

### Why this matters
- preserves narrative continuity
- improves auditability
- gives agents temporal context

---

## 5. Signal Trace / Evidence Ladder
Make major conclusions traceable.

Recommended chain:
- dashboard card
- thesis field
- signal note
- pull note
- original source

### Why this matters
- improves trust
- reduces black-box behavior
- helps both humans and agents validate conclusions quickly

---

## 6. Cross-Thesis Collision Board
Create a board that highlights when one event or development affects multiple theses.

Possible fields:
- event or signal
- linked theses
- collision type
- first-order effect
- second-order effect
- confidence
- review priority

### Why this matters
- supports systems thinking
- encourages non-obvious synthesis
- helps identify cross-domain opportunity or risk

---

## 7. Reading Modes for Human Review
Support multiple ways to consume the same object.

Suggested modes:
- skim mode
- analyst mode
- audit mode

### Why this matters
- supports fast review and deep review
- keeps one source of truth while improving usability
- reduces friction without duplicating notes

---

## 8. Bridge Note Suggestions
Extend bridge-note support so the system can suggest missing links.

Examples:
- macro signal with no linked thesis
- company catalyst with no sector bridge
- repeated entity with no synthesis note
- two theses sharing evidence with no cross-reference

Suggested outputs:
- proposed bridge title
- why it is suggested
- source notes involved
- confidence score
- approve / reject / defer state

### Why this matters
- improves graph usefulness
- helps agents surface weakly connected ideas
- supports original synthesis rather than passive storage

---

## 9. Human Review Receipt
Add a light review stamp to high-value notes.

Suggested fields:
- reviewed_by
- review_date
- human_confidence
- agrees_with_machine
- notes_on_disagreement
- next_review_date

Apply this to:
- thesis notes
- catalyst notes
- major macro notes
- bridge notes
- synthesized reports

### Why this matters
- distinguishes machine-updated from human-reviewed knowledge
- helps agents know what has been validated
- creates a lightweight accountability trail

---

## Research Conversation Areas

Structured conversation areas are allowed in the **research section only**.

These should help agents and humans interact around research objects without turning notes into messy chat logs.

Suggested section blocks:
- What changed
- What matters
- What is disputed
- What is missing
- What to review next
- What links elsewhere

### Rules for conversation areas
- keep them structured, not freeform chat dumps
- use them on research notes, reports, dashboards, and synthesis surfaces
- do not use them inside the learning progression system

---

## Hold for Later Roadmap

The following ideas are valuable but should stay in a later phase unless explicitly requested:
- broader “Why This Matters” standardization across all note types
- expanded challenge console beyond core research notes
- scenario-card system
- persistent role prompts inside notes
- micro-annotation system
- misleading signal cemetery

These are strong ideas, but they are not current priority items.

---

## Suggested Build Order

### Phase 1
Implement immediate operational value:
- unanswered questions system
- what changed since last review dashboard
- human review receipt

### Phase 2
Improve context delivery and traceability:
- briefing packs
- signal trace / evidence ladder
- thesis timeline views

### Phase 3
Improve synthesis and graph leverage:
- cross-thesis collision board
- bridge note suggestions
- reading modes

---

## Data / Note Design Guidance

### Prefer structured note objects
Where practical, represent new systems as clearly typed note families or structured frontmatter rather than ad hoc paragraphs.

### Preserve provenance
Do not break the pull-note model. Pull notes remain immutable evidence snapshots.

### Build summary layers above raw notes
New improvements should help compress, route, and explain information rather than replacing source material.

### Support both machine and human reading
Every major improvement should answer:
- can an agent read this quickly?
- can a human verify this quickly?

---

## Output Standard for This Agent

When recommending or implementing a vault improvement, the agent should provide:
- the goal of the improvement
- which part of the vault it affects
- how it helps agents
- how it helps humans
- what note types, fields, or dashboards it requires
- whether it belongs in Phase 1, 2, or 3
- whether it applies to research only, learning only, or both

Default assumption:
- **research improvements stay in the research system**
- **learning remains checkpoint-driven and separate**

This agent should optimize for a vault that is easier to navigate, easier to trust, easier to review, and better at surfacing unresolved questions and cross-domain synthesis.
