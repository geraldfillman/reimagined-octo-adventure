---
title: "PEAD Watch"
source: "Vault Orchestrator"
date_pulled: "2026-05-02"
domain: "market"
agent_owner: "market"
agent_scope: "market"
data_type: "pead_watch"
frequency: "daily"
symbols_scanned: 46
results_count: 0
alert_count: 0
signal_status: "clear"
signals: []
tags: ["pead", "earnings-drift", "avwap", "market-microstructure"]
---

## Operating Rule

> PEAD (Post-Earnings Announcement Drift) tracks whether price continues in the direction of an earnings surprise.
> AVWAP anchored to the earnings date is the key reference: holding above it on a positive surprise is the bull case.
> Only symbols with sufficient earnings history are shown. Symbols with `insufficient_data` are suppressed.
> All entries require manual verification. No broker execution is generated.

## PEAD Watch List

_No symbols with sufficient earnings data in the current scan window._

## Label Guide

- **LONG_DRIFT**: Positive surprise + price holding above earnings AVWAP → drift continuation candidate.
- **SHORT_DRIFT**: Negative surprise + price below earnings AVWAP → short drift continuation candidate.
- **EXTENDED**: Price has moved >threshold% from earnings AVWAP — drift may be overextended.
- **NEUTRAL**: Earnings data exists but no clear drift signal.
- **EPS Surp%**: Actual EPS minus estimate, divided by absolute estimate, as percentage.
