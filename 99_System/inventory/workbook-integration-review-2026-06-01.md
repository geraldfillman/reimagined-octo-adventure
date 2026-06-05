# Workbook Integration Review - 2026-06-01

Reviewed files:

- `C:\Users\CaveUser\Desktop\2026-05-30_positioning_checklist_started.xlsx`
- `C:\Users\CaveUser\Downloads\modern_valuation_cheatsheet_workbook.xlsx`

Scope: read-only workbook review plus integration path into current `My_Data` pullers and high-value manual additions. No workbook cells were edited.

## Executive Read

Both workbooks are structurally usable and do not contain scanned formula-error literals. Neither workbook has external workbook links. The positioning workbook is the better near-term integration target because it already has explicit source maps, a COT data pack, and modules that match existing `My_Data` pullers. The valuation workbook is cleaner as a reusable single-company model, but its assumption cells are mostly example placeholders and need a company-data hydration layer before it can be trusted for live decisions.

Recommended path:

1. Make `My_Data` produce workbook-ready JSON/CSV sidecars rather than trying to make Excel call APIs.
2. Use current pullers to fill the positioning workbook first.
3. Add a valuation-assumptions exporter that hydrates the valuation workbook from FMP, SEC, FRED, and forensic-risk outputs.
4. Add missing manual pullers only where current coverage is structurally absent: ETF flows/holdings, option-chain/GEX, official margin debt, economic calendar, breadth/internals, commodity inventories beyond EIA petroleum, and peer valuation comparables.

## Workbook 1 - Positioning Checklist

File: `2026-05-30_positioning_checklist_started.xlsx`

Workbook shape:

- 30 sheets.
- No external workbook links.
- No scanned formula-error literals.
- Key tables: `JournalTable`, `VehicleMapTable`, `ChecklistTable`, `DataRangesTable`, `ScenarioTable`, `SourcesTable`.
- High-value source tabs: `Data Source Map`, `Data Ranges`, `COT`, `COT Parsed`, `Data Pack 2026-05-30`.

Primary purpose:

- Multi-module positioning and trade-readiness scorecard.
- Strongest current use: commodity/rates/macro/positioning scenario assessment.
- Best fit with the new Neo4j scenario layer: scenario vectors and CandidateLinks can feed the same modules.

Already-filled evidence:

- COT raw and parsed data are present.
- The data pack references existing artifacts for FMP price history, FRED rates, FRED liquidity, FRED credit, CBOE VIX term structure, and FMP economic calendar.
- Master scorecard modules are weighted and ready for automated module reads.

Current puller fit:

| Workbook module | Current My_Data coverage | Integration path |
|---|---|---|
| CFTC / positioning | `cftc-cot`, `positioning-checklist`, `institutional-positioning`, `positioning-report` | Keep as first-class. Export latest COT summary and percentile signals to workbook-ready JSON/CSV. |
| Regime Dashboard | `fred`, `treasury`, `cboe`, `yfinance-vol`, `macro-volatility`, `signal-intelligence`, `market-cycle-monitor` | Generate regime rows from existing FRED/Treasury/CBOE notes and sidecars. |
| Macro & Liquidity | `fred`, `treasury`, `bea`, `macro-bridges` | Fill H.4.1, reserves, RRP/TGA, yields, spreads, GDP/inflation context from pull notes. |
| Credit & Volatility | `fred`, `cboe`, `yfinance-vol` | Use HY/IG OAS, VIX/VIX3M, SKEW, MOVE/VVIX where available. |
| Commodity Confirmations | `eia`, `fred`, `cftc-cot`, `fmp-screener-batch` | Strong for energy and market proxies; partial for grains/metals inventories. |
| Catalyst Calendar | partial via `fmp`, `newsapi`, `source-watch`, `clinicaltrials`, `pubmed`, `fda`, `sec` | Needs a dedicated calendar aggregator for economic releases, FOMC, auctions, earnings, FDA, WASDE/EIA dates. |
| Breadth & Internals | partial via FMP price history and sector scans | Add a breadth/internals puller or extend FMP/yfinance logic. |
| Intermarket Map / Correlation Matrix | `fmp`, `neo4j-fmp-metric-snapshots`, FMP harvest price history | Compute rolling correlations and relative strength from price sidecars. |
| ETF & Fund Flows | weak/manual | Add ETF flows/holdings puller from sponsor/ETF.com/ICI or a paid provider. |
| Options & Volatility | `cboe`, `yfinance-vol`, partial FMP options paths | Add option-chain snapshot/GEX/IV-rank puller. Unusual Whales is the best named paid source from the workbook. |
| Short Interest & Squeeze | `finra-positioning`, `sec-ftd` if used | Good start. Add official margin debt and borrow-fee provider if needed. |
| Sentiment & Leverage | partial via `newsapi`, `gdelt`, `source-watch`; no AAII/margin debt automation | Add AAII/sentiment and FINRA margin statistics pullers. |
| Single-Stock Risk | `fmp`, `sec`, `forensic-risk`, `company-risk-scan`, `portfolio-health` | Strong. Add workbook exporter that summarizes risk flags by ticker. |

