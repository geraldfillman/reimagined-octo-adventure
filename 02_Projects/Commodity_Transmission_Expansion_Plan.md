---
title: Commodity → Company Transmission Expansion Plan
type: project
status: phase-1-built
created: 2026-07-31
updated: 2026-07-31
tags: [project, commodities, bonds, futures, sentiment, transmission]
---

# Commodity → Company Transmission Expansion Plan

> **Phase 1 built 2026-07-31.** Live commands:
> - `node run.mjs pull fred --group commodities` — record commodity price pulls
> - `node run.mjs pull commodity-transmission` — scan + emit routed signals (`--dry-run`, `--commodity <key>`)
> - `node run.mjs pull koyfin-ingest` — ingest CSVs from `00_Inbox/exports/koyfin/`
> - `node run.mjs pull webhook-listen` — Sitdeck alert receiver on 127.0.0.1:8787 (`WEBHOOK_SECRET` in `.env` to lock down)
> Map: `scripts/config/transmission-map.json`. Entities: `08_Entities/Commodities/` (merged into existing Oil/Copper/Natural Gas/Wheat notes).
>
> **Phase 2 (partial) built 2026-07-31.** `node run.mjs pull bond-stress` — composite curve + credit + real-yield regime (calm/tightening/stress), surfaced on the Macro Regime dashboard (`data_type: bond_regime`). FRED rates group extended with T10Y3M, BAA10Y, DFII10. 
> **Phase 2 completed 2026-07-31** + acquisition layer added:
> - `node run.mjs pull refinancing-exposure` — XBRL screens (interest coverage, maturity wall vs cash, leverage) across the 132-ticker thesis universe; escalates to signals only when bond regime ≠ calm (`--thesis`, `--tickers`, `--limit`)
> - `node run.mjs pull acquisition-radar` — M&A filings (8-K 2.01/1.01, S-4, 425, DEFM14A, SC TO-T) with strategic-intent classification: what each acquisition is trying to accomplish (capacity, vertical integration, tech/talent, market expansion, consolidation, pipeline, diversification). Taxonomy in `INTENT_CATEGORIES`.
> - Both surfaced on the Company Risk Board dashboard (`data_type: refinancing_exposure` / `acquisition_radar`).

Goal: connect commodity prices, the bond market, futures term structure, and market noise to the **companies and theses they actually affect** — so a copper squeeze or fertilizer spike surfaces as a routed signal on the right thesis, not just a data point.

**Constraint:** FMP is free tier only (~250 calls/day, limited endpoints). The build leans on free government APIs (FRED, EIA, CFTC, Treasury, SEC EDGAR) for automation, plus **manual exports** from subscription platforms and **Sitdeck webhook alerts**.

## Data source map (revised)

| Need | Automated (free) | Export-based | Notes |
|---|---|---|---|
| Commodity prices | FRED (WTI `DCOILWTICO`, Henry Hub `DHHNGSP`, copper/wheat/corn IMF monthly series), EIA daily energy | KoyFin (daily granularity, broad universe) | FRED daily for energy; metals/ags are monthly → KoyFin export fills the gap |
| Futures term structure | **EIA futures contracts 1–4** (WTI, nat gas — free term structure!) | TastyTrade (futures chains for metals/ags) | Contango/backwardation flag |
| Positioning | CFTC COT (already live in `cot-report.mjs`) | Unusual Whales (options flow, dark pool) | Extend COT universe: copper, nat gas, wheat, corn |
| Bond market | FRED (HY OAS `BAMLH0A0HYM2`, `BAA10Y`, curve, real yields), TreasuryDirect auctions (`treasury.mjs` exists) | KoyFin (bond indices) | All core bond-stress inputs are free |
| Company exposure | SEC EDGAR (`sec.mjs` — debt maturities, input-cost risk factors from 10-K/10-Q) | KoyFin (financials), Mergent Intellect, NetAdvantage | NetAdvantage industry surveys = input-cost structure per industry → calibrates the transmission map |
| Industry cost structures | — | Statista, NetAdvantage, Mergent | One-time research per transmission edge, not recurring pulls |
| Noise / sentiment | reddit, snscrape, gdelt, newsapi (all live) | Unusual Whales (flow alerts) | Fusion is the gap, not sources |
| Real-time alerts | **Sitdeck webhooks** | — | Needs a local receiver |

## New infrastructure: intake layer

Two new entry points, both writing normalized pull notes onto the existing rail:

