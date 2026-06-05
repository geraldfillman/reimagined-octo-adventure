---
type: coverage_audit
date: 2026-05-12
sources_scanned: 95
pullers_scanned: 78
dashboards_scanned: 32
---

# Coverage Audit — 2026-05-12

**Summary:** 86 source→puller gaps | 69 puller→source gaps | 39 output→dashboard gaps

## 1. Source → Puller Gaps

Active source notes with no valid linked_puller: **86**

| Source Name | Category | Status | linked_puller | Reason | File |
| --- | --- | --- | --- | --- | --- |
| ClinicalTrials API | Biotech_Healthcare | active | (none) | no linked_puller field | 01_Data_Sources/Biotech_Healthcare/ClinicalTrials API.md |
| PubMed API | Biotech_Healthcare | active | (none) | no linked_puller field | 01_Data_Sources/Biotech_Healthcare/PubMed API.md |
| Carbon Tracker Public Reports | Climate_Energy | active | (none) | no linked_puller field | 01_Data_Sources/Climate_Energy/Carbon Tracker Public Reports.md |
| EIA API | Climate_Energy | active | (none) | no linked_puller field | 01_Data_Sources/Climate_Energy/EIA API.md |
| EPA GHGRP | Climate_Energy | active | (none) | no linked_puller field | 01_Data_Sources/Climate_Energy/EPA GHGRP.md |
| Global Carbon Atlas | Climate_Energy | active | (none) | no linked_puller field | 01_Data_Sources/Climate_Energy/Global Carbon Atlas.md |
| IRENA | Climate_Energy | active | (none) | no linked_puller field | 01_Data_Sources/Climate_Energy/IRENA.md |
| NASA POWER | Climate_Energy | active | (none) | no linked_puller field | 01_Data_Sources/Climate_Energy/NASA POWER.md |
| NOAA Climate Data Online | Climate_Energy | active | (none) | no linked_puller field | 01_Data_Sources/Climate_Energy/NOAA Climate Data Online.md |
| NOAA Storm Events Database | Climate_Energy | active | (none) | no linked_puller field | 01_Data_Sources/Climate_Energy/NOAA Storm Events.md |
| arXiv API | Frontier_Science | active | arxiv, biofood | linked_puller "arxiv, biofood" has no matching scripts/pullers/arxiv, biofood.mjs | 01_Data_Sources/Frontier_Science/arXiv API.md |
| Semantic Scholar Academic Graph | Frontier_Science | active | pull semantic-scholar | linked_puller "pull semantic-scholar" has no matching scripts/pullers/pull semantic-scholar.mjs | 01_Data_Sources/Frontier_Science/Semantic Scholar Academic Graph.md |
| 451 Research | Fundamentals | active | (none) | no linked_puller field | 01_Data_Sources/Fundamentals/451 Research.md |
| EDGAR Dilution Monitor | Fundamentals | active | pullers/dilution-monitor.mjs + pullers/dd-report.mjs + pullers/filing-digest.mjs + pullers/capital-raise.mjs + pullers/smallcap-screen.mjs | linked_puller "pullers/dilution-monitor.mjs + pullers/dd-report.mjs + pullers/filing-digest.mjs + pullers/capital-raise.mjs + pullers/smallcap-screen" has no matching scripts/pullers/pullers/dilution-monitor.mjs + pullers/dd-report.mjs + pullers/filing-digest.mjs + pullers/capital-raise.mjs + pullers/smallcap-screen.mjs | 01_Data_Sources/Fundamentals/EDGAR Dilution Monitor.md |
| S&P Capital IQ Pro | Fundamentals | active | (none) | no linked_puller field | 01_Data_Sources/Fundamentals/S&P Capital IQ Pro.md |
| SEC EDGAR API | Fundamentals | active | (none) | no linked_puller field | 01_Data_Sources/Fundamentals/SEC EDGAR API.md |
| SEC EDGAR Search | Fundamentals | active | (none) | no linked_puller field | 01_Data_Sources/Fundamentals/SEC EDGAR Search.md |
| SEC XBRL Company Facts | Fundamentals | active | (none) | no linked_puller field | 01_Data_Sources/Fundamentals/SEC XBRL Company Facts.md |
| OpenStreetMap | Geospatial | active | (none) | no linked_puller field | 01_Data_Sources/Geospatial/OpenStreetMap.md |
| FAA UAS Integration Office | Government_Contracts | active | (none) | no linked_puller field | 01_Data_Sources/Government_Contracts/FAA UAS Integration Office.md |
| FPDS public procurement data | Government_Contracts | active | (none) | no linked_puller field | 01_Data_Sources/Government_Contracts/FPDS public procurement data.md |
| Janes Defence Intelligence | Government_Contracts | active | (none) | no linked_puller field | 01_Data_Sources/Government_Contracts/Janes Defence Intelligence.md |
| SAM.gov API | Government_Contracts | active | (none) | no linked_puller field | 01_Data_Sources/Government_Contracts/SAM.gov API.md |
| USASpending API | Government_Contracts | active | (none) | no linked_puller field | 01_Data_Sources/Government_Contracts/USASpending API.md |
| ATTOM Data | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/ATTOM Data.md |
| Census Bureau Housing Data | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/Census Bureau Housing Data.md |
| FHFA House Price Index | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/FHFA House Price Index.md |
| FRED Housing Series | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/FRED Housing Series.md |
| HUD User Datasets | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/HUD User Datasets.md |
| Mortgage Bankers Association | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/Mortgage Bankers Association.md |
| NAHB Wells Fargo Housing Market Index | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/NAHB Wells Fargo Housing Market Index.md |
| Realtor.com Research | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/Realtor.com Research.md |
| Redfin Data Center | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/Redfin Data Center.md |
| Zillow Research Data | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/Zillow Research Data.md |
| Zillow ZTRAX | Housing_Real_Estate | active | (none) | no linked_puller field | 01_Data_Sources/Housing_Real_Estate/Zillow ZTRAX.md |
| Federal Register FAA Rulemaking | Legal_Courts | active | (none) | no linked_puller field | 01_Data_Sources/Legal_Courts/Federal Register FAA Rulemaking.md |
| ProQuest Congressional | Legal_Courts | active | (none) | no linked_puller field | 01_Data_Sources/Legal_Courts/ProQuest Congressional.md |
| BEA API | Macro | active | (none) | no linked_puller field | 01_Data_Sources/Macro/BEA API.md |
| BLS API | Macro | active | (none) | no linked_puller field | 01_Data_Sources/Macro/BLS API.md |
| Census API | Macro | active | (none) | no linked_puller field | 01_Data_Sources/Macro/Census API.md |
| FRED API | Macro | active | (none) | no linked_puller field | 01_Data_Sources/Macro/FRED API.md |
| IMF International Financial Statistics | Macro | active | (none) | no linked_puller field | 01_Data_Sources/Macro/IMF International Financial Statistics.md |
| Treasury Direct API | Macro | active | (none) | no linked_puller field | 01_Data_Sources/Macro/Treasury Direct API.md |
| US Treasury Data | Macro | active | (none) | no linked_puller field | 01_Data_Sources/Macro/US Treasury Data.md |
| World Gold Council Goldhub | Macro | active | (none) | no linked_puller field | 01_Data_Sources/Macro/World Gold Council Goldhub.md |
| Alpaca Market Data | Market_Data | active | (none) | no linked_puller field | 01_Data_Sources/Market_Data/Alpaca Market Data.md |
| Alpha Vantage | Market_Data | watching | pull alpha-vantage | linked_puller "pull alpha-vantage" has no matching scripts/pullers/pull alpha-vantage.mjs | 01_Data_Sources/Market_Data/Alpha Vantage.md |
| IEX-Style Market Feeds | Market_Data | active | (none) | no linked_puller field | 01_Data_Sources/Market_Data/IEX-Style Market Feeds.md |
| Nasdaq Data Link | Market_Data | active | (none) | no linked_puller field | 01_Data_Sources/Market_Data/Nasdaq Data Link.md |
| Twelve Data | Market_Data | active | (none) | no linked_puller field | 01_Data_Sources/Market_Data/Twelve Data.md |
| GDELT DOC API | News_Media | active | scripts/pullers/gdelt.mjs | linked_puller "scripts/pullers/gdelt" has no matching scripts/pullers/scripts/pullers/gdelt.mjs | 01_Data_Sources/News_Media/GDELT DOC API.md |
| NewsAPI | News_Media | active | (none) | no linked_puller field | 01_Data_Sources/News_Media/NewsAPI.md |
| Nexis Uni | News_Media | active | (none) | no linked_puller field | 01_Data_Sources/News_Media/Nexis Uni.md |
| Amass | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Amass.md |
| Bellingcat ADS-B History | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Bellingcat-ADSB-History.md |
| Bellingcat Auto Archiver | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Bellingcat-AutoArchiver.md |
| Columbus Project | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Columbus-Project.md |
| Hormuz Tracker | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Hormuz-Tracker.md |
| ICIJ Offshore Leaks Database | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/ICIJ-OffshoreleaksDB.md |
| Leaker | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Leaker.md |
| Merklemap | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Merklemap.md |
| octosuite | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/octosuite.md |
| OpenCorporates | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/OpenCorporates.md |
| OSM Search (Bellingcat) | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/osm-search.md |
| OTX AlienVault | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/OTX-AlienVault.md |
| Phantom Tide | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Phantom-Tide.md |
| Recon-ng | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/Recon-ng.md |
| SAR Interference Tracker | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/SAR-Interference-Tracker.md |
| SpiderFoot | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/SpiderFoot.md |
| Telegram Channel Monitor | OSINT | active | scripts/pullers/osint-telegram.mjs | linked_puller "scripts/pullers/osint-telegram" has no matching scripts/pullers/scripts/pullers/osint-telegram.mjs | 01_Data_Sources/OSINT/Telegram.md |
| theHarvester | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/theHarvester.md |
| Umbra Open Data Tracker | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/umbra-open-data-tracker.md |
| VesselFinder AIS | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/VesselFinder.md |
| World Monitor | OSINT | active | (none) | no linked_puller field | 01_Data_Sources/OSINT/World-Monitor.md |
| Kalshi Market Data | Prediction_Markets | active | (none) | no linked_puller field | 01_Data_Sources/Prediction_Markets/Kalshi Market Data.md |
| Polymarket Market Data | Prediction_Markets | active | (none) | no linked_puller field | 01_Data_Sources/Prediction_Markets/Polymarket Market Data.md |
| Crunchbase | Private_Markets_VC | active | (none) | no linked_puller field | 01_Data_Sources/Private_Markets_VC/Crunchbase.md |
| NVCA Public Reports | Private_Markets_VC | active | (none) | no linked_puller field | 01_Data_Sources/Private_Markets_VC/NVCA Public Reports.md |
| OpenVC | Private_Markets_VC | active | (none) | no linked_puller field | 01_Data_Sources/Private_Markets_VC/OpenVC.md |
| PitchBook News | Private_Markets_VC | active | (none) | no linked_puller field | 01_Data_Sources/Private_Markets_VC/PitchBook News.md |
| SEC EDGAR Form D Filings | Private_Markets_VC | active | (none) | no linked_puller field | 01_Data_Sources/Private_Markets_VC/SEC EDGAR Form D Filings.md |
| Y Combinator Public Batch Data | Private_Markets_VC | active | (none) | no linked_puller field | 01_Data_Sources/Private_Markets_VC/Y Combinator Public Batch Data.md |
| PullPush Reddit Archive | Social_Sentiment | active | (none) | no linked_puller field | 01_Data_Sources/Social_Sentiment/PullPush-Reddit.md |
| Reddit API | Social_Sentiment | active | scripts/pullers/reddit.mjs | linked_puller "scripts/pullers/reddit" has no matching scripts/pullers/scripts/pullers/reddit.mjs | 01_Data_Sources/Social_Sentiment/Reddit API.md |
| snscrape | Social_Sentiment | active | (none) | no linked_puller field | 01_Data_Sources/Social_Sentiment/snscrape.md |
| UN Comtrade API | Supply_Chain_Trade | active | (none) | no linked_puller field | 01_Data_Sources/Supply_Chain_Trade/UN Comtrade API.md |

