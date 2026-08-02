---
title: "Health Review Board"
type: "dashboard"
tags: [dashboard, company-intel, health-review]
---

# Health Review Board

Operator surface for the Corporate Health, Integrity & Market-Behavior Framework. Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Map: [[000-moc/moc-company-intel]] · Companion: [[00_Dashboard/Company Intel Board]]

> **Score bands (§16):** 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
> **Red-flag override (§7.3):** a hard-stop governance event caps any score until investigated — overrides surface first below regardless of total.

---

## Attention First — Red-Flag Overrides

```dataview
TABLE ticker, total_score, red_flags, date
FROM "13_Company_Intel/Reviews"
WHERE node_type = "health_review" AND red_flag_override = true
SORT date DESC
```

## Divergences Worth Investigating (§13)

```dataview
TABLE ticker, divergence_pattern, process_quality, outcome_quality, market_response, total_score, date
FROM "13_Company_Intel/Reviews"
WHERE node_type = "health_review" AND divergence_pattern != "none" AND divergence_pattern != ""
SORT date DESC
```

## Latest Reviews — Score Rundown

```dataview
TABLE ticker, economic_health_score, stewardship_score, market_confirmation_score, total_score, red_flag_override, date
FROM "13_Company_Intel/Reviews"
WHERE node_type = "health_review"
SORT date DESC
LIMIT 25
```

## Checkpoints Due (§17 Step 8)

```dataview
TABLE ticker, next_checkpoint, next_checkpoint_date, total_score
FROM "13_Company_Intel/Reviews"
WHERE node_type = "health_review" AND next_checkpoint_date != "" AND date(next_checkpoint_date) <= date(today)
SORT next_checkpoint_date ASC
```

## Fragile / Avoid (<55 total)

```dataview
TABLE ticker, total_score, divergence_pattern, next_checkpoint, date
FROM "13_Company_Intel/Reviews"
WHERE node_type = "health_review" AND total_score < 55 AND total_score != null
SORT total_score ASC
```

## Marker Pull Freshness

```dataview
TABLE symbol, skeleton_profile, signal_status, date_pulled
FROM "05_Data_Pulls/Edgar"
WHERE data_type = "health_markers"
SORT date_pulled DESC
LIMIT 20
```

## Stale Reviews (no review in 120+ days)

```dataview
TABLE ticker, total_score, date
FROM "13_Company_Intel/Reviews"
WHERE node_type = "health_review" AND date != "" AND date(date) < date(today) - dur(120 days)
SORT date ASC
```

---

## CLI

```powershell
node run.mjs edgar health --ticker NVDA                       # §5 bands + §9.2 relative performance → pull note
node run.mjs edgar health --ticker NVDA --benchmark XLK       # sector ETF instead of SPY
node run.mjs edgar health --ticker NVDA --review              # also scaffold the dated review note
node run.mjs edgar health --ticker NVDA --dry-run             # plan only, no network
```

## Cadence (§17)

1. **Quarterly:** re-run `edgar health`, walk §17 steps 1–8 in a fresh review note, write the divergence sentence, set the next falsifiable checkpoint.
2. **On any §7.3 hard-stop event:** set `red_flag_override: true`, suspend the score, open Intel Findings until understood.
3. Scores organize evidence — **the written thesis decides, not the number** (§16).
