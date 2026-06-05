# Watchlist: Companies

Schema for `watchlist-companies.json`:

```json
[
  {
    "name": "Company Name",
    "ticker": "TICK",
    "cik": "0000123456",
    "sector": "housing|defense|tech|other",
    "status": "active|delisted"
  }
]
```

Fields:
- **name** (string): Company name (required)
- **ticker** (string): Stock ticker symbol (optional)
- **cik** (string): SEC CIK number for EDGAR lookups (optional)
- **sector** (string): Primary business sector
- **status** (string): active or delisted

Used by:
- `detect-shell-anomalies.mjs`: Extract executive names from EDGAR
- `pull-senate-lda-quarterly.mjs`: Match against Senate LDA filings

Example:
```json
[
  {
    "name": "ZipperHomes Inc",
    "ticker": "ZOME",
    "cik": "0001234567",
    "sector": "housing",
    "status": "active"
  }
]
```
