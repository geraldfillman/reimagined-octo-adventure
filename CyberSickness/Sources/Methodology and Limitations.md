---
title: "CyberSickness Methodology and Limitations"
type: "cybersickness-methodology"
created: "2026-07-30"
tags: ["cybersickness-dossier", "sources", "methodology", "limitations"]
status: "complete"
confidence: "documented procedure"
source_scope: "seven conversation shards, export metadata, attachment registry, selected file bodies, targeted current sources"
---
# Methodology and Limitations

[[00 CyberSickness Hub|Back to hub]]  /  [[Sources/Conversation Index]]  /  [[Sources/Attachment Index]]  /  [[Sources/Verification Report]]

## Parsing and reconciliation

1. Loaded `conversations-000.json` through `conversations-006.json` and reconciled counts to 100/100/100/100/100/100/47.
2. Deduplicated conversation IDs and message IDs. The result is 647 unique conversations and 17,151 unique messages with no duplicate IDs across conversations.
3. For each conversation, followed parent links from `current_node` to reconstruct the adopted branch. Messages outside that ancestry were counted as alternates and excluded from evidence of controlling direction.
4. Kept UTC dates from export timestamps for stable cross-shard indexing. Some local-calendar dates can differ near midnight.
5. Created title-derived safe summaries and did not copy full messages or transcripts into the dossier.

## Branch handling

The export contains 17,798 mapping nodes. The reconstructed current ancestries contain 17,616 nodes; 182 nodes/messages are off-path alternatives across the corpus. An alternate branch may explain idea evolution, but it is not treated as adopted direction unless the current branch independently contains the same decision. For example, the richer current branch of `Action Plan Workflow` includes audiovisual study that an abandoned shorter prompt did not.

## Theme classification

Eight initial themes were applied using case-insensitive keyword routing over title plus current-branch user/assistant text. User text, assistant text, and title receive different heuristic weights. A conversation can receive several themes. Relevance levels are:

- **anchor:** strong direct theme evidence;
- **direct:** meaningful direct relevance;
- **adjacent:** useful cross-theme context;
- **context:** retained for complete accounting but usually not used in conclusions.

Automated counts are not statistical prevalence estimates. Assistant verbosity can inflate a theme score, terminology can be ambiguous, and titles can be misleading. Human synthesis and exact evidence records control all material conclusions.

## Attachment inventory and review

- `.dat` binaries were matched to original filenames using `conversation_asset_file_names.json` and then `library_files.json`. The raw files were not renamed or modified.
- 598 exported binary bodies were cataloged.
- 22 library records whose binary body is absent were retained as `metadata-only-not-exported`.
- 86 valid file IDs found in conversation message structures but absent from binaries and the library registry were retained as `reference-only-unresolved`. Names were recovered only where current-branch context made the mapping explicit.
- 8 Markdown/text artifacts were content-reviewed and 6 DOCX artifacts were text-reviewed. DOCX layout was not used as evidence. All other binaries remain catalog-only.
- Presence, filename, or a generated download link is never treated as proof that a build ran or a claim is correct.

## Evidence interpretation

The evidence register separates user direction, assistant proposals, attachments, and externally verified facts. User reports are faithfully represented as reports. Assistant content is useful for tracing ideation and artifact creation but cannot establish external facts. Attached user work can establish what the file reports, not necessarily the truth or generalizability of the report. External checks were deliberately targeted to the highest-ranked projects and use official documentation, standards, government sources, and peer-reviewed records. Every current claim includes a URL and an access date of 2026-07-30.

## Project scoring

Each project receives six 0-5 scores, allowing half points: customer/revenue/funding path (25%), assets/readiness (20%), differentiation/domain fit (20%), meaningful 30-day pilot (15%), archive continuity (10%), and cross-theme compounding (10%). The mechanical total is `customer x 5 + readiness x 4 + differentiation x 4 + pilot x 3 + evidence x 2 + compounding x 2`. Scores rank current evidence, not expected financial returns. Written rationales expose the judgment behind every score.

## Privacy and redaction

No full conversation, binary attachment, credential, API key, direct contact detail, or detailed sensitive workplace/health narrative was copied. The dossier paraphrases examples and retains only the minimum exact provenance required for audit: title, date, conversation/file ID, shard, and filename where recoverable. Direct email and telephone patterns are masked in generated table cells. The workplace evidence log is cited only for aggregate operational themes.

## Limitations

- The export is a snapshot ending 2026-07-27; later decisions and live system state are outside scope.
- Some old attachments are referenced but not exported, and their filenames may be unresolved.
- Most binaries were cataloged rather than reviewed; image, spreadsheet, slide, PDF, and archive contents are not silently inferred.
- DOCX review used extracted text, not rendered layout.
- Theme routing is heuristic and overlapping.
- Market demand, willingness to pay, implementation compatibility, learning efficacy, and grant availability require live pilots or fresh checks.
- Current-source checks are bounded and not a complete market, legal, procurement, or systematic-review process.

## Raw-source integrity baseline

These hashes were computed before dossier generation and are checked again by the verifier.

| Raw source | SHA-256 |
| --- | --- |
| conversations-000.json | fcfe3f069568ce17389b4602b97bfb859df6957ca9812b0f06f6ab158527ab20 |
| conversations-001.json | 1b75ecb05948ec5f6c50e19209687dcc8fc1a5b12a3171c00a7fe04081db18b7 |
| conversations-002.json | 7653bff05aa8489c38c5695f755891e1f97b2a9cd5864272fb20cdba83722565 |
| conversations-003.json | 9115806d625c6348dbebd4b02370627cc967a8f447a3d19068e7da43bddec216 |
| conversations-004.json | 00ad1efda1c32518f90f2ae7e7085cf76c6a106ba4b3d5889dce885d273c2fae |
| conversations-005.json | 1f12696ef30b1571d6fcbdae395e62b97121246bd7f41791d22bdaefda10d507 |
| conversations-006.json | b7ca7885950a3f7138a515ad7762702b855e37cb1b7959ca09b7005f79e093dd |
| export_manifest.json | 71283a8afe9eb5c11b74ab66828875961589b842c49f757badd6c2ca9453381d |
| conversation_asset_file_names.json | 5c29b32103070e2d85f7ce6b5308476823d9163defd90dde66a4f082cecd738c |
| library_files.json | 2f6699dee839e61d537f72616ea7d411229b148c14459ab277774c3fe4aeb19c |
