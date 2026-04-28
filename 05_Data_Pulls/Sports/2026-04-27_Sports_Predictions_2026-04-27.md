---
title: "Sports Prediction Ledger - 2026-04-27"
source: "ESPN scoreboard + OddsHarvester local cache"
date_pulled: "2026-04-27"
event_date: "2026-04-27"
domain: "sports"
data_type: "sports_predictions"
frequency: "on-demand"
signal_status: "clear"
signals: []
prediction_count: 1
pass_count: 20
unmatched_odds_count: 16
tags: ["sports", "predictions", "backtesting-input", "market-consensus"]
---

## Executive Summary

Event date: 2026-04-27
Model: multi-factor-v1
Minimum edge: 0.00%
Prediction candidates: 1
Pass candidates: 20
Unmatched odds records: 16
Ledger: scripts\.cache\sports\predictions\2026-04-27_predictions.csv
Pass rows included in CSV: yes

This note records research predictions for later settlement and calibration. It is not a recommendation engine; it preserves the variables available at prediction time so the process can be backtested without hindsight edits.

## Prediction Candidates

| Event | Sport | Market | Selection | Side | Odds | Model P | Edge | Score | Snapshot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MIN @ DEN | basketball | home_away | Minnesota Timberwolves | away | +420 | 19.55% | 0.32% | 47 | Indoor/controlled; missing_roles; 4 books; weather Low |

## Pass Candidates

| Event | Sport | Market | Selection | Odds | Edge | Score | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OKC @ PHX | basketball | home_away | Phoenix Suns | +420 | -0.29% | 47 | below min edge 0.00% |
| DET @ ORL | basketball | home_away | Orlando Magic | +140 | -1.07% | 47 | below min edge 0.00% |
| MIA @ LAD | baseball | home_away_1st_half | Miami Marlins | +238 | -1.18% | 51 | below min edge 0.00% |
| TB @ CLE | baseball | home_away | Cleveland Guardians | -135 | -1.49% | 46 | below min edge 0.00% |
| TB @ CLE | baseball | home_away_1st_half | Tampa Bay Rays | +104 | -1.67% | 46 | below min edge 0.00% |
| LAA @ CHW | baseball | home_away_1st_half | Chicago White Sox | +120 | -1.82% | 51 | below min edge 0.00% |
| SEA @ MIN | baseball | home_away_1st_half | Minnesota Twins | +110 | -1.86% | 51 | below min edge 0.00% |
| VGK @ UTA | ice-hockey | home_away | Vegas Golden Knights | -120 | -1.90% | 58 | below min edge 0.00% |
| NYY @ TEX | baseball | home_away_1st_half | Texas Rangers | +104 | -1.93% | 58 | below min edge 0.00% |
| LAA @ CHW | baseball | home_away | Los Angeles Angels | -105 | -1.98% | 51 | below min edge 0.00% |
| CHC @ SD | baseball | home_away_1st_half | San Diego Padres | -111 | -2.07% | 51 | below min edge 0.00% |
| BOS @ TOR | baseball | home_away | Toronto Blue Jays | -135 | -2.08% | 58 | below min edge 0.00% |
| PHI @ PIT | ice-hockey | home_away | Pittsburgh Penguins | -135 | -2.26% | 58 | below min edge 0.00% |
| SEA @ MIN | baseball | home_away | Seattle Mariners | -130 | -2.27% | 51 | below min edge 0.00% |
| CHC @ SD | baseball | home_away | San Diego Padres | -119 | -2.28% | 51 | below min edge 0.00% |
| STL @ PIT | baseball | home_away | Pittsburgh Pirates | -135 | -2.33% | 51 | below min edge 0.00% |
| BOS @ TOR | baseball | home_away_1st_half | Toronto Blue Jays | -125 | -2.34% | 58 | below min edge 0.00% |
| NYY @ TEX | baseball | home_away | New York Yankees | -164 | -2.38% | 58 | below min edge 0.00% |
| MIA @ LAD | baseball | home_away | Los Angeles Dodgers | -303 | -2.80% | 51 | below min edge 0.00% |
| STL @ PIT | baseball | home_away_1st_half | St. Louis Cardinals | +104 | -2.82% | 51 | below min edge 0.00% |

