---
name: "snscrape"
category: "Social_Sentiment"
type: "CLI/Python Library (OSS)"
provider: "Bellingcat / GitHub OSS"
pricing: "Free (open source)"
status: "Active"
priority: "Medium"
url: "https://github.com/bellingcat/snscrape"
provides:
  - "Twitter/X archive scraping (no API key required)"
  - "Instagram post scraping"
  - "Facebook public post scraping"
  - "Reddit scraping (complement to official API)"
  - "Mastodon, Bluesky, and other platform support"
  - "Historical post retrieval beyond official API limits"
best_use_cases:
  - "Sentiment analysis: executive social media activity around earnings or events"
  - "Thesis signals: track analyst or investor community discussions on Twitter"
  - "Corporate communications: archive company official account posts"
  - "Short thesis: detect narrative changes in management communications"
tags:
  - osint
  - social-media
  - twitter
  - sentiment
  - bellingcat
  - archive
related_sources:
  - "[[Reddit API]]"
  - "[[PullPush-Reddit]]"
  - "[[Telegram]]"
key_location: "none"
integrated: false
notes: "Bellingcat tool (343★). Python library + CLI. Scrapes without API keys by mimicking browser requests. Particularly useful for Twitter/X historical data that the official API restricts behind high-tier paywalls. Passive-only."
---

## Summary

snscrape is Bellingcat's multi-platform social media scraper that retrieves posts without requiring official API keys. For investment research, the primary use case is Twitter/X — executive commentary, analyst discussion, and corporate announcements that are publicly visible but inaccessible through the heavily restricted official API. It can retrieve historical posts well beyond official API time limits.

## What It Provides

- Twitter/X: search results, user timelines, hashtag archives, historical posts
- Instagram: public posts, hashtag results
- Facebook: public group and page posts
- Reddit: subreddit and user posts (as a keyless complement to the OAuth API)
- Mastodon, Bluesky, and additional platforms

## Use Cases

- **Sentiment analysis**: executive and management Twitter activity as a soft signal around earnings
- **Thesis signals**: analyst and investor community discussions on Twitter around portfolio companies
- **Corporate communications**: archive official company and IR account posts
- **Short thesis**: detect narrative shifts, deleted posts, or tone changes in management communications

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: No (browser-based scraping)  
**Rate Limits**: Be conservative — aggressive scraping will trigger platform blocks; respect platform ToS  
**Update Frequency**: On-demand  
**Data Format**: JSON (one object per post)  
**Script**: `node run.mjs scan osint-snscrape --platform twitter --query "AAPL earnings"` → outputs to `05_Data_Pulls/social/`

### Setup

```bash
pip install snscrape
snscrape twitter-search "AAPL earnings" --jsonl > output.jsonl
snscrape twitter-user elonmusk --jsonl > timeline.jsonl
```

## Related Sources

- [[Reddit API]]
- [[PullPush-Reddit]]
- [[Telegram]]
