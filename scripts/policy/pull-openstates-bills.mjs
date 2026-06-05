/**
 * pull-openstates-bills.mjs
 *
 * Purpose: OpenStates query for new/updated bills in NY/IL/TX/FL/CA matching sector keywords
 *
 * Inputs:
 *   - Keywords: policy/sector-keywords.json
 *   - States: NY, IL, TX, FL, CA
 *
 * Outputs:
 *   - Policy/Bills/State/<STATE>/<bill_id> - <title>.md (one per new bill)
 *   - Policy/Observations/YYYY-MM-DD - State Bills Digest.md (daily)
 *
 * Cadence: Daily
 *
 * Environment:
 *   - OPENSTATES_API_KEY (required; free tier available from OpenStates)
 */

async function pullOpenStatesBills() {
  const apiKey = process.env.OPENSTATES_API_KEY;
  if (!apiKey) {
    console.error('[OpenStates] Missing OPENSTATES_API_KEY');
    return { success: false, error: 'No API key' };
  }

  const keywords = await loadKeywords('policy/sector-keywords.json');
  const states = ['NY', 'IL', 'TX', 'FL', 'CA'];

  console.log(`[OpenStates] Scanning ${states.length} states for new bills...`);

  const allBills = [];

  // TODO: For each state:
  // GET https://openstates.org/api/v3/bills
  // Params: jurisdiction=<state>, updated_since=<ISO8601 date 7d ago>
  // Search: title/summary matches keyword list (OR logic)

  for (const state of states) {
    console.log(`[OpenStates] Querying ${state} bills...`);

    // TODO: Make OpenStates API call for this state
    // Parse: bill_id, title, introduced_date, sponsors, summary, current_status

    allBills.push({
      state,
      bills: [] // TODO: populated from API
    });
  }

  // TODO: For each new bill found:
  // - Create note at Policy/Bills/State/<STATE>/<bill_id> - <title>.md
  // - Format: frontmatter (bill_id, state, title, sector, status, introduced_date)
  // - Body: summary + sponsor list + link to OpenStates

  // TODO: Create daily digest at Policy/Observations/YYYY-MM-DD - State Bills Digest.md
  // - List all new bills
  // - Grouped by state

  const outputDate = new Date().toISOString().split('T')[0];
  const digestPath = `Policy/Observations/${outputDate} - State Bills Digest.md`;
  console.log(`[OpenStates] Digest output: ${digestPath}`);

  return { success: true, bills_found: 0, digest_path: digestPath };
}

async function loadKeywords(path) {
  // TODO: Load JSON from vault path
  return {};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  pullOpenStatesBills().then(r => console.log(JSON.stringify(r, null, 2)));
}

export { pullOpenStatesBills };
