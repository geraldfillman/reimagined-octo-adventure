/**
 * pull-opensecrets-recent.mjs
 *
 * Purpose: Rolling 30-day OpenSecrets industry aggregates for Housing/Defense/Tech
 *
 * Inputs:
 *   - sectors: hardcoded (housing, defense, tech)
 *
 * Outputs:
 *   - Politics/Observations/YYYY-MM-DD - OpenSecrets Digest.md (weekly)
 *
 * Cadence: Weekly
 *
 * Environment:
 *   - OPENSECRETS_API_KEY (required)
 */

async function pullOpenSecretsRecent() {
  const apiKey = process.env.OPENSECRETS_API_KEY;
  if (!apiKey) {
    console.error('[OpenSecrets] Missing OPENSECRETS_API_KEY');
    return { success: false, error: 'No API key' };
  }

  const sectors = {
    housing: { name: 'Housing & Construction', code: 'H' },
    defense: { name: 'Defense', code: 'D' },
    tech: { name: 'Technology', code: 'T' }
  };

  const results = [];

  for (const [key, sector] of Object.entries(sectors)) {
    console.log(`[OpenSecrets] Fetching ${sector.name} aggregates...`);

    // TODO: Fetch from OpenSecrets API
    // GET /outsidespending.php?APIkey=<key>&sector=<code>&cycle=2026
    // Parse: total spent, top organizations, recent expenditures

    results.push({
      sector: sector.name,
      total_30d: 0, // TODO: from API
      top_orgs: [] // TODO: from API
    });
  }

  // TODO: Format as markdown digest with:
  // - 30-day spending by sector
  // - Top 5 orgs per sector
  // - YoY comparison

  const outputPath = `Politics/Observations/${new Date().toISOString().split('T')[0]} - OpenSecrets Digest.md`;
  console.log(`[OpenSecrets] Output would be written to: ${outputPath}`);

  return { success: true, sectors_processed: 3, output_path: outputPath };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  pullOpenSecretsRecent().then(r => console.log(JSON.stringify(r, null, 2)));
}

export { pullOpenSecretsRecent };
