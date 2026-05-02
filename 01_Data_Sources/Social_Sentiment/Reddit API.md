---
name: "Reddit API"
category: "Social_Sentiment"
type: "API"
provider: "Reddit Inc."
pricing: "Free (public JSON) | OAuth: 60 req/min with credentials"
status: "Active"
priority: "Supplementary"
url: "https://www.reddit.com/dev/api/"
provides:
  - "Subreddit posts and comments"
  - "Upvote/downvote scores and comment velocity"
  - "Historical post search by keyword"
  - "User account activity (for entity research)"
  - "Subreddit subscriber counts and growth"
best_use_cases:
  - "Retail sentiment tracking on covered tickers (r/wallstreetbets, r/investing)"
  - "Thesis narrative monitoring in sector-specific subreddits"
  - "Short squeeze / gamma squeeze early signal detection"
  - "Supply chain and sector discussion sentiment"
  - "Housing sentiment (r/REBubble, r/FirstTimeHomeBuyer, r/realestate)"
tags:
  - social-sentiment
  - retail-sentiment
  - narrative-tracking
  - thesis-signals
related_sources:
  - "[[NewsAPI]]"
  - "[[PullPush-Reddit]]"
key_location: "REDDIT_CLIENT_ID"
linked_puller: "scripts/pullers/reddit.mjs"
update_frequency: "weekly"
owner: "geraldfillman"
last_reviewed: "2026-04-06"
integrated: true
notes: "Public JSON API requires no auth (1 req/sec). OAuth with REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET unlocks 60 req/min. Script: node run.mjs pull reddit --subreddit wallstreetbets --query AAPL. Thesis-aware mode: --thesis flag auto-maps to relevant subreddits."
---

## Summary

Reddit's API provides access to posts, comments, vote scores, and search across all public subreddits. For investment research, it is the primary **retail sentiment and narrative tracking** layer — surfacing emerging conviction, squeeze candidates, and thesis-hostile narratives before they appear in mainstream news.

## What It Provides

- Subreddit posts and comments (title, body, score, comment count, timestamp)
- Upvote/downvote scores and comment velocity (engagement signals)
- Historical post search by keyword within a subreddit
- User account activity (for entity/short seller research)
- Subreddit subscriber counts and growth

## Use Cases

- **Retail sentiment** on covered tickers → `06_Signals/` if score thresholds fire
- **Thesis narrative monitoring** in sector-specific subreddits (see routing below)
- **Short squeeze / gamma squeeze** early signal detection (comment velocity spikes)
- **Thesis-hostile narrative** detection (bearish post volume increases)
- **Housing sentiment** (r/REBubble, r/FirstTimeHomeBuyer, r/realestate)

## Thesis → Subreddit Routing

| Thesis Domain | Primary Subreddits |
|--------------|-------------------|
| Housing / Real Estate | r/realestate, r/REBubble, r/FirstTimeHomeBuyer, r/RealEstate |
| Biotech / Healthcare | r/biotech, r/investing, r/medicine |
| Defense / Government | r/geopolitics, r/worldnews, r/military |
| Climate / Energy | r/energy, r/solar, r/electricvehicles, r/climate |
| Supply Chain | r/logistics, r/supplychain, r/economics |
| General Equities | r/wallstreetbets, r/investing, r/stocks, r/SecurityAnalysis |
| Macro | r/Economics, r/econmonitor, r/MacroEconomics |

## Integration Notes

**Status**: Integrated  
**API Key Required**: Optional (REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET for OAuth)  
**Rate Limits**: No auth: 1 req/sec | OAuth: 60 req/min  
**Update Frequency**: On-demand or weekly (weekly cadence recommended)  
**Data Format**: JSON  
**Script**: `node run.mjs pull reddit --subreddit <sub> --query <term> [--limit 25]`  
**Thesis mode**: `node run.mjs pull reddit --thesis "Housing Supply Correction"`  
**Output**: `05_Data_Pulls/social/reddit-{subreddit}-{date}.json`

### OAuth Setup (for higher rate limits)

```
REDDIT_CLIENT_ID=<app_id from reddit.com/prefs/apps>
REDDIT_CLIENT_SECRET=<app_secret>
REDDIT_USER_AGENT=vault-osint/1.0
```

## Related Sources

- [[NewsAPI]]
- [[PullPush-Reddit]]
