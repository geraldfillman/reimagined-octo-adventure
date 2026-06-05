# Watchlist: PACs

Schema for `watchlist-pacs.json`:

```json
[
  {
    "committee_id": "C00123456",
    "name": "SuperPAC Name",
    "sector": "housing|defense|tech|other",
    "status": "active|archived"
  }
]
```

Fields:
- **committee_id** (string): FEC committee ID (required)
- **name** (string): Human-readable PAC name
- **sector** (string): Primary business sector for filtering
- **status** (string): active or archived (for skipping defunct PACs)

Example:
```json
[
  {
    "committee_id": "C00000001",
    "name": "Real Estate Action Fund",
    "sector": "housing",
    "status": "active"
  }
]
```
