---
node_type: "thesis"
name: "Capital Raise Survivors / Small-Cap Inflection Basket"
status: "Active"
conviction: "low"
timeframe: "short-medium"
allocation_priority: "watch"
allocation_rank: 3
why_now: "Small-cap screens are surfacing stressed-sector and clean-universe candidates while the capital-raise tape remains active, making dilution survival and tape repair the key edge."
variant_perception: "Most small-cap work starts with story or short interest; this thesis starts with financing risk, recent offering pressure, balance-sheet runway, and then asks which names still have credible inflection catalysts."
next_catalyst: "Clean dilution checks, post-raise digestion, positive 8-K or earnings disclosures, sector-screen persistence, and technical repair after offering overhang fades."
disconfirming_evidence: "Fresh shelves, prospectus supplements, 8-K 3.02 sales, worsening runway, or failed listing/price compliance keep appearing before business inflection."
expected_upside: "A small set of companies graduate from dilution overhang into catalyst-driven rerating candidates."
expected_downside: "Most names stay value traps or financing vehicles; the process should reject more ideas than it promotes."
position_sizing: "Research queue only; require clean SEC/dilution checks and an independent catalyst before any sizing discussion."
required_sources: ["[[Financial Modeling Prep]]", "[[SEC EDGAR API]]", "[[SEC EDGAR Search]]", "[[EDGAR Dilution Monitor]]", "[[NewsAPI]]"]
required_pull_families: ["smallcap-screen --float-max 30M --short-min 15 --no-offerings", "capital-raise --days 5", "disclosure-reality --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS", "filing-digest --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS", "dilution-monitor --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS", "fmp --thesis-watchlists --thesis Capital Raise Survivors"]
monitor_status: "watch"
monitor_last_review: "2026-04-25"
monitor_change: "Initial thesis pack created from small-cap screen, capital-raise, dilution, and disclosure-reality workflows."
break_risk_status: "watch"
monitor_action: "Run the capital-raise and dilution stack first; only then review thesis catalysts and FMP tape."
core_entities: ["[[BW]]", "[[TNC]]", "[[PPIH]]", "[[ECPG]]", "[[PRKS]]", "[[BRBR]]", "[[IIPR]]", "[[NKTR]]", "[[UFPT]]", "[[PDFS]]", "[[Small Caps]]", "[[Capital Raises]]"]
supporting_regimes: ["[[Risk-On]]", "[[Rate Cut Cycle]]", "[[Liquidity Cycle]]"]
key_indicators: ["[[Capital Raise Activity]]", "[[Shelf Registrations]]", "[[ATM/Float]]", "[[Short Interest]]", "[[Small-Cap Breadth]]", "[[10Y Treasury]]"]
bullish_drivers: ["[[Post-Raise Overhang Clearance]]", "[[Small-Cap Breadth Repair]]", "[[Disclosure Confirmation]]", "[[Technical Repair]]", "[[Catalyst Rerating]]"]
bearish_drivers: ["[[Dilution Risk]]", "[[Shelf Registration Pressure]]", "[[Listing Compliance Risk]]", "[[Thin Liquidity]]", "[[Risk-Off]]"]
invalidation_triggers: ["Strict small-cap clean screen remains empty for multiple pulls", "Fresh capital-raise filings cluster around the watchlist", "Dilution-monitor flags medium or worse risk for multiple candidates", "FMP fundamentals and disclosure checks show no credible catalyst or cash runway improvement"]
fmp_watchlist_symbols: ["BW", "TNC", "PPIH", "ECPG", "PRKS", "BRBR", "IIPR", "NKTR", "UFPT", "PDFS"]
fmp_watchlist_symbol_count: 10
fmp_primary_symbol: "BW"
fmp_technical_symbol_count: 10
fmp_technical_nonclear_count: 3
fmp_technical_bearish_count: 3
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "clear"
fmp_primary_technical_bias: "mixed"
fmp_primary_momentum_state: "neutral"
fmp_primary_rsi14: 45.84
fmp_primary_price_vs_sma200_pct: 112.23
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 1558000312
fmp_primary_trailing_pe: -49.86
fmp_primary_price_to_sales: 2.45
fmp_primary_price_to_book: -13.68
fmp_primary_ev_to_sales: 2.89
fmp_primary_ev_to_ebitda: 39.58
fmp_primary_roe_pct: 14.8
fmp_primary_roic_pct: 7.66
fmp_primary_operating_margin_pct: 5.22
fmp_primary_net_margin_pct: -5.68
fmp_primary_current_ratio: 1.22
fmp_primary_debt_to_equity: -2.8
fmp_primary_price_target: 11.25
fmp_primary_analyst_count: 4
fmp_primary_target_upside_pct: -23.88
fmp_primary_fundamentals_cached_at: "2026-04-30"
fmp_primary_snapshot_date: "2026-04-30"
fmp_calendar_symbol_count: 9
fmp_calendar_pull_date: "2026-04-30"
fmp_next_earnings_date: "2026-05-04"
fmp_next_earnings_symbols: ["IIPR", "TNC"]
fmp_last_sync: "2026-04-30"
tags: ["thesis", "smallcap", "capital-raise", "dilution", "inflection", "special-situations"]
---