## 2. Puller → Source Gaps

Pullers with no source note linking them: **69**

| Puller | Inferred Category |
| --- | --- |
| agent-analyst | agent-analyst |
| agent-run | agent-run |
| alpha-vantage | alpha-vantage |
| arxiv | arxiv |
| auction-features | auction-features |
| backtest-orb-eod | backtest-orb-eod |
| bea | bea |
| capital-raise | capital-raise |
| cash-flow-quality | cash-flow-quality |
| clinicaltrials | clinicaltrials |
| company-risk-scan | company-risk-scan |
| confluence-scan | confluence-scan |
| convergence-scan | convergence-scan |
| cot-report | cot-report |
| dd-report | dd-report |
| dilution-monitor | dilution-monitor |
| disclosure-reality | disclosure-reality |
| entropy-compression-scan | entropy-compression-scan |
| entropy-monitor | entropy-monitor |
| federalregister | federalregister |
| filing-digest | filing-digest |
| fred | fred |
| freshness-source-writer | freshness-source-writer |
| gdelt | gdelt |
| knowledge-gap-tasks | knowledge-gap-tasks |
| macro-bridges | macro-bridges |
| macro-volatility | macro-volatility |
| market-cycle-monitor | market-cycle-monitor |
| month-end-archive | month-end-archive |
| nahb | nahb |
| newsapi | newsapi |
| opportunity-viewpoints | opportunity-viewpoints |
| options-review | options-review |
| orb-entropy | orb-entropy |
| osint-amass | osint-amass |
| osint-columbus | osint-columbus |
| osint-harvester | osint-harvester |
| osint-leaker | osint-leaker |
| osint-merklemap | osint-merklemap |
| osint-octosuite | osint-octosuite |
| osint-osmsearch | osint-osmsearch |
| osint-recon | osint-recon |
| osint-spiderfoot | osint-spiderfoot |
| osint-telegram | osint-telegram |
| osint-umbra | osint-umbra |
| outcome-review | outcome-review |
| pair-metrics | pair-metrics |
| pead-watch | pead-watch |
| portfolio-health | portfolio-health |
| positioning-report | positioning-report |
| reddit | reddit |
| research-spine-flow | research-spine-flow |
| sec | sec |
| sector-scan | sector-scan |
| semantic-scholar | semantic-scholar |
| signal-intelligence | signal-intelligence |
| signal-quality-scan | signal-quality-scan |
| signal-review | signal-review |
| signal-tracker | signal-tracker |
| smallcap-screen | smallcap-screen |
| snscrape | snscrape |
| source-watch | source-watch |
| streamline-report | streamline-report |
| thesis-canvas | thesis-canvas |
| treasury | treasury |
| usaspending | usaspending |
| uspto | uspto |
| vault-process-canvas | vault-process-canvas |
| yfinance-vol | yfinance-vol |