## Unmatched Odds

| Sport | Odds Event | Home | Away | Reason |
| --- | --- | --- | --- | --- |
| baseball | Decin @ Moravske Budejovice | Moravske Budejovice | Decin | odds match_date resolves to 2017-03-09 |
| baseball | Detroit Tigers @ Atlanta Braves | Atlanta Braves | Detroit Tigers | odds match_date resolves to 2026-04-28 |
| baseball | Houston Astros @ Baltimore Orioles | Baltimore Orioles | Houston Astros | odds match_date resolves to 2026-04-28 |
| baseball | San Francisco Giants @ Philadelphia Phillies | Philadelphia Phillies | San Francisco Giants | odds match_date resolves to 2026-04-28 |
| baseball | Washington Nationals @ New York Mets | New York Mets | Washington Nationals | odds match_date resolves to 2026-04-28 |
| basketball | Atlanta Hawks @ New York Knicks | New York Knicks | Atlanta Hawks | odds match_date resolves to 2026-04-28 |
| basketball | Decin @ Moravske Budejovice | Moravske Budejovice | Decin | odds match_date resolves to 2017-03-09 |
| basketball | Houston Rockets @ Los Angeles Lakers | Los Angeles Lakers | Houston Rockets | odds match_date resolves to 2026-04-29 |
| basketball | Philadelphia 76ers @ Boston Celtics | Boston Celtics | Philadelphia 76ers | odds match_date resolves to 2026-04-28 |
| basketball | Portland Trail Blazers @ San Antonio Spurs | San Antonio Spurs | Portland Trail Blazers | odds match_date resolves to 2026-04-28 |
| basketball | Toronto Raptors @ Cleveland Cavaliers | Cleveland Cavaliers | Toronto Raptors | odds match_date resolves to 2026-04-29 |
| ice-hockey | Anaheim Ducks @ Edmonton Oilers | Edmonton Oilers | Anaheim Ducks | odds match_date resolves to 2026-04-28 |
| ice-hockey | Boston Bruins @ Buffalo Sabres | Buffalo Sabres | Boston Bruins | odds match_date resolves to 2026-04-28 |
| ice-hockey | Decin @ Moravske Budejovice | Moravske Budejovice | Decin | odds match_date resolves to 2017-03-09 |
| ice-hockey | Minnesota Wild @ Dallas Stars | Dallas Stars | Minnesota Wild | odds match_date resolves to 2026-04-28 |
| ice-hockey | Montreal Canadiens @ Tampa Bay Lightning | Tampa Bay Lightning | Montreal Canadiens | odds match_date resolves to 2026-04-29 |

## Source Coverage

| Sport | League | ESPN Events | Odds Records | Predictions | Passes | Unmatched | Status | Odds File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseball | mlb | 8 | 8 | 0 | 8 | 5 | OK | scripts\.cache\sports\odds\2026-04-27\upcoming_2026-04-27_baseball_mlb_home_away.json |
| baseball | mlb | 8 | 8 | 0 | 8 | 5 | OK | scripts\.cache\sports\odds\2026-04-27\upcoming_2026-04-27_baseball_mlb_home_away_1st_half.json |
| basketball | nba | 3 | 3 | 1 | 2 | 6 | OK | scripts\.cache\sports\odds\2026-04-27\upcoming_2026-04-27_basketball_nba_home_away.json |
| ice-hockey | nhl | 2 | 2 | 0 | 2 | 5 | OK | scripts\.cache\sports\odds\2026-04-27\upcoming_2026-04-27_ice-hockey_nhl_home_away.json |

## Ledger Contract

The CSV is compatible with `sports-backtest` because it includes `date`, `event`, `market`, `selection`, `model_probability`, `result`, `stake`, and `odds_decimal`.
Prediction rows start with `result: pending`. A later settlement step should fill `result`, final scores, and closing odds.
`variable_snapshot` is JSON captured before the event: probables, venue, weather risk, slate score, selected side, book count, and source file pointers.
