---
title: "AI Agent Streamline Report"
source: "Vault Orchestrator"
report_schema_version: 1
run_id: "orchestrator-daily-2026-06-23"
date_pulled: "2026-06-23"
domain: "orchestrator"
data_type: "streamline_report"
frequency: "daily"
cadence: "daily"
focus: "all"
signal_status: "alert"
signals: ["streamline_gap_auction_feature_engine", "streamline_gap_anomaly_and_cash_flow_quality_engine", "streamline_gap_pair_relative_value_engine"]
report_window_days: 14
source_window_start: "2026-06-09"
source_window_end: "2026-06-23"
report_since: "2026-06-09"
active_review_count: 16
coverage_gap_count: 3
new_since_last_report: 16
resolved_since_last_report: 16
guide_source: "[[ai_agent_monitoring_data_pull_guide]]"
tags: ["streamline-report", "agent-monitoring", "orchestrator", "decision-support"]
---

## Canonical Signal Intelligence

| Scope | Signal | Status | Direction | Confidence | Summary | Next Action |
| --- | --- | --- | --- | --- | --- | --- |
| thesis | Semiconductor Sovereignty & CHIPS Act | alert | mixed | Medium | Semiconductor Sovereignty & CHIPS Act has 10 matching evidence item(s). Missing inputs: full-picture, catalyst, macro, research/news. | Refresh full-picture evidence before changing conviction. |
| market-cycle | Dollar Funding Stress | alert | risk | Medium | Dollar Funding Stress has matching evidence but no current cycle-status note. | Run market-cycle-monitor and refresh the missing source pull for this mechanism. |
| market-cycle | RRP Unwind | alert | risk | Medium | RRP Unwind has matching evidence but no current cycle-status note. | Run market-cycle-monitor and refresh the missing source pull for this mechanism. |
| market-cycle | TGA Drain/Refill Effect | alert | risk | Medium | TGA Drain/Refill Effect has matching evidence but no current cycle-status note. | Run market-cycle-monitor and refresh the missing source pull for this mechanism. |
| strategy | Convex Tail Hedge | watch | risk | Low | Data coverage is incomplete for fred.credit. Current cycle context is unfavorable: Guidance Compression Cycle. | Refresh fred.credit coverage before upgrading Convex Tail Hedge. |
| strategy | Credit-Stress Value | watch | mixed | Medium | Credit-Stress Value has 4 matching evidence item(s). Data coverage is incomplete for fred.credit, fmp.statements. | Refresh fred.credit coverage before upgrading Credit-Stress Value. |
| strategy | Cross-Asset Trend Following | watch | mixed | Low | Data coverage is incomplete for fmp.commodity, fmp.forex. | Refresh fmp.commodity coverage before upgrading Cross-Asset Trend Following. |
| strategy | Deep Value Rerating | watch | mixed | Medium | Deep Value Rerating has 4 matching evidence item(s). Data coverage is incomplete for fmp.statements, fmp.insider, fmp.news. | Refresh fmp.statements coverage before upgrading Deep Value Rerating. |
| strategy | Defensive Rotation Late Cycle | watch | mixed | Low | Data coverage is incomplete for fred.credit. | Refresh fred.credit coverage before upgrading Defensive Rotation Late Cycle. |
| strategy | GARP with Estimate Revisions | watch | mixed | Low | Data coverage is incomplete for fmp.analyst, fmp.calendars. | Refresh fmp.analyst coverage before upgrading GARP with Estimate Revisions. |

## Canonical Deeper Dive Queue

