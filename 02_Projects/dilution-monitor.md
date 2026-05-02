---
node_type: "project"
project_name: "Dilution Risk Monitor"
status: "planned"
owner: "operator"
date_started: "2026-04-23"
tags: [project, dilution, sec, company-risk]
related_scripts: ["[[pullers/sec.mjs]]", "[[pullers/fmp.mjs]]", "[[pullers/company-risk-scan.mjs]]"]
---

# Dilution Risk Monitor

Mirror of AskEdgar's `/v1/dilution-rating` workflow using existing free SEC EDGAR + FMP Premium stack. No new API keys required.

## Problem

Retail small-cap longs get gapped overnight by offerings announced at 20–30% discount. The underlying evidence (S-3 filings, ATM program activity, cash runway shrinking) sits in EDGAR for days before the offering prints. Current vault has no tool that continuously scores this risk per ticker.

## What It Does

For each ticker on watchlist, every N hours:

1. Pull EDGAR filings since last run — S-1, S-3, 424B1/B2/B3/B5, 8-K Item 3.02 (unregistered sales), 8-K Item 1.01 (material agreements → underwriter contracts), 10-Q (cash), SC 13G (prep activity).
2. Pull FMP `balance-sheet-statement` + `cash-flow-statement` (TTM quarterly) + `shares-float` + `enterprise-value`.
3. Compute locally:
   - **cash_runway_months** = (cash + ST investments) / avg 4Q operating burn
   - **shelf_capacity_usd** = S-3 effective max − Σ takedown proceeds (24 months)
   - **atm_to_float_ratio** = active ATM notional / float (from latest ATM prospectus)
   - **overall_risk** ∈ {low, medium, high, critical}, derived from weighted rule set
   - **nasdaq_compliance** flag from 8-K Item 3.01 + bid-price history
4. Write pull note to `05_Data_Pulls/Fundamentals/YYYY-MM-DD_Dilution_Monitor.md` (batch — all tickers in one table).
5. For any ticker that crosses a threshold, write a discrete signal note to `06_Signals/YYYY-MM-DD_DILUTION_{ticker}.md` with `signal_status: alert` or `critical`.
6. Signal Board dashboard surfaces these automatically (no new UI needed).

## Trigger Rules

| Condition | Signal |
|---|---|
| cash_runway_months < 3 | `critical` |
| cash_runway_months < 6 | `alert` |
| overall_risk low→medium | `watch` |
| overall_risk medium→high | `alert` |
| New S-3 goes effective | `alert` |
| ATM capacity > 50% of float | `alert` |
| Nasdaq bid-price non-compliance (20-day < $1) | `alert` |

State kept in `scripts/lib/dilution-state.json` (last_seen_accession per ticker) so only new filings fire alerts.

## File Plan

| File | Purpose |
|---|---|
| `scripts/pullers/dilution-monitor.mjs` | New puller. Uses `fetcher.mjs`, `markdown.mjs`, `signals.mjs`. Imports `CIK_MAP` from `sec.mjs` (or extracted to `lib/cik-map.mjs`). |
| `scripts/lib/dilution-rules.mjs` | Pure rule engine: input=metrics object, output=risk scores + signal list. Unit-testable. |
| `scripts/lib/dilution-state.mjs` | JSON state store for last-seen accessions and last-seen risk level per ticker (delta detection). |
| `scripts/tests/dilution-rules.test.mjs` | TDD: ≥80% coverage on rule engine (runway thresholds, delta transitions, shelf math). |
| `01_Data_Sources/Fundamentals/EDGAR Dilution Monitor.md` | Data source note (schema-compliant frontmatter). |
| `03_Templates/Dilution Pull.md` | Template for batch pull note. |
| Router entry in `run.mjs` / `router.mjs` | `node run.mjs pull dilution-monitor [--watchlist <name>]` |

## Watchlist Source

Default: all tickers in `08_Entities/Stocks/` with frontmatter `status: active`. Overridable via `--watchlist thesis:<name>` to use a thesis's `core_entities[]` instead.

## Out of Scope (explicit, to avoid scope creep)

- Slack/Discord/email notifications — vault signal notes + `localhost:3737` dashboard only. Layer webhooks later if needed.
- Underwriter graph analysis (who bankrolls which deals) — requires paid source.
- Real-time (< 24h) offering alerts — EDGAR-free has same latency as AskEdgar's digest tier.
- Short-borrow fee rate — not in FMP Premium.
- AI summarization of filings — deferred to tool #2 (AI Filing Digest), which layers onto `sec.mjs` separately.

## Verification Steps

1. Unit test rules with mocked metrics (RED → GREEN → coverage ≥80%).
2. Dry-run on 10-ticker sample (mix: one known imminent diluter, one large-cap clean, one already-diluted).
3. Validate EDGAR fetch headers (SEC requires `User-Agent: name email`) — reuse existing `fetcher.mjs` config.
4. Run `node run.mjs validate` after first real pull to confirm frontmatter compliance.
5. Confirm KB bridge mirror auto-creates `12_Knowledge_Bases/raw/datasets/` copy.

## Follow-on Tools (later, same plan file)

- Tool #2: AI Filing Digest → extend `sec.mjs` with tag classifier + `kb compile` summarization
- Tool #3: Capital Raise Digest → daily EDGAR pull of 424B* + 8-K 3.02, market-wide
- Tool #4: DD Report → `node run.mjs pull dd-report --ticker NVDA` — combines existing FMP + EDGAR ownership + reverse-split history
- Tool #5: Small-Cap Edge Screener → extends existing FMP screener wrapper

Each follow-on gets its own PR and its own section below when scoped.
