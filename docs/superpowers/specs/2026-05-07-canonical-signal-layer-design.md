# Canonical Signal Layer Design

Date: 2026-05-07
Status: Draft for user review

## Purpose

Create one canonical daily signal intelligence artifact that gives the vault a clearer read on every strategy, thesis, and market cycle. Monitoring reports and daily briefings should consume this artifact instead of rebuilding signal language independently.

The layer should answer four operator questions:

1. What is the signal?
2. What is it describing in plain English?
3. What evidence supports or contradicts it?
4. What should I read next to understand the topic better?

## Current Context

The vault already has the needed source material and report surfaces:

- `scripts/pullers/streamline-report.mjs` builds the daily decision-support report from local pull notes and sidecars.
- `scripts/pullers/research-spine-flow.mjs` writes monitoring snapshots and daily/end-of-day briefings into the Research Spine vault.
- `scripts/pullers/market-cycle-monitor.mjs` creates Research Spine market-cycle status notes from recent My_Data pull notes.
- `scripts/thesis-full-picture.mjs` writes thesis synthesis reports using FMP, catalysts, macro indicators, and thesis metadata.
- `scripts/pullers/confluence-scan.mjs` and `scripts/lib/confluence-scorer.mjs` already score setup confluence across regime, signal, fundamentals, auction, liquidity, options, crowding, and risk.
- `scripts/config/strategy-catalog.json` defines strategy universes, signal sets, data requirements, evidence gates, regime fit, and references.
- `scripts/config/mechanism-map.json` defines market-cycle mechanisms, triggers, signals to watch, feedback loops, fades, related strategies, and references.
- `05_Data_Pulls/Research`, `05_Data_Pulls/News`, `05_Data_Pulls/SourceWatch`, GDELT, FMP news, Semantic Scholar, arXiv, PubMed, SEC, FRED, Treasury, and thesis reports provide evidence links and deeper-dive material.

This design extends that system rather than replacing it.

## Output Artifacts

The new puller writes two generated artifacts:

- Markdown report: `05_Data_Pulls/Signals/YYYY-MM-DD_Signal_Intelligence.md`
- JSON sidecar: `scripts/.cache/signal-intelligence/YYYY-MM-DD.json`

Both artifacts are generated only. They should not mutate thesis, strategy, or source notes directly. Existing report builders read the latest sidecar and render a compact signal block.

## CLI

Add a new puller:

```powershell
node run.mjs pull signal-intelligence
node run.mjs pull signal-intelligence --scope thesis
node run.mjs pull signal-intelligence --scope strategy
node run.mjs pull signal-intelligence --scope market-cycle
node run.mjs pull signal-intelligence --dry-run
node run.mjs pull signal-intelligence --json
```

`--scope` accepts `all`, `thesis`, `strategy`, and `market-cycle`. Default is `all`.

## Signal Card Schema

Each card represents one canonical signal.

```json
{
  "id": "thesis:housing-supply-correction:2026-05-07",
  "date": "2026-05-07",
  "scope": "thesis",
  "name": "Housing Supply Correction",
  "signal_status": "watch",
  "direction": "mixed",
  "confidence": "Medium",
  "summary": "Housing evidence remains structurally relevant, but tactical tape and rate-sensitive inputs are not aligned enough for an upgrade.",
  "drivers": [
    "Latest thesis full-picture report shows macro indicators active.",
    "FMP watchlist coverage is present but fundamentals coverage is incomplete."
  ],
  "risks": [
    "Unmatched key indicators reduce confidence.",
    "Rate-sensitive technicals can override structural housing evidence."
  ],
  "evidence_links": [
    {
      "label": "2026-05-07 Thesis Full Picture Housing Supply Correction",
      "path": "05_Data_Pulls/Theses/2026-05-07_Thesis_Full_Picture_Housing_Supply_Correction.md",
      "source_type": "vault"
    }
  ],
  "deep_dive_queue": [
    {
      "topic": "Housing rate transmission",
      "why_it_matters": "The thesis depends on how rates affect affordability, builder behavior, and inventory.",
      "source_type": "research",
      "links": [
        "05_Data_Pulls/Research/2026-05-06_SemanticScholar_market_cycle_Rates_Funding_Basis_Trade.md"
      ],
      "questions": [
        "Which rate channel is most important right now: mortgage rates, credit spreads, or builder financing?",
        "What would confirm that housing weakness is demand-led instead of supply normalization?"
      ],
      "next_action": "Read the linked research pull and add one note-level takeaway to the thesis review."
    }
  ],
  "recommended_next_action": "Keep on watch; refresh macro and FMP coverage before conviction changes."
}
```

