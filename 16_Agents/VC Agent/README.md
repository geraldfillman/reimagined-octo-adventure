---
title: VC Agent
type: agent-moc
agent_owner: VC Agent
agent_scope: dashboard
tags: [agents, vc, deal-flow, private-markets, moc]
last_updated: 2026-04-28
---

# VC Agent

Purpose: Own private markets deal flow, capital raise activity, Form D filings, company risk intelligence, and due diligence reports. Surfaces early fundraise signals, investor network mapping, and sector-level VC momentum.

## Operating Surfaces

- [[16_Agents/VC Agent/Pulls]]
- [[16_Agents/VC Agent/Sources]]
- [[16_Agents/VC Agent/Signals]]

## Commands

```powershell
# Daily capital raise sweep (EDGAR 424B/S-1/S-3/8-K Item 3.02)
node run.mjs pull capital-raise

# Company risk intelligence scan (FMP + EDGAR + NewsAPI + FDA)
node run.mjs pull company-risk-scan --ticker <TICKER>

# One-click due diligence report (dilution, ownership, filings, news)
node run.mjs pull dd-report --ticker <TICKER>
```

## Data Coverage

| Domain | Sources | Puller |
|---|---|---|
| Capital raises / offerings | SEC EDGAR (424B, S-1, S-3, 8-K 3.02) | `capital-raise.mjs` |
| Form D private placements | SEC EDGAR | manual / future puller |
| Company risk intelligence | FMP, EDGAR, NewsAPI, FDA | `company-risk-scan.mjs` |
| Due diligence reports | FMP, EDGAR, dilution models | `dd-report.mjs` |
| VC industry stats | NVCA quarterly reports | manual |
| Company/fund directory | Crunchbase, YC, OpenVC | future integration |

## Review Cadence

- Daily: review new capital-raise sweep notes for emerging offerings.
- As-needed: run DD report before adding a position or thesis.
- Weekly: review company-risk-scan outputs for portfolio or watchlist names.