| Topic | Source | Why It Matters | Questions | Next Action | Links |
| --- | --- | --- | --- | --- | --- |
| Curriculum | reference | Curriculum is a reference point for understanding Quality Compounders. | How does Curriculum explain the current Quality Compounders signal?; What would make this reference less relevant today? | Open Curriculum and compare it with the latest signal evidence. | Curriculum |
| SEC EDGAR Sector Overview — Consumer | official | Deep Value Rerating depends on understanding SEC EDGAR Sector Overview — Consumer and whether it confirms or challenges the current signal. | What does SEC EDGAR Sector Overview — Consumer change about Deep Value Rerating?; Which evidence would confirm or invalidate this read? | Read SEC EDGAR Sector Overview — Consumer and capture one takeaway in the relevant review note. | 05_Data_Pulls/Sectors/2026-06-23_SEC_consumer-discretionary_Overview.md |
| SEC EDGAR Sector Overview — Consumer | official | Deep Value Rerating depends on understanding SEC EDGAR Sector Overview — Consumer and whether it confirms or challenges the current signal. | What does SEC EDGAR Sector Overview — Consumer change about Deep Value Rerating?; Which evidence would confirm or invalidate this read? | Read SEC EDGAR Sector Overview — Consumer and capture one takeaway in the relevant review note. | 05_Data_Pulls/Sectors/2026-06-05_SEC_consumer-discretionary_Overview.md |
| Consumer Discretionary Sector Basket - 2026-06-05 | official | Deep Value Rerating depends on understanding Consumer Discretionary Sector Basket - 2026-06-05 and whether it confirms or challenges the current signal. | What does Consumer Discretionary Sector Basket - 2026-06-05 change about Deep Value Rerating?; Which evidence would confirm or invalidate this read? | Read Consumer Discretionary Sector Basket - 2026-06-05 and capture one takeaway in the relevant review note. | 05_Data_Pulls/Sectors/2026-06-05_Consumer_Discretionary_Sector.md |
| News: commodities | news | Hard Asset Carry depends on understanding News: commodities and whether it confirms or challenges the current signal. | What does News: commodities change about Hard Asset Carry?; Which evidence would confirm or invalidate this read? | Read News: commodities and capture one takeaway in the relevant review note. | 05_Data_Pulls/News/2026-06-23_News_commodities.md |

## Executive Brief

- **Regime**: Active risk watch. One or more alert-level notes are active.
- **Manual review candidates**: 16 item(s) since 2026-06-09; worst status is alert.
- **Agent coordination**: Agent Analysis Thesis Rollup is the latest rollup (2026-06-23).
- **Primary workflow**: review top queue items, tag edge type, and journal the decision
- **Guide gaps**: Auction feature engine, Anomaly and cash-flow quality engine, Pair / relative-value engine
- **Execution rail**: Research and manual review only. No broker-write action is generated by this report.

## Daily Operating Questions

| Question | Current Read | Action |
| --- | --- | --- |
| What regime are we in? | Active risk watch: One or more alert-level notes are active. | Promote only alerts with clear invalidation and liquidity checks. |
| Which edge types are active? | macro-volatility / structural, behavioral / information, fundamental quality, crowding / agent monoculture | Tag any reviewed alert with one explicit edge type. |
| Which strategy families fit? | macro regime and risk-off/risk-on channel, PEAD, catalyst, and anomaly review, cash-flow quality and quality earnings drift, agent entropy and narrative crowding risk | Keep strategy expression separate from the signal. |
| What assets or pairs show signals? | FRED Liquidity Pull, FRED Housing Pull, Sector Scan Summary - 2026-06-23, SEC EDGAR Sector Overview — Clean Energy, SEC EDGAR Sector Overview — Technology, SEC EDGAR Sector Overview — Real Estate, SEC EDGAR Sector Overview — Industrials, SEC EDGAR Sector Overview — Healthcare | Pair engine is not live; do not infer pair signals. |
| Is price at a meaningful auction location? | Unknown: no auction feature note found. | Use manual chart/profile review before acting on auction claims. |
| Is there a catalyst? | Calendar layer is present. | Check earnings, macro events, SEC filings, and headline risk. |
| Is expression liquid and allowed? | Manual Fidelity review required; no automated options liquidity approval. | Check bid/ask, OI, volume, event dates, max loss, and permission level. |
| Is the idea crowded? | Agent entropy is available for latest analyzed symbols. | Downgrade crowded narratives unless confirmation improves. |
| What proves the thesis wrong? | Use alert-specific invalidation plus thesis invalidation triggers. | Write one disconfirming condition before any manual action. |
| Review, ignore, or journal? | Review top queue items; journal the decision or non-decision. | Record outcome for weekly false-positive review. |

## Active Alerts And Manual Review

