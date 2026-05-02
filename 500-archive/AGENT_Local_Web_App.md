# AGENT_Local_Web_App.md

## Purpose

Design and improve a **local web application** that sits on top of the Obsidian vault's `11_Learning/` workspace. The app should help the human learner explore assignments, complete checkpoints, submit work, review references, take knowledge checks, and unlock the next area through scripted progression.

This app is **not** the research dashboard. It is the learning interface.

The Obsidian vault remains the source of truth. The local web app is the interaction layer.

---

## Core Principles

1. **Learning and research are separate systems**
   - The local web app is for the learning system only.
   - Do not import research-side conversation surfaces into learning.
   - Do not turn the learning interface into a live analyst war room.

2. **The vault is the backend brain**
   - Read from markdown, frontmatter, linked notes, and generated files inside `11_Learning/`.
   - Write structured outputs back into the vault so the system remains inspectable and portable.

3. **Progression is gated**
   - The learner should unlock content through checkpoint submissions, review results, and script-based progression rules.
   - Advancement should feel earned, not randomly exposed.

4. **The app should feel distinctive**
   - Avoid generic LMS design.
   - Combine clean functional panels with selective immersive or visual interaction.
   - Use Three.js where it adds meaning, not just decoration.

5. **Human readability comes first**
   - Fancy interaction should never make core actions harder.
   - Reading, note-taking, submission, review, and library access must remain simple.

---

## Product Vision

Build an **Adaptive Learning Observatory**: a local-first learning interface that combines:
- a **Three.js knowledge map**
- an **assignment studio**
- a **checkpoint chamber**
- an **in-depth knowledge check arena**
- a **library/archive area**
- a **living notebook**
- a **scripted unlock system**

The learner should feel like they are moving through a structured exploration system, not clicking through a static class portal.

---

## Primary Objectives

### 1. Learning Journey Interface
Create a visual front door for the learning system.

Possible representations:
- domain map
- node constellation
- pathway graph
- mission corridor
- layered knowledge map

The interface should show:
- domains
- nodes
- prerequisites
- locked areas
- active assignments
- completed checkpoints
- suggested next path
- optional side branches

### 2. Assignment Studio
Create a focused workspace for the current task.

Each assignment view should include:
- title
- assignment summary
- why it matters
- linked node/domain
- required materials
- related references
- tasks to complete
- submission area
- checkpoint status
- agent review status
- unlock conditions

### 3. Checkpoint Submission Flow
Each checkpoint must support a structured submission process.

Possible submission sections:
- summary of understanding
- evidence or source use
- concept explanation
- application or scenario response
- synthesis or reflection
- confidence self-rating
- optional notebook excerpts

After submission, the app should be able to trigger a local script to:
- save the checkpoint entry
- update status
- queue or trigger agent review
- calculate unlock eligibility
- unlock the next area if conditions are met

### 4. In-Depth Knowledge Checks
Build a knowledge check system deeper than multiple choice.

Required modes:
- recall
- application
- synthesis

Possible formats:
- concept identification
- matching
- ranking/sequencing
- scenario diagnosis
- short answer
- compare/contrast
- explain the tradeoff
- connect two nodes
- defend a decision

Track more than score. Capture:
- recall strength
- application strength
- synthesis strength
- uncertainty
- review needed

### 5. Library and Exploration Area
Build a rich reference area for assignment-linked materials and deeper exploration.

The library should support:
- searchable references
- reading lists
- assignment-linked materials
- notes and highlights
- tags and relationships
- saved excerpts
- personal annotations
- exploration trails

Suggested modes:
- assignment shelf
- archive explorer
- topic map
- related references
- advanced extensions

### 6. Living Notebook
Provide a persistent notebook tied to the learning system.

Notebook sections may include:
- what I think this means
- what confuses me
- linked ideas
- project ideas
- key references
- draft checkpoint response

Notebook content should save back into the vault as structured markdown.

---

## Three.js Feature Direction

Three.js is encouraged, but only when it makes the interface more meaningful.

### Priority Three.js concepts

#### A. Knowledge Constellation
A 3D map of domains, nodes, and unlock pathways.

Use visual states such as:
- completed
- active
- locked
- recommended
- weak mastery
- cross-domain bridge

Interactions:
- orbit around domain clusters
- click nodes to open detail drawer
- zoom into active path
- reveal hidden nodes when prerequisites are satisfied
- pulse active checkpoint nodes

#### B. Unlock Theater
When a checkpoint passes:
- animate node completion
- illuminate new branches
- reveal newly unlocked territory
- display "why this unlocked"

#### C. Optional Library Explore Mode
A visually interesting archive room or shelf system for exploring references.

This is optional and should never block normal reading mode.

---

## User Interface Areas

