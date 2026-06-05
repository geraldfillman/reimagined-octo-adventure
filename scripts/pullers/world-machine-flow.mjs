/**
 * world-machine-flow.mjs - approved bridge packet writer for World_Machine.
 *
 * This puller never writes canonical World_Machine notes. It builds or reads a
 * bridge manifest, then writes only approved packets into World_Machine/_Inbox.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
  getEngineCacheDir,
  getEngineRoot,
  getWorldMachineRoot,
} from '../lib/config.mjs';
import {
  buildWorldMachineBridgePackets,
  mergePromotionStatuses,
  packetManifestPayload,
  writeApprovedWorldMachineCandidates,
} from '../lib/world-machine-bridge.mjs';
import { today } from '../lib/markdown.mjs';

export async function pull(flags = {}) {
  const date = String(flags.date || today()).slice(0, 10);
  const engineRoot = getEngineRoot();
  const worldRoot = flags['world-root'] ? resolve(String(flags['world-root'])) : getWorldMachineRoot();
  const pilotTicker = String(flags.ticker || flags.symbol || flags['pilot-ticker'] || 'GEV').toUpperCase();
  const manifestPath = resolveManifestPath(flags, date);
  const dryRun = Boolean(flags['dry-run']);
  const approvedOnly = Boolean(flags['approved-only'] || flags.approvedOnly);

  const generatedPackets = await buildWorldMachineBridgePackets({
    engineRoot,
    date,
    pilotTicker,
    viewpointLimit: flags.limit,
  });
  const previousManifest = readManifest(manifestPath);
  const packets = mergePromotionStatuses(generatedPackets, previousManifest?.packets || []);
  const approvedPackets = packets.filter(packet => String(packet.promotion_status || '').toLowerCase() === 'approved');

  if (dryRun) {
    printSummary({ date, manifestPath, worldRoot, packets, approvedPackets, approvedOnly, dryRun });
    return {
      source: 'world-machine-flow',
      dryRun: true,
      manifestPath,
      packets: packets.length,
      approved: approvedPackets.length,
      written: [],
    };
  }

  writeManifest(manifestPath, packetManifestPayload(packets, { generatedOn: date }));

  const writeResult = approvedOnly
    ? writeApprovedWorldMachineCandidates({ worldRoot, packets, date })
    : { written: [], approved: approvedPackets.length, dryRun: false };

  printSummary({ date, manifestPath, worldRoot, packets, approvedPackets, approvedOnly, dryRun });
  for (const filePath of writeResult.written) {
    console.log(`Wrote World_Machine inbox candidate: ${filePath}`);
  }

  return {
    source: 'world-machine-flow',
    dryRun: false,
    manifestPath,
    packets: packets.length,
    approved: approvedPackets.length,
    written: writeResult.written,
  };
}

function resolveManifestPath(flags, date) {
  if (flags['packet-file']) return resolve(String(flags['packet-file']));
  if (flags.manifest) return resolve(String(flags.manifest));
  return join(getEngineCacheDir('world-machine-bridge'), `${date}.json`);
}

function readManifest(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (error) {
    throw new Error(`Could not read world-machine bridge manifest ${filePath}: ${error.message}`);
  }
}

function writeManifest(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`Wrote World_Machine bridge manifest: ${filePath}`);
}

function printSummary({ date, manifestPath, worldRoot, packets, approvedPackets, approvedOnly, dryRun }) {
  const counts = countBy(packets, packet => packet.type);
  console.log(`World Machine flow (${date})${dryRun ? ' dry-run' : ''}`);
  console.log(`  Manifest: ${manifestPath}`);
  console.log(`  World root: ${worldRoot}`);
  console.log(`  Packets: ${packets.length}`);
  for (const [type, count] of Object.entries(counts)) {
    console.log(`    ${type}: ${count}`);
  }
  console.log(`  Approved packets: ${approvedPackets.length}`);
  if (approvedOnly) {
    const action = dryRun ? 'would write' : 'write';
    console.log(`  Approved-only mode: ${action} ${approvedPackets.length} World_Machine inbox candidate(s).`);
  } else {
    console.log('  Manifest-only mode: no World_Machine inbox candidates are written.');
  }
}

function countBy(items, selector) {
  const counts = {};
  for (const item of items) {
    const key = selector(item) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
