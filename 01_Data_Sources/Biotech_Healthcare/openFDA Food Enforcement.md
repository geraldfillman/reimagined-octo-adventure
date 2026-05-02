---
name: "openFDA Food Enforcement"
category: "Biotech_Healthcare"
type: "API"
provider: "FDA"
pricing: "Free"
status: "Active"
priority: "Supplementary"
url: "https://open.fda.gov/apis/food/enforcement/"
provides: ["food recalls", "enforcement reports", "recall classifications", "recall reasons", "recalling firms"]
best_use_cases: ["Food-safety pulse", "bioengineered food category-risk monitoring", "recall clustering", "regulatory risk review"]
tags: ["biotech-healthcare", "food-safety", "fda", "biofood"]
related_sources: ["[[FDA open data Drugs@FDA]]"]
key_location: "None required"
integrated: true
linked_puller: "biofood"
update_frequency: "on-demand"
owner: "CaveUser"
last_reviewed: "2026-04-25"
notes: "Used by the Bioengineered Food Systems thesis puller as a food-safety and regulatory-risk pulse."
---

## Summary

- openFDA Food Enforcement provides recall and enforcement report metadata for food products.
- The biofood workflow uses it as a category-risk layer, especially for contamination, labeling, and trust issues that could affect bioengineered or alternative food adoption.

## What It Provides

- Food recall dates and classifications
- Product descriptions
- Recall reasons
- Recalling firms and states
- Enforcement report metadata

## Use Cases

- Track food-safety risk around novel food systems.
- Watch for Class I recall clustering.
- Add a regulatory reality check to precision-fermentation, alternative-protein, and food-ingredient narratives.

## Integration Notes

**Status**: Integrated  
**Linked Puller**: `biofood`  
**API Key Required**: No  
**Rate Limits**: openFDA public limits apply  
**Update Frequency**: On demand  
**Data Format**: JSON  
**Owner**: CaveUser  
**Last Reviewed**: 2026-04-25

## Related Sources

- [[FDA open data Drugs@FDA]]
