---
title: "Agent Interaction Protocol"
type: "reference"
status: "active"
created: "2026-05-02"
tags: ["agents", "orchestrator", "protocol", "streamline-report"]
---

# Agent Interaction Protocol

## Purpose

The agent interaction layer lets vault agents exchange structured observations, challenges, handoffs, and decisions without depending on external multi-agent frameworks.

The durable record remains Obsidian markdown. JSON sidecars exist only so the dashboard and reports can read the same state without reparsing prose.

## CLI Surface

```powershell
node run.mjs pull agent-run --interactions
node run.mjs pull agent-run --interactions --skip-llm
node run.mjs pull streamline-report --include-interactions
```

`--skip-llm` is accepted for operator consistency. The v1 interaction engine is deterministic and works without an LLM key.

## Message Contract

`AgentMessage`:

```json
{
  "run_id": "orchestrator-daily-2026-05-02",
  "thread_id": "orchestrator-daily-2026-05-02_spy-technical-risk",
  "from_agent": "market",
  "to_agent": "orchestrator",
  "message_type": "observation",
  "topic": "SPY technical risk",
  "summary": "Price agent produced alert evidence.",
  "evidence_paths": ["05_Data_Pulls/Market/2026-05-02_Agent_Analysis_SPY.md"],
  "confidence": 0.7,
  "signal_status": "alert",
  "created_at": "2026-05-02T13:00:00.000Z"
}
```

Allowed message types:

- `observation`
- `challenge`
- `handoff`
- `decision`

Allowed signal statuses:

- `clear`
- `watch`
- `alert`
- `critical`

## Thread Contract

`AgentThread`:

```json
{
  "thread_id": "orchestrator-daily-2026-05-02_spy-technical-risk",
  "run_id": "orchestrator-daily-2026-05-02",
  "date": "2026-05-02",
  "topic": "SPY technical risk",
  "participants": ["market", "risk", "orchestrator"],
  "phase": "decide",
  "status": "unresolved",
  "signal_status": "alert",
  "messages": [],
  "decision": {}
}
```

Sidecars are written to:

```text
scripts/.cache/orchestrator/agent-threads/YYYY-MM-DD_<thread-id>.json
```

Vault notes are written to:

```text
05_Data_Pulls/Orchestrator/YYYY-MM-DD_Agent_Thread_<topic>.md
```

## Decision Contract

`AgentDecision`:

```json
{
  "decision_type": "review",
  "rating": "alert",
  "status": "unresolved",
  "rationale": "Conflicting or incomplete agent reads require review.",
  "action_items": [
    "Resolve the alert agent disagreement before promoting the item.",
    "Open linked evidence notes and verify whether the challenge invalidates the setup."
  ],
  "owner": "orchestrator",
  "due_date": null,
  "source_thread_id": "orchestrator-daily-2026-05-02_spy-technical-risk"
}
```

Thread status:

- `resolved`: one-sided evidence can be summarized into the Streamline Report.
- `unresolved`: challenge, failure, or contradiction needs human review.

## Flow

1. Specialist agents run normally and write their usual pull notes.
2. `agent-run --interactions` reads the run ledger after all tasks finish.
3. Ledger entries become messages when they are active, failed, or blocked.
4. Messages group by thread topic.
5. The deterministic debate engine marks threads resolved or unresolved.
6. The orchestrator writes thread sidecars and pull notes.
7. `streamline-report --include-interactions` adds the latest thread table.

## Safety Rules

- Agent interaction notes are research artifacts only.
- No broker-write action may be generated.
- Specialist agents do not mutate interaction sidecars directly.
- TradingAgents remains a reference fork only; do not import, spawn, or install it as part of the vault routine.
