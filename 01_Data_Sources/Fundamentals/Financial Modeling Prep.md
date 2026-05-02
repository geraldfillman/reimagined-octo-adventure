---
name: "Financial Modeling Prep"
category: "Fundamentals"
type: "API"
provider: "Financial Modeling Prep"
pricing: "Paid"
status: "Active"
priority: "Foundation"
url: "https://financialmodelingprep.com/"
provides:
  - "Quotes and profiles"
  - "Income, balance sheet, and cash flow statements"
  - "Ratios TTM and key metrics"
  - "Technicals and price series"
  - "Earnings calendar"
  - "Analyst estimates and rating changes"
  - "Insider trading (Form 4)"
  - "Short interest"
  - "Company-specific news with sentiment"
  - "Economic calendar (Fed, CPI, jobs)"
  - "Options chain and unusual activity"
  - "Micro/small cap sector screener"
  - "Institutional and ETF ownership context"
best_use_cases:
  - "Daily market quote snapshots"
  - "Thesis watchlist fundamentals"
  - "Technical and catalyst monitoring"
  - "Insider buy/sell signal detection"
  - "Analyst estimate vs. actuals for earnings catalyst timing"
  - "Short interest squeeze setup detection"
  - "Macro event scheduling for regime tracking"
  - "Big money vs retail positioning divergence"
tags:
  - fundamentals
  - market-data
  - fmp
related_sources:
  - "[[SEC XBRL Company Facts]]"
  - "[[S&P Capital IQ Pro]]"
key_location: "FINANCIAL_MODELING_PREP_API_KEY"
integrated: true
linked_puller: "fmp"
update_frequency: "daily / on demand"
owner: "CaveUser"
last_reviewed: "2026-04-03"
notes: "FMP Premium is the active market-data and fundamentals backbone for the vault."
---

## Summary

- Financial Modeling Prep is the active fundamentals and market-data backbone for the vault.
- Use it for quote snapshots, technical context, earnings timing, and first-pass company fundamentals.

## What It Provides

| Endpoint | Flag | Output |
|---|---|---|
| Batch quote | `--quote <SYM>` | Price, volume, change |
| Profile | `--profile <SYM>` | Sector, description, market cap |
| Income statement | `--income <SYM>` | Revenue, GP, net income, EPS (5yr) |
| Balance sheet | `--balance-sheet <SYM>` | Assets, debt, cash, equity (4yr) |
| Cash flow | `--cash-flow <SYM>` | FCF, operating CF, CapEx (4yr) |
| Technical snapshot | `--technical <SYM>` | RSI, SMA, EMA, ATR, bias |
| Earnings calendar | `--earnings-calendar` | Upcoming earnings dates |
| Thesis watchlists | `--thesis-watchlists` | Batch quote + technicals + fundamentals |
| Analyst estimates | `--estimates <SYM>` | Forward EPS/revenue by period |
| Analyst ratings | `--ratings <SYM>` | Upgrades/downgrades history |
| Insider trading | `--insider <SYM>` | Form 4 buys/sells by executives |
| Short interest | `--short-interest <SYM>` | % of float, settlement date history |
| Company news | `--news <SYM>` | Headlines with sentiment score |
| Economic calendar | `--macro-calendar` | Fed, CPI, jobs, earnings macro events |
| Options chain | `--options <SYM>` | Put/call ratio, unusual activity |
| Sector screener | `--micro-small` | Micro/small cap picks per sector |
| Institutional / ETF ownership | future `positioning-report` input | Holder and ownership context for positioning divergence |

## Use Cases

- Daily quote and tape snapshots
- Thesis watchlist fundamentals and technical refresh
- Insider trading signal detection for `12_Company_Risk`
- Analyst estimate vs. actuals for catalyst timing in `thesis catalysts`
- Short interest monitoring for squeeze setups
- Macro event calendar to anchor regime analysis
- Fast fundamentals context before deeper SEC or library work
- Positioning Agent source layer for institutional ownership, short interest, insider, and ETF-holder context

## Integration Notes

**Status**: Live and integrated
**API Key Required**: Yes (`FINANCIAL_MODELING_PREP_API_KEY`)
**Rate Limits**: Depends on plan
**Update Frequency**: Daily / on demand
**Data Format**: JSON

## Related Sources

- [[SEC XBRL Company Facts]]
- [[S&P Capital IQ Pro]]
