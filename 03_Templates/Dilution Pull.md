---
title: "{{title}}"
source: "SEC EDGAR + FMP Premium"
date_pulled: "{{date}}"
domain: fundamentals
data_type: dilution_monitor
frequency: on_demand
signal_status: clear
signals: []
tickers: []
lookback_days: 14
tags:
  - fundamentals
  - dilution
  - watchlist
---

# {{title}}

Batch dilution risk sweep across the named watchlist using **SEC EDGAR** (XBRL + recent filings) and **FMP Premium** (balance sheet, cash flow, float, short).

## Summary

- Runway thresholds (months): **critical < 3**, **high 3–6**, **medium 6–12**, **low > 12**
- ATM/Float thresholds: **alert > 50%**, **watch > 20%**
- Nasdaq non-compliance (8-K Item 3.01) = automatic **high** risk

## Watchlist Risk Table

_(Populated at run time.)_

| Ticker | Risk | Runway (mo) | Shelf Max | Shelf Headroom | ATM/Float | Nasdaq | Active Signals |
|--------|------|-------------|-----------|----------------|-----------|--------|----------------|

## New Filings Since Last Run

_(Populated at run time — shelf, prospectus, offering, or compliance filings.)_

## State Transitions

_(Populated at run time — only upgrades between risk classes, e.g. `medium → high`.)_

## How to Read

- **critical** — sub-3-month runway or imminent delisting; treat as automatic exit trigger.
- **high** — 3–6 months OR ATM > 50% float OR non-compliant; size down.
- **medium** — 6–12 months OR large shelf available; watch for new takedowns.
- **low** — > 12-month runway, no offering pressure, compliant.

## Source

- **SEC EDGAR** `/submissions/CIK{cik}.json` — recent filings
- **SEC EDGAR** `/api/xbrl/companyfacts/CIK{cik}.json` — shelf max + shares-outstanding history
- **FMP Premium** `/stable/balance-sheet-statement-quarterly` — cash + STI
- **FMP Premium** `/stable/cash-flow-statement-quarterly` — operating CF (burn)
- **FMP Premium** `/stable/shares-float` — float
- **FMP Premium** `/stable/short-interest` — short % of float
