/**
 * kb-dispatch.mjs — Front-door dispatcher for the KB subsystem
 *
 * Routes high-level KB commands to the right script. This is an alias layer —
 * it does not add new behavior, it just makes the front door explicit.
 *
 * Usage:
 *   node run.mjs kb dispatch --action ingest --file ./article.md
 *   node run.mjs kb dispatch --action librarian --fix
 *   node run.mjs kb dispatch --action query --query "What is the energy regime?"
 *
 * Flags:
 *   --action <name>   One of: ingest|normalize|classify|compile|query|librarian|health|transcribe|suggest
 *   All other flags pass through to the target script.
 *
 * Supported actions:
 *   ingest      Register a new source into the KB pipeline
 *   normalize   Normalize inbox files into manifests
 *   classify    Apply extraction rules to classified manifests
 *   compile     Extract a classified source into wiki pages
 *   query       Answer a question using the wiki
 *   librarian   Run wiki maintenance and lint pass
 *   health      Run broader integrity and scale checks
 *   transcribe  Extract structured content from a transcript
 *   suggest     Surface structural gaps and suggest missing pages
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ACTION_MAP = {
  ingest:     '../kb/kb-ingest.mjs',
  normalize:  '../kb/kb-normalize.mjs',
  classify:   '../kb/kb-classify.mjs',
  compile:    '../kb/kb-compile.mjs',
  query:      '../kb/kb-query.mjs',
  librarian:  '../kb/kb-librarian.mjs',
  health:     '../kb/kb-health.mjs',
  transcribe: '../kb/kb-transcribe.mjs',
  suggest:    '../kb/kb-suggest.mjs',
};

const VALID_ACTIONS = Object.keys(ACTION_MAP);

export async function run(flags = {}) {
  const action = flags.action;

  if (!action) {
    console.log('\n📋 KB Dispatcher — Available actions:\n');
    for (const a of VALID_ACTIONS) {
      console.log(`   ${a.padEnd(12)} node run.mjs kb ${a}`);
    }
    console.log('\nExample: node run.mjs kb dispatch --action librarian --fix');
    return;
  }

  if (!VALID_ACTIONS.includes(action)) {
    console.error(`Error: Unknown action "${action}".`);
    console.error(`Valid actions: ${VALID_ACTIONS.join(', ')}`);
    process.exit(1);
  }

  const modulePath = join(__dirname, ACTION_MAP[action]);
  console.log(`\n→ Dispatching: kb ${action}`);

  const m = await import(modulePath);
  return m.run(flags);
}