## 3. Output → Dashboard Gaps

Pullers whose output category is not referenced by any dashboard: **39**

| Puller | Inferred Category |
| --- | --- |
| agent-run | agent-run |
| auction-features | auction-features |
| biofood | biotech_healthcare |
| cash-flow-quality | cash-flow-quality |
| confluence-scan | confluence-scan |
| cot-report | cot-report |
| entropy-monitor | entropy-monitor |
| federalregister | federalregister |
| filing-digest | filing-digest |
| freshness-source-writer | freshness-source-writer |
| knowledge-gap-tasks | knowledge-gap-tasks |
| macro-bridges | macro-bridges |
| macro-volatility | macro-volatility |
| market-cycle-monitor | market-cycle-monitor |
| month-end-archive | month-end-archive |
| nahb | nahb |
| options-review | options-review |
| osint-columbus | osint-columbus |
| osint-leaker | osint-leaker |
| osint-merklemap | osint-merklemap |
| osint-octosuite | osint-octosuite |
| osint-osmsearch | osint-osmsearch |
| osint-telegram | osint-telegram |
| osint-umbra | osint-umbra |
| pair-metrics | pair-metrics |
| pead-watch | pead-watch |
| portfolio-health | portfolio-health |
| positioning-report | positioning-report |
| sector-scan | sector-scan |
| signal-intelligence | signal-intelligence |
| signal-quality-scan | signal-quality-scan |
| signal-review | signal-review |
| smallcap-screen | smallcap-screen |
| snscrape | snscrape |
| source-watch | source-watch |
| thesis-canvas | thesis-canvas |
| uspto | uspto |
| vault-process-canvas | vault-process-canvas |
| yfinance-vol | yfinance-vol |

---
_Generated by `node run.mjs system coverage-audit` on 2026-05-12_
