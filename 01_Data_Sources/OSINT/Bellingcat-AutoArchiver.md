---
name: "Bellingcat Auto Archiver"
category: "OSINT"
type: "CLI/API"
provider: "Bellingcat"
pricing: "Free (open source) | Storage costs apply (GDrive/S3)"
status: "Active"
priority: "Low"
url: "https://github.com/bellingcat/auto-archiver"
provides:
  - "Automated archiving of web content (tweets, pages, video, images)"
  - "Perma-links to archived evidence"
  - "Metadata extraction from archived content"
  - "Google Drive / S3 storage integration"
best_use_cases:
  - "Evidence preservation for thesis documentation"
  - "Signal note evidence archiving (news articles, social media)"
  - "Research audit trail for short thesis documentation"
  - "Archiving regulatory announcements before potential removal"
tags:
  - osint
  - bellingcat
  - archiving
  - evidence
  - research-infrastructure
related_sources:
  - "[[NewsAPI]]"
  - "[[Reddit API]]"
key_location: ""
integrated: false
notes: "Requires Google Drive or S3 bucket for storage. Outputs archived URLs and metadata to Google Sheets or local CSV. Best used as a companion tool when generating Signal notes — archive the triggering evidence URL."
---

## Summary

Bellingcat's Auto Archiver automatically captures and preserves web content (tweets, news articles, videos, social media posts) to persistent storage before the original is deleted or modified. For investment research, it creates a **durable evidence trail** for signal notes and thesis documentation — especially important for short thesis research where source material may disappear.

## What It Provides

- Automated archiving of web content to Google Drive, S3, or local storage
- Perma-links to archived evidence snapshots
- Metadata extraction (timestamp, author, content hash)
- Google Sheets integration for tracking archived sources

## Use Cases

- Evidence preservation for thesis documentation → `10_Theses/`
- Signal note evidence archiving (news, social media, regulatory announcements)
- Research audit trail for short thesis documentation
- Archiving regulatory announcements before potential removal

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Google Drive API or AWS S3 credentials  
**Rate Limits**: Dependent on storage backend  
**Update Frequency**: On-demand or triggered from signal note creation  
**Data Format**: Google Sheets + Drive links, or CSV + local files

### Setup

```bash
pip install auto-archiver
# Configure: auto_archiver.yaml (storage, APIs)
auto-archiver --config auto_archiver.yaml --sheet <google_sheet_id>
```

## Related Sources

- [[NewsAPI]]
- [[Reddit API]]