| Status | Severity | Item | Domain | Date | Freshness | Confidence | Coverage | Disposition | Evidence | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| alert | MED | FRED Liquidity Pull | Macro | 2026-06-23 | Fresh | 50% | 0/4 | Review | — | [[2026-06-23_FRED_Liquidity]] |
| alert | MED | FRED Housing Pull | Housing | 2026-06-23 | Fresh | 50% | 0/4 | Review | — | [[2026-06-23_FRED_Housing]] |
| watch | LOW | Sector Scan Summary - 2026-06-23 | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_Sector_Scan_Summary]] |
| watch | LOW | SEC EDGAR Sector Overview — Clean Energy | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_utilities_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Technology | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_tech_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Clean Energy | Government | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_Sectors]] |
| watch | LOW | SEC EDGAR Sector Overview — Real Estate | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_real-estate_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Industrials | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_materials_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Industrials | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_industrials_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Healthcare | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_healthcare_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Financials | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_financials_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Energy | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_energy_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Consumer | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_consumer-staples_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Consumer | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_consumer-discretionary_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Technology | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_communication-services_Overview]] |
| watch | LOW | SEC EDGAR Sector Overview — Industrials | Sectors | 2026-06-23 | Fresh | 50% | 0/4 | Journal | — | [[2026-06-23_SEC_aerospace-defense_Overview]] |

## Edge And Strategy Map

| Edge Type | Strategy Family | Status | Evidence |
| --- | --- | --- | --- |
| macro-volatility / structural | macro regime and risk-off/risk-on channel | active | [[2026-06-05_FMP_EconomicCalendar]] |
| execution / auction | auction entry monitor and opening range review | gap | Need POC, VAH, VAL, TPO, and anchored VWAP features. |
| behavioral / information | PEAD, catalyst, and anomaly review | partial | [[2026-06-23_FMP_Earnings_Calendar_Thesis_Watchlists]] |
| statistical / relative value | pair mean reversion and relationship breaks | gap | Need pair ratios, z-scores, correlations, and relationship status. |
| fundamental quality | cash-flow quality and quality earnings drift | partial | Watchlist fundamentals are present. |
| crowding / agent monoculture | agent entropy and narrative crowding risk | partial | [[2026-06-23_Agent_Analysis_All_Theses]] |
| positioning divergence | big money vs retail positioning | partial | 5 positioning signal(s) from 2026-05-02 |
| manual execution quality | options review assistant | gap | Need bid/ask, OI, volume, IV, assignment, and event-date checklist. |

## Technical And Auction Proxies

_No FMP technical snapshots found. Run `node run.mjs pull fmp --technical SPY` or thesis watchlists._

## Agent And Crowding Read

| Symbol | Verdict | Confidence | Entropy | Status | Note |
| --- | --- | --- | --- | --- | --- |
| VST | NEUTRAL | 19% | diffuse (0.990) | clear | [[2026-06-23_Agent_Analysis_VST]] |
| STRL | NEUTRAL | 19% | diffuse (0.860) | clear | [[2026-06-23_Agent_Analysis_STRL]] |
| PLTR | NEUTRAL | 32% | diffuse (0.980) | clear | [[2026-06-23_Agent_Analysis_PLTR]] |
| NRG | NEUTRAL | 29% | diffuse (1.000) | clear | [[2026-06-23_Agent_Analysis_NRG]] |
| MSFT | BEARISH | 41% | diffuse (0.910) | watch | [[2026-06-23_Agent_Analysis_MSFT]] |
| GEV | NEUTRAL | 27% | diffuse (0.880) | clear | [[2026-06-23_Agent_Analysis_GEV]] |
| ETN | NEUTRAL | 18% | diffuse (0.940) | clear | [[2026-06-23_Agent_Analysis_ETN]] |
| AMZN | NEUTRAL | 19% | diffuse (0.970) | clear | [[2026-06-23_Agent_Analysis_AMZN]] |

## Big Money Vs Retail Positioning

