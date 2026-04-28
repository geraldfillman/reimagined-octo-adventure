/**
 * osint-umbra.mjs — Umbra Space SAR open data catalog monitor (Bellingcat)
 *
 * Usage:
 *   node run.mjs scan osint-umbra --region "25.0,56.0,27.0,58.0"
 *   node run.mjs scan osint-umbra --region "25.0,56.0,27.0,58.0" --dry-run
 *
 * Region format: "lat_min,lon_min,lat_max,lon_max"
 * Example regions:
 *   Strait of Hormuz:    "25.0,56.0,27.0,58.5"
 *   Black Sea:           "41.0,27.0,47.0,42.0"
 *   Persian Gulf broad:  "23.0,48.0,29.0,61.0"
 *
 * Requires: pip install -r requirements.txt (from bellingcat/umbra-open-data-tracker)
 * Source:   https://github.com/bellingcat/umbra-open-data-tracker
 *
 * Output:
 *   05_Data_Pulls/osint/umbra-<region_label>-<date>.json
 *   05_Data_Pulls/osint/umbra-<region_label>-<date>.kml  (if tool produces KML)
 */

import { spawnSync, execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

// Named region shortcuts
const NAMED_REGIONS = {
  hormuz:        '25.0,56.0,27.0,58.5',
  'black-sea':   '41.0,27.0,47.0,42.0',
  'persian-gulf':'23.0,48.0,29.0,61.0',
  'red-sea':     '12.0,32.0,30.0,44.0',
  ukraine:       '44.0,22.0,52.0,40.0',
};

export async function pull(flags = {}) {
  let region = flags.region;

  // Support named region shortcuts
  if (region && NAMED_REGIONS[region.toLowerCase()]) {
    region = NAMED_REGIONS[region.toLowerCase()];
  }

  if (!region) {
    console.error('Error: --region <lat_min,lon_min,lat_max,lon_max> is required.');
    console.error('Named shortcuts: hormuz, black-sea, persian-gulf, red-sea, ukraine');
    console.error('Example: node run.mjs scan osint-umbra --region hormuz');
    process.exit(1);
  }

  const [latMin, lonMin, latMax, lonMax] = region.split(',').map(Number);
  if ([latMin, lonMin, latMax, lonMax].some(isNaN)) {
    console.error('Error: region must be four comma-separated numbers: lat_min,lon_min,lat_max,lon_max');
    process.exit(1);
  }

  const regionLabel = Object.entries(NAMED_REGIONS).find(([, v]) => v === region)?.[0]
    ?? `${latMin}N_${lonMin}E`;
  const today = new Date().toISOString().slice(0, 10);
  const safeLabel = regionLabel.replace(/[^a-zA-Z0-9._-]/g, '_');
  const outputFile = join(OUTPUT_DIR, `umbra-${safeLabel}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🛰️  Umbra SAR open data tracker: ${regionLabel}`);
  console.log(`   Bounds: lat [${latMin}, ${latMax}], lon [${lonMin}, ${lonMax}]`);
  console.log(`   Output: ${outputFile}`);

  if (dryRun) {
    console.log('\n[dry-run] Would execute: python tracker.py --region <bounds>');
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  // Try to locate the umbra-open-data-tracker repo
  const trackerScript = join(VAULT_ROOT, 'scripts', 'vendor', 'umbra-open-data-tracker', 'tracker.py');
  const hasTracker = existsSync(trackerScript);

  if (!hasTracker) {
    console.warn('⚠️  umbra-open-data-tracker not found at scripts/vendor/umbra-open-data-tracker/');
    console.warn('   Clone with:');
    console.warn('   git clone https://github.com/bellingcat/umbra-open-data-tracker scripts/vendor/umbra-open-data-tracker');
    // Still write a stub output so the scan is recorded
    const stub = {
      region: regionLabel,
      bounds: { lat_min: latMin, lon_min: lonMin, lat_max: latMax, lon_max: lonMax },
      scan_date: today,
      tool: 'umbra-open-data-tracker',
      status: 'not-installed',
      message: 'Clone the repo into scripts/vendor/umbra-open-data-tracker and re-run.',
    };
    writeFileSync(outputFile, JSON.stringify(stub, null, 2), 'utf8');
    console.log(`   Stub written: ${outputFile}`);
    return stub;
  }

  const result = spawnSync(
    'python',
    [trackerScript, '--lat-min', String(latMin), '--lon-min', String(lonMin),
     '--lat-max', String(latMax), '--lon-max', String(lonMax)],
    { encoding: 'utf8', timeout: 3 * 60 * 1000 }
  );

  if (result.error) {
    console.error(`❌ Umbra tracker error: ${result.error.message}`);
    process.exit(1);
  }

  let images = [];
  try {
    images = JSON.parse(result.stdout);
  } catch {
    // Parse text output if not JSON
    const lines = result.stdout.trim().split('\n').filter(Boolean);
    images = lines.map(l => ({ description: l }));
  }

  const output = {
    region: regionLabel,
    bounds: { lat_min: latMin, lon_min: lonMin, lat_max: latMax, lon_max: lonMax },
    scan_date: today,
    tool: 'umbra-open-data-tracker',
    source: 'bellingcat/umbra-open-data-tracker',
    new_images: images.length,
    images,
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'umbra-sar', target: regionLabel, targetType: 'coordinates', resultCount: images.length, alertCount: images.length > 0 ? 1 : 0, outputFile, today, tags: ['satellite', 'sar', 'geospatial'] });

  console.log(`\n✅ Umbra scan complete:`);
  console.log(`   New SAR images: ${images.length}`);
  console.log(`   Saved: ${outputFile}`);

  if (images.length > 0) {
    console.log('\n   Recent imagery:');
    images.slice(0, 5).forEach(img =>
      console.log(`   → ${img.id ?? img.title ?? img.description ?? JSON.stringify(img).slice(0, 80)}`)
    );
  }

  return output;
}
