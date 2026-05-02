---
name: "PullPush Reddit Archive"
category: "Social_Sentiment"
type: "API"
provider: "PullPush.io (community)"
pricing: "Free"
status: "Active"
priority: "Supplementary"
url: "https://pullpush.io"
provides:
  - "Historical Reddit posts and comments (2005–present)"
  - "Deleted and removed post recovery"
  - "Full-text search across all Reddit content"
  - "Comment and post metadata including scores and timestamps"
best_use_cases:
  - "Historical narrative research — how has sentiment evolved on a thesis topic?"
  - "Recovering deleted posts relevant to company risk events"
  - "Longitudinal sentiment tracking for short thesis research"
  - "Finding early discussion of emerging risks before mainstream coverage"
tags:
  - social-sentiment
  - historical-data
  - reddit
  - narrative-tracking
related_sources:
  - "[[Reddit API]]"
key_location: ""
integrated: false
notes: "No API key required. Free and open. Complementary to live Reddit API — PullPush provides historical depth while the live API provides recency. Base URL: https://api.pullpush.io/reddit/search/submission/"
---

## Summary

PullPush is the community-maintained successor to Pushshift, providing full-text search and retrieval across historical Reddit data from 2005 to the present — including deleted and removed content. No API key or authentication required.

## What It Provides

- Historical Reddit posts and comments (2005–present)
- Deleted and removed post recovery
- Full-text search across all Reddit content by subreddit, author, keyword, or date range
- Complete post metadata (scores, comment counts, flair, timestamps)

## Use Cases

- Historical narrative research: how has sentiment on a thesis evolved over time?
- Recovering deleted posts relevant to company risk investigation
- Longitudinal sentiment tracking for short thesis documentation
- Finding early retail discussion of emerging risks before mainstream coverage

## Integration Notes

**Status**: Not yet integrated (complement to live Reddit puller)  
**API Key Required**: No  
**Rate Limits**: Respectful use; ~1 req/sec  
**Update Frequency**: On-demand for historical lookups  
**Data Format**: JSON  
**Base URL**: `https://api.pullpush.io/reddit/search/submission/`

### Key query parameters

| Parameter | Purpose |
|-----------|---------|
| `q` | Full-text keyword search |
| `subreddit` | Filter to specific subreddit |
| `after` / `before` | Unix timestamp range |
| `sort` | `score` or `created_utc` |
| `size` | Results per page (max 100) |

### Example

```bash
curl "https://api.pullpush.io/reddit/search/submission/?q=AAPL&subreddit=wallstreetbets&after=1700000000&size=25"
```

## Related Sources

- [[Reddit API]]
