# Policy Module

Automated tracking of federal legislation, rulemaking, and state-level policy changes across Housing, Defense, and Tech sectors.

## Scripts

| Script | Cadence | Purpose |
|--------|---------|---------|
| `pull-congress-bills.mjs` | Daily | New/updated federal bills (Congress.gov) |
| `pull-federal-register.mjs` | Daily | New rulemaking notices from 8 agencies |
| `pull-openstates-bills.mjs` | Daily | New/updated state bills (NY, IL, TX, FL, CA) |
| `pull-govtrack-prognosis.mjs` | Weekly | Refresh passage probability for tracked bills |
| `index.mjs` | (dispatcher) | Run by cadence flag |

## Running Scripts

### Run individual script
```bash
node pull-congress-bills.mjs
node pull-federal-register.mjs
node pull-openstates-bills.mjs
```

### Run by cadence (via index.mjs)
```bash
node index.mjs --daily        # Congress, Federal Register, State Bills
node index.mjs --weekly       # GovTrack prognosis updates
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENSTATES_API_KEY` | Yes | OpenStates state bill tracking |

## Configuration

- **sector-keywords.json**: Keywords for filtering bills/rulemakings by sector (Housing, Defense, Tech)

## Output Locations

```
Policy/
  Bills/
    Federal/              # <Bill type>-<#> - <title>.md
    State/<STATE>/        # <bill_id> - <title>.md
  Regulations/            # <AGENCY>/<rule_id> - <title>.md
  Observations/           # Dated digests and analysis
```

## Agencies Tracked (Federal Register)

- EPA (Environmental Protection Agency)
- HUD (Housing & Urban Development)
- FHFA (Federal Housing Finance Agency)
- DoD (Department of Defense)
- FCC (Federal Communications Commission)
- FTC (Federal Trade Commission)
- SEC (Securities & Exchange Commission)
- CFPB (Consumer Financial Protection Bureau)

## Notes

- Bill notes include `prognosis_score` frontmatter field (0-100, refreshed weekly by pull-govtrack-prognosis)
- Congress.gov and Federal Register APIs are free, no authentication required
- Outputs written as Markdown notes with frontmatter for Dataview integration
