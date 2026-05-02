---
title: Data Sources
type: moc
tags: [data-sources, providers, pullers]
last_updated: 2026-04-02
---
# Data Sources

Summary:
- Source metadata lives in `01_Data_Sources/`; generated evidence lives in `05_Data_Pulls/`.
- Use this map before opening raw pull notes or changing automation.

Open first when:
- You need to know which provider covers a dataset, which puller to run, or how a source note is structured.

Key notes:
- [[04_Reference/Data Sources Overview]]
- [[04_Reference/Housing Intelligence]]
- [[04_Reference/Pull_System_Guide]]
- [[04_Reference/Vault_Schemas]]
- [[My_Data/README]]
- [[CLAUDE]]

Coverage areas:
- Macro, market data, housing and real estate, government contracts, biotech and healthcare, geospatial, legal and courts, frontier science, OSINT/corporate intelligence, and structured KB intake pipeline.
- Official websites and library-grade research platforms now cover unresolved indicators where no stable free API exists.
- `12_Knowledge_Bases/` provides a structured intake-to-wiki pipeline: raw sources → jobs manifests → wiki pages (summaries, concepts, entities, comparisons, query-results). Run `node run.mjs kb --help` for the full command set.

Priority source links:
- Biotech and research: [[FDA open data Drugs@FDA]], [[ClinicalTrials API]], [[PubMed API]]
- Energy and infrastructure: [[EIA_Electricity]]
- Government and contracts: [[SAM_Gov]], [[Socrata Open Data]], [[SEC EDGAR Search]], [[FAA UAS Integration Office]], [[Janes Defence Intelligence]]
- Housing and macro: [[Zillow ZTRAX]], [[Treasury Direct API]], [[US Treasury Data]], [[NAHB Wells Fargo Housing Market Index]], [[World Gold Council Goldhub]], [[IMF International Financial Statistics]]
- Market data: [[CBOE_Options]], [[Nasdaq Data Link]], [[Alpaca Market Data]], [[IEX-Style Market Feeds]]
- News, sentiment, and prediction markets: [[NewsAPI]], [[Reddit API]], [[Kalshi Market Data]], [[Polymarket Market Data]], [[Nexis Uni]]
- Cross-domain and global context: [[OpenStreetMap]], [[UN Comtrade API]]
- Policy, legal, and library backfill: [[Federal Register FAA Rulemaking]], [[ProQuest Congressional]], [[S&P Capital IQ Pro]], [[451 Research]]
- OSINT and corporate intelligence: [[SpiderFoot]], [[theHarvester]], [[Amass]], [[Recon-ng]], [[OpenCorporates]], [[ICIJ-OffshoreleaksDB]], [[OTX-AlienVault]], [[VesselFinder]], [[Bellingcat-ADSB-History]], [[Bellingcat-AutoArchiver]], [[Telegram]], [[Leaker]], [[octosuite]], [[Merklemap]], [[Columbus-Project]], [[Phantom-Tide]], [[Hormuz-Tracker]], [[World-Monitor]], [[SAR-Interference-Tracker]], [[umbra-open-data-tracker]], [[osm-search]]
- Social sentiment: [[Reddit API]], [[PullPush-Reddit]], [[snscrape]]

Connection rules:
- Link a source note here once it becomes part of an active workflow, dashboard, playbook, or thesis.
- If a source remains active but disconnected, add it to this MOC before creating more detailed navigation.
- If a source stays disconnected and unused, move it to `500-archive/` rather than leaving it in the active catalog.

Decisions:
- Treat `01_Data_Sources/` as source metadata and `05_Data_Pulls/` as evidence snapshots.
- Check the pull guide and schema doc before changing pullers or source notes.