| Asset / Theme | Current Signal | Score | Confidence | Action | Evidence |
| --- | --- | --- | --- | --- | --- |
| XOM | Institutions buying / retail ignoring | 5 | Medium | Needs confirmation | [[2026-05-02_Big_Money_vs_Retail_Positioning_Report]] |
| MSFT | No clear signal | 4 | Medium | Watchlist only | [[2026-05-01_Agent_Analysis_MSFT]], [[2026-05-01_Agent_Analysis_MSFT]] |
| SPY | No clear signal | 3 | Medium | Watchlist only | [[2026-05-01_Entropy_Monitor_META_QCOM_PPL_IRM_GOOGL_CAH_FE_GOOG_BMY_AME_MO_PWR_TWLO_ORLY_EXC_FTAI_EBAY_BRO_AIG_TER]], [[2026-05-01_Entropy_Monitor_SPY_QQQ]] |
| QQQ | No clear signal | 2 | Medium | Watchlist only | [[2026-05-01_Entropy_Monitor_META_QCOM_PPL_IRM_GOOGL_CAH_FE_GOOG_BMY_AME_MO_PWR_TWLO_ORLY_EXC_FTAI_EBAY_BRO_AIG_TER]], [[2026-05-01_Entropy_Monitor_SPY_QQQ]] |
| NVDA | No clear signal | 2 | Medium | Watchlist only | [[2026-05-01_FMP_BalanceSheet_NVDA]], [[2026-05-01_FMP_BalanceSheet_NVDA]] |

## Catalyst And PEAD Watch

| Layer | Latest Read | Date | Status | Note |
| --- | --- | --- | --- | --- |
| Earnings calendar | FMP Earnings Calendar - Thesis Watchlists (2026-06-23 to 2026-07-07) | 2026-06-23 | clear | [[2026-06-23_FMP_Earnings_Calendar_Thesis_Watchlists]] |
| Macro calendar | Economic Calendar — FMP (2026-06-05 to 2026-07-05) | 2026-06-05 | watch | [[2026-06-05_FMP_EconomicCalendar]] |
| Opportunity viewpoints | Opportunity Viewpoints | 2026-06-23 | clear | [[2026-06-23_Opportunity_Viewpoints]] |

## Manual Fidelity Checks

| Candidate | Edge | Strategy | Why Review | Invalidation | Next Action |
| --- | --- | --- | --- | --- | --- |
| FRED Liquidity Pull | macro-volatility / structural | macro regime shift | alert from Macro | Macro regime stabilizes, stress indicator reverses, or policy guidance changes. | Review or journal; no automated execution. |
| FRED Housing Pull | review required | unclassified | alert from Housing | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| Sector Scan Summary - 2026-06-23 | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Clean Energy | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Technology | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Clean Energy | macro-volatility / structural | macro regime shift | watch from Government | Macro regime stabilizes, stress indicator reverses, or policy guidance changes. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Real Estate | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Industrials | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Industrials | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Healthcare | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Financials | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Energy | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Consumer | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Consumer | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Technology | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |
| SEC EDGAR Sector Overview — Industrials | review required | unclassified | watch from Sectors | The cited signal clears, fails confirmation, or contradicting evidence appears. | Review or journal; no automated execution. |

## Deeper Learning Queue