Near-term automation:

- Add a `positioning-workbook-export` synthesis command that reads existing sidecars and writes a single workbook-input JSON:
  - `05_Data_Pulls/Positioning/YYYY-MM-DD_Positioning_Workbook_Input.json`
  - optional CSV sheets under `99_System/exports/workbooks/positioning/YYYY-MM-DD/`
- Do not overwrite the workbook by default. Keep workbook hydration as an explicit export step.
- Reuse `positioning-checklist` as the primary synthesis surface. It already knows several missing/manual areas and should become the workbook bridge.

## Workbook 2 - Modern Valuation Cheat Sheet

File: `modern_valuation_cheatsheet_workbook.xlsx`

Workbook shape:

- 10 sheets.
- No external workbook links.
- No scanned formula-error literals.
- Key tables: `AssumptionsTable`, `DashboardValuesTable`, `ValuationChecklistTable`, `SourcesTable`.
- Main dependency: most valuation tabs reference `Assumptions`.

Primary purpose:

- Single-company valuation model with Graham, DCF, residual income, justified multiples, quality/growth, and balance safety modules.
- Best fit with `My_Data`: a ticker-level valuation-assumption exporter, not a broad dashboard.

Important caveat:

- `Assumptions` is full of illustrative placeholder values (`ExampleCo Inc.`, `EXMPL`, example EPS/FCF/debt/growth/margins). The workbook is formula-ready but not source-ready.

Current puller fit:

| Assumption area | Current My_Data coverage | Integration path |
|---|---|---|
| Price, market cap, shares | `fmp`, `neo4j-fmp-metric-snapshots` | Use FMP quote/profile and MetricSnapshots for current price and market cap. |
| EPS, revenue, EBIT, EBITDA, debt, cash, current assets/liabilities | `fmp`, `sec`, `fmp-harvest` | Pull latest financial statements and normalize into assumption fields. |
| FCF per share / total FCF | `fmp`, SEC cash flow statements | Compute from operating cash flow minus capex divided by diluted shares. |
| Book value per share | `fmp`, SEC balance sheet | Hydrate directly where available, or compute from equity / diluted shares. |
| Growth assumptions | partial from FMP estimates, SEC history, analyst data if available | Keep as human-reviewed assumptions; exporter can provide historical CAGRs and suggested ranges, not final values. |
| Discount rate / WACC / cost of equity | `fred`, `treasury`, `fmp` beta/profile if available | Use Treasury/FRED rates as base; keep ERP and company risk premium explicit/manual. |
| AAA corporate bond yield | `fred` | Fill DAAA directly. |
| Target multiples | `fmp-screener-batch`, FMP peers if available | Add peer-comparable exporter; do not hard-code multiples from a single source. |
| Balance safety | `forensic-risk`, `company-risk-scan`, FMP/SEC | Feed net debt/EBITDA, interest coverage, current ratio, Altman/Beneish/Piotroski flags. |

Near-term automation:

- Add a `valuation-workbook-export` manual synthesis puller:
  - input: `--ticker AAPL`
  - output: `05_Data_Pulls/Valuation/YYYY-MM-DD_AAPL_Valuation_Workbook_Input.json`
  - optional CSV: `99_System/exports/workbooks/valuation/YYYY-MM-DD/AAPL_assumptions.csv`
- Keep growth assumptions and discount-rate judgments as guarded/manual fields with suggested ranges and evidence links.
- Add a source-confidence column in the export so workbook users can see whether each assumption came from FMP, SEC, FRED, or manual review.

## Existing Pullers To Use First

Use these before adding new infrastructure:

- `cftc-cot`: COT positioning and futures crowding.
- `positioning-checklist`: synthesis bridge for the first workbook.
- `institutional-positioning` and `positioning-report`: positioning synthesis and narrative output.
- `finra-positioning`: short interest, Reg SHO short sale volume, threshold list, OTC summary.
- `fmp`: quote/profile/fundamental/technical/economic calendar surfaces.
- `fmp-harvest`: deeper raw FMP archive/backfill where available.
- `neo4j-fmp-metric-snapshots`: BOD/EOD price/volume MetricSnapshots into Neo4j.
- `fred`: rates, liquidity, credit, macro series.
- `treasury`: Treasury rates and related official data.
- `cboe` and `yfinance-vol`: VIX/SKEW/term structure/MOVE-style volatility surfaces.
- `eia`: energy inventories/demand/generation.
- `sec`: filings, XBRL, disclosure/event support.
- `forensic-risk` and `company-risk-scan`: valuation and single-stock risk overlays.
- `sector-scan`, `fmp-screener-batch`, `macro-bridges`: sector/thematic context.
- `newsapi`, `gdelt`, `source-watch`: narrative/catalyst monitoring.

