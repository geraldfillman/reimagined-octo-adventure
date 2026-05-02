---
name: "Telegram Channel Monitor"
category: "OSINT"
type: "API/CLI"
provider: "Telegram / Telethon (Python)"
pricing: "Free (API credentials required)"
status: "Active"
priority: "Medium"
url: "https://my.telegram.org/apps"
provides:
  - "Public Telegram channel message history"
  - "Channel subscriber counts and metadata"
  - "Real-time message monitoring from specified channels"
  - "Keyword search across channel message history"
best_use_cases:
  - "Geopolitical signal channels for defense/energy/macro theses"
  - "Supply chain disruption alerts from trade/logistics channels"
  - "Market commentary from high-signal Telegram analysts"
  - "Crypto/macro sentiment from dedicated Telegram communities"
  - "Entity research via Bellingcat phone-number-checker"
tags:
  - osint
  - social-sentiment
  - telegram
  - geopolitical-signals
  - supply-chain
related_sources:
  - "[[Reddit API]]"
  - "[[NewsAPI]]"
  - "[[Bellingcat-AutoArchiver]]"
key_location: "TELEGRAM_API_ID"
linked_puller: "scripts/pullers/osint-telegram.mjs"
update_frequency: "on-demand"
owner: "geraldfillman"
last_reviewed: "2026-04-06"
integrated: true
notes: "Uses Telethon (Python MTProto client) to read public channel history. Requires TELEGRAM_API_ID + TELEGRAM_API_HASH from my.telegram.org/apps and a one-time phone verification. Bot API alternative only receives new messages — not suitable for historical monitoring. Script: node run.mjs scan osint-telegram --channel <username>."
---

## Summary

Telegram channel monitoring uses the **Telethon** Python library (MTProto API) to read public channel message histories, metadata, and subscriber counts. For investment research, the primary value is monitoring high-signal geopolitical, macro, and supply-chain Telegram channels that surface actionable intelligence before mainstream news.

## What It Provides

- Full public channel message history (with Telethon)
- Channel subscriber counts and metadata
- Real-time monitoring from specified channels
- Keyword-filtered message export

## Use Cases

- **Geopolitical channels** → defense/energy/supply chain thesis signals
- **Supply chain disruption alerts** from trade and shipping Telegram communities
- **Market commentary** from analyst Telegram channels (macro calls, sector views)
- **Crypto/macro sentiment** from dedicated communities
- **Entity research** — cross-reference with Bellingcat phone-number-checker

## Recommended Channel Categories for Investment Research

| Category | Signal Type | Thesis Relevance |
|----------|------------|-----------------|
| Geopolitical news | Conflict escalation / de-escalation | Defense, Energy, Supply Chain |
| Shipping / Logistics | Port disruptions, vessel incidents | Supply Chain, Commodities |
| Macro commentary | Rate/inflation commentary | Macro Regime, Bonds |
| Energy markets | Oil/gas supply events | Climate/Energy thesis |
| Investigative journalism | Corporate fraud, governance | Company Risk |

## Implementation Notes

**Two approaches — choose based on use case:**

### Option A: Telethon (MTProto) — recommended for historical + monitoring
- Reads any public channel's full history
- Requires: `TELEGRAM_API_ID`, `TELEGRAM_API_HASH` (from my.telegram.org/apps), one-time phone verification
- Python: `pip install telethon`

### Option B: Bot API — simpler but forward-only
- Bot token only (no phone needed)
- Only receives messages sent *after* bot joins the channel
- No access to channel history
- Suitable only for real-time alerting, not research

## Integration Notes

**Status**: Integrated  
**API Key Required**: Yes — `TELEGRAM_API_ID` + `TELEGRAM_API_HASH` (Option A) or `TELEGRAM_BOT_TOKEN` (Option B)  
**Rate Limits**: Telethon has flood-wait handling built in; ~1 req/sec safe  
**Update Frequency**: On-demand or weekly channel sweeps  
**Data Format**: JSON (messages with timestamp, text, views, forwards)  
**Script**: `node run.mjs scan osint-telegram --channel <username> [--limit 100] [--query <keyword>]`  
**Output**: `05_Data_Pulls/osint/telegram-{channel}-{date}.json`

### Telethon Setup

```bash
pip install telethon
# Register at https://my.telegram.org/apps → get API_ID and API_HASH
# First run prompts for phone number verification (one-time)
```

### OSINT Tools Referenced (awesome-osint)

- **Telerecon** — github.com/sockysec/Telerecon: Full recon framework for Telegram investigation
- **Telepathy** — github.com/proseltd/Telepathy: Channel intelligence and network mapping
- **GroupDa** — groupda.com: Search Telegram channels by category/country
- **TgramSearch** — tgramsearch.com: 700k+ channel catalog

## Related Sources

- [[Reddit API]]
- [[NewsAPI]]
- [[Bellingcat-AutoArchiver]]