| Flagged Topic | Why It Matters | Resources | Next Study Action |
| --- | --- | --- | --- |
| Macro regime reading | Macro flags affect position sizing, signal confidence, credit channels, and sector rotation. | [[2026-06-23_FRED_Liquidity]]<br>[FRED](https://fred.stlouisfed.org/)<br>[Federal Reserve monetary policy](https://www.federalreserve.gov/monetarypolicy.htm)<br>[Treasury Fiscal Data](https://fiscaldata.treasury.gov/) | Write a three-step transmission map: rates/credit/liquidity -> sectors -> thesis impact. |
| EDGAR filing interpretation | SEC filings are slower but higher-quality evidence than headlines when a company or thesis is flagged. | [[2026-06-23_Sector_Scan_Summary]]<br>[SEC EDGAR search](https://www.sec.gov/edgar/search/)<br>[SEC Form 8-K investor guide](https://www.sec.gov/files/form8-k.pdf) | Read the filing item number first, then extract the event, counterparty, timing, and what would invalidate the story. |
| Clinical and regulatory catalyst reading | Biotech/regulatory headlines require trial design, endpoint, safety, and approval-path context. | [[2026-06-23_SEC_materials_Overview]]<br>[ClinicalTrials.gov](https://clinicaltrials.gov/)<br>[Drugs@FDA](https://www.accessdata.fda.gov/scripts/cder/daf/)<br>[PubMed](https://pubmed.ncbi.nlm.nih.gov/) | Identify phase, endpoint, comparator, enrollment, sponsor language, and the next regulatory date. |
| Behavioral finance and edge taxonomy | The report needs every signal tagged as behavioral, structural, statistical, information, execution, risk-premium, or crowding. | [[Reading Modes]]<br>[AQR research library](https://www.aqr.com/Insights/Research)<br>Study post-event drift, momentum, value, quality, carry, and crowding as distinct edge families. | Define one local edge taxonomy note and require each alert to choose one primary edge type. |
| Cash-flow quality and accruals | Quality and PEAD reads need cash-flow conversion, accruals, balance-sheet durability, and share-count context. | [Sloan accrual anomaly search](https://scholar.google.com/scholar?q=Sloan+1996+accrual+anomaly)<br>Read cash flow statement, balance sheet, margins, CapEx, debt, and share-count trend. | Add a cash-flow quality score before promoting quality earnings drift candidates. |
| Pairs and relative-value statistics | Pair signals require z-scores, correlation stability, beta, and relationship-break awareness. | [Pairs trading paper search](https://scholar.google.com/scholar?q=pairs+trading+distance+cointegration+Gatev+Goetzmann+Rouwenhorst)<br>Review rolling z-score, rolling correlation, hedge ratio, half-life, and regime shift concepts. | Build a small pair metrics note before treating any spread as mean-reverting. |

## Coverage Gaps From Guide

| Module | Status | Current Evidence | Next Build Step |
| --- | --- | --- | --- |
| Read-only market dashboard | partial | 0 technical snapshot(s), 8 watchlist report(s) | Keep daily FMP watchlist and technical pulls in the routine. |
| Auction feature engine | gap | No POC/VAH/VAL/AVWAP note found. | Add intraday profile, TPO, anchored VWAP, and auction state notes. |
| Strategy-to-edge classifier | partial | [[2026-06-23_Agent_Analysis_All_Theses]], [[2026-06-23_Opportunity_Viewpoints]] | Persist edge_type and strategy_family on every alert card. |
| Anomaly and cash-flow quality engine | gap | 0 PEAD note(s), 0 cash-flow/fundamental note(s) | Add earnings surprise, post-event AVWAP, FCF conversion, accrual, and quality scoring. |
| Pair / relative-value engine | gap | No pair metrics note found. | Add pair watchlist z-scores, correlations, beta, half-life, and relationship status. |
| Macro volatility engine | partial | [[2026-06-05_FMP_EconomicCalendar]], [[2026-06-23_Entropy_Monitor_SPY_QQQ]] | Add OFR stress, credit/rate proxies, commodity channels, and shock labels. |
| Big money vs retail positioning | partial | 5 positioning signal(s) from 2026-05-02 | Run positioning-report and add FMP institutional/ETF ownership plus retail-flow proxies. |
| Options review assistant | on-demand | Run with --symbol TICKER; no checklist needed on days without candidates. | Add manual Fidelity fields for spread, OI, volume, IV, assignment, and max loss. |
| Review and learning loop | on-demand | Weekly cadence; run outcome-review on Fridays or after position closes. | Add 5/20/60-day outcome review and false-positive tracking. |

## Journal Prompts

- Which alert was reviewed, ignored, or journaled today, and why?
- Did the edge type match the actual evidence, or was it only a vague narrative?
- What manual liquidity or options-chain check blocked an idea?
- Which signal would have invalidated the strongest setup before entry?
- Which missing module caused the most uncertainty in this report?

## Source Notes

| Layer | Latest Note | Date | Status |
| --- | --- | --- | --- |
| Agent rollup | [[2026-06-23_Agent_Analysis_All_Theses]] | 2026-06-23 | watch |
| Opportunity viewpoints | [[2026-06-23_Opportunity_Viewpoints]] | 2026-06-23 | clear |
| Entropy monitor | [[2026-06-23_Entropy_Monitor_SPY_QQQ]] | 2026-06-23 | clear |
| Earnings calendar | [[2026-06-23_FMP_Earnings_Calendar_Thesis_Watchlists]] | 2026-06-23 | clear |
| Macro calendar | [[2026-06-05_FMP_EconomicCalendar]] | 2026-06-05 | watch |
| Watchlist report | [[2026-06-23_FMP_Thesis_Watchlist_Space_Domain_Awareness_&_Commercial_Space]] | 2026-06-23 | clear |
| Positioning report | [[2026-05-02_Big_Money_vs_Retail_Positioning_Report]] | 2026-05-02 | watch |
