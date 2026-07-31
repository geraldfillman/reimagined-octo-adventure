/**
 * webhook-listen.mjs — Local webhook receiver for Sitdeck (and other) alerts.
 *
 * Runs a small HTTP server. POSTed JSON payloads are written as alert notes
 * into 05_Data_Pulls/Alerts/ with source + timestamp frontmatter, ready for
 * downstream routing.
 *
 * Security: if WEBHOOK_SECRET is set in .env, requests must send it in the
 * `x-webhook-token` header. Binds to 127.0.0.1 only.
 *
 * Usage:
 *   node run.mjs pull webhook-listen               # listen on 127.0.0.1:8787
 *   node run.mjs pull webhook-listen --port 9000
 *
 * Point Sitdeck's webhook URL at http://<tunnel-or-lan>:8787/sitdeck
 * (path segment becomes the alert source label).
 */

import { createServer } from 'http';
import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, writeNote, today } from '../lib/markdown.mjs';

const MAX_BODY_BYTES = 256 * 1024;
const DEFAULT_PORT = 8787;

export async function pull(flags = {}) {
  const port = parseInt(flags.port) || DEFAULT_PORT;
  const secret = process.env.WEBHOOK_SECRET?.trim() || null;
  let received = 0;

  const server = createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'POST only' }));
    }
    if (secret && req.headers['x-webhook-token'] !== secret) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'bad token' }));
    }

    let body = '';
    let overflow = false;
    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) { overflow = true; req.destroy(); }
    });
    req.on('end', () => {
      if (overflow) return;
      try {
        const notePath = handleAlert({ path: req.url, body });
        received++;
        console.log(`⚡ [${new Date().toISOString()}] alert #${received} → ${notePath}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error(`❌ alert rejected: ${err.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`📡 Webhook listener on http://127.0.0.1:${port}/<source>`);
    console.log(`   Auth: ${secret ? 'x-webhook-token required' : 'OPEN (set WEBHOOK_SECRET in .env to lock down)'}`);
    console.log(`   Alerts → 05_Data_Pulls/Alerts/  |  Ctrl+C to stop`);
  });

  // Keep the process alive until interrupted.
  await new Promise(resolve => {
    process.on('SIGINT', () => { server.close(); resolve(); });
    process.on('SIGTERM', () => { server.close(); resolve(); });
  });

  console.log(`\n📡 Stopped. ${received} alert(s) received this session.`);
  return { filePath: null, received, signal_status: 'clear' };
}

function handleAlert({ path, body }) {
  const source = (path || '/').split('/').filter(Boolean)[0]?.toLowerCase() || 'unknown';
  if (!/^[a-z0-9_-]{1,40}$/.test(source)) throw new Error('invalid source path segment');

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error('body is not valid JSON');
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const title = firstString(payload, ['title', 'name', 'alert', 'event', 'subject']) || 'Alert';
  const slug = title.replace(/[^\w-]+/g, '_').slice(0, 60);

  const note = buildNote({
    frontmatter: {
      title: `${source} alert: ${title}`,
      source: `${source} webhook`,
      date_pulled: today(),
      received_at: new Date().toISOString(),
      domain: 'alerts',
      data_type: 'webhook_alert',
      alert_source: source,
      signal_status: 'watch',
      tags: ['alert', 'webhook', source],
    },
    sections: [
      { heading: title, content: summarizePayload(payload) },
      { heading: 'Raw Payload', content: '```json\n' + JSON.stringify(payload, null, 2).slice(0, 8000) + '\n```' },
    ],
  });

  const notePath = join(getPullsDir(), 'Alerts', `${today()}_${stamp}_${source}_${slug}.md`);
  writeNote(notePath, note);
  return notePath;
}

function firstString(obj, keys) {
  for (const k of keys) {
    if (typeof obj?.[k] === 'string' && obj[k].trim()) return obj[k].trim();
  }
  return null;
}

function summarizePayload(payload) {
  const flat = Object.entries(payload)
    .filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v))
    .slice(0, 15);
  if (flat.length === 0) return 'See raw payload below.';
  return flat.map(([k, v]) => `- **${k}**: ${String(v).slice(0, 300)}`).join('\n');
}