## Valuable Manual Additions

Highest value additions for the positioning workbook:

1. `finra-margin-statistics`
   - Source: FINRA margin debt statistics.
   - Fills: `Sentiment & Leverage`, margin-debt shock vector, leverage fragility scenarios.
   - Output: dated margin debit balances, free credit balances, net credit/debit trend.

2. `economic-calendar`
   - Sources: BLS, BEA, Fed, Treasury auction calendar, FOMC calendar, FMP economic calendar as fallback.
   - Fills: `Catalyst Calendar`.
   - Output: dated high-impact release calendar with expected affected modules.

3. `option-chain-snapshot`
   - Sources: Unusual Whales if available; otherwise OCC/Cboe/broker/FMP partial.
   - Fills: `Options & Volatility`, `Short Interest & Squeeze`.
   - Output: IV rank/percentile, skew, option OI, bid/ask quality, max pain/GEX if provider supports it.

4. `etf-flow-holdings`
   - Sources: sponsor pages, ETF.com/ETFdb/ICI, FMP ETF holdings if available.
   - Fills: `ETF & Fund Flows`, `Vehicle Map`.
   - Output: AUM, ADV, spread, expense ratio, holdings, flows as percent of AUM.

5. `market-breadth-internals`
   - Sources: exchange breadth where accessible, FMP/yfinance-derived universe calculations, sector ETF internals.
   - Fills: `Breadth & Internals`, `Regime Dashboard`.
   - Output: advance/decline, percent above moving averages, new highs/lows, sector breadth.

6. `commodity-inventory-crosscheck`
   - Sources: EIA for energy, USDA WASDE/crop progress, NOAA weather, LME/SHFE inventories where available.
   - Fills: `Commodity Confirmations`.
   - Output: inventory surprise, trend, seasonal context, physical confirmation score.

Highest value additions for the valuation workbook:

1. `valuation-workbook-export`
   - Synthesis puller that hydrates `AssumptionsTable` from current FMP/SEC/FRED evidence.

2. `peer-comparable-set`
   - Builds peer lists and comparable multiples by ticker/sector/industry.

3. `fundamental-history-normalizer`
   - Produces 5-year normalized revenue, EPS, FCF/share, margins, ROIC, and share count trends.

4. `wacc-assumption-helper`
   - Combines FRED/Treasury base rates, beta/profile data, leverage, and explicit manual ERP assumptions into suggested discount-rate ranges.

## Integration Roadmap

Phase 1 - No workbook writes:

- Add JSON/CSV exports from current pullers for both workbooks.
- Positioning output path:
  - `99_System/exports/workbooks/positioning/YYYY-MM-DD/`
- Valuation output path:
  - `99_System/exports/workbooks/valuation/YYYY-MM-DD/<TICKER>/`
- Keep all manual gaps explicit.

Phase 2 - Workbook hydration:

- Add optional scripts that copy a workbook and populate named tables/cells from the JSON/CSV exports.
- Never overwrite the user's source workbook by default.
- Output copies should use `_hydrated_YYYY-MM-DD` suffixes.

Phase 3 - Neo4j integration:

- Convert workbook module reads into `MetricSnapshot`, `SignalObservation`, `Scenario`, `ShockVector`, `RiskTheme`, and `CandidateLink` nodes.
- Positioning workbook feeds scenario exposure discovery.
- Valuation workbook feeds single-stock `CandidateLink` proposals and risk/valuation dashboard panels.

Phase 4 - Review workflows:

- Add dashboard queries for:
  - missing workbook inputs,
  - stale evidence,
  - high-conviction scenario exposures,
  - valuation gaps by ticker,
  - sectors/stocks with many unresolved CandidateLinks.

## Guardrails

- Do not fabricate values to make workbook warnings disappear.
- Treat growth rates, target multiples, WACC, cost of equity, and scenario probabilities as suggested/manual unless a specific model is adopted.
- Raw acquisition pullers remain manual-only unless explicitly promoted.
- Prefer source-linked export sidecars over direct workbook mutation.
- For valuation, always distinguish reported data, derived data, and judgment assumptions.
