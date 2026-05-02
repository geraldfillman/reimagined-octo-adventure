---
name: "EDGAR Dilution Monitor"
category: "Fundamentals"
type: "Composite"
provider: "SEC EDGAR + FMP Premium"
pricing: "Free (SEC) + paid (FMP)"
status: "Active"
priority: "Foundation"
url: "https://www.sec.gov/edgar"
provides:
  - Cash runway (FMP balance sheet + cash flow)
  - Shelf max vs headroom (EDGAR XBRL MaximumAggregateOfferingPrice)
  - ATM capacity / float (EDGAR + FMP shares-float)
  - Nasdaq bid-price non-compliance flags (8-K Item 3.01)
  - Filing-level dilution triggers (S-/F-*/424B*, 8-K 3.02, FWP)
best_use_cases:
  - Overnight gap-risk pre-flight
  - Small-cap dilution screening
  - Watchlist batch risk monitor
  - One-click due-diligence (DD)
tags:
  - fundamentals
  - dilution
  - sec
  - fmp
related_sources:
  - "[[SEC EDGAR API]]"
  - "[[FMP Premium]]"
key_location: "Env: FMP_API_KEY (FMP only; SEC free)"
integrated: true
linked_puller: "pullers/dilution-monitor.mjs + pullers/dd-report.mjs + pullers/filing-digest.mjs + pullers/capital-raise.mjs + pullers/smallcap-screen.mjs"
update_frequency: "On-demand (recommend daily pre-open)"
owner: "research@local.vault"
last_reviewed: "2026-04-23"
notes: "Composite source — reuses `lib/edgar.mjs` (throttled 10 req/s) and `lib/fmp-client.mjs`. Rules live in `lib/dilution-rules.mjs`; state delta in `scripts/.cache/dilution-state.json`."
---

# EDGAR Dilution Monitor

Composite data source that fuses **SEC EDGAR** (free) and **FMP Premium** (paid) to score and flag equity dilution risk across a watchlist or single ticker. Powers five pullers that together replace the AskEdgar workflow without adding new API spend.

## Summary

The monitor combines XBRL company-facts (shelf size), submissions (recent S-/F-*/424B/8-K filings), and FMP fundamentals (cash, quarterly burn, float, short interest) into four metrics:

- **Cash runway** (months) — `cash + STI / avg quarterly burn`
- **Shelf headroom** (USD) — `MaximumAggregateOfferingPrice − 24-month takedowns`
- **ATM-to-float** (%) — `shelf capacity / (float × price)`
- **Nasdaq compliance** (bool) — absence of 8-K Item 3.01

These feed a rule engine (`lib/dilution-rules.mjs`) that emits signals at severities **clear / watch / alert / critical**.

## What It Provides

- Batch risk sweep for watchlist (Tool #1 `dilution-monitor`)
- Morning filing digest with plain-language summaries (Tool #2 `filing-digest`)
- Market-wide capital-raise scan (Tool #3 `capital-raise`)
- Single-ticker DD deep dive (Tool #4 `dd-report`)
- Low-float / high-short screener with offering filter (Tool #5 `smallcap-screen`)

## Use Cases

- **Overnight position risk**: Run `dilution-monitor --tickers <portfolio>` pre-open; critical signals route to `06_Signals/`.
- **Pre-trade DD**: `dd-report --ticker <T>` for a one-shot report before entry.
- **Tape cleanup**: `smallcap-screen --no-offerings` to filter out names with pending dilution.
- **Market-wide flow**: `capital-raise --lookback 1` to see who raised yesterday.

## Integration Notes

**Status**: Integrated
**Linked Puller**: `pullers/{dilution-monitor,filing-digest,capital-raise,dd-report,smallcap-screen}.mjs`
**API Key Required**: FMP_API_KEY (SEC is keyless)
**Rate Limits**: SEC EDGAR 10 req/s (enforced in `lib/edgar.mjs`); FMP tier-dependent
**Update Frequency**: On-demand; recommend daily pre-open
**Data Format**: Markdown notes → `05_Data_Pulls/Fundamentals/` + mirror to `12_Knowledge_Bases/raw/fundamentals/`; signal notes → `06_Signals/`
**Owner**: research@local.vault
**Last Reviewed**: 2026-04-23

## Related Sources

- [[SEC EDGAR API]] — raw filings + XBRL company-facts
- [[FMP Premium]] — price, float, short-interest, fundamentals
