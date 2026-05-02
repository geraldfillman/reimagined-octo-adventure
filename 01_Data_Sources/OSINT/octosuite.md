---
name: "octosuite"
category: "OSINT"
type: "CLI (OSS)"
provider: "Bellingcat / GitHub OSS"
pricing: "Free (open source)"
status: "Active"
priority: "High"
url: "https://github.com/bellingcat/octosuite"
provides:
  - "GitHub organization and user OSINT"
  - "Repository analysis (stars, forks, contributors, activity)"
  - "Employee enumeration via GitHub org membership"
  - "Commit activity and contribution pattern analysis"
  - "Repository metadata (topics, languages, license, creation date)"
best_use_cases:
  - "AI/Tech thesis: track open-source activity of portfolio companies"
  - "Semiconductor thesis: monitor toolchain and SDK repos for product velocity signals"
  - "Defense thesis: detect new code repositories as stealth product indicators"
  - "Short thesis: declining contributor activity as a product health signal"
tags:
  - osint
  - github
  - company-risk
  - tech-thesis
  - developer-intelligence
  - bellingcat
related_sources:
  - "[[SpiderFoot]]"
  - "[[theHarvester]]"
  - "[[Recon-ng]]"
key_location: "GITHUB_TOKEN"
integrated: false
notes: "Bellingcat tool (1888★). Terminal-based Python toolkit for GitHub org/user data analysis. Surfaces open-source product velocity, team structure, and stealth launches. Particularly useful for AI and semiconductor theses where GitHub activity often leads product announcements."
---

## Summary

octosuite is Bellingcat's terminal-based GitHub OSINT toolkit. For investment research, it surfaces product velocity signals that are often invisible in traditional financial data — a company's GitHub organization reveals new repositories, declining contributor counts, fork spikes indicating community adoption, and employee turnover via org membership changes. This is especially valuable for AI and developer-tool companies where open-source activity is a leading indicator.

## What It Provides

- Organization-level analysis: repositories, members, contribution patterns
- User-level analysis: activity timeline, public repositories, organization membership
- Repository metadata: stars, forks, issues, topics, license, language breakdown
- Commit activity patterns over time
- Employee enumeration via org membership (passive, public data only)

## Use Cases

- **AI/Tech thesis**: track open-source contribution velocity as a product health signal
- **Semiconductor thesis**: monitor SDK and toolchain repos for activity before earnings
- **Defense thesis**: new stealth repositories often appear before product announcements (e.g., drone or autonomy software)
- **Short thesis**: declining contributor activity or archived repos signal product abandonment

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: GitHub token recommended for higher rate limits (5000 req/hr vs 60 unauthenticated)  
**Rate Limits**: GitHub API rate limits apply  
**Update Frequency**: On-demand per company scan  
**Data Format**: Terminal output; JSON export available  
**Script**: `node run.mjs scan osint-octosuite --org openai` → outputs to `05_Data_Pulls/osint/`

### Setup

```bash
pip install octosuite
octosuite --org openai
octosuite --user some-exec-username
```

## Related Sources

- [[SpiderFoot]]
- [[theHarvester]]
- [[Recon-ng]]