1. **Export inbox** — `00_Inbox/exports/<source>/` drop folders. `scripts/ingest/` gets one parser per source (`koyfin.mjs`, `unusual-whales.mjs`, `tastytrade.mjs`, `mergent.mjs`); `node run.mjs ingest --source koyfin` (or `--all`) detects new CSV/XLSX files, normalizes to pull notes in `05_Data_Pulls/<domain>/`, archives the raw file. Validate schema on ingest; fail loudly on format drift.
2. **Webhook receiver** — `node run.mjs webhook-listen`: small local HTTP listener; Sitdeck alerts land as JSON, get written to `05_Data_Pulls/Alerts/` with source/timestamp frontmatter, then routed by the transmission map like any other signal input. (If the machine isn't always on, fallback: Sitdeck → email → periodic poll.)

## Phase 1 — Commodity spine (free-first)

1. **FRED commodity group** in `fred.mjs`: WTI, Henry Hub, copper, wheat, corn, soybeans, fertilizer proxy (nat gas + DAP where available). Zero new API dependencies.
2. **KoyFin ingest parser** for daily metals/ags granularity (weekly export cadence is fine — transmission lags are measured in weeks/quarters).
3. **Commodity entity notes** (`08_Entities/Commodities/`) from the existing `03_Templates/Commodity.md` — one per commodity with a `transmission` frontmatter block.
4. **Transmission map config** (`scripts/config/transmission-map.mjs`) — the key artifact. Hand-curated edges, calibrated from NetAdvantage/Statista industry cost data:
   - `crude_oil ↓ → construction/asphalt cost relief (+, lag 1-2q); E&P capex cuts (−); refiner crack spreads (±)`
   - `copper ↑ → electrical equipment/grid buildout margin squeeze (−); miners (+); data-center capex inflation (−)`
   - `nat_gas ↑ → ammonia/fertilizer cost ↑ → farm input inflation → food producer/grocer margins (−, lag 2-3q)`
   Each edge: direction, affected sectors, example tickers, linked theses, typical lag, trip threshold.
5. **`commodity-transmission.mjs` puller**: compare latest prices vs 20d/60d baselines; on threshold trip, walk the map and emit signal notes to `06_Signals/` routed to affected theses (same rail as `sector-scan`).

## Phase 2 — Bond market stress layer (fully free)

1. Extend FRED rates group: HY OAS, BAA10Y, 2s10s + 3m10s, DFII10 real yields.
2. **`bond-stress.mjs`**: composite regime (curve shape + credit spreads + `macro-volatility` stress) → `bond_regime` note consumed by Macro Regime dashboard and `confluence-scan`.
3. **Company refinancing exposure**: interest coverage + maturity walls from SEC EDGAR filings (supplement with KoyFin/Mergent exports for clean numbers). Levered watchlist names flagged when `bond_regime = stress` — builders, REITs, levered small caps hit first.

## Phase 3 — Futures term structure

1. Extend `cot-report.mjs` universe (CFTC file already parsed): copper, nat gas, wheat, corn.
2. **Energy curve from EIA** (free, contracts 1–4): contango/backwardation flag for WTI + nat gas.
3. **Metals/ags curve from TastyTrade export**: futures chain export → same curve calc. Backwardation = tight physical supply → transmission edges fire with higher confidence.

## Phase 4 — Noise fusion ("narrative heat")

1. **`narrative-heat.mjs`**: fuse reddit + snscrape + gdelt + newsapi + Unusual Whales flow per ticker/commodity: mention velocity, sentiment direction, unusual options activity.
2. **Divergence detector** (the alpha): `heat ↑ + fundamentals flat` = fade candidate; `fundamentals moving + heat quiet` = under-owned. Reuses `positioning-report` big-money-vs-retail logic; Unusual Whales flow gives the institutional side retail chatter can't.
3. Sitdeck alerts overlay as the real-time trigger channel.
4. **Transmission Board** dashboard: commodity moves → tripped edges → affected theses/tickers → bond regime overlay → narrative heat column.

## Sequencing & effort

Phase 1 is the unlock (FRED group + map + puller + one ingest parser, ~2-3 sessions). Phase 2 extends existing plumbing. Phase 3 is small. Phase 4 is the most new code but all sources already pull. The intake layer (inbox + webhook) is shared infrastructure — build it in Phase 1.

## Maintenance flag

`AGENTS.md` states "FMP Premium is the active financial-data backbone" — now stale. Audit `fmp.mjs` and dependents for premium-only endpoints (screener, technicals, watchlist bulk calls likely affected) and either degrade gracefully to free-tier limits or reroute to KoyFin exports. Update AGENTS.md once resolved.

## Open questions

- Which theses get first-class transmission edges first? (Suggest: energy, housing, biofood — cleanest commodity mappings.)
- Sitdeck webhook payload format — need one sample alert to build the receiver parser.
- Export cadence you can sustain (weekly KoyFin/UW export is enough; daily is better for narrative heat).
