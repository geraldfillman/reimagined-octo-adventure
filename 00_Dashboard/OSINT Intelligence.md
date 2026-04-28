---
title: OSINT Intelligence
type: dashboard
tags: [dashboard, osint, company-risk]
last_updated: 2026-04-05
---

# OSINT Intelligence

Operator surface for passive open-source intelligence: source catalog, recent scans, and company risk signals derived from OSINT pulls.

---

## Source Catalog

```dataview
TABLE
  provider AS "Provider",
  type AS "Type",
  pricing AS "Pricing",
  priority AS "Priority",
  integrated AS "Integrated"
FROM "01_Data_Sources/OSINT"
WHERE file.name != "OSINT"
SORT priority ASC, file.name ASC
```

---

## Recent OSINT Scans

```dataview
TABLE
  source AS "Tool",
  date_pulled AS "Date",
  domain AS "Domain",
  signal_status AS "Status"
FROM "05_Data_Pulls/osint"
WHERE file.name != "osint"
SORT date_pulled DESC
LIMIT 20
```

---

## OSINT-Tagged Signals

```dataview
TABLE
  date AS "Date",
  severity AS "Severity",
  company AS "Company",
  file.link AS "Signal"
FROM "06_Signals"
WHERE contains(tags, "osint") OR contains(tags, "breach") OR contains(tags, "leak")
SORT date DESC
LIMIT 15
```

---

## Company Risk — OSINT-Flagged Entities

```dataview
TABLE
  ticker AS "Ticker",
  sector AS "Sector",
  risk_score AS "Risk Score",
  gap_score AS "Gap Score",
  last_updated AS "Last Updated"
FROM "12_Company_Risk/Companies"
WHERE contains(tags, "osint") OR risk_score >= 60
SORT risk_score DESC
LIMIT 10
```

---

## Source Status

| Source | Key Variable | Status |
|--------|-------------|--------|
| OTX AlienVault | `OTX_API_KEY` | Register free at otx.alienvault.com |
| OpenCorporates | `OPENCORPORATES_API_KEY` | Free tier: 500 req/day |
| VesselFinder | `VESSELFINDER_API_KEY` | Paid API required for automation |
| SpiderFoot | `SPIDERFOOT_API_KEY` | Optional — most passive modules are keyless |

---

## Quick Commands

```
node run.mjs scan osint-spiderfoot --domain <domain>
node run.mjs scan osint-harvester  --domain <domain>
node run.mjs scan osint-amass      --domain <domain>
node run.mjs scan osint-recon      --domain <domain>
node run.mjs system status
```

All OSINT scans are **passive only** — no active probing or brute force.
Output lands in `05_Data_Pulls/osint/`. SpiderFoot breach findings prompt P1/P2 signal creation.

---

## Source Reference

- [[SpiderFoot]] — 200+ module OSINT automation platform
- [[theHarvester]] — Email/subdomain harvest from 40+ sources
- [[Amass]] — DNS intel via certificate transparency
- [[Recon-ng]] — Modular corporate contact/host recon
- [[OpenCorporates]] — Global company registry (200+ jurisdictions)
- [[ICIJ-OffshoreleaksDB]] — Panama/Pandora Papers beneficial ownership
- [[OTX-AlienVault]] — Community threat intelligence API
- [[VesselFinder]] — Real-time AIS maritime tracking
- [[Bellingcat-ADSB-History]] — Corporate jet flight history
- [[Bellingcat-AutoArchiver]] — Evidence archiving for signals
