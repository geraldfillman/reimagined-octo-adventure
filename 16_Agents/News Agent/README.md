---
title: News Agent
type: agent-moc
agent_owner: News Agent
agent_scope: dashboard
tags: [agents, news, media, sentiment, moc]
last_updated: 2026-04-28
---

# News Agent

Purpose: Own news headline intelligence, topic-based sentiment sweeps, and Reddit community signals. Surfaces emerging narratives, cross-domain news flow, and sentiment context that feeds thesis and sector agents.

## Operating Surfaces

- [[16_Agents/News Agent/Pulls]]
- [[16_Agents/News Agent/Sources]]
- [[16_Agents/News Agent/Signals]]

## Commands

```powershell
# NewsAPI headline sweep by topic
node run.mjs newsapi --topic "fed rates"
node run.mjs newsapi --topic "housing market"
node run.mjs newsapi --topic "biotech fda"

# Reddit sentiment by subreddit or thesis
node run.mjs pull reddit --subreddit wallstreetbets --query AAPL
node run.mjs pull reddit --thesis "Housing Supply Correction"
node run.mjs pull reddit --all-thesis
```

## Data Coverage

| Domain | Sources | Puller |
|---|---|---|
| Aggregated news headlines | NewsAPI (NEWSAPI_API_KEY required) | `newsapi.mjs` |
| Reddit community sentiment | Reddit public JSON / OAuth | `reddit.mjs` |
| Paywalled news + legal reporting | Nexis Uni (university access) | manual |

## Cross-Agent Notes

- Reddit pulls land in `05_Data_Pulls/social/` — also monitored by OSINT Agent.
- NewsAPI topic queries are thesis-aware; output tags help route signals to domain agents.

## Review Cadence

- Daily: sweep 2–3 active thesis topics via NewsAPI.
- Weekly: run `--all-thesis` Reddit sweep and review sentiment drift.
