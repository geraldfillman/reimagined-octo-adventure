/**
 * detect-shell-anomalies.mjs
 *
 * Purpose: Heuristic shell company detector using OpenCorporates + SEC EDGAR cross-reference
 *
 * Algorithm:
 *   1. Pull DE/NV/WY new filings (last 30d) via OpenCorporates free search
 *   2. Cross-reference officer names against tracked-company executives (SEC EDGAR)
 *   3. Flag matches; score: high if name match + recent + DE/NV/WY + unusual SIC
 *   4. Output alerts if matches found
 *
 * Inputs:
 *   - politics/watchlist-companies.json (for EDGAR executive scrape)
 *
 * Outputs:
 *   - Politics/Observations/YYYY-MM-DD - Shell Anomaly.md (if matches found)
 *
 * Cadence: Weekly
 *
 * Warning: Heuristic detector. False-positive heavy. Manual review required.
 *
 * Environment:
 *   - OPENCORPORATES_API_KEY (optional; free tier limited)
 */

async function detectShellAnomalies() {
  console.log('[Shell Detector] Starting heuristic shell company scan...');

  const watchlist = await loadWatchlist('politics/watchlist-companies.json');
  const executives = await extractExecutives(watchlist);

  console.log(`[Shell Detector] Loaded ${executives.size} executive names from watchlist`);

  // TODO: Query OpenCorporates API for new incorporations in DE, NV, WY (last 30d)
  // GET /companies/search?jurisdiction_code=<DE|NV|WY>&filed_after=YYYY-MM-DD
  const newFilings = [];

  // TODO: For each new filing:
  // - Parse: incorporation_date, officers, company_name, SIC code
  // - Check officer names against executives set
  // - Score: +high if name match, +med if recent DE/NV/WY, +high if SIC unusual

  const matches = [];
  // TODO: Filter to matches with score >= threshold (e.g., 2+)

  if (matches.length > 0) {
    const outputPath = `Politics/Observations/${new Date().toISOString().split('T')[0]} - Shell Anomaly.md`;
    console.log(`[Shell Detector] Found ${matches.length} anomalies. Writing to: ${outputPath}`);

    // TODO: Format as markdown alert with:
    // - Company name | Jurisdiction | Officer Name | Score | Manual Review Link
    // - Caveat: heuristic, high false-positive rate

    return { success: true, anomalies_detected: matches.length, output_path: outputPath };
  }

  console.log('[Shell Detector] No anomalies detected this scan');
  return { success: true, anomalies_detected: 0 };
}

async function loadWatchlist(path) {
  // TODO: Load JSON from vault path
  return [];
}

async function extractExecutives(watchlist) {
  // TODO: For each company in watchlist:
  // - Scrape SEC EDGAR for officers/directors
  // - Extract names, titles
  // - Return Set of names for membership testing
  return new Set();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  detectShellAnomalies().then(r => console.log(JSON.stringify(r, null, 2)));
}

export { detectShellAnomalies };