## Summary
- This thesis is a financing-risk-first small-cap research queue.
- The goal is to find names where dilution overhang, sector stress, or prior capital access has been digested before a credible business catalyst appears.
- It should reject most candidates; survivors only matter after SEC, dilution, tape, and catalyst checks all line up.

## Core Logic
1. Small-cap inflections often fail because the company needs capital before the catalyst can work.
2. The useful order of operations is financing risk first, story second.
3. A candidate improves when recent offering risk is absent or already digested, runway is not urgent, tape is repairing, and disclosure evidence points to real business progress.
4. The basket is intentionally cross-sector because the edge is process-driven rather than sector-driven.

## Initial Watchlist
| Entity | Source Lens | Why It Starts In The Queue | Primary Risk |
| --- | --- | --- | --- |
| [[BW]] | Industrials small-cap queue | Stressed-sector research queue leader with liquidity and near-high momentum | Unprofitable; order-cycle risk |
| [[TNC]] | Industrials small-cap queue | Industrial small-cap screen with momentum and operating company profile | Valuation and cycle sensitivity |
| [[PPIH]] | Industrials micro-cap queue | Highest quality score in the industrial micro-cap queue | Thin liquidity and project timing |
| [[ECPG]] | Financials small-cap queue | High quality score, ROE, and low headline earnings multiple | Credit-cycle sensitivity |
| [[PRKS]] | Consumer discretionary small-cap queue | High quality score and target-upside screen | Consumer-demand sensitivity |
| [[BRBR]] | Consumer staples small-cap queue | Margin and valuation screen with defensive category exposure | Input-cost sensitivity |
| [[IIPR]] | Real estate small-cap queue | High quality score and discounted property-company profile | Rate and tenant credit sensitivity |
| [[NKTR]] | Healthcare small-cap queue | Catalyst rerating setup from healthcare screen | Clinical and dilution risk |
| [[UFPT]] | Healthcare small-cap queue | Profitable medtech-adjacent small-cap screen leader | Reimbursement and demand sensitivity |
| [[PDFS]] | Tech small-cap queue | Software/semicap-adjacent screen with gross-margin support | Multiple compression and profitability risk |

## Evidence Stack
```powershell
node run.mjs pull smallcap-screen --float-max 30M --short-min 15 --no-offerings --limit 60
node run.mjs pull smallcap-screen --float-max 75M --short-min 5 --no-offerings --market-cap-max 2000M --limit 100
node run.mjs pull capital-raise --days 5
node run.mjs pull fmp --thesis-watchlists --thesis "Capital Raise Survivors"
node run.mjs thesis catalysts --thesis "Capital Raise Survivors"
node run.mjs thesis full-picture --thesis "Capital Raise Survivors"
node run.mjs pull disclosure-reality --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS --lookback 60
node run.mjs pull filing-digest --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS --lookback 30
node run.mjs pull dilution-monitor --tickers BW,TNC,PPIH,ECPG,PRKS,BRBR,IIPR,NKTR,UFPT,PDFS --lookback 90
node run.mjs pull opportunity-viewpoints --thesis "Capital Raise Survivors"
```

## Promotion Rules
- **Reject first** when there is a fresh 424B, S-1/S-3, 8-K 3.02, ATM, listing-compliance issue, or short runway.
- **Keep in queue** when the screen is strong but disclosure or catalyst evidence is incomplete.
- **Promote to research memo** only when dilution is clean, tape is improving, and disclosure or earnings evidence can be independently confirmed.
- **Demote quickly** if the name behaves like a financing vehicle rather than an operating inflection.

## Monitor Review
- **Last review**: 2026-04-25
- **Change this week**: Initial thesis pack created.
- **Break risk status**: watch
- **Action**: Use this as a weekend first-pass queue after running the SEC/dilution stack.

## Signals to Watch
```dataview
TABLE signal_status, signals, date_pulled
FROM "05_Data_Pulls"
WHERE contains(string(tags), "smallcap") OR contains(string(tags), "capital-raise") OR contains(string(related_theses), "Capital Raise Survivors")
SORT date_pulled DESC
LIMIT 10
```
