/**
 * pull-congress-bills.mjs
 *
 * Purpose: Congress.gov API for new/updated bills matching sector keywords (last 7d)
 *
 * Inputs:
 *   - Keywords: policy/sector-keywords.json
 *
 * Outputs:
 *   - Policy/Bills/Federal/<HR or S>-<#> - <title>.md (one per new bill)
 *   - Policy/Observations/YYYY-MM-DD - Congress Digest.md (daily digest)
 *
 * Cadence: Daily
 *
 * Environment:
 *   - None (Congress.gov is free, no auth required)
 */

async function pullCongressBills() {
  const keywords = await loadKeywords('policy/sector-keywords.json');

  console.log('[Congress] Loaded keywords for all sectors');

  const allBills = [];

  // TODO: For each sector in keywords:
  // GET https://api.congress.gov/v3/bill?congress=119&format=json
  // Filter: updated in last 7 days
  // Search: title/summary matches keyword list (OR logic)

  for (const [sector, terms] of Object.entries(keywords)) {
    console.log(`[Congress] Searching ${sector}: ${terms.slice(0, 2).join(', ')}...`);

    // TODO: Make Congress.gov API call for this sector's keywords
    // Parse response: bill_type, number, title, introduced_date, summary

    allBills.push({
      sector,
      bills: [] // TODO: populated from API
    });
  }

  // TODO: For each new bill found:
  // - Create note at Policy/Bills/Federal/<type>-<number> - <title>.md
  // - Format: frontmatter (type, number, title, sector, prognosis_score=TBD)
  // - Body: full summary + link to Congress.gov

  // TODO: Create daily digest at Policy/Observations/YYYY-MM-DD - Congress Digest.md
  // - List all new bills found
  // - Grouped by sector

  const outputDate = new Date().toISOString().split('T')[0];
  const digestPath = `Policy/Observations/${outputDate} - Congress Digest.md`;
  console.log(`[Congress] Digest output: ${digestPath}`);

  return { success: true, bills_found: 0, digest_path: digestPath };
}

async function loadKeywords(path) {
  // TODO: Load JSON from vault path
  return {};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  pullCongressBills().then(r => console.log(JSON.stringify(r, null, 2)));
}

export { pullCongressBills };
