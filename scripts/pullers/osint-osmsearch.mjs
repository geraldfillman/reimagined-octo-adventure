/**
 * osint-osmsearch.mjs — Proximity-based OpenStreetMap feature search (Bellingcat osm-search)
 *
 * Usage:
 *   node run.mjs scan osint-osmsearch --lat 25.3 --lon 56.3 --radius 10000
 *   node run.mjs scan osint-osmsearch --lat 25.3 --lon 56.3 --feature industrial
 *   node run.mjs scan osint-osmsearch --lat 25.3 --lon 56.3 --dry-run
 *
 * Requires: pip install -r requirements.txt (from bellingcat/osm-search)
 * Source:   https://github.com/bellingcat/osm-search
 *
 * Output:
 *   05_Data_Pulls/osint/osmsearch-<lat>_<lon>-<date>.json
 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

// Named coordinate shortcuts for common research locations
const NAMED_LOCATIONS = {
  hormuz:      { lat: 26.6, lon: 56.5 },
  'suez':      { lat: 30.6, lon: 32.3 },
  'malacca':   { lat: 2.5, lon: 101.4 },
};

export async function pull(flags = {}) {
  let lat = parseFloat(flags.lat ?? '');
  let lon = parseFloat(flags.lon ?? '');
  const location = flags.location;

  if (location && NAMED_LOCATIONS[location.toLowerCase()]) {
    const coords = NAMED_LOCATIONS[location.toLowerCase()];
    lat = coords.lat;
    lon = coords.lon;
  }

  if (isNaN(lat) || isNaN(lon)) {
    console.error('Error: --lat <number> and --lon <number> are required (or --location <name>).');
    console.error('Named locations: ' + Object.keys(NAMED_LOCATIONS).join(', '));
    console.error('Example: node run.mjs scan osint-osmsearch --lat 25.3 --lon 56.3 --radius 10000');
    process.exit(1);
  }

  const radius = parseInt(flags.radius ?? '5000', 10);    // default 5km
  const feature = flags.feature ?? 'all';
  const today = new Date().toISOString().slice(0, 10);
  const coordLabel = `${lat.toFixed(1)}N_${lon.toFixed(1)}E`;
  const outputFile = join(OUTPUT_DIR, `osmsearch-${coordLabel}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🗺️  OSM proximity search: (${lat}, ${lon}) radius ${radius}m`);
  console.log(`   Feature filter: ${feature} | Output: ${outputFile}`);

  if (dryRun) {
    console.log(`\n[dry-run] Would execute: python search.py --lat ${lat} --lon ${lon} --radius ${radius}`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const searchScript = join(VAULT_ROOT, 'scripts', 'vendor', 'osm-search', 'search.py');

  if (!existsSync(searchScript)) {
    console.warn('⚠️  osm-search not found at scripts/vendor/osm-search/');
    console.warn('   Clone with:');
    console.warn('   git clone https://github.com/bellingcat/osm-search scripts/vendor/osm-search');

    // Fall back to direct Overpass API query
    console.log('\n   Falling back to direct Overpass API query...');
    return pullViaOverpass(lat, lon, radius, feature, outputFile, today);
  }

  const args = ['--lat', String(lat), '--lon', String(lon), '--radius', String(radius)];
  if (feature !== 'all') args.push('--feature', feature);

  const result = spawnSync('python', [searchScript, ...args], {
    encoding: 'utf8',
    timeout: 2 * 60 * 1000,
  });

  if (result.error) {
    console.error(`❌ osm-search error: ${result.error.message}`);
    process.exit(1);
  }

  let features = [];
  try { features = JSON.parse(result.stdout); } catch {
    features = result.stdout.trim().split('\n').filter(Boolean).map(l => ({ description: l }));
  }

  return writeOutput(features, { lat, lon, radius, feature, coordLabel, today, outputFile });
}

async function pullViaOverpass(lat, lon, radius, featureFilter, outputFile, today) {
  // Simple Overpass API fallback for key infrastructure types
  const query = `
[out:json][timeout:30];
(
  node["industrial"](around:${radius},${lat},${lon});
  node["landuse"="industrial"](around:${radius},${lat},${lon});
  way["industrial"](around:${radius},${lat},${lon});
  way["landuse"="industrial"](around:${radius},${lat},${lon});
);
out body;
  `.trim();

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
    const data = await res.json();
    const features = (data.elements ?? []).map(el => ({
      id: el.id,
      type: el.type,
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
      tags: el.tags ?? {},
    }));
    return writeOutput(features, {
      lat, lon, radius, feature: featureFilter,
      coordLabel: `${lat.toFixed(1)}N_${lon.toFixed(1)}E`,
      today, outputFile, source: 'overpass-api-fallback'
    });
  } catch (err) {
    console.error(`❌ Overpass fallback failed: ${err.message}`);
    process.exit(1);
  }
}

function writeOutput(features, { lat, lon, radius, feature, coordLabel, today, outputFile, source }) {
  const output = {
    coordinates: { lat, lon },
    radius_m: radius,
    feature_filter: feature,
    scan_date: today,
    tool: 'osm-search',
    source: source ?? 'bellingcat/osm-search',
    mode: 'passive',
    total_features: features.length,
    features,
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'osm-search', target: coordLabel, targetType: 'coordinates', resultCount: features.length, alertCount: 0, outputFile, today, tags: ['geospatial', 'osm', 'infrastructure'] });

  console.log(`\n✅ OSM search complete:`);
  console.log(`   Features found: ${features.length}`);
  console.log(`   Saved: ${outputFile}`);

  return output;
}
