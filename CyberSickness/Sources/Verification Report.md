---
title: "CyberSickness Verification Report"
type: "cybersickness-verification"
created: "2026-07-30"
tags: ["cybersickness-dossier", "sources", "verification"]
status: "complete"
confidence: "mechanical checks plus documented structural checks"
source_scope: "staged dossier and immutable export inputs"
---

# Verification Report

[[00 CyberSickness Hub|Back to hub]] / [[Sources/Methodology and Limitations]]

> [!success] Result
> **17/17 checks passed; 0 failed.** Generated 2026-07-30.

## Acceptance checks

| Check | Result | Detail |
| --- | --- | --- |
| Expected Markdown note count | PASS | Found 24 notes; expected 24 including this report. |
| Frontmatter schema | PASS | All required and theme/project-specific fields present. |
| Conversation accounting | PASS | Indexed 647 rows and 647 unique IDs; expected 647. |
| Source-shard reconciliation | PASS | Index counts: {'conversations-000.json': 100, 'conversations-001.json': 100, 'conversations-002.json': 100, 'conversations-003.json': 100, 'conversations-004.json': 100, 'conversations-005.json': 100, 'conversations-006.json': 47}. |
| Attachment accounting | PASS | Indexed 706 rows and 706 unique IDs; expected 706. |
| Attachment review-state reconciliation | PASS | States: {'reference-only-unresolved': 86, 'metadata-only-not-exported': 22, 'cataloged-only': 584, 'content-reviewed': 8, 'text-reviewed': 6}. |
| Wikilink resolution | PASS | Checked 1036 wikilinks; unresolved: []. |
| Scoped connection audit | PASS | Hub reaches every theme, project, and source note; all theme/project notes link back. |
| Two-example minimum per theme | PASS | AI Agents Automation and Operator Tools: 8; Audio Visual Interaction and Facilitation Design: 8; Clinical Simulation Nursing and Interactive Learning: 8; Cybersickness Comfort Accessibility and Comparison: 5; Immersive Analytics Rugby and Spatial Decisions: 6; Patents Contracts Grants and Commercialization: 9; Quant Probability and Decision Literacy: 8; Shared Immersive Systems and Igloo: 8 |
| Two-example minimum per high-confidence connection | PASS | Checked 12 connection-ledger rows. |
| Project scoring and rationale coverage | PASS | Found 14 scored candidates and 14 written rationales. |
| Top-five evidence traceability | PASS | Every top-five project has an explicit evidence-register row; project notes contain detailed evidence tables. |
| Mermaid structural syntax | PASS | Checked 3 constrained flowcharts: 00 CyberSickness Hub.md: pass, 02 Theme Map.md: pass, Projects\04 External View and Topic Flow.md: pass. No renderer CLI was available; this is a grammar/balance check. |
| Raw export integrity | PASS | All ten conversation/manifest/registry SHA-256 values match the pre-generation baseline. |
| Credential/contact scan | PASS | Pattern hits: {'OpenAI-like key': 0, 'AWS key': 0, 'Bearer token': 0, 'email': 0, 'phone': 0}. |
| No raw transcript payload | PASS | Found 0 raw-export structural markers; expected zero. |
| Current-source URL and access-date pairing | PASS | Checked 66 URL-bearing lines; each carries the access date. |

## Interpretation

Mechanical checks prove accounting, structure, link reachability, source-ID coverage, and raw-file integrity. They do not prove external market demand, clinical efficacy, local software compatibility, or legal conclusions. Mermaid was checked against the constrained flowchart grammar used in the dossier and for balanced delimiters; it was not rendered by a separate Mermaid CLI. The separate My_Data system validator is run after the staged dossier is copied into the requested vault location, and its result is reported without moving the dossier.

## My_Data system validation

Run from the My_Data vault on 2026-07-30 after copying the dossier. The command exited **0** with two warning-only harness findings unrelated to the requested `CyberSickness` route:

- `pullers/sourcewatch.mjs` is not registry-addressable because it has no pull/run export.
- Source declarations are missing for 51 puller catalog entries (P3b warning-only).

No validator conflict was reported for the top-level `CyberSickness` folder, so the requested location was retained.
