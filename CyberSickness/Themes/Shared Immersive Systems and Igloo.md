---
title: "Shared immersive systems, Igloo, and experience engineering"
type: "cybersickness-theme"
created: "2026-07-30"
tags: ["cybersickness-dossier", "theme", "shared-immersive-igloo"]
status: "primary platform theme"
confidence: "high"
related_themes: ["[[Themes/Cybersickness Comfort Accessibility and Comparison]]", "[[Themes/Clinical Simulation Nursing and Interactive Learning]]", "[[Themes/AI Agents Automation and Operator Tools]]", "[[Themes/Audio Visual Interaction and Facilitation Design]]", "[[Themes/Immersive Analytics Rugby and Spatial Decisions]]"]
source_scope: "647-conversation export; automated routing count 125"
---
# Shared immersive systems, Igloo, and experience engineering

[[00 CyberSickness Hub|Back to hub]]  /  [[02 Theme Map]]  /  [[Sources/Evidence Register]]

> [!summary] Interpretation
> The shared-immersive work matures from impressive one-off demos into a reliability-first platform: known-good sessions, reusable templates, structured intake, operator controls, evidence capture, and only a bounded lane for advanced builds.

## What the history says

- Operational reliability is the binding constraint. User-originated records connect failures directly to lost curriculum, support burden, and an inability to guarantee delivery.
- The technical path converges on WebView/Three.js for light content, TouchDesigner and OSC for middleware, Core Engine for presentation, and game engines only where the interaction justifies them.
- Shared immersion is a distinct modality: co-located facilitation, role-play, physical equipment, and group sensemaking without one headset per learner.
- Multicampus ambitions amplify the need for versioned packs, read-only masters, training, health evidence, and explicit handoff ownership.

## Representative archive evidence

| Date (UTC) | Evidence class | Record | Exact provenance | What it supports |
| --- | --- | --- | --- | --- |
| 2025-11-13 | user-originated operational report | Memory leak troubleshooting steps | conversations-001.json; conversation `691649eb-166c-8325-86f1-b71b43df24bf` | Records a server failure that disrupted scheduled curriculum and motivates monitoring and fallback paths. |
| 2026-02-12 | user-originated operational report | 2026 Session Booking Targets | conversations-002.json; conversation `698e457a-becc-832d-8823-66f98b097422` | Supplies a historical 60-70 percent uptime estimate, a 95 percent target, learner scale, and restoration-time categories. |
| 2026-01-09 | user-originated direction | 2026 Igloo Action Plan | conversations-002.json; conversation `696165d6-2bc0-8327-aaa4-ebffa92db6f8` | Balances templates, faculty/student creation, and only a few supported flagship builds while distinguishing shared projection from headsets. |
| 2026-06-29 | user-originated direction | TouchDesigner in Immersive Spaces | conversations-005.json; conversation `6a429f3a-5138-83ea-9dd2-db0d470f9568` | Compares Core Engine, WebView, TouchDesigner, and game-engine paths before asking for an engineering roadmap. |
| 2026-07-15 | user-originated operational description | Igloo Immersive Spaces Routing | conversations-006.json; conversation `6a57d40f-caac-83ea-ab1b-c4c7c60fe5e9` | Describes multiple immersive rooms across campuses and anticipated regional expansion. |
| 2026-07-22 | user-originated direction and user attachment | Feedback on Abstract | conversations-006.json; conversation `6a612c80-235c-83ea-92e2-130980fdfacc` | Defines Igloo as shared room-scale projection and limits conclusions to the perception measures actually collected. |
| 2026-06-30 | assistant-generated artifact | Igloo_Immersive_Spaces_Platform_Engineering_Roadmap.docx | file `file_0000000099c4720cb1ae456daf50aa56`; text-reviewed | Presents a staged platform roadmap from stabilization through reusable web, middleware, and advanced-engine paths. |
| 2026-06-17 | assistant-generated artifact | 14-igloo-session-pack-builder.md | file `file_00000000dd9c720c80ea471e27526ff5`; content-reviewed | Specifies a session-pack builder as a reusable delivery unit. |

## Current reality check

- [Igloo Core Engine documentation](https://docs.igloovision.com/documentation/current/igloo-core-engine) -- The current product is layer-based and supports sessions, WebView content, and API-oriented control. Accessed 2026-07-30. (official vendor documentation)
- [Igloo WebView documentation](https://docs.igloovision.com/documentation/current/webview) -- WebView uses Chromium and supports web content including WebGL/WebRTC, with configurable rendering settings. Accessed 2026-07-30. (official vendor documentation)
- [Igloo Sessions documentation](https://docs.igloovision.com/documentation/current/sessions) -- Sessions can be tagged, imported/exported, and protected as read-only, supporting a governed session-pack workflow. Accessed 2026-07-30. (official vendor documentation)
- [Igloo import/export documentation](https://docs.igloovision.com/documentation/current/import-export-system) -- The documented export mechanism packages sessions, layers, and assets for sharing and reuse. Accessed 2026-07-30. (official vendor documentation)
- [Igloo Core Engine API documentation](https://docs.igloovision.com/documentation/current/i-c-e-api-coming-2023) -- Igloo documents a Core Engine API and example integrations, but implementation access and local-version compatibility must be confirmed. Accessed 2026-07-30. (official vendor documentation)

## Linked projects

- [[Projects/01 Igloo Operator Toolkit and Session Pack System]]
- [[Projects/02 Igloo Research Studio and Faculty Accelerator]]
- [[Projects/05 Comparative XR Shared-Room and Non-XR Research Kit]]

## Evidence gaps and next tests

- No verified baseline run covering all rooms, software versions, failure classes, and recovery times in one schema.
- No external customer validation for a standalone operations product.
- API availability and compatibility must be confirmed against the installed Core Engine version before automation commitments.

## Connections

- [[Themes/Cybersickness Comfort Accessibility and Comparison]]
- [[Themes/Clinical Simulation Nursing and Interactive Learning]]
- [[Themes/AI Agents Automation and Operator Tools]]
- [[Themes/Audio Visual Interaction and Facilitation Design]]
- [[Themes/Immersive Analytics Rugby and Spatial Decisions]]