## Scopes

### Strategy Signals

Strategy signals come from `strategy-catalog.json`, latest strategy-tagged agent analysis, confluence scans, market/technical pulls, FMP data, positioning reports, and research pulls.

For each strategy:

- Determine whether required data exists recently enough.
- Map latest evidence to the strategy's `signal_set`, `evidence_gate`, `regime_fit`, and `regime_unfit`.
- Compare the current market-cycle state against the strategy's fit/unfit regimes.
- Assign `signal_status`, `direction`, and `confidence`.
- Attach evidence links from latest relevant notes.
- Attach deeper dives from strategy research, Semantic Scholar, source-watch, news, and mechanism references.

### Thesis Signals

Thesis signals come from thesis notes, latest full-picture reports, FMP watchlist reports, thesis catalysts, agent analysis, SEC filings, macro indicator pulls, sector scans, and research/news notes.

For each thesis:

- Use thesis metadata for structural context: conviction, allocation priority, monitor status, break-risk status, core entities, key indicators, supporting regimes, and invalidation triggers.
- Use latest generated reports for tactical context: full-picture report, FMP watchlist report, catalysts, technicals, sector scan, and agent analysis.
- Pull contradictory evidence into the `risks` field rather than hiding it.
- Attach deeper dives that help the user understand the active mechanism, not just the ticker or thesis label.

### Market-Cycle Signals

Market-cycle signals come from the Research Spine market-cycle status notes, `mechanism-map.json`, macro volatility, FRED/Treasury/COT/yfinance-vol notes, GDELT/FMP news, Semantic Scholar market-cycle research, and SourceWatch.

For each cycle layer:

- Read the current cycle status where available.
- Fall back to `mechanism-map.json` when cycle status coverage is missing.
- Classify current state as stable, watch, stress, degraded, or data gap.
- Summarize the feedback loop in plain English.
- Attach deeper dives on the mechanism itself, such as liquidity, credit, rates, vol control, CTA flows, dealer gamma, carry unwind, or earnings drift.

## Deeper Dive Requirements

Every non-clear card should include at least one deeper-dive item when matching material exists. Clear cards may include deeper dives only when the topic is strategically important or coverage is weak.

Deeper dives should be chosen from:

- Vault research pulls in `05_Data_Pulls/Research`
- News pulls in `05_Data_Pulls/News`, GDELT, FMP news, NewsAPI, and SourceWatch
- Academic pulls from Semantic Scholar, arXiv, PubMed, or other research notes
- Official sources and filings already captured in the vault
- Strategy and market-cycle references from `strategy-catalog.json` and `mechanism-map.json`
- Relevant external URLs already present in source notes or pull notes

Each deeper-dive item must include:

- `topic`
- `why_it_matters`
- `source_type`
- `links`
- `questions`
- `next_action`

The markdown report renders a `Deeper Dive Queue` section with the top items grouped by strategy, thesis, and market cycle. Monitoring and briefing reports render only the top three to five items for the cadence.

## Gap Audit Requirements

Every run should review the configured strategy, thesis, and market-cycle surfaces for obvious missing signals, missing strategy coverage, and data gaps. The audit is not a separate manual workflow; it is generated from the same local vault evidence used to build signal cards.

The audit should produce:

- Missing strategy candidates when a recurring mechanism, thesis basket, or research queue has no matching strategy in `strategy-catalog.json`.
- Missing thesis signal inputs when an active thesis lacks recent full-picture, watchlist, catalyst, macro, SEC, research, or news evidence.
- Missing market-cycle inputs when a mechanism has no recent source pull, no cycle-status note, or unresolved source coverage.
- Data coverage warnings when a card is active but depends on stale, partial, or single-source evidence.

The markdown report renders these under `Missing Signals And Data Gaps`. The JSON sidecar stores them as `gap_audit` with `scope`, `name`, `gap_type`, `severity`, `evidence`, and `recommended_next_action`.

