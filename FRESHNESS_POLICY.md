---
type: freshness-policy
version: 1
created: 2026-06-02
last_reviewed: 2026-06-02
consumed_by: scripts/agents/routine-runner.mjs
state_file: _state/run-state.json
tags:
  - automation
  - freshness
  - ttl
---

# Freshness Policy

TTL table that decides whether a puller fires this run. The runner reads `_state/run-state.json`, compares `last_run` against the TTL here, and runs only what's stale.

If a source isn't in this table, the runner treats it as **always stale** and warns in the log — add it here or it will be pulled every slot.

## TTL Definitions

| TTL Code | Meaning | Use For |
|---|---|---|
| `intraday-5m` | 5 minutes | Tape, quotes, orderflow |
| `intraday-30m` | 30 minutes | Sector scans, breadth, gamma |
| `intraday-2h` | 2 hours | News scans, sentiment |
| `daily` | 24 hours | EDGAR filings, COT (Fri), capital raises |
| `weekday` | next weekday 06:00 ET | Macro releases, BEA, BLS |
| `weekly` | 7 days | arXiv, PubMed, ClinicalTrials, FDA bulk |
| `monthly` | 30 days | NAHB, FHFA, IRENA |
| `on-event` | catalyst-driven only | FOMC, BOJ, earnings windows |
| `manual` | never auto-pull | User-triggered only |

## Per-Source Policy

### Market data

| Source | Script | TTL | Critical for slot |
|---|---|---|---|
| FMP intraday | (multiple, via `lib/fmp-market-context.mjs`) | `intraday-30m` | S2, S4 |
| FMP fundamentals | `lib/fmp-fundamentals-context.mjs` | `daily` | S5, S6 |
| CBOE gamma / options | `scripts/pullers/cboe.mjs` | `intraday-30m` | S2, S4 |
| Options flow | `scripts/pullers/options-review.mjs` | `intraday-30m` | S4 |
| Opening range / ORB | `scripts/pullers/orb-entropy.mjs` | `intraday-5m` (S2 only) | S2 |
| Auction features | `scripts/pullers/auction-features.mjs` | `intraday-30m` | S2, S4 |

### Macro

| Source | Script | TTL | Critical for slot |
|---|---|---|---|
| FRED bridges | `scripts/pullers/macro-bridges.mjs` | `daily` | S1 |
| Macro volatility | `scripts/pullers/macro-volatility.mjs` | `intraday-2h` | S1, S3 |
| BEA | `scripts/pullers/bea.mjs` | `weekday` | S2 |
| EIA energy | `scripts/pullers/eia.mjs` | `weekday` (Wed for stocks) | S2 |
| Federal Register | `scripts/pullers/federalregister.mjs` | `daily` | S3 |

### Filings & corporate

| Source | Script | TTL | Critical for slot |
|---|---|---|---|
| EDGAR filings | `scripts/pullers/filing-digest.mjs` | `daily` | S5 |
| Capital raises | `scripts/pullers/capital-raise.mjs` | `daily` | S5 |
| Disclosure reality | `scripts/pullers/disclosure-reality.mjs` | `daily` | S5 |
| Company risk | `scripts/pullers/company-risk-scan.mjs` | `daily` | S5 |
| Cash-flow quality | `scripts/pullers/cash-flow-quality.mjs` | `weekly` | S6 |

### Sector / thesis

| Source | Script | TTL | Critical for slot |
|---|---|---|---|
| Opportunity viewpoints | `scripts/pullers/opportunity-viewpoints.mjs` | `intraday-2h` | S1, S3 |
| Confluence scan | `scripts/pullers/confluence-scan.mjs` | `intraday-30m` | S2 |
| Convergence scan | `scripts/pullers/convergence-scan.mjs` | `daily` | S6 |
| Entropy monitor | `scripts/pullers/entropy-monitor.mjs` | `intraday-30m` | S2, S4 |

### News / narrative

| Source | Script | TTL | Critical for slot |
|---|---|---|---|
| Source watch (overnight digest) | `scripts/pullers/sourcewatch.mjs` | `intraday-2h` | S1 (translates `--since=overnight` to lookback=1d) |

### Lower-cadence / research

| Source | Script | TTL | Slot |
|---|---|---|---|
| arXiv | (under `kb/`) | `weekly` | S7 (out of v1 scope) |
| PubMed | `scripts/pullers/biofood.mjs` (partial) | `weekly` | S7 |
| ClinicalTrials | `scripts/pullers/clinicaltrials.mjs` | `weekly` | S7 |
| FDA | `scripts/pullers/fda.mjs` | `weekly` | S5 (Tue/Thu) |
| OSINT sweep | `scripts/pullers/osint-*.mjs` | `manual` | manual only |
| Government / FEMA | `scripts/pullers/openfema.mjs` | `daily` | S5 |
| NAHB housing | `scripts/pullers/nahb.mjs` | `monthly` | scheduled release dates |

### Catalyst-driven

| Source | TTL | Notes |
|---|---|---|
| FOMC / Fed speeches | `on-event` | Triggered by calendar; route to `World_Machine/_Inbox/10_Themes/Fed Speeches and FOMC Communications/` |
| Earnings windows | `on-event` | S5 only during scheduled windows |
| BOJ / ECB | `on-event` | Calendar-triggered |

## Criticality Tiers

Each source carries a tier. If a `critical` source fails, the slot is `degraded`; `optional` source failures are logged but do not degrade the slot.

| Tier | Behaviour on failure |
|---|---|
| `critical` | Slot status → degraded; EOD reconciliation surfaces the gap |
| `important` | Slot continues; flagged in next freshness summary |
| `optional` | Logged only; no surfacing |

Initial assignments (extend as we learn what's load-bearing):

- `critical`: macro-bridges, opportunity-viewpoints, options-review, filing-digest
- `important`: cboe, confluence-scan, entropy-monitor, capital-raise, disclosure-reality
- `optional`: everything else

## Maintenance

- Add a new source row when you add a puller. Default new sources to `important`.
- Re-tier a source if it has degraded the slot ≥3 times in a month.
- TTL changes should be made here, not in puller code.
