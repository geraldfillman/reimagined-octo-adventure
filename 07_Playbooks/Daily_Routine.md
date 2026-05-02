---
title: Daily Routine Playbook
type: playbook
tags: [playbook, routine, daily, workflow]
playbook_id: daily-routine
run_command: "powershell scripts/daily-routine.ps1"
data_sources:
  - "[[FRED API]]"
  - "[[Financial Modeling Prep]]"
  - "[[Treasury Direct API]]"
  - "[[OpenFEMA API]]"
  - "[[USASpending API]]"
  - "[[FDA open data Drugs@FDA]]"
  - "[[SEC EDGAR API]]"
  - "[[ClinicalTrials API]]"
  - "[[PubMed API]]"
  - "[[NewsAPI]]"
  - "[[CBOE_Options]]"
  - "[[EIA API]]"
signals_monitored:
  - SECTOR_CONFIRM
  - SECTOR_CONTRADICT
  - THESIS_BREAK_RISK
  - YIELD_CURVE_FLATTENING
  - VIX_FLAT_TERM
  - FEMA_SPIKE
last_updated: 2026-04-02
---

# Daily Routine Playbook

Summary:
- Complete operating cycle for the vault: data pull, sector routing, signal review, thesis monitoring, and weekly sizing suggestions.
- Run `powershell scripts/daily-routine.ps1` from the vault root for the full automated pull sequence.
- Use `powershell scripts/daily-routine.ps1 -DryRun` for a pre-flight check and `powershell scripts/daily-routine.ps1 -SkipSectorScan` for a fast ingest-only run.

---

## Phase 1 - Automated Pull Cycle

Run from the vault root:

```powershell
powershell scripts/daily-routine.ps1
```

The script performs:
1. API key pre-flight via `node run.mjs status`
2. All 17 daily pullers
3. `node run.mjs sector-scan`
4. `node run.mjs cleanup --market-history --signals`
5. `node run.mjs validate`

Expected dry run:

```powershell
powershell scripts/daily-routine.ps1 -DryRun
```

Expected fast path:

```powershell
powershell scripts/daily-routine.ps1 -SkipSectorScan
```

If a puller fails, the script logs the failure and continues. Validation still aborts the run if schema errors are found.

---

## Phase 2 - Signal Review (5 minutes)

Open in this order. Stop and act before continuing if a `critical` signal is present.

| Step | Dashboard | What to check |
| --- | --- | --- |
| 1 | [[00_Dashboard/Signal Board]] | Any `critical` or `alert` signal that needs same-day action |
| 2 | [[00_Dashboard/Cross-Domain Thesis Board]] | New multi-domain convergence patterns |
| 3 | [[00_Dashboard/Data Freshness]] | Sources stale by more than 2 days |
| 4 | [[00_Dashboard/High Priority Thesis Monitor]] | Quant changes, break-risk watch, overdue review items |
| 5 | [[00_Dashboard/Capital Allocation Board]] | Conviction Momentum and Emerging Patterns sections |

### Escalation Rules

| Level | Action |
| --- | --- |
| `critical` | Read the source note immediately, decide on position action before closing the session, and update the affected thesis. |
| `alert` | Read the note the same day. Treat two simultaneous thesis alerts from different domains as `critical`. |
| `watch` | Note it, keep the thesis on review, and check again tomorrow. |
| `clear` | No action required. |

---

## Phase 3 - Thesis Book Review (Daily Quick Pass)

- Open [[00_Dashboard/High Priority Thesis Monitor]] and clear the Review Queue.
- Review any thesis where `break_risk_status` or `monitor_status` changed during the day.
- If you want to refresh monitor stamps across the core book, run:

```powershell
powershell scripts/update-thesis-monitor.ps1
```

---

## Phase 4 - Weekly Conviction And Expansion Loop

Run these once per week after the daily cycle, preferably Friday or Sunday:

```powershell
# Sector-driven conviction summary
node run.mjs conviction-delta

# Review proposed signal-driven scorecard updates first
powershell scripts/update-thesis-scorecards.ps1 -ApplySignals -DryRun

# Apply them when the dry run looks right
powershell scripts/update-thesis-scorecards.ps1 -ApplySignals

# Graph and regime context
node run.mjs infranodus --path 10_Theses/
node run.mjs playbook housing-cycle
```

Weekly review checklist:
- Re-open [[00_Dashboard/Capital Allocation Board]] and inspect `Conviction Momentum`.
- Review `05_Data_Pulls/Sectors/YYYY-MM-DD_Conviction_Delta.md`.
- Review any new `06_Signals/CONFIRM_*` or `06_Signals/CONTRADICT_*` notes.
- Review `Emerging Patterns` in [[00_Dashboard/Capital Allocation Board]] and `000-moc/moc-theses`.
- Review any new auto-generated bridge thesis notes tagged `bridge` and `auto-generated`.

### Rolling Score Rules

| Rolling score (7d) | System output |
| --- | --- |
| `>= +5` | Suggest one-step conviction promotion and one-step allocation-priority promotion |
| `+3 to +4` | Set `monitor_status: "strengthening"` |
| `-3 to -4` | Set `break_risk_status: "watch"` |
| `<= -5` | Set `status: "On Hold"` and suggest `allocation_priority: "watch"` |

---

## Emerging Pattern Rules

- `sector-scan` creates or refreshes Draft thesis stubs when sector evidence fails to map cleanly to an existing thesis.
- Draft stubs track:
  - `emerging_pattern_sector`
  - `emerging_pattern_first_seen`
  - `emerging_pattern_last_seen`
  - `emerging_pattern_streak_days`
- A stub is promoted from `Draft` to `Active` after 3 consecutive calendar-day hits while staying `conviction: low` and `allocation_priority: watch`.
- When a newly promoted stub shares at least two normalized `core_entities` with an active thesis, the system generates a bridge thesis note tagged `thesis`, `bridge`, and `auto-generated`.

---

## System Status

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 1 - Operational foundation | Live | `daily-routine.ps1`, cleanup, validate, dashboards |
| Phase 2 - Sector-to-thesis routing | Live | `node run.mjs sector-scan` plus `CONFIRM_*` and `CONTRADICT_*` signals |
| Phase 3 - Adaptive sizing | Live | `node run.mjs conviction-delta` plus `update-thesis-scorecards.ps1 -ApplySignals` |
| Phase 4 - Research expansion | Live | Draft-stub lifecycle, promotion after 3 days, bridge-note generation |
| Phase 5 - Full autonomy | Future only | Scheduling and unattended execution are still out of scope |

---

## Related Dashboards

- [[00_Dashboard/Signal Board]]
- [[00_Dashboard/Capital Allocation Board]]
- [[00_Dashboard/High Priority Thesis Monitor]]
- [[00_Dashboard/Cross-Domain Thesis Board]]
- [[00_Dashboard/Data Freshness]]
