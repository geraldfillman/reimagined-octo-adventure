/**
 * pull-fec-deltas.mjs
 *
 * Purpose: Pull last 7 days of FEC filings for tracked PACs/companies
 *
 * Inputs:
 *   - watchlist: politics/watchlist-pacs.json (committee IDs)
 *
 * Outputs:
 *   - World_Machine/Politics/Observations/YYYY-MM-DD - FEC Delta.md
 *
 * Cadence: Daily
 *
 * Environment:
 *   - FEC_API_KEY (optional; free tier available)
 */

async function pullFecDeltas() {
  const watchlist = await loadWatchlist('politics/watchlist-pacs.json');

  console.log(`[FEC] Loaded ${watchlist.length} PAC committee IDs from watchlist`);

  const results = [];

  // TODO: Fetch from FEC API (https://api.open.fec.gov)
  // GET /committee/{committee_id}/filings
  // Filter: last 7 days
  // Normalize: committee_id, filing_date, form_type, amount, filer_name

  for (const pac of watchlist) {
    console.log(`[FEC] Processing PAC: ${pac.name} (${pac.committee_id})`);
    // TODO: Make API call for this PAC's recent filings
    results.push({
      pac_name: pac.name,
      committee_id: pac.committee_id,
      filings: [] // TODO: populated from API
    });
  }

  // TODO: Format as markdown note with table:
  // Date | Form | Filer | Amount | Filing URL

  const outputPath = `World_Machine/Politics/Observations/${new Date().toISOString().split('T')[0]} - FEC Delta.md`;
  console.log(`[FEC] Output would be written to: ${outputPath}`);

  return { success: true, filings_found: 0, output_path: outputPath };
}

async function loadWatchlist(path) {
  // TODO: Load JSON from vault path
  return [];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  pullFecDeltas().then(r => console.log(JSON.stringify(r, null, 2)));
}

export { pullFecDeltas };
