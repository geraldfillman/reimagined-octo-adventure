---
title: "COT Report"
source: "CFTC Commitment of Traders"
date_pulled: "2026-07-31"
report_date: "2026-07-28"
domain: "macro"
data_type: "cot_report"
frequency: "weekly"
markets_tracked: 14
signal_count: 2
signal_status: "watch"
signals: ["Gold", "Japanese Yen"]
agent_owner: "macro"
handoff_to: ["orchestrator"]
tags: ["cot", "positioning", "commitment-of-traders", "macro", "futures"]
---

## Operating Rule

> COT data shows net positioning of speculative (non-commercial) and commercial (hedger) traders.
> Crowded positions (net spec beyond ±30% of OI) flag potential reversal risk, not entry signals.
> Rapid week-over-week net spec shifts (>8% of OI) signal changing conviction.
> All signals require confirmation from price, macro context, and liquidity checks.

## Positioning Summary

| Market | Category | Open Int. | Net Spec | Wk Change | Spec Long% | Spec Short% | Signal | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E-Mini S&P 500 | equities | 2.0M | -17.2k | -412 | 13% | 13.9% | clear | — |
| E-Mini Nasdaq-100 | equities | 294.8k | +4.9k | +368 | 27.7% | 26% | clear | — |
| 10-Year T-Notes | rates | 5.3M | -876.1k | +3.6k | 9.4% | 25.9% | clear | — |
| T-Bonds | rates | 1.9M | -217.5k | -30.7k | 10.9% | 22.6% | clear | — |
| Gold | commodities | 384.6k | +182.1k | -1.8k | 57.1% | 9.8% | watch | net spec +47.3% of OI — crowded long |
| Crude Oil (WTI) | commodities | 1.9M | +120.1k | +38.4k | 16.9% | 10.5% | clear | — |
| Natural Gas | commodities | 1.7M | -190.8k | -19.7k | 17.4% | 28.8% | clear | — |
| Copper | commodities | 274.6k | +67.3k | -6.7k | 37.5% | 13% | clear | — |
| Wheat (SRW) | commodities | 463.5k | -2.0k | +5.0k | 25.7% | 26.1% | clear | — |
| Corn | commodities | 1.7M | +254.3k | +67.7k | 28.4% | 13.8% | clear | — |
| Soybeans | commodities | 1.0M | +211.8k | +36.1k | 27.4% | 6.7% | clear | — |
| Euro FX | currencies | 819.8k | -72.4k | -31.1k | 25% | 33.8% | clear | — |
| Japanese Yen | currencies | 432.4k | -163.4k | -11.3k | 23.4% | 61.2% | watch | net spec -37.8% of OI — crowded short |
| Bitcoin | crypto | 20.0k | +3.9k | +850 | 77.8% | 58.3% | clear | — |

## Active Positioning Signals

| Market | Signal | Reason |
| --- | --- | --- |
| Gold | watch | net spec +47.3% of OI — crowded long |
| Japanese Yen | watch | net spec -37.8% of OI — crowded short |

## Data Source

- **Report date**: 2026-07-28
- **Source**: CFTC COT — Legacy Futures-Only Report (CME/CBOT/NYMEX/COMEX)
- **URL**: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm
- **Release schedule**: Every Friday ~3:30 PM ET

> Net Spec = NonCommercial Long − Short. Positive = net long speculative bias.
> Wk Change = week-over-week change in net spec. Rapid shifts (>8% of OI) are flagged.
