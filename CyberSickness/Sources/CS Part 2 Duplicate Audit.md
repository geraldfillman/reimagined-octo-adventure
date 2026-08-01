---
title: "CS Part 2 Duplicate Import Audit"
type: "cybersickness-source-audit"
created: "2026-07-30"
tags: ["cybersickness-dossier", "sources", "duplicate-audit", "cs-part2", "provenance"]
status: "complete-no-delta"
confidence: "exact file-by-file SHA-256 comparison"
source_scope: "all 614 files in CS_Part2 compared with the original export"
---
# CS Part 2 Duplicate Import Audit

[[00 CyberSickness Hub|Back to hub]] / [[Sources/Methodology and Limitations]] / [[Sources/Conversation Index]] / [[Sources/Attachment Index]]

> [!success] Import decision
> `CS_Part2` is an exact byte-for-byte duplicate of the export already analyzed. It contributes **zero new conversations, zero new exported file IDs, zero changed files, and zero additional evidence**. It was therefore not ingested a second time and did not alter theme counts or project scores.

## Compared locations

| Role | Path |
| --- | --- |
| Original analyzed export | C:\Users\CaveUser\Desktop\CyberSickness |
| Candidate supplemental export | C:\Users\CaveUser\Desktop\CyberSickness\CS_Part2 |
| Machine-readable audit | C:\Users\CaveUser\Desktop\CyberSickness\.work\analysis\cs_part2_duplicate_audit.json |

## Results

| Check | Result |
| --- | --- |
| Candidate files | 614 |
| Candidate bytes | 530,413,208 |
| Files with identical name, size, and SHA-256 | 614 |
| Different or candidate-only files | 0 |
| Unique conversation IDs | 647 candidate / 647 original |
| New conversation IDs | 0 |
| Missing conversation IDs | 0 |
| Exported `.dat` file IDs | 598 candidate / 598 original |
| New exported file IDs | 0 |
| Missing exported file IDs | 0 |
| Exact duplicate | True |
| Canonical candidate export fingerprint | `ce2a0bdca29c5133679174d94acac67e7ed2e6c69e95089791b34439d21adf1d` |

## Method

1. Enumerated every top-level file in `CS_Part2`.
2. Matched each candidate filename to the original export.
3. Compared byte size and streamed SHA-256 for all 614 pairs, including seven conversation shards, the manifest, registries, HTML, JSON metadata, and all 598 `.dat` binaries.
4. Parsed both sets of conversation shards and compared unique conversation IDs.
5. Compared the exported `.dat` stems as file-ID sets.
6. Built a canonical fingerprint from each candidate filename, size, and SHA-256 for later duplicate detection.

## Why no themes or projects changed

Counting the same archive twice would falsely double apparent continuity, attachment support, and theme frequency. Because every input byte is identical, the controlling evidence remains the original 647-conversation corpus and 706-row attachment catalog. The existing project scores are unchanged; no candidate receives additional evidence credit from this copy.

## The existing analysis is already broader than XR

The dossier's central framing remains immersive systems, but the complete corpus scan already preserves promising non-XR and adjacent lanes rather than filtering them out:

- [[Themes/Quant Probability and Decision Literacy]]: probability, expected value, Markov labs, market research, and decision-literacy games.
- [[Themes/Immersive Analytics Rugby and Spatial Decisions]]: coaching decisions, manual video analysis, low-cost 3D replay, and game systems.
- [[Themes/Patents Contracts Grants and Commercialization]]: Patent-to-Product research packets, public opportunities, contracts, grants, and service-first commercialization.
- [[Themes/AI Agents Automation and Operator Tools]]: provenance-first research, automation, ingestion, scoring, and human review workflows that can serve many domains.
- [[Themes/Audio Visual Interaction and Facilitation Design]]: archival storytelling, audio, visual design, facilitation, and reusable documentary patterns.
- [[03 Ranked Project Portfolio]]: rugby, Patent-to-Product, decision games, quant research, and White Rose remain explicit candidates even when they do not enter the top five.
- [[Projects/04 External View and Topic Flow]]: explains how the non-XR interests connect through decision learning, evidence, and reusable systems.

## Re-ingestion trigger

Rerun the supplemental workflow only when at least one of the following changes: a conversation shard hash, unique conversation ID set, exported file-ID set, manifest/registry hash, or attachment binary hash. A genuinely distinct export will be analyzed as a delta first and then merged into the full portfolio without assuming that XR is the only relevant category.

If `CS_Part2` was intended to contain different data, replace it with the distinct export or point to its actual folder. This audit gives an exact baseline for confirming the replacement.
