# Politics Module

Automated tracking of political contributions, lobbying disclosures, and shell company detection.

## Scripts

| Script | Cadence | Purpose |
|--------|---------|---------|
| `pull-fec-deltas.mjs` | Daily | FEC filings for tracked PACs |
| `pull-opensecrets-recent.mjs` | Weekly | 30-day industry spending aggregates |
| `pull-senate-lda-quarterly.mjs` | Quarterly | Senate LDA lobbying disclosure filings |
| `detect-shell-anomalies.mjs` | Weekly | Heuristic shell company detection |
| `index.mjs` | (dispatcher) | Run by cadence flag |

## Running Scripts

### Run individual script
```bash
node pull-fec-deltas.mjs
node pull-opensecrets-recent.mjs
```

### Run by cadence (via index.mjs)
```bash
node index.mjs --daily        # FEC deltas
node index.mjs --weekly       # OpenSecrets, Shell anomalies
node index.mjs --quarterly    # Senate LDA
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `FEC_API_KEY` | No | FEC API key (free tier available) |
| `OPENSECRETS_API_KEY` | Yes | OpenSecrets API key |
| `OPENCORPORATES_API_KEY` | No | OpenCorporates (optional for shell detector) |

## Watchlists

- **watchlist-pacs.json**: FEC committee IDs + metadata → See `watchlist-pacs-README.md`
- **watchlist-companies.json**: Companies to track → See `watchlist-companies-README.md`

## Output Locations

```
World_Machine/Politics/
  Observations/           # Dated scan results, digests, alerts
  Companies/              # Per-company lobbying/LDA activity
```

## Notes

- **Shell Anomaly Detector**: Heuristic scanner. High false-positive rate. Always requires manual review.
- Outputs written as Markdown notes with frontmatter for Dataview integration.