## 1. Home / Observatory
Purpose:
- show current progression
- active assignments
- next recommended action
- node map
- recent submissions
- review results

## 2. Node Detail View
Purpose:
- explain a node
- show current mastery
- list prerequisites
- list linked assignments
- show required materials
- display unlock logic

## 3. Assignment Studio
Purpose:
- read task
- review materials
- work in notebook
- complete knowledge check
- submit checkpoint

## 4. Checkpoint Chamber
Purpose:
- formal checkpoint submission
- structured evaluation
- trigger review workflow

## 5. Knowledge Check Arena
Purpose:
- run recall, application, and synthesis checks
- adapt based on performance
- route weak areas back to materials

## 6. Library / Archive
Purpose:
- store and explore references
- search readings, notes, videos, papers, excerpts, and related materials
- connect references to assignments and nodes

## 7. Review Results Panel
Purpose:
- display structured agent review
- explain strengths, missing pieces, misconceptions, and next steps

## 8. Notebook
Purpose:
- provide persistent learner-owned thinking space tied to the vault

---

## Library Requirements

The library is a major part of the experience.

### Required capabilities
- full-text search over learning materials
- filtering by node, domain, assignment, tag, and type
- assignment-linked reference bundles
- support for articles, papers, notes, videos, excerpts, glossaries, and saved highlights
- ability to save annotations back into the vault
- relationship labels such as:
  - supports
  - contradicts
  - context for
  - advanced extension
  - prerequisite

### Exploration ideas
- reading trails
- curated progression paths
- “if this interested you, explore next” suggestions
- reference clusters around a concept
- saved collections for future review

---

## Checkpoint System Requirements

The learning system should use sectioned checkpoints rather than research-style conversation blocks.

Each checkpoint should be treated as a meaningful review gate.

### Checkpoint components
- instructions
- required concepts
- linked resources
- submission structure
- evaluation rubric
- self-assessment
- pass / revise / deepen result
- unlock rule output

### Post-checkpoint actions
After submission, the system should support:
- local script execution
- status update in the vault
- agent review queue or immediate review
- unlock decision
- recommendation of next area

---

## Agent Review Requirements

The app should support structured agent evaluation of submissions.

### Agent review output should include
- what was strong
- what was missing
- misconceptions detected
- recommended material
- pass / revise / deepen
- confidence in review
- suggested next node or assignment

Agent review should be saved back into the vault in a structured format.

---

## Data Flow Expectations

### Read from the vault
The app should read from:
- domain notes
- node notes
- assignment notes
- checkpoint definitions
- references library
- learner notebook notes
- review outputs
- unlock rules
- progress tracking data

### Write to the vault
The app should write:
- notebook entries
- checkpoint submissions
- knowledge check results
- review results
- unlock events
- progress updates
- annotations and highlights

All outputs should remain local-first and markdown-friendly where practical.

---

## Suggested Technical Architecture

### Backend
Use the existing Node.js server to:
- read markdown/frontmatter from `11_Learning/`
- expose API routes for nodes, assignments, references, progress, submissions, and reviews
- trigger local scripts
- persist structured outputs back into the vault

### Frontend
Use a local web UI with:
- standard 2D interface for reading, forms, search, and submissions
- Three.js for the knowledge map, unlock interactions, and optional immersive exploration views

### Recommended route groups
- `/`
- `/domains`
- `/nodes/:id`
- `/assignments/:id`
- `/checkpoints/:id`
- `/knowledge-check/:id`
- `/library`
- `/notebook`
- `/progress`
- `/review/:id`

---

## Implementation Priorities

### Phase 1
Build the practical backbone first:
- assignment studio
- checkpoint submission flow
- library with searchable references
- notebook
- local script trigger for unlock/review

### Phase 2
Build the deeper learning interaction layer:
- Three.js knowledge map
- mastery profile views
- adaptive knowledge checks
- review results interface

### Phase 3
Build the more immersive and distinctive surfaces:
- unlock theater
- scenario boss encounters
- advanced library exploration mode
- cross-domain exploration trails

---

## Things to Avoid

- Do not import research-side conversation blocks into the learning system.
- Do not make the UI depend entirely on 3D interaction.
- Do not bury writing, reading, or submission under visual gimmicks.
- Do not break the vault as source of truth.
- Do not create progression systems that are flashy but meaningless.

---

## Output Standard for This Agent

When proposing or implementing changes, the agent should provide:
- the goal of the feature
- where it fits in the UI
- how it reads and writes to the vault
- how it supports checkpoints, knowledge checks, references, or unlocks
- whether it belongs in Phase 1, 2, or 3
- a practical implementation suggestion

The agent should optimize for a local-first, inspectable, Obsidian-connected learning experience that feels creative, structured, and alive.