## Status Logic

Signal status is an operator-attention score, not an investment recommendation.

- `clear`: no meaningful evidence change or current evidence is neutral.
- `watch`: relevant evidence exists, but strength, freshness, or coverage is incomplete.
- `alert`: multiple evidence layers agree or a high-quality source changes the read materially.
- `critical`: urgent contradiction, severe risk state, or high-confidence regime stress that can affect multiple theses or strategies.

Confidence is separate:

- `High`: multiple fresh, independent evidence links with direct relevance.
- `Medium`: at least one strong link plus partial corroboration.
- `Low`: sparse, stale, indirect, or conflicting evidence.

Direction is separate:

- `confirming`: supports the thesis, strategy, or cycle read.
- `contradicting`: challenges the existing read.
- `mixed`: both confirming and contradicting evidence exists.
- `risk`: risk-first signal.
- `opportunity`: opportunity-first signal.

## Report Integration

`streamline-report.mjs` should add a `Canonical Signal Intelligence` section near the top, after cadence context and before the active review queue.

`research-spine-flow.mjs` should add compact signal sections to:

- Premarket Monitoring Snapshot
- Daily Monitoring Snapshot
- Midday Monitoring Snapshot
- Preclose Monitoring Snapshot
- End Of Day Monitoring Snapshot
- Daily Briefing
- End Of Day Briefing

`thesis-full-picture.mjs` should include latest canonical thesis signal and related deeper-dive items for the current thesis.

Dashboards can remain Dataview-first in this scope. Separate dashboard work can add a dedicated `Signal Intelligence Board.md` if the generated markdown report proves useful.

## Routine Placement

Daily cadence:

- Run after `market-cycle-monitor`.
- Run before `streamline-report` and `research-spine-flow`.

Weekly cadence:

- Run after Semantic Scholar, SourceWatch, agent strategy scan, disclosure, COT, and cash-flow quality.
- Run before confluence scan when possible, or allow confluence scan to consume the previous signal-intelligence sidecar if same-day order changes.

Monthly cadence:

- Run before thesis full-picture reports and conviction review when generating broad synthesis.

## Failure Behavior

The report builders must tolerate a missing signal-intelligence sidecar. If the file does not exist, they should render a short fallback line:

`No canonical signal intelligence artifact found. Run node run.mjs pull signal-intelligence.`

The puller should still write a valid markdown and JSON artifact if one scope has no matches. Empty scopes render as empty arrays with a clear coverage note.

## Testing

Add focused tests in `scripts/tests/`:

- Signal status rollup from evidence counts, freshness, and severity.
- Strategy card generation from `strategy-catalog.json` fixtures.
- Thesis card generation from a small fixture set with one full-picture report and one contradictory pull note.
- Market-cycle card generation from cycle-status fixtures and `mechanism-map.json`.
- Deeper-dive extraction from research, news, and source-watch fixtures.
- Report builders handle missing sidecar without throwing.
- Dry-run prints the generated markdown without writing files.

## Non-Goals

- No broker integration.
- No automatic trade or allocation action.
- No mutation of thesis conviction fields in the first version.
- No live web browsing inside the signal-intelligence puller; it consumes already-captured pull notes and source notes.
- No replacement of existing pullers, dashboards, or full-picture reports.

## Acceptance Criteria

- `node run.mjs pull signal-intelligence --dry-run` prints a markdown report with strategy, thesis, market-cycle, and deeper-dive sections.
- `node run.mjs pull signal-intelligence` writes the markdown report and JSON sidecar.
- The generated report includes a `Missing Signals And Data Gaps` section covering strategy, thesis, and market-cycle gaps.
- `node run.mjs pull streamline-report --dry-run` includes canonical signal cards when the sidecar exists.
- `node run.mjs pull research-spine-flow --documents daily-monitoring,daily-briefing --dry-run` includes compact signal and deeper-dive blocks when the sidecar exists.
- `node run.mjs thesis full-picture --dry-run --thesis "<name>"` includes the relevant canonical thesis signal when the sidecar exists.
- Tests pass with `node --test`.
- Vault validation remains compatible with generated pull-note frontmatter.
