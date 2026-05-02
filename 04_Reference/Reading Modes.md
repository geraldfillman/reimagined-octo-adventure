---
title: Reading Modes
description: Convention for consuming research notes at different depths. Agents and humans use these as a shared vocabulary for how to read and surface vault content.
tags: [reference, convention]
---

# Reading Modes

Three structured modes for consuming any research note. These are conventions, not automation — they define *which fields to look at* and *in what order*, not a separate note structure.

---

## Skim Mode
**Use when:** Quick context check, first pass, or routing decisions.

**Read only:**
1. `name` or `title`
2. `conviction` (theses) / `severity` (signals) / `status`
3. `why_now` (theses) / `why_it_matters` (questions)
4. `next_catalyst` or `next_review_date`
5. `human_confidence`

**Time budget:** Under 30 seconds.

---

## Analyst Mode
**Use when:** Preparing a view, writing a briefing pack, or doing active research.

**Read in order:**
1. Full frontmatter
2. Summary section
3. Core Logic / Current Reading
4. Signals to Watch (dataview block)
5. Evidence chain (`evidence_chain` fields in thesis)
6. Open questions linked to this note (via 15_Questions/)
7. Monitor Review / Current Assessment

**Time budget:** 5–10 minutes.

---

## Audit Mode
**Use when:** Challenging a conclusion, verifying machine output, or pre-commit review.

**Read in order:**
1. `human_confidence` + `agrees_with_machine` + `disagreement_notes`
2. `evidence_chain` — trace each link from signal → pull → source
3. `disconfirming_evidence` / contradictions
4. `invalidation_triggers`
5. All open questions (`status: open`) linked to this note
6. `thesis_timeline.conviction_history` — look for unexplained jumps
7. Bridge notes referencing this note

**Time budget:** 15–30 minutes.

---

## For Agents

When retrieving context for a task, default to **Analyst Mode**.
Use **Skim Mode** when routing or deciding which note to open next.
Use **Audit Mode** only when explicitly asked to validate or challenge a conclusion.

When writing a briefing pack, use Analyst Mode on the primary object and Skim Mode on all related entities.

---

## Field Reference by Mode

| Field | Skim | Analyst | Audit |
|-------|------|---------|-------|
| `name` / `title` | ✓ | ✓ | ✓ |
| `conviction` / `status` | ✓ | ✓ | ✓ |
| `why_now` | ✓ | ✓ | ✓ |
| `next_catalyst` | ✓ | ✓ | |
| `human_confidence` | ✓ | ✓ | ✓ |
| Full frontmatter | | ✓ | ✓ |
| Body sections | | ✓ | ✓ |
| `evidence_chain` | | ✓ | ✓ |
| `disconfirming_evidence` | | | ✓ |
| `invalidation_triggers` | | | ✓ |
| `agrees_with_machine` | | | ✓ |
| `thesis_timeline` | | | ✓ |
| Linked bridge notes | | | ✓ |
