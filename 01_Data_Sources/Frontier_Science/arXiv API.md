---
name: "arXiv API"
category: "Frontier_Science"
type: "API"
provider: "arXiv"
pricing: "Free"
status: "Active"
priority: "Supplementary"
url: "https://info.arxiv.org/help/api/index.html"
provides: ["preprints", "research metadata", "authors", "categories", "publication dates"]
best_use_cases: ["frontier science velocity", "early R&D signal detection", "thesis research monitoring"]
tags: ["frontier-science", "arxiv", "research", "biofood"]
related_sources: ["[[PubMed API]]"]
key_location: "None required"
integrated: true
linked_puller: "arxiv, biofood"
update_frequency: "daily / on-demand"
owner: "CaveUser"
last_reviewed: "2026-04-25"
notes: "Used by multiple research pullers and by the Bioengineered Food Systems thesis puller."
---

## Summary

- arXiv API provides preprint metadata for early-stage research velocity.
- In the biofood workflow, it helps identify leading signals in cellular agriculture, precision fermentation, microbial protein, and synthetic-biology food systems before they appear in slower peer-reviewed channels.

## What It Provides

- Preprint titles and links
- Authors
- Submission dates
- Category metadata
- Searchable abstracts and titles

## Use Cases

- Frontier-science monitoring
- Early signal detection before journal publication
- Research velocity comparison across theses

## Integration Notes

**Status**: Integrated  
**Linked Puller**: `arxiv`, `biofood`  
**API Key Required**: No  
**Rate Limits**: arXiv public API etiquette applies  
**Update Frequency**: Daily / on-demand  
**Data Format**: Atom XML  
**Owner**: CaveUser  
**Last Reviewed**: 2026-04-25

## Related Sources

- [[PubMed API]]
