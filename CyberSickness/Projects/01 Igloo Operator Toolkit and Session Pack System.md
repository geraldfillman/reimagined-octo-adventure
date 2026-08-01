---
title: "Igloo Operator Toolkit and Session Pack System"
type: "cybersickness-project"
created: "2026-07-30"
tags: ["cybersickness-dossier", "project", "igloo-operator-toolkit"]
status: "recommended"
confidence: "high for archive fit; medium until pilot"
portfolio_tier: "Build now"
score: 90
related_themes: ["[[Themes/Shared Immersive Systems and Igloo]]", "[[Themes/AI Agents Automation and Operator Tools]]", "[[Themes/Audio Visual Interaction and Facilitation Design]]", "[[Themes/Cybersickness Comfort Accessibility and Comparison]]"]
source_scope: "7 selected archive records plus current primary-source checks"
---
# Igloo Operator Toolkit and Session Pack System

[[00 CyberSickness Hub|Back to hub]]  /  [[03 Ranked Project Portfolio]]  /  [[Sources/Evidence Register]]

> [!success] Portfolio decision
> **Rank 1  /  90/100  /  Build now**  
> Build a read-only, one-site pilot first; productization waits for repeated use and buyer interviews.

## Target user

Immersive-space operators, instructional technologists, simulation staff, and a manager responsible for uptime across one or more rooms.

## Problem

Scheduled teaching is exposed to opaque failures, inconsistent session state, undocumented recovery work, and a one-person support bottleneck. More advanced content increases fragility unless the operating base is made observable and repeatable.

## Existing assets

- User-originated uptime targets, failure examples, and an agent checklist.
- Reviewed platform roadmap and 14-project engineering specification.
- Reviewed session-pack, WebXR input, and OBS routing specifications.
- Official Core Engine documentation for sessions, WebView, import/export, and API concepts.

## Differentiator

It is cylinder- and operator-native: session provenance, seams, render health, audio drift, input, fallback mode, and facilitator readiness are one evidence trail rather than separate generic monitoring tools.

## Minimum pilot

At one room, capture a read-only daily baseline, designate one known-good session, validate one session pack before use, produce a one-page readiness report, and record issue class plus restoration time. No automated remediation in the pilot.

## Business or funding route

First an internal readiness/session-operations sprint; then a repeatable implementation service for other rooms or institutions. Software packaging is justified only after three repeated deployments reveal the same workflow.

## Score mechanics

| Criterion | 0-5 | Weight | Weighted points |
| --- | --- | --- | --- |
| Customer/revenue/funding path | 3 | 25% | 15 |
| Existing assets/readiness | 5 | 20% | 20 |
| Differentiation/domain fit | 5 | 20% | 20 |
| Meaningful 30-day pilot | 5 | 15% | 15 |
| Archive continuity | 5 | 10% | 10 |
| Cross-theme compounding | 5 | 10% | 10 |

**Total: 90/100.** Scores represent current evidence and are not forecasts.

## Supporting history

| Date (UTC) | Evidence class | Record | Exact provenance | What it supports |
| --- | --- | --- | --- | --- |
| 2025-11-13 | user-originated operational report | Memory leak troubleshooting steps | conversations-001.json; conversation `691649eb-166c-8325-86f1-b71b43df24bf` | Records a server failure that disrupted scheduled curriculum and motivates monitoring and fallback paths. |
| 2026-02-12 | user-originated operational report | 2026 Session Booking Targets | conversations-002.json; conversation `698e457a-becc-832d-8823-66f98b097422` | Supplies a historical 60-70 percent uptime estimate, a 95 percent target, learner scale, and restoration-time categories. |
| 2026-04-20 | user-originated direction | Igloo Agent Checklist | conversations-003.json; conversation `69e64ad9-5924-83ea-892c-e8d72b6c7364` | Requests safe daily machine, GPU, software, and Igloo health checks with incident handling. |
| 2026-06-17 | user-originated direction plus generated artifacts | AI Scripts for Igloos | conversations-005.json; conversation `6a32b3ef-a4e4-83e8-b04d-2f0c63b179bc` | Defines production-oriented mini-projects for manifests, seams, performance, synchronization, input, and session packaging. |
| 2026-06-29 | user-originated direction | TouchDesigner in Immersive Spaces | conversations-005.json; conversation `6a429f3a-5138-83ea-9dd2-db0d470f9568` | Compares Core Engine, WebView, TouchDesigner, and game-engine paths before asking for an engineering roadmap. |
| 2026-06-30 | assistant-generated artifact | Igloo_Immersive_Spaces_Platform_Engineering_Roadmap.docx | file `file_0000000099c4720cb1ae456daf50aa56`; text-reviewed | Presents a staged platform roadmap from stabilization through reusable web, middleware, and advanced-engine paths. |
| 2026-06-17 | assistant-generated artifact | 14-igloo-session-pack-builder.md | file `file_00000000dd9c720c80ea471e27526ff5`; content-reviewed | Specifies a session-pack builder as a reusable delivery unit. |

## Current reality check

- [Igloo Core Engine documentation](https://docs.igloovision.com/documentation/current/igloo-core-engine) -- The current product is layer-based and supports sessions, WebView content, and API-oriented control. Accessed 2026-07-30. (official vendor documentation)
- [Igloo Sessions documentation](https://docs.igloovision.com/documentation/current/sessions) -- Sessions can be tagged, imported/exported, and protected as read-only, supporting a governed session-pack workflow. Accessed 2026-07-30. (official vendor documentation)
- [Igloo import/export documentation](https://docs.igloovision.com/documentation/current/import-export-system) -- The documented export mechanism packages sessions, layers, and assets for sharing and reuse. Accessed 2026-07-30. (official vendor documentation)
- [Igloo Core Engine API documentation](https://docs.igloovision.com/documentation/current/i-c-e-api-coming-2023) -- Igloo documents a Core Engine API and example integrations, but implementation access and local-version compatibility must be confirmed. Accessed 2026-07-30. (official vendor documentation)
- [Igloo WebView documentation](https://docs.igloovision.com/documentation/current/webview) -- WebView uses Chromium and supports web content including WebGL/WebRTC, with configurable rendering settings. Accessed 2026-07-30. (official vendor documentation)

## Dependencies

- Installed Core Engine version inventory
- approved read-only access
- named incident owner
- fallback launch path
- operator time for weekly review

## Evidence gaps

- External willingness to pay
- local API compatibility
- baseline accuracy across all rooms
- support and security boundaries

## Risks

- Monitoring creates false confidence
- automation changes state unexpectedly
- vendor updates break integrations
- tooling adds workload before reducing it

## Success measures

- scheduled-session availability
- preflight pass rate
- mean restoration time by failure class
- fallback success rate
- operator minutes per session
- repeat issue rate

## Path forward

### First 7 days

- Inventory one room, versions, dependencies, and known-good session.
- Agree on a minimal health schema and red/yellow/green definitions.
- Run read-only checks manually and document the fallback.

### By day 30

- Automate collection only, leaving remediation manual.
- Validate one exportable session pack and run it in a real session.
- Review false positives, time saved, and missed failures with the operator.

### By day 90

- Repeat at a second room or program.
- Publish the common runbook and keep site-specific adapters separate.
- Decide whether the repeated service supports a product, consulting offer, or internal-only tool.

## Related themes

- [[Themes/Shared Immersive Systems and Igloo]]
- [[Themes/AI Agents Automation and Operator Tools]]
- [[Themes/Audio Visual Interaction and Facilitation Design]]
- [[Themes/Cybersickness Comfort Accessibility and Comparison]]
