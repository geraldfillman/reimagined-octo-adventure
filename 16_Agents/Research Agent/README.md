---
title: Research Agent
type: agent-moc
agent_owner: Research Agent
agent_scope: dashboard
tags: [agents, research, moc]
last_updated: 2026-04-28
---

# Research Agent

Purpose: Own arXiv preprints, PubMed journals, ClinicalTrials activity, and frontier science evidence streams. Surface cross-sector research that confirms or challenges active investment theses.

## Operating Surfaces

- [[16_Agents/Research Agent/Pulls]]
- [[16_Agents/Research Agent/Sources]]
- [[16_Agents/Research Agent/Signals]]
- [[16_Agents/Research Agent/Investment Strategies]]

## Commands

```powershell
# --- Full sweeps (run daily) ---
node run.mjs pull arxiv --all
node run.mjs pull pubmed --all

# --- Life Sciences ---
node run.mjs pull arxiv --amr
node run.mjs pull arxiv --glp1
node run.mjs pull arxiv --alzheimers
node run.mjs pull arxiv --longevity
node run.mjs pull arxiv --psychedelics
node run.mjs pull arxiv --geneediting
node run.mjs pull pubmed --amr
node run.mjs pull pubmed --glp1
node run.mjs pull pubmed --alzheimers
node run.mjs pull pubmed --longevity
node run.mjs pull pubmed --psychedelics
node run.mjs pull pubmed --geneediting
node run.mjs pull clinicaltrials --oncology
node run.mjs pull clinicaltrials --amr
node run.mjs pull clinicaltrials --glp1
node run.mjs pull clinicaltrials --alzheimers
node run.mjs pull clinicaltrials --longevity

# --- Defense & Autonomy ---
node run.mjs pull arxiv --drones
node run.mjs pull arxiv --defense

# --- Frontier Tech ---
node run.mjs pull arxiv --humanoid
node run.mjs pull arxiv --quantum
node run.mjs pull arxiv --space
node run.mjs pull arxiv --nuclear

# --- Investment Strategy Lab ---
node run.mjs pull agent-analyst --strategy "Simons Style Quant Momentum Breadth" --limit 5 --skip-llm
node run.mjs pull agent-analyst --all-strategies --limit 12 --skip-llm
```

## Thesis Coverage Map

| Thesis | arXiv | PubMed | ClinicalTrials |
|---|---|---|---|
| Antimicrobial Resistance Pipeline | `--amr` | `--amr` | `--amr` |
| GLP-1 Metabolic Disease Revolution | `--glp1` | `--glp1` | `--glp1` |
| Alzheimers Disease Modification | `--alzheimers` | `--alzheimers` | `--alzheimers` |
| Longevity Aging Biology | `--longevity` | `--longevity` | `--longevity` |
| Psychedelic Mental Health Revolution | `--psychedelics` | `--psychedelics` | — |
| Gene Editing CRISPR Therapeutics | `--geneediting` | `--geneediting` | `--geneediting` |
| Drone Autonomous Systems Revolution | `--drones` | — | — |
| Defense AI Autonomous Warfare | `--defense` | — | — |
| Humanoid Robotics | `--humanoid` | — | — |
| Quantum Computing | `--quantum` | — | — |
| Space Domain Awareness | `--space` | — | — |
| Nuclear Renaissance SMRs | `--nuclear` | — | — |

## Review Cadence

- Daily: run `arxiv --all` and `pubmed --all`; check Thesis-Linked Research section.
- Weekly: run the strategy lab for active `strategy` baskets and compare entropy, agent verdicts, Qlib scores, and backtest drift.
- Weekly: review Active Attention and cross-sector signals for thesis-confirming or thesis-breaking evidence.
- Monthly: promote repeated research patterns into thesis bridge notes.
