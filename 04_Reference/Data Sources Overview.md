---
title: Data Sources Overview
type: dashboard
tags:
  - dashboard
  - index
last_updated: 2026-03-27
---

# Data Sources Overview

Summary:
- Master catalog of source notes, category coverage, and integration status.
- Use this dashboard before opening raw source folders or changing provider metadata.

## All Sources by Category

```dataview
TABLE WITHOUT ID
  file.link AS "Source",
  category AS "Category",
  pricing AS "Pricing",
  priority AS "Priority",
  integrated AS "Integrated?"
FROM "01_Data_Sources"
SORT category ASC, priority ASC, name ASC
```

## Sources by Integration Status

### Not Yet Integrated
```dataview
LIST
FROM "01_Data_Sources"
WHERE integrated = false
SORT category ASC
```

### Integrated
```dataview
LIST
FROM "01_Data_Sources"
WHERE integrated = true
SORT category ASC
```

## Category Summary

```dataview
TABLE WITHOUT ID
  category AS "Category",
  length(rows) AS "Source Count"
FROM "01_Data_Sources"
GROUP BY category
SORT category ASC
```

## API Key Status

### Keys Needed (not yet configured)
```dataview
TABLE WITHOUT ID
  file.link AS "Source",
  category AS "Category",
  key_location AS "Env Variable"
FROM "01_Data_Sources"
WHERE key_location != "None required"
SORT category ASC
```

### No Key Required
```dataview
LIST
FROM "01_Data_Sources"
WHERE key_location = "None required"
SORT category ASC
```

## Foundation Sources (Start Here)

```dataview
TABLE WITHOUT ID
  file.link AS "Source",
  category AS "Category",
  provides AS "Provides"
FROM "01_Data_Sources"
WHERE priority = "Foundation"
SORT category ASC
```

## Quick Stats

- **Total Sources**: `$= dv.pages('"01_Data_Sources"').length`
- **Integrated**: `$= dv.pages('"01_Data_Sources"').where(p => p.integrated === true).length`
- **Free**: `$= dv.pages('"01_Data_Sources"').where(p => p.pricing === "Free").length`
- **Freemium**: `$= dv.pages('"01_Data_Sources"').where(p => p.pricing === "Freemium").length`
