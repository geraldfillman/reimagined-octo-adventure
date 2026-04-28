---
title: "Sports Odds Harvest - upcoming"
source: "OddsHarvester / OddsPortal"
date_pulled: "2026-04-27"
domain: "sports"
data_type: "upcoming_odds"
frequency: "on-demand"
signal_status: "clear"
signals: []
tags: ["sports", "odds", "oddsharvester", "backtesting-input"]
---

## Executive Summary

Mode: upcoming
Jobs completed: 2/2
Output format: json
Local cache: scripts\.cache\sports\odds

Use this as an odds-history or line-context input for sports-backtest. The daily ESPN slate remains the schedule baseline.

## Harvest Results

| Date/Season | Job         | Sport    | League | Market    | Period   | Status | Records | Output File                                                                                    | Error |
| ----------- | ----------- | -------- | ------ | --------- | -------- | ------ | ------- | ---------------------------------------------------------------------------------------------- | ----- |
| 2026-04-27  | baseball-f5 | baseball | mlb    | home_away | 1st_half | ok     | 40      | scripts\.cache\sports\odds\2026-04-27\upcoming_2026-04-27_baseball_mlb_home_away_1st_half.json |       |
| 2026-04-28  | baseball-f5 | baseball | mlb    | home_away | 1st_half | ok     | 40      | scripts\.cache\sports\odds\2026-04-28\upcoming_2026-04-28_baseball_mlb_home_away_1st_half.json |       |

## Safety Controls

- Remote/S3 storage is not exposed by this wrapper; all jobs force `--storage local`.
- Default concurrency is 1 and default request delay is 3 seconds.
- Browser mode is headless by default.
- Scraper output stays in `scripts/.cache/sports/odds/`; the vault note stores only a source log and file pointers.
- Check OddsPortal terms and local law before running live scraping at scale.

## Command Log

| Job | Sport | League | Period | Command |
| --- | --- | --- | --- | --- |
| baseball-f5 | baseball | mlb | 1st_half | C:\Users\CaveUser\AppData\Local\Temp\mydata-oddsharvester-py312-venv\Scripts\oddsharvester.exe upcoming --sport baseball --market home_away --storage local --format json --output "C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\scripts\.cache\sports\odds\2026-04-27\upcoming_2026-04-27_baseball_mlb_home_away_1st_half" --date 20260427 --league mlb --headless --period 1st_half --concurrency 1 --request-delay 3 |
| baseball-f5 | baseball | mlb | 1st_half | C:\Users\CaveUser\AppData\Local\Temp\mydata-oddsharvester-py312-venv\Scripts\oddsharvester.exe upcoming --sport baseball --market home_away --storage local --format json --output "C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\scripts\.cache\sports\odds\2026-04-28\upcoming_2026-04-28_baseball_mlb_home_away_1st_half" --date 20260428 --league mlb --headless --period 1st_half --concurrency 1 --request-delay 3 |
